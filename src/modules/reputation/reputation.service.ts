import { prisma } from '../../config/db';
import { logger } from '../../utils/logger';
import { SubmitFeedbackInput } from './reputation.schema';
import { Decimal } from '@prisma/client/runtime/library';

export class ReputationService {
  /**
   * Retrieves or initializes a reputation profile for an agent.
   */
  async getReputation(agentId: string) {
    logger.info({ agentId }, 'Fetching reputation profile');

    let profile = await prisma.reputationProfile.findUnique({
      where: { agentId }
    });

    if (!profile) {
      profile = await prisma.reputationProfile.create({
        data: {
          agentId,
          trustScore: new Decimal(100.0),
          totalPayments: 0,
          successfulPayments: 0,
          failedPayments: 0,
          communityFeedback: JSON.parse(JSON.stringify([]))
        }
      });
    }

    return profile;
  }

  /**
   * Submits ranked feedback and recalculates the trust score.
   */
  async submitFeedback(input: SubmitFeedbackInput) {
    logger.info({ input }, 'Submitting feedback and recalculating reputation');

    let profile = await this.getReputation(input.agentId);

    const feedbackList = Array.isArray(profile.communityFeedback) 
      ? [...(profile.communityFeedback as any[])] 
      : [];

    feedbackList.push({
      rating: input.rating,
      comment: input.comment || null,
      timestamp: new Date().toISOString()
    });

    // Calculate new average community rating (mapped to a 100-point scale)
    const totalRatingSum = feedbackList.reduce((sum, item) => sum + item.rating, 0);
    const avgCommunityScore = (totalRatingSum / feedbackList.length) * 20; // converts 1-5 scale to 20-100 scale

    // Adjust trustScore dynamically: 70% based on tx success history, 30% on community feedback
    const txTotal = profile.totalPayments;
    const txSuccessRatio = txTotal > 0 ? (profile.successfulPayments / txTotal) * 100 : 100;

    const calculatedTrustScore = txTotal > 0
      ? (txSuccessRatio * 0.70) + (avgCommunityScore * 0.30)
      : avgCommunityScore; // Default to feedback if no transaction history exists yet

    const updatedProfile = await prisma.reputationProfile.update({
      where: { agentId: input.agentId },
      data: {
        trustScore: new Decimal(Number(calculatedTrustScore.toFixed(2))),
        communityFeedback: JSON.parse(JSON.stringify(feedbackList))
      }
    });

    return updatedProfile;
  }

  /**
   * Scans actual PaymentExecution logs on the database to update tx-level trust metrics.
   */
  async syncTransactionReputation(agentId: string) {
    logger.info({ agentId }, 'Syncing transaction success metrics to reputation profile');

    const agent = await prisma.agentNode.findUnique({
      where: { id: agentId },
      include: {
        listings: {
          include: {
            payments: true
          }
        }
      }
    });

    if (!agent) {
      throw new Error('Agent node not found');
    }

    // Accumulate all payments across this agent's marketplace listings
    const allPayments = agent.listings.flatMap(l => l.payments);
    const totalPayments = allPayments.length;
    const successfulPayments = allPayments.filter(p => p.status === 'CONFIRMED' || p.status === 'ESCROW_RELEASED').length;
    const failedPayments = allPayments.filter(p => p.status === 'FAILED').length;

    const txSuccessRatio = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 100;

    const profile = await this.getReputation(agentId);
    
    // Recalculate trust score
    const feedbackList = Array.isArray(profile.communityFeedback) ? (profile.communityFeedback as any[]) : [];
    let calculatedTrustScore = txSuccessRatio;

    if (feedbackList.length > 0) {
      const totalRatingSum = feedbackList.reduce((sum, item) => sum + item.rating, 0);
      const avgCommunityScore = (totalRatingSum / feedbackList.length) * 20;
      calculatedTrustScore = (txSuccessRatio * 0.70) + (avgCommunityScore * 0.30);
    }

    const updatedProfile = await prisma.reputationProfile.update({
      where: { agentId },
      data: {
        totalPayments,
        successfulPayments,
        failedPayments,
        trustScore: new Decimal(Number(calculatedTrustScore.toFixed(2)))
      }
    });

    return updatedProfile;
  }
}
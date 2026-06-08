import { prisma } from '../../config/db';
import { pharosPublicClient, resend } from '../../config/providers';
import { logger } from '../../utils/logger';
import { sendTelegramMessage } from '../../utils/telegram';
import { CreatePaymentIntentInput, BroadcastPaymentInput } from './payment.schema';
import { Decimal } from '@prisma/client/runtime/library';
import { PaymentType } from '@prisma/client';

export class PaymentExecutionService {
  /**
   * Generates a payment intent with split-routing or subscription rules
   */
  async createPaymentIntent(input: CreatePaymentIntentInput) {
    logger.info({ input }, 'creating advanced payment execution intent');

    const amountDecimal = new Decimal(input.amount);
    const expiresAt = input.type === 'ESCROW' 
      ? new Date(Date.now() + (input.expiresInSeconds ?? 86400) * 1000)
      : null;

    // Validate split calculations sum exactly to 100%
    if (input.type === 'SPLIT' && input.splitRecipients) {
      const sum = input.splitRecipients.reduce((acc, curr) => acc + curr.percentage, 0);
      if (sum !== 100) {
        throw new Error('Split recipient allocations must sum to exactly 100%');
      }
    }

    const payment = await prisma.paymentExecution.create({
      data: {
        listingId: input.listingId || null,
        senderAddress: input.senderAddress.toLowerCase(),
        recipientAddress: input.recipientAddress.toLowerCase(),
        amount: amountDecimal,
        tokenAddress: input.tokenAddress ? input.tokenAddress.toLowerCase() : null,
        status: 'PENDING_SIGNATURE',
        type: input.type as PaymentType,
        splitRecipients: input.splitRecipients ? JSON.parse(JSON.stringify(input.splitRecipients)) : null,
        subscriptionInterval: input.subscriptionInterval || null,
        escrowReleaseKey: input.escrowReleaseKey || null,
        expiresAt: expiresAt
      }
    });

    await prisma.auditLog.create({
      data: {
        paymentId: payment.id,
        action: 'INTENT_CREATED',
        payload: { input }
      }
    });

    // Telegram Dispatch
    let splitSummary = '';
    if (input.type === 'SPLIT' && input.splitRecipients) {
      splitSummary = '\n<b>Split Recipients:</b>\n' + input.splitRecipients.map(r => 
        ` - <code>${r.address.slice(0,6)}...</code>: ${r.percentage}%`
      ).join('\n');
    }

    await sendTelegramMessage(
      `💸 <b>Advanced Payment Intent Generated</b>\n\n` +
      `<b>ID:</b> <code>${payment.id}</code>\n` +
      `<b>Type:</b> <code>${payment.type}</code>\n` +
      `<b>Amount:</b> <code>${payment.amount} PROS</code>\n` +
      `<b>Recipient:</b> <code>${payment.recipientAddress.slice(0, 6)}...</code>` +
      splitSummary +
      `\n<b>Status:</b> <code>PENDING_SIGNATURE</code>`
    );

    return payment;
  }

  /**
   * Confirms payment execution, processes subscription recurring schedules, and validates splits on-chain
   */
  async confirmPayment(input: BroadcastPaymentInput) {
    logger.info({ input }, 'confirming transaction execution on Pharos Testnet');

    const payment = await prisma.paymentExecution.findUnique({
      where: { id: input.paymentId }
    });

    if (!payment) {
      throw new Error('Payment execution record not found');
    }

    await prisma.paymentExecution.update({
      where: { id: payment.id },
      data: {
        txHash: input.txHash,
        status: 'BROADCASTED'
      }
    });

    try {
      const receipt = await pharosPublicClient.waitForTransactionReceipt({
        hash: input.txHash as `0x${string}`,
        timeout: 60_000
      });

      if (receipt.status === 'success') {
        let finalStatus = 'CONFIRMED';
        let subscriptionNextBilling: Date | null = null;

        if (payment.type === 'ESCROW') {
          finalStatus = 'ESCROW_LOCKED';
        } else if (payment.type === 'SUBSCRIPTION' && payment.subscriptionInterval) {
          finalStatus = 'CONFIRMED';
          const intervalDays = payment.subscriptionInterval === 'WEEKLY' ? 7 : 30;
          subscriptionNextBilling = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
        }

        const updatedPayment = await prisma.paymentExecution.update({
          where: { id: payment.id },
          data: { 
            status: finalStatus as any,
            subscriptionNextBilling
          }
        });

        await prisma.auditLog.create({
          data: {
            paymentId: payment.id,
            action: 'TRANSACTION_SUCCESS',
            payload: { blockNumber: receipt.blockNumber.toString() }
          }
        });

        // Trigger telegram announcement
        await sendTelegramMessage(
          `✅ <b>Pharos Transaction Confirmed</b>\n\n` +
          `<b>ID:</b> <code>${payment.id}</code>\n` +
          `<b>Type:</b> <code>${payment.type}</code>\n` +
          `<b>Amount:</b> <code>${payment.amount} PROS</code>\n` +
          `<b>Tx Hash:</b> <a href="https://testnet.dplabs-internal.com/tx/${input.txHash}">${input.txHash.slice(0, 10)}...</a>\n` +
          `<b>Next Subscription Bill:</b> <code>${subscriptionNextBilling ? subscriptionNextBilling.toISOString().split('T')[0] : 'N/A'}</code>`
        );

        return updatedPayment;
      } else {
        throw new Error('On-chain transaction execution reverted');
      }
    } catch (error: any) {
      logger.error({ error, paymentId: payment.id }, 'Payment execution confirmation failed');
      
      const failedPayment = await prisma.paymentExecution.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      await prisma.auditLog.create({
        data: {
          paymentId: payment.id,
          action: 'TRANSACTION_FAILED',
          payload: { error: error.message || 'Unknown RPC execution failure' }
        }
      });

      await sendTelegramMessage(
        `❌ <b>Payment Execution Failed</b>\n\n` +
        `<b>ID:</b> <code>${payment.id}</code>\n` +
        `<b>Error:</b> <code>${error.message || 'Tx Reverted'}</code>`
      );

      return failedPayment;
    }
  }

  async getPaymentStatus(paymentId: string) {
    return prisma.paymentExecution.findUnique({
      where: { id: paymentId },
      include: {
        auditLogs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });
  }
}
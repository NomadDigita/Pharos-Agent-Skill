import { createPublicClient, http, defineChain, createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { Resend } from 'resend';
import { env } from './env';
import { logger } from '../utils/logger';

// 1. Define Pharos Atlantic Chain configurations
export const pharosChain = defineChain({
  id: 688688,
  name: 'Pharos Atlantic Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Pharos',
    symbol: 'PROS',
  },
  rpcUrls: {
    default: { http: [env.PHAROS_RPC_URL] },
  },
});

// 2. Initialize Pharos Public Client (Read operations)
export const pharosPublicClient = createPublicClient({
  chain: pharosChain,
  transport: http(),
});

// 3. Initialize Resend notifications (if key is set)
export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

if (resend) {
  logger.info('📧 Resend notification client initialized.');
} else {
  logger.warn('📧 Resend key missing. Email notifications disabled.');
}
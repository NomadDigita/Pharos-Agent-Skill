import { verifyMessage } from 'viem';

/**
 * Verifies that a message was signed by a specific Ethereum address.
 */
export async function verifySignature(params: {
  address: string;
  message: string;
  signature: string;
}): Promise<boolean> {
  try {
    const isValid = await verifyMessage({
      address: params.address as `0x${string}`,
      message: params.message,
      signature: params.signature as `0x${string}`,
    });
    return isValid;
  } catch (error) {
    return false;
  }
}
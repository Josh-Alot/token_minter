'use client';

import { formatAddress } from '@/lib/utils';

interface MintSuccessModalProps {
  amount: string;
  recipient: string;
  txHash?: string;
  onClose: () => void;
}

export function MintSuccessModal({
  amount,
  recipient,
  txHash,
  onClose,
}: MintSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-zinc-300 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Mint Successful! 🎉
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Amount Minted
            </p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {amount} tokens
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Recipient Address
            </p>
            <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100 break-all">
              {formatAddress(recipient)}
            </p>
          </div>

          {txHash && (
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Transaction Hash
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {formatAddress(txHash)}
              </a>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


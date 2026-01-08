'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { BURNOUT_TOKEN_ABI, BURNOUT_TOKEN_ADDRESS } from '@/lib/contracts';
import { formatAddress } from '@/lib/utils';
import { MintSuccessModal } from './MintSuccessModal';

export function MintERC20Form() {
  const { address, isConnected } = useAccount();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [mintData, setMintData] = useState<{
    amount: string;
    recipient: string;
    txHash?: string;
  } | null>(null);

  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Quando a transação for confirmada, mostrar modal
  useEffect(() => {
    if (isConfirmed && hash && !showModal) {
      setShowModal(true);
      setMintData({
        amount,
        recipient: recipientAddress,
        txHash: hash,
      });
    }
  }, [isConfirmed, hash, showModal, amount, recipientAddress]);

  const handleAutoFill = () => {
    if (address) {
      setRecipientAddress(address);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!BURNOUT_TOKEN_ADDRESS) {
      alert('Token contract address not configured. Please set NEXT_PUBLIC_TOKEN_ADDRESS in your .env file.');
      return;
    }

    if (!recipientAddress || !amount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const amountWei = parseEther(amount);
      writeContract({
        address: BURNOUT_TOKEN_ADDRESS,
        abi: BURNOUT_TOKEN_ABI,
        functionName: 'mint',
        args: [recipientAddress as `0x${string}`, amountWei],
      });
    } catch (err) {
      console.error('Error minting tokens:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-300 dark:border-zinc-700">
        <p className="text-center text-zinc-600 dark:text-zinc-400">
          Please connect your wallet to mint tokens
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleMint} className="space-y-6 p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Mint ERC-20 Tokens
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Mint tokens to any address on the network
          </p>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.0001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            required
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Recipient Address
          </label>
          <div className="flex gap-2">
            <input
              id="recipient"
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              required
              className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors whitespace-nowrap"
            >
              Use My Address
            </button>
          </div>
          {address && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              Your address: {formatAddress(address)}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              Error: {error.message}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isConfirming || !amount || !recipientAddress}
          className="w-full px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending
            ? 'Confirm in wallet...'
            : isConfirming
            ? 'Minting...'
            : 'Mint Tokens'}
        </button>
      </form>

      {showModal && mintData && (
        <MintSuccessModal
          amount={mintData.amount}
          recipient={mintData.recipient}
          txHash={mintData.txHash}
          onClose={() => {
            setShowModal(false);
            setAmount('');
            setRecipientAddress('');
          }}
        />
      )}
    </>
  );
}


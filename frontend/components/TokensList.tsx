'use client';

import React from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { BURNOUT_ERC20_FACTORY_ABI, BURNOUT_ERC20_FACTORY_ADDRESS } from '@/lib/contracts';
import { formatAddress } from '@/lib/utils';

const MAX_TOKENS_TO_SCAN = 100;

export const TokensList: React.FC = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const { data: tokens, isLoading } = useQuery({
    queryKey: ['tokens', address],
    enabled: Boolean(address && publicClient && BURNOUT_ERC20_FACTORY_ADDRESS),
    queryFn: async () => {
      if (!address || !publicClient || !BURNOUT_ERC20_FACTORY_ADDRESS) return [] as `0x${string}`[];

      const result: `0x${string}`[] = [];
      for (let i = 0; i < MAX_TOKENS_TO_SCAN; i++) {
        try {
          const tokenAddress = (await publicClient.readContract({
            address: BURNOUT_ERC20_FACTORY_ADDRESS,
            abi: BURNOUT_ERC20_FACTORY_ABI,
            functionName: 'tokensByUser',
            args: [address, BigInt(i)],
          })) as `0x${string}`;

          result.push(tokenAddress);
        } catch {
          // Out of bounds (or other revert) => stop scanning
          break;
        }
      }

      return result;
    },
  });

  if (!address) {
    return (
      <div className="glass rounded-3xl p-8 sm:p-10">
        <p className="text-zinc-400 text-center">Please connect your wallet to view your tokens</p>
      </div>
    );
  }

  if (!BURNOUT_ERC20_FACTORY_ADDRESS) {
    return (
      <div className="glass rounded-3xl p-8 sm:p-10">
        <div className="p-4 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-sm">
          <p className="font-bold mb-2">ERC20 Factory contract not configured</p>
          <p>Please set NEXT_PUBLIC_ERC20_FACTORY_ADDRESS in your .env file</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-8 sm:p-10">
        <div className="flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-indigo-400/70 border-t-transparent rounded-full animate-spin"></span>
        </div>
      </div>
    );
  }

  const tokensArray = tokens ?? [];

  return (
    <div className="glass rounded-3xl p-8 sm:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-lg">
          🧾
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Tokens</h2>
      </div>

      {tokensArray.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400 text-lg mb-2">No tokens found</p>
          <p className="text-zinc-500 text-sm">Create your first ERC20 token to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tokensArray.map((tokenAddress, index) => (
            <div
              key={`${tokenAddress}-${index}`}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-zinc-400 mb-1">Token #{index + 1}</p>
                  <p className="text-white font-mono text-sm break-all">{formatAddress(tokenAddress)}</p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(tokenAddress)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-sm flex-shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


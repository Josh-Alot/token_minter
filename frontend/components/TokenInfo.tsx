'use client';

import { useAccount, useReadContract } from 'wagmi';
import { BURNOUT_TOKEN_ABI, BURNOUT_TOKEN_ADDRESS } from '@/lib/contracts';
import { formatEther } from '@/lib/utils';
import { formatAddress } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function TokenInfo() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  // Evitar erro de hidratação - só renderizar estado correto após montagem no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: name } = useReadContract({
    address: BURNOUT_TOKEN_ADDRESS,
    abi: BURNOUT_TOKEN_ABI,
    functionName: 'name',
    query: {
      enabled: !!BURNOUT_TOKEN_ADDRESS,
    },
  });

  const { data: symbol } = useReadContract({
    address: BURNOUT_TOKEN_ADDRESS,
    abi: BURNOUT_TOKEN_ABI,
    functionName: 'symbol',
    query: {
      enabled: !!BURNOUT_TOKEN_ADDRESS,
    },
  });

  const { data: totalSupply } = useReadContract({
    address: BURNOUT_TOKEN_ADDRESS,
    abi: BURNOUT_TOKEN_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!BURNOUT_TOKEN_ADDRESS,
    },
  });

  const { data: decimals } = useReadContract({
    address: BURNOUT_TOKEN_ADDRESS,
    abi: BURNOUT_TOKEN_ABI,
    functionName: 'decimals',
    query: {
      enabled: !!BURNOUT_TOKEN_ADDRESS,
    },
  });

  const { data: balance } = useReadContract({
    address: BURNOUT_TOKEN_ADDRESS,
    abi: BURNOUT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!BURNOUT_TOKEN_ADDRESS && isConnected && !!address,
    },
  });

  if (!BURNOUT_TOKEN_ADDRESS) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/20 shadow-xl">
        <p className="text-center text-zinc-400">
          Token contract address not configured
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
          ℹ️
        </div>
        <h2 className="text-2xl font-bold text-white">
          Token Information
        </h2>
      </div>
      
      <div className="space-y-6">
        {/* Contract Address */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Contract Address
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono text-white break-all">
              {formatAddress(BURNOUT_TOKEN_ADDRESS)}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(BURNOUT_TOKEN_ADDRESS)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Copy address"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Name and Symbol */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Name
            </p>
            <p className="text-xl font-bold text-white">
              {name || (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-pulse">Loading...</span>
                </span>
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Symbol
            </p>
            <p className="text-xl font-bold text-white">
              {symbol || (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-pulse">Loading...</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Total Supply */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-blue-500/30">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Total Supply
          </p>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {totalSupply ? (
              <>
                {formatEther(totalSupply)} <span className="text-white text-lg">{symbol || ''}</span>
              </>
            ) : (
              <span className="text-white animate-pulse">Loading...</span>
            )}
          </p>
        </div>

        {/* User Balance */}
        {mounted && isConnected && address && (
          <div className="p-5 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 glow-green">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Your Balance
            </p>
            <p className="text-3xl font-bold text-green-400">
              {balance ? (
                <>
                  {formatEther(balance)} <span className="text-white text-xl">{symbol || ''}</span>
                </>
              ) : (
                <span className="animate-pulse">Loading...</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

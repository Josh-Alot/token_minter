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
    <div className="glass rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/15">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          ℹ️
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Token Information
        </h2>
      </div>
      
      <div className="space-y-6">
        {/* Contract Address */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Contract Address
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono text-white break-all">
              {formatAddress(BURNOUT_TOKEN_ADDRESS)}
            </p>
            <button
              onClick={() => {
                if (BURNOUT_TOKEN_ADDRESS) {
                  navigator.clipboard.writeText(BURNOUT_TOKEN_ADDRESS);
                }
              }}
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
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Name
            </p>
            <p className="text-2xl font-black text-white">
              {name || (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-pulse text-zinc-500">Loading...</span>
                </span>
              )}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Symbol
            </p>
            <p className="text-2xl font-black text-white">
              {symbol || (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-pulse text-zinc-500">Loading...</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Total Supply */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
            Total Supply
          </p>
          <p className="text-3xl font-black text-white">
            {totalSupply ? (
              <>
                {formatEther(totalSupply)} <span className="text-zinc-300 text-xl">{symbol || ''}</span>
              </>
            ) : (
              <span className="text-white animate-pulse">Loading...</span>
            )}
          </p>
        </div>

        {/* User Balance */}
        {mounted && isConnected && address && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 transition-all">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Your Balance
            </p>
            <p className="text-4xl font-black text-emerald-300">
              {balance ? (
                <>
                  {formatEther(balance)} <span className="text-zinc-200 text-2xl">{symbol || ''}</span>
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

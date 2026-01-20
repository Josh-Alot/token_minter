'use client';

import React, { useState } from 'react';
import { useConnection, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'viem';
import { BURNOUT_ERC20_FACTORY_ABI, BURNOUT_ERC20_FACTORY_ADDRESS } from '@/lib/contracts';

export const ERC20Factory: React.FC = () => {
  const { address } = useConnection();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState<2 | 4 | 6 | 18>(18);
  const [initialSupply, setInitialSupply] = useState('');

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Debug: Log errors
  React.useEffect(() => {
    if (error) {
      console.error('WriteContract error:', error);
    }
  }, [error]);

  // Debug: Log hash when transaction is sent
  React.useEffect(() => {
    if (hash) {
      console.log('Transaction hash:', hash);
    }
  }, [hash]);

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous errors
    reset();

    if (!address) {
      console.error('Wallet not connected');
      return;
    }

    if (!BURNOUT_ERC20_FACTORY_ADDRESS) {
      console.error('ERC20 Factory contract address not configured');
      return;
    }

    if (!name || !symbol || !initialSupply) {
      console.error('Name, symbol, decimals and initial supply are required');
      return;
    }

    let initialSupplyWei: bigint;
    try {
      initialSupplyWei = parseUnits(initialSupply, decimals);
    } catch (err) {
      console.error('Invalid initial supply:', err);
      return;
    }

    console.log('Creating token:', {
      name,
      symbol,
      decimals,
      initialSupply,
      address: BURNOUT_ERC20_FACTORY_ADDRESS,
    });

    try {
      writeContract({
        address: BURNOUT_ERC20_FACTORY_ADDRESS,
        abi: BURNOUT_ERC20_FACTORY_ABI,
        functionName: 'createToken',
        args: [name, symbol, decimals, initialSupplyWei],
      });
    } catch (err) {
      console.error('Error calling writeContract:', err);
    }
  };

  React.useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['tokens', address] });
      setName('');
      setSymbol('');
      setDecimals(18);
      setInitialSupply('');
    }
  }, [isConfirmed, queryClient, address]);

  if (!address) {
    return (
      <div className="glass rounded-3xl p-8 sm:p-10">
        <p className="text-zinc-400 text-center">Please connect your wallet to create ERC20 tokens</p>
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

  return (
    <div className="glass rounded-3xl p-8 sm:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-lg">
          🏭
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create ERC20 Token</h2>
      </div>

      <form onSubmit={handleCreateToken} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-zinc-300 mb-2">
            Token Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all"
            placeholder="My Token"
          />
        </div>

        <div>
          <label htmlFor="symbol" className="block text-sm font-bold text-zinc-300 mb-2">
            Token Symbol
          </label>
          <input
            id="symbol"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all"
            placeholder="MTK"
          />
        </div>

        <div>
          <label htmlFor="decimals" className="block text-sm font-bold text-zinc-300 mb-2">
            Decimals
          </label>
          <div className="relative">
            <select
              id="decimals"
              value={decimals}
              onChange={(e) => setDecimals(Number(e.target.value) as 2 | 4 | 6 | 18)}
              className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all appearance-none cursor-pointer hover:bg-white/10"
            >
              <option value={2} className="bg-zinc-950 text-white">
                2
              </option>
              <option value={4} className="bg-zinc-950 text-white">
                4
              </option>
              <option value={6} className="bg-zinc-950 text-white">
                6
              </option>
              <option value={18} className="bg-zinc-950 text-white">
                18
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-400">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7 10l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Allowed by contract: 2, 4, 6, or 18.
          </p>
        </div>

        <div>
          <label htmlFor="initialSupply" className="block text-sm font-bold text-zinc-300 mb-2">
            Initial Supply
          </label>
          <input
            id="initialSupply"
            type="number"
            min="0"
            step="any"
            value={initialSupply}
            onChange={(e) => setInitialSupply(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all"
            placeholder="1000"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Supply is entered in token units (uses the decimals selected above).
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
            <p className="font-bold mb-1">Error creating token</p>
            <p>{error.message || error.toString() || 'Failed to create token'}</p>
            {Boolean(error.cause) && <p className="mt-2 text-xs opacity-75">{String(error.cause)}</p>}
          </div>
        )}

        {isConfirmed && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-sm">
            Token created successfully.
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-lg border border-indigo-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {isPending ? 'Creating...' : 'Confirming...'}
            </span>
          ) : (
            'Create Token'
          )}
        </button>
      </form>
    </div>
  );
};


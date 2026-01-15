'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { BURNOUT_NFT_FACTORY_ABI, BURNOUT_NFT_FACTORY_ADDRESS } from '@/lib/contracts';

export const NFTFactory: React.FC = () => {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [collectionType, setCollectionType] = useState<'standard' | 'dynamic'>('standard');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [baseTokenURI, setBaseTokenURI] = useState('');

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

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous errors
    reset();
    
    if (!address) {
      console.error('Wallet not connected');
      return;
    }

    if (!BURNOUT_NFT_FACTORY_ADDRESS) {
      console.error('NFT Factory contract address not configured');
      return;
    }

    if (!name || !symbol) {
      console.error('Name and symbol are required');
      return;
    }

    if (collectionType === 'standard' && !baseTokenURI) {
      console.error('Base Token URI is required for standard collections');
      return;
    }

    console.log('Creating collection:', {
      type: collectionType,
      name,
      symbol,
      baseTokenURI: collectionType === 'standard' ? baseTokenURI : 'N/A',
      address: BURNOUT_NFT_FACTORY_ADDRESS,
    });

    try {
      if (collectionType === 'standard') {
        writeContract({
          address: BURNOUT_NFT_FACTORY_ADDRESS,
          abi: BURNOUT_NFT_FACTORY_ABI,
          functionName: 'createStandardCollection',
          args: [name, symbol, baseTokenURI],
        });
      } else {
        writeContract({
          address: BURNOUT_NFT_FACTORY_ADDRESS,
          abi: BURNOUT_NFT_FACTORY_ABI,
          functionName: 'createDynamicCollection',
          args: [name, symbol],
        });
      }
    } catch (err) {
      console.error('Error calling writeContract:', err);
    }
  };

  React.useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['collections', address] });
      setName('');
      setSymbol('');
      setBaseTokenURI('');
    }
  }, [isConfirmed, queryClient, address]);

  if (!address) {
    return (
      <div className="glass rounded-3xl p-8 sm:p-10">
        <p className="text-zinc-400 text-center">Please connect your wallet to create NFT collections</p>
      </div>
    );
  }

  if (!BURNOUT_NFT_FACTORY_ADDRESS) {
    return (
      <div className="glass rounded-3xl p-8 sm:p-10">
        <div className="p-4 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-sm">
          <p className="font-bold mb-2">NFT Factory contract not configured</p>
          <p>Please set NEXT_PUBLIC_NFT_FACTORY_ADDRESS in your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8 sm:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-lg">
          🎨
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Create NFT Collection
        </h2>
      </div>

      <form onSubmit={handleCreateCollection} className="space-y-6">
        {/* Collection Type Selection */}
        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-3">Collection Type</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCollectionType('standard')}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold transition-all duration-300 ${
                collectionType === 'standard'
                  ? 'bg-indigo-600 text-white border border-indigo-500/20 shadow-lg'
                  : 'bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setCollectionType('dynamic')}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold transition-all duration-300 ${
                collectionType === 'dynamic'
                  ? 'bg-indigo-600 text-white border border-indigo-500/20 shadow-lg'
                  : 'bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Dynamic
            </button>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-zinc-300 mb-2">
            Collection Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all"
            placeholder="My Awesome Collection"
          />
        </div>

        {/* Symbol Input */}
        <div>
          <label htmlFor="symbol" className="block text-sm font-bold text-zinc-300 mb-2">
            Collection Symbol
          </label>
          <input
            id="symbol"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all"
            placeholder="MAC"
          />
        </div>

        {/* Base Token URI (only for standard) */}
        {collectionType === 'standard' && (
          <div>
            <label htmlFor="baseTokenURI" className="block text-sm font-bold text-zinc-300 mb-2">
              Base Token URI
            </label>
            <input
              id="baseTokenURI"
              type="text"
              value={baseTokenURI}
              onChange={(e) => setBaseTokenURI(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all"
              placeholder="https://api.example.com/tokens/"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
            <p className="font-bold mb-1">Error creating collection</p>
            <p>{error.message || error.toString() || 'Failed to create collection'}</p>
            {Boolean(error.cause) && (
              <p className="mt-2 text-xs opacity-75">{String(error.cause)}</p>
            )}
          </div>
        )}

        {/* Success Message */}
        {isConfirmed && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-sm">
            Collection created successfully.
          </div>
        )}

        {/* Submit Button */}
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
            'Create Collection'
          )}
        </button>
      </form>
    </div>
  );
};

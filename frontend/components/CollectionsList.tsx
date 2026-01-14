'use client';

import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { BURNOUT_NFT_FACTORY_ABI, BURNOUT_NFT_FACTORY_ADDRESS } from '@/lib/contracts';
import { formatAddress } from '@/lib/utils';

export const CollectionsList: React.FC = () => {
  const { address } = useAccount();

  const { data: collections, isLoading } = useReadContract({
    address: BURNOUT_NFT_FACTORY_ADDRESS,
    abi: BURNOUT_NFT_FACTORY_ABI,
    functionName: 'getCollectionsByUser',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!BURNOUT_NFT_FACTORY_ADDRESS,
    },
  });

  if (!address) {
    return (
      <div className="glass rounded-3xl p-8 sm:p-10">
        <p className="text-zinc-400 text-center">Please connect your wallet to view your collections</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-8 sm:p-10">
        <div className="flex items-center justify-center">
          <span className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
        </div>
      </div>
    );
  }

  const collectionsArray = collections as `0x${string}`[] | undefined;

  return (
    <div className="glass rounded-3xl p-8 sm:p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl">
          📚
        </div>
        <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          My Collections
        </h2>
      </div>

      {!collectionsArray || collectionsArray.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400 text-lg mb-2">No collections found</p>
          <p className="text-zinc-500 text-sm">Create your first NFT collection to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {collectionsArray.map((collectionAddress, index) => (
            <div
              key={collectionAddress}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Collection #{index + 1}</p>
                  <p className="text-white font-mono text-sm">{formatAddress(collectionAddress)}</p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(collectionAddress)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-sm"
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

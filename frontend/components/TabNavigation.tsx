'use client';

import React from 'react';

type Tab = 'token' | 'nft' | 'erc20';

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="flex items-center">
      <div className="glass rounded-2xl p-1 border border-white/10">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTabChange('token')}
            className={[
              'px-4 py-2 rounded-xl text-sm font-semibold',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0',
              activeTab === 'token'
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-zinc-300 hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            BURN
          </button>
          <button
            type="button"
            onClick={() => onTabChange('erc20')}
            className={[
              'px-4 py-2 rounded-xl text-sm font-semibold',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0',
              activeTab === 'erc20'
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-zinc-300 hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            Token Factory
          </button>
          <button
            type="button"
            onClick={() => onTabChange('nft')}
            className={[
              'px-4 py-2 rounded-xl text-sm font-semibold',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0',
              activeTab === 'nft'
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-zinc-300 hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            NFT Factory
          </button>
        </div>
      </div>
    </nav>
  );
};

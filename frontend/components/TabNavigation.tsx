'use client';

import React from 'react';

type Tab = 'token' | 'nft';

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="flex items-center gap-6">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onTabChange('token');
        }}
        className={`text-base font-medium transition-colors ${
          activeTab === 'token'
            ? 'text-white'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        Token Minter
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onTabChange('nft');
        }}
        className={`text-base font-medium transition-colors ${
          activeTab === 'nft'
            ? 'text-white'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        NFT Factory
      </a>
    </nav>
  );
};

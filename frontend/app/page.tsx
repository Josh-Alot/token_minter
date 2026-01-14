'use client';

import { useState } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { MintERC20Form } from "@/components/MintERC20Form";
import { TokenInfo } from "@/components/TokenInfo";
import { TransferForm } from "@/components/TransferForm";
import { ApproveForm } from "@/components/ApproveForm";
import { BurnForm } from "@/components/BurnForm";
import { AnimatedGlobe } from "@/components/AnimatedGlobe";
import { TabNavigation } from "@/components/TabNavigation";
import { NFTFactory } from "@/components/NFTFactory";
import { CollectionsList } from "@/components/CollectionsList";

type Tab = 'token' | 'nft';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('token');

  return (
    <div className="min-h-screen relative">
      <AnimatedGlobe />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Header Section */}
        <header className="mb-12 sm:mb-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-red-600 to-orange-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-2xl glow-orange">
                  🔥
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                    BurnoutToken
                  </h1>
                  <p className="text-base sm:text-lg text-zinc-400 font-medium mt-1">
                    ERC-20 Token Management Platform
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              <WalletConnect />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-8 sm:space-y-10 relative z-10">
          {activeTab === 'token' ? (
            <>
              {/* Token Info Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-2">
                  <TokenInfo />
                </div>
                <div>
                  <MintERC20Form />
                </div>
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <TransferForm />
                <ApproveForm />
                <BurnForm />
              </div>
            </>
          ) : (
            <>
              {/* NFT Factory Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <NFTFactory />
                </div>
                <div>
                  <CollectionsList />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 sm:mt-24 pt-8 border-t border-white/5 text-center text-zinc-500 text-sm relative z-10">
          <p className="font-medium">Built with Next.js, Wagmi & Viem • Powered by Kybr on Ethereum</p>
        </footer>
      </main>
    </div>
  );
}

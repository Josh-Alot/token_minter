import { WalletConnect } from "@/components/WalletConnect";
import { MintERC20Form } from "@/components/MintERC20Form";
import { TokenInfo } from "@/components/TokenInfo";
import { TransferForm } from "@/components/TransferForm";
import { ApproveForm } from "@/components/ApproveForm";
import { BurnForm } from "@/components/BurnForm";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <header className="mb-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg glow-purple">
                  🔥
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  BurnoutToken
                </h1>
              </div>
              <p className="text-lg text-zinc-300 font-medium ml-1">
                ERC-20 Token Management Platform
              </p>
            </div>
            <WalletConnect />
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="space-y-8 relative z-10">
          {/* Token Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TokenInfo />
            </div>
            <div>
              <MintERC20Form />
            </div>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TransferForm />
            <ApproveForm />
            <BurnForm />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center text-zinc-400 text-sm relative z-10">
          <p>Built with Next.js, Wagmi & Viem • Powered by Ethereum</p>
        </footer>
      </main>
    </div>
  );
}

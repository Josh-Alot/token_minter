import { WalletConnect } from "@/components/WalletConnect";
import { MintERC20Form } from "@/components/MintERC20Form";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              Token Minter
            </h1>
            <WalletConnect />
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Mint ERC-20 tokens to any address on the network
          </p>
        </header>

        <div className="mt-8">
          <MintERC20Form />
        </div>
      </main>
    </div>
  );
}

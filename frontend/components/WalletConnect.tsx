'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { formatAddress } from '@/lib/utils';

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const handleSwitchChain = () => {
    // Switch para Sepolia testnet (chainId: 11155111)
    switchChain({ chainId: 11155111 });
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {formatAddress(address)}
          </span>
          {chain && (
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {chain.name}
            </span>
          )}
        </div>
        {chain?.id !== 11155111 && chain?.id !== 31337 && (
          <button
            onClick={handleSwitchChain}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Switch to Sepolia
          </button>
        )}
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}


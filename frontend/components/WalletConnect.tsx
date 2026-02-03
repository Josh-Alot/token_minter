'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import type { Connector } from 'wagmi';
import { formatAddress } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { WalletSelectModal } from '@/components/WalletSelectModal';

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedConnect, setHasAttemptedConnect] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected) setShowWalletModal(false);
  }, [isConnected]);

  useEffect(() => {
    if (connectors.length > 0) {
      setError(null);
      setHasAttemptedConnect(false);
    }
  }, [connectors]);

  useEffect(() => {
    if (connectError && hasAttemptedConnect) {
      const errorMessage = connectError.message || connectError.toString();

      if (errorMessage.includes('rejected') || errorMessage.includes('User rejected')) {
        setError('Connection rejected. Please approve the connection request in your wallet.');
      } else if (errorMessage.includes('must has at least one account') || errorMessage.includes('no accounts')) {
        setError('Your wallet has no accounts. Please create an account in your wallet first.');
      } else if (errorMessage.includes('not authorized')) {
        setError('Connection not authorized. Please approve the connection in your wallet.');
      } else {
        setError(errorMessage);
      }
    } else if (!connectError) {
      if (!hasAttemptedConnect) {
        setError(null);
      }
    }
  }, [connectError, hasAttemptedConnect]);

  const handleConnect = (connector: Connector) => {
    setError(null);
    setHasAttemptedConnect(true);
    setShowWalletModal(false);
    connect({ connector });
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: 11155111 });
  };
  
  if (!mounted) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          disabled
          className="px-6 py-3 text-sm font-semibold text-white bg-white/10 border border-white/10 rounded-xl opacity-50 cursor-not-allowed"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
        <div className="glass rounded-xl px-4 py-3 border border-white/20 shadow-lg">
          <div className="flex flex-col items-end sm:items-start">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-white font-mono">
                {formatAddress(address)}
              </span>
            </div>
            {chain && (
              <span className="text-xs text-zinc-400 font-medium">
                {chain.name}
              </span>
            )}
          </div>
        </div>
        {chain?.id !== 11155111 && chain?.id !== 31337 && (
          <button
            onClick={handleSwitchChain}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl border border-indigo-500/20"
          >
            Switch Network
          </button>
        )}
        <button
          onClick={() => disconnect()}
          className="px-4 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/10"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <button
        onClick={() => setShowWalletModal(true)}
        disabled={isPending || connectors.length === 0}
        className="px-8 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl border border-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <span className="flex items-center gap-2">
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Connect Wallet
            </>
          )}
        </span>
      </button>
      {error && (
        <div className="max-w-xs p-4 glass-dark rounded-xl border border-amber-500/25 text-xs text-amber-200 space-y-2 shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold">Connection Error</p>
          </div>
          <p className="text-amber-200/90">{error}</p>
        </div>
      )}
      {connectors.length === 0 && !error && (
        <p className="text-xs text-zinc-400 max-w-xs text-right">
          No wallet detected. Install a Web3 wallet.
        </p>
      )}
      {showWalletModal && (
        <WalletSelectModal
          connectors={connectors}
          isPending={isPending}
          onSelect={handleConnect}
          onClose={() => setShowWalletModal(false)}
        />
      )}
    </div>
  );
}


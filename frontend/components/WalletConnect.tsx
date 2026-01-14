'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { formatAddress } from '@/lib/utils';
import { useState, useEffect } from 'react';

// Extend Window interface para incluir ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedConnect, setHasAttemptedConnect] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Evitar erro de hidratação - só renderizar estado correto após montagem no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Limpar erro quando connectors mudarem
  useEffect(() => {
    if (connectors.length > 0) {
      setError(null);
      setHasAttemptedConnect(false);
    }
  }, [connectors]);

  // Atualizar erro quando connectError mudar
  useEffect(() => {
    if (connectError && hasAttemptedConnect) {
      const errorMessage = connectError.message || connectError.toString();
      
      console.log('Connect error detected:', errorMessage, 'Full error:', connectError);
      
      // Mensagens de erro mais amigáveis
      if (errorMessage.includes('rejected') || errorMessage.includes('User rejected')) {
        setError('Connection rejected. Please approve the connection request in your wallet.');
      } else if (errorMessage.includes('must has at least one account') || errorMessage.includes('no accounts')) {
        setError('Your wallet has no accounts. Please create an account in your wallet first (e.g., MetaMask).');
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

  const handleConnect = async () => {
    setError(null);
    setHasAttemptedConnect(false);
    
    console.log('=== Connect Button Clicked ===');
    console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name, type: c.type })));
    
    if (!connectors || connectors.length === 0) {
      setError('No wallet connectors available. Please install MetaMask or another Web3 wallet.');
      console.error('No connectors available');
      return;
    }

    // Selecionar connector - priorizar MetaMask, depois injected, depois qualquer um disponível
    // Não verificar 'ready' pois alguns connectors (como metaMaskSDK) não expõem essa propriedade
    let connector = connectors.find(c => c.id === 'metaMask' || c.id === 'metaMaskSDK') || 
                    connectors.find(c => c.id === 'injected') || 
                    connectors[0];

    console.log('Selected connector:', connector?.id, connector?.name, 'Type:', connector?.type);

    if (!connector) {
      setError('No available wallet connector found.');
      console.error('No connector found');
      return;
    }

    // Verificar se o connector tem os métodos necessários ao invés de verificar 'ready'
    if (!connector.connect || typeof connector.connect !== 'function') {
      setError('Wallet connector is not properly initialized. Please refresh the page.');
      console.error('Connector missing connect method:', connector);
      return;
    }

    try {
      console.log('Attempting to connect with connector:', connector.id);
      setHasAttemptedConnect(true);
      
      // Verificar se a wallet tem contas antes de conectar (opcional, pode pular se não conseguir)
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          console.log('Current accounts:', accounts);
          if (!accounts || accounts.length === 0) {
            setError('Your wallet has no accounts. Please create an account in MetaMask first, then try again.');
            setHasAttemptedConnect(false);
            return;
          }
        } catch (checkError) {
          console.warn('Could not check accounts (continuing anyway):', checkError);
          // Continuar mesmo se não conseguir verificar
        }
      }
      
      console.log('Calling connect()...');
      connect({ connector });
      console.log('connect() called successfully, waiting for user response...');
    } catch (err) {
      console.error('Error in handleConnect:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      
      // Mensagens de erro mais amigáveis
      if (errorMessage.includes('rejected') || errorMessage.includes('User rejected')) {
        setError('Connection rejected. Please approve the connection request in your wallet.');
      } else if (errorMessage.includes('must has at least one account') || errorMessage.includes('no accounts')) {
        setError('Your wallet has no accounts. Please create an account in your wallet first (e.g., MetaMask).');
      } else {
        setError(errorMessage);
      }
      
      setHasAttemptedConnect(false);
    }
  };

  const handleSwitchChain = () => {
    // Switch para Sepolia testnet (chainId: 11155111)
    switchChain({ chainId: 11155111 });
  };

  // Durante SSR ou antes da hidratação, renderizar apenas o botão de conectar
  // Isso evita diferenças entre servidor e cliente
  if (!mounted) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          disabled
          className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-xl opacity-50 cursor-not-allowed shadow-lg"
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
            className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Switch Network
          </button>
        )}
        <button
          onClick={() => disconnect()}
          className="px-4 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <button
        onClick={handleConnect}
        disabled={isPending || connectors.length === 0}
        className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 rounded-xl hover:from-orange-700 hover:via-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 glow-orange relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center gap-2">
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
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </button>
      {error && (
        <div className="max-w-xs p-4 glass-dark rounded-xl border border-red-500/30 text-xs text-red-200 space-y-2 shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold">Connection Error</p>
          </div>
          <p className="text-red-300">{error}</p>
          {error.includes('no accounts') && (
            <div className="mt-3 pt-3 border-t border-red-500/30">
              <p className="font-medium mb-2 text-red-200">How to fix:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-red-300">
                <li>Open MetaMask extension</li>
                <li>Click "Create Account" or "Import Account"</li>
                <li>Complete the account setup</li>
                <li>Try connecting again</li>
              </ol>
            </div>
          )}
        </div>
      )}
      {connectors.length === 0 && !error && (
        <p className="text-xs text-zinc-400 max-w-xs text-right">
          No wallet detected. Install MetaMask or another Web3 wallet.
        </p>
      )}
    </div>
  );
}


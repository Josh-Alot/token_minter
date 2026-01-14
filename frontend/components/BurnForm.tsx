'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';
import { BURNOUT_TOKEN_ABI, BURNOUT_TOKEN_ADDRESS } from '@/lib/contracts';
import { formatAddress, formatEther } from '@/lib/utils';

export function BurnForm() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  // Evitar erro de hidratação: só usar dados da carteira após o mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Ler o saldo do usuário
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: BURNOUT_TOKEN_ADDRESS,
    abi: BURNOUT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!BURNOUT_TOKEN_ADDRESS && isConnected && !!address,
    },
  });

  useEffect(() => {
    if (isConfirmed && hash) {
      setShowSuccess(true);
      setAmount('');
      
      // Invalidar todas as queries relacionadas ao contrato para atualizar os dados
      queryClient.invalidateQueries({
        queryKey: [{ entity: 'readContract', address: BURNOUT_TOKEN_ADDRESS }],
      });
      
      setTimeout(() => {
        setShowSuccess(false);
        reset();
      }, 3000);
    }
  }, [isConfirmed, hash, reset, queryClient]);

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!BURNOUT_TOKEN_ADDRESS) {
      alert('Token contract address not configured.');
      return;
    }

    if (!amount) {
      alert('Please enter an amount to burn');
      return;
    }

    // Verificar se o usuário tem saldo suficiente
    if (balance !== undefined) {
      const amountWei = parseEther(amount);
      if (amountWei > balance) {
        alert(`Insufficient balance. You have ${formatEther(balance)} tokens.`);
        return;
      }
    }

    try {
      const amountWei = parseEther(amount);
      writeContract({
        address: BURNOUT_TOKEN_ADDRESS,
        abi: BURNOUT_TOKEN_ABI,
        functionName: 'burn',
        args: [amountWei],
      });
    } catch (err) {
      console.error('Error burning tokens:', err);
    }
  };

  const handleMaxBurn = () => {
    if (balance !== undefined) {
      setAmount(formatEther(balance));
    }
  };

  if (!mounted) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/20 shadow-xl">
        <p className="text-center text-zinc-400 animate-pulse">
          Loading burn form...
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/20 shadow-xl">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-white/20">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-zinc-400 font-medium">
            Please connect your wallet to burn tokens
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleBurn} className="glass rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/15 space-y-6 overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl glow-red">
          🔥
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Burn Tokens
          </h2>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Permanently destroy tokens
          </p>
        </div>
      </div>

      {balance !== undefined && (
        <div className="p-4 glass-dark rounded-xl border border-blue-500/30 overflow-hidden">
          <p className="text-sm font-semibold text-blue-200 break-words">
            Your balance: <span className="text-white text-lg">{formatEther(balance)}</span> tokens
          </p>
        </div>
      )}

      <div className="overflow-hidden">
        <label htmlFor="burn-amount" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
          Amount to Burn
        </label>
        <div className="flex gap-3 min-w-0">
          <input
            id="burn-amount"
            type="number"
            step="0.0001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            required
            className="flex-1 min-w-0 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:bg-white/8 transition-all font-medium overflow-hidden"
          />
          {balance !== undefined && (
            <button
              type="button"
              onClick={handleMaxBurn}
              className="px-4 sm:px-5 py-4 text-xs sm:text-sm font-bold text-white bg-red-500/20 hover:bg-red-500/30 rounded-2xl border border-red-500/30 transition-all whitespace-nowrap hover:scale-105 flex-shrink-0"
            >
              Max
            </button>
          )}
        </div>
        {address && (
          <p className="mt-3 text-xs text-zinc-500 font-mono break-all overflow-wrap-anywhere">
            {formatAddress(address)}
          </p>
        )}
      </div>

      {error && (
        <div className="p-4 glass-dark rounded-xl border border-red-500/30 break-words overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-red-200">Error</p>
          </div>
          <p className="text-sm text-red-300 break-words overflow-wrap-anywhere">{error.message}</p>
        </div>
      )}

      {showSuccess && (
        <div className="p-4 glass-dark rounded-xl border border-green-500/30">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-green-200">
              Tokens burned successfully! 🔥
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || isConfirming || !amount || (balance !== undefined && parseEther(amount || '0') > balance)}
        className="w-full px-6 py-5 text-base font-bold text-white bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl hover:from-red-700 hover:via-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 glow-red relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isPending ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Confirm in wallet...
            </>
          ) : isConfirming ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Burning...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Burn Tokens
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </button>
    </form>
  );
}

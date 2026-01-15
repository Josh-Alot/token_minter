'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { BURNOUT_TOKEN_ABI, BURNOUT_TOKEN_ADDRESS } from '@/lib/contracts';
import { formatAddress, formatEther } from '@/lib/utils';

export function ApproveForm() {
  const { address, isConnected } = useAccount();
  const [spenderAddress, setSpenderAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  // Evitar erro de hidratação: só renderizar conteúdo dependente da carteira após o mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: BURNOUT_TOKEN_ADDRESS,
    abi: BURNOUT_TOKEN_ABI,
    functionName: 'allowance',
    args: address && spenderAddress ? [address, spenderAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!BURNOUT_TOKEN_ADDRESS && isConnected && !!address && !!spenderAddress,
    },
  });

  useEffect(() => {
    if (isConfirmed && hash) {
      setShowSuccess(true);
      setAmount('');
      if (refetchAllowance) {
        refetchAllowance();
      }
      setTimeout(() => {
        setShowSuccess(false);
        reset();
      }, 3000);
    }
  }, [isConfirmed, hash, reset, refetchAllowance]);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!BURNOUT_TOKEN_ADDRESS) {
      alert('Token contract address not configured.');
      return;
    }

    if (!spenderAddress || !amount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const amountWei = parseEther(amount);
      writeContract({
        address: BURNOUT_TOKEN_ADDRESS,
        abi: BURNOUT_TOKEN_ABI,
        functionName: 'approve',
        args: [spenderAddress as `0x${string}`, amountWei],
      });
    } catch (err) {
      console.error('Error approving tokens:', err);
    }
  };

  if (!mounted) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/20 shadow-xl">
        <p className="text-center text-zinc-400 animate-pulse">
          Loading approve form...
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/20 shadow-xl">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-zinc-400 font-medium">
            Please connect your wallet to approve tokens
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleApprove} className="glass rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/15 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          ✓
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Approve
          </h2>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Grant spending permission
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="approve-spender" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
          Spender Address
        </label>
        <input
          id="approve-spender"
          type="text"
          value={spenderAddress}
          onChange={(e) => {
            setSpenderAddress(e.target.value);
            if (refetchAllowance && e.target.value) {
              refetchAllowance();
            }
          }}
          placeholder="0x..."
          required
          className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 focus:bg-white/8 transition-all font-mono text-sm"
        />
      </div>

      <div>
        <label htmlFor="approve-amount" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
          Amount
        </label>
        <input
          id="approve-amount"
          type="number"
          step="0.0001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          required
          className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 focus:bg-white/8 transition-all font-medium"
        />
      </div>

      {spenderAddress && allowance !== undefined && (
        <div className="p-4 glass-dark rounded-xl border border-indigo-500/20">
          <p className="text-sm font-semibold text-zinc-200">
            Current allowance: <span className="text-white">{formatEther(allowance)}</span> tokens
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 glass-dark rounded-xl border border-red-500/30 break-words">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-red-200">Error</p>
          </div>
          <p className="text-sm text-red-300">{error.message}</p>
        </div>
      )}

      {showSuccess && (
        <div className="p-4 glass-dark rounded-xl border border-emerald-500/25">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-emerald-200">
              Approval successful.
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || isConfirming || !amount || !spenderAddress}
        className="w-full px-6 py-5 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg border border-indigo-500/20"
      >
        <span className="flex items-center justify-center gap-2">
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
              Approving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approve Tokens
            </>
          )}
        </span>
      </button>
    </form>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useConnection } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';
import { BURNOUT_TOKEN_ABI, BURNOUT_TOKEN_ADDRESS } from '@/lib/contracts';
import { formatAddress } from '@/lib/utils';
import { MintSuccessModal } from './MintSuccessModal';

export function MintERC20Form() {
  const { address, isConnected } = useConnection();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [mintData, setMintData] = useState<{
    amount: string;
    recipient: string;
    txHash?: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract();

  // Evitar erro de hidratação: só renderizar o conteúdo dependente da carteira após o mount no cliente
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Quando a transação for confirmada, mostrar modal
  useEffect(() => {
    if (isConfirmed && hash && !showModal) {
      setShowModal(true);
      setMintData({
        amount,
        recipient: recipientAddress,
        txHash: hash,
      });
      
      // Invalidar todas as queries relacionadas ao contrato para atualizar os dados
      queryClient.invalidateQueries({
        queryKey: [{ entity: 'readContract', address: BURNOUT_TOKEN_ADDRESS }],
      });
    }
  }, [isConfirmed, hash, showModal, amount, recipientAddress, queryClient]);

  const handleAutoFill = () => {
    if (address) {
      setRecipientAddress(address);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!BURNOUT_TOKEN_ADDRESS) {
      alert('Token contract address not configured. Please set NEXT_PUBLIC_TOKEN_ADDRESS in your .env file.');
      return;
    }

    if (!recipientAddress || !amount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const amountWei = parseEther(amount);
      writeContract({
        address: BURNOUT_TOKEN_ADDRESS,
        abi: BURNOUT_TOKEN_ABI,
        functionName: 'mint',
        args: [recipientAddress as `0x${string}`, amountWei],
      });
    } catch (err) {
      console.error('Error minting tokens:', err);
    }
  };

  // Durante SSR / antes da hidratação, renderizar um placeholder estático
  if (!mounted) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/20 shadow-xl">
        <p className="text-center text-zinc-400 animate-pulse">
          Loading mint form...
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/20 shadow-xl">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/20">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-zinc-400 font-medium">
            Please connect your wallet to mint tokens
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleMint} className="glass rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/15 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl glow-blue">
            🪙
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Mint Tokens
            </h2>
            <p className="text-sm text-zinc-400 font-medium mt-1">
              Create new tokens on the network
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.0001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            required
            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/8 transition-all font-medium"
          />
        </div>

        <div>
          <label htmlFor="recipient" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
            Recipient Address
          </label>
          <div className="flex gap-3">
            <input
              id="recipient"
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              required
              className="flex-1 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/8 transition-all font-mono text-sm"
            />
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-5 py-4 text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all whitespace-nowrap hover:scale-105"
            >
              My Address
            </button>
          </div>
          {address && (
            <p className="mt-3 text-xs text-zinc-500 font-mono">
              {formatAddress(address)}
            </p>
          )}
        </div>

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

        <button
          type="submit"
          disabled={isPending || isConfirming || !amount || !recipientAddress}
          className="w-full px-6 py-5 text-base font-bold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 glow-blue relative overflow-hidden group"
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
                Minting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Mint Tokens
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>
      </form>

      {showModal && mintData && (
        <MintSuccessModal
          amount={mintData.amount}
          recipient={mintData.recipient}
          txHash={mintData.txHash}
          onClose={() => {
            setShowModal(false);
            setMintData(null);
            setAmount('');
            setRecipientAddress('');
          }}
        />
      )}
    </>
  );
}


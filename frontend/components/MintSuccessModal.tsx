'use client';

import { formatAddress } from '@/lib/utils';
import { useEffect } from 'react';

interface MintSuccessModalProps {
  amount: string;
  recipient: string;
  txHash?: string;
  onClose: () => void;
}

export function MintSuccessModal({
  amount,
  recipient,
  txHash,
  onClose,
}: MintSuccessModalProps) {
  // Fechar modal com ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Fechar apenas se clicar no backdrop, não no conteúdo do modal
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="glass rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg glow-green">
              ✓
            </div>
            <h3 id="modal-title" className="text-2xl font-bold text-white">
              Mint Successful!
            </h3>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="text-zinc-400 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Amount Minted
            </p>
            <p className="text-2xl font-bold text-white">
              {amount} <span className="text-lg text-zinc-300">tokens</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Recipient Address
            </p>
            <p className="text-sm font-mono text-white break-all">
              {formatAddress(recipient)}
            </p>
          </div>

          {txHash && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Transaction Hash
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-blue-400 hover:text-blue-300 hover:underline break-all flex items-center gap-2 transition-colors"
              >
                {formatAddress(txHash)}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          <button
            onClick={handleClose}
            type="button"
            className="w-full px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] glow-blue"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


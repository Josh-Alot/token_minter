'use client';

import type { Connector } from 'wagmi';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface WalletSelectModalProps {
  connectors: readonly Connector[];
  isPending: boolean;
  onSelect: (connector: Connector) => void;
  onClose: () => void;
}

export function WalletSelectModal({ connectors, isPending, onSelect, onClose }: WalletSelectModalProps) {
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-xl"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
    >
      <div
        className="rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 border border-white/10 bg-zinc-950 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-200 text-xl font-bold shadow-lg">
              ⛓
            </div>
            <h3 id="wallet-modal-title" className="text-2xl font-bold text-white">
              Select a wallet
            </h3>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="text-zinc-400 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-200px)] overflow-x-hidden">
          {connectors.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-zinc-300">No wallets detected.</p>
              <p className="text-xs text-zinc-500 mt-2">Install a Web3 wallet or enable WalletConnect.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {connectors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c)}
                  disabled={isPending}
                  className="w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-white truncate">{c.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{c.id}</p>
                    </div>
                    <svg className="w-5 h-5 text-zinc-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleClose}
            type="button"
            className="w-full px-6 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/15 rounded-xl transition-all shadow-lg border border-white/10 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  , document.body);
}


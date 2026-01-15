'use client';

import React from 'react';

export function AnimatedGlobe() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <style>{`
        @keyframes tm-float-1 {
          0%, 100% { transform: translate3d(-6%, -4%, 0) scale(1); opacity: 0.55; }
          50% { transform: translate3d(6%, 4%, 0) scale(1.06); opacity: 0.75; }
        }
        @keyframes tm-float-2 {
          0%, 100% { transform: translate3d(8%, -6%, 0) scale(1); opacity: 0.40; }
          50% { transform: translate3d(-8%, 6%, 0) scale(1.08); opacity: 0.60; }
        }
        @keyframes tm-float-3 {
          0%, 100% { transform: translate3d(-4%, 8%, 0) scale(1); opacity: 0.35; }
          50% { transform: translate3d(4%, -8%, 0) scale(1.10); opacity: 0.55; }
        }
      `}</style>

      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 800px at 20% 15%, rgba(99, 102, 241, 0.14) 0%, transparent 60%), radial-gradient(1000px 700px at 80% 25%, rgba(56, 189, 248, 0.10) 0%, transparent 55%), radial-gradient(900px 700px at 50% 85%, rgba(148, 163, 184, 0.08) 0%, transparent 60%)',
        }}
      />

      {/* Floating blur blobs */}
      <div
        className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background: 'rgba(99, 102, 241, 0.14)',
          animation: 'tm-float-1 16s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-10 -right-48 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background: 'rgba(56, 189, 248, 0.10)',
          animation: 'tm-float-2 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-56 left-1/3 h-[620px] w-[620px] rounded-full blur-3xl"
        style={{
          background: 'rgba(148, 163, 184, 0.08)',
          animation: 'tm-float-3 24s ease-in-out infinite',
        }}
      />

      {/* Subtle vignette for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />
    </div>
  );
}

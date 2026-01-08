import { http, createConfig } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Configuração dos connectors
const connectors = [
  injected(),
  metaMask(),
  ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    ? [
        walletConnect({
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        }),
      ]
    : []),
];

// Configuração do wagmi
export const config = createConfig({
  chains: [sepolia, hardhat],
  connectors,
  transports: {
    [sepolia.id]: http(),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});


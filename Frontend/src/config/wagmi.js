import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

// Wagmi config for Sepolia testnet
export const wagmiConfig = createConfig({
    chains: [sepolia],
    connectors: [
        injected(),
        metaMask(),
    ],
    transports: {
        [sepolia.id]: http(
            import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'
        ),
    },
});

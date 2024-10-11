import { http, createConfig } from "wagmi";
import { arbitrumNova, arbitrumSepolia } from "wagmi/chains";
import { sequenceWaasTransportWallet } from "./waasTransportConnector";

const connector = sequenceWaasTransportWallet({
  projectAccessKey: "AQAAAAAAAEGvyZiWA9FMslYeG_yayXaHnSI",
  walletUrl: "http://localhost:4444",
  chainId: 42170,
});

export const config = createConfig({
  chains: [arbitrumNova, arbitrumSepolia],
  connectors: [connector],
  transports: {
    [arbitrumNova.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
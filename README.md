# Ecosystem Wallet

- `./wallet` contains a react app with embedded wallet integration + `walletTransport` that allows it to act as a wallet.
- `.dapp` contains a react demo dapp that uses [`@0xsequence/cross-app-embedded-wallet-connector`](https://github.com/0xsequence/cross-app-embedded-wallet-connector) wagmi connector to use communicate to and use `./wallet` with user permission.

## Architecture Overview

![Cross App Embedded Wallet Architecture](./docs/architecture.png)

The cross-app embedded wallet implements a communication flow between dApps and the wallet application:

1. The dApp communicates with the wallet through the cross-app embedded wallet connector for Wagmi
2. The connector uses a ProviderTransport to handle communication
3. Messages are sent between the ProviderTransport and WalletTransport
4. The Wallet component handles three main functionalities:
   - User Authentication
   - Transaction Signing
   - Message Signing

The wallet can be opened and send messages back to the dApp through the transport layer, enabling secure cross-application communication.

## Wallet Environment Variables

The wallet application requires the following environment variables to be set:

### Configuration

- `VITE_PROJECT_ACCESS_KEY`: Sequence project access key
- `VITE_WAAS_CONFIG_KEY`: WaaS (Wallet-as-a-Service) configuration key from sequence.build
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID for social authentication
- `VITE_APPLE_CLIENT_ID`: Apple client ID
- `VITE_APPLE_REDIRECT_URI`: Apple redirect URI

### Customization

- `VITE_PROJECT_NAME`: Display name for the wallet application
- `VITE_PROJECT_LOGO`: URL to the main logo image
- `VITE_PROJECT_SMALL_LOGO`: URL to a smaller version of the logo, also used for favicon

Create a `.env` file in the `./wallet` directory and copy these variables from `.env.example`, replacing the values as needed for your configuration.

### Discover Section Items

The discover items (apps/games) are configured via the `VITE_DISCOVER_ITEMS` environment variable. To update the items:

1. Add `discover-items.json` with your items under /wallet
2. Run `node stringify-discover-items.cjs`
3. Copy the output into your `.env` file as `VITE_DISCOVER_ITEMS`

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

export function WalletConnect() {
  const account = useCurrentAccount();

  return (
    <div className="flex items-center gap-4">
      <ConnectButton />
      {account && (
        <div className="text-sm text-gray-600">
          Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </div>
      )}
    </div>
  );
} 
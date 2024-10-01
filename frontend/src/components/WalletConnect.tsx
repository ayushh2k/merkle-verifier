// components/WalletConnect.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Wallet } from 'lucide-react';

interface WalletConnectProps {
  address: string;
  onConnect: () => Promise<void>;
  isConnecting: boolean;
}

export default function WalletConnect({ address, onConnect, isConnecting }: WalletConnectProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-sm">
      <CardContent className="pt-6">
        {!address ? (
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-6"
          >
            {isConnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="mr-2 h-4 w-4" />
            )}
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

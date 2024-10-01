// app/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import WalletConnect from '@/components/WalletConnect';
import MerkleForm from '@/components/MerkleForm';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setIsConnected(accounts.length > 0);
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      }
    };

    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setIsConnected(accounts.length > 0);
        setAddress(accounts.length > 0 ? accounts[0] : '');
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Merkle Verifier
          </h1>
          <p className="mt-2 text-gray-600">
            Verify blockchain transactions with Merkle proofs
          </p>
        </div>

        <WalletConnect
          address={address}
          onConnect={connectWallet}
          isConnecting={isConnecting}
        />
        
        <MerkleForm isConnected={isConnected} />
      </div>
    </div>
  );
}
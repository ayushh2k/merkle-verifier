// components/MerkleForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { ethers } from 'ethers';
import { generateMerkleProof } from '@/lib/merkleTree';
import MerkleVerifierABI from '@/lib/merkleVerifierABI.json';

const CONTRACT_ADDRESS = '0x7f5844adb2Fe86c43A60cc08c965f416f7288717';

interface MerkleFormProps {
  isConnected: boolean;
}

export default function MerkleForm({ isConnected }: MerkleFormProps) {
  const [blockNumber, setBlockNumber] = useState('');
  const [txHash, setTxHash] = useState('');
  const [merkleProof, setMerkleProof] = useState<string[]>([]);
  const [merkleRoot, setMerkleRoot] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettingRoot, setIsSettingRoot] = useState(false);

  const generateProof = async () => {
    setIsGenerating(true);
    try {
      setError('');
      const result = await generateMerkleProof(blockNumber, txHash);
      setMerkleProof(result.proof);
      setMerkleRoot(result.root);
    } catch (error) {
      setError('Error generating Merkle proof');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const setRoot = async () => {
    setIsSettingRoot(true);
    try {
      setError('');
      if (!merkleRoot) {
        setError('Please generate Merkle proof first');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MerkleVerifierABI, signer);

      const tx = await contract.setMerkleRoot(merkleRoot);
      await tx.wait();
    } catch (error) {
      setError('Error setting Merkle root');
      console.error(error);
    } finally {
      setIsSettingRoot(false);
    }
  };

  const verifyTransaction = async () => {
    setIsVerifying(true);
    try {
      setError('');
      if (!merkleProof.length || !txHash) {
        setError('Please generate Merkle proof first');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MerkleVerifierABI, provider);
      
      const leaf = ethers.utils.keccak256(txHash);
      const result = await contract.verifyTransaction(merkleProof, leaf);
      setVerificationResult(result);
    } catch (error) {
      setError('Error verifying transaction');
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Enter the block number and transaction hash to generate a Merkle proof
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Input
                placeholder="Block Number"
                value={blockNumber}
                onChange={(e) => setBlockNumber(e.target.value)}
                disabled={!isConnected}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Transaction Hash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                disabled={!isConnected}
                className="bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={generateProof}
              disabled={!isConnected || !blockNumber || !txHash || isGenerating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              Generate Proof
            </Button>
            <Button
              onClick={setRoot}
              disabled={!isConnected || !merkleRoot || isSettingRoot}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isSettingRoot ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              Set Root
            </Button>
            <Button
              onClick={verifyTransaction}
              disabled={!isConnected || !merkleProof.length || isVerifying}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isVerifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              Verify
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="border-none">
          <AlertDescription className="flex items-center">
            <XCircle className="h-4 w-4 mr-2" />
            {error}
          </AlertDescription>
        </Alert>
      )}

      {verificationResult !== null && (
        <Alert
          variant={verificationResult ? "default" : "destructive"}
          className={`border-none ${
            verificationResult
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <AlertDescription className="flex items-center">
            {verificationResult ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
            )}
            Transaction verification: {verificationResult ? 'Successful' : 'Failed'}
          </AlertDescription>
        </Alert>
      )}

      {merkleProof.length > 0 && (
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Merkle Proof</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {merkleProof.map((proof, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg font-mono text-sm break-all"
                >
                  {proof}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
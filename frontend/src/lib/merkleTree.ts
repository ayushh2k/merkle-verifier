// lib/merkleTree.ts
import { ethers } from 'ethers';
import { MerkleTree } from 'merkletreejs';

export async function generateMerkleProof(blockNumber: string, transactionHash: string) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const block = await provider.getBlock(parseInt(blockNumber));
    
    if (!block || !block.transactions) {
      throw new Error('Block not found or has no transactions');
    }

    const leaves = block.transactions.map(tx => ethers.utils.keccak256(tx));
    const merkleTree = new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true });
    
    const leaf = ethers.utils.keccak256(transactionHash);
    const proof = merkleTree.getHexProof(leaf);
    
    return {
      proof,
      root: merkleTree.getHexRoot(),
      leaf
    };
  } catch (error) {
    console.error('Error generating Merkle proof:', error);
    throw error;
  }
}
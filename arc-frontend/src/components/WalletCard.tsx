import React, { useEffect, useState } from 'react';
import { CreditCard, TrendingUp, TrendingDown, Copy, Check } from 'lucide-react';
import { useWalletStore } from '../services/store';

interface WalletCardProps {
  compact?: boolean;
}

export const WalletCard: React.FC<WalletCardProps> = ({ compact = false }) => {
  const { wallet, fetchWallet } = useWalletStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!wallet) {
    return (
      <div className="bg-white rounded-xl p-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Wallet Balance</span>
          <CreditCard className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-2xl font-bold text-slate-900">${wallet.balanceUSD.toFixed(2)}</p>
        <p className="text-xs text-slate-500 mt-1">{parseFloat(wallet.balance).toFixed(2)} USDC</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Wallet</h3>
        <CreditCard className="w-6 h-6 text-blue-600" />
      </div>

      {/* Balance Display */}
      <div className="mb-6">
        <p className="text-sm text-slate-600 mb-2">USDC Balance</p>
        <p className="text-4xl font-bold text-slate-900">${wallet.balanceUSD.toFixed(2)}</p>
        <p className="text-xs text-slate-500 mt-1">{parseFloat(wallet.balance).toFixed(2)} USDC on Arc</p>
      </div>

      {/* Address */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <p className="text-xs text-slate-600 mb-2">Wallet Address</p>
        <div className="flex items-center justify-between">
          <code className="text-sm font-mono text-slate-900">{wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}</code>
          <button
            onClick={() => handleCopy(wallet.address)}
            className="p-1 hover:bg-slate-200 rounded transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
          <TrendingDown className="w-4 h-4" />
          Deposit
        </button>
        <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Withdraw
        </button>
      </div>
    </div>
  );
};

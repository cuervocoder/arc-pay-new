import React, { useState } from 'react';
import { Star, Zap, Lock } from 'lucide-react';
import { ContentItem } from '../types';
import { apiService } from '../services/api';

interface ContentCardProps {
  content: ContentItem;
  onPaymentSuccess?: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content, onPaymentSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(content.paymentStatus === 'paid');

  const handlePay = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.makePayment(content.id, content.price);
      if (response.success) {
        setIsPaid(true);
        onPaymentSuccess?.();
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {content.title}
          </h3>
          <p className="text-sm text-slate-600 mt-1">by {content.author}</p>
        </div>
        <span className="text-2xl font-bold text-blue-600 ml-4">${content.price.toFixed(2)}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
        {content.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {content.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-t border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-slate-600">Quality</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">{content.qualityScore.toFixed(1)}/10</p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-slate-600">Relevance</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">{content.relevanceScore}%</p>
        </div>
      </div>

      {/* Payment Status & Action */}
      {isPaid ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <span className="text-sm font-medium text-green-700">Already purchased</span>
        </div>
      ) : (
        <button
          onClick={handlePay}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Pay & Unlock
            </>
          )}
        </button>
      )}
    </div>
  );
};

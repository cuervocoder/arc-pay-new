import React, { useEffect, useState } from 'react';
import { TrendingUp, Zap, Calendar } from 'lucide-react';
import { ContentCard } from '../components/ContentCard';
import { WalletCard } from '../components/WalletCard';
import { useDashboardStore, useAgentStore } from '../services/store';
import { apiService } from '../services/api';
import { ContentItem } from '../types';

export const Dashboard: React.FC = () => {
  const { stats, fetchStats } = useDashboardStore();
  const { status } = useAgentStore();
  const [contentFeed, setContentFeed] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchStats();
    loadContentFeed();
  }, []);

  const loadContentFeed = async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const response = await apiService.getContentFeed(pageNum, 6);
      if (response.data?.items) {
        setContentFeed(response.data.items);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading content feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh stats and content
    fetchStats();
    loadContentFeed(page);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Content Feed</h1>
          <p className="text-slate-600 mt-1">AI-curated content based on your preferences</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className={`w-2 h-2 rounded-full ${status?.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
          <span className="text-sm font-medium text-blue-700">
            {status?.isActive ? 'Agent Active' : 'Agent Inactive'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600 uppercase">Today Spent</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">${stats?.todaySpent.toFixed(2) || '0.00'}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600 uppercase">Month Total</span>
            <Calendar className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">${stats?.monthlySpent.toFixed(2) || '0.00'}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600 uppercase">Content Paid</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.contentPaid || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600 uppercase">Avg Quality</span>
            <span className="text-xs font-bold px-2 py-1 bg-yellow-50 text-yellow-700 rounded">4.2/10</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.averageQuality.toFixed(1) || '0.0'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Feed */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-24 bg-slate-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {contentFeed.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => loadContentFeed(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-50 hover:bg-slate-200 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">Page {page}</span>
                <button
                  onClick={() => loadContentFeed(page + 1)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <WalletCard compact={false} />

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Content Paid</span>
                <span className="font-bold text-slate-900">{stats?.contentPaid || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Spent</span>
                <span className="font-bold text-slate-900">${stats?.monthlySpent.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Avg Quality</span>
                <span className="font-bold text-slate-900">{stats?.averageQuality.toFixed(1) || '0.0'}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Subscriptions</span>
                <span className="font-bold text-slate-900">{stats?.activeSubscriptions || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

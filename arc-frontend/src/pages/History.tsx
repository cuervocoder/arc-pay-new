import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Search, Download, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';
import { Payment, PaymentHistory } from '../types';

export const History: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    loadPaymentHistory();
  }, [page]);

  const loadPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getPaymentHistory(page);
      if (response.data) {
        const data = response.data as PaymentHistory;
        setPayments(data.payments || []);
        setTotalSpent(data.totalSpent || 0);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.contentTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Payment['status']) => {
    const badges: Record<Payment['status'], { bg: string; text: string; label: string }> = {
      completed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
      failed: { bg: 'bg-red-50', text: 'text-red-700', label: 'Failed' },
    };
    const badge = badges[status];
    return `${badge.bg} ${badge.text}`;
  };

  const exportCSV = () => {
    const csv = [
      ['ID', 'Content', 'Creator', 'Amount', 'Status', 'Date'],
      ...filteredPayments.map(p => [
        p.id,
        p.contentTitle || 'N/A',
        p.creatorName || 'N/A',
        `$${p.amount.toFixed(2)}`,
        p.status,
        new Date(p.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-history.csv';
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payment History</h1>
            <p className="text-slate-600">Track all your content purchases</p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Total Spent</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Total Transactions</span>
            <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded">All</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{payments.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Average Payment</span>
            <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded">Avg</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            ${payments.length > 0 ? (totalSpent / payments.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, creator, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 mt-3">Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <HistoryIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Creator</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="font-medium text-slate-900 truncate max-w-xs">
                          {payment.contentTitle || 'Content'}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">{payment.id.slice(0, 16)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{payment.creatorName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      ${payment.amount.toFixed(2)} USDC
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredPayments.length > 0 && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-50 hover:bg-slate-200 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

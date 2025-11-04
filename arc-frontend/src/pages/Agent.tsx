import React, { useEffect, useState, useCallback } from 'react';
import { Zap, Play, Pause, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAgentStore } from '../services/store';
import { apiService } from '../services/api';

interface AgentAction {
  id: string;
  type: 'payment' | 'subscription' | 'analysis' | 'recommendation';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  completedAt?: string;
}

export const Agent: React.FC = () => {
  const { status, isLoading, fetchStatus, start, stop } = useAgentStore();
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [actionsLoading, setActionsLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
    loadAgentActions();
    const interval = setInterval(() => {
      fetchStatus();
      loadAgentActions();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAgentActions = async () => {
    setActionsLoading(true);
    try {
      const response = await apiService.getAgentActions(10);
      if (response.data) {
        setActions(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error loading agent actions:', error);
    } finally {
      setActionsLoading(false);
    }
  };

  const handleToggle = useCallback(async () => {
    if (status?.isActive) {
      await stop();
    } else {
      await start();
    }
  }, [status?.isActive, start, stop]);

  const getActionIcon = (type: AgentAction['type']) => {
    const icons: Record<AgentAction['type'], React.ReactNode> = {
      payment: '💳',
      subscription: '📅',
      analysis: '🔍',
      recommendation: '⭐',
    };
    return icons[type];
  };

  const getActionBadge = (type: AgentAction['type']) => {
    const colors: Record<AgentAction['type'], string> = {
      payment: 'bg-blue-50 text-blue-700',
      subscription: 'bg-purple-50 text-purple-700',
      analysis: 'bg-cyan-50 text-cyan-700',
      recommendation: 'bg-amber-50 text-amber-700',
    };
    return colors[type];
  };

  const getStatusIcon = (status: AgentAction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Agent</h1>
            <p className="text-slate-600">Automated payment processor and content analyzer</p>
          </div>
        </div>
      </div>

      {/* Agent Status Card */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Agent Status</h2>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full animate-pulse ${status?.isActive ? 'bg-green-500' : 'bg-slate-400'}`}></div>
              <span className={`font-semibold ${status?.isActive ? 'text-green-700' : 'text-slate-700'}`}>
                {status?.isActive ? 'Active & Running' : 'Inactive'}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 ${
              status?.isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            } disabled:opacity-50`}
          >
            {status?.isActive ? (
              <>
                <Pause className="w-5 h-5" />
                Stop Agent
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Agent
              </>
            )}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Last Run</p>
            <p className="text-lg font-bold text-slate-900">
              {status?.lastRun ? new Date(status.lastRun).toLocaleTimeString() : 'Never'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Next Run</p>
            <p className="text-lg font-bold text-slate-900">
              {status?.nextRun ? new Date(status.nextRun).toLocaleTimeString() : '-'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Uptime</p>
            <p className="text-lg font-bold text-slate-900">
              {status?.isActive ? '✓ Online' : '✗ Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Agent Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Payments Processed</h3>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-blue-600 mb-2">{status?.paymentsProcessed || 0}</p>
          <p className="text-sm text-slate-600">Total transactions initiated by agent</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Content Analyzed</h3>
            <BarChart3 className="w-6 h-6 text-cyan-600" />
          </div>
          <p className="text-4xl font-bold text-cyan-600 mb-2">{status?.contentAnalyzed || 0}</p>
          <p className="text-sm text-slate-600">Content pieces evaluated by agent</p>
        </div>
      </div>

      {/* Agent Actions Log */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recent Actions</h3>
          <p className="text-sm text-slate-600 mt-1">Latest agent activity and decisions</p>
        </div>

        {actionsLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 mt-3">Loading actions...</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="p-8 text-center">
            <Zap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No agent actions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {actions.map((action) => (
              <div key={action.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{getActionIcon(action.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActionBadge(action.type)}`}>
                          {action.type.charAt(0).toUpperCase() + action.type.slice(1)}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          action.status === 'completed'
                            ? 'bg-green-50 text-green-700'
                            : action.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {getStatusIcon(action.status)}
                          {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-slate-900 font-medium">{action.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 ml-11">
                  <span>{new Date(action.createdAt).toLocaleString()}</span>
                  {action.completedAt && (
                    <span>Completed at {new Date(action.completedAt).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
        <h3 className="font-semibold text-cyan-900 mb-3">How the Agent Works</h3>
        <ul className="space-y-2 text-sm text-cyan-800">
          <li>• Continuously monitors new content matching your interests</li>
          <li>• Analyzes quality and relevance scores of content</li>
          <li>• Automatically executes payments within your budget constraints</li>
          <li>• Logs all actions for transparency and audit purposes</li>
          <li>• Respects your minimum quality threshold before paying</li>
          <li>• Can be paused anytime without losing historical data</li>
        </ul>
      </div>
    </div>
  );
};

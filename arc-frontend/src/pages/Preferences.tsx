import React, { useEffect, useState } from 'react';
import { Settings, Plus, X, AlertCircle } from 'lucide-react';
import { usePreferencesStore } from '../services/store';

export const Preferences: React.FC = () => {
  const { preferences, isLoading, fetchPreferences, updateBudgetSettings, updateAISettings, addInterest, removeInterest } = usePreferencesStore();
  const [newInterest, setNewInterest] = useState('');
  const [dailyLimit, setDailyLimit] = useState(5);
  const [minimumQuality, setMinimumQuality] = useState(7);
  const [autoPay, setAutoPay] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  useEffect(() => {
    if (preferences) {
      setDailyLimit(preferences.budgetSettings?.dailyLimit || 5);
      setMinimumQuality(preferences.aiSettings?.minimumQualityScore || 7);
      setAutoPay(preferences.budgetSettings?.autoPay || false);
    }
  }, [preferences]);

  const handleBudgetUpdate = async () => {
    try {
      await updateBudgetSettings({ dailyLimit });
      setMessage('Budget settings updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating budget settings');
    }
  };

  const handleQualityUpdate = async () => {
    try {
      await updateAISettings({ minimumQualityScore: minimumQuality });
      setMessage('Quality threshold updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating AI settings');
    }
  };

  const handleAddInterest = async () => {
    if (!newInterest.trim()) return;
    try {
      await addInterest(newInterest);
      setNewInterest('');
      setMessage('Interest added!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error adding interest');
    }
  };

  const handleRemoveInterest = async (interest: string) => {
    try {
      await removeInterest(interest);
      setMessage('Interest removed!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error removing interest');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Preferences</h1>
          <p className="text-slate-600">Configure your AI payment agent</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {message}
        </div>
      )}

      {/* Budget Settings */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold">$</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Budget Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Daily Limit */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-900">Daily Spending Limit</label>
              <span className="text-lg font-bold text-blue-600">${dailyLimit.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="0.5"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-slate-600 mt-2">Maximum amount to spend on content per day</p>
          </div>

          {/* Auto-Pay Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Auto-Pay Enabled</p>
              <p className="text-sm text-slate-600">Automatically process payments for quality content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoPay}
                onChange={(e) => setAutoPay(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <button
            onClick={handleBudgetUpdate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Save Budget Settings
          </button>
        </div>
      </div>

      {/* AI Analysis Settings */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
            <span className="text-cyan-600 font-bold">⚡</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">AI Analysis Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Minimum Quality Score */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-900">Minimum Quality Score</label>
              <span className="text-lg font-bold text-cyan-600">{minimumQuality.toFixed(1)}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={minimumQuality}
              onChange={(e) => setMinimumQuality(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <p className="text-xs text-slate-600 mt-2">Only pay for content with quality above this threshold</p>
          </div>

          <button
            onClick={handleQualityUpdate}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Save AI Settings
          </button>
        </div>
      </div>

      {/* Your Interests */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <span className="text-purple-600 font-bold">✨</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Interests</h2>
        </div>

        <p className="text-sm text-slate-600 mb-4">Add interests to improve AI recommendations</p>

        {/* Interest Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {preferences?.interests?.map((interest) => (
            <div
              key={interest}
              className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full"
            >
              <span className="text-sm font-medium">{interest}</span>
              <button
                onClick={() => handleRemoveInterest(interest)}
                className="hover:text-purple-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Interest */}
        <div className="flex gap-3">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
            placeholder="e.g., Machine Learning"
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddInterest}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How the AI Agent Works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• The agent analyzes content based on your interests and quality threshold</li>
          <li>• Payments are automatically processed when auto-pay is enabled</li>
          <li>• Your daily spending limit prevents overspending</li>
          <li>• The agent learns from your preferences to provide better recommendations</li>
        </ul>
      </div>
    </div>
  );
};

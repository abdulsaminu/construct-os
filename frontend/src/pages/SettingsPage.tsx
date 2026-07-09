import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { poster } from '../lib/api';
import { Settings, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

export const SettingsPage = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'confirm' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (resetStatus === 'idle') {
      setResetStatus('confirm');
      return;
    }

    setIsResetting(true);
    setError('');
    
    try {
      const res = await poster<{ message?: string; error?: string }>('/system/reset-demo', {});
      if (res.error) {
        setError(res.error);
        setResetStatus('error');
      } else {
        setResetStatus('success');
        // Reload the page after successful reset
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setError('Failed to reset demo workspace');
      setResetStatus('error');
    } finally {
      setIsResetting(false);
    }
  };

  const cancelReset = () => {
    setResetStatus('idle');
    setError('');
  };

  return (
    <div>
      <PageHeader title="Settings" icon={Settings} />
      
      <div className="max-w-2xl space-y-6">
        {/* Demo Workspace Section */}
        <div className="bg-surface rounded-card border border-border-main p-6">
          <h3 className="text-h3 text-text-main mb-2">Demo Workspace</h3>
          <p className="text-small text-text-muted mb-6">
            Reset the demo workspace to its initial state. This will delete all projects, contractors, 
            ledger entries, and reset the treasury to 100 USDC with a pre-configured demo project.
          </p>

          {resetStatus === 'success' ? (
            <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-card">
              <CheckCircle size={20} className="text-success" />
              <div>
                <p className="text-small font-medium text-success">Demo workspace reset successfully</p>
                <p className="text-caption text-text-muted">Reloading...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {resetStatus === 'confirm' && (
                <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-card">
                  <AlertTriangle size={20} className="text-warning mt-0.5" />
                  <div>
                    <p className="text-small font-medium text-warning">Are you sure?</p>
                    <p className="text-caption text-text-muted mt-1">
                      This action cannot be undone. All current data will be permanently deleted.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-danger/10 border border-danger/30 rounded-card">
                  <p className="text-small text-danger">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                {resetStatus === 'confirm' && (
                  <button
                    onClick={cancelReset}
                    disabled={isResetting}
                    className="btn-ghost text-small"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-danger/20 text-danger hover:bg-danger/30 rounded-btn text-small font-medium transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  {isResetting ? 'Resetting...' : resetStatus === 'idle' ? 'Reset Demo Workspace' : 'Confirm Reset'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* System Info Section */}
        <div className="bg-surface rounded-card border border-border-main p-6">
          <h3 className="text-h3 text-text-main mb-2">System Configuration</h3>
          <p className="text-text-muted text-small">
            Advanced settings are handled via Environment Variables and configuration files.
          </p>
          <div className="mt-4 space-y-2 text-small">
            <div className="flex justify-between py-2 border-b border-border-main">
              <span className="text-text-dim">Version</span>
              <span className="text-text-main font-mono">0.4.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-main">
              <span className="text-text-dim">Settlement Layer</span>
              <span className="text-text-main">Arc Network</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-main">
              <span className="text-text-dim">Stablecoin</span>
              <span className="text-text-main">USDC</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-dim">Storage</span>
              <span className="text-text-main">JSON File Store</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

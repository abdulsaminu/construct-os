import { PageHeader } from '../components/layout/PageHeader';

export const SettingsPage = () => (
  <div>
    <PageHeader title="Settings" />
    <div className="bg-surface rounded-2xl border border-border-main p-12 text-center shadow-soft">
      <h3 className="text-h3 font-semibold text-text-main">System Configuration</h3>
      <p className="text-text-muted mt-2">Settings management is handled via Environment Variables and Config files in this version.</p>
    </div>
  </div>
);

import { PageHeader } from '../components/layout/PageHeader';

export const SettingsPage = () => (
  <div>
    <PageHeader title="Settings" />
 <div className="bg-surface rounded-card border border-border-main p-12 text-center shadow-surface">
 <h3 className="text-h3 font-semibold text-text-main">System Configuration</h3>
 <p className="text-text-muted mt-2">Settings management is handled via Environment Variables and Config files in this version.</p>
    </div>
  </div>
);

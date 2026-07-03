import { Economy } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { Skeleton } from '../ui/Skeleton';
import { money } from '../../lib/api';

interface Props {
  economy: Economy | null;
  isLoading: boolean;
}

export const CapitalDistribution: React.FC<Props> = ({ economy, isLoading }) => (
 <Panel className="lg:col-span-8 col-span-12">
    <SectionHeader title="Capital Distribution" />
    {isLoading ? (
 <div className="space-y-6 mt-8">
 <Skeleton className="h-4 w-full" />
 <div className="flex gap-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-24" /></div>
      </div>
    ) : !economy ? null : (
 <div className="mt-8 space-y-6">
 <div className="flex h-6 rounded-full overflow-hidden bg-elevated">
 <div className="flex-1 bg-success transition-all" title="Available" />
 <div className="flex-1 bg-warning transition-all" title="Locked" />
 <div className="flex-1 bg-primary transition-all" title="Settled" />
        </div>
 <div className="grid grid-cols-3 gap-4">
          <LegendItem label="Available" value={money(economy.availableCapital)} color="bg-success" />
          <LegendItem label="Locked" value={money(economy.lockedCapital)} color="bg-warning" />
          <LegendItem label="Settled" value={money(economy.settledCapital)} color="bg-primary" />
        </div>
      </div>
    )}
  </Panel>
);

const LegendItem = ({ label, value, color }: { label: string; value: string; color: string }) => (
 <div className="flex items-center justify-between p-3 bg-elevated rounded-card">
 <div className="flex items-center gap-2">
 <div className={`w-3 h-3 rounded-6 ${color}`} />
 <span className="text-small text-text-muted">{label}</span>
    </div>
 <span className="text-small font-semibold text-text-main">{value}</span>
  </div>
);

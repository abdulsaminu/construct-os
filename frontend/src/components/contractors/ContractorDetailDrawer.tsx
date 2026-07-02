import React from 'react';
import { Contractor } from '../../types';
import { Drawer } from '../ui/Drawer';
import { CopyButton } from '../ui/CopyButton';
import { User, Wallet, Calendar } from 'lucide-react';

interface Props {
  contractor: Contractor | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContractorDetailDrawer: React.FC<Props> = ({ contractor, isOpen, onClose }) => {
  if (!contractor) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Contractor Details">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-elevated rounded-12">
          <div className="p-3 bg-surface rounded-12 text-primary"><User size={24} /></div>
          <div>
            <h3 className="text-body-lg font-bold text-text-main">{contractor.name}</h3>
            <p className="text-small text-success font-medium">Active</p>
          </div>
        </div>

        <div className="space-y-4">
          <DetailRow icon={<Wallet size={16} />} label="Payout Wallet" value={contractor.payoutAddress} isMono copyable />
          <DetailRow icon={<Calendar size={16} />} label="Registered" value={new Date(contractor.registeredAt).toLocaleString()} />
        </div>

        <div className="border-t border-border-main pt-6">
          <h4 className="text-small font-semibold text-text-main mb-4 uppercase tracking-wide">Assigned Projects</h4>
          <p className="text-small text-text-dim bg-elevated p-4 rounded-12 text-center">Backend project mapping required.</p>
        </div>
      </div>
    </Drawer>
  );
};

const DetailRow = ({ icon, label, value, isMono, copyable }: any) => (
  <div className="flex items-start gap-3">
    <div className="text-text-dim mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-caption text-text-dim uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        <p className={`text-small text-text-main break-all ${isMono ? 'font-mono' : ''}`}>{value}</p>
        {copyable && <CopyButton text={value} />}
      </div>
    </div>
  </div>
);

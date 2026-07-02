import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { poster } from '../../lib/api';
import { AlertCircle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterDrawer: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ companyName: '', contactName: '', email: '', phone: '', payoutAddress: '', notes: '' });

  const handleClose = () => {
    if (!isSubmitting) {
      setForm({ companyName: '', contactName: '', email: '', phone: '', payoutAddress: '', notes: '' });
      setError('');
      onClose();
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.companyName.trim()) { setError("Company name is required."); return; }
    if (!form.payoutAddress.trim()) { setError("Payout address is required."); return; }

    setIsSubmitting(true);
    try {
      // Strictly submit ONLY what the backend requires
      const res = await poster('/contractors', { 
        name: form.companyName, 
        payoutAddress: form.payoutAddress 
      });
      
      if (res.error) {
        setError(res.error);
      } else {
        handleClose();
        onSuccess();
      }
    } catch (err) {
      setError("Registration failed. API timeout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Register Contractor" width="w-[480px]">
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 text-danger text-sm bg-danger/10 p-3 rounded-lg">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-text-main mb-4 uppercase tracking-wide">Identity</h4>
          <div className="space-y-4">
            <InputField label="Company Name *" value={form.companyName} onChange={v => setForm({...form, companyName: v})} placeholder="e.g. Arc Builders" required />
            <InputField label="Contact Name" value={form.contactName} onChange={v => setForm({...form, contactName: v})} placeholder="John Doe" />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Email" value={form.email} onChange={v => setForm({...form, email: v})} placeholder="john@arc.com" type="email" />
              <InputField label="Phone" value={form.phone} onChange={v => setForm({...form, phone: v})} placeholder="+1 555 0199" />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-2">Notes</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="w-full bg-elevated border border-border-main rounded-xl p-3 text-sm text-text-main outline-none focus:border-primary resize-none" placeholder="Internal notes..." />
            </div>
          </div>
        </div>

        <div className="border-t border-border-main pt-6">
          <h4 className="text-sm font-semibold text-text-main mb-4 uppercase tracking-wide">Wallet</h4>
          <InputField label="Payout Address *" value={form.payoutAddress} onChange={v => setForm({...form, payoutAddress: v})} placeholder="0x4f8e..." isMono />
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-hover text-white p-3.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Registering...' : 'Register Contractor'}
        </button>
      </div>
    </Drawer>
  );
};

const InputField = ({ label, value, onChange, placeholder, required, type = 'text', isMono = false }: any) => (
  <div>
    <label className="block text-sm text-text-muted mb-2">{label}</label>
    <input 
      type={type}
      required={required}
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder} 
      className={`w-full bg-elevated border border-border-main rounded-xl p-3 text-sm text-text-main outline-none focus:border-primary transition-colors ${isMono ? 'font-mono' : ''}`}
    />
  </div>
);

import React, { useEffect, useState } from 'react';
import { fetcher, poster } from '../lib/api';
import { Contractor } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { Select } from '../components/ui/Select';
import { money } from '../lib/api';
import { ArrowLeft, Plus, Trash2, FileCheck, Calendar } from 'lucide-react';

interface Props {
  onBack: () => void;
  onCreated: (id: string) => void;
}

interface MilestoneForm {
  id: string;
  name: string;
  budget: string;
  payeeId: string;
}

export const NewProjectPage: React.FC<Props> = ({ onBack, onCreated }) => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [plannedStart, setPlannedStart] = useState('');
  const [plannedFinish, setPlannedFinish] = useState('');
  const [milestones, setMilestones] = useState<MilestoneForm[]>([{ id: crypto.randomUUID(), name: '', budget: '', payeeId: '' }]);

  useEffect(() => {
    fetcher<Contractor[]>('/contractors').then(setContractors);
  }, []);

  const contractorOptions = contractors.map(c => ({
    value: c.id,
    label: c.name,
    subLabel: `${c.payoutAddress.slice(0, 6)}...${c.payoutAddress.slice(-4)}`
  }));

  const updateMilestone = (id: string, field: keyof MilestoneForm, value: string) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addMilestone = () => setMilestones([...milestones, { id: crypto.randomUUID(), name: '', budget: '', payeeId: '' }]);
  const removeMilestone = (id: string) => setMilestones(milestones.filter(m => m.id !== id));

  const handleSubmit = async () => {
    setError('');
    if (!name || !totalBudget) { setError("Project name and budget are required."); setStep(1); return; }
    if (milestones.some(m => !m.name || !m.budget)) { setError("All milestones require a name and budget."); setStep(2); return; }

    // Validate dates if provided
    let plannedStartDate: number | undefined;
    let plannedFinishDate: number | undefined;
    
    if (plannedStart) {
      plannedStartDate = new Date(plannedStart).getTime();
      if (isNaN(plannedStartDate)) { setError("Invalid start date format."); setStep(1); return; }
    }
    if (plannedFinish) {
      plannedFinishDate = new Date(plannedFinish).getTime();
      if (isNaN(plannedFinishDate)) { setError("Invalid finish date format."); setStep(1); return; }
    }
    if (plannedStartDate && plannedFinishDate && plannedFinishDate <= plannedStartDate) {
      setError("Finish date must be after start date.");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    const res = await poster<{ error?: string; id?: string }>('/projects', {
      name,
      totalBudget,
      plannedStartDate,
      plannedFinishDate,
      milestones: milestones.map(m => ({ name: m.name, budget: m.budget, payeeId: m.payeeId }))
    });

    setIsSubmitting(false);
    if (res.error) {
      setError(res.error);
      setStep(3);
    } else {
      onCreated(res.id!);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Default dates: start = today, finish = 60 days from now
  const defaultStart = formatDateForInput(new Date());
  const defaultFinish = formatDateForInput(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000));

  return (
    <div>
      <PageHeader title="New Project" action={
        <button onClick={onBack} className="text-text-muted hover:text-text-main flex items-center gap-2 text-small font-medium transition-colors">
          <ArrowLeft size={20} /> Back to Portfolio
        </button>
      } />

      {error && <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-card mb-6 text-small" role="alert">{error}</div>}

      {/* Stepper */}
      <div className="flex items-center gap-4 mb-8 px-4">
        {['Project Info', 'Milestones', 'Review & Create'].map((s, i) => (
          <React.Fragment key={s}>
            <button onClick={() => setStep(i + 1)} className={`text-small font-medium transition-colors ${step === i + 1 ? 'text-primary' : 'text-text-dim hover:text-text-muted'}`}>
              {s}
            </button>
            {i < 2 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-primary' : 'bg-border-main'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-surface rounded-card border border-border-main p-8 max-w-3xl">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="project-name" className="block text-small text-text-muted mb-2">Project Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-elevated border border-border-main rounded-input p-3 text-text-main outline-none focus:border-primary" id="project-name" aria-required="true" placeholder="e.g. Skyline Tower" />
            </div>
            <div>
              <label className="block text-small text-text-muted mb-2">Total Budget (USD)</label>
              <input value={totalBudget} onChange={e => setTotalBudget(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-elevated border border-border-main rounded-input p-3 text-text-main outline-none focus:border-primary font-mono" id="total-budget" aria-required="true" placeholder="e.g. 500000" />
            </div>
            
            {/* Planned Schedule */}
            <div className="border-t border-border-main pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-primary" />
                <label className="text-small font-medium text-text-main">Planned Schedule (Optional)</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="planned-start" className="block text-caption text-text-dim mb-1">Start Date</label>
                  <input
                    type="date"
                    value={plannedStart || defaultStart}
                    onChange={e => setPlannedStart(e.target.value)}
                    className="w-full bg-elevated border border-border-main rounded-input p-3 text-small text-text-main outline-none focus:border-primary"
                    id="planned-start"
                  />
                </div>
                <div>
                  <label htmlFor="planned-finish" className="block text-caption text-text-dim mb-1">Finish Date</label>
                  <input
                    type="date"
                    value={plannedFinish || defaultFinish}
                    onChange={e => setPlannedFinish(e.target.value)}
                    className="w-full bg-elevated border border-border-main rounded-input p-3 text-small text-text-main outline-none focus:border-primary"
                    id="planned-finish"
                  />
                </div>
              </div>
            </div>

            <button onClick={() => setStep(2)} className="btn-primary">Next: Milestones</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-h2 text-text-main">Milestones</h3>
              <button onClick={addMilestone} className="text-small text-primary hover:text-primary-hover font-medium flex items-center gap-1"><Plus size={16} /> Add</button>
            </div>

            {milestones.map((m, idx) => (
              <div key={m.id} className="p-4 bg-elevated rounded-card border border-border-main space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-text-dim text-small font-bold w-6">{idx + 1}.</span>
                  <input value={m.name} onChange={e => updateMilestone(m.id, 'name', e.target.value)} className="flex-1 bg-surface border border-border-main rounded-input p-3 text-small text-text-main outline-none focus:border-primary" aria-label="Milestone name" placeholder="Phase name" />
                  <button onClick={() => removeMilestone(m.id)} className="p-3 text-text-dim hover:text-danger transition-colors"><Trash2 size={16} /></button>
                </div>
                <div className="flex gap-3 pl-9">
                  <input value={m.budget} onChange={e => updateMilestone(m.id, 'budget', e.target.value.replace(/[^0-9]/g, ''))} className="w-full sm:w-40 bg-surface border border-border-main rounded-input p-3 text-small text-text-main outline-none focus:border-primary font-mono" aria-label="Milestone budget" placeholder="Budget" />
                  <div className="flex-1">
                    <Select options={contractorOptions} value={m.payeeId} onChange={val => updateMilestone(m.id, 'payeeId', val)} placeholder="Assign Contractor" />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
              <button onClick={() => setStep(3)} className="btn-primary">Review</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-success mb-4"><FileCheck size={20} /> <h3 className="text-h3">Review Project</h3></div>
            <div className="bg-elevated rounded-card p-4 space-y-2 text-small">
              <div className="flex justify-between"><span className="text-text-dim">Name</span><span className="font-medium text-text-main">{name}</span></div>
              <div className="flex justify-between"><span className="text-text-dim">Budget</span><span className="font-medium text-text-main">{money(totalBudget)}</span></div>
              <div className="flex justify-between"><span className="text-text-dim">Milestones</span><span className="font-medium text-text-main">{milestones.length} phases</span></div>
              {plannedStart && <div className="flex justify-between"><span className="text-text-dim">Start Date</span><span className="font-medium text-text-main">{plannedStart}</span></div>}
              {plannedFinish && <div className="flex justify-between"><span className="text-text-dim">Finish Date</span><span className="font-medium text-text-main">{plannedFinish}</span></div>}
            </div>
            <div className="bg-elevated rounded-card p-4 max-h-48 overflow-y-auto space-y-2">
              {milestones.map((m, i) => (
                <div key={m.id} className="flex justify-between text-small">
                  <span className="text-text-main">{i+1}. {m.name}</span>
                  <span className="text-text-muted font-mono">{money(m.budget)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(2)} className="btn-ghost">Back</button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

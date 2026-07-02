import { useEffect, useState } from 'react';
import { fetcher, poster } from '../api';

export default function ProjectsPage({ onSelect }: { onSelect: (id: string) => void }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  
  // Form state now holds an array of milestones
  const [projectName, setProjectName] = useState('');
  const [milestones, setMilestones] = useState([
    { name: 'Foundation', budget: '' },
    { name: 'First Floor', budget: '' },
    { name: 'Second Floor', budget: '' },
    { name: 'Finishing', budget: '' }
  ]);

  const load = async () => { 
    setProjects(await fetcher('/projects')); 
    setContractors(await fetcher('/contractors')); 
  };
  
  useEffect(() => { load(); }, []);

  // Dynamically calculate total budget based on milestones
  const totalBudget = milestones.reduce((sum, m) => sum + (parseInt(m.budget) || 0), 0);
  const money = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const updateMilestone = (index: number, field: string, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestones(newMilestones);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { name: '', budget: '' }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!projectName) { setError("Project name is required."); return; }
    if (milestones.some(m => !m.name || !m.budget)) { setError("All milestones require a name and budget."); return; }
    if (!contractors[0]) { setError("Please register a contractor first."); return; }

    // Send dynamically generated array to backend
    const res = await poster('/projects', { 
      name: projectName, 
      totalBudget: totalBudget.toString(), 
      milestones: milestones.map(m => ({ name: m.name, budget: m.budget, payeeId: contractors[0].id })) 
    });

    if (res.error) {
      setError(res.error);
    } else {
      // Reset form
      setProjectName('');
      setMilestones([{ name: '', budget: '' }]);
      setShowForm(false);
      load();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button onClick={() => { setShowForm(!showForm); setError(''); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium">
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-800 p-6 rounded mb-6 border border-slate-700">
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-1">Project Name</label>
            <input required placeholder="e.g. Skyline Tower" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
          </div>

          <div className="border-t border-slate-700 pt-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-semibold text-slate-300">Milestones</h3>
              <button type="button" onClick={addMilestone} className="text-sm text-blue-400 hover:text-blue-300">+ Add Phase</button>
            </div>
            
            <div className="space-y-2">
              {milestones.map((m, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-xs text-slate-500 w-6">{index + 1}.</span>
                  <input 
                    required 
                    placeholder="Phase name" 
                    value={m.name} 
                    onChange={e => updateMilestone(index, 'name', e.target.value)} 
                    className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm" 
                  />
                  <input 
                    required 
                    placeholder="Budget" 
                    type="number"
                    value={m.budget} 
                    onChange={e => updateMilestone(index, 'budget', e.target.value.replace(/[^0-9]/g, ''))} 
                    className="w-40 bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm" 
                  />
                  <button type="button" onClick={() => removeMilestone(index)} className="text-slate-500 hover:text-red-400 text-lg font-bold px-2">×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded flex justify-between items-center">
            <span className="text-slate-400 font-medium">Auto-Calculated Total Budget:</span>
            <span className="text-2xl font-bold text-green-400">{money(totalBudget)}</span>
          </div>

          <button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white p-3 rounded font-bold text-lg transition">
            Create Project
          </button>
        </form>
      )}
      
      <div className="grid gap-4">
        {projects.map(p => (
          <div key={p.id} onClick={() => onSelect(p.id)} className="bg-slate-800 p-4 rounded border border-slate-700 flex justify-between items-center cursor-pointer hover:border-blue-500 transition">
            <div>
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="text-sm text-slate-400">{p.milestones.length} Phases • Budget: {new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(parseInt(p.totalBudget))}</p>
            </div>
            <span className={`px-3 py-1 rounded text-sm font-bold ${p.status === 'completed' ? 'bg-green-900 text-green-300' : p.status === 'active' ? 'bg-blue-900 text-blue-300' : 'bg-slate-700 text-slate-300'}`}>{p.status.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

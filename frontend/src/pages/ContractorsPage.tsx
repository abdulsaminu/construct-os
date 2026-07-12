import React, { useEffect, useState } from 'react';
import { fetcher } from '../lib/api';
import { Contractor } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { RegisterDrawer } from '../components/contractors/RegisterDrawer';
import { ContractorTable } from '../components/contractors/ContractorTable';
import { ContractorDetailDrawer } from '../components/contractors/ContractorDetailDrawer';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { UserPlus, Users } from 'lucide-react';

export const ContractorsPage = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      setContractors(await fetcher<Contractor[]>('/contractors'));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContractorUpdate = async () => {
    setIsLoading(true);
    try {
      const fresh = await fetcher<Contractor[]>('/contractors');
      setContractors(fresh);
      setSelectedContractor(prev => (prev ? fresh.find(c => c.id === prev.id) || null : null));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div>
      <PageHeader
        title="Contractors"
        icon={Users}
        action={
          <button onClick={() => setIsRegisterOpen(true)} className="btn-primary">
            <UserPlus size={16} /> Register Contractor
          </button>
        }
      />
      {isLoading ? (
        <div className="bg-surface rounded-card border border-border-main p-6">
          <TableSkeleton rows={5} />
        </div>
      ) : contractors.length === 0 ? (
        <EmptyState icon={UserPlus} title="No Contractors" description="Register your first contractor to assign payouts." />
      ) : (
        <div className="bg-surface rounded-card border border-border-main p-6">
          <ContractorTable contractors={contractors} onSelect={setSelectedContractor} />
        </div>
      )}
      <RegisterDrawer isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onSuccess={loadData} />
      <ContractorDetailDrawer
        isOpen={!!selectedContractor}
        contractor={selectedContractor}
        onClose={() => setSelectedContractor(null)}
        onUpdate={handleContractorUpdate}
      />
    </div>
  );
};

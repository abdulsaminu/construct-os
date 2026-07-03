import React, { useEffect, useState, useMemo } from 'react';
import { fetcher } from '../lib/api';
import { Project, LedgerEntry } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { LedgerToolbar } from '../components/ledger/LedgerToolbar';
import { LedgerTable } from '../components/ledger/LedgerTable';
import { LedgerTimeline } from '../components/ledger/LedgerTimeline';
import { EventDetailDrawer } from '../components/ledger/EventDetailDrawer';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ScrollText } from 'lucide-react';

export const LedgerPage = () => {
  const [entries, setEntries] = useState<(LedgerEntry & { projectName?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

  useEffect(() => {
    const loadGlobalLedger = async () => {
      setIsLoading(true);
      try {
        const projects = await fetcher<Project[]>('/projects');
        const allEntries = await Promise.all(
          projects.map(async (p) => {
            try {
              const ledger = await fetcher<LedgerEntry[]>(`/projects/${p.id}/ledger`);
              return ledger.map(e => ({ ...e, projectName: p.name }));
            } catch { return []; }
          })
        );
        // System deposits aren't tied to projects, but we handle what we can
        setEntries(allEntries.flat().sort((a, b) => b.timestamp - a.timestamp));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadGlobalLedger();
  }, []);

  const handleExport = () => {
    const headers = ["Status,Timestamp,Project,Event,Amount,TX Hash,Block"];
    const rows = filteredEntries.map(e => [
      e.metadata?.txHash ? "Confirmed" : "Local",
      new Date(e.timestamp).toISOString(),
      e.projectName || 'System',
      e.type,
      e.amount,
      e.metadata?.txHash || '',
      e.metadata?.blockNumber || ''
    ].join(","));
    
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "constructos-ledger.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchSearch = !search || 
        e.type.toLowerCase().includes(search.toLowerCase()) || 
        (e.metadata?.txHash && e.metadata.txHash.toLowerCase().includes(search.toLowerCase())) ||
        (e.projectName && e.projectName.toLowerCase().includes(search.toLowerCase()));
      
      const matchEvent = eventFilter === 'all' || e.type === eventFilter;
      return matchSearch && matchEvent;
    });
  }, [entries, search, eventFilter]);

  return (
    <div>
      <PageHeader title="Global Ledger" icon={ScrollText} />
      
      <LedgerToolbar 
        search={search} onSearchChange={setSearch}
        eventFilter={eventFilter} onEventFilterChange={setEventFilter}
        viewMode={viewMode} onViewModeChange={setViewMode}
        onExport={handleExport}
      />

 <div className="bg-surface rounded-card border border-border-main p-6 min-h-[400px]">
        {isLoading ? (
          <TableSkeleton rows={12} />
        ) : filteredEntries.length === 0 ? (
          <EmptyState icon={ScrollText} title="No Events Recorded" description="Ledger events will appear automatically." />
        ) : viewMode === 'table' ? (
          <LedgerTable entries={filteredEntries} onSelect={setSelectedEntry} />
        ) : (
          <LedgerTimeline entries={filteredEntries} onSelect={setSelectedEntry} />
        )}
      </div>

      <EventDetailDrawer entry={selectedEntry} isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  );
};

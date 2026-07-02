
import React from "react";
import { Project } from "../../../types";
import { Panel } from "../../ui/Panel";
import { SectionHeader } from "../../ui/SectionHeader";
import { HealthBadge } from "../../ui/HealthBadge";
import { Activity } from "lucide-react";

interface SystemHealthPageProps {
  projects: Project[];
}

export const SystemHealthPage: React.FC<SystemHealthPageProps> = ({ projects }) => {
  const ledgerCount: number = 0;
  const contractorCount: number = 0;

  const services = [
    { name: "API Gateway", status: "Healthy", latency: "12ms" },
    { name: "Ledger", status: "Healthy", latency: "31ms" },
    { "Settlement", status: "Healthy", latency: "N/A" },
    { name: "Risk Engine", status: "Healthy", latency: "120ms" },
    { "Forecast", status: "Healthy", latency: "82ms" },
    { "Storage", status: "Healthy", latency: "5ms" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <Panel>
          <p className="text-text-dim text-xs uppercase tracking-wide mb-4">Ledger Entries</p>
          <p className="text-[36px] font-bold text-text-main">{ledgerCount}</p>
        </Panel>
        <Panel>
          <p className="text-text-dim text-xs uppercase tracking-wide mb-4">Projects</p>
          <p className="text-[36px] font-bold text-text-main">{projects.length}</p>
        </Panel>
        <Panel>
          <p className="text-text-dim text-xs uppercase tracking-wide mb-4">Contractors</p>
          <p className="text-[36px] font-bold text-text-main">{contractorCount}</p>
        </Panel>
      </div>

      <Panel className="col-span-12">
        <SectionHeader title="Engine Activity and Status" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((s: any) => (
            <div key={s.name} className="flex items-center justify-between p-4 bg-elevated rounded-xl border border-border-main">
              <div className="flex items-center gap-3">
                <HealthBadge status={s.status} />
                <span className="text-sm font-medium text-text-main">{s.name}</span>
              </div>
              <span className="text-xs text-text-dim font-mono">{s.latency}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="col-span-12">
        <SectionHeader title="Engine Timeline" />
        <div className="space-y-0 pl-8 border-l-2 border-border-main ml-4">
          <div className="relative py-4 pl-8 -ml-[41px]">
            <div className="absolute -left-[41px] top-4 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Activity size={14} />
            </div>
            <p className="text-sm font-medium text-text-main">System Initialized</p>
            <p className="text-xs text-text-dim mt-1">10 seconds ago</p>
          </div>
        </div>
      </Panel>
    </div>
  );
};


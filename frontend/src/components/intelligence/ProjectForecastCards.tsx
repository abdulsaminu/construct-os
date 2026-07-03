import React, { useState, useEffect } from 'react';
import { Project, ProjectForecast } from '../../types';
import { fetcher } from '../../lib/api';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { CircularGauge } from '../ui/CircularGauge';
import { EmptyState } from '../ui/EmptyState';
import { TrendingUp } from 'lucide-react';

interface Props {
  projects: Project[];
}

export const ProjectForecastCards: React.FC<Props> = ({ projects }) => {
  const activeProjects = projects.filter(p => p.status !== 'completed');
  const [forecasts, setForecasts] = useState<Record<string, ProjectForecast>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeProjects.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const loadForecasts = async () => {
      const results: Record<string, ProjectForecast> = {};
      await Promise.all(
        activeProjects.map(async (p) => {
          try {
            const f = await fetcher<ProjectForecast>(`/projects/${p.id}/forecast`);
            results[p.id] = f;
          } catch {
            results[p.id] = { completionDays: null, confidence: 0, reason: 'Unavailable' };
          }
        })
      );
      setForecasts(results);
      setIsLoading(false);
    };
    loadForecasts();
  }, [activeProjects.map(p => p.id).join(',')]);

  if (isLoading) {
    return (
      <Panel>
        <SectionHeader title="Milestone Completion Forecast" />
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
 <div key={i} className="bg-elevated rounded-card h-32 animate-pulse" />
          ))}
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <SectionHeader title="Milestone Completion Forecast" />
      {activeProjects.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No Active Projects" description="No projects with pending milestones to forecast." />
      ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeProjects.map(p => {
            const f = forecasts[p.id];
            if (!f) return null;
            return (
 <div key={p.id} className="bg-elevated rounded-card border border-border-main p-6">
 <p className="text-small font-semibold text-text-main mb-4">{p.name}</p>
 <div className="flex items-center justify-between">
                  <div>
 <p className="text-text-dim text-label mb-1">Est. Completion</p>
 <p className="text-title font-bold text-text-main tabular-nums">
                      {f.completionDays !== null ? `${f.completionDays}d` : 'N/A'}
                    </p>
                  </div>
                  <CircularGauge value={f.confidence} size={32} stroke={4} />
                </div>
 <p className="text-caption text-text-dim mt-3">{f.reason}</p>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};
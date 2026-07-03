import { useEffect, useState } from 'react';
import { fetcher, money } from '../lib/api';
import { PageHeader } from '../components/layout/PageHeader';
import { TrendingUp } from 'lucide-react';

export const ForecastsPage = () => {
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    fetcher<any>('/system/forecast?horizonDays=30').then(setForecast);
  }, []);

  if (!forecast) return null;

  return (
    <div>
      <PageHeader title="Forecasts" icon={TrendingUp} />
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div className="bg-surface rounded-card border border-border-main p-6 shadow-surface">
 <h3 className="text-h2 text-text-main mb-6 flex items-center gap-2">
 <TrendingUp className="text-primary" size={20} /> 30-Day Cash Flow
          </h3>
 <div className="space-y-3">
            {forecast.cash.days.map((day: number, i: number) => (
 <div key={day} className="flex items-center justify-between p-3 bg-elevated rounded-card">
 <span className="text-text-muted text-small w-20">Day {day}</span>
 <div className="flex-1 mx-4">
 <div className="w-full bg-bg rounded-full h-2 max-w-xs ml-auto">
 <div className="bg-primary h-2 rounded-full" style={{ width: `${(parseInt(forecast.cash.available[i]) / parseInt(forecast.cash.available[0])) * 100}%` }} />
                  </div>
                </div>
 <span className="text-text-main font-semibold w-32 text-right">{money(forecast.cash.available[i])}</span>
              </div>
            ))}
          </div>
        </div>

 <div className="bg-surface rounded-card border border-border-main p-6 shadow-surface">
 <h3 className="text-h2 text-text-main mb-6">Settlement Summary</h3>
 <div className="bg-elevated p-6 rounded-card text-center">
 <p className="text-label text-text-dim mb-2">Total Settled</p>
 <p className="text-display-md font-bold text-success tabular-nums">{money(forecast.settlement.totalSettled)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  time: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface Props {
  items: TimelineItem[];
}

export const Timeline: React.FC<Props> = ({ items }) => (
 <div className="relative pl-8 border-l-2 border-border-main space-y-6 ml-4">
    {items.map((item) => (
 <div key={item.id} className="relative animate-in fade-in duration-normal">
 <div className={`absolute -left-[41px] w-8 h-8 rounded-full flex items-center justify-center ${item.iconBg}`}>
          {item.icon}
        </div>
        <div>
 <p className="text-small font-medium text-text-main">{item.title}</p>
 {item.subtitle && <p className="text-caption text-text-dim mt-1">{item.subtitle}</p>}
 <p className="text-caption text-text-dim mt-1">{item.time}</p>
        </div>
      </div>
    ))}
  </div>
);

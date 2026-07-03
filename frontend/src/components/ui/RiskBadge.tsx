import React from 'react';

interface Props {
  score: number;
}

export const RiskBadge: React.FC<Props> = ({ score }) => {
  let text: string;
  let styles: string;

  if (score <= 30) {
    text = 'Low';
    styles = 'bg-success/20 text-success';
  } else if (score <= 60) {
    text = 'Medium';
    styles = 'bg-primary/20 text-primary';
  } else if (score <= 80) {
    text = 'High';
    styles = 'bg-warning/20 text-warning';
  } else {
    text = 'Critical';
    styles = 'bg-danger/20 text-danger';
  }

 return <span className={`px-3 py-1 rounded-badge text-caption font-bold ${styles}`}>{text}</span>;
};
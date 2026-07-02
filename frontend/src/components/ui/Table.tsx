import React from 'react';

interface Column {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (row: Record<string, any>) => React.ReactNode;
}

interface Props {
  columns: Column[];
  data: Record<string, any>[];
  emptyMessage?: string;
}

export const Table: React.FC<Props> = ({ columns, data, emptyMessage = "No data available." }) => {
  if (data.length === 0) {
    return <p className="text-sm text-text-dim text-center py-8">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-main text-text-dim text-xs uppercase tracking-wider">
            {columns.map((col) => (
              <th key={col.key} className={`pb-3 font-medium ${col.align === 'right' ? 'text-right' : ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-main/50">
          {data.map((row, idx) => (
            <tr key={idx} className="animate-in fade-in duration-200">
              {columns.map((col) => (
                <td key={col.key} className={`py-3 text-sm ${col.align === 'right' ? 'text-right' : 'text-text-main'}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

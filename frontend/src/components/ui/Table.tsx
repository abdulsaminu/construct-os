import React, { memo } from 'react';

interface Column {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (row: any) => React.ReactNode;
}

interface Props {
  columns: Column[];
  data: Record<string, any>[];
  emptyMessage?: string;
}

export const Table = memo<Props>(({ columns, data, emptyMessage = "No data available." }) => {
  if (data.length === 0) {
    return <p className="text-small text-text-dim text-center py-8">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" role="table">
        <thead>
          <tr className="border-b border-border-main text-text-dim text-caption uppercase tracking-wider">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`pb-3 font-medium ${col.align === 'right' ? 'text-right' : ''}`}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-main/50">
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="table-row hover:bg-elevated/50 transition-colors duration-fast ease-out"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 text-small ${col.align === 'right' ? 'text-right tabular-nums' : 'text-text-main'}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
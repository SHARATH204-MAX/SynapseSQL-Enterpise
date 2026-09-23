import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Download } from 'lucide-react';
import { QueryDataResult } from '../../types';

interface DataTableViewProps {
  data: QueryDataResult;
  onExport?: (format: 'csv' | 'excel' | 'json') => void;
}

export const DataTableView: React.FC<DataTableViewProps> = ({ data, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredAndSortedRows = useMemo(() => {
    let result = [...data.rows];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(row =>
        row.some(cell => String(cell).toLowerCase().includes(term))
      );
    }

    // Sort
    if (sortCol !== null) {
      result.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [data.rows, searchTerm, sortCol, sortAsc]);

  const totalPages = Math.ceil(filteredAndSortedRows.length / pageSize) || 1;
  const paginatedRows = filteredAndSortedRows.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (colIdx: number) => {
    if (sortCol === colIdx) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colIdx);
      setSortAsc(true);
    }
  };

  return (
    <div style={{
      marginTop: '14px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(15, 23, 42, 0.7)',
      overflow: 'hidden'
    }}>
      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(30, 41, 59, 0.5)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#f8fafc',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Showing {filteredAndSortedRows.length} rows
          </span>
          {onExport && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => onExport('csv')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
              >
                <Download size={11} /> CSV
              </button>
              <button
                onClick={() => onExport('excel')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  cursor: 'pointer'
                }}
              >
                <Download size={11} /> Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {data.columns.map((col, idx) => (
                <th
                  key={col}
                  onClick={() => handleSort(idx)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{col}</span>
                    {sortCol === idx ? (
                      sortAsc ? <ChevronUp size={13} style={{ color: '#38bdf8' }} /> : <ChevronDown size={13} style={{ color: '#38bdf8' }} />
                    ) : (
                      <ChevronDown size={13} style={{ color: '#475569', opacity: 0.5 }} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>
                      {cell === null || cell === undefined ? (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>null</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={data.columns.length} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: 'rgba(30, 41, 59, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{
                padding: '3px 10px',
                fontSize: '0.75rem',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: page === 1 ? '#475569' : '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{
                padding: '3px 10px',
                fontSize: '0.75rem',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: page === totalPages ? '#475569' : '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

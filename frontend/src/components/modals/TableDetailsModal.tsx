import React from 'react';
import { TableSchema } from '../../types';
import { Table, X, Key, Columns, Link, Database } from 'lucide-react';

interface TableDetailsModalProps {
  table: TableSchema | null;
  onClose: () => void;
  onQueryTable: (tableName: string) => void;
}

export const TableDetailsModal: React.FC<TableDetailsModalProps> = ({
  table,
  onClose,
  onQueryTable
}) => {
  if (!table) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '85vh',
        background: '#111622',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'rgba(30, 41, 59, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Table size={20} style={{ color: '#38bdf8' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Table: {table.name}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {table.rowCount} total rows • {table.columns.length} columns
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                onQueryTable(table.name);
                onClose();
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Ask AI about this table
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Columns Section */}
          <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
            Columns & Data Types
          </h4>
          <div style={{
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Column Name</th>
                  <th>Type</th>
                  <th>Primary Key</th>
                  <th>Nullable</th>
                </tr>
              </thead>
              <tbody>
                {table.columns.map((c) => (
                  <tr key={c.name}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {c.primaryKey ? <Key size={12} style={{ color: '#f59e0b' }} /> : <Columns size={12} style={{ color: '#64748b' }} />}
                        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.78rem' }}>{c.type}</td>
                    <td>{c.primaryKey ? 'Yes' : 'No'}</td>
                    <td>{c.nullable !== false ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Foreign Keys if any */}
          {table.foreignKeys && table.foreignKeys.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
                Foreign Key Relations
              </h4>
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {table.foreignKeys.map((fk, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                    <Link size={13} style={{ color: '#a855f7' }} />
                    <span>{fk.constrained_columns?.join(', ')}</span>
                    <span style={{ color: '#64748b' }}>➔ references ➔</span>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{fk.referred_table} ({fk.referred_columns?.join(', ')})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Data Rows */}
          {table.sampleData && table.sampleData.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
                Sample Preview (First 5 Rows)
              </h4>
              <div style={{
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflowX: 'auto'
              }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {Object.keys(table.sampleData[0]).map((k) => (
                        <th key={k}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.sampleData.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {Object.values(row).map((v, cIdx) => (
                          <td key={cIdx}>{v !== null && v !== undefined ? String(v) : 'null'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

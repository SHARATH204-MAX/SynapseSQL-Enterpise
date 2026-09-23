import { DatabaseConfig, SchemaResponse, QueryDataResult } from '../types';

const BASE_URL = '/api';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('synapsesql_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  async getModels(apiKey?: string): Promise<string[]> {
    const url = apiKey ? `${BASE_URL}/chat/models?api_key=${encodeURIComponent(apiKey)}` : `${BASE_URL}/chat/models`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load models');
    const data = await res.json();
    return data.models || [];
  },

  async getSchema(config: DatabaseConfig): Promise<SchemaResponse> {
    const res = await fetch(`${BASE_URL}/database/schema`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(config)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Schema error' }));
      throw new Error(err.detail || 'Failed to inspect schema');
    }
    return res.json();
  },

  async testConnection(config: DatabaseConfig): Promise<{ status: string; tablesCount?: number; message?: string }> {
    const res = await fetch(`${BASE_URL}/database/test-connection`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(config)
    });
    return res.json();
  },

  async executeQuery(query: string, config: DatabaseConfig, readOnly: boolean = true): Promise<QueryDataResult> {
    const res = await fetch(`${BASE_URL}/database/execute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, db_config: config, read_only: readOnly })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Execution error' }));
      throw new Error(err.detail || 'Query execution failed');
    }
    return res.json();
  },

  async exportData(format: 'csv' | 'excel' | 'json', columns: string[], rows: any[][], filename: string = 'query_results'): Promise<void> {
    const res = await fetch(`${BASE_URL}/export/${format}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ columns, rows, filename })
    });
    if (!res.ok) throw new Error(`Export to ${format} failed`);
    
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${filename}.${format === 'excel' ? 'xlsx' : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
};


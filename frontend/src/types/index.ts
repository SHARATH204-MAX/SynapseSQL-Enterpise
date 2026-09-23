export type DatabaseType = 'sqlite' | 'mysql' | 'mongodb';

export interface DatabaseConfig {
  type: DatabaseType;
  sqlite_path?: string;
  mysql_host?: string;
  mysql_user?: string;
  mysql_password?: string;
  mysql_db?: string;
  mongo_uri?: string;
  mongo_db_name?: string;
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable?: boolean;
  primaryKey?: boolean;
}

export interface ForeignKeySchema {
  constrained_columns?: string[];
  referred_table?: string;
  referred_columns?: string[];
}

export interface TableSchema {
  name: string;
  rowCount: number;
  columns: ColumnSchema[];
  foreignKeys?: ForeignKeySchema[];
  sampleData?: Record<string, any>[];
}

export interface SchemaResponse {
  type: DatabaseType;
  database: string;
  tables: TableSchema[];
}

export interface QueryDataResult {
  columns: string[];
  rows: any[][];
}

export interface ThoughtStep {
  tool?: string;
  input?: string;
  thought?: string;
  output?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sql?: string;
  data?: QueryDataResult;
  thoughts?: ThoughtStep[];
  model?: string;
  executionTimeMs?: number;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
  dbConfig: DatabaseConfig;
}

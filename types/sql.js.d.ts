declare module "sql.js" {
  export interface BindParams {}
  export class Database {
    constructor(data?: ArrayBuffer | Uint8Array);
    run(sql: string, params?: BindParams | unknown[]): void;
    exec(sql: string): { columns: string[]; values: unknown[][] }[];
    prepare(sql: string): Statement;
    getRowsModified(): number;
    export(): Uint8Array;
    close(): void;
  }
  export interface Statement {
    bind(values?: BindParams | unknown[]): void;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): void;
  }
  export default function initSqlJs(config?: { locateFile?: (file: string) => string }): Promise<{
    Database: new (data?: ArrayBuffer | Uint8Array) => Database;
  }>;
}

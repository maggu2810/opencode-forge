import { Database } from 'bun:sqlite';
interface Migration {
    id: string;
    description: string;
    apply: (db: Database) => void;
}
export declare const migrations: Migration[];
export {};
//# sourceMappingURL=index.d.ts.map
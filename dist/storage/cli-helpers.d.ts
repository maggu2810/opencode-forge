import type { Database } from 'bun:sqlite';
import type { LoopRow } from './repos/loops-repo';
import { type LoopState } from '../services/loop';
export interface LoopStateEntry {
    state: LoopState;
    row: {
        project_id: string;
        loop_name: string;
    };
}
export declare function listLoopStatesFromDb(db: Database, projectId: string | undefined, options?: {
    statuses?: LoopRow['status'][];
    activeOnly?: boolean;
}): LoopStateEntry[];
//# sourceMappingURL=cli-helpers.d.ts.map
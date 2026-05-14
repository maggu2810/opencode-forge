import type { Database } from 'bun:sqlite';
export interface ReviewFindingRow {
    projectId: string;
    file: string;
    line: number;
    severity: 'bug' | 'warning';
    description: string;
    scenario: string | null;
    branch: string | null;
    createdAt: number;
}
export interface WriteFindingResult {
    ok: boolean;
    conflict?: boolean;
}
export interface ReviewFindingsRepo {
    write(row: Omit<ReviewFindingRow, 'createdAt' | 'scenario'> & {
        scenario?: string | null;
    }): WriteFindingResult;
    listAll(projectId: string): ReviewFindingRow[];
    listByBranch(projectId: string, branch: string | null): ReviewFindingRow[];
    listByFile(projectId: string, file: string): ReviewFindingRow[];
    delete(projectId: string, file: string, line: number): boolean;
}
export declare function createReviewFindingsRepo(db: Database): ReviewFindingsRepo;
//# sourceMappingURL=review-findings-repo.d.ts.map
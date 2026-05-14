/**
 * Forge worktree workspace adaptor.
 *
 * This module provides a workspace adaptor that binds forge worktree loops
 * to OpenCode workspaces, enabling TUI switching and workspace-aware session management.
 */
import type { OpencodeClient } from '@opencode-ai/sdk/v2';
import type { WorkspaceInfo, WorkspaceAdaptor } from '@opencode-ai/plugin';
export type { WorkspaceInfo, WorkspaceAdaptor };
/**
 * Workspace type constant for forge worktree workspaces.
 */
export declare const FORGE_WORKTREE_WORKSPACE_TYPE = "forge-worktree";
/**
 * Extra payload shape for forge worktree workspace info.
 */
export interface ForgeWorktreeExtra {
    loopName: string;
    directory: string;
    branch?: string | null;
}
/**
 * Creates a forge worktree workspace adaptor.
 *
 * This adaptor:
 * - configure(): Normalizes loop metadata from extra into workspace fields
 * - create(): No-op for already-created forge worktrees
 * - remove(): No-op to prevent implicit deletion during view/switch
 * - target(): Returns local directory target
 *
 * @returns WorkspaceAdaptor compatible with experimental_workspace.register
 */
export declare function createForgeWorktreeAdaptor(): WorkspaceAdaptor;
/**
 * Creates a workspace for a loop session.
 *
 * For forge worktrees, this creates a workspace record with the forge-worktree type
 * and the directory as the workspace ID. The workspace database entry is created
 * by calling the upstream workspace.create API.
 *
 * @param client - OpenCode v2 client
 * @param options - Workspace creation options
 * @returns Promise resolving to workspace ID or null on failure
 */
export declare function createLoopWorkspace(client: OpencodeClient, options: {
    loopName: string;
    directory: string;
    branch?: string | null;
}): Promise<{
    workspaceId: string;
} | null>;
/**
 * Binds a session to a workspace by calling the session restore API.
 *
 * This calls the upstream experimental.workspace.sessionRestore endpoint to
 * replay the session's sync events into the target workspace, making the
 * session workspace-scoped.
 *
 * @param client - OpenCode v2 client
 * @param workspaceId - The workspace ID
 * @param sessionId - The session ID
 */
export declare function bindSessionToWorkspace(client: OpencodeClient, workspaceId: string, sessionId: string): Promise<void>;
//# sourceMappingURL=forge-worktree.d.ts.map
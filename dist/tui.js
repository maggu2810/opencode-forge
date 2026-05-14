import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// src/storage/sqlite-open.ts
var init_sqlite_open = () => {};

// src/storage/migrations/index.ts
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename2, __dirname2;
var init_migrations = __esm(() => {
  __filename2 = fileURLToPath(import.meta.url);
  __dirname2 = dirname(__filename2);
});
// src/storage/database.ts
import { mkdirSync, existsSync } from "fs";
import { homedir, platform } from "os";
import { join } from "path";
function resolveDataDir() {
  const defaultBase = join(homedir(), platform() === "win32" ? "AppData" : ".local", "share");
  const xdgDataHome = process.env["XDG_DATA_HOME"] || defaultBase;
  const forgeDir = join(xdgDataHome, "opencode", "forge");
  const legacyGraphDir = join(xdgDataHome, "opencode", "graph");
  return existsSync(legacyGraphDir) && !existsSync(forgeDir) ? legacyGraphDir : forgeDir;
}
function resolveLogPath() {
  return join(resolveDataDir(), "logs", "forge.log");
}
var DEFAULT_COMPLETED_LOOP_TTL_MS, dbCache;
var init_database = __esm(() => {
  init_sqlite_open();
  init_migrations();
  DEFAULT_COMPLETED_LOOP_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  dbCache = new Map;
});

// src/utils/partial-match.ts
function findPartialMatch(input, items, getFields) {
  const inputLower = input.toLowerCase();
  let exactMatch = null;
  const substringMatches = [];
  for (const item of items) {
    const fields = getFields(item);
    let hasExact = false;
    let hasSubstring = false;
    for (const field of fields) {
      if (field === undefined)
        continue;
      const fieldLower = field.toLowerCase();
      if (fieldLower === inputLower) {
        hasExact = true;
      }
      if (fieldLower.includes(inputLower)) {
        hasSubstring = true;
      }
    }
    if (hasExact) {
      exactMatch = item;
      break;
    }
    if (hasSubstring) {
      substringMatches.push(item);
    }
  }
  if (exactMatch) {
    return { match: exactMatch, candidates: [] };
  }
  if (substringMatches.length === 1) {
    return { match: substringMatches[0], candidates: [] };
  }
  if (substringMatches.length > 1) {
    return { match: null, candidates: substringMatches };
  }
  return { match: null, candidates: [] };
}

// src/storage/repos/loops-repo.ts
function mapRow(row) {
  return {
    projectId: row.project_id,
    loopName: row.loop_name,
    status: row.status,
    currentSessionId: row.current_session_id,
    worktree: row.worktree === 1,
    worktreeDir: row.worktree_dir,
    worktreeBranch: row.worktree_branch,
    projectDir: row.project_dir,
    maxIterations: row.max_iterations,
    iteration: row.iteration,
    auditCount: row.audit_count,
    errorCount: row.error_count,
    phase: row.phase,
    audit: row.audit === 1,
    executionModel: row.execution_model,
    auditorModel: row.auditor_model,
    modelFailed: row.model_failed === 1,
    sandbox: row.sandbox === 1,
    sandboxContainer: row.sandbox_container,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    terminationReason: row.termination_reason,
    completionSummary: row.completion_summary,
    workspaceId: row.workspace_id,
    hostSessionId: row.host_session_id
  };
}
function createLoopsRepo(db) {
  const insertStmt = db.prepare(`
    INSERT INTO loops (
      project_id, loop_name, status, current_session_id, worktree, worktree_dir,
      worktree_branch, project_dir, max_iterations, iteration, audit_count,
      error_count, phase, audit, execution_model, auditor_model,
      model_failed, sandbox, sandbox_container, started_at, completed_at,
      termination_reason, completion_summary, workspace_id, host_session_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const upsertLargeStmt = db.prepare(`
    INSERT INTO loop_large_fields (project_id, loop_name, prompt, last_audit_result)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (project_id, loop_name) DO UPDATE SET
      prompt = excluded.prompt,
      last_audit_result = excluded.last_audit_result
  `);
  const getStmt = db.prepare(`
    SELECT project_id, loop_name, status, current_session_id, worktree, worktree_dir,
           worktree_branch, project_dir, max_iterations, iteration, audit_count,
           error_count, phase, audit, execution_model, auditor_model,
           model_failed, sandbox, sandbox_container, started_at, completed_at,
           termination_reason, completion_summary, workspace_id, host_session_id
    FROM loops
    WHERE project_id = ? AND loop_name = ?
  `);
  const getLargeStmt = db.prepare(`
    SELECT prompt, last_audit_result
    FROM loop_large_fields
    WHERE project_id = ? AND loop_name = ?
  `);
  const getBySessionIdStmt = db.prepare(`
    SELECT project_id, loop_name, status, current_session_id, worktree, worktree_dir,
           worktree_branch, project_dir, max_iterations, iteration, audit_count,
           error_count, phase, audit, execution_model, auditor_model,
           model_failed, sandbox, sandbox_container, started_at, completed_at,
           termination_reason, completion_summary, workspace_id, host_session_id
    FROM loops
    WHERE project_id = ? AND current_session_id = ?
  `);
  const listByStatusBase = `
    SELECT project_id, loop_name, status, current_session_id, worktree, worktree_dir,
           worktree_branch, project_dir, max_iterations, iteration, audit_count,
           error_count, phase, audit, execution_model, auditor_model,
           model_failed, sandbox, sandbox_container, started_at, completed_at,
           termination_reason, completion_summary, workspace_id, host_session_id
    FROM loops
    WHERE project_id = ? AND status IN
  `;
  const updatePhaseStmt = db.prepare(`
    UPDATE loops SET phase = ? WHERE project_id = ? AND loop_name = ?
  `);
  const updateIterationStmt = db.prepare(`
    UPDATE loops SET iteration = ? WHERE project_id = ? AND loop_name = ?
  `);
  const incrementErrorStmt = db.prepare(`
    UPDATE loops SET error_count = error_count + 1
    WHERE project_id = ? AND loop_name = ?
    RETURNING error_count
  `);
  const resetErrorStmt = db.prepare(`
    UPDATE loops SET error_count = 0, model_failed = 0
    WHERE project_id = ? AND loop_name = ?
  `);
  const incrementAuditStmt = db.prepare(`
    UPDATE loops SET audit_count = audit_count + 1
    WHERE project_id = ? AND loop_name = ?
    RETURNING audit_count
  `);
  const setAuditCountStmt = db.prepare(`
    UPDATE loops SET audit_count = ?
    WHERE project_id = ? AND loop_name = ?
  `);
  const setCurrentSessionIdStmt = db.prepare(`
    UPDATE loops SET current_session_id = ?
    WHERE project_id = ? AND loop_name = ?
  `);
  const setWorkspaceIdStmt = db.prepare(`
    UPDATE loops SET workspace_id = ?
    WHERE project_id = ? AND loop_name = ?
  `);
  const setHostSessionIdStmt = db.prepare(`
    UPDATE loops SET host_session_id = ?
    WHERE project_id = ? AND loop_name = ?
  `);
  const clearWorkspaceIdStmt = db.prepare(`
    UPDATE loops SET workspace_id = NULL
    WHERE project_id = ? AND loop_name = ?
  `);
  const setModelFailedStmt = db.prepare(`
    UPDATE loops SET model_failed = ?
    WHERE project_id = ? AND loop_name = ?
  `);
  const setLastAuditResultStmt = db.prepare(`
    UPDATE loop_large_fields SET last_audit_result = ?
    WHERE project_id = ? AND loop_name = ?
  `);
  const setSandboxContainerStmt = db.prepare(`
    UPDATE loops SET sandbox_container = ?
    WHERE project_id = ? AND loop_name = ?
  `);
  const setStatusStmt = db.prepare(`
    UPDATE loops SET status = ?
    WHERE project_id = ? AND loop_name = ?
  `);
  const updatePromptStmt = db.prepare(`
    UPDATE loop_large_fields
    SET prompt = ?
    WHERE project_id = ? AND loop_name = ?
  `);
  const setPhaseAndResetErrorStmt = db.prepare(`
    UPDATE loops SET phase = ?, error_count = 0, model_failed = 0
    WHERE project_id = ? AND loop_name = ?
  `);
  const applyRotationStmt = db.prepare(`
    UPDATE loops SET
      current_session_id = ?,
      iteration = ?,
      phase = COALESCE(?, phase),
      audit_count = COALESCE(?, audit_count)
    WHERE project_id = ? AND loop_name = ?
  `);
  const terminateStmt = db.prepare(`
    UPDATE loops SET
      status = ?,
      completed_at = ?,
      termination_reason = ?,
      completion_summary = ?
    WHERE project_id = ? AND loop_name = ?
  `);
  const deleteStmt = db.prepare(`
    DELETE FROM loops WHERE project_id = ? AND loop_name = ?
  `);
  const deleteLargeStmt = db.prepare(`
    DELETE FROM loop_large_fields WHERE project_id = ? AND loop_name = ?
  `);
  return {
    insert(row, large) {
      const result = insertStmt.run(row.projectId, row.loopName, row.status, row.currentSessionId, row.worktree ? 1 : 0, row.worktreeDir, row.worktreeBranch, row.projectDir, row.maxIterations, row.iteration, row.auditCount, row.errorCount, row.phase, row.audit ? 1 : 0, row.executionModel, row.auditorModel, row.modelFailed ? 1 : 0, row.sandbox ? 1 : 0, row.sandboxContainer, row.startedAt, row.completedAt, row.terminationReason, row.completionSummary, row.workspaceId, row.hostSessionId);
      if (result.changes === 0) {
        return false;
      }
      upsertLargeStmt.run(row.projectId, row.loopName, large.prompt, large.lastAuditResult);
      return true;
    },
    get(projectId, loopName) {
      const row = getStmt.get(projectId, loopName);
      return row ? mapRow(row) : null;
    },
    getLarge(projectId, loopName) {
      const row = getLargeStmt.get(projectId, loopName);
      if (!row)
        return null;
      return {
        prompt: row.prompt,
        lastAuditResult: row.last_audit_result
      };
    },
    getBySessionId(projectId, sessionId) {
      const row = getBySessionIdStmt.get(projectId, sessionId);
      return row ? mapRow(row) : null;
    },
    listByStatus(projectId, statuses) {
      if (statuses.length === 0)
        return [];
      const placeholders = statuses.map(() => "?").join(",");
      const sql = `${listByStatusBase} (${placeholders}) ORDER BY started_at DESC`;
      const stmt = db.prepare(sql);
      const rows = stmt.all(projectId, ...statuses);
      return rows.map(mapRow);
    },
    updatePhase(projectId, loopName, phase) {
      updatePhaseStmt.run(phase, projectId, loopName);
    },
    updateIteration(projectId, loopName, iteration) {
      updateIterationStmt.run(iteration, projectId, loopName);
    },
    incrementError(projectId, loopName) {
      const result = incrementErrorStmt.get(projectId, loopName);
      return result?.error_count ?? 0;
    },
    resetError(projectId, loopName) {
      resetErrorStmt.run(projectId, loopName);
    },
    incrementAudit(projectId, loopName) {
      const result = incrementAuditStmt.get(projectId, loopName);
      return result?.audit_count ?? 0;
    },
    setAuditCount(projectId, loopName, count) {
      setAuditCountStmt.run(count, projectId, loopName);
    },
    setCurrentSessionId(projectId, loopName, sessionId) {
      setCurrentSessionIdStmt.run(sessionId, projectId, loopName);
    },
    setWorkspaceId(projectId, loopName, workspaceId) {
      setWorkspaceIdStmt.run(workspaceId, projectId, loopName);
    },
    setHostSessionId(projectId, loopName, hostSessionId) {
      setHostSessionIdStmt.run(hostSessionId, projectId, loopName);
    },
    clearWorkspaceId(projectId, loopName) {
      clearWorkspaceIdStmt.run(projectId, loopName);
    },
    setModelFailed(projectId, loopName, failed) {
      setModelFailedStmt.run(failed ? 1 : 0, projectId, loopName);
    },
    setLastAuditResult(projectId, loopName, text) {
      setLastAuditResultStmt.run(text, projectId, loopName);
    },
    setSandboxContainer(projectId, loopName, containerName) {
      setSandboxContainerStmt.run(containerName, projectId, loopName);
    },
    setPhaseAndResetError(projectId, loopName, phase) {
      setPhaseAndResetErrorStmt.run(phase, projectId, loopName);
    },
    setStatus(projectId, loopName, status) {
      setStatusStmt.run(status, projectId, loopName);
    },
    updatePrompt(projectId, loopName, prompt) {
      const result = updatePromptStmt.run(prompt, projectId, loopName);
      return result.changes > 0;
    },
    applyRotation(projectId, loopName, opts) {
      const runTxn = db.transaction(() => {
        applyRotationStmt.run(opts.sessionId, opts.iteration, opts.phase ?? null, opts.auditCount ?? null, projectId, loopName);
        if (opts.lastAuditResult !== undefined) {
          setLastAuditResultStmt.run(opts.lastAuditResult ?? null, projectId, loopName);
        }
        if (opts.resetError) {
          resetErrorStmt.run(projectId, loopName);
        }
      });
      runTxn();
    },
    terminate(projectId, loopName, opts) {
      terminateStmt.run(opts.status, opts.completedAt, opts.reason, opts.summary ?? null, projectId, loopName);
    },
    delete(projectId, loopName) {
      deleteStmt.run(projectId, loopName);
      deleteLargeStmt.run(projectId, loopName);
    },
    findPartial(projectId, name) {
      const all = this.listByStatus(projectId, ["running", "completed", "cancelled", "errored", "stalled"]);
      return findPartialMatch(name, all, (row) => [row.loopName, row.worktreeBranch ?? undefined]);
    }
  };
}
var init_loops_repo = () => {};

// src/storage/repos/plans-repo.ts
function createPlansRepo(db) {
  const stmtWriteForSession = db.prepare(`
    INSERT OR REPLACE INTO plans (project_id, session_id, content, updated_at)
    VALUES (?, ?, ?, ?)
  `);
  const stmtWriteForLoop = db.prepare(`
    INSERT OR REPLACE INTO plans (project_id, loop_name, content, updated_at)
    VALUES (?, ?, ?, ?)
  `);
  const stmtGetForSession = db.prepare(`
    SELECT project_id, loop_name, session_id, content, updated_at
    FROM plans
    WHERE project_id = ? AND session_id = ?
  `);
  const stmtGetForLoop = db.prepare(`
    SELECT project_id, loop_name, session_id, content, updated_at
    FROM plans
    WHERE project_id = ? AND loop_name = ?
  `);
  const stmtPromote = db.prepare(`
    UPDATE plans
    SET loop_name = ?, session_id = NULL
    WHERE project_id = ? AND session_id = ?
  `);
  const stmtDeleteForSession = db.prepare(`
    DELETE FROM plans
    WHERE project_id = ? AND session_id = ?
  `);
  const stmtDeleteForLoop = db.prepare(`
    DELETE FROM plans
    WHERE project_id = ? AND loop_name = ?
  `);
  function writeForSession(projectId, sessionId, content) {
    stmtWriteForSession.run(projectId, sessionId, content, Date.now());
  }
  function writeForLoop(projectId, loopName, content) {
    stmtWriteForLoop.run(projectId, loopName, content, Date.now());
  }
  function getForSession(projectId, sessionId) {
    const row = stmtGetForSession.get(projectId, sessionId);
    if (!row)
      return null;
    return {
      projectId: row.project_id,
      loopName: row.loop_name,
      sessionId: row.session_id,
      content: row.content,
      updatedAt: row.updated_at
    };
  }
  function getForLoop(projectId, loopName) {
    const row = stmtGetForLoop.get(projectId, loopName);
    if (!row)
      return null;
    return {
      projectId: row.project_id,
      loopName: row.loop_name,
      sessionId: row.session_id,
      content: row.content,
      updatedAt: row.updated_at
    };
  }
  function getForLoopOrSession(projectId, loopName, sessionId) {
    return getForLoop(projectId, loopName) ?? getForSession(projectId, sessionId);
  }
  function promote(projectId, sessionId, loopName) {
    const result = stmtPromote.run(loopName, projectId, sessionId);
    return result.changes > 0;
  }
  function deleteForSession(projectId, sessionId) {
    stmtDeleteForSession.run(projectId, sessionId);
  }
  function deleteForLoop(projectId, loopName) {
    stmtDeleteForLoop.run(projectId, loopName);
  }
  return {
    writeForSession,
    writeForLoop,
    getForSession,
    getForLoop,
    getForLoopOrSession,
    promote,
    deleteForSession,
    deleteForLoop
  };
}
// src/storage/repos/graph-status-repo.ts
function createGraphStatusRepo(db) {
  const stmtWrite = db.prepare(`
    INSERT INTO graph_status (project_id, cwd, state, ready, stats_json, message, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (project_id, cwd) DO UPDATE SET
      state = excluded.state,
      ready = excluded.ready,
      stats_json = excluded.stats_json,
      message = excluded.message,
      updated_at = excluded.updated_at
  `);
  const stmtRead = db.prepare(`
    SELECT project_id, cwd, state, ready, stats_json, message, updated_at
    FROM graph_status
    WHERE project_id = ? AND cwd = ?
  `);
  function write(row) {
    const statsJson = row.stats ? JSON.stringify(row.stats) : null;
    stmtWrite.run(row.projectId, row.cwd, row.state, row.ready ? 1 : 0, statsJson, row.message, Date.now());
  }
  function read(projectId, cwd) {
    const row = stmtRead.get(projectId, cwd);
    if (!row)
      return null;
    return {
      projectId: row.project_id,
      cwd: row.cwd,
      state: row.state,
      ready: row.ready === 1,
      stats: row.stats_json ? JSON.parse(row.stats_json) : null,
      message: row.message,
      updatedAt: row.updated_at
    };
  }
  return {
    write,
    read
  };
}

// src/storage/repos/tui-prefs-repo.ts
function createTuiPrefsRepo(db) {
  const getStmt = db.prepare(`
    SELECT data FROM tui_preferences
    WHERE project_id = ? AND key = ?
      AND (expires_at IS NULL OR expires_at > ?)
  `);
  const setStmt = db.prepare(`
    INSERT OR REPLACE INTO tui_preferences (project_id, key, data, expires_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  return {
    get(projectId, key) {
      const now = Date.now();
      const row = getStmt.get(projectId, key, now);
      if (!row)
        return null;
      try {
        return JSON.parse(row.data);
      } catch {
        return null;
      }
    },
    set(projectId, key, value, ttlMs) {
      const now = Date.now();
      const expiresAt = ttlMs !== undefined ? now + ttlMs : null;
      setStmt.run(projectId, key, JSON.stringify(value), expiresAt, now);
    }
  };
}

// src/storage/index.ts
var init_storage = __esm(() => {
  init_database();
  init_loops_repo();
});

// src/utils/graph-status-store.ts
function writeGraphStatus(repo, projectId, status, cwd) {
  repo.write({
    projectId,
    cwd: cwd ?? "",
    state: status.state,
    ready: status.ready,
    stats: status.stats ?? null,
    message: status.message ?? null
  });
}
function readGraphStatus(repo, projectId, cwd) {
  const row = repo.read(projectId, cwd ?? "");
  if (!row)
    return null;
  return {
    state: row.state,
    ready: row.ready,
    stats: row.stats ?? undefined,
    message: row.message ?? undefined,
    updatedAt: row.updatedAt
  };
}
function isGraphReady(status) {
  if (!status)
    return false;
  return status.state === "ready";
}
var init_graph_status_store = () => {};

// src/utils/model-fallback.ts
var exports_model_fallback = {};
__export(exports_model_fallback, {
  retryWithModelFallback: () => retryWithModelFallback,
  parseModelString: () => parseModelString
});
function parseModelString(modelStr) {
  if (!modelStr)
    return;
  const slashIndex = modelStr.indexOf("/");
  if (slashIndex <= 0 || slashIndex === modelStr.length - 1)
    return;
  return {
    providerID: modelStr.substring(0, slashIndex),
    modelID: modelStr.substring(slashIndex + 1)
  };
}
async function retryWithModelFallback(callWithModel, callWithoutModel, model, logger, maxRetries = 2) {
  if (!model) {
    return { result: await callWithoutModel(), usedModel: undefined };
  }
  let lastError;
  for (let attempt = 1;attempt <= maxRetries; attempt++) {
    const result = await callWithModel();
    if (!result.error) {
      return { result, usedModel: model };
    }
    lastError = result.error;
    if (attempt < maxRetries) {
      logger.log(`model attempt ${attempt}/${maxRetries} failed, retrying`);
    } else {
      logger.log(`model attempt ${attempt}/${maxRetries} failed`);
    }
  }
  logger.error(`configured model unavailable after ${maxRetries} attempts, falling back to default`, lastError);
  return { result: await callWithoutModel(), usedModel: undefined };
}

// src/setup.ts
var exports_setup = {};
__export(exports_setup, {
  resolveConfigPath: () => resolveConfigPath,
  loadPluginConfig: () => loadPluginConfig
});
import { readFileSync, existsSync as existsSync3, mkdirSync as mkdirSync2, copyFileSync } from "fs";
import { dirname as dirname2, join as join3 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { homedir as homedir2, platform as platform2 } from "os";
function resolveBundledConfigPath() {
  const pluginDir = dirname2(fileURLToPath2(import.meta.url));
  return join3(pluginDir, "..", "forge-config.jsonc");
}
function resolveConfigDir() {
  const defaultBase = join3(homedir2(), platform2() === "win32" ? "AppData" : ".config");
  const xdgConfigHome = process.env["XDG_CONFIG_HOME"] || defaultBase;
  return join3(xdgConfigHome, "opencode");
}
function resolveConfigPath() {
  return join3(resolveConfigDir(), "forge-config.jsonc");
}
function resolveLegacyConfigPaths() {
  return [
    join3(resolveConfigDir(), "memory-config.jsonc"),
    join3(resolveConfigDir(), "graph-config.jsonc")
  ];
}
function ensureGlobalConfig() {
  const configDir = resolveConfigDir();
  const newConfigPath = resolveConfigPath();
  if (existsSync3(newConfigPath)) {
    return;
  }
  if (!existsSync3(configDir)) {
    mkdirSync2(configDir, { recursive: true });
  }
  for (const legacyConfigPath of resolveLegacyConfigPaths()) {
    if (existsSync3(legacyConfigPath)) {
      copyFileSync(legacyConfigPath, newConfigPath);
      return;
    }
  }
  const bundledConfigPath = resolveBundledConfigPath();
  if (existsSync3(bundledConfigPath)) {
    copyFileSync(bundledConfigPath, newConfigPath);
  }
}
function getDefaultConfig() {
  return {
    logging: {
      enabled: false,
      file: resolveLogPath()
    }
  };
}
function isValidPluginConfig(config) {
  if (!config || typeof config !== "object")
    return false;
  return true;
}
function stripComments(content) {
  let result = content;
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");
  result = result.replace(/(^|[^:])(\/\/.*$)/gm, "$1");
  return result;
}
function stripTrailingCommas(content) {
  let result = content;
  result = result.replace(/,(\s*}[ \t\n\r]*)/g, "$1");
  result = result.replace(/,(\s*][ \t\n\r]*)/g, "$1");
  return result;
}
function parseJsonc(content) {
  const cleaned = stripComments(content);
  const normalized = stripTrailingCommas(cleaned);
  return JSON.parse(normalized);
}
function loadPluginConfig() {
  ensureGlobalConfig();
  const configPath = resolveConfigPath();
  if (!existsSync3(configPath)) {
    return getDefaultConfig();
  }
  try {
    const content = readFileSync(configPath, "utf-8");
    const parsed = parseJsonc(content);
    if (!isValidPluginConfig(parsed)) {
      console.warn(`[forge] Invalid config at ${configPath}, using defaults`);
      return getDefaultConfig();
    }
    return normalizeConfig(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[forge] Failed to load config at ${configPath}: ${message}, using defaults`);
    return getDefaultConfig();
  }
}
function normalizeConfig(config) {
  if (config.defaultKvTtlMs !== undefined && config.completedLoopTtlMs === undefined) {
    console.warn('[forge] Config: "defaultKvTtlMs" is deprecated, please rename to "completedLoopTtlMs". Compatibility shim will be removed in a future release.');
  }
  return {
    dataDir: config.dataDir,
    completedLoopTtlMs: config.completedLoopTtlMs ?? config.defaultKvTtlMs,
    logging: config.logging,
    compaction: config.compaction,
    messagesTransform: config.messagesTransform,
    executionModel: config.executionModel,
    auditorModel: config.auditorModel,
    loop: config.loop,
    tui: config.tui,
    agents: config.agents,
    sandbox: config.sandbox,
    graph: config.graph
  };
}
var init_setup = __esm(() => {
  init_storage();
});

// src/workspace/forge-worktree.ts
var exports_forge_worktree = {};
__export(exports_forge_worktree, {
  createLoopWorkspace: () => createLoopWorkspace,
  createForgeWorktreeAdaptor: () => createForgeWorktreeAdaptor,
  bindSessionToWorkspace: () => bindSessionToWorkspace,
  FORGE_WORKTREE_WORKSPACE_TYPE: () => FORGE_WORKTREE_WORKSPACE_TYPE
});
function createForgeWorktreeAdaptor() {
  return {
    name: "Forge Worktree",
    description: "Workspace adaptor for forge worktree loops",
    configure(info) {
      const extra = info.extra ?? {};
      return {
        ...info,
        name: extra.loopName ?? info.name,
        directory: extra.directory ?? info.directory,
        branch: extra.branch ?? info.branch
      };
    },
    async create(_info, _from) {},
    async remove(_info) {},
    target(info) {
      return {
        type: "local",
        directory: info.directory
      };
    }
  };
}
async function createLoopWorkspace(client, options) {
  const workspaceApi = client.experimental?.workspace;
  if (!workspaceApi || typeof workspaceApi.create !== "function") {
    return null;
  }
  try {
    const result = await workspaceApi.create({
      type: FORGE_WORKTREE_WORKSPACE_TYPE,
      branch: options.branch ?? null,
      extra: {
        loopName: options.loopName,
        directory: options.directory,
        branch: options.branch ?? null
      }
    });
    if ("error" in result && result.error) {
      console.error("Failed to create workspace", result.error);
      return null;
    }
    if (!("data" in result) || !result.data) {
      console.error("Failed to create workspace: no data returned");
      return null;
    }
    return {
      workspaceId: result.data.id
    };
  } catch (err) {
    console.error("Failed to create loop workspace", err);
    return null;
  }
}
async function bindSessionToWorkspace(client, workspaceId, sessionId) {
  const workspaceApi = client.experimental?.workspace;
  if (!workspaceApi || typeof workspaceApi.sessionRestore !== "function") {
    throw new Error("experimental.workspace.sessionRestore not available on this host");
  }
  const result = await workspaceApi.sessionRestore({
    id: workspaceId,
    sessionID: sessionId
  });
  if ("error" in result && result.error) {
    throw new Error(`Session restore failed: ${JSON.stringify(result.error)}`);
  }
}
var FORGE_WORKTREE_WORKSPACE_TYPE = "forge-worktree";

// src/graph/scope-hash.ts
import { createHash } from "crypto";
function hashProjectId(projectId) {
  return createHash("sha256").update(projectId).digest("hex").substring(0, 16);
}
function hashGraphCacheScope(projectId, cwd) {
  const normalizedCwd = cwd.replace(/\/$/, "");
  return hashProjectId(`${projectId}::${normalizedCwd}`);
}
var init_scope_hash = () => {};

// src/graph/database.ts
import { existsSync as existsSync4, mkdirSync as mkdirSync3, writeFileSync, readFileSync as readFileSync2 } from "fs";
import { join as join4 } from "path";
function readGraphCacheMetadata(graphDir) {
  const metadataPath = join4(graphDir, GRAPH_METADATA_FILE);
  if (!existsSync4(metadataPath)) {
    return null;
  }
  try {
    const content = readFileSync2(metadataPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}
function writeGraphCacheMetadata(graphDir, metadata) {
  const metadataPath = join4(graphDir, GRAPH_METADATA_FILE);
  try {
    const existing = readGraphCacheMetadata(graphDir);
    const updated = {
      ...existing ?? {
        projectId: "",
        cwd: "",
        createdAt: Date.now()
      },
      ...metadata
    };
    writeFileSync(metadataPath, JSON.stringify(updated, null, 2));
    return true;
  } catch {
    return false;
  }
}
var databaseInstances, GRAPH_METADATA_FILE = "graph-metadata.json";
var init_database2 = __esm(() => {
  init_scope_hash();
  init_sqlite_open();
  databaseInstances = new Map;
});

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.js
var init_types_gen = () => {};

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/core/serverSentEvents.gen.js
var createSseClient = ({ onRequest, onSseError, onSseEvent, responseTransformer, responseValidator, sseDefaultRetryDelay, sseMaxRetryAttempts, sseMaxRetryDelay, sseSleepFn, url, ...options }) => {
  let lastEventId;
  const sleep = sseSleepFn ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const createStream = async function* () {
    let retryDelay = sseDefaultRetryDelay ?? 3000;
    let attempt = 0;
    const signal = options.signal ?? new AbortController().signal;
    while (true) {
      if (signal.aborted)
        break;
      attempt++;
      const headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
      if (lastEventId !== undefined) {
        headers.set("Last-Event-ID", lastEventId);
      }
      try {
        const requestInit = {
          redirect: "follow",
          ...options,
          body: options.serializedBody,
          headers,
          signal
        };
        let request = new Request(url, requestInit);
        if (onRequest) {
          request = await onRequest(url, requestInit);
        }
        const _fetch = options.fetch ?? globalThis.fetch;
        const response = await _fetch(request);
        if (!response.ok)
          throw new Error(`SSE failed: ${response.status} ${response.statusText}`);
        if (!response.body)
          throw new Error("No body in SSE response");
        const reader = response.body.pipeThrough(new TextDecoderStream).getReader();
        let buffer = "";
        const abortHandler = () => {
          try {
            reader.cancel();
          } catch {}
        };
        signal.addEventListener("abort", abortHandler);
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done)
              break;
            buffer += value;
            buffer = buffer.replace(/\r\n/g, `
`).replace(/\r/g, `
`);
            const chunks = buffer.split(`

`);
            buffer = chunks.pop() ?? "";
            for (const chunk of chunks) {
              const lines = chunk.split(`
`);
              const dataLines = [];
              let eventName;
              for (const line of lines) {
                if (line.startsWith("data:")) {
                  dataLines.push(line.replace(/^data:\s*/, ""));
                } else if (line.startsWith("event:")) {
                  eventName = line.replace(/^event:\s*/, "");
                } else if (line.startsWith("id:")) {
                  lastEventId = line.replace(/^id:\s*/, "");
                } else if (line.startsWith("retry:")) {
                  const parsed = Number.parseInt(line.replace(/^retry:\s*/, ""), 10);
                  if (!Number.isNaN(parsed)) {
                    retryDelay = parsed;
                  }
                }
              }
              let data;
              let parsedJson = false;
              if (dataLines.length) {
                const rawData = dataLines.join(`
`);
                try {
                  data = JSON.parse(rawData);
                  parsedJson = true;
                } catch {
                  data = rawData;
                }
              }
              if (parsedJson) {
                if (responseValidator) {
                  await responseValidator(data);
                }
                if (responseTransformer) {
                  data = await responseTransformer(data);
                }
              }
              onSseEvent?.({
                data,
                event: eventName,
                id: lastEventId,
                retry: retryDelay
              });
              if (dataLines.length) {
                yield data;
              }
            }
          }
        } finally {
          signal.removeEventListener("abort", abortHandler);
          reader.releaseLock();
        }
        break;
      } catch (error) {
        onSseError?.(error);
        if (sseMaxRetryAttempts !== undefined && attempt >= sseMaxRetryAttempts) {
          break;
        }
        const backoff = Math.min(retryDelay * 2 ** (attempt - 1), sseMaxRetryDelay ?? 30000);
        await sleep(backoff);
      }
    }
  };
  const stream = createStream();
  return { stream };
};

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/core/pathSerializer.gen.js
var separatorArrayExplode = (style) => {
  switch (style) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, separatorArrayNoExplode = (style) => {
  switch (style) {
    case "form":
      return ",";
    case "pipeDelimited":
      return "|";
    case "spaceDelimited":
      return "%20";
    default:
      return ",";
  }
}, separatorObjectExplode = (style) => {
  switch (style) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, serializeArrayParam = ({ allowReserved, explode, name, style, value }) => {
  if (!explode) {
    const joinedValues2 = (allowReserved ? value : value.map((v) => encodeURIComponent(v))).join(separatorArrayNoExplode(style));
    switch (style) {
      case "label":
        return `.${joinedValues2}`;
      case "matrix":
        return `;${name}=${joinedValues2}`;
      case "simple":
        return joinedValues2;
      default:
        return `${name}=${joinedValues2}`;
    }
  }
  const separator = separatorArrayExplode(style);
  const joinedValues = value.map((v) => {
    if (style === "label" || style === "simple") {
      return allowReserved ? v : encodeURIComponent(v);
    }
    return serializePrimitiveParam({
      allowReserved,
      name,
      value: v
    });
  }).join(separator);
  return style === "label" || style === "matrix" ? separator + joinedValues : joinedValues;
}, serializePrimitiveParam = ({ allowReserved, name, value }) => {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "object") {
    throw new Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");
  }
  return `${name}=${allowReserved ? value : encodeURIComponent(value)}`;
}, serializeObjectParam = ({ allowReserved, explode, name, style, value, valueOnly }) => {
  if (value instanceof Date) {
    return valueOnly ? value.toISOString() : `${name}=${value.toISOString()}`;
  }
  if (style !== "deepObject" && !explode) {
    let values = [];
    Object.entries(value).forEach(([key, v]) => {
      values = [...values, key, allowReserved ? v : encodeURIComponent(v)];
    });
    const joinedValues2 = values.join(",");
    switch (style) {
      case "form":
        return `${name}=${joinedValues2}`;
      case "label":
        return `.${joinedValues2}`;
      case "matrix":
        return `;${name}=${joinedValues2}`;
      default:
        return joinedValues2;
    }
  }
  const separator = separatorObjectExplode(style);
  const joinedValues = Object.entries(value).map(([key, v]) => serializePrimitiveParam({
    allowReserved,
    name: style === "deepObject" ? `${name}[${key}]` : key,
    value: v
  })).join(separator);
  return style === "label" || style === "matrix" ? separator + joinedValues : joinedValues;
};

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/core/utils.gen.js
function getValidRequestBody(options) {
  const hasBody = options.body !== undefined;
  const isSerializedBody = hasBody && options.bodySerializer;
  if (isSerializedBody) {
    if ("serializedBody" in options) {
      const hasSerializedBody = options.serializedBody !== undefined && options.serializedBody !== "";
      return hasSerializedBody ? options.serializedBody : null;
    }
    return options.body !== "" ? options.body : null;
  }
  if (hasBody) {
    return options.body;
  }
  return;
}
var PATH_PARAM_RE, defaultPathSerializer = ({ path, url: _url }) => {
  let url = _url;
  const matches = _url.match(PATH_PARAM_RE);
  if (matches) {
    for (const match of matches) {
      let explode = false;
      let name = match.substring(1, match.length - 1);
      let style = "simple";
      if (name.endsWith("*")) {
        explode = true;
        name = name.substring(0, name.length - 1);
      }
      if (name.startsWith(".")) {
        name = name.substring(1);
        style = "label";
      } else if (name.startsWith(";")) {
        name = name.substring(1);
        style = "matrix";
      }
      const value = path[name];
      if (value === undefined || value === null) {
        continue;
      }
      if (Array.isArray(value)) {
        url = url.replace(match, serializeArrayParam({ explode, name, style, value }));
        continue;
      }
      if (typeof value === "object") {
        url = url.replace(match, serializeObjectParam({
          explode,
          name,
          style,
          value,
          valueOnly: true
        }));
        continue;
      }
      if (style === "matrix") {
        url = url.replace(match, `;${serializePrimitiveParam({
          name,
          value
        })}`);
        continue;
      }
      const replaceValue = encodeURIComponent(style === "label" ? `.${value}` : value);
      url = url.replace(match, replaceValue);
    }
  }
  return url;
}, getUrl = ({ baseUrl, path, query, querySerializer, url: _url }) => {
  const pathUrl = _url.startsWith("/") ? _url : `/${_url}`;
  let url = (baseUrl ?? "") + pathUrl;
  if (path) {
    url = defaultPathSerializer({ path, url });
  }
  let search = query ? querySerializer(query) : "";
  if (search.startsWith("?")) {
    search = search.substring(1);
  }
  if (search) {
    url += `?${search}`;
  }
  return url;
};
var init_utils_gen = __esm(() => {
  PATH_PARAM_RE = /\{[^{}]+\}/g;
});

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/core/auth.gen.js
var getAuthToken = async (auth, callback) => {
  const token = typeof callback === "function" ? await callback(auth) : callback;
  if (!token) {
    return;
  }
  if (auth.scheme === "bearer") {
    return `Bearer ${token}`;
  }
  if (auth.scheme === "basic") {
    return `Basic ${btoa(token)}`;
  }
  return token;
};

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/core/bodySerializer.gen.js
var jsonBodySerializer;
var init_bodySerializer_gen = __esm(() => {
  jsonBodySerializer = {
    bodySerializer: (body) => JSON.stringify(body, (_key, value) => typeof value === "bigint" ? value.toString() : value)
  };
});

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/client/utils.gen.js
class Interceptors {
  fns = [];
  clear() {
    this.fns = [];
  }
  eject(id) {
    const index = this.getInterceptorIndex(id);
    if (this.fns[index]) {
      this.fns[index] = null;
    }
  }
  exists(id) {
    const index = this.getInterceptorIndex(id);
    return Boolean(this.fns[index]);
  }
  getInterceptorIndex(id) {
    if (typeof id === "number") {
      return this.fns[id] ? id : -1;
    }
    return this.fns.indexOf(id);
  }
  update(id, fn) {
    const index = this.getInterceptorIndex(id);
    if (this.fns[index]) {
      this.fns[index] = fn;
      return id;
    }
    return false;
  }
  use(fn) {
    this.fns.push(fn);
    return this.fns.length - 1;
  }
}
var createQuerySerializer = ({ parameters = {}, ...args } = {}) => {
  const querySerializer = (queryParams) => {
    const search = [];
    if (queryParams && typeof queryParams === "object") {
      for (const name in queryParams) {
        const value = queryParams[name];
        if (value === undefined || value === null) {
          continue;
        }
        const options = parameters[name] || args;
        if (Array.isArray(value)) {
          const serializedArray = serializeArrayParam({
            allowReserved: options.allowReserved,
            explode: true,
            name,
            style: "form",
            value,
            ...options.array
          });
          if (serializedArray)
            search.push(serializedArray);
        } else if (typeof value === "object") {
          const serializedObject = serializeObjectParam({
            allowReserved: options.allowReserved,
            explode: true,
            name,
            style: "deepObject",
            value,
            ...options.object
          });
          if (serializedObject)
            search.push(serializedObject);
        } else {
          const serializedPrimitive = serializePrimitiveParam({
            allowReserved: options.allowReserved,
            name,
            value
          });
          if (serializedPrimitive)
            search.push(serializedPrimitive);
        }
      }
    }
    return search.join("&");
  };
  return querySerializer;
}, getParseAs = (contentType) => {
  if (!contentType) {
    return "stream";
  }
  const cleanContent = contentType.split(";")[0]?.trim();
  if (!cleanContent) {
    return;
  }
  if (cleanContent.startsWith("application/json") || cleanContent.endsWith("+json")) {
    return "json";
  }
  if (cleanContent === "multipart/form-data") {
    return "formData";
  }
  if (["application/", "audio/", "image/", "video/"].some((type) => cleanContent.startsWith(type))) {
    return "blob";
  }
  if (cleanContent.startsWith("text/")) {
    return "text";
  }
  return;
}, checkForExistence = (options, name) => {
  if (!name) {
    return false;
  }
  if (options.headers.has(name) || options.query?.[name] || options.headers.get("Cookie")?.includes(`${name}=`)) {
    return true;
  }
  return false;
}, setAuthParams = async ({ security, ...options }) => {
  for (const auth of security) {
    if (checkForExistence(options, auth.name)) {
      continue;
    }
    const token = await getAuthToken(auth, options.auth);
    if (!token) {
      continue;
    }
    const name = auth.name ?? "Authorization";
    switch (auth.in) {
      case "query":
        if (!options.query) {
          options.query = {};
        }
        options.query[name] = token;
        break;
      case "cookie":
        options.headers.append("Cookie", `${name}=${token}`);
        break;
      case "header":
      default:
        options.headers.set(name, token);
        break;
    }
  }
}, buildUrl = (options) => getUrl({
  baseUrl: options.baseUrl,
  path: options.path,
  query: options.query,
  querySerializer: typeof options.querySerializer === "function" ? options.querySerializer : createQuerySerializer(options.querySerializer),
  url: options.url
}), mergeConfigs = (a, b) => {
  const config = { ...a, ...b };
  if (config.baseUrl?.endsWith("/")) {
    config.baseUrl = config.baseUrl.substring(0, config.baseUrl.length - 1);
  }
  config.headers = mergeHeaders(a.headers, b.headers);
  return config;
}, headersEntries = (headers) => {
  const entries = [];
  headers.forEach((value, key) => {
    entries.push([key, value]);
  });
  return entries;
}, mergeHeaders = (...headers) => {
  const mergedHeaders = new Headers;
  for (const header of headers) {
    if (!header) {
      continue;
    }
    const iterator = header instanceof Headers ? headersEntries(header) : Object.entries(header);
    for (const [key, value] of iterator) {
      if (value === null) {
        mergedHeaders.delete(key);
      } else if (Array.isArray(value)) {
        for (const v of value) {
          mergedHeaders.append(key, v);
        }
      } else if (value !== undefined) {
        mergedHeaders.set(key, typeof value === "object" ? JSON.stringify(value) : value);
      }
    }
  }
  return mergedHeaders;
}, createInterceptors = () => ({
  error: new Interceptors,
  request: new Interceptors,
  response: new Interceptors
}), defaultQuerySerializer, defaultHeaders, createConfig = (override = {}) => ({
  ...jsonBodySerializer,
  headers: defaultHeaders,
  parseAs: "auto",
  querySerializer: defaultQuerySerializer,
  ...override
});
var init_utils_gen2 = __esm(() => {
  init_bodySerializer_gen();
  init_utils_gen();
  defaultQuerySerializer = createQuerySerializer({
    allowReserved: false,
    array: {
      explode: true,
      style: "form"
    },
    object: {
      explode: true,
      style: "deepObject"
    }
  });
  defaultHeaders = {
    "Content-Type": "application/json"
  };
});

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/client/client.gen.js
var createClient = (config = {}) => {
  let _config = mergeConfigs(createConfig(), config);
  const getConfig = () => ({ ..._config });
  const setConfig = (config2) => {
    _config = mergeConfigs(_config, config2);
    return getConfig();
  };
  const interceptors = createInterceptors();
  const beforeRequest = async (options) => {
    const opts = {
      ..._config,
      ...options,
      fetch: options.fetch ?? _config.fetch ?? globalThis.fetch,
      headers: mergeHeaders(_config.headers, options.headers),
      serializedBody: undefined
    };
    if (opts.security) {
      await setAuthParams({
        ...opts,
        security: opts.security
      });
    }
    if (opts.requestValidator) {
      await opts.requestValidator(opts);
    }
    if (opts.body !== undefined && opts.bodySerializer) {
      opts.serializedBody = opts.bodySerializer(opts.body);
    }
    if (opts.body === undefined || opts.serializedBody === "") {
      opts.headers.delete("Content-Type");
    }
    const url = buildUrl(opts);
    return { opts, url };
  };
  const request = async (options) => {
    const { opts, url } = await beforeRequest(options);
    const requestInit = {
      redirect: "follow",
      ...opts,
      body: getValidRequestBody(opts)
    };
    let request2 = new Request(url, requestInit);
    for (const fn of interceptors.request.fns) {
      if (fn) {
        request2 = await fn(request2, opts);
      }
    }
    const _fetch = opts.fetch;
    let response;
    try {
      response = await _fetch(request2);
    } catch (error2) {
      let finalError2 = error2;
      for (const fn of interceptors.error.fns) {
        if (fn) {
          finalError2 = await fn(error2, undefined, request2, opts);
        }
      }
      finalError2 = finalError2 || {};
      if (opts.throwOnError) {
        throw finalError2;
      }
      return opts.responseStyle === "data" ? undefined : {
        error: finalError2,
        request: request2,
        response: undefined
      };
    }
    for (const fn of interceptors.response.fns) {
      if (fn) {
        response = await fn(response, request2, opts);
      }
    }
    const result = {
      request: request2,
      response
    };
    if (response.ok) {
      const parseAs = (opts.parseAs === "auto" ? getParseAs(response.headers.get("Content-Type")) : opts.parseAs) ?? "json";
      if (response.status === 204 || response.headers.get("Content-Length") === "0") {
        let emptyData;
        switch (parseAs) {
          case "arrayBuffer":
          case "blob":
          case "text":
            emptyData = await response[parseAs]();
            break;
          case "formData":
            emptyData = new FormData;
            break;
          case "stream":
            emptyData = response.body;
            break;
          case "json":
          default:
            emptyData = {};
            break;
        }
        return opts.responseStyle === "data" ? emptyData : {
          data: emptyData,
          ...result
        };
      }
      let data;
      switch (parseAs) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "text":
          data = await response[parseAs]();
          break;
        case "json": {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
          break;
        }
        case "stream":
          return opts.responseStyle === "data" ? response.body : {
            data: response.body,
            ...result
          };
      }
      if (parseAs === "json") {
        if (opts.responseValidator) {
          await opts.responseValidator(data);
        }
        if (opts.responseTransformer) {
          data = await opts.responseTransformer(data);
        }
      }
      return opts.responseStyle === "data" ? data : {
        data,
        ...result
      };
    }
    const textError = await response.text();
    let jsonError;
    try {
      jsonError = JSON.parse(textError);
    } catch {}
    const error = jsonError ?? textError;
    let finalError = error;
    for (const fn of interceptors.error.fns) {
      if (fn) {
        finalError = await fn(error, response, request2, opts);
      }
    }
    finalError = finalError || {};
    if (opts.throwOnError) {
      throw finalError;
    }
    return opts.responseStyle === "data" ? undefined : {
      error: finalError,
      ...result
    };
  };
  const makeMethodFn = (method) => (options) => request({ ...options, method });
  const makeSseFn = (method) => async (options) => {
    const { opts, url } = await beforeRequest(options);
    return createSseClient({
      ...opts,
      body: opts.body,
      headers: opts.headers,
      method,
      onRequest: async (url2, init) => {
        let request2 = new Request(url2, init);
        for (const fn of interceptors.request.fns) {
          if (fn) {
            request2 = await fn(request2, opts);
          }
        }
        return request2;
      },
      serializedBody: getValidRequestBody(opts),
      url
    });
  };
  return {
    buildUrl,
    connect: makeMethodFn("CONNECT"),
    delete: makeMethodFn("DELETE"),
    get: makeMethodFn("GET"),
    getConfig,
    head: makeMethodFn("HEAD"),
    interceptors,
    options: makeMethodFn("OPTIONS"),
    patch: makeMethodFn("PATCH"),
    post: makeMethodFn("POST"),
    put: makeMethodFn("PUT"),
    request,
    setConfig,
    sse: {
      connect: makeSseFn("CONNECT"),
      delete: makeSseFn("DELETE"),
      get: makeSseFn("GET"),
      head: makeSseFn("HEAD"),
      options: makeSseFn("OPTIONS"),
      patch: makeSseFn("PATCH"),
      post: makeSseFn("POST"),
      put: makeSseFn("PUT"),
      trace: makeSseFn("TRACE")
    },
    trace: makeMethodFn("TRACE")
  };
};
var init_client_gen = __esm(() => {
  init_utils_gen();
  init_utils_gen2();
});

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/core/params.gen.js
var extraPrefixesMap, extraPrefixes, buildKeyMap = (fields, map) => {
  if (!map) {
    map = new Map;
  }
  for (const config of fields) {
    if ("in" in config) {
      if (config.key) {
        map.set(config.key, {
          in: config.in,
          map: config.map
        });
      }
    } else if ("key" in config) {
      map.set(config.key, {
        map: config.map
      });
    } else if (config.args) {
      buildKeyMap(config.args, map);
    }
  }
  return map;
}, stripEmptySlots = (params) => {
  for (const [slot, value] of Object.entries(params)) {
    if (value && typeof value === "object" && !Object.keys(value).length) {
      delete params[slot];
    }
  }
}, buildClientParams = (args, fields) => {
  const params = {
    body: {},
    headers: {},
    path: {},
    query: {}
  };
  const map = buildKeyMap(fields);
  let config;
  for (const [index, arg] of args.entries()) {
    if (fields[index]) {
      config = fields[index];
    }
    if (!config) {
      continue;
    }
    if ("in" in config) {
      if (config.key) {
        const field = map.get(config.key);
        const name = field.map || config.key;
        if (field.in) {
          params[field.in][name] = arg;
        }
      } else {
        params.body = arg;
      }
    } else {
      for (const [key, value] of Object.entries(arg ?? {})) {
        const field = map.get(key);
        if (field) {
          if (field.in) {
            const name = field.map || key;
            params[field.in][name] = value;
          } else {
            params[field.map] = value;
          }
        } else {
          const extra = extraPrefixes.find(([prefix]) => key.startsWith(prefix));
          if (extra) {
            const [prefix, slot] = extra;
            params[slot][key.slice(prefix.length)] = value;
          } else if ("allowExtra" in config && config.allowExtra) {
            for (const [slot, allowed] of Object.entries(config.allowExtra)) {
              if (allowed) {
                params[slot][key] = value;
                break;
              }
            }
          }
        }
      }
    }
  }
  stripEmptySlots(params);
  return params;
};
var init_params_gen = __esm(() => {
  extraPrefixesMap = {
    $body_: "body",
    $headers_: "headers",
    $path_: "path",
    $query_: "query"
  };
  extraPrefixes = Object.entries(extraPrefixesMap);
});
// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/client/index.js
var init_client = __esm(() => {
  init_bodySerializer_gen();
  init_params_gen();
  init_client_gen();
  init_utils_gen2();
});

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/client.gen.js
var client;
var init_client_gen2 = __esm(() => {
  init_client();
  client = createClient(createConfig({ baseUrl: "http://localhost:4096" }));
});

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/gen/sdk.gen.js
class HeyApiClient {
  client;
  constructor(args) {
    this.client = args?.client ?? client;
  }
}

class HeyApiRegistry {
  defaultKey = "default";
  instances = new Map;
  get(key) {
    const instance = this.instances.get(key ?? this.defaultKey);
    if (!instance) {
      throw new Error(`No SDK client found. Create one with "new OpencodeClient()" to fix this error.`);
    }
    return instance;
  }
  set(value, key) {
    this.instances.set(key ?? this.defaultKey, value);
  }
}
var Config, Global, Auth, App, Adaptor, Workspace, Console, Session, Resource, Experimental, Project, Pty, Config2, Tool, Worktree, Session2, Part, Permission, Question, Oauth, Provider, History, Sync, Find, File, Event, Auth2, Mcp, Control, Tui, Instance, Path, Vcs, Command, Lsp, Formatter, OpencodeClient;
var init_sdk_gen = __esm(() => {
  init_client_gen2();
  init_client();
  Config = class Config extends HeyApiClient {
    get(options) {
      return (options?.client ?? this.client).get({
        url: "/global/config",
        ...options
      });
    }
    update(parameters, options) {
      const params = buildClientParams([parameters], [{ args: [{ key: "config", map: "body" }] }]);
      return (options?.client ?? this.client).patch({
        url: "/global/config",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
  };
  Global = class Global extends HeyApiClient {
    health(options) {
      return (options?.client ?? this.client).get({
        url: "/global/health",
        ...options
      });
    }
    event(options) {
      return (options?.client ?? this.client).sse.get({
        url: "/global/event",
        ...options
      });
    }
    dispose(options) {
      return (options?.client ?? this.client).post({
        url: "/global/dispose",
        ...options
      });
    }
    upgrade(parameters, options) {
      const params = buildClientParams([parameters], [{ args: [{ in: "body", key: "target" }] }]);
      return (options?.client ?? this.client).post({
        url: "/global/upgrade",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    _config;
    get config() {
      return this._config ??= new Config({ client: this.client });
    }
  };
  Auth = class Auth extends HeyApiClient {
    remove(parameters, options) {
      const params = buildClientParams([parameters], [{ args: [{ in: "path", key: "providerID" }] }]);
      return (options?.client ?? this.client).delete({
        url: "/auth/{providerID}",
        ...options,
        ...params
      });
    }
    set(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "providerID" },
            { key: "auth", map: "body" }
          ]
        }
      ]);
      return (options?.client ?? this.client).put({
        url: "/auth/{providerID}",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
  };
  App = class App extends HeyApiClient {
    log(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "service" },
            { in: "body", key: "level" },
            { in: "body", key: "message" },
            { in: "body", key: "extra" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/log",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    agents(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/agent",
        ...options,
        ...params
      });
    }
    skills(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/skill",
        ...options,
        ...params
      });
    }
  };
  Adaptor = class Adaptor extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/experimental/workspace/adaptor",
        ...options,
        ...params
      });
    }
  };
  Workspace = class Workspace extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/experimental/workspace",
        ...options,
        ...params
      });
    }
    create(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "id" },
            { in: "body", key: "type" },
            { in: "body", key: "branch" },
            { in: "body", key: "extra" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/experimental/workspace",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    status(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/experimental/workspace/status",
        ...options,
        ...params
      });
    }
    remove(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "id" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).delete({
        url: "/experimental/workspace/{id}",
        ...options,
        ...params
      });
    }
    sessionRestore(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "id" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "sessionID" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/experimental/workspace/{id}/session-restore",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    _adaptor;
    get adaptor() {
      return this._adaptor ??= new Adaptor({ client: this.client });
    }
  };
  Console = class Console extends HeyApiClient {
    get(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/experimental/console",
        ...options,
        ...params
      });
    }
    listOrgs(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/experimental/console/orgs",
        ...options,
        ...params
      });
    }
    switchOrg(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "accountID" },
            { in: "body", key: "orgID" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/experimental/console/switch",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
  };
  Session = class Session extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "query", key: "roots" },
            { in: "query", key: "start" },
            { in: "query", key: "cursor" },
            { in: "query", key: "search" },
            { in: "query", key: "limit" },
            { in: "query", key: "archived" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/experimental/session",
        ...options,
        ...params
      });
    }
  };
  Resource = class Resource extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/experimental/resource",
        ...options,
        ...params
      });
    }
  };
  Experimental = class Experimental extends HeyApiClient {
    _workspace;
    get workspace() {
      return this._workspace ??= new Workspace({ client: this.client });
    }
    _console;
    get console() {
      return this._console ??= new Console({ client: this.client });
    }
    _session;
    get session() {
      return this._session ??= new Session({ client: this.client });
    }
    _resource;
    get resource() {
      return this._resource ??= new Resource({ client: this.client });
    }
  };
  Project = class Project extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/project",
        ...options,
        ...params
      });
    }
    current(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/project/current",
        ...options,
        ...params
      });
    }
    initGit(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/project/git/init",
        ...options,
        ...params
      });
    }
    update(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "projectID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "name" },
            { in: "body", key: "icon" },
            { in: "body", key: "commands" }
          ]
        }
      ]);
      return (options?.client ?? this.client).patch({
        url: "/project/{projectID}",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
  };
  Pty = class Pty extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/pty",
        ...options,
        ...params
      });
    }
    create(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "command" },
            { in: "body", key: "args" },
            { in: "body", key: "cwd" },
            { in: "body", key: "title" },
            { in: "body", key: "env" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/pty",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    remove(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "ptyID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).delete({
        url: "/pty/{ptyID}",
        ...options,
        ...params
      });
    }
    get(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "ptyID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/pty/{ptyID}",
        ...options,
        ...params
      });
    }
    update(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "ptyID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "title" },
            { in: "body", key: "size" }
          ]
        }
      ]);
      return (options?.client ?? this.client).put({
        url: "/pty/{ptyID}",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    connect(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "ptyID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/pty/{ptyID}/connect",
        ...options,
        ...params
      });
    }
  };
  Config2 = class Config2 extends HeyApiClient {
    get(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/config",
        ...options,
        ...params
      });
    }
    update(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { key: "config", map: "body" }
          ]
        }
      ]);
      return (options?.client ?? this.client).patch({
        url: "/config",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    providers(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/config/providers",
        ...options,
        ...params
      });
    }
  };
  Tool = class Tool extends HeyApiClient {
    ids(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/experimental/tool/ids",
        ...options,
        ...params
      });
    }
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "query", key: "provider" },
            { in: "query", key: "model" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/experimental/tool",
        ...options,
        ...params
      });
    }
  };
  Worktree = class Worktree extends HeyApiClient {
    remove(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { key: "worktreeRemoveInput", map: "body" }
          ]
        }
      ]);
      return (options?.client ?? this.client).delete({
        url: "/experimental/worktree",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/experimental/worktree",
        ...options,
        ...params
      });
    }
    create(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { key: "worktreeCreateInput", map: "body" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/experimental/worktree",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    reset(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { key: "worktreeResetInput", map: "body" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/experimental/worktree/reset",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
  };
  Session2 = class Session2 extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "query", key: "roots" },
            { in: "query", key: "start" },
            { in: "query", key: "search" },
            { in: "query", key: "limit" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/session",
        ...options,
        ...params
      });
    }
    create(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "parentID" },
            { in: "body", key: "title" },
            { in: "body", key: "permission" },
            { in: "body", key: "workspaceID" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    status(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/session/status",
        ...options,
        ...params
      });
    }
    delete(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).delete({
        url: "/session/{sessionID}",
        ...options,
        ...params
      });
    }
    get(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/session/{sessionID}",
        ...options,
        ...params
      });
    }
    update(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "title" },
            { in: "body", key: "permission" },
            { in: "body", key: "time" }
          ]
        }
      ]);
      return (options?.client ?? this.client).patch({
        url: "/session/{sessionID}",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    children(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/session/{sessionID}/children",
        ...options,
        ...params
      });
    }
    todo(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/session/{sessionID}/todo",
        ...options,
        ...params
      });
    }
    init(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "modelID" },
            { in: "body", key: "providerID" },
            { in: "body", key: "messageID" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/init",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    fork(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "messageID" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/fork",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    abort(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/abort",
        ...options,
        ...params
      });
    }
    unshare(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).delete({
        url: "/session/{sessionID}/share",
        ...options,
        ...params
      });
    }
    share(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/share",
        ...options,
        ...params
      });
    }
    diff(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "query", key: "messageID" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/session/{sessionID}/diff",
        ...options,
        ...params
      });
    }
    summarize(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "providerID" },
            { in: "body", key: "modelID" },
            { in: "body", key: "auto" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/summarize",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    messages(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "query", key: "limit" },
            { in: "query", key: "before" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/session/{sessionID}/message",
        ...options,
        ...params
      });
    }
    prompt(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "messageID" },
            { in: "body", key: "model" },
            { in: "body", key: "agent" },
            { in: "body", key: "noReply" },
            { in: "body", key: "tools" },
            { in: "body", key: "format" },
            { in: "body", key: "system" },
            { in: "body", key: "variant" },
            { in: "body", key: "parts" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/message",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    deleteMessage(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "path", key: "messageID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).delete({
        url: "/session/{sessionID}/message/{messageID}",
        ...options,
        ...params
      });
    }
    message(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "path", key: "messageID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/session/{sessionID}/message/{messageID}",
        ...options,
        ...params
      });
    }
    promptAsync(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "messageID" },
            { in: "body", key: "model" },
            { in: "body", key: "agent" },
            { in: "body", key: "noReply" },
            { in: "body", key: "tools" },
            { in: "body", key: "format" },
            { in: "body", key: "system" },
            { in: "body", key: "variant" },
            { in: "body", key: "parts" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/prompt_async",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    command(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "messageID" },
            { in: "body", key: "agent" },
            { in: "body", key: "model" },
            { in: "body", key: "arguments" },
            { in: "body", key: "command" },
            { in: "body", key: "variant" },
            { in: "body", key: "parts" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/command",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    shell(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "messageID" },
            { in: "body", key: "agent" },
            { in: "body", key: "model" },
            { in: "body", key: "command" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/shell",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    revert(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "messageID" },
            { in: "body", key: "partID" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/revert",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    unrevert(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/unrevert",
        ...options,
        ...params
      });
    }
  };
  Part = class Part extends HeyApiClient {
    delete(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "path", key: "messageID" },
            { in: "path", key: "partID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).delete({
        url: "/session/{sessionID}/message/{messageID}/part/{partID}",
        ...options,
        ...params
      });
    }
    update(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "path", key: "messageID" },
            { in: "path", key: "partID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { key: "part", map: "body" }
          ]
        }
      ]);
      return (options?.client ?? this.client).patch({
        url: "/session/{sessionID}/message/{messageID}/part/{partID}",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
  };
  Permission = class Permission extends HeyApiClient {
    respond(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "sessionID" },
            { in: "path", key: "permissionID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "response" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/session/{sessionID}/permissions/{permissionID}",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    reply(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "requestID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "reply" },
            { in: "body", key: "message" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/permission/{requestID}/reply",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/permission",
        ...options,
        ...params
      });
    }
  };
  Question = class Question extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/question",
        ...options,
        ...params
      });
    }
    reply(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "requestID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "answers" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/question/{requestID}/reply",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    reject(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "requestID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/question/{requestID}/reject",
        ...options,
        ...params
      });
    }
  };
  Oauth = class Oauth extends HeyApiClient {
    authorize(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "providerID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "method" },
            { in: "body", key: "inputs" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/provider/{providerID}/oauth/authorize",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    callback(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "providerID" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "method" },
            { in: "body", key: "code" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/provider/{providerID}/oauth/callback",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
  };
  Provider = class Provider extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/provider",
        ...options,
        ...params
      });
    }
    auth(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/provider/auth",
        ...options,
        ...params
      });
    }
    _oauth;
    get oauth() {
      return this._oauth ??= new Oauth({ client: this.client });
    }
  };
  History = class History extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { key: "body", map: "body" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/sync/history",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
  };
  Sync = class Sync extends HeyApiClient {
    start(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/sync/start",
        ...options,
        ...params
      });
    }
    replay(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            {
              in: "query",
              key: "query_directory",
              map: "directory"
            },
            { in: "query", key: "workspace" },
            {
              in: "body",
              key: "body_directory",
              map: "directory"
            },
            { in: "body", key: "events" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/sync/replay",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    _history;
    get history() {
      return this._history ??= new History({ client: this.client });
    }
  };
  Find = class Find extends HeyApiClient {
    text(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "query", key: "pattern" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/find",
        ...options,
        ...params
      });
    }
    files(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "query", key: "query" },
            { in: "query", key: "dirs" },
            { in: "query", key: "type" },
            { in: "query", key: "limit" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/find/file",
        ...options,
        ...params
      });
    }
    symbols(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "query", key: "query" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/find/symbol",
        ...options,
        ...params
      });
    }
  };
  File = class File extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "query", key: "path" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/file",
        ...options,
        ...params
      });
    }
    read(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "query", key: "path" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/file/content",
        ...options,
        ...params
      });
    }
    status(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/file/status",
        ...options,
        ...params
      });
    }
  };
  Event = class Event extends HeyApiClient {
    subscribe(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).sse.get({
        url: "/event",
        ...options,
        ...params
      });
    }
  };
  Auth2 = class Auth2 extends HeyApiClient {
    remove(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "name" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).delete({
        url: "/mcp/{name}/auth",
        ...options,
        ...params
      });
    }
    start(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "name" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/mcp/{name}/auth",
        ...options,
        ...params
      });
    }
    callback(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "name" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "code" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/mcp/{name}/auth/callback",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    authenticate(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "name" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/mcp/{name}/auth/authenticate",
        ...options,
        ...params
      });
    }
  };
  Mcp = class Mcp extends HeyApiClient {
    status(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/mcp",
        ...options,
        ...params
      });
    }
    add(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "name" },
            { in: "body", key: "config" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/mcp",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    connect(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "name" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/mcp/{name}/connect",
        ...options,
        ...params
      });
    }
    disconnect(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "path", key: "name" },
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/mcp/{name}/disconnect",
        ...options,
        ...params
      });
    }
    _auth;
    get auth() {
      return this._auth ??= new Auth2({ client: this.client });
    }
  };
  Control = class Control extends HeyApiClient {
    next(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/tui/control/next",
        ...options,
        ...params
      });
    }
    response(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { key: "body", map: "body" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/control/response",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
  };
  Tui = class Tui extends HeyApiClient {
    appendPrompt(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "text" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/append-prompt",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    openHelp(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/open-help",
        ...options,
        ...params
      });
    }
    openSessions(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/open-sessions",
        ...options,
        ...params
      });
    }
    openThemes(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/open-themes",
        ...options,
        ...params
      });
    }
    openModels(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/open-models",
        ...options,
        ...params
      });
    }
    submitPrompt(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/submit-prompt",
        ...options,
        ...params
      });
    }
    clearPrompt(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/clear-prompt",
        ...options,
        ...params
      });
    }
    executeCommand(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "command" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/execute-command",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    showToast(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "title" },
            { in: "body", key: "message" },
            { in: "body", key: "variant" },
            { in: "body", key: "duration" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/show-toast",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    publish(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { key: "body", map: "body" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/publish",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    selectSession(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "body", key: "sessionID" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/tui/select-session",
        ...options,
        ...params,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          ...params.headers
        }
      });
    }
    _control;
    get control() {
      return this._control ??= new Control({ client: this.client });
    }
  };
  Instance = class Instance extends HeyApiClient {
    dispose(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).post({
        url: "/instance/dispose",
        ...options,
        ...params
      });
    }
  };
  Path = class Path extends HeyApiClient {
    get(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/path",
        ...options,
        ...params
      });
    }
  };
  Vcs = class Vcs extends HeyApiClient {
    get(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/vcs",
        ...options,
        ...params
      });
    }
    diff(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" },
            { in: "query", key: "mode" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/vcs/diff",
        ...options,
        ...params
      });
    }
  };
  Command = class Command extends HeyApiClient {
    list(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/command",
        ...options,
        ...params
      });
    }
  };
  Lsp = class Lsp extends HeyApiClient {
    status(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/lsp",
        ...options,
        ...params
      });
    }
  };
  Formatter = class Formatter extends HeyApiClient {
    status(parameters, options) {
      const params = buildClientParams([parameters], [
        {
          args: [
            { in: "query", key: "directory" },
            { in: "query", key: "workspace" }
          ]
        }
      ]);
      return (options?.client ?? this.client).get({
        url: "/formatter",
        ...options,
        ...params
      });
    }
  };
  OpencodeClient = class OpencodeClient extends HeyApiClient {
    static __registry = new HeyApiRegistry;
    constructor(args) {
      super(args);
      OpencodeClient.__registry.set(this, args?.key);
    }
    _global;
    get global() {
      return this._global ??= new Global({ client: this.client });
    }
    _auth;
    get auth() {
      return this._auth ??= new Auth({ client: this.client });
    }
    _app;
    get app() {
      return this._app ??= new App({ client: this.client });
    }
    _experimental;
    get experimental() {
      return this._experimental ??= new Experimental({ client: this.client });
    }
    _project;
    get project() {
      return this._project ??= new Project({ client: this.client });
    }
    _pty;
    get pty() {
      return this._pty ??= new Pty({ client: this.client });
    }
    _config;
    get config() {
      return this._config ??= new Config2({ client: this.client });
    }
    _tool;
    get tool() {
      return this._tool ??= new Tool({ client: this.client });
    }
    _worktree;
    get worktree() {
      return this._worktree ??= new Worktree({ client: this.client });
    }
    _session;
    get session() {
      return this._session ??= new Session2({ client: this.client });
    }
    _part;
    get part() {
      return this._part ??= new Part({ client: this.client });
    }
    _permission;
    get permission() {
      return this._permission ??= new Permission({ client: this.client });
    }
    _question;
    get question() {
      return this._question ??= new Question({ client: this.client });
    }
    _provider;
    get provider() {
      return this._provider ??= new Provider({ client: this.client });
    }
    _sync;
    get sync() {
      return this._sync ??= new Sync({ client: this.client });
    }
    _find;
    get find() {
      return this._find ??= new Find({ client: this.client });
    }
    _file;
    get file() {
      return this._file ??= new File({ client: this.client });
    }
    _event;
    get event() {
      return this._event ??= new Event({ client: this.client });
    }
    _mcp;
    get mcp() {
      return this._mcp ??= new Mcp({ client: this.client });
    }
    _tui;
    get tui() {
      return this._tui ??= new Tui({ client: this.client });
    }
    _instance;
    get instance() {
      return this._instance ??= new Instance({ client: this.client });
    }
    _path;
    get path() {
      return this._path ??= new Path({ client: this.client });
    }
    _vcs;
    get vcs() {
      return this._vcs ??= new Vcs({ client: this.client });
    }
    _command;
    get command() {
      return this._command ??= new Command({ client: this.client });
    }
    _lsp;
    get lsp() {
      return this._lsp ??= new Lsp({ client: this.client });
    }
    _formatter;
    get formatter() {
      return this._formatter ??= new Formatter({ client: this.client });
    }
  };
});

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/client.js
var init_client2 = __esm(() => {
  init_client_gen();
  init_sdk_gen();
  init_types_gen();
});

// node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/windows.js
var require_windows = __commonJS((exports, module) => {
  module.exports = isexe;
  isexe.sync = sync;
  var fs = __require("fs");
  function checkPathExt(path, options) {
    var pathext = options.pathExt !== undefined ? options.pathExt : process.env.PATHEXT;
    if (!pathext) {
      return true;
    }
    pathext = pathext.split(";");
    if (pathext.indexOf("") !== -1) {
      return true;
    }
    for (var i = 0;i < pathext.length; i++) {
      var p = pathext[i].toLowerCase();
      if (p && path.substr(-p.length).toLowerCase() === p) {
        return true;
      }
    }
    return false;
  }
  function checkStat(stat, path, options) {
    if (!stat.isSymbolicLink() && !stat.isFile()) {
      return false;
    }
    return checkPathExt(path, options);
  }
  function isexe(path, options, cb) {
    fs.stat(path, function(er, stat) {
      cb(er, er ? false : checkStat(stat, path, options));
    });
  }
  function sync(path, options) {
    return checkStat(fs.statSync(path), path, options);
  }
});

// node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/mode.js
var require_mode = __commonJS((exports, module) => {
  module.exports = isexe;
  isexe.sync = sync;
  var fs = __require("fs");
  function isexe(path, options, cb) {
    fs.stat(path, function(er, stat) {
      cb(er, er ? false : checkStat(stat, options));
    });
  }
  function sync(path, options) {
    return checkStat(fs.statSync(path), options);
  }
  function checkStat(stat, options) {
    return stat.isFile() && checkMode(stat, options);
  }
  function checkMode(stat, options) {
    var mod = stat.mode;
    var uid = stat.uid;
    var gid = stat.gid;
    var myUid = options.uid !== undefined ? options.uid : process.getuid && process.getuid();
    var myGid = options.gid !== undefined ? options.gid : process.getgid && process.getgid();
    var u = parseInt("100", 8);
    var g = parseInt("010", 8);
    var o = parseInt("001", 8);
    var ug = u | g;
    var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
    return ret;
  }
});

// node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/index.js
var require_isexe = __commonJS((exports, module) => {
  var fs = __require("fs");
  var core;
  if (process.platform === "win32" || global.TESTING_WINDOWS) {
    core = require_windows();
  } else {
    core = require_mode();
  }
  module.exports = isexe;
  isexe.sync = sync;
  function isexe(path, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    if (!cb) {
      if (typeof Promise !== "function") {
        throw new TypeError("callback not provided");
      }
      return new Promise(function(resolve, reject) {
        isexe(path, options || {}, function(er, is) {
          if (er) {
            reject(er);
          } else {
            resolve(is);
          }
        });
      });
    }
    core(path, options || {}, function(er, is) {
      if (er) {
        if (er.code === "EACCES" || options && options.ignoreErrors) {
          er = null;
          is = false;
        }
      }
      cb(er, is);
    });
  }
  function sync(path, options) {
    try {
      return core.sync(path, options || {});
    } catch (er) {
      if (options && options.ignoreErrors || er.code === "EACCES") {
        return false;
      } else {
        throw er;
      }
    }
  }
});

// node_modules/.pnpm/which@2.0.2/node_modules/which/which.js
var require_which = __commonJS((exports, module) => {
  var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
  var path = __require("path");
  var COLON = isWindows ? ";" : ":";
  var isexe = require_isexe();
  var getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: "ENOENT" });
  var getPathInfo = (cmd, opt) => {
    const colon = opt.colon || COLON;
    const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
      ...isWindows ? [process.cwd()] : [],
      ...(opt.path || process.env.PATH || "").split(colon)
    ];
    const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
    const pathExt = isWindows ? pathExtExe.split(colon) : [""];
    if (isWindows) {
      if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
        pathExt.unshift("");
    }
    return {
      pathEnv,
      pathExt,
      pathExtExe
    };
  };
  var which = (cmd, opt, cb) => {
    if (typeof opt === "function") {
      cb = opt;
      opt = {};
    }
    if (!opt)
      opt = {};
    const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
    const found = [];
    const step = (i) => new Promise((resolve, reject) => {
      if (i === pathEnv.length)
        return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
      const ppRaw = pathEnv[i];
      const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
      const pCmd = path.join(pathPart, cmd);
      const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
      resolve(subStep(p, i, 0));
    });
    const subStep = (p, i, ii) => new Promise((resolve, reject) => {
      if (ii === pathExt.length)
        return resolve(step(i + 1));
      const ext = pathExt[ii];
      isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
        if (!er && is) {
          if (opt.all)
            found.push(p + ext);
          else
            return resolve(p + ext);
        }
        return resolve(subStep(p, i, ii + 1));
      });
    });
    return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
  };
  var whichSync = (cmd, opt) => {
    opt = opt || {};
    const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
    const found = [];
    for (let i = 0;i < pathEnv.length; i++) {
      const ppRaw = pathEnv[i];
      const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
      const pCmd = path.join(pathPart, cmd);
      const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
      for (let j = 0;j < pathExt.length; j++) {
        const cur = p + pathExt[j];
        try {
          const is = isexe.sync(cur, { pathExt: pathExtExe });
          if (is) {
            if (opt.all)
              found.push(cur);
            else
              return cur;
          }
        } catch (ex) {}
      }
    }
    if (opt.all && found.length)
      return found;
    if (opt.nothrow)
      return null;
    throw getNotFoundError(cmd);
  };
  module.exports = which;
  which.sync = whichSync;
});

// node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js
var require_path_key = __commonJS((exports, module) => {
  var pathKey = (options = {}) => {
    const environment = options.env || process.env;
    const platform3 = options.platform || process.platform;
    if (platform3 !== "win32") {
      return "PATH";
    }
    return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
  };
  module.exports = pathKey;
  module.exports.default = pathKey;
});

// node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/resolveCommand.js
var require_resolveCommand = __commonJS((exports, module) => {
  var path = __require("path");
  var which = require_which();
  var getPathKey = require_path_key();
  function resolveCommandAttempt(parsed, withoutPathExt) {
    const env = parsed.options.env || process.env;
    const cwd = process.cwd();
    const hasCustomCwd = parsed.options.cwd != null;
    const shouldSwitchCwd = hasCustomCwd && process.chdir !== undefined && !process.chdir.disabled;
    if (shouldSwitchCwd) {
      try {
        process.chdir(parsed.options.cwd);
      } catch (err) {}
    }
    let resolved;
    try {
      resolved = which.sync(parsed.command, {
        path: env[getPathKey({ env })],
        pathExt: withoutPathExt ? path.delimiter : undefined
      });
    } catch (e) {} finally {
      if (shouldSwitchCwd) {
        process.chdir(cwd);
      }
    }
    if (resolved) {
      resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
    }
    return resolved;
  }
  function resolveCommand(parsed) {
    return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
  }
  module.exports = resolveCommand;
});

// node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/escape.js
var require_escape = __commonJS((exports, module) => {
  var metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
  function escapeCommand(arg) {
    arg = arg.replace(metaCharsRegExp, "^$1");
    return arg;
  }
  function escapeArgument(arg, doubleEscapeMetaChars) {
    arg = `${arg}`;
    arg = arg.replace(/(?=(\\+?)?)\1"/g, "$1$1\\\"");
    arg = arg.replace(/(?=(\\+?)?)\1$/, "$1$1");
    arg = `"${arg}"`;
    arg = arg.replace(metaCharsRegExp, "^$1");
    if (doubleEscapeMetaChars) {
      arg = arg.replace(metaCharsRegExp, "^$1");
    }
    return arg;
  }
  exports.command = escapeCommand;
  exports.argument = escapeArgument;
});

// node_modules/.pnpm/shebang-regex@3.0.0/node_modules/shebang-regex/index.js
var require_shebang_regex = __commonJS((exports, module) => {
  module.exports = /^#!(.*)/;
});

// node_modules/.pnpm/shebang-command@2.0.0/node_modules/shebang-command/index.js
var require_shebang_command = __commonJS((exports, module) => {
  var shebangRegex = require_shebang_regex();
  module.exports = (string = "") => {
    const match = string.match(shebangRegex);
    if (!match) {
      return null;
    }
    const [path, argument] = match[0].replace(/#! ?/, "").split(" ");
    const binary = path.split("/").pop();
    if (binary === "env") {
      return argument;
    }
    return argument ? `${binary} ${argument}` : binary;
  };
});

// node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = __commonJS((exports, module) => {
  var fs = __require("fs");
  var shebangCommand = require_shebang_command();
  function readShebang(command) {
    const size = 150;
    const buffer = Buffer.alloc(size);
    let fd;
    try {
      fd = fs.openSync(command, "r");
      fs.readSync(fd, buffer, 0, size, 0);
      fs.closeSync(fd);
    } catch (e) {}
    return shebangCommand(buffer.toString());
  }
  module.exports = readShebang;
});

// node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/parse.js
var require_parse = __commonJS((exports, module) => {
  var path = __require("path");
  var resolveCommand = require_resolveCommand();
  var escape = require_escape();
  var readShebang = require_readShebang();
  var isWin = process.platform === "win32";
  var isExecutableRegExp = /\.(?:com|exe)$/i;
  var isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
  function detectShebang(parsed) {
    parsed.file = resolveCommand(parsed);
    const shebang = parsed.file && readShebang(parsed.file);
    if (shebang) {
      parsed.args.unshift(parsed.file);
      parsed.command = shebang;
      return resolveCommand(parsed);
    }
    return parsed.file;
  }
  function parseNonShell(parsed) {
    if (!isWin) {
      return parsed;
    }
    const commandFile = detectShebang(parsed);
    const needsShell = !isExecutableRegExp.test(commandFile);
    if (parsed.options.forceShell || needsShell) {
      const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
      parsed.command = path.normalize(parsed.command);
      parsed.command = escape.command(parsed.command);
      parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
      const shellCommand = [parsed.command].concat(parsed.args).join(" ");
      parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
      parsed.command = process.env.comspec || "cmd.exe";
      parsed.options.windowsVerbatimArguments = true;
    }
    return parsed;
  }
  function parse(command, args, options) {
    if (args && !Array.isArray(args)) {
      options = args;
      args = null;
    }
    args = args ? args.slice(0) : [];
    options = Object.assign({}, options);
    const parsed = {
      command,
      args,
      options,
      file: undefined,
      original: {
        command,
        args
      }
    };
    return options.shell ? parsed : parseNonShell(parsed);
  }
  module.exports = parse;
});

// node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/enoent.js
var require_enoent = __commonJS((exports, module) => {
  var isWin = process.platform === "win32";
  function notFoundError(original, syscall) {
    return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
      code: "ENOENT",
      errno: "ENOENT",
      syscall: `${syscall} ${original.command}`,
      path: original.command,
      spawnargs: original.args
    });
  }
  function hookChildProcess(cp, parsed) {
    if (!isWin) {
      return;
    }
    const originalEmit = cp.emit;
    cp.emit = function(name, arg1) {
      if (name === "exit") {
        const err = verifyENOENT(arg1, parsed);
        if (err) {
          return originalEmit.call(cp, "error", err);
        }
      }
      return originalEmit.apply(cp, arguments);
    };
  }
  function verifyENOENT(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
      return notFoundError(parsed.original, "spawn");
    }
    return null;
  }
  function verifyENOENTSync(status, parsed) {
    if (isWin && status === 1 && !parsed.file) {
      return notFoundError(parsed.original, "spawnSync");
    }
    return null;
  }
  module.exports = {
    hookChildProcess,
    verifyENOENT,
    verifyENOENTSync,
    notFoundError
  };
});

// node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/index.js
var require_cross_spawn = __commonJS((exports, module) => {
  var cp = __require("child_process");
  var parse = require_parse();
  var enoent = require_enoent();
  function spawn(command, args, options) {
    const parsed = parse(command, args, options);
    const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
    enoent.hookChildProcess(spawned, parsed);
    return spawned;
  }
  function spawnSync(command, args, options) {
    const parsed = parse(command, args, options);
    const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
    return result;
  }
  module.exports = spawn;
  module.exports.spawn = spawn;
  module.exports.sync = spawnSync;
  module.exports._parse = parse;
  module.exports._enoent = enoent;
});

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/process.js
var init_process = () => {};

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/server.js
var import_cross_spawn;
var init_server = __esm(() => {
  init_process();
  import_cross_spawn = __toESM(require_cross_spawn(), 1);
});

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/data.js
var init_data = () => {};

// node_modules/.pnpm/@opencode-ai+sdk@1.4.11/node_modules/@opencode-ai/sdk/dist/v2/index.js
var init_v2 = __esm(() => {
  init_client2();
  init_server();
  init_data();
  init_client2();
  init_server();
});

// src/cli/utils.ts
var init_utils = __esm(() => {
  init_v2();
  init_database();
});

// src/storage/graph-projects.ts
import { join as join5 } from "path";
function resolveGraphCacheDir(projectId, cwd, dataDir) {
  const resolvedDataDir = dataDir ?? resolveDataDir();
  const cacheHash = hashGraphCacheScope(projectId, cwd);
  return join5(resolvedDataDir, "graph", cacheHash);
}
var init_graph_projects = __esm(() => {
  init_database();
  init_database2();
  init_utils();
  init_scope_hash();
  init_scope_hash();
});

// src/graph/types.ts
var EXT_TO_LANGUAGE;
var init_types = __esm(() => {
  EXT_TO_LANGUAGE = {
    ".ts": "typescript",
    ".tsx": "typescript",
    ".mts": "typescript",
    ".cts": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".py": "python",
    ".pyw": "python",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".c": "c",
    ".h": "c",
    ".cpp": "cpp",
    ".cc": "cpp",
    ".cxx": "cpp",
    ".hpp": "cpp",
    ".hh": "cpp",
    ".hxx": "cpp",
    ".cs": "csharp",
    ".rb": "ruby",
    ".erb": "ruby",
    ".php": "php",
    ".swift": "swift",
    ".kt": "kotlin",
    ".kts": "kotlin",
    ".scala": "scala",
    ".sc": "scala",
    ".lua": "lua",
    ".ex": "elixir",
    ".exs": "elixir",
    ".dart": "dart",
    ".zig": "zig",
    ".sh": "bash",
    ".bash": "bash",
    ".zsh": "bash",
    ".ml": "ocaml",
    ".mli": "ocaml",
    ".m": "objc",
    ".css": "css",
    ".scss": "css",
    ".less": "css",
    ".html": "html",
    ".htm": "html",
    ".json": "json",
    ".jsonc": "json",
    ".toml": "toml",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".dockerfile": "dockerfile",
    ".vue": "vue",
    ".res": "rescript",
    ".resi": "rescript",
    ".sol": "solidity",
    ".tla": "tlaplus",
    ".el": "elisp"
  };
});

// src/graph/constants.ts
var INDEXABLE_EXTENSIONS;
var init_constants = __esm(() => {
  init_types();
  INDEXABLE_EXTENSIONS = EXT_TO_LANGUAGE;
});

// src/graph/utils.ts
import { readdirSync } from "fs";
import { stat } from "fs/promises";
import { join as join6, extname } from "path";
async function collectIndexFingerprint(dir, graphCacheDir) {
  const gitFiles = await collectFilesViaGit(dir);
  if (gitFiles) {
    let maxMtimeMs2 = 0;
    let filteredCount = 0;
    for (const file of gitFiles) {
      if (graphCacheDir && file.path.startsWith(graphCacheDir)) {
        continue;
      }
      filteredCount++;
      if (file.mtimeMs > maxMtimeMs2) {
        maxMtimeMs2 = file.mtimeMs;
      }
    }
    return {
      fileCount: filteredCount,
      maxMtimeMs: maxMtimeMs2
    };
  }
  const collected = [];
  await collectFilesWalk(dir, 0, undefined, collected);
  const filtered = graphCacheDir ? collected.filter((file) => !file.path.startsWith(graphCacheDir)) : collected;
  let maxMtimeMs = 0;
  for (const file of filtered) {
    if (file.mtimeMs > maxMtimeMs) {
      maxMtimeMs = file.mtimeMs;
    }
  }
  return {
    fileCount: filtered.length,
    maxMtimeMs
  };
}
async function collectFilesViaGit(dir) {
  try {
    const proc = Bun.spawn(["git", "ls-files", "--cached", "--others", "--exclude-standard"], {
      cwd: dir,
      stdout: "pipe",
      stderr: "ignore"
    });
    const code = await Promise.race([
      proc.exited,
      new Promise((r) => setTimeout(() => r("timeout"), 30000))
    ]);
    if (code === "timeout") {
      proc.kill();
      return null;
    }
    const text = await new Response(proc.stdout).text();
    if (code !== 0)
      return null;
    const files = [];
    for (const line of text.split(`
`)) {
      if (!line)
        continue;
      const ext = extname(line).toLowerCase();
      if (!(ext in INDEXABLE_EXTENSIONS))
        continue;
      const fullPath = join6(dir, line);
      try {
        const s = await stat(fullPath);
        if (s.size < MAX_FILE_SIZE)
          files.push({ path: fullPath, mtimeMs: s.mtimeMs });
      } catch {}
      if (files.length % 50 === 0)
        await new Promise((r) => setTimeout(r, 0));
    }
    return files;
  } catch {
    return null;
  }
}
async function collectFilesWalk(dir, depth, counter, out) {
  if (depth > MAX_DEPTH)
    return [];
  const ctx = counter ?? { n: 0 };
  const files = out ?? [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (ctx.n >= WALK_FILE_CAP)
        break;
      if (entry.name.startsWith(".") && entry.name !== ".")
        continue;
      const fullPath = join6(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          await collectFilesWalk(fullPath, depth + 1, ctx, files);
        }
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (ext in INDEXABLE_EXTENSIONS) {
          try {
            const s = await stat(fullPath);
            if (s.size < MAX_FILE_SIZE) {
              files.push({ path: fullPath, mtimeMs: s.mtimeMs });
              ctx.n++;
            }
          } catch {}
        }
      }
      if (ctx.n % 50 === 0)
        await new Promise((r) => setTimeout(r, 0));
    }
  } catch {}
  return files;
}
var IGNORED_DIRS, IGNORED_EXTS, MAX_FILE_SIZE = 500000, MAX_DEPTH = 10, WALK_FILE_CAP = 50000;
var init_utils2 = __esm(() => {
  init_constants();
  IGNORED_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".next",
    "nuxt",
    "vendor",
    "venv",
    "__pycache__",
    ".cache",
    "target",
    "out",
    ".idea",
    ".vscode"
  ]);
  IGNORED_EXTS = new Set([
    ".min.js",
    ".bundle.js",
    ".d.ts",
    ".map",
    ".lock",
    ".yarn"
  ]);
});

// src/utils/worktree-graph-seed.ts
var exports_worktree_graph_seed = {};
__export(exports_worktree_graph_seed, {
  seedWorktreeGraphScope: () => seedWorktreeGraphScope
});
import { existsSync as existsSync5, mkdirSync as mkdirSync4, cpSync } from "fs";
import { join as join7 } from "path";
import { Database as Database2 } from "bun:sqlite";
function validateGraphDatabaseHealth(dbPath, expectedFileCount) {
  try {
    const db = new Database2(dbPath, { readonly: true });
    try {
      const integrityResult = db.prepare("PRAGMA integrity_check").get();
      if (integrityResult.integrity_check !== "ok") {
        return false;
      }
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const hasFilesTable = tables.some((t) => t.name === "files");
      if (!hasFilesTable) {
        return expectedFileCount === 0;
      }
      const countResult = db.prepare("SELECT COUNT(*) as c FROM files").get();
      if (countResult.c !== expectedFileCount) {
        return false;
      }
      return true;
    } finally {
      db.close();
    }
  } catch {
    return false;
  }
}
async function seedWorktreeGraphScope(options) {
  const {
    projectId,
    sourceCwd,
    targetCwd,
    dataDir,
    graphStatusRepo,
    logger
  } = options;
  const log = logger?.log ?? (() => {});
  const sourceCacheDir = resolveGraphCacheDir(projectId, sourceCwd, dataDir);
  const targetCacheDir = resolveGraphCacheDir(projectId, targetCwd, dataDir);
  if (!existsSync5(sourceCacheDir)) {
    const reason = "source cache directory missing";
    log(`graph seed: ${reason} (${sourceCacheDir})`);
    return { seeded: false, reason };
  }
  const sourceMetadata = readGraphCacheMetadata(sourceCacheDir);
  if (!sourceMetadata) {
    const reason = "source metadata file missing";
    log(`graph seed: ${reason} (${sourceCacheDir})`);
    return { seeded: false, reason };
  }
  const sourceGraphDbPath = join7(sourceCacheDir, "graph.db");
  if (!existsSync5(sourceGraphDbPath)) {
    const reason = "source graph.db missing";
    log(`graph seed: ${reason} (${sourceGraphDbPath})`);
    return { seeded: false, reason };
  }
  if (sourceMetadata.indexedFileCount === undefined || sourceMetadata.indexedMaxMtimeMs === undefined) {
    const reason = "source metadata incomplete (missing fingerprint fields)";
    log(`graph seed: ${reason}`);
    return { seeded: false, reason };
  }
  if (existsSync5(targetCacheDir)) {
    const reason = "target cache already exists";
    log(`graph seed: ${reason} (${targetCacheDir})`);
    return { seeded: false, reason };
  }
  const targetFingerprint = await collectIndexFingerprint(targetCwd, targetCacheDir);
  if (targetFingerprint.fileCount !== sourceMetadata.indexedFileCount || targetFingerprint.maxMtimeMs !== sourceMetadata.indexedMaxMtimeMs) {
    const reason = "worktree fingerprint mismatch";
    log(`graph seed: ${reason} (source: ${sourceMetadata.indexedFileCount} files, ${sourceMetadata.indexedMaxMtimeMs} mtime; target: ${targetFingerprint.fileCount} files, ${targetFingerprint.maxMtimeMs} mtime)`);
    return { seeded: false, reason };
  }
  const sourceGraphHealthy = validateGraphDatabaseHealth(sourceGraphDbPath, sourceMetadata.indexedFileCount ?? 0);
  if (!sourceGraphHealthy) {
    const reason = "source graph database unhealthy or empty";
    log(`graph seed: ${reason} (${sourceGraphDbPath})`);
    return { seeded: false, reason };
  }
  try {
    mkdirSync4(targetCacheDir, { recursive: true });
    cpSync(sourceCacheDir, targetCacheDir, { recursive: true, dereference: false });
    log(`graph seed: copied cache from ${sourceCacheDir} to ${targetCacheDir}`);
  } catch (err) {
    const reason = `copy failed: ${err instanceof Error ? err.message : String(err)}`;
    log(`graph seed: ${reason}`);
    return { seeded: false, reason };
  }
  const targetMetadata = {
    projectId: sourceMetadata.projectId,
    cwd: targetCwd,
    createdAt: sourceMetadata.createdAt,
    lastIndexedAt: sourceMetadata.lastIndexedAt,
    indexedFileCount: sourceMetadata.indexedFileCount,
    indexedMaxMtimeMs: sourceMetadata.indexedMaxMtimeMs
  };
  const metadataWriteSuccess = writeGraphCacheMetadata(targetCacheDir, targetMetadata);
  if (!metadataWriteSuccess) {
    const reason = "failed to rewrite target metadata";
    log(`graph seed: ${reason}`);
  }
  let statusCopied = false;
  if (graphStatusRepo) {
    const sourceStatus = readGraphStatus(graphStatusRepo, projectId, sourceCwd);
    if (sourceStatus && sourceStatus.state === "ready" && sourceGraphHealthy) {
      writeGraphStatus(graphStatusRepo, projectId, {
        ...sourceStatus,
        updatedAt: Date.now()
      }, targetCwd);
      statusCopied = true;
      log(`graph seed: copied ready status to worktree scope`);
    } else if (sourceStatus && sourceStatus.state === "ready" && !sourceGraphHealthy) {
      log(`graph seed: skipped status copy - source graph unhealthy`);
    }
  }
  const seedReason = `seeded successfully (${statusCopied ? "with status" : "without status"})`;
  log(`graph seed: ${seedReason}`);
  return { seeded: true, reason: seedReason };
}
var init_worktree_graph_seed = __esm(() => {
  init_graph_projects();
  init_database2();
  init_utils2();
  init_graph_status_store();
});

// src/utils/sandbox-ready.ts
var exports_sandbox_ready = {};
__export(exports_sandbox_ready, {
  waitForSandboxReady: () => waitForSandboxReady
});
import { Database as Database3 } from "bun:sqlite";
import { existsSync as existsSync6 } from "fs";
async function waitForSandboxReady(opts) {
  const { projectId, loopName, dbPath } = opts;
  const pollMs = opts.pollMs ?? 200;
  const timeoutMs = opts.timeoutMs ?? 15000;
  const startTime = Date.now();
  if (!existsSync6(dbPath)) {
    return { ready: false, reason: "db_missing" };
  }
  let db = null;
  try {
    db = new Database3(dbPath, { readonly: true });
    db.run("PRAGMA busy_timeout=5000");
    while (true) {
      const row = db.prepare("SELECT sandbox, sandbox_container FROM loops WHERE project_id = ? AND loop_name = ?").get(projectId, loopName);
      if (!row) {
        if (Date.now() - startTime > timeoutMs) {
          return { ready: false, reason: "timeout" };
        }
        await new Promise((resolve) => setTimeout(resolve, pollMs));
        continue;
      }
      if (row.sandbox !== 1) {
        return { ready: false, reason: "not_sandbox_enabled" };
      }
      if (row.sandbox_container && row.sandbox_container.length > 0) {
        return { ready: true, containerName: row.sandbox_container };
      }
      if (Date.now() - startTime > timeoutMs) {
        return { ready: false, reason: "timeout" };
      }
      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }
  } catch {
    return { ready: false, reason: "timeout" };
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
var init_sandbox_ready = () => {};

// src/sandbox/docker.ts
var exports_docker = {};
__export(exports_docker, {
  createDockerService: () => createDockerService
});
import { spawn } from "child_process";
function createDockerService(logger) {
  const DEFAULT_TIMEOUT = 120000;
  function containerName(worktreeName) {
    return `oc-forge-sandbox-${worktreeName}`;
  }
  async function checkDocker() {
    try {
      const result = await execPromise("docker", ["info"], { timeout: 5000 });
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }
  async function imageExists(image) {
    try {
      const result = await execPromise("docker", ["image", "inspect", image], { timeout: 5000 });
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }
  async function buildImage(dockerfilePath, tag) {
    return new Promise((resolve, reject) => {
      const child = spawn("docker", ["build", "-t", tag, dockerfilePath], {
        stdio: ["ignore", "pipe", "pipe"]
      });
      const stderr = [];
      child.stderr.on("data", (data) => {
        stderr.push(data.toString());
      });
      child.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Docker build failed: ${stderr.join("")}`));
        }
      });
      child.on("error", reject);
    });
  }
  async function createContainer(name, projectDir, image, extraMounts) {
    const args = [
      "run",
      "-d",
      "--name",
      name,
      "-v",
      `${projectDir}:/workspace`
    ];
    if (extraMounts) {
      for (const mount of extraMounts) {
        args.push("-v", mount);
      }
    }
    args.push("-w", "/workspace", image, "sleep", "infinity");
    const result = await execPromise("docker", args, { timeout: 30000 });
    if (result.exitCode !== 0) {
      throw new Error(`Failed to create container: ${result.stderr}`);
    }
  }
  async function removeContainer(name) {
    const result = await execPromise("docker", ["rm", "-f", name], { timeout: 30000 });
    if (result.exitCode !== 0 && !result.stderr.includes("No such container")) {
      throw new Error(`Failed to remove container: ${result.stderr}`);
    }
  }
  async function exec(name, command, opts) {
    const timeout = opts?.timeout ?? DEFAULT_TIMEOUT;
    const cwd = opts?.cwd;
    let fullCommand;
    if (cwd) {
      const safeCwd = cwd.replace(/'/g, "'\\''");
      fullCommand = `cd '${safeCwd}' && ${command}`;
    } else {
      fullCommand = command;
    }
    const args = ["exec", name, "sh", "-c", fullCommand];
    return execPromise("docker", args, { timeout, streaming: true, abort: opts?.abort });
  }
  async function execPipe(name, command, stdin, opts) {
    return execPromise("docker", ["exec", "-i", name, "sh", "-c", command], {
      timeout: opts?.timeout ?? DEFAULT_TIMEOUT,
      stdin,
      abort: opts?.abort
    });
  }
  async function isRunning(name) {
    try {
      const result = await execPromise("docker", ["inspect", "--format={{.State.Running}}", name], {
        timeout: 5000
      });
      return result.stdout.trim() === "true";
    } catch {
      return false;
    }
  }
  async function listContainersByPrefix(prefix) {
    try {
      const result = await execPromise("docker", ["ps", "-a", "--filter", `name=${prefix}`, "--format", "{{.Names}}"], { timeout: 5000 });
      if (result.exitCode !== 0)
        return [];
      return result.stdout.trim().split(`
`).filter(Boolean);
    } catch {
      return [];
    }
  }
  function execPromise(command, args, options) {
    const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
    const cmdPreview = args.slice(-1)[0]?.slice(0, 80) ?? "";
    let hardDeadlineId;
    const inner = new Promise((resolve) => {
      const stdioConfig = options?.stdin ? "pipe" : "ignore";
      const child = spawn(command, args, {
        stdio: [stdioConfig, "pipe", "pipe"]
      });
      let stdout = "";
      let stderr = "";
      let timedOut = false;
      let settled = false;
      function settle(result) {
        if (settled)
          return;
        settled = true;
        clearTimeout(timeoutId);
        clearTimeout(hardDeadlineId);
        resolve(result);
      }
      const timeoutId = setTimeout(() => {
        timedOut = true;
        logger.log(`[docker] timeout (${timeout}ms) for: ${cmdPreview}`);
        child.kill("SIGTERM");
        setTimeout(() => {
          if (!settled) {
            logger.log(`[docker] SIGKILL after SIGTERM for: ${cmdPreview}`);
            child.kill("SIGKILL");
          }
        }, 5000);
      }, timeout);
      if (options?.abort) {
        const onAbort = () => {
          logger.log(`[docker] abort signal for: ${cmdPreview}`);
          child.kill("SIGTERM");
          setTimeout(() => {
            if (!settled)
              child.kill("SIGKILL");
          }, 5000);
        };
        if (options.abort.aborted) {
          onAbort();
        } else {
          options.abort.addEventListener("abort", onAbort, { once: true });
        }
      }
      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      if (options?.stdin) {
        child.stdin.write(options.stdin);
        child.stdin.end();
      }
      child.on("close", (code) => {
        if (timedOut) {
          logger.log(`[docker] close after timeout, code=${code} for: ${cmdPreview}`);
        }
        settle({
          stdout,
          stderr,
          exitCode: timedOut ? 124 : code ?? 1
        });
      });
      child.on("error", (err) => {
        logger.log(`[docker] spawn error: ${err.message} for: ${cmdPreview}`);
        settle({
          stdout,
          stderr: stderr + err.message,
          exitCode: 1
        });
      });
    });
    const hardDeadline = timeout + 1e4;
    const deadlinePromise = new Promise((resolve) => {
      hardDeadlineId = setTimeout(() => {
        logger.log(`[docker] hard deadline (${hardDeadline}ms) hit for: ${cmdPreview}`);
        resolve({ stdout: "", stderr: `Command exceeded hard deadline of ${hardDeadline}ms`, exitCode: 124 });
      }, hardDeadline);
    });
    return Promise.race([inner, deadlinePromise]);
  }
  return {
    checkDocker,
    imageExists,
    buildImage,
    createContainer,
    removeContainer,
    exec,
    execPipe,
    isRunning,
    containerName,
    listContainersByPrefix
  };
}
var init_docker = () => {};

// src/tui.tsx
import { insert as _$insert } from "@opentui/solid";
import { createTextNode as _$createTextNode } from "@opentui/solid";
import { effect as _$effect } from "@opentui/solid";
import { insertNode as _$insertNode } from "@opentui/solid";
import { use as _$use } from "@opentui/solid";
import { setProp as _$setProp } from "@opentui/solid";
import { createElement as _$createElement } from "@opentui/solid";
import { memo as _$memo } from "@opentui/solid";
import { createComponent as _$createComponent } from "@opentui/solid";
import { createEffect, createMemo, createSignal, onCleanup, Show, For } from "solid-js";
import { SyntaxStyle } from "@opentui/core";
import { readFileSync as readFileSync4, existsSync as existsSync13, writeFileSync as writeFileSync2 } from "fs";
import { homedir as homedir3, platform as platform3 } from "os";
import { join as join14 } from "path";
import { Database as Database9 } from "bun:sqlite";

// src/version.ts
var VERSION = "0.2.5";

// src/tui.tsx
init_storage();

// src/utils/session-stats.ts
function extractActivity(parts) {
  const toolCalls = [];
  const textLines = [];
  const toolLines = [];
  const subtaskLines = [];
  const reasoningLines = [];
  for (const p of parts) {
    if (p.type === "text" && typeof p.text === "string" && p.text.trim()) {
      textLines.push(p.text.trim());
    } else if (p.type === "tool" && p.tool && p.state) {
      const s = p.state;
      const name = p.tool;
      const status = s.status;
      if (status === "completed") {
        const title = s.title ?? name;
        toolCalls.push({ tool: name, title, status: "completed" });
        toolLines.push(`[done] ${name}: ${title}`);
      } else if (status === "running") {
        const title = s.title ?? name;
        toolCalls.push({ tool: name, title, status: "running" });
        toolLines.push(`[running] ${name}: ${title}`);
      } else if (status === "error") {
        const msg = s.error ?? "error";
        toolCalls.push({ tool: name, title: msg, status: "error" });
        toolLines.push(`[error] ${name}: ${msg}`);
      } else if (status === "pending") {
        toolCalls.push({ tool: name, title: name, status: "pending" });
        toolLines.push(`[pending] ${name}`);
      }
    } else if (p.type === "subtask" && p.description) {
      const agentLabel = p.agent ? `${p.agent}: ` : "";
      subtaskLines.push(`-> ${agentLabel}${p.description}`);
    } else if (p.type === "reasoning" && typeof p.text === "string" && p.text.trim()) {
      reasoningLines.push(p.text.trim());
    }
  }
  let summary = "";
  if (textLines.length > 0) {
    summary = textLines.join(`
`);
  } else if (toolLines.length > 0) {
    summary = toolLines.join(`
`);
  } else if (subtaskLines.length > 0) {
    summary = subtaskLines.join(`
`);
  } else if (reasoningLines.length > 0) {
    summary = reasoningLines.join(`
`);
  }
  if (!summary && toolCalls.length === 0)
    return null;
  return { summary, toolCalls };
}
async function fetchSessionStats(api, sessionId, directory) {
  if (!directory || !sessionId) {
    return null;
  }
  try {
    const messagesResult = await api.client.session.messages({
      sessionID: sessionId,
      directory
    });
    const messages = messagesResult.data ?? [];
    const assistantMessages = messages.filter((m) => m.info.role === "assistant");
    let lastActivity = null;
    for (let i = assistantMessages.length - 1;i >= Math.max(0, assistantMessages.length - 3); i--) {
      const result = extractActivity(assistantMessages[i].parts);
      if (result) {
        lastActivity = result;
        break;
      }
    }
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalReasoningTokens = 0;
    let totalCacheRead = 0;
    let totalCacheWrite = 0;
    let totalCost = 0;
    for (const msg of messages) {
      totalCost += msg.info.cost ?? 0;
      const tokens = msg.info.tokens;
      if (tokens) {
        totalInputTokens += tokens.input ?? 0;
        totalOutputTokens += tokens.output ?? 0;
        totalReasoningTokens += tokens.reasoning ?? 0;
        totalCacheRead += tokens.cache?.read ?? 0;
        totalCacheWrite += tokens.cache?.write ?? 0;
      }
    }
    const sessionResult = await api.client.session.get({
      sessionID: sessionId,
      directory
    });
    const session = sessionResult.data;
    const fileChanges = session?.summary ? {
      additions: session.summary.additions,
      deletions: session.summary.deletions,
      files: session.summary.files
    } : null;
    const timing = session?.time?.created && session?.time?.updated ? {
      created: session.time.created,
      updated: session.time.updated,
      durationMs: new Date(session.time.updated).getTime() - new Date(session.time.created).getTime()
    } : null;
    return {
      tokens: {
        input: totalInputTokens,
        output: totalOutputTokens,
        reasoning: totalReasoningTokens,
        cacheRead: totalCacheRead,
        cacheWrite: totalCacheWrite,
        total: totalInputTokens + totalOutputTokens + totalReasoningTokens + totalCacheRead + totalCacheWrite
      },
      cost: totalCost,
      messages: {
        total: messages.length,
        assistant: assistantMessages.length
      },
      fileChanges,
      timing,
      lastActivity
    };
  } catch {
    return null;
  }
}

// src/utils/logger.ts
var MAX_LOG_FILE_SIZE = 10 * 1024 * 1024;
function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 50);
}

// src/utils/plan-execution.ts
var PLAN_EXECUTION_LABELS = [
  "New session",
  "Execute here",
  "Loop (worktree)",
  "Loop"
];
function extractPlanTitle(planContent) {
  const headingMatch = planContent.match(/^#+\s+(.+)$/m);
  if (headingMatch?.[1]) {
    const title = headingMatch[1].trim();
    return title.length > 60 ? `${title.substring(0, 57)}...` : title;
  }
  const firstLine = planContent.split(`
`)[0]?.trim();
  if (firstLine) {
    return firstLine.length > 60 ? `${firstLine.substring(0, 57)}...` : firstLine;
  }
  return "Implementation Plan";
}
function extractLoopName(planContent) {
  const loopNameMatch = planContent.match(/^(?:\s*(?:-\s*)?)?(?:\*\*)?Loop Name(?:\*\*)?:\s*(.+)$/m);
  if (loopNameMatch?.[1]) {
    const name = loopNameMatch[1].trim();
    return name.length > 60 ? name.substring(0, 60) : name;
  }
  const title = extractPlanTitle(planContent);
  return title;
}
function extractLoopNames(planContent) {
  const displayName = extractLoopName(planContent);
  const executionName = sanitizeLoopName(displayName);
  return { displayName, executionName };
}
function sanitizeLoopName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 60) || "loop";
}
function normalizeModeLabel(label) {
  return label.toLowerCase();
}
function matchExecutionLabel(input) {
  const normalized = normalizeModeLabel(input);
  for (const label of PLAN_EXECUTION_LABELS) {
    if (normalized === label.toLowerCase() || normalized.startsWith(label.toLowerCase())) {
      return label;
    }
  }
  return null;
}

// src/utils/loop-launch.ts
import { Database as Database4 } from "bun:sqlite";
import { existsSync as existsSync7 } from "fs";
import { join as join8 } from "path";

// src/services/loop.ts
function generateUniqueName(baseName, existingNames) {
  const maxLength = 25;
  const truncated = baseName.length > maxLength ? baseName.substring(0, maxLength) : baseName;
  if (!existingNames.includes(truncated)) {
    return truncated;
  }
  let counter = 1;
  let candidate = `${truncated}-${counter}`;
  while (existingNames.includes(candidate)) {
    counter++;
    candidate = `${truncated}-${counter}`;
  }
  return candidate;
}

// src/utils/loop-launch.ts
init_storage();

// src/constants/loop.ts
function buildLoopPermissionRuleset(options) {
  const isWorktree = options?.isWorktree ?? false;
  const isSandbox = options?.isSandbox ?? false;
  const rules = [];
  if (isWorktree) {
    rules.push({ permission: "*", pattern: "*", action: "allow" });
    if (isSandbox) {
      rules.push({ permission: "external_directory", pattern: "*", action: "allow" });
    } else {
      rules.push({ permission: "external_directory", pattern: "*", action: "deny" });
    }
  }
  rules.push({ permission: "bash", pattern: "git push *", action: "deny" }, { permission: "loop-cancel", pattern: "*", action: "deny" }, { permission: "loop-status", pattern: "*", action: "deny" });
  return rules;
}

// src/utils/tui-graph-status.ts
init_graph_status_store();
init_storage();
import { Database } from "bun:sqlite";
import { existsSync as existsSync2 } from "fs";
import { join as join2 } from "path";
function getDbPath() {
  return join2(resolveDataDir(), "graph.db");
}
function readGraphStatus2(projectId, dbPathOverride, cwd) {
  const dbPath = dbPathOverride || getDbPath();
  if (!existsSync2(dbPath))
    return null;
  let db = null;
  try {
    db = new Database(dbPath, { readonly: true });
    const repo = createGraphStatusRepo(db);
    const row = repo.read(projectId, cwd ?? "");
    if (!row)
      return null;
    return {
      state: row.state,
      ready: row.ready,
      stats: row.stats ?? undefined,
      message: row.message ?? undefined,
      updatedAt: row.updatedAt
    };
  } catch {
    return null;
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
async function waitForGraphReady(projectId, options) {
  const pollMs = options?.pollMs ?? 100;
  const timeoutMs = options?.timeoutMs ?? 30000;
  const startTime = Date.now();
  const missingStatusTimeout = 2000;
  while (true) {
    const status = readGraphStatus2(projectId, options?.dbPathOverride, options?.cwd);
    if (isGraphReady(status)) {
      return status;
    }
    if (!status) {
      if (Date.now() - startTime > missingStatusTimeout) {
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, pollMs));
      continue;
    }
    if (Date.now() - startTime > timeoutMs) {
      return "timeout";
    }
    if (status.state === "error" || status.state === "unavailable") {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}
function formatGraphStatus(status) {
  if (!status) {
    return { text: "unavailable", color: "textMuted" };
  }
  switch (status.state) {
    case "ready":
      if (status.stats) {
        return {
          text: `ready · ${status.stats.files} files`,
          color: "success"
        };
      }
      return {
        text: "ready",
        color: "success"
      };
    case "indexing":
      return { text: status.message || "indexing", color: "warning" };
    case "initializing":
      return { text: "initializing", color: "info" };
    case "error":
      return { text: "error", color: "error" };
    case "unavailable":
    default:
      return { text: "unavailable", color: "textMuted" };
  }
}

// src/utils/loop-launch.ts
init_setup();
init_loops_repo();

// src/utils/loop-session.ts
async function createLoopSessionWithWorkspace(input) {
  const createParams = {
    title: input.title,
    directory: input.directory,
    permission: input.permission
  };
  if (input.workspaceId) {
    createParams.workspaceID = input.workspaceId;
  }
  const createResult = await input.v2.session.create(createParams);
  if (createResult.error || !createResult.data) {
    input.logger.error(`${input.logPrefix}: failed to create session`, createResult.error);
    return null;
  }
  const result = {
    sessionId: createResult.data.id,
    bindFailed: false
  };
  if (input.workspaceId) {
    try {
      await bindSessionToWorkspace(input.v2, input.workspaceId, result.sessionId);
      result.boundWorkspaceId = input.workspaceId;
      input.logger.log(`${input.logPrefix}: workspace ${input.workspaceId} bound to session ${result.sessionId}`);
    } catch (bindErr) {
      input.logger.error(`${input.logPrefix}: failed to bind session to workspace; clearing workspace id`, bindErr);
      result.bindFailed = true;
    }
  }
  return result;
}

// src/utils/loop-launch.ts
async function launchFreshLoop(options) {
  const { planText, title, directory, projectId, isWorktree, api } = options;
  const { displayName, executionName } = extractLoopNames(planText);
  const dbPath = options.dbPath ?? join8(resolveDataDir(), "graph.db");
  const existingNames = [];
  if (existsSync7(dbPath)) {
    let db = null;
    try {
      db = new Database4(dbPath, { readonly: true });
      const stmt = db.prepare("SELECT loop_name FROM loops WHERE project_id = ?");
      const rows = stmt.all(projectId);
      for (const row of rows) {
        existingNames.push(row.loop_name);
      }
    } catch {} finally {
      try {
        db?.close();
      } catch {}
    }
  }
  const uniqueWorktreeName = generateUniqueName(executionName, existingNames);
  let sessionId;
  let worktreeBranch;
  let workspaceId;
  let hostWorktreeDir;
  const config = loadPluginConfig();
  const isSandboxEnabled = options.sandboxEnabled ?? config.sandbox?.mode === "docker";
  if (isWorktree) {
    const worktreeResult = await api.client.worktree.create({
      worktreeCreateInput: { name: uniqueWorktreeName }
    });
    if (worktreeResult.error || !worktreeResult.data) {
      return null;
    }
    hostWorktreeDir = worktreeResult.data.directory;
    worktreeBranch = worktreeResult.data.branch;
    const seedResult = await (async () => {
      try {
        const { seedWorktreeGraphScope: seedWorktreeGraphScope2 } = await Promise.resolve().then(() => (init_worktree_graph_seed(), exports_worktree_graph_seed));
        return await seedWorktreeGraphScope2({
          projectId: options.projectId,
          sourceCwd: directory,
          targetCwd: hostWorktreeDir,
          dataDir: resolveDataDir()
        });
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        return { seeded: false, reason };
      }
    })();
    console.log(`loop-launch: graph seed ${seedResult.seeded ? "reused" : "skipped"} (${seedResult.reason})`);
    const workspace = await createLoopWorkspace(api.client, {
      loopName: uniqueWorktreeName,
      directory: hostWorktreeDir,
      branch: worktreeBranch
    });
    if (!workspace) {
      console.log(`loop-launch: workspace API unavailable or create failed; continuing without workspace backing for ${uniqueWorktreeName}`);
    }
    const permissionRuleset = buildLoopPermissionRuleset({
      isWorktree: true,
      isSandbox: isSandboxEnabled
    });
    console.log(`loop-launch: creating session with directory=${hostWorktreeDir} (sandbox: ${isSandboxEnabled})`);
    const createResult = await createLoopSessionWithWorkspace({
      v2: api.client,
      title: `Loop: ${title}`,
      directory: hostWorktreeDir,
      permission: permissionRuleset,
      workspaceId: workspace?.workspaceId,
      logPrefix: "loop-launch",
      logger: console
    });
    if (!createResult) {
      return null;
    }
    sessionId = createResult.sessionId;
    workspaceId = createResult.boundWorkspaceId;
    if (createResult.bindFailed) {
      console.error("loop-launch: continuing without workspace backing");
    }
  } else {
    const permissionRuleset = buildLoopPermissionRuleset({
      isWorktree: false
    });
    const createResult = await api.client.session.create({
      title: `Loop: ${title}`,
      directory,
      permission: permissionRuleset
    });
    if (createResult.error || !createResult.data) {
      return null;
    }
    sessionId = createResult.data.id;
  }
  const dbExists = existsSync7(dbPath);
  const loopState = {
    active: true,
    sessionId,
    loopName: uniqueWorktreeName,
    projectDir: directory,
    worktreeDir: hostWorktreeDir ?? directory,
    worktreeBranch,
    iteration: 1,
    maxIterations: 0,
    startedAt: new Date().toISOString(),
    prompt: planText,
    phase: "coding",
    audit: true,
    errorCount: 0,
    auditCount: 0,
    worktree: isWorktree,
    sandbox: isSandboxEnabled,
    executionModel: options.executionModel,
    auditorModel: options.auditorModel,
    workspaceId
  };
  if (dbExists) {
    let db = null;
    try {
      db = new Database4(dbPath);
      db.run("PRAGMA busy_timeout=5000");
      const now = Date.now();
      console.log(`[forge] loop-launch: storing loop state executionModel=${loopState.executionModel || "(default)"} auditorModel=${loopState.auditorModel || "(default)"}`);
      const row = {
        projectId,
        loopName: uniqueWorktreeName,
        status: "running",
        currentSessionId: sessionId,
        worktree: isWorktree,
        worktreeDir: hostWorktreeDir ?? directory,
        worktreeBranch: worktreeBranch ?? null,
        projectDir: directory,
        maxIterations: loopState.maxIterations,
        iteration: loopState.iteration,
        auditCount: loopState.auditCount,
        errorCount: loopState.errorCount,
        phase: loopState.phase,
        audit: loopState.audit,
        executionModel: loopState.executionModel ?? null,
        auditorModel: loopState.auditorModel ?? null,
        modelFailed: false,
        sandbox: isSandboxEnabled,
        sandboxContainer: null,
        startedAt: now,
        completedAt: null,
        terminationReason: null,
        completionSummary: null,
        workspaceId: workspaceId ?? null,
        hostSessionId: options.hostSessionId ?? null
      };
      const large = {
        prompt: planText,
        lastAuditResult: null
      };
      const inserted = createLoopsRepo(db).insert(row, large);
      if (!inserted) {
        throw new Error(`Failed to insert loop state for ${uniqueWorktreeName}`);
      }
    } catch (err) {
      console.error("[forge] loop-launch: failed to persist loop state", err);
      if (sessionId) {
        try {
          await api.client.session.abort({ sessionID: sessionId });
        } catch (abortErr) {
          console.error("[forge] loop-launch: failed to abort session after error", abortErr);
        }
      }
      return null;
    } finally {
      try {
        db?.close();
      } catch {}
    }
  }
  const promptText = planText;
  if (isWorktree && hostWorktreeDir) {
    try {
      await waitForGraphReady(projectId, {
        dbPathOverride: dbPath,
        cwd: hostWorktreeDir,
        pollMs: 100,
        timeoutMs: 5000
      });
    } catch {}
  }
  if (isWorktree && isSandboxEnabled && dbExists && !options.skipSandboxWait) {
    const { waitForSandboxReady: waitForSandboxReady2 } = await Promise.resolve().then(() => (init_sandbox_ready(), exports_sandbox_ready));
    const waitResult = await waitForSandboxReady2({
      projectId,
      loopName: uniqueWorktreeName,
      dbPath,
      pollMs: 200,
      timeoutMs: 15000
    });
    if (!waitResult.ready) {
      console.error(`[forge] loop-launch: sandbox not ready (${waitResult.reason}); aborting launch`);
      try {
        const { createDockerService: createDockerService2 } = await Promise.resolve().then(() => (init_docker(), exports_docker));
        const docker = createDockerService2(console);
        const containerName = docker.containerName(uniqueWorktreeName);
        if (await docker.isRunning(containerName)) {
          await docker.removeContainer(containerName);
          console.log(`[forge] loop-launch: removed sandbox container ${containerName} after aborted launch`);
        }
      } catch (err) {
        console.error("[forge] loop-launch: failed to remove sandbox container after abort", err);
      }
      let db = null;
      try {
        db = new Database4(dbPath);
        db.run("PRAGMA busy_timeout=5000");
        const now = Date.now();
        db.prepare(`
          UPDATE loops SET
            status = ?,
            completed_at = ?,
            termination_reason = ?,
            completion_summary = ?
          WHERE project_id = ? AND loop_name = ?
        `).run("errored", now, "sandbox_start_failed: " + waitResult.reason, null, projectId, uniqueWorktreeName);
      } catch (err) {
        console.error("[forge] loop-launch: failed to mark loop inactive after sandbox timeout", err);
      } finally {
        try {
          db?.close();
        } catch (err) {
          console.error("[forge] loop-launch: failed to close db", err);
        }
      }
      return null;
    }
    console.log(`[forge] loop-launch: sandbox ready container=${waitResult.containerName}`);
  }
  const loopModel = parseModelString(options.executionModel) ?? parseModelString(config.loop?.model) ?? parseModelString(config.executionModel);
  const sessionDir = loopState.worktreeDir;
  console.log(`loop-launch: initial prompt sessionID=${sessionId} dir=${sessionDir} model=${loopModel ? `${loopModel.providerID}/${loopModel.modelID}` : "(default)"}`);
  const promptParts = [{ type: "text", text: promptText }];
  const { result: promptResult } = await retryWithModelFallback(() => loopModel ? api.client.session.promptAsync({ sessionID: sessionId, directory: sessionDir, agent: "code", model: loopModel, parts: promptParts }) : api.client.session.promptAsync({ sessionID: sessionId, directory: sessionDir, agent: "code", parts: promptParts }), () => api.client.session.promptAsync({ sessionID: sessionId, directory: sessionDir, agent: "code", parts: promptParts }), loopModel, console);
  if (promptResult.error) {
    return null;
  }
  return {
    sessionId,
    loopName: displayName,
    executionName: uniqueWorktreeName,
    isWorktree,
    worktreeDir: hostWorktreeDir ?? directory,
    worktreeBranch,
    workspaceId,
    hostSessionId: options.hostSessionId
  };
}

// src/utils/tui-plan-store.ts
init_storage();
init_loops_repo();
import { Database as Database5 } from "bun:sqlite";
import { existsSync as existsSync8 } from "fs";
import { join as join9 } from "path";
function getDbPath2() {
  return join9(resolveDataDir(), "graph.db");
}
function resolveLoopNameForSession(db, projectId, sessionID) {
  const loopsRepo = createLoopsRepo(db);
  const row = loopsRepo.getBySessionId(projectId, sessionID);
  return row?.loopName ?? null;
}
function readPlan(projectId, sessionID, dbPathOverride) {
  const dbPath = dbPathOverride || getDbPath2();
  if (!existsSync8(dbPath))
    return null;
  let db = null;
  try {
    db = new Database5(dbPath, { readonly: true });
    const plansRepo = createPlansRepo(db);
    const loopsRepo = createLoopsRepo(db);
    const loopName = resolveLoopNameForSession(db, projectId, sessionID);
    if (loopName) {
      const fromExecution = loopsRepo.getLarge(projectId, loopName)?.prompt;
      if (fromExecution)
        return fromExecution;
      const planRow2 = plansRepo.getForLoop(projectId, loopName);
      if (planRow2)
        return planRow2.content;
    }
    const planRow = plansRepo.getForSession(projectId, sessionID);
    return planRow?.content ?? null;
  } catch {
    return null;
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
function writePlan(projectId, sessionID, content, dbPathOverride) {
  const dbPath = dbPathOverride || getDbPath2();
  if (!existsSync8(dbPath))
    return false;
  let db = null;
  try {
    db = new Database5(dbPath);
    db.run("PRAGMA busy_timeout=5000");
    const plansRepo = createPlansRepo(db);
    const loopsRepo = createLoopsRepo(db);
    const loopName = resolveLoopNameForSession(db, projectId, sessionID);
    if (loopName) {
      loopsRepo.updatePrompt(projectId, loopName, content);
    } else {
      plansRepo.writeForSession(projectId, sessionID, content);
    }
    return true;
  } catch {
    return false;
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
function deletePlan(projectId, sessionID, dbPathOverride) {
  const dbPath = dbPathOverride || getDbPath2();
  if (!existsSync8(dbPath))
    return false;
  let db = null;
  try {
    db = new Database5(dbPath);
    db.run("PRAGMA busy_timeout=5000");
    const plansRepo = createPlansRepo(db);
    const loopsRepo = createLoopsRepo(db);
    const loopName = resolveLoopNameForSession(db, projectId, sessionID);
    if (loopName) {
      loopsRepo.updatePrompt(projectId, loopName, "");
      return true;
    } else {
      plansRepo.deleteForSession(projectId, sessionID);
      return true;
    }
  } catch {
    return false;
  } finally {
    try {
      db?.close();
    } catch {}
  }
}

// src/utils/tui-refresh-helpers.ts
init_storage();
import { Database as Database6 } from "bun:sqlite";
import { existsSync as existsSync9 } from "fs";
import { join as join10 } from "path";
function getDbPath3() {
  return join10(resolveDataDir(), "graph.db");
}
function readLoopStates(projectId, dbPathOverride) {
  const dbPath = dbPathOverride || getDbPath3();
  if (!existsSync9(dbPath))
    return [];
  let db = null;
  try {
    db = new Database6(dbPath, { readonly: true });
    const stmt = db.prepare(`
      SELECT project_id, loop_name, status, current_session_id, worktree, worktree_dir,
             worktree_branch, project_dir, max_iterations, iteration, audit_count,
             error_count, phase, audit, execution_model, auditor_model,
             model_failed, sandbox, sandbox_container, started_at, completed_at,
             termination_reason, completion_summary, workspace_id, host_session_id
      FROM loops
      WHERE project_id = ?
      ORDER BY started_at DESC
    `);
    const rows = stmt.all(projectId);
    const loops = [];
    for (const row of rows) {
      loops.push({
        name: row.loop_name,
        phase: row.phase,
        iteration: row.iteration,
        maxIterations: row.max_iterations,
        sessionId: row.current_session_id,
        active: row.status === "running",
        startedAt: new Date(row.started_at).toISOString(),
        completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
        terminationReason: row.termination_reason ?? undefined,
        worktreeBranch: row.worktree_branch ?? undefined,
        worktree: row.worktree === 1,
        worktreeDir: row.worktree_dir,
        executionModel: row.execution_model ?? undefined,
        auditorModel: row.auditor_model ?? undefined,
        workspaceId: row.workspace_id ?? undefined,
        hostSessionId: row.host_session_id ?? undefined
      });
    }
    return loops;
  } catch {
    return [];
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
function readLoopByName(projectId, loopName, dbPathOverride) {
  const dbPath = dbPathOverride || getDbPath3();
  if (!existsSync9(dbPath))
    return null;
  let db = null;
  try {
    db = new Database6(dbPath, { readonly: true });
    const row = db.prepare(`
      SELECT project_id, loop_name, status, current_session_id, worktree, worktree_dir,
             worktree_branch, project_dir, max_iterations, iteration, audit_count,
             error_count, phase, audit, execution_model, auditor_model,
             model_failed, sandbox, sandbox_container, started_at, completed_at,
             termination_reason, completion_summary, workspace_id, host_session_id
      FROM loops
      WHERE project_id = ? AND loop_name = ?
    `).get(projectId, loopName);
    if (!row)
      return null;
    return {
      name: row.loop_name,
      phase: row.phase,
      iteration: row.iteration,
      maxIterations: row.max_iterations,
      sessionId: row.current_session_id,
      active: row.status === "running",
      startedAt: new Date(row.started_at).toISOString(),
      completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
      terminationReason: row.termination_reason ?? undefined,
      worktreeBranch: row.worktree_branch ?? undefined,
      worktree: row.worktree === 1,
      worktreeDir: row.worktree_dir,
      executionModel: row.execution_model ?? undefined,
      auditorModel: row.auditor_model ?? undefined,
      workspaceId: row.workspace_id ?? undefined,
      hostSessionId: row.host_session_id ?? undefined
    };
  } catch {
    return null;
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
function shouldPollSidebar(loops, graphStatus) {
  const hasActiveWorktreeLoops = loops.some((l) => l.active && l.worktree);
  const isGraphTransient2 = graphStatus !== null && (graphStatus.state === "initializing" || graphStatus.state === "indexing");
  return hasActiveWorktreeLoops || isGraphTransient2;
}

// src/utils/tui-execution-preferences.ts
init_storage();
import { Database as Database7 } from "bun:sqlite";
import { existsSync as existsSync10 } from "fs";
import { join as join11 } from "path";
var PREFERENCES_KEY = "tui:plan-execution-preferences";
var TTL_MS = 30 * 24 * 60 * 60 * 1000;
function getDbPath4() {
  return join11(resolveDataDir(), "graph.db");
}
function readExecutionPreferences(projectId, dbPathOverride) {
  const dbPath = dbPathOverride || getDbPath4();
  if (!existsSync10(dbPath))
    return null;
  let db = null;
  try {
    db = new Database7(dbPath, { readonly: true });
    const repo = createTuiPrefsRepo(db);
    const stored = repo.get(projectId, PREFERENCES_KEY);
    if (!stored)
      return null;
    return {
      mode: stored.mode ?? "Loop (worktree)",
      executionModel: stored.executionModel,
      auditorModel: stored.auditorModel
    };
  } catch {
    return null;
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
function writeExecutionPreferences(projectId, prefs, dbPathOverride) {
  const dbPath = dbPathOverride || getDbPath4();
  if (!existsSync10(dbPath))
    return false;
  let db = null;
  try {
    db = new Database7(dbPath);
    db.run("PRAGMA busy_timeout=5000");
    const repo = createTuiPrefsRepo(db);
    repo.set(projectId, PREFERENCES_KEY, prefs, TTL_MS);
    return true;
  } catch {
    return false;
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
function resolveExecutionDialogDefaults(config, storedPrefs) {
  const mode = storedPrefs?.mode ?? "Loop (worktree)";
  const executionModel = storedPrefs?.executionModel ?? config.loop?.model ?? config.executionModel ?? "";
  const auditorModel = storedPrefs?.auditorModel ?? config.auditorModel ?? storedPrefs?.executionModel ?? config.loop?.model ?? config.executionModel ?? "";
  return { mode, executionModel, auditorModel };
}

// src/utils/tui-models.ts
init_storage();
import { Database as Database8 } from "bun:sqlite";
import { existsSync as existsSync11 } from "fs";
import { join as join12 } from "path";
async function fetchAvailableModels(api) {
  try {
    const directory = api.state.path.directory;
    const configuredProviderIds = Object.keys(api.state.config?.provider ?? {});
    const result = await api.client.provider.list({ directory });
    if (result.error) {
      const errorMsg = result.error?.message || "Failed to fetch providers";
      const nestedErrorMsg = result.error?.data?.message;
      return {
        providers: [],
        connectedProviderIds: [],
        configuredProviderIds,
        error: nestedErrorMsg || errorMsg
      };
    }
    if (!result.data) {
      return {
        providers: [],
        connectedProviderIds: [],
        configuredProviderIds,
        error: "No provider data returned"
      };
    }
    const providers = [];
    const allModels = result.data.all || [];
    for (const provider of allModels) {
      const models = [];
      if (provider.models) {
        for (const modelData of Object.values(provider.models)) {
          models.push({
            id: modelData.id,
            name: modelData.name,
            providerID: provider.id,
            providerName: provider.name,
            fullName: `${provider.id}/${modelData.id}`,
            releaseDate: modelData.release_date,
            capabilities: {
              temperature: modelData.capabilities?.temperature,
              toolcall: modelData.capabilities?.toolcall,
              reasoning: modelData.capabilities?.reasoning,
              attachment: modelData.capabilities?.attachment
            },
            cost: modelData.cost
          });
        }
      }
      providers.push({
        id: provider.id,
        name: provider.name,
        models
      });
    }
    return {
      providers,
      connectedProviderIds: result.data.connected || [],
      configuredProviderIds
    };
  } catch (err) {
    return {
      providers: [],
      connectedProviderIds: [],
      configuredProviderIds: Object.keys(api.state.config?.provider ?? {}),
      error: err instanceof Error ? err.message : "Failed to fetch providers"
    };
  }
}
function flattenProviders(providers) {
  const allModels = [];
  for (const provider of providers) {
    allModels.push(...provider.models);
  }
  return sortModelsByPriority(allModels, {});
}
function buildDialogSelectOptions(models, recents = []) {
  const defaultOption = {
    title: "Use default",
    value: "",
    description: "Use config default model"
  };
  const modelMap = new Map(models.map((m) => [m.fullName, m]));
  const usedInSections = new Set;
  const recentOptions = recents.filter((fn) => !usedInSections.has(fn)).map((fn) => modelMap.get(fn)).filter((m) => !!m).map((m) => {
    usedInSections.add(m.fullName);
    return {
      title: m.name,
      value: m.fullName,
      description: m.providerName,
      category: "Recent"
    };
  });
  const providerOptions = models.filter((m) => !usedInSections.has(m.fullName)).map((m) => ({
    title: m.name,
    value: m.fullName,
    description: m.capabilities?.reasoning ? "Reasoning" : undefined,
    category: m.providerName
  }));
  return [defaultOption, ...recentOptions, ...providerOptions];
}
function getModelDisplayLabel(value, models) {
  if (!value)
    return "default";
  const model = models.find((m) => m.fullName === value);
  return model ? model.name : value;
}
var RECENT_MODELS_KEY = "tui:model-recents";
var RECENT_MODELS_MAX = 10;
var RECENT_MODELS_TTL_MS = 90 * 24 * 60 * 60 * 1000;
function getDbPath5() {
  return join12(resolveDataDir(), "graph.db");
}
function getRecentModels(projectId, dbPathOverride) {
  const dbPath = dbPathOverride || getDbPath5();
  if (!existsSync11(dbPath))
    return [];
  let db = null;
  try {
    db = new Database8(dbPath, { readonly: true });
    const repo = createTuiPrefsRepo(db);
    const stored = repo.get(projectId, RECENT_MODELS_KEY);
    return stored && Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
function recordRecentModel(projectId, modelFullName, dbPathOverride) {
  if (!modelFullName)
    return;
  const dbPath = dbPathOverride || getDbPath5();
  if (!existsSync11(dbPath))
    return;
  let db = null;
  try {
    db = new Database8(dbPath);
    db.run("PRAGMA busy_timeout=5000");
    const repo = createTuiPrefsRepo(db);
    const existing = getRecentModels(projectId, dbPath);
    const updated = [modelFullName, ...existing.filter((m) => m !== modelFullName)].slice(0, RECENT_MODELS_MAX);
    repo.set(projectId, RECENT_MODELS_KEY, updated, RECENT_MODELS_TTL_MS);
  } catch {} finally {
    try {
      db?.close();
    } catch {}
  }
}
function sortModelsByPriority(models, options = {}) {
  const recentSet = new Set(options.recents ?? []);
  const connectedProviderSet = new Set(options.connectedProviderIds ?? []);
  const configuredProviderSet = new Set(options.configuredProviderIds ?? []);
  const getProviderPriority = (model) => {
    if (connectedProviderSet.has(model.providerID))
      return 0;
    if (configuredProviderSet.has(model.providerID))
      return 1;
    return 2;
  };
  return models.sort((a, b) => {
    const aIsRecent = recentSet.has(a.fullName);
    const bIsRecent = recentSet.has(b.fullName);
    if (aIsRecent && !bIsRecent)
      return -1;
    if (!aIsRecent && bIsRecent)
      return 1;
    const providerPriorityDiff = getProviderPriority(a) - getProviderPriority(b);
    if (providerPriorityDiff !== 0)
      return providerPriorityDiff;
    const providerNameDiff = a.providerName.localeCompare(b.providerName);
    if (providerNameDiff !== 0)
      return providerNameDiff;
    return a.name.localeCompare(b.name);
  });
}

// src/utils/project-id.ts
import { execSync } from "child_process";
import { existsSync as existsSync12, readFileSync as readFileSync3 } from "fs";
import { isAbsolute, join as join13, resolve } from "path";
var cache = new Map;
function getGitProjectId(dir) {
  const cwd = dir ?? process.cwd();
  if (cache.has(cwd))
    return cache.get(cwd) ?? null;
  const result = computeGitProjectId(cwd);
  cache.set(cwd, result);
  return result;
}
function computeGitProjectId(cwd) {
  try {
    const execOpts = {
      encoding: "utf-8",
      cwd,
      stdio: ["ignore", "pipe", "ignore"]
    };
    const rawCommonDir = execSync("git rev-parse --git-common-dir", execOpts).trim();
    if (!rawCommonDir)
      return null;
    const commonDir = isAbsolute(rawCommonDir) ? rawCommonDir : resolve(cwd, rawCommonDir);
    const cacheFile = join13(commonDir, "opencode");
    if (existsSync12(cacheFile)) {
      const cachedId = readFileSync3(cacheFile, "utf-8").trim();
      if (cachedId)
        return cachedId;
    }
    const output = execSync("git rev-list --max-parents=0 --all", execOpts).trim();
    if (!output)
      return null;
    const commits = output.split(`
`).filter(Boolean).sort();
    return commits[0] || null;
  } catch {
    return null;
  }
}

// src/utils/format.ts
function truncate(str, maxLen) {
  if (str.length <= maxLen)
    return str;
  return str.slice(0, maxLen - 3) + "...";
}
function truncateMiddle(str, maxLen) {
  if (str.length <= maxLen)
    return str;
  const keep = maxLen - 5;
  const start = Math.ceil(keep / 2);
  const end = Math.floor(keep / 2);
  return str.slice(0, start) + "....." + str.slice(str.length - end);
}
function formatTokens(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}
function formatDuration(ms, opts) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor(ms % (1000 * 60 * 60) / (1000 * 60));
  const seconds = Math.floor(ms % (1000 * 60) / 1000);
  if (!opts?.includeSeconds) {
    return `${hours}h ${minutes}m`;
  }
  if (opts.compact) {
    if (hours > 0)
      return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0)
      return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
}

// src/tui.tsx
var DEFAULT_KEYBINDS = {
  viewPlan: "<leader>v",
  executePlan: "<leader>e",
  showLoops: "<leader>w"
};
function loadTuiConfig() {
  try {
    const defaultBase = join14(homedir3(), platform3() === "win32" ? "AppData" : ".config");
    const configDir = process.env["XDG_CONFIG_HOME"] || defaultBase;
    const configRoot = join14(configDir, "opencode");
    const configPath = existsSync13(join14(configRoot, "forge-config.jsonc")) ? join14(configRoot, "forge-config.jsonc") : existsSync13(join14(configRoot, "memory-config.jsonc")) ? join14(configRoot, "memory-config.jsonc") : join14(configRoot, "graph-config.jsonc");
    const raw = readFileSync4(configPath, "utf-8");
    const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    const parsed = JSON.parse(stripped);
    return parsed?.tui;
  } catch {
    return;
  }
}
function cancelLoop(projectId, loopName) {
  const dbPath = join14(resolveDataDir(), "graph.db");
  if (!existsSync13(dbPath))
    return null;
  let db = null;
  try {
    db = new Database9(dbPath);
    db.run("PRAGMA busy_timeout=5000");
    const row = db.prepare(`
      SELECT status, current_session_id
      FROM loops
      WHERE project_id = ? AND loop_name = ?
    `).get(projectId, loopName);
    if (!row)
      return null;
    if (row.status !== "running")
      return null;
    const now = Date.now();
    db.prepare(`
      UPDATE loops SET
        status = ?,
        completed_at = ?,
        termination_reason = ?,
        completion_summary = ?
      WHERE project_id = ? AND loop_name = ?
    `).run("cancelled", now, "cancelled", null, projectId, loopName);
    return row.current_session_id;
  } catch {
    return null;
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
async function restartLoop(projectId, loopName, api) {
  const dbPath = join14(resolveDataDir(), "graph.db");
  if (!existsSync13(dbPath))
    return null;
  let db = null;
  try {
    db = new Database9(dbPath);
    db.run("PRAGMA busy_timeout=5000");
    const now = Date.now();
    const row = db.prepare(`
      SELECT status, current_session_id, worktree_dir, worktree, project_dir, execution_model,
             auditor_model, prompt, iteration, phase, audit, sandbox,
             worktree_branch, workspace_id
      FROM loops
      LEFT JOIN loop_large_fields USING (project_id, loop_name)
      WHERE project_id = ? AND loop_name = ?
    `).get(projectId, loopName);
    if (!row)
      return null;
    const oldSessionId = row.current_session_id;
    if (row.status === "running") {
      try {
        await api.client.session.abort({
          sessionID: oldSessionId
        });
      } catch {}
    }
    const directory = row.worktree_dir;
    if (!directory)
      return null;
    const {
      loadPluginConfig: loadPluginConfig2
    } = await Promise.resolve().then(() => (init_setup(), exports_setup));
    const config = loadPluginConfig2();
    const permissionRuleset = buildLoopPermissionRuleset({
      isWorktree: !!row.worktree,
      isSandbox: !!row.sandbox
    });
    let workspaceId = row.workspace_id ?? null;
    if (row.worktree === 1 && !workspaceId) {
      const {
        createLoopWorkspace: createLoopWorkspace2
      } = await Promise.resolve().then(() => exports_forge_worktree);
      const ws = await createLoopWorkspace2(api.client, {
        loopName,
        directory,
        branch: row.worktree_branch ?? null
      });
      if (!ws) {
        console.error(`[forge] restartLoop: failed to create workspace for legacy worktree loop ${loopName}`);
        return null;
      }
      workspaceId = ws.workspaceId;
      db.prepare("UPDATE loops SET workspace_id = ? WHERE project_id = ? AND loop_name = ?").run(workspaceId, projectId, loopName);
    }
    const createResult = await createLoopSessionWithWorkspace({
      v2: api.client,
      title: loopName,
      directory,
      permission: permissionRuleset,
      workspaceId: workspaceId ?? undefined,
      logPrefix: "tui-restart",
      logger: console
    });
    if (!createResult)
      return null;
    const newSessionId = createResult.sessionId;
    db.prepare(`
      UPDATE loops SET
        status = ?,
        current_session_id = ?,
        phase = ?,
        iteration = ?,
        error_count = ?,
        audit_count = ?,
        started_at = ?,
        completed_at = ?,
        termination_reason = ?,
        completion_summary = ?
      WHERE project_id = ? AND loop_name = ?
    `).run("running", newSessionId, row.phase, row.iteration, 0, 0, now, null, null, null, projectId, loopName);
    const promptText = row.prompt ?? "";
    const {
      parseModelString: parseModelString2,
      retryWithModelFallback: retryWithModelFallback2
    } = await Promise.resolve().then(() => exports_model_fallback);
    const loopModel = parseModelString2(row.execution_model ?? undefined) ?? parseModelString2(config.loop?.model) ?? parseModelString2(config.executionModel);
    const {
      waitForSandboxReady: waitForSandboxReady2
    } = await Promise.resolve().then(() => (init_sandbox_ready(), exports_sandbox_ready));
    const waitResult = await waitForSandboxReady2({
      projectId,
      loopName,
      dbPath,
      pollMs: 200,
      timeoutMs: 15000
    });
    if (!waitResult.ready) {
      console.error(`[forge] restartLoop: sandbox not ready (${waitResult.reason}); aborting restart`);
      try {
        const {
          createDockerService: createDockerService2
        } = await Promise.resolve().then(() => (init_docker(), exports_docker));
        const docker = createDockerService2(console);
        const containerName = docker.containerName(loopName);
        if (await docker.isRunning(containerName)) {
          await docker.removeContainer(containerName);
          console.log(`[forge] restartLoop: removed sandbox container ${containerName} after aborted restart`);
        }
      } catch (err) {
        console.error("[forge] restartLoop: failed to remove sandbox container after abort", err);
      }
      try {
        db.prepare(`
          UPDATE loops SET
            status = ?,
            completed_at = ?,
            termination_reason = ?,
            completion_summary = ?
          WHERE project_id = ? AND loop_name = ?
        `).run("errored", now, "sandbox_start_failed: " + waitResult.reason, null, projectId, loopName);
      } catch (err) {
        console.error("[forge] restartLoop: failed to mark loop inactive after sandbox timeout", err);
      }
      return null;
    }
    console.log(`[forge] restartLoop: sandbox ready container=${waitResult.containerName}`);
    const promptParts = [{
      type: "text",
      text: promptText
    }];
    const {
      result: promptResult
    } = await retryWithModelFallback2(() => loopModel ? api.client.session.promptAsync({
      sessionID: newSessionId,
      directory,
      agent: "code",
      model: loopModel,
      parts: promptParts
    }) : api.client.session.promptAsync({
      sessionID: newSessionId,
      directory,
      agent: "code",
      parts: promptParts
    }), () => api.client.session.promptAsync({
      sessionID: newSessionId,
      directory,
      agent: "code",
      parts: promptParts
    }), loopModel, console);
    if (promptResult.error) {
      throw new Error("Failed to prompt restarted loop");
    }
    return newSessionId;
  } catch {
    return null;
  } finally {
    try {
      db?.close();
    } catch {}
  }
}
function PlanViewerDialog(props) {
  const theme = () => props.api.theme.current;
  const [editing, setEditing] = createSignal(false);
  const [executing, setExecuting] = createSignal(props.startInExecuteMode ?? false);
  const [content, setContent] = createSignal(props.planContent);
  const [defaultsLoaded, setDefaultsLoaded] = createSignal(false);
  const [allModels, setAllModels] = createSignal([]);
  const [modelsLoaded, setModelsLoaded] = createSignal(false);
  const [modelsError, setModelsError] = createSignal(undefined);
  const [executionModel, setExecutionModel] = createSignal(props.initialExecutionModel ?? "");
  const [auditorModel, setAuditorModel] = createSignal(props.initialAuditorModel ?? "");
  const [recentModelIds, setRecentModelIds] = createSignal([]);
  let textareaRef;
  const hasInitialOverrides = props.initialExecutionModel !== undefined || props.initialAuditorModel !== undefined;
  const directory = props.api.state.path.directory;
  const pid = getGitProjectId(directory);
  const loadDefaults = async () => {
    if (pid) {
      const storedPrefs = readExecutionPreferences(pid);
      const {
        loadPluginConfig: loadPluginConfig2
      } = await Promise.resolve().then(() => (init_setup(), exports_setup));
      const config = loadPluginConfig2();
      const defaults = resolveExecutionDialogDefaults(config, storedPrefs);
      if (!hasInitialOverrides) {
        setExecutionModel(defaults.executionModel);
        setAuditorModel(defaults.auditorModel);
      }
      setDefaultsLoaded(true);
    } else {
      setDefaultsLoaded(true);
    }
  };
  const loadModels = async () => {
    const result = await fetchAvailableModels(props.api);
    if (result.error) {
      setModelsError(result.error);
      setModelsLoaded(true);
      return;
    }
    const allModelList = flattenProviders(result.providers);
    const recents = pid ? getRecentModels(pid) : [];
    setRecentModelIds(recents);
    const sorted = sortModelsByPriority(allModelList, {
      recents,
      connectedProviderIds: result.connectedProviderIds,
      configuredProviderIds: result.configuredProviderIds
    });
    setAllModels(sorted);
    setModelsLoaded(true);
  };
  loadDefaults();
  loadModels();
  const handleSave = () => {
    const text = textareaRef?.plainText ?? content();
    const saved = writePlan(props.projectId, props.sessionId, text);
    props.api.ui.toast({
      message: saved ? "Plan saved" : "Failed to save plan",
      variant: saved ? "success" : "error",
      duration: 3000
    });
    if (saved) {
      setContent(text);
      setEditing(false);
    }
  };
  const handleExport = () => {
    const planText = content();
    const title = extractPlanTitle(planText);
    const slugifiedTitle = slugify(title);
    const directory2 = props.api.state.path.directory;
    const filename = `${slugifiedTitle}.md`;
    const filepath = join14(directory2, filename);
    try {
      writeFileSync2(filepath, planText, "utf-8");
      props.api.ui.toast({
        message: `Exported plan to ${filename}`,
        variant: "success",
        duration: 3000
      });
    } catch (error) {
      props.api.ui.toast({
        message: `Failed to export plan: ${error.message}`,
        variant: "error",
        duration: 3000
      });
    }
  };
  const openModelDialog = (target) => {
    if (!modelsLoaded())
      return;
    const models = allModels();
    if (modelsError() || models.length === 0) {
      props.api.ui.toast({
        message: modelsError() || "No models available",
        variant: "error",
        duration: 3000
      });
      return;
    }
    const options = buildDialogSelectOptions(models, recentModelIds());
    const title = target === "execution" ? "Execution Model" : "Auditor Model";
    const currentValue = target === "execution" ? executionModel() : auditorModel();
    props.api.ui.dialog.setSize("large");
    props.api.ui.dialog.replace(() => _$createComponent(props.api.ui.DialogSelect, {
      title,
      options,
      current: currentValue || "",
      onSelect: (opt) => {
        const selectedModel = typeof opt.value === "string" ? opt.value : "";
        props.api.ui.dialog.setSize("xlarge");
        props.api.ui.dialog.replace(() => _$createComponent(PlanViewerDialog, {
          get api() {
            return props.api;
          },
          get planContent() {
            return content();
          },
          get projectId() {
            return props.projectId;
          },
          get sessionId() {
            return props.sessionId;
          },
          get onRefresh() {
            return props.onRefresh;
          },
          startInExecuteMode: true,
          get initialExecutionModel() {
            return target === "execution" ? selectedModel : executionModel();
          },
          get initialAuditorModel() {
            return target === "auditor" ? selectedModel : auditorModel();
          }
        }));
      }
    }));
  };
  function getModeDescription(label) {
    switch (label) {
      case "New session":
        return "Create a new session and send the plan to the code agent";
      case "Execute here":
        return "Execute the plan in the current session using the code agent";
      case "Loop (worktree)":
        return "Execute using iterative development loop in an isolated git worktree";
      case "Loop":
        return "Execute using iterative development loop in the current directory";
      default:
        return "";
    }
  }
  const handleExecuteMode = async (mode, executionModel2, auditorModel2) => {
    const planText = content();
    const title = extractPlanTitle(planText);
    const directory2 = props.api.state.path.directory;
    const pid2 = getGitProjectId(directory2);
    if (!pid2) {
      props.api.ui.toast({
        message: "Failed to resolve project ID",
        variant: "error",
        duration: 3000
      });
      return;
    }
    const matchedLabel = matchExecutionLabel(mode);
    switch (matchedLabel) {
      case "New session": {
        props.api.ui.dialog.clear();
        props.api.ui.toast({
          message: "Creating new session for plan execution...",
          variant: "info",
          duration: 3000
        });
        try {
          const createResult = await props.api.client.session.create({
            title,
            directory: directory2
          });
          if (createResult.error || !createResult.data) {
            props.api.ui.toast({
              message: "Failed to create new session",
              variant: "error",
              duration: 3000
            });
            return;
          }
          const newSessionId = createResult.data.id;
          if (pid2) {
            deletePlan(pid2, props.sessionId);
          }
          const {
            parseModelString: parseModelString2,
            retryWithModelFallback: retryWithModelFallback2
          } = await Promise.resolve().then(() => exports_model_fallback);
          const {
            loadPluginConfig: loadPluginConfig2
          } = await Promise.resolve().then(() => (init_setup(), exports_setup));
          const config = loadPluginConfig2();
          const model = parseModelString2(executionModel2) ?? parseModelString2(config.loop?.model) ?? parseModelString2(config.executionModel);
          const promptParts = [{
            type: "text",
            text: planText
          }];
          const {
            result: promptResult
          } = await retryWithModelFallback2(() => model ? props.api.client.session.promptAsync({
            sessionID: newSessionId,
            directory: directory2,
            agent: "code",
            model,
            parts: promptParts
          }) : props.api.client.session.promptAsync({
            sessionID: newSessionId,
            directory: directory2,
            agent: "code",
            parts: promptParts
          }), () => props.api.client.session.promptAsync({
            sessionID: newSessionId,
            directory: directory2,
            agent: "code",
            parts: promptParts
          }), model, console);
          if (promptResult.error) {
            throw new Error("Failed to prompt session");
          }
          props.api.ui.toast({
            message: `New session created: ${title}`,
            variant: "success",
            duration: 3000
          });
          writeExecutionPreferences(pid2, {
            mode: matchedLabel,
            executionModel: executionModel2,
            auditorModel: auditorModel2
          });
          if (executionModel2)
            recordRecentModel(pid2, executionModel2);
          if (auditorModel2)
            recordRecentModel(pid2, auditorModel2);
          props.onRefresh?.();
          try {
            props.api.route.navigate("session", {
              sessionID: newSessionId
            });
          } catch {}
        } catch {
          props.api.ui.toast({
            message: "Failed to create new session",
            variant: "error",
            duration: 3000
          });
        }
        break;
      }
      case "Execute here": {
        props.api.ui.dialog.clear();
        props.api.ui.toast({
          message: "Switching to code agent for plan execution...",
          variant: "info",
          duration: 3000
        });
        const inPlacePrompt = `The architect agent has created an implementation plan. You are now the code agent taking over this session. Your job is to execute the plan — edit files, run commands, create tests, and implement every phase. Do NOT just describe or summarize the changes. Actually make them.

Implementation Plan:
${planText}`;
        try {
          const {
            parseModelString: parseModelString2,
            retryWithModelFallback: retryWithModelFallback2
          } = await Promise.resolve().then(() => exports_model_fallback);
          const {
            loadPluginConfig: loadPluginConfig2
          } = await Promise.resolve().then(() => (init_setup(), exports_setup));
          const config = loadPluginConfig2();
          const model = parseModelString2(executionModel2) ?? parseModelString2(config.loop?.model) ?? parseModelString2(config.executionModel);
          const promptParts = [{
            type: "text",
            text: inPlacePrompt
          }];
          const {
            result: promptResult
          } = await retryWithModelFallback2(() => model ? props.api.client.session.promptAsync({
            sessionID: props.sessionId,
            directory: directory2,
            agent: "code",
            model,
            parts: promptParts
          }) : props.api.client.session.promptAsync({
            sessionID: props.sessionId,
            directory: directory2,
            agent: "code",
            parts: promptParts
          }), () => props.api.client.session.promptAsync({
            sessionID: props.sessionId,
            directory: directory2,
            agent: "code",
            parts: promptParts
          }), model, console);
          if (promptResult.error) {
            throw new Error("Failed to prompt session");
          }
          props.api.ui.toast({
            message: "Executing plan in current session",
            variant: "success",
            duration: 3000
          });
          writeExecutionPreferences(pid2, {
            mode: matchedLabel,
            executionModel: executionModel2,
            auditorModel: auditorModel2
          });
          if (executionModel2)
            recordRecentModel(pid2, executionModel2);
          if (auditorModel2)
            recordRecentModel(pid2, auditorModel2);
          props.onRefresh?.();
        } catch {
          props.api.ui.toast({
            message: "Failed to execute plan in current session",
            variant: "error",
            duration: 3000
          });
        }
        break;
      }
      case "Loop (worktree)":
      case "Loop": {
        const isWorktree = matchedLabel === "Loop (worktree)";
        props.api.ui.dialog.clear();
        props.api.ui.toast({
          message: isWorktree ? "Starting loop in worktree..." : "Starting loop in-place...",
          variant: "info",
          duration: 3000
        });
        try {
          const launchResult = await launchFreshLoop({
            planText,
            title,
            directory: directory2,
            projectId: pid2,
            isWorktree,
            api: props.api,
            executionModel: executionModel2,
            auditorModel: auditorModel2,
            hostSessionId: props.sessionId
          });
          if (launchResult) {
            if (pid2) {
              deletePlan(pid2, props.sessionId);
            }
            writeExecutionPreferences(pid2, {
              mode: matchedLabel,
              executionModel: executionModel2,
              auditorModel: auditorModel2
            });
            if (executionModel2)
              recordRecentModel(pid2, executionModel2);
            if (auditorModel2)
              recordRecentModel(pid2, auditorModel2);
            props.api.ui.toast({
              message: isWorktree ? `Loop started in worktree: ${launchResult.loopName}` : `Loop started: ${launchResult.loopName}`,
              variant: "success",
              duration: 3000
            });
            if (isWorktree && launchResult.workspaceId && launchResult.sessionId) {
              try {
                props.api.route.navigate("session", {
                  sessionID: launchResult.sessionId
                });
              } catch {}
            }
            props.onRefresh?.();
          }
        } catch {
          props.api.ui.toast({
            message: "Failed to start loop",
            variant: "error",
            duration: 3000
          });
        }
        break;
      }
      default: {
        props.api.ui.toast({
          message: "Unknown execution mode",
          variant: "error",
          duration: 3000
        });
      }
    }
  };
  const tabIndex = () => executing() ? 2 : editing() ? 1 : 0;
  let tabRef;
  createEffect(() => {
    const idx = tabIndex();
    tabRef?.setSelectedIndex(idx);
  });
  return (() => {
    var _el$ = _$createElement("box"), _el$2 = _$createElement("box"), _el$3 = _$createElement("tab_select"), _el$11 = _$createElement("box"), _el$16 = _$createElement("text");
    _$insertNode(_el$, _el$2);
    _$insertNode(_el$, _el$11);
    _$setProp(_el$, "flexDirection", "column");
    _$setProp(_el$, "paddingX", 2);
    _$insertNode(_el$2, _el$3);
    _$setProp(_el$2, "flexShrink", 0);
    _$setProp(_el$2, "paddingBottom", 1);
    _$use((el) => {
      tabRef = el;
    }, _el$3);
    _$setProp(_el$3, "options", [{
      name: "View",
      description: "View plan",
      value: "view"
    }, {
      name: "Edit",
      description: "Edit plan",
      value: "edit"
    }, {
      name: "Execute",
      description: "Execute plan",
      value: "execute"
    }, {
      name: "Export",
      description: "Export to file",
      value: "export"
    }]);
    _$setProp(_el$3, "onSelect", (_, option) => {
      if (!option)
        return;
      switch (option.value) {
        case "view":
          setEditing(false);
          setExecuting(false);
          break;
        case "edit":
          setEditing(true);
          setExecuting(false);
          break;
        case "execute":
          setEditing(false);
          setExecuting(true);
          break;
        case "export":
          handleExport();
          break;
      }
    });
    _$setProp(_el$3, "showUnderline", false);
    _$setProp(_el$3, "showDescription", false);
    _$setProp(_el$3, "wrapSelection", true);
    _$setProp(_el$3, "tabWidth", 10);
    _$setProp(_el$3, "selectedTextColor", "#ffffff");
    _$insert(_el$, _$createComponent(Show, {
      get when() {
        return _$memo(() => !!!editing())() && !executing();
      },
      get children() {
        var _el$4 = _$createElement("scrollbox"), _el$5 = _$createElement("markdown");
        _$insertNode(_el$4, _el$5);
        _$setProp(_el$4, "minHeight", 20);
        _$setProp(_el$4, "maxHeight", "75%");
        _$setProp(_el$4, "borderStyle", "rounded");
        _$setProp(_el$4, "paddingX", 1);
        _$effect((_p$) => {
          var _v$ = theme().border, _v$2 = content(), _v$3 = SyntaxStyle.create(), _v$4 = theme().markdownText;
          _v$ !== _p$.e && (_p$.e = _$setProp(_el$4, "borderColor", _v$, _p$.e));
          _v$2 !== _p$.t && (_p$.t = _$setProp(_el$5, "content", _v$2, _p$.t));
          _v$3 !== _p$.a && (_p$.a = _$setProp(_el$5, "syntaxStyle", _v$3, _p$.a));
          _v$4 !== _p$.o && (_p$.o = _$setProp(_el$5, "fg", _v$4, _p$.o));
          return _p$;
        }, {
          e: undefined,
          t: undefined,
          a: undefined,
          o: undefined
        });
        return _el$4;
      }
    }), _el$11);
    _$insert(_el$, _$createComponent(Show, {
      get when() {
        return editing();
      },
      get children() {
        var _el$6 = _$createElement("textarea");
        _$use((value) => {
          textareaRef = value;
        }, _el$6);
        _$setProp(_el$6, "focused", true);
        _$setProp(_el$6, "minHeight", 20);
        _$setProp(_el$6, "maxHeight", "75%");
        _$setProp(_el$6, "paddingX", 1);
        _$effect((_$p) => _$setProp(_el$6, "initialValue", content(), _$p));
        return _el$6;
      }
    }), _el$11);
    _$insert(_el$, _$createComponent(Show, {
      get when() {
        return executing();
      },
      get children() {
        var _el$7 = _$createElement("box"), _el$8 = _$createElement("box"), _el$9 = _$createElement("text"), _el$0 = _$createElement("b");
        _$insertNode(_el$7, _el$8);
        _$setProp(_el$7, "flexDirection", "column");
        _$setProp(_el$7, "paddingBottom", 1);
        _$setProp(_el$7, "gap", 1);
        _$setProp(_el$7, "minHeight", 20);
        _$setProp(_el$7, "maxHeight", "75%");
        _$insertNode(_el$8, _el$9);
        _$setProp(_el$8, "paddingBottom", 1);
        _$insertNode(_el$9, _el$0);
        _$insertNode(_el$0, _$createTextNode(`Configure and Run Plan`));
        _$insert(_el$7, _$createComponent(Show, {
          get when() {
            return defaultsLoaded();
          },
          get fallback() {
            return (() => {
              var _el$18 = _$createElement("box"), _el$19 = _$createElement("text");
              _$insertNode(_el$18, _el$19);
              _$setProp(_el$18, "flexDirection", "column");
              _$setProp(_el$18, "gap", 1);
              _$setProp(_el$18, "paddingBottom", 1);
              _$insertNode(_el$19, _$createTextNode(`Loading...`));
              _$effect((_$p) => _$setProp(_el$19, "fg", theme().textMuted, _$p));
              return _el$18;
            })();
          },
          get children() {
            var _el$10 = _$createElement("select");
            _$setProp(_el$10, "focused", true);
            _$setProp(_el$10, "selectedIndex", 0);
            _$setProp(_el$10, "onSelect", (_, option) => {
              if (option?.value) {
                if (option.value === "model:execution") {
                  openModelDialog("execution");
                  return;
                }
                if (option.value === "model:auditor") {
                  openModelDialog("auditor");
                  return;
                }
                if (typeof option.value === "string" && option.value.startsWith("mode:")) {
                  handleExecuteMode(option.value.slice(5), executionModel(), auditorModel());
                }
              }
            });
            _$setProp(_el$10, "showDescription", true);
            _$setProp(_el$10, "itemSpacing", 1);
            _$setProp(_el$10, "wrapSelection", true);
            _$setProp(_el$10, "selectedTextColor", "#ffffff");
            _$setProp(_el$10, "minHeight", 16);
            _$setProp(_el$10, "flexGrow", 1);
            _$effect((_p$) => {
              var _v$5 = [{
                name: `Execution model: ${modelsLoaded() ? getModelDisplayLabel(executionModel(), allModels()) : "loading..."}`,
                description: "Press enter to change",
                value: "model:execution"
              }, {
                name: `Auditor model: ${modelsLoaded() ? getModelDisplayLabel(auditorModel(), allModels()) : "loading..."}`,
                description: "Press enter to change",
                value: "model:auditor"
              }, ...PLAN_EXECUTION_LABELS.map((label) => ({
                name: label,
                description: getModeDescription(label),
                value: `mode:${label}`
              }))], _v$6 = theme().text, _v$7 = theme().text, _v$8 = theme().borderActive;
              _v$5 !== _p$.e && (_p$.e = _$setProp(_el$10, "options", _v$5, _p$.e));
              _v$6 !== _p$.t && (_p$.t = _$setProp(_el$10, "textColor", _v$6, _p$.t));
              _v$7 !== _p$.a && (_p$.a = _$setProp(_el$10, "focusedTextColor", _v$7, _p$.a));
              _v$8 !== _p$.o && (_p$.o = _$setProp(_el$10, "selectedBackgroundColor", _v$8, _p$.o));
              return _p$;
            }, {
              e: undefined,
              t: undefined,
              a: undefined,
              o: undefined
            });
            return _el$10;
          }
        }), null);
        _$effect((_$p) => _$setProp(_el$9, "fg", theme().text, _$p));
        return _el$7;
      }
    }), _el$11);
    _$insertNode(_el$11, _el$16);
    _$setProp(_el$11, "paddingTop", 1);
    _$setProp(_el$11, "flexShrink", 0);
    _$setProp(_el$11, "flexDirection", "row");
    _$setProp(_el$11, "gap", 2);
    _$insert(_el$11, _$createComponent(Show, {
      get when() {
        return editing();
      },
      get children() {
        var _el$12 = _$createElement("text");
        _$insertNode(_el$12, _$createTextNode(`Save`));
        _$setProp(_el$12, "onMouseUp", handleSave);
        _$effect((_$p) => _$setProp(_el$12, "fg", theme().success, _$p));
        return _el$12;
      }
    }), _el$16);
    _$insert(_el$11, _$createComponent(Show, {
      get when() {
        return executing();
      },
      get children() {
        var _el$14 = _$createElement("text");
        _$insertNode(_el$14, _$createTextNode(`Back to plan`));
        _$setProp(_el$14, "onMouseUp", () => setExecuting(false));
        _$effect((_$p) => _$setProp(_el$14, "fg", theme().textMuted, _$p));
        return _el$14;
      }
    }), _el$16);
    _$insertNode(_el$16, _$createTextNode(`Close (esc)`));
    _$setProp(_el$16, "onMouseUp", () => props.api.ui.dialog.clear());
    _$effect((_p$) => {
      var _v$9 = !editing() && !executing(), _v$0 = theme().textMuted, _v$1 = theme().text, _v$10 = theme().borderActive, _v$11 = theme().textMuted;
      _v$9 !== _p$.e && (_p$.e = _$setProp(_el$3, "focused", _v$9, _p$.e));
      _v$0 !== _p$.t && (_p$.t = _$setProp(_el$3, "textColor", _v$0, _p$.t));
      _v$1 !== _p$.a && (_p$.a = _$setProp(_el$3, "focusedTextColor", _v$1, _p$.a));
      _v$10 !== _p$.o && (_p$.o = _$setProp(_el$3, "selectedBackgroundColor", _v$10, _p$.o));
      _v$11 !== _p$.i && (_p$.i = _$setProp(_el$16, "fg", _v$11, _p$.i));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined,
      o: undefined,
      i: undefined
    });
    return _el$;
  })();
}
function LoopDetailsDialog(props) {
  const theme = () => props.api.theme.current;
  const [currentLoop, setCurrentLoop] = createSignal(props.loop);
  const [stats, setStats] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const directory = props.api.state.path.directory;
  const pid = getGitProjectId(directory);
  const refreshLoopState = () => {
    if (pid && currentLoop().name) {
      const freshLoop = readLoopByName(pid, currentLoop().name);
      if (freshLoop) {
        setCurrentLoop(freshLoop);
      }
    }
  };
  refreshLoopState();
  createEffect(() => {
    const loop = currentLoop();
    if (loop.sessionId && directory) {
      setLoading(true);
      fetchSessionStats(props.api, loop.sessionId, directory).then((result) => {
        setStats(result);
        setLoading(false);
      }).catch(() => {
        setStats(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  });
  const handleCancel = () => {
    props.api.ui.dialog.clear();
    const directory2 = props.api.state.path.directory;
    const pid2 = getGitProjectId(directory2);
    if (!pid2)
      return;
    const sessionId = cancelLoop(pid2, currentLoop().name);
    if (sessionId) {
      props.api.client.session.abort({
        sessionID: sessionId
      }).catch(() => {});
    }
    props.api.ui.toast({
      message: sessionId ? `Cancelled loop: ${currentLoop().name}` : `Loop ${currentLoop().name} is not active`,
      variant: sessionId ? "success" : "info",
      duration: 3000
    });
    props.onRefresh?.();
  };
  const handleRestart = async () => {
    props.api.ui.dialog.clear();
    const directory2 = props.api.state.path.directory;
    const pid2 = getGitProjectId(directory2);
    if (!pid2)
      return;
    const newSessionId = await restartLoop(pid2, currentLoop().name, props.api);
    const label = currentLoop().active ? "Force restarting" : "Restarting";
    props.api.ui.toast({
      message: newSessionId ? `${label} loop: ${currentLoop().name}` : `Failed to restart loop: ${currentLoop().name}`,
      variant: newSessionId ? "success" : "error",
      duration: 3000
    });
    props.onRefresh?.();
  };
  const statusBadge = () => {
    const loop = currentLoop();
    if (loop.active)
      return {
        text: loop.phase,
        color: loop.phase === "auditing" ? theme().warning : theme().success
      };
    if (loop.terminationReason === "completed")
      return {
        text: "completed",
        color: theme().success
      };
    if (loop.terminationReason === "cancelled" || loop.terminationReason === "user_aborted")
      return {
        text: "cancelled",
        color: theme().textMuted
      };
    return {
      text: "ended",
      color: theme().error
    };
  };
  return (() => {
    var _el$21 = _$createElement("box"), _el$22 = _$createElement("box"), _el$23 = _$createElement("box"), _el$24 = _$createElement("text"), _el$25 = _$createElement("b"), _el$26 = _$createElement("text"), _el$27 = _$createElement("b"), _el$28 = _$createTextNode(`[`), _el$29 = _$createTextNode(`]`), _el$30 = _$createElement("box"), _el$31 = _$createElement("text"), _el$32 = _$createTextNode(`Iteration `), _el$91 = _$createElement("box"), _el$102 = _$createElement("text");
    _$insertNode(_el$21, _el$22);
    _$insertNode(_el$21, _el$91);
    _$setProp(_el$21, "flexDirection", "column");
    _$setProp(_el$21, "paddingX", 2);
    _$insertNode(_el$22, _el$23);
    _$insertNode(_el$22, _el$30);
    _$setProp(_el$22, "flexDirection", "column");
    _$setProp(_el$22, "flexShrink", 0);
    _$insertNode(_el$23, _el$24);
    _$insertNode(_el$23, _el$26);
    _$setProp(_el$23, "flexDirection", "row");
    _$setProp(_el$23, "gap", 1);
    _$setProp(_el$23, "alignItems", "center");
    _$insertNode(_el$24, _el$25);
    _$insert(_el$25, () => currentLoop().name);
    _$insertNode(_el$26, _el$27);
    _$insertNode(_el$27, _el$28);
    _$insertNode(_el$27, _el$29);
    _$insert(_el$27, () => statusBadge().text, _el$29);
    _$insertNode(_el$30, _el$31);
    _$insertNode(_el$31, _el$32);
    _$insert(_el$31, () => currentLoop().iteration, null);
    _$insert(_el$31, (() => {
      var _c$ = _$memo(() => currentLoop().maxIterations > 0);
      return () => _c$() ? `/${currentLoop().maxIterations}` : "";
    })(), null);
    _$insert(_el$21, _$createComponent(Show, {
      get when() {
        return loading();
      },
      get children() {
        var _el$33 = _$createElement("box"), _el$34 = _$createElement("text");
        _$insertNode(_el$33, _el$34);
        _$setProp(_el$33, "paddingTop", 1);
        _$insertNode(_el$34, _$createTextNode(`Loading stats...`));
        _$effect((_$p) => _$setProp(_el$34, "fg", theme().textMuted, _$p));
        return _el$33;
      }
    }), _el$91);
    _$insert(_el$21, _$createComponent(Show, {
      get when() {
        return !loading();
      },
      get children() {
        var _el$36 = _$createElement("box");
        _$setProp(_el$36, "flexDirection", "column");
        _$setProp(_el$36, "paddingTop", 1);
        _$setProp(_el$36, "flexShrink", 0);
        _$insert(_el$36, _$createComponent(Show, {
          get when() {
            return stats();
          },
          get fallback() {
            return (() => {
              var _el$104 = _$createElement("box"), _el$105 = _$createElement("text");
              _$insertNode(_el$104, _el$105);
              _$insertNode(_el$105, _$createTextNode(`Session stats unavailable`));
              _$effect((_$p) => _$setProp(_el$105, "fg", theme().textMuted, _$p));
              return _el$104;
            })();
          },
          get children() {
            var _el$37 = _$createElement("box"), _el$38 = _$createElement("box"), _el$39 = _$createElement("text"), _el$40 = _$createElement("span"), _el$42 = _$createTextNode(`...`), _el$43 = _$createElement("box"), _el$44 = _$createElement("text"), _el$45 = _$createElement("span"), _el$55 = _$createElement("box"), _el$56 = _$createElement("text"), _el$57 = _$createElement("span"), _el$59 = _$createTextNode(` total (`), _el$60 = _$createTextNode(` assistant)`), _el$61 = _$createElement("box"), _el$62 = _$createElement("text"), _el$63 = _$createElement("span"), _el$65 = _$createTextNode(` in / `), _el$66 = _$createTextNode(` out / `), _el$67 = _$createTextNode(` reasoning`), _el$68 = _$createElement("box"), _el$69 = _$createElement("text"), _el$70 = _$createElement("span"), _el$72 = _$createTextNode(`$`);
            _$insertNode(_el$37, _el$38);
            _$insertNode(_el$37, _el$43);
            _$insertNode(_el$37, _el$55);
            _$insertNode(_el$37, _el$61);
            _$insertNode(_el$37, _el$68);
            _$setProp(_el$37, "flexDirection", "column");
            _$insertNode(_el$38, _el$39);
            _$insertNode(_el$39, _el$40);
            _$insertNode(_el$39, _el$42);
            _$insertNode(_el$40, _$createTextNode(`Session: `));
            _$insert(_el$39, () => currentLoop().sessionId.slice(0, 8), _el$42);
            _$insertNode(_el$43, _el$44);
            _$insertNode(_el$44, _el$45);
            _$insertNode(_el$45, _$createTextNode(`Phase: `));
            _$insert(_el$44, () => currentLoop().phase, null);
            _$insert(_el$37, _$createComponent(Show, {
              get when() {
                return currentLoop().executionModel;
              },
              get children() {
                var _el$47 = _$createElement("box"), _el$48 = _$createElement("text"), _el$49 = _$createElement("span");
                _$insertNode(_el$47, _el$48);
                _$insertNode(_el$48, _el$49);
                _$insertNode(_el$49, _$createTextNode(`Execution model: `));
                _$insert(_el$48, () => currentLoop().executionModel, null);
                _$effect((_p$) => {
                  var _v$12 = theme().text, _v$13 = {
                    fg: theme().textMuted
                  };
                  _v$12 !== _p$.e && (_p$.e = _$setProp(_el$48, "fg", _v$12, _p$.e));
                  _v$13 !== _p$.t && (_p$.t = _$setProp(_el$49, "style", _v$13, _p$.t));
                  return _p$;
                }, {
                  e: undefined,
                  t: undefined
                });
                return _el$47;
              }
            }), _el$55);
            _$insert(_el$37, _$createComponent(Show, {
              get when() {
                return currentLoop().auditorModel;
              },
              get children() {
                var _el$51 = _$createElement("box"), _el$52 = _$createElement("text"), _el$53 = _$createElement("span");
                _$insertNode(_el$51, _el$52);
                _$insertNode(_el$52, _el$53);
                _$insertNode(_el$53, _$createTextNode(`Auditor model: `));
                _$insert(_el$52, () => currentLoop().auditorModel, null);
                _$effect((_p$) => {
                  var _v$14 = theme().text, _v$15 = {
                    fg: theme().textMuted
                  };
                  _v$14 !== _p$.e && (_p$.e = _$setProp(_el$52, "fg", _v$14, _p$.e));
                  _v$15 !== _p$.t && (_p$.t = _$setProp(_el$53, "style", _v$15, _p$.t));
                  return _p$;
                }, {
                  e: undefined,
                  t: undefined
                });
                return _el$51;
              }
            }), _el$55);
            _$insertNode(_el$55, _el$56);
            _$insertNode(_el$56, _el$57);
            _$insertNode(_el$56, _el$59);
            _$insertNode(_el$56, _el$60);
            _$insertNode(_el$57, _$createTextNode(`Messages: `));
            _$insert(_el$56, () => stats().messages.total, _el$59);
            _$insert(_el$56, () => stats().messages.assistant, _el$60);
            _$insertNode(_el$61, _el$62);
            _$insertNode(_el$62, _el$63);
            _$insertNode(_el$62, _el$65);
            _$insertNode(_el$62, _el$66);
            _$insertNode(_el$62, _el$67);
            _$insertNode(_el$63, _$createTextNode(`Tokens: `));
            _$insert(_el$62, () => formatTokens(stats().tokens.input), _el$65);
            _$insert(_el$62, () => formatTokens(stats().tokens.output), _el$66);
            _$insert(_el$62, () => formatTokens(stats().tokens.reasoning), _el$67);
            _$insertNode(_el$68, _el$69);
            _$insertNode(_el$69, _el$70);
            _$insertNode(_el$69, _el$72);
            _$insertNode(_el$70, _$createTextNode(`Cost: `));
            _$insert(_el$69, () => stats().cost.toFixed(4), null);
            _$insert(_el$37, _$createComponent(Show, {
              get when() {
                return stats().fileChanges;
              },
              get children() {
                var _el$73 = _$createElement("box"), _el$74 = _$createElement("text"), _el$75 = _$createElement("span"), _el$77 = _$createTextNode(` changed (+`), _el$78 = _$createTextNode(`/-`), _el$79 = _$createTextNode(`)`);
                _$insertNode(_el$73, _el$74);
                _$insertNode(_el$74, _el$75);
                _$insertNode(_el$74, _el$77);
                _$insertNode(_el$74, _el$78);
                _$insertNode(_el$74, _el$79);
                _$insertNode(_el$75, _$createTextNode(`Files: `));
                _$insert(_el$74, () => stats().fileChanges.files, _el$77);
                _$insert(_el$74, () => stats().fileChanges.additions, _el$78);
                _$insert(_el$74, () => stats().fileChanges.deletions, _el$79);
                _$effect((_p$) => {
                  var _v$16 = theme().text, _v$17 = {
                    fg: theme().textMuted
                  };
                  _v$16 !== _p$.e && (_p$.e = _$setProp(_el$74, "fg", _v$16, _p$.e));
                  _v$17 !== _p$.t && (_p$.t = _$setProp(_el$75, "style", _v$17, _p$.t));
                  return _p$;
                }, {
                  e: undefined,
                  t: undefined
                });
                return _el$73;
              }
            }), null);
            _$insert(_el$37, _$createComponent(Show, {
              get when() {
                return stats().timing;
              },
              get children() {
                var _el$80 = _$createElement("box"), _el$81 = _$createElement("text"), _el$82 = _$createElement("span");
                _$insertNode(_el$80, _el$81);
                _$insertNode(_el$81, _el$82);
                _$insertNode(_el$82, _$createTextNode(`Duration: `));
                _$insert(_el$81, () => formatDuration(stats().timing.durationMs, {
                  includeSeconds: true,
                  compact: true
                }), null);
                _$effect((_p$) => {
                  var _v$18 = theme().text, _v$19 = {
                    fg: theme().textMuted
                  };
                  _v$18 !== _p$.e && (_p$.e = _$setProp(_el$81, "fg", _v$18, _p$.e));
                  _v$19 !== _p$.t && (_p$.t = _$setProp(_el$82, "style", _v$19, _p$.t));
                  return _p$;
                }, {
                  e: undefined,
                  t: undefined
                });
                return _el$80;
              }
            }), null);
            _$effect((_p$) => {
              var _v$20 = theme().text, _v$21 = {
                fg: theme().textMuted
              }, _v$22 = theme().text, _v$23 = {
                fg: theme().textMuted
              }, _v$24 = theme().text, _v$25 = {
                fg: theme().textMuted
              }, _v$26 = theme().text, _v$27 = {
                fg: theme().textMuted
              }, _v$28 = theme().text, _v$29 = {
                fg: theme().textMuted
              };
              _v$20 !== _p$.e && (_p$.e = _$setProp(_el$39, "fg", _v$20, _p$.e));
              _v$21 !== _p$.t && (_p$.t = _$setProp(_el$40, "style", _v$21, _p$.t));
              _v$22 !== _p$.a && (_p$.a = _$setProp(_el$44, "fg", _v$22, _p$.a));
              _v$23 !== _p$.o && (_p$.o = _$setProp(_el$45, "style", _v$23, _p$.o));
              _v$24 !== _p$.i && (_p$.i = _$setProp(_el$56, "fg", _v$24, _p$.i));
              _v$25 !== _p$.n && (_p$.n = _$setProp(_el$57, "style", _v$25, _p$.n));
              _v$26 !== _p$.s && (_p$.s = _$setProp(_el$62, "fg", _v$26, _p$.s));
              _v$27 !== _p$.h && (_p$.h = _$setProp(_el$63, "style", _v$27, _p$.h));
              _v$28 !== _p$.r && (_p$.r = _$setProp(_el$69, "fg", _v$28, _p$.r));
              _v$29 !== _p$.d && (_p$.d = _$setProp(_el$70, "style", _v$29, _p$.d));
              return _p$;
            }, {
              e: undefined,
              t: undefined,
              a: undefined,
              o: undefined,
              i: undefined,
              n: undefined,
              s: undefined,
              h: undefined,
              r: undefined,
              d: undefined
            });
            return _el$37;
          }
        }));
        return _el$36;
      }
    }), _el$91);
    _$insert(_el$21, _$createComponent(Show, {
      get when() {
        return stats()?.lastActivity?.summary;
      },
      get children() {
        var _el$84 = _$createElement("box"), _el$85 = _$createElement("box"), _el$86 = _$createElement("text"), _el$87 = _$createElement("b"), _el$89 = _$createElement("scrollbox"), _el$90 = _$createElement("text");
        _$insertNode(_el$84, _el$85);
        _$insertNode(_el$84, _el$89);
        _$setProp(_el$84, "flexDirection", "column");
        _$setProp(_el$84, "paddingTop", 1);
        _$setProp(_el$84, "flexGrow", 1);
        _$setProp(_el$84, "flexShrink", 1);
        _$insertNode(_el$85, _el$86);
        _$setProp(_el$85, "flexShrink", 0);
        _$insertNode(_el$86, _el$87);
        _$insertNode(_el$87, _$createTextNode(`Latest Output`));
        _$insertNode(_el$89, _el$90);
        _$setProp(_el$89, "maxHeight", 12);
        _$setProp(_el$89, "borderStyle", "rounded");
        _$setProp(_el$89, "paddingX", 1);
        _$setProp(_el$90, "wrapMode", "word");
        _$insert(_el$90, () => truncate(stats().lastActivity.summary, 500));
        _$effect((_p$) => {
          var _v$30 = theme().text, _v$31 = theme().border, _v$32 = theme().textMuted;
          _v$30 !== _p$.e && (_p$.e = _$setProp(_el$86, "fg", _v$30, _p$.e));
          _v$31 !== _p$.t && (_p$.t = _$setProp(_el$89, "borderColor", _v$31, _p$.t));
          _v$32 !== _p$.a && (_p$.a = _$setProp(_el$90, "fg", _v$32, _p$.a));
          return _p$;
        }, {
          e: undefined,
          t: undefined,
          a: undefined
        });
        return _el$84;
      }
    }), _el$91);
    _$insertNode(_el$91, _el$102);
    _$setProp(_el$91, "paddingTop", 1);
    _$setProp(_el$91, "flexShrink", 0);
    _$setProp(_el$91, "flexDirection", "row");
    _$setProp(_el$91, "gap", 2);
    _$setProp(_el$91, "paddingY", 2);
    _$insert(_el$91, _$createComponent(Show, {
      get when() {
        return props.onBack;
      },
      get children() {
        var _el$92 = _$createElement("text");
        _$insertNode(_el$92, _$createTextNode(`Back`));
        _$setProp(_el$92, "onMouseUp", () => props.onBack());
        _$effect((_$p) => _$setProp(_el$92, "fg", theme().textMuted, _$p));
        return _el$92;
      }
    }), _el$102);
    _$insert(_el$91, _$createComponent(Show, {
      get when() {
        return _$memo(() => !!currentLoop().sessionId)() && currentLoop().workspaceId;
      },
      get children() {
        var _el$94 = _$createElement("text");
        _$insertNode(_el$94, _$createTextNode(`Open session`));
        _$setProp(_el$94, "onMouseUp", () => {
          props.api.route.navigate("session", {
            sessionID: currentLoop().sessionId
          });
        });
        _$effect((_$p) => _$setProp(_el$94, "fg", theme().success, _$p));
        return _el$94;
      }
    }), _el$102);
    _$insert(_el$91, _$createComponent(Show, {
      get when() {
        return currentLoop().active;
      },
      get children() {
        return [(() => {
          var _el$96 = _$createElement("text");
          _$insertNode(_el$96, _$createTextNode(`Force Restart`));
          _$setProp(_el$96, "onMouseUp", handleRestart);
          _$effect((_$p) => _$setProp(_el$96, "fg", theme().warning, _$p));
          return _el$96;
        })(), (() => {
          var _el$98 = _$createElement("text");
          _$insertNode(_el$98, _$createTextNode(`Cancel loop`));
          _$setProp(_el$98, "onMouseUp", handleCancel);
          _$effect((_$p) => _$setProp(_el$98, "fg", theme().error, _$p));
          return _el$98;
        })()];
      }
    }), _el$102);
    _$insert(_el$91, _$createComponent(Show, {
      get when() {
        return _$memo(() => !!!currentLoop().active)() && currentLoop().terminationReason !== "completed";
      },
      get children() {
        var _el$100 = _$createElement("text");
        _$insertNode(_el$100, _$createTextNode(`Restart`));
        _$setProp(_el$100, "onMouseUp", handleRestart);
        _$effect((_$p) => _$setProp(_el$100, "fg", theme().success, _$p));
        return _el$100;
      }
    }), _el$102);
    _$insertNode(_el$102, _$createTextNode(`Close (esc)`));
    _$setProp(_el$102, "onMouseUp", () => props.api.ui.dialog.clear());
    _$effect((_p$) => {
      var _v$33 = theme().text, _v$34 = statusBadge().color, _v$35 = theme().textMuted, _v$36 = theme().textMuted;
      _v$33 !== _p$.e && (_p$.e = _$setProp(_el$24, "fg", _v$33, _p$.e));
      _v$34 !== _p$.t && (_p$.t = _$setProp(_el$26, "fg", _v$34, _p$.t));
      _v$35 !== _p$.a && (_p$.a = _$setProp(_el$31, "fg", _v$35, _p$.a));
      _v$36 !== _p$.o && (_p$.o = _$setProp(_el$102, "fg", _v$36, _p$.o));
      return _p$;
    }, {
      e: undefined,
      t: undefined,
      a: undefined,
      o: undefined
    });
    return _el$21;
  })();
}
function Sidebar(props) {
  const [open, setOpen] = createSignal(true);
  const [loops, setLoops] = createSignal([]);
  const [hasPlan, setHasPlan] = createSignal(false);
  const [graphStatusFormatted, setGraphStatusFormatted] = createSignal(null);
  const [graphStatusRaw, setGraphStatusRaw] = createSignal(null);
  const theme = () => props.api.theme.current;
  const directory = props.api.state.path.directory;
  const pid = getGitProjectId(directory);
  const title = createMemo(() => {
    return props.opts.showVersion ? `Forge v${VERSION}` : "Forge";
  });
  const dot = (loop) => {
    if (!loop.active) {
      if (loop.terminationReason === "completed")
        return theme().success;
      if (loop.terminationReason === "cancelled" || loop.terminationReason === "user_aborted")
        return theme().textMuted;
      return theme().error;
    }
    if (loop.phase === "auditing")
      return theme().warning;
    return theme().success;
  };
  const statusText = (loop) => {
    const max = loop.maxIterations > 0 ? `/${loop.maxIterations}` : "";
    if (loop.active)
      return `${loop.phase} · iter ${loop.iteration}${max}`;
    if (loop.terminationReason === "completed")
      return `completed · ${loop.iteration} iter${loop.iteration !== 1 ? "s" : ""}`;
    return loop.terminationReason?.replace(/_/g, " ") ?? "ended";
  };
  const redirectedSessions = new Set;
  function refreshSidebarData() {
    if (!pid)
      return;
    const states = readLoopStates(pid);
    const cutoff = Date.now() - 300000;
    const visible = states.filter((l) => l.active || l.completedAt && new Date(l.completedAt).getTime() > cutoff);
    visible.sort((a, b) => {
      if (a.active && !b.active)
        return -1;
      if (!a.active && b.active)
        return 1;
      const aTime = a.completedAt ?? a.startedAt ?? "";
      const bTime = b.completedAt ?? b.startedAt ?? "";
      return bTime.localeCompare(aTime);
    });
    setLoops(visible);
    if (props.sessionId) {
      const plan = readPlan(pid, props.sessionId);
      setHasPlan(plan !== null);
    }
    if (props.sessionId && !redirectedSessions.has(props.sessionId)) {
      const ended = states.find((l) => l.sessionId === props.sessionId && !l.active && l.terminationReason === "completed" && l.worktree && l.hostSessionId);
      if (ended) {
        redirectedSessions.add(props.sessionId);
        try {
          props.api.route.navigate("session", {
            sessionID: ended.hostSessionId
          });
          props.api.ui.toast({
            message: `Loop "${ended.name}" completed · click Forge sidebar to review`,
            variant: "success",
            duration: 5000
          });
        } catch (err) {
          console.error("[forge] sidebar: failed to redirect after loop completion", err);
        }
      }
    }
    const status = readGraphStatus2(pid, undefined, directory);
    setGraphStatusRaw(status);
    setGraphStatusFormatted(formatGraphStatus(status));
  }
  const unsubStatus = props.api.event.on("session.status", () => {
    refreshSidebarData();
  });
  const unsubDeleted = props.api.event.on("session.deleted", () => {
    refreshSidebarData();
  });
  const unsubUpdated = props.api.event.on("session.updated", () => {
    refreshSidebarData();
  });
  let pollTimer = null;
  function startPolling() {
    if (pollTimer)
      return;
    pollTimer = setInterval(() => {
      refreshSidebarData();
    }, 5000);
  }
  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }
  refreshSidebarData();
  const initTimer = setTimeout(() => {
    if (!graphStatusRaw()) {
      refreshSidebarData();
    }
  }, 2000);
  createEffect(() => {
    if (shouldPollSidebar(loops(), graphStatusRaw())) {
      startPolling();
    } else {
      stopPolling();
    }
  });
  onCleanup(() => {
    unsubStatus();
    unsubDeleted();
    unsubUpdated();
    stopPolling();
    clearTimeout(initTimer);
  });
  const hasContent = createMemo(() => {
    if (hasPlan())
      return true;
    if (props.opts.showLoops && loops().length > 0)
      return true;
    if (graphStatusFormatted())
      return true;
    return false;
  });
  const activeCount = createMemo(() => {
    return loops().filter((l) => l.active).length;
  });
  return _$createComponent(Show, {
    get when() {
      return props.opts.sidebar;
    },
    get children() {
      var _el$107 = _$createElement("box"), _el$108 = _$createElement("box"), _el$110 = _$createElement("text"), _el$111 = _$createElement("b");
      _$insertNode(_el$107, _el$108);
      _$insertNode(_el$108, _el$110);
      _$setProp(_el$108, "flexDirection", "row");
      _$setProp(_el$108, "gap", 1);
      _$setProp(_el$108, "onMouseDown", () => hasContent() && setOpen((x) => !x));
      _$insert(_el$108, _$createComponent(Show, {
        get when() {
          return hasContent();
        },
        get children() {
          var _el$109 = _$createElement("text");
          _$insert(_el$109, () => open() ? "▼" : "▶");
          _$effect((_$p) => _$setProp(_el$109, "fg", theme().text, _$p));
          return _el$109;
        }
      }), _el$110);
      _$insertNode(_el$110, _el$111);
      _$insert(_el$111, title);
      _$insert(_el$110, (() => {
        var _c$2 = _$memo(() => !!(!open() && hasPlan()));
        return () => _c$2() ? (() => {
          var _el$121 = _$createElement("span");
          _$insertNode(_el$121, _$createTextNode(` · plan`));
          _$effect((_$p) => _$setProp(_el$121, "style", {
            fg: theme().info
          }, _$p));
          return _el$121;
        })() : "";
      })(), null);
      _$insert(_el$110, (() => {
        var _c$3 = _$memo(() => !!(!open() && graphStatusFormatted() && graphStatusFormatted().text.includes("ready")));
        return () => _c$3() ? (() => {
          var _el$123 = _$createElement("span");
          _$insertNode(_el$123, _$createTextNode(` · ready`));
          _$effect((_$p) => _$setProp(_el$123, "style", {
            fg: theme().success
          }, _$p));
          return _el$123;
        })() : "";
      })(), null);
      _$insert(_el$110, (() => {
        var _c$4 = _$memo(() => !!(!open() && activeCount() > 0));
        return () => _c$4() ? (() => {
          var _el$125 = _$createElement("span");
          _$insert(_el$125, () => ` (${activeCount()} active)`);
          _$effect((_$p) => _$setProp(_el$125, "style", {
            fg: theme().textMuted
          }, _$p));
          return _el$125;
        })() : "";
      })(), null);
      _$insert(_el$107, _$createComponent(Show, {
        get when() {
          return open();
        },
        get children() {
          return [_$createComponent(Show, {
            get when() {
              return hasPlan();
            },
            get children() {
              var _el$112 = _$createElement("box"), _el$113 = _$createElement("text"), _el$115 = _$createElement("text");
              _$insertNode(_el$112, _el$113);
              _$insertNode(_el$112, _el$115);
              _$setProp(_el$112, "flexDirection", "row");
              _$setProp(_el$112, "gap", 1);
              _$setProp(_el$112, "onMouseUp", () => {
                if (!pid || !props.sessionId)
                  return;
                const plan = readPlan(pid, props.sessionId);
                if (!plan) {
                  props.api.ui.toast({
                    message: "Plan not found",
                    variant: "info",
                    duration: 3000
                  });
                  return;
                }
                const refreshSidebar = refreshSidebarData;
                props.api.ui.dialog.setSize("xlarge");
                props.api.ui.dialog.replace(() => _$createComponent(PlanViewerDialog, {
                  get api() {
                    return props.api;
                  },
                  planContent: plan,
                  projectId: pid,
                  get sessionId() {
                    return props.sessionId;
                  },
                  onRefresh: refreshSidebar
                }));
              });
              _$insertNode(_el$113, _$createTextNode(`\uD83D\uDCCB`));
              _$setProp(_el$113, "flexShrink", 0);
              _$insertNode(_el$115, _$createTextNode(`Plan`));
              _$effect((_p$) => {
                var _v$37 = {
                  fg: theme().info
                }, _v$38 = theme().text;
                _v$37 !== _p$.e && (_p$.e = _$setProp(_el$113, "style", _v$37, _p$.e));
                _v$38 !== _p$.t && (_p$.t = _$setProp(_el$115, "fg", _v$38, _p$.t));
                return _p$;
              }, {
                e: undefined,
                t: undefined
              });
              return _el$112;
            }
          }), _$createComponent(Show, {
            get when() {
              return graphStatusFormatted();
            },
            get children() {
              var _el$117 = _$createElement("box"), _el$118 = _$createElement("text"), _el$120 = _$createElement("text");
              _$insertNode(_el$117, _el$118);
              _$insertNode(_el$117, _el$120);
              _$setProp(_el$117, "flexDirection", "row");
              _$setProp(_el$117, "gap", 1);
              _$insertNode(_el$118, _$createTextNode(`•`));
              _$setProp(_el$118, "flexShrink", 0);
              _$setProp(_el$120, "wrapMode", "word");
              _$insert(_el$120, () => graphStatusFormatted().text);
              _$effect((_p$) => {
                var _v$39 = {
                  fg: theme()[graphStatusFormatted().color]
                }, _v$40 = theme().text;
                _v$39 !== _p$.e && (_p$.e = _$setProp(_el$118, "style", _v$39, _p$.e));
                _v$40 !== _p$.t && (_p$.t = _$setProp(_el$120, "fg", _v$40, _p$.t));
                return _p$;
              }, {
                e: undefined,
                t: undefined
              });
              return _el$117;
            }
          }), _$createComponent(Show, {
            get when() {
              return _$memo(() => !!props.opts.showLoops)() && loops().length > 0;
            },
            get children() {
              return _$createComponent(For, {
                get each() {
                  return loops();
                },
                children: (loop) => (() => {
                  var _el$126 = _$createElement("box"), _el$127 = _$createElement("text"), _el$129 = _$createElement("text"), _el$130 = _$createTextNode(` `), _el$131 = _$createElement("span");
                  _$insertNode(_el$126, _el$127);
                  _$insertNode(_el$126, _el$129);
                  _$setProp(_el$126, "flexDirection", "row");
                  _$setProp(_el$126, "gap", 1);
                  _$setProp(_el$126, "onMouseUp", () => {
                    if (!loop.active) {
                      props.api.ui.dialog.setSize("medium");
                      props.api.ui.dialog.replace(() => _$createComponent(LoopDetailsDialog, {
                        get api() {
                          return props.api;
                        },
                        loop,
                        onRefresh: refreshSidebarData
                      }));
                    } else if (loop.worktree && loop.workspaceId && loop.sessionId) {
                      props.api.route.navigate("session", {
                        sessionID: loop.sessionId
                      });
                    } else if (loop.worktree) {
                      props.api.ui.dialog.setSize("medium");
                      props.api.ui.dialog.replace(() => _$createComponent(LoopDetailsDialog, {
                        get api() {
                          return props.api;
                        },
                        loop,
                        onRefresh: refreshSidebarData
                      }));
                    } else {
                      props.api.route.navigate("session", {
                        sessionID: loop.sessionId
                      });
                    }
                  });
                  _$insertNode(_el$127, _$createTextNode(`•`));
                  _$setProp(_el$127, "flexShrink", 0);
                  _$insertNode(_el$129, _el$130);
                  _$insertNode(_el$129, _el$131);
                  _$setProp(_el$129, "wrapMode", "word");
                  _$insert(_el$129, () => truncateMiddle(loop.name, 25), _el$130);
                  _$insert(_el$131, () => statusText(loop));
                  _$effect((_p$) => {
                    var _v$41 = {
                      fg: dot(loop)
                    }, _v$42 = theme().text, _v$43 = {
                      fg: theme().textMuted
                    };
                    _v$41 !== _p$.e && (_p$.e = _$setProp(_el$127, "style", _v$41, _p$.e));
                    _v$42 !== _p$.t && (_p$.t = _$setProp(_el$129, "fg", _v$42, _p$.t));
                    _v$43 !== _p$.a && (_p$.a = _$setProp(_el$131, "style", _v$43, _p$.a));
                    return _p$;
                  }, {
                    e: undefined,
                    t: undefined,
                    a: undefined
                  });
                  return _el$126;
                })()
              });
            }
          })];
        }
      }), null);
      _$effect((_$p) => _$setProp(_el$110, "fg", theme().text, _$p));
      return _el$107;
    }
  });
}
var id = "oc-forge";
var tui = async (api) => {
  const tuiConfig = loadTuiConfig();
  const opts = {
    sidebar: tuiConfig?.sidebar ?? true,
    showLoops: tuiConfig?.showLoops ?? true,
    showVersion: tuiConfig?.showVersion ?? true,
    keybinds: {
      ...DEFAULT_KEYBINDS,
      ...tuiConfig?.keybinds
    }
  };
  if (!opts.sidebar)
    return;
  api.command.register(() => {
    const directory = api.state.path.directory;
    const pid = getGitProjectId(directory);
    if (!pid)
      return [];
    const states = readLoopStates(pid);
    if (states.length === 0)
      return [];
    return [{
      title: "Forge: Show loops",
      value: "forge.loops.show",
      description: `${states.length} loop${states.length !== 1 ? "s" : ""}`,
      category: "Forge",
      keybind: opts.keybinds.showLoops,
      onSelect: () => {
        const worktreeLoops = states.filter((l) => l.worktree);
        const loopOptions = worktreeLoops.map((l) => {
          const status = l.active ? l.phase : l.terminationReason?.replace(/_/g, " ") ?? "ended";
          return {
            title: l.name,
            value: l.name,
            description: status
          };
        });
        const showLoopList = () => {
          api.ui.dialog.setSize("large");
          api.ui.dialog.replace(() => _$createComponent(api.ui.DialogSelect, {
            title: "Loops",
            options: loopOptions,
            onSelect: (opt) => {
              const loopName = opt.value;
              const freshLoop = pid ? readLoopByName(pid, loopName) : null;
              if (freshLoop) {
                api.ui.dialog.setSize("medium");
                api.ui.dialog.replace(() => _$createComponent(LoopDetailsDialog, {
                  api,
                  loop: freshLoop,
                  onBack: showLoopList,
                  onRefresh: () => {}
                }));
              } else {
                api.ui.dialog.clear();
              }
            }
          }));
        };
        showLoopList();
      }
    }];
  });
  api.command.register(() => {
    const route = api.route.current;
    if (route.name !== "session")
      return [];
    const directory = api.state.path.directory;
    const pid = getGitProjectId(directory);
    if (!pid)
      return [];
    const sessionID = route.params.sessionID;
    const refreshSidebar = () => {};
    return [{
      title: "Forge: View plan",
      value: "forge.plan.view",
      description: "View cached plan for this session",
      category: "Forge",
      keybind: opts.keybinds.viewPlan,
      onSelect: () => {
        const freshPlan = readPlan(pid, sessionID);
        if (!freshPlan) {
          api.ui.toast({
            message: "No plan found for this session",
            variant: "info",
            duration: 3000
          });
          return;
        }
        api.ui.dialog.setSize("xlarge");
        api.ui.dialog.replace(() => _$createComponent(PlanViewerDialog, {
          api,
          planContent: freshPlan,
          projectId: pid,
          sessionId: sessionID,
          onRefresh: refreshSidebar
        }));
      }
    }, {
      title: "Forge: Execute plan",
      value: "forge.plan.execute",
      description: "Execute cached plan",
      category: "Forge",
      keybind: opts.keybinds.executePlan,
      onSelect: () => {
        const freshPlan = readPlan(pid, sessionID);
        if (!freshPlan) {
          api.ui.toast({
            message: "No plan found for this session",
            variant: "info",
            duration: 3000
          });
          return;
        }
        api.ui.dialog.setSize("xlarge");
        api.ui.dialog.replace(() => _$createComponent(PlanViewerDialog, {
          api,
          planContent: freshPlan,
          projectId: pid,
          sessionId: sessionID,
          onRefresh: refreshSidebar,
          startInExecuteMode: true
        }));
      }
    }];
  });
  api.slots.register({
    order: 150,
    slots: {
      sidebar_content(_ctx, slotProps) {
        return _$createComponent(Sidebar, {
          api,
          opts,
          get sessionId() {
            return slotProps.session_id;
          }
        });
      }
    }
  });
};
var plugin = {
  id,
  tui
};
var tui_default = plugin;
export {
  readLoopStates,
  readLoopByName,
  tui_default as default
};

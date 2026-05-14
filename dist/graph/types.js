/** Mapping from file extension to language */
export const EXT_TO_LANGUAGE = {
    // TypeScript
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.mts': 'typescript',
    '.cts': 'typescript',
    // JavaScript
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    // Python
    '.py': 'python',
    '.pyw': 'python',
    // Go
    '.go': 'go',
    // Rust
    '.rs': 'rust',
    // Java
    '.java': 'java',
    // C
    '.c': 'c',
    '.h': 'c',
    // C++
    '.cpp': 'cpp',
    '.cc': 'cpp',
    '.cxx': 'cpp',
    '.hpp': 'cpp',
    '.hh': 'cpp',
    '.hxx': 'cpp',
    // C#
    '.cs': 'csharp',
    // Ruby
    '.rb': 'ruby',
    '.erb': 'ruby',
    // PHP
    '.php': 'php',
    // Swift
    '.swift': 'swift',
    // Kotlin
    '.kt': 'kotlin',
    '.kts': 'kotlin',
    // Scala
    '.scala': 'scala',
    '.sc': 'scala',
    // Lua
    '.lua': 'lua',
    // Elixir
    '.ex': 'elixir',
    '.exs': 'elixir',
    // Dart
    '.dart': 'dart',
    // Zig
    '.zig': 'zig',
    // Shell
    '.sh': 'bash',
    '.bash': 'bash',
    '.zsh': 'bash',
    // OCaml
    '.ml': 'ocaml',
    '.mli': 'ocaml',
    // Objective-C
    '.m': 'objc',
    // CSS
    '.css': 'css',
    '.scss': 'css',
    '.less': 'css',
    // HTML
    '.html': 'html',
    '.htm': 'html',
    // JSON
    '.json': 'json',
    '.jsonc': 'json',
    // TOML
    '.toml': 'toml',
    // YAML
    '.yaml': 'yaml',
    '.yml': 'yaml',
    // Dockerfile
    '.dockerfile': 'dockerfile',
    // Vue
    '.vue': 'vue',
    // ReScript
    '.res': 'rescript',
    '.resi': 'rescript',
    // Solidity
    '.sol': 'solidity',
    // TLA+
    '.tla': 'tlaplus',
    // Emacs Lisp
    '.el': 'elisp',
};
/** Detect language from a file path */
export function detectLanguageFromPath(file) {
    const dot = file.lastIndexOf('.');
    if (dot === -1) {
        const name = file.slice(file.lastIndexOf('/') + 1);
        if (name === 'Dockerfile' || name.startsWith('Dockerfile.'))
            return 'dockerfile';
        return 'unknown';
    }
    return EXT_TO_LANGUAGE[file.slice(dot).toLowerCase()] ?? 'unknown';
}
//# sourceMappingURL=types.js.map
import ts from "typescript";

export const MAX_SCRIPT_BYTES = 64 * 1024;
const forbiddenNames = new Set([
  "eval",
  "Function",
  "AsyncFunction",
  "GeneratorFunction",
  "require",
  "process",
  "globalThis",
  "window",
  "document",
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "Worker",
  "importScripts",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "navigator",
  "location",
  "Deno",
  "Bun",
  "setTimeout",
  "setInterval",
  "constructor",
  "prototype",
  "__proto__",
]);
const forbiddenImports = new Set([
  "fs",
  "node:fs",
  "child_process",
  "node:child_process",
  "vm",
  "node:vm",
  "net",
  "node:net",
  "http",
  "node:http",
  "https",
  "node:https",
]);

export function scanScript(code) {
  const issues = [];
  if (typeof code !== "string")
    return {
      status: "REJECTED",
      issues: [
        { rule: "INPUT_TYPE", message: "Script must be a string", line: 0 },
      ],
    };
  if (Buffer.byteLength(code, "utf8") > MAX_SCRIPT_BYTES)
    issues.push({ rule: "SIZE", message: "Script exceeds 64 KiB", line: 0 });
  if (!code.trim())
    issues.push({ rule: "EMPTY", message: "Script is empty", line: 0 });
  const ast = ts.createSourceFile(
    "bot.js",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const add = (node, rule, message) =>
    issues.push({
      rule,
      message,
      line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
    });
  for (const diagnostic of ast.parseDiagnostics)
    issues.push({
      rule: "SYNTAX",
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
      line: ast.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1,
    });
  let exportedGetMove = false;
  for (const stmt of ast.statements) {
    if (
      ts.isFunctionDeclaration(stmt) &&
      stmt.name?.text === "getMove" &&
      stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    )
      exportedGetMove = true;
    if (
      ts.isVariableStatement(stmt) &&
      stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
      stmt.declarationList.declarations.some(
        (d) => ts.isIdentifier(d.name) && d.name.text === "getMove",
      )
    )
      exportedGetMove = true;
    if (ts.isExportAssignment(stmt))
      add(
        stmt,
        "EXPORT_FORM",
        "Use a named export: export function getMove(state) {...}",
      );
  }
  if (!exportedGetMove)
    issues.push({
      rule: "BOT_INTERFACE",
      message: "Required export getMove(state) not found",
      line: 0,
    });
  const visit = (node) => {
    if (
      ts.isImportDeclaration(node) ||
      ts.isImportEqualsDeclaration(node) ||
      ts.isExportDeclaration(node)
    )
      add(
        node,
        "IMPORT_EXPORT",
        "Imports and re-exports are not allowed in submitted bots",
      );
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    )
      add(node, "DYNAMIC_IMPORT", "Dynamic import is not allowed");
    if (ts.isIdentifier(node) && forbiddenNames.has(node.text))
      add(node, "FORBIDDEN_NAME", `Restricted name: ${node.text}`);
    if (ts.isStringLiteral(node) && forbiddenImports.has(node.text))
      add(node, "SENSITIVE_MODULE", "Restricted module reference");
    if (ts.isWithStatement(node))
      add(node, "WITH", "with statements are not allowed");
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return {
    status: issues.length ? "REJECTED" : "PASSED",
    issues: issues.slice(0, 100),
    scannerVersion: "static-v1",
  };
}

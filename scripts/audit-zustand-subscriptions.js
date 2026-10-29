#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const sourceRoot = path.resolve(process.argv[2] ?? 'src');

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(resolved);
    return /\.(ts|tsx)$/.test(entry.name) ? [resolved] : [];
  });
}

function normalizedText(node, sourceFile) {
  return node.getText(sourceFile).replace(/\s+/g, ' ').slice(0, 110);
}

function classify(call, sourceFile) {
  const selector = call.arguments[0];
  if (selector === undefined) return { kind: 'broad', frequency: 'every store update', text: '(whole store)' };
  if (ts.isCallExpression(selector) && selector.expression.getText(sourceFile) === 'useShallow') {
    return { kind: 'shallow object', frequency: 'when selected fields change', text: normalizedText(selector, sourceFile) };
  }
  if (!ts.isArrowFunction(selector) && !ts.isFunctionExpression(selector)) {
    return { kind: 'unknown', frequency: 'inspect', text: normalizedText(selector, sourceFile) };
  }
  const body = selector.body;
  const text = normalizedText(selector, sourceFile);
  const granular = ts.isPropertyAccessExpression(body)
    && ts.isIdentifier(body.expression)
    && body.expression.text === selector.parameters[0]?.name.getText(sourceFile);
  if (granular) {
    const field = body.name.text;
    const frequency = field === 'currentTime'
      ? 'playback sample (~10 Hz)'
      : /^(set|toggle|add|remove|update|clear|restore|notify|open|close)/.test(field)
        ? 'stable action reference'
        : 'when field changes';
    return { kind: 'granular', frequency, text };
  }
  return {
    kind: 'derived selector',
    frequency: text.includes('currentTime') ? 'evaluated on every update; output may change at ~10 Hz' : 'evaluated on every update',
    text,
  };
}

const rows = [];
for (const filename of sourceFiles(sourceRoot)) {
  const source = fs.readFileSync(filename, 'utf8');
  const sourceFile = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    filename.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(sourceFile) === 'useStudioStore') {
      const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      rows.push({
        file: path.relative(process.cwd(), filename),
        line: position.line + 1,
        ...classify(node, sourceFile),
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

process.stdout.write('| Location | Classification | Playback frequency | Selector |\n');
process.stdout.write('|---|---|---|---|\n');
for (const row of rows) {
  const selector = row.text.replaceAll('|', '\\|').replaceAll('`', '\\`');
  process.stdout.write(`| \`${row.file}:${row.line}\` | ${row.kind} | ${row.frequency} | \`${selector}\` |\n`);
}
const counts = rows.reduce((result, row) => {
  result[row.kind] = (result[row.kind] ?? 0) + 1;
  return result;
}, {});
process.stderr.write(`${rows.length} subscriptions: ${JSON.stringify(counts)}\n`);

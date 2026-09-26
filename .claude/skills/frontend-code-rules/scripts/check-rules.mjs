import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import ts from 'typescript';

const MAX_LINES = 100;
const ROOT = process.argv[2] ?? 'src';
const TESTING_DIRECTORY = /[\\/]testing[\\/]/;

const NAMING_RULES = [
  { pattern: /\.module\.css$/, valid: (name) => /^[A-Z][A-Za-z0-9]*\.module\.css$/.test(name) },
  { pattern: /\.css$/, valid: (name) => /^[a-z][A-Za-z0-9]*\.css$/.test(name) },
  {
    pattern: /\.tsx$/,
    valid: (name, path) =>
      /^([A-Z][A-Za-z0-9]*(\.test)?|use[A-Z][A-Za-z0-9]*\.test|main)\.tsx$/.test(name) ||
      (TESTING_DIRECTORY.test(path) && /^[a-z][A-Za-z0-9]*\.tsx$/.test(name)),
  },
  { pattern: /\.ts$/, valid: (name) => /^[a-z][A-Za-z0-9]*(\.test)?\.ts$/.test(name) },
];

const listFiles = (directory) =>
  readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });

const lineCount = (source) => source.replace(/\r?\n$/, '').split(/\r?\n/).length;

const lineNumber = (source, position) => source.slice(0, position).split('\n').length;

const lineCountViolations = (path, source) => {
  const total = lineCount(source);
  return total > MAX_LINES ? [`${path}: ${total} lines (max ${MAX_LINES})`] : [];
};

const scriptCommentPositions = (path, source) => {
  const kind = path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, kind);
  const positions = new Set();
  const jsxTexts = [];
  const collect = (ranges) => ranges?.forEach((range) => positions.add(range.pos));
  const visit = (node) => {
    if (node.kind === ts.SyntaxKind.JsxText) {
      jsxTexts.push([node.getFullStart(), node.getEnd()]);
      return;
    }
    collect(ts.getLeadingCommentRanges(source, node.getFullStart()));
    collect(ts.getTrailingCommentRanges(source, node.getEnd()));
    node.getChildren(file).forEach(visit);
  };
  visit(file);
  const isJsxText = (position) => jsxTexts.some(([start, end]) => position >= start && position < end);
  return [...positions].filter((position) => !isJsxText(position));
};

const styleCommentPositions = (source) =>
  [...source.matchAll(/\/\*/g)].map((match) => match.index);

const commentViolations = (path, source) => {
  const positions = path.endsWith('.css')
    ? styleCommentPositions(source)
    : scriptCommentPositions(path, source);
  return positions
    .sort((first, second) => first - second)
    .map((position) => `${path}:${lineNumber(source, position)}: comment not allowed`);
};

const namingViolations = (path) => {
  const name = basename(path);
  const rule = NAMING_RULES.find(({ pattern }) => pattern.test(name));
  return rule && !rule.valid(name, path) ? [`${path}: invalid file name`] : [];
};

const fileViolations = (path) => {
  const source = readFileSync(path, 'utf8');
  return [
    ...lineCountViolations(path, source),
    ...commentViolations(path, source),
    ...namingViolations(path),
  ];
};

const isChecked = (path) => /\.(ts|tsx|css)$/.test(path) && !path.endsWith('.d.ts');

const files = existsSync(ROOT) ? listFiles(ROOT).filter(isChecked) : [];
const violations = files.flatMap(fileViolations);
violations.forEach((violation) => console.log(violation));
console.log(`${violations.length} violation(s)`);
process.exit(violations.length > 0 ? 1 : 0);

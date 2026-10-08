#!/usr/bin/env node
// BLITZ AI スクールのステータスライン
// Claude Code が標準入力に渡す JSON を読み、画面の下に2行を出す。
//   1行目: CTX（コンテキストの使用率）・5h（5時間の上限）・1w（1週間の上限）を横に並べる。
//          どれも棒と％。上限は、元に戻るまでの時間も添える（例 2h24m・6d17h）
//   2行目: モデル名・フォルダ名
// 色: CTX は講座の目安（30〜40% で減らす）に合わせて 30% で黄・40% で赤。
//     5h・1w は 50% で黄・80% で赤。
// 依存なし（Node.js だけで動く）。
'use strict';

const C = { green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', dim: '\x1b[2m', reset: '\x1b[0m' };
const CELLS = 10;

function color(pct, warn, alert) {
  if (pct >= alert) return C.red;
  if (pct >= warn) return C.yellow;
  return C.green;
}

function bar(pct) {
  const filled = Math.max(0, Math.min(CELLS, Math.round(pct / 100 * CELLS)));
  return '█'.repeat(filled) + '░'.repeat(CELLS - filled);
}

function untilReset(resetsAt) {
  if (typeof resetsAt !== 'number') return '';
  const min = Math.max(0, Math.round((resetsAt * 1000 - Date.now()) / 60000));
  const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
  if (d > 0) return `${d}d${h}h`;
  if (h > 0) return `${h}h${m}m`;
  return `${m}m`;
}

function meter(label, pct, warn, alert, resetsAt) {
  if (typeof pct !== 'number' || !isFinite(pct)) return `${C.dim}${label} --${C.reset}`;
  const p = Math.round(pct);                       // 色も棒も、表示する数字で決める（29.6% は 30% と出して黄色）
  const col = color(p, warn, alert);
  const rest = untilReset(resetsAt);
  return `${label} ${col}${bar(p)} ${p}%${C.reset}` + (rest ? ` ${C.dim}${rest}${C.reset}` : '');
}

// 画面に出す名前から、制御文字（色や画面を乱す記号）を外す
const clean = s => (typeof s === 'string' ? s : '').replace(/[\x00-\x1f\x7f]/g, '');

function main(raw) {
  const obj = v => (v && typeof v === 'object') ? v : {};
  let d;
  try { d = obj(JSON.parse(raw)); } catch { process.stdout.write('statusline: waiting for data\n'); return; }
  const ctx = obj(d.context_window), rl = obj(d.rate_limits);
  const five = obj(rl.five_hour), week = obj(rl.seven_day);
  const model = clean(obj(d.model).display_name);
  const dir = clean(obj(d.workspace).current_dir || d.cwd).split(/[\\/]/).filter(Boolean).pop() || '';

  const sep = ` ${C.dim}│${C.reset} `;
  const meters = [meter('CTX', ctx.used_percentage, 30, 40)];
  // 上限の値は、その会話で最初の返事が出るまで届かない（しばらく使わず5時間の枠が切れたあとも同じ）。そのあいだは「--」で場所を空けておく
  meters.push(meter('5h', five.used_percentage, 50, 80, five.resets_at));
  meters.push(meter('1w', week.used_percentage, 50, 80, week.resets_at));
  const info = [model, dir].filter(Boolean).join(' │ ');
  process.stdout.write(meters.join(sep) + '\n' + (info ? `${C.dim}${info}${C.reset}\n` : ''));
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { buf += c; });
process.stdin.on('end', () => main(buf));

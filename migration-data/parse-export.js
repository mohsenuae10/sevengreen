// Parse the CSV exported from Lovable SQL editor
// CSV format: single column "export_data" with JSON escaped
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'export.csv');
const raw = fs.readFileSync(csvPath, 'utf8');

// Remove header line and surrounding quotes, unescape ""
const lines = raw.split('\n');
const header = lines[0].trim(); // "export_data"
if (header !== 'export_data') {
  console.error('Unexpected CSV header:', header);
  process.exit(1);
}

// Remainder is the JSON value; may span multiple lines
let body = lines.slice(1).join('\n').trim();

// Remove surrounding double quotes and unescape "" -> "
if (body.startsWith('"') && body.endsWith('"')) {
  body = body.slice(1, -1);
}
body = body.replace(/""/g, '"');

// Parse
let data;
try {
  data = JSON.parse(body);
} catch (e) {
  console.error('JSON parse error:', e.message);
  fs.writeFileSync(path.join(__dirname, 'export-debug.txt'), body);
  process.exit(1);
}

// Write pretty JSON
const outPath = path.join(__dirname, 'export.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

// Report row counts
console.log('\n=== Export summary ===');
const tables = Object.keys(data);
let total = 0;
for (const t of tables) {
  const rows = Array.isArray(data[t]) ? data[t].length : 0;
  total += rows;
  console.log(`  ${t.padEnd(25)} ${rows} rows`);
}
console.log(`  ${''.padEnd(25)} ------`);
console.log(`  ${'TOTAL'.padEnd(25)} ${total} rows`);
console.log(`\nWrote: ${outPath}`);

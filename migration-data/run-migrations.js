// Run migrations via Supabase Management API
// Usage: node run-migrations.js <access_token>
const fs = require('fs');
const https = require('https');

const PROJECT_REF = 'kvieobbwmlbddqpbdovg';
const ACCESS_TOKEN = process.argv[2];

if (!ACCESS_TOKEN) {
  console.error('Usage: node run-migrations.js <access_token>');
  process.exit(1);
}

function apiQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      method: 'POST',
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Split SQL into individual statements (naive split on semicolons,
// respecting multi-line function bodies by looking for $$ blocks)
function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let dollarTag = '';

  const lines = sql.split('\n');
  for (const line of lines) {
    // Check for dollar-quoting
    const dollarMatches = line.match(/\$\$|\$[a-z_][a-z_0-9]*\$/gi) || [];
    for (const tag of dollarMatches) {
      if (!inDollarQuote) {
        inDollarQuote = true;
        dollarTag = tag;
      } else if (tag === dollarTag) {
        inDollarQuote = false;
        dollarTag = '';
      }
    }

    current += line + '\n';

    if (!inDollarQuote && line.trimEnd().endsWith(';')) {
      const stmt = current.trim();
      if (stmt && stmt !== ';') {
        statements.push(stmt);
      }
      current = '';
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

async function main() {
  const sql = fs.readFileSync(__dirname + '/migrations_only.sql', 'utf8');
  const statements = splitStatements(sql);

  console.log(`Found ${statements.length} SQL statements`);
  console.log('Running migrations...\n');

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 80);
    process.stdout.write(`[${i+1}/${statements.length}] ${preview}... `);

    const res = await apiQuery(stmt);

    if (res.status === 200 || res.status === 201) {
      console.log('✓');
      success++;
    } else {
      let errMsg = '';
      try { errMsg = JSON.parse(res.body).message || res.body; } catch { errMsg = res.body; }

      // Skip "already exists" errors gracefully
      if (errMsg.includes('already exists') || errMsg.includes('duplicate')) {
        console.log(`⟳ (already exists)`);
        skipped++;
      } else {
        console.log(`❌ ${errMsg.slice(0, 120)}`);
        failed++;
      }
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`✓ Success: ${success}`);
  console.log(`⟳ Skipped: ${skipped}`);
  console.log(`❌ Failed:  ${failed}`);
}

main().catch(e => { console.error(e); process.exit(1); });

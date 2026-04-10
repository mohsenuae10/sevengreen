// Import exported data into the NEW Supabase project via PostgREST
// Uses the service_role key (bypasses RLS)
//
// Usage: node import-data.js
//
// Prerequisites:
//   1. Schema must already exist in the new project.
//      Run `supabase/combined_migrations.sql` in the new project's SQL editor first.
//   2. export.json must exist (run parse-export.js first).

const fs = require('fs');
const path = require('path');
const https = require('https');

// --- Config ---------------------------------------------------------------
const NEW_SUPABASE_URL = 'https://kvieobbwmlbddqpbdovg.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aWVvYmJ3bWxiZGRxcGJkb3ZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgwNzExNSwiZXhwIjoyMDkxMzgzMTE1fQ.jcxXlWTTvvgw2kovR8T2iP0ht2BjKi0UgUVMNOwDdtM';

// Order matters: parents first, children next (foreign key dependencies)
const IMPORT_ORDER = [
  'user_roles',
  'site_settings',
  'public_settings',
  'categories',
  'blog_categories',
  'blog_tags',
  'products',
  'product_images',
  'blog_posts',
  'blog_post_tags',
  'reviews',
  'promotional_banners',
  'url_redirects',
  'orders',
  'order_items',
  'invoices',
  'invoice_visits',
];

// Columns that only exist in newer schema (English translations); include only if present in source.
// -- no schema mapping needed for now; we insert all columns as-is

// --- Helpers --------------------------------------------------------------
function request(method, urlPath, bodyObj) {
  return new Promise((resolve, reject) => {
    const url = new URL(NEW_SUPABASE_URL + urlPath);
    const body = bodyObj == null ? '' : JSON.stringify(bodyObj);
    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: 'Bearer ' + SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal,resolution=merge-duplicates',
      },
    };
    if (body) options.headers['Content-Length'] = Buffer.byteLength(body);
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () =>
        resolve({ status: res.statusCode, headers: res.headers, body: data })
      );
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function insertBatch(table, rows) {
  if (rows.length === 0) return { inserted: 0, failed: 0 };
  // Chunk into batches of 50
  const CHUNK_SIZE = 50;
  let inserted = 0;
  let failed = 0;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const res = await request('POST', `/rest/v1/${table}`, chunk);
    if (res.status >= 200 && res.status < 300) {
      inserted += chunk.length;
    } else {
      failed += chunk.length;
      console.error(`  ❌ chunk ${i / CHUNK_SIZE + 1} failed (status ${res.status}):`);
      console.error(`     ${res.body.slice(0, 500)}`);
    }
  }
  return { inserted, failed };
}

async function checkTableExists(table) {
  const res = await request('GET', `/rest/v1/${table}?select=*&limit=1`);
  return res.status !== 404 && res.status !== 401;
}

// --- Main -----------------------------------------------------------------
async function main() {
  const jsonPath = path.join(__dirname, 'export.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('export.json not found. Run parse-export.js first.');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log('🔍 Checking schema in new project...');
  const missing = [];
  for (const t of IMPORT_ORDER) {
    const exists = await checkTableExists(t);
    if (!exists) missing.push(t);
  }
  if (missing.length > 0) {
    console.error(`\n❌ Missing tables in new project:`);
    missing.forEach((t) => console.error(`   - ${t}`));
    console.error(
      '\nApply the schema first by running `supabase/combined_migrations.sql` in the new project SQL editor.'
    );
    process.exit(1);
  }
  console.log('✓ All tables exist\n');

  console.log('📤 Importing data into new project...\n');
  let totalInserted = 0;
  let totalFailed = 0;
  for (const table of IMPORT_ORDER) {
    const rows = data[table] || [];
    process.stdout.write(`  ${table.padEnd(25)} ${rows.length} rows ... `);
    const { inserted, failed } = await insertBatch(table, rows);
    totalInserted += inserted;
    totalFailed += failed;
    if (failed === 0) console.log(`✓ ${inserted} inserted`);
    else console.log(`⚠️  ${inserted} inserted, ${failed} failed`);
  }

  console.log(`\n=== Import complete ===`);
  console.log(`  Inserted: ${totalInserted}`);
  console.log(`  Failed:   ${totalFailed}`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});

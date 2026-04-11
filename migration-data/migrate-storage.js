// Migrate storage files from old Supabase project to new one
// Downloads public files from old project, uploads to new project
// Then updates the URLs in the database

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OLD_PROJECT = 'kcunskgjvmzrxenjblmk';
const NEW_PROJECT = 'kvieobbwmlbddqpbdovg';
const NEW_SUPABASE_URL = `https://${NEW_PROJECT}.supabase.co`;
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aWVvYmJ3bWxiZGRxcGJkb3ZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgwNzExNSwiZXhwIjoyMDkxMzgzMTE1fQ.jcxXlWTTvvgw2kovR8T2iP0ht2BjKi0UgUVMNOwDdtM';

// Download a URL to a buffer
function download(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(download(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || 'application/octet-stream' }));
    }).on('error', reject);
  });
}

// Upload buffer to Supabase storage
function uploadToStorage(bucket, objectPath, buffer, contentType) {
  return new Promise((resolve, reject) => {
    const urlPath = `/storage/v1/object/${bucket}/${objectPath}`;
    const options = {
      method: 'POST',
      hostname: `${NEW_PROJECT}.supabase.co`,
      path: urlPath,
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: 'Bearer ' + SERVICE_ROLE_KEY,
        'Content-Type': contentType,
        'Content-Length': buffer.length,
        'x-upsert': 'true',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

// Update a URL in the database via PostgREST
function updateUrl(table, column, oldUrl, newUrl) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ [column]: newUrl });
    const filterPath = `/rest/v1/${table}?${column}=eq.${encodeURIComponent(oldUrl)}`;
    const options = {
      method: 'PATCH',
      hostname: `${NEW_PROJECT}.supabase.co`,
      path: filterPath,
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: 'Bearer ' + SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Prefer: 'return=minimal',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'export.json'), 'utf8'));

  // Collect all image URL references: {table, column, url}
  const urlRefs = [];
  const addUrl = (table, column, url) => {
    if (url && url.includes(OLD_PROJECT)) {
      urlRefs.push({ table, column, url });
    }
  };

  (data.products || []).forEach(r => addUrl('products', 'image_url', r.image_url));
  (data.product_images || []).forEach(r => addUrl('product_images', 'image_url', r.image_url));
  (data.categories || []).forEach(r => {
    addUrl('categories', 'image_url', r.image_url);
    addUrl('categories', 'banner_url', r.banner_url);
  });
  (data.promotional_banners || []).forEach(r => addUrl('promotional_banners', 'image_url', r.image_url));
  (data.site_settings || []).forEach(r => addUrl('site_settings', 'store_logo_url', r.store_logo_url));
  (data.public_settings || []).forEach(r => addUrl('public_settings', 'store_logo_url', r.store_logo_url));
  (data.blog_posts || []).forEach(r => addUrl('blog_posts', 'featured_image_url', r.featured_image_url));

  // Deduplicate URLs (same URL might appear in multiple rows)
  const uniqueUrls = [...new Set(urlRefs.map(r => r.url))];
  console.log(`Found ${urlRefs.length} URL references across ${uniqueUrls.length} unique files\n`);

  const urlMap = {}; // old url -> new url
  let downloaded = 0, failed = 0;

  for (const oldUrl of uniqueUrls) {
    // Parse the path: .../storage/v1/object/public/{bucket}/{path}
    const match = oldUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (!match) {
      console.log(`⚠ Cannot parse URL: ${oldUrl.slice(0, 80)}`);
      failed++;
      continue;
    }
    const bucket = match[1];
    const objectPath = match[2];

    process.stdout.write(`[${downloaded + failed + 1}/${uniqueUrls.length}] ${bucket}/${objectPath.slice(0, 50)}... `);

    try {
      // Download from old project
      const { buffer, contentType } = await download(oldUrl);

      // Upload to new project
      const uploadRes = await uploadToStorage(bucket, objectPath, buffer, contentType);

      if (uploadRes.status >= 200 && uploadRes.status < 300) {
        const newUrl = `https://${NEW_PROJECT}.supabase.co/storage/v1/object/public/${bucket}/${objectPath}`;
        urlMap[oldUrl] = newUrl;
        downloaded++;
        console.log(`✓ (${(buffer.length / 1024).toFixed(1)}KB)`);
      } else {
        let err = '';
        try { err = JSON.parse(uploadRes.body).message || uploadRes.body; } catch { err = uploadRes.body; }
        console.log(`❌ upload ${uploadRes.status}: ${err.slice(0, 80)}`);
        failed++;
      }
    } catch (e) {
      console.log(`❌ ${e.message}`);
      failed++;
    }
  }

  console.log(`\n=== File migration: ${downloaded} copied, ${failed} failed ===\n`);

  if (downloaded === 0) {
    console.log('No files copied, skipping URL updates.');
    return;
  }

  // Update URLs in database
  console.log('Updating URLs in database...\n');
  let updOk = 0, updFail = 0;

  for (const ref of urlRefs) {
    const newUrl = urlMap[ref.url];
    if (!newUrl) continue; // failed to copy this file

    const res = await updateUrl(ref.table, ref.column, ref.url, newUrl);
    if (res.status >= 200 && res.status < 300) {
      updOk++;
    } else {
      updFail++;
      console.log(`❌ Update ${ref.table}.${ref.column}: ${res.body.slice(0, 100)}`);
    }
  }

  console.log(`URL updates: ${updOk} succeeded, ${updFail} failed`);
  console.log('\nStorage migration complete!');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });

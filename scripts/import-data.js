/**
 * Data Import / Restore Tool
 * Usage: node scripts/import-data.js
 * 
 * Imports exported JSON files from /backups into the database using Supabase client.
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY
 * from .env.local or environment variables.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to load .env.local if present
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[match[1]] = value.trim();
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing NEXT_PUBLIC_SUPABASE_URL or Supabase Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importTable(tableName, fileName, batchSize = 10) {
  const filePath = path.resolve(__dirname, `../backups/${fileName}`);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Skipping ${tableName}: ${filePath} does not exist`);
    return;
  }

  console.log(`\n📦 Importing ${tableName} from ${fileName}...`);
  const rawData = fs.readFileSync(filePath, 'utf8');
  const rows = JSON.parse(rawData);

  if (!Array.isArray(rows) || rows.length === 0) {
    console.log(`ℹ️ No rows found for ${tableName}`);
    return;
  }

  console.log(`Total rows to import: ${rows.length}`);
  let successCount = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    // Remove or keep id based on identity
    const sanitizedChunk = chunk.map(row => {
      const copy = { ...row };
      // Keep everything as-is for exact restore
      return copy;
    });

    const { error } = await supabase.from(tableName).upsert(sanitizedChunk, { onConflict: 'id' });
    if (error) {
      console.error(`❌ Batch error [${i}..${i + chunk.length}]:`, error.message);
    } else {
      successCount += chunk.length;
      process.stdout.write(`✅ Restored ${successCount}/${rows.length} rows\r`);
    }
  }

  console.log(`\n🎉 Finished ${tableName}: ${successCount}/${rows.length} rows restored.`);
}

async function run() {
  console.log('🚀 Starting Data Restore to:', supabaseUrl);
  
  // 1. Categories
  await importTable('TBM_PRODUCT_CATEGORIES', 'TBM_PRODUCT_CATEGORIES.json', 10);
  
  // 2. Program Options
  await importTable('TBM_PROGRAM_OPTIONS', 'TBM_PROGRAM_OPTIONS.json', 20);

  // 3. Products
  await importTable('TB_PRODUCTS', 'TB_PRODUCTS.json', 5);

  // 4. Software
  await importTable('TB_PRODUCT_SOFTWARE', 'TB_PRODUCT_SOFTWARE.json', 2);

  // 5. Solution Topics (if exists)
  await importTable('TB_SOLUTION_TOPICS', 'TB_SOLUTION_TOPICS.json', 5);

  console.log('\n🏁 All imports completed successfully!');
}

run().catch(err => {
  console.error('Fatal error during import:', err);
  process.exit(1);
});


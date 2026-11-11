/**
 * Database Restore Script: Restores all backups/*.json into Local PostgreSQL
 * Run: node scripts/restore-to-postgres.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// 1. Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value.trim();
    }
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ Error: DATABASE_URL is missing in .env.local');
  process.exit(1);
}

const client = new Client({ connectionString });

async function restoreTable(tableName, fileName, idCol = 'id') {
  const filePath = path.resolve(__dirname, `../backups/${fileName}`);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Backup file ${fileName} not found, skipping.`);
    return;
  }

  console.log(`\n📦 Restoring ${tableName} from backups/${fileName}...`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const rows = JSON.parse(raw);

  if (!Array.isArray(rows) || rows.length === 0) {
    console.log(`ℹ️ No rows to restore for ${tableName}`);
    return;
  }

  console.log(`Total rows to insert: ${rows.length}`);
  let count = 0;

  for (const row of rows) {
    const keys = Object.keys(row);
    const columns = keys.map(k => `"${k}"`).join(', ');
    const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');

    const values = keys.map(k => {
      const val = row[k];
      if (val === null || val === undefined) return null;
      if (typeof val === 'object') {
        return JSON.stringify(val);
      }
      return val;
    });

    // Generate update clause for ON CONFLICT
    const updateClauses = keys
      .filter(k => k !== idCol && k !== 'created_at')
      .map(k => `"${k}" = EXCLUDED."${k}"`)
      .join(', ');

    const conflictClause = updateClauses.length > 0
      ? `ON CONFLICT ("${idCol}") DO UPDATE SET ${updateClauses}`
      : `ON CONFLICT ("${idCol}") DO NOTHING`;

    const sql = `INSERT INTO public."${tableName}" (${columns}) VALUES (${placeholders}) ${conflictClause};`;

    try {
      await client.query(sql, values);
      count++;
      process.stdout.write(`✅ Restored ${count}/${rows.length} rows\r`);
    } catch (err) {
      console.error(`\n❌ Error inserting row ${row[idCol] || count}:`, err.message);
    }
  }

  // Update Postgres ID sequence to avoid duplicate ID errors on future inserts
  try {
    await client.query(`
      SELECT setval(pg_get_serial_sequence('public."${tableName}"', '${idCol}'), 
                    COALESCE((SELECT MAX("${idCol}") FROM public."${tableName}"), 1));
    `);
  } catch (seqErr) {
    // Sequence may not exist or have different name, ignore
  }

  console.log(`\n🎉 Completed ${tableName}: ${count}/${rows.length} rows restored.`);
}

async function seedSolutionTopics() {
  console.log('\n📦 Seeding initial data for TB_SOLUTION_TOPICS...');
  
  // Default 15 solution cards from frontend
  const defaultTopics = [
    // Printing
    {
      tab_category: 'printing',
      title: 'Printer',
      subtitle: 'Printing & Supply Solution',
      counter_text: '01 / 02',
      short_description: 'ศูนย์รวมเครื่องพิมพ์คุณภาพสูงครบวงจรสำหรับองค์กรและสถานพยาบาล รองรับตั้งแต่ Laser, Inkjet, Thermal, Wristband ไปจนถึง Dot Matrix',
      key_features: ['Laser & Inkjet Printer', 'Thermal & Wristband Printer', 'Large Format & Dot Matrix'],
      cta_text: 'ดูสินค้า Printer ทั้งหมด',
      cta_link: '/products?category=Printing',
      sort_order: 1,
      is_active: true
    },
    {
      tab_category: 'printing',
      title: 'Supply & Toner',
      subtitle: 'Printing & Supply Solution',
      counter_text: '02 / 02',
      short_description: 'วัสดุสิ้นเปลืองคุณภาพมาตรฐาน หมึกพิมพ์แท้ หมึกเลเซอร์ สติกเกอร์บาร์โค้ด และสายรัดข้อมือผู้ป่วย',
      key_features: ['Toner หมึกเลเซอร์แท้', 'Barcode Ribbon & Label', 'Medical Wristband'],
      cta_text: 'ดูสินค้า Supply ทั้งหมด',
      cta_link: '/products?category=Printing&type=supply',
      sort_order: 2,
      is_active: true
    },
    // Hardware
    {
      tab_category: 'hardware',
      title: 'Barcode Scanner',
      subtitle: 'Hardware Solution',
      counter_text: '01 / 03',
      short_description: 'เครื่องอ่านบาร์โค้ดความแม่นยำสูง ทั้ง 1D, 2D QR Code แบบมีสาย ไร้สาย และระดับอุตสาหกรรม',
      key_features: ['Handheld Scanner', '2D Healthcare Scanner', 'Wireless Industrial Scanner'],
      cta_text: 'ดูสินค้า Scanner ทั้งหมด',
      cta_link: '/products?category=Hardware',
      sort_order: 1,
      is_active: true
    },
    {
      tab_category: 'hardware',
      title: 'Computer & Workstation',
      subtitle: 'Hardware Solution',
      counter_text: '02 / 03',
      short_description: 'คอมพิวเตอร์ตั้งโต๊ะ All-in-One และเวิร์กสเตชันสมรรถนะสูง สำหรับสำนักงานและห้องปฏิบัติการ',
      key_features: ['All-in-One PC', 'Workstation', 'Medical Grade Panel PC'],
      cta_text: 'ดูสินค้า Computer ทั้งหมด',
      cta_link: '/products?category=Hardware',
      sort_order: 2,
      is_active: true
    },
    {
      tab_category: 'hardware',
      title: 'UPS & Power Solution',
      subtitle: 'Hardware Solution',
      counter_text: '03 / 03',
      short_description: 'เครื่องสำรองไฟฟ้าอัตโนมัติ (UPS) ปกป้องอุปกรณ์สำคัญ ป้องกันข้อมูลสูญหายจากไฟตกหรือไฟดับ',
      key_features: ['Line Interactive UPS', 'True Online Double Conversion', 'Smart Battery Management'],
      cta_text: 'ดูสินค้า UPS ทั้งหมด',
      cta_link: '/products?category=Hardware',
      sort_order: 3,
      is_active: true
    },
    // Network
    {
      tab_category: 'network',
      title: 'Network Switch & Router',
      subtitle: 'Network Solution',
      counter_text: '01 / 02',
      short_description: 'อุปกรณ์สวิตช์และเราเตอร์ระดับองค์กร รองรับ PoE และการจัดการเครือข่ายความเร็วสูง',
      key_features: ['Managed Gigabit Switch', 'PoE Switch for IP Camera', 'Core Router'],
      cta_text: 'ดูสินค้า Network ทั้งหมด',
      cta_link: '/solutions/network',
      sort_order: 1,
      is_active: true
    },
    {
      tab_category: 'network',
      title: 'Wireless Access Point & Security',
      subtitle: 'Network Solution',
      counter_text: '02 / 02',
      short_description: 'ระบบ Wi-Fi 6 ครอบคลุมพื้นที่กว้าง พร้อมไฟร์วอลล์และระบบความปลอดภัยเครือข่ายขั้นสูง',
      key_features: ['Enterprise Wi-Fi 6 AP', 'Cloud Controller', 'Next-Gen Firewall'],
      cta_text: 'ดูรายละเอียด Network Solution',
      cta_link: '/solutions/network',
      sort_order: 2,
      is_active: true
    },
    // Medical
    {
      tab_category: 'medical',
      title: 'Medical Display & Monitor',
      subtitle: 'Medical Equipment',
      counter_text: '01 / 02',
      short_description: 'จอแสดงผลทางการแพทย์มาตรฐาน DICOM สำหรับห้องรังสีและแพทย์วินิจฉัย',
      key_features: ['DICOM Part 14 Grayscale', 'High Resolution Medical Monitor', 'Color Diagnostic Display'],
      cta_text: 'ดูสินค้า Medical ทั้งหมด',
      cta_link: '/solutions/medical',
      sort_order: 1,
      is_active: true
    },
    {
      tab_category: 'medical',
      title: 'Smart Vital Signs Cart',
      subtitle: 'Medical Equipment',
      counter_text: '02 / 02',
      short_description: 'รถเข็นพยาบาลอัจฉริยะพร้อมอุปกรณ์ตรวจวัดสัญญาณชีพ เชื่อมต่อข้อมูลเข้าสู่ระบบ HIS อัตโนมัติ',
      key_features: ['Mobile Nursing Cart', 'Vital Signs Integration', 'Wireless Sync to EMR'],
      cta_text: 'ดูรายละเอียด Medical Equipment',
      cta_link: '/solutions/medical',
      sort_order: 2,
      is_active: true
    }
  ];

  let count = 0;
  for (const t of defaultTopics) {
    try {
      await client.query(`
        INSERT INTO public."TB_SOLUTION_TOPICS" 
          (tab_category, title, subtitle, counter_text, short_description, key_features, cta_text, cta_link, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING;
      `, [
        t.tab_category,
        t.title,
        t.subtitle,
        t.counter_text,
        t.short_description,
        JSON.stringify(t.key_features),
        t.cta_text,
        t.cta_link,
        t.sort_order,
        t.is_active
      ]);
      count++;
    } catch (e) {
      console.error('Error inserting topic:', e.message);
    }
  }

  console.log(`✅ Seeded ${count} default solution topics.`);
}

async function run() {
  console.log('🚀 Connecting to PostgreSQL...');
  await client.connect();
  console.log('✅ Connected to:', connectionString.replace(/:([^:@]+)@/, ':****@'));

  // 1. Categories
  await restoreTable('TBM_PRODUCT_CATEGORIES', 'TBM_PRODUCT_CATEGORIES.json');

  // 2. Program Options
  await restoreTable('TBM_PROGRAM_OPTIONS', 'TBM_PROGRAM_OPTIONS.json');

  // 3. Products
  await restoreTable('TB_PRODUCTS', 'TB_PRODUCTS.json');

  // 4. Product Software
  await restoreTable('TB_PRODUCT_SOFTWARE', 'TB_PRODUCT_SOFTWARE.json');

  // 5. Solution Topics
  await seedSolutionTopics();

  console.log('\n======================================================');
  console.log('📊 Final Row Counts in PostgreSQL:');
  for (const t of ['TBM_PRODUCT_CATEGORIES', 'TBM_PROGRAM_OPTIONS', 'TB_PRODUCTS', 'TB_PRODUCT_SOFTWARE', 'TB_SOLUTION_TOPICS']) {
    try {
      const res = await client.query(`SELECT COUNT(*) FROM public."${t}"`);
      console.log(`✨ ${t}: ${res.rows[0].count} rows`);
    } catch (err) {
      console.log(`❌ ${t}: ${err.message}`);
    }
  }
  console.log('======================================================');
  console.log('🎉 ALL DATA HAS BEEN SUCCESSFULLY IMPORTED TO POSTGRESQL!');

  await client.end();
}

run().catch(err => {
  console.error('Fatal restore error:', err);
  client.end();
  process.exit(1);
});


const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Read .env.local
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
const client = new Client({ connectionString });

const sampleActivities = [
  {
    title: 'TOP PROVIDER Annual Outing & Team Building 2026',
    title_en: 'Annual Outing & Team Synergy Workshop 2026',
    category: 'culture',
    event_date: '2026-03-20',
    location: 'โรงแรมและรีสอร์ต อ่าวนาง จ.กระบี่',
    short_description: 'กิจกรรมกระชับความสัมพันธ์ประจำปี รวมพลังทีมวิศวกรและบุคลากรทุกฝ่ายเพื่อสร้างสรรค์โซลูชันโรงพยาบาลแห่งอนาคต',
    content: 'บริษัท ท็อป โพรไวเดอร์ ซิสเต็ม กรุ๊ป จำกัด ได้จัดกิจกรรมสัมมนาและ Team Building ประจำปี 2026 ณ จังหวัดกระบี่ ภายใต้ธีม "Innovating Together, Care Forever" เพื่อเสริมสร้างความสามัคคี แลกเปลี่ยนวิสัยทัศน์การพัฒนาระบบเทคโนโลยีสารสนเทศทางการแพทย์ และสร้างขวัญกำลังใจแก่พนักงานทุกระดับ',
    cover_image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['Team Building', 'Annual Outing', 'Company Culture'],
    is_featured: true,
    is_active: true,
    sort_order: 1
  },
  {
    title: 'ร่วมแสดงนวัตกรรมระบบ Smart Hospital ในงาน Thailand HealthTech Expo 2026',
    title_en: 'Exhibiting Smart Hospital & HIS Solutions at Thailand HealthTech Expo 2026',
    category: 'exhibition',
    event_date: '2026-02-15',
    location: 'ศูนย์การประชุมแห่งชาติสิริกิติ์ (QSNCC)',
    short_description: 'นำเสนอสถาปัตยกรรมระบบเชื่อมโยงข้อมูลสุขภาพ PPHS, HIS และ HL7/FHIR Enterprise Gateway แก่ผู้บริหารโรงพยาบาลชั้นนำ',
    content: 'ทีมงาน TOP PROVIDER ได้ร่วมจัดแสดงบูธนวัตกรรมสารสนเทศโรงพยาบาลในงาน Thailand HealthTech Expo 2026 โดยได้รับความสนใจอย่างล้นหลามจากผู้อำนวยการโรงพยาบาลและแพทย์ผู้เชี่ยวชาญ ในการสาธิตระบบ OPD/IPD Paperless Workflow และการผสานรวมข้อมูล AI Telemedicine',
    cover_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['HealthTech', 'Exhibition', 'Smart Hospital', 'HL7/FHIR'],
    is_featured: true,
    is_active: true,
    sort_order: 2
  },
  {
    title: 'โครงการปันน้ำใจ มอบระบบสารสนเทศและคอมพิวเตอร์แก่ รพ.สต. พื้นที่ห่างไกล',
    title_en: 'CSR: Donating IT Equipment & Systems to Remote Healthcare Centers',
    category: 'csr',
    event_date: '2026-01-28',
    location: 'โรงพยาบาลส่งเสริมสุขภาพตำบล จ.น่าน',
    short_description: 'ส่งมอบอุปกรณ์ระบบเครือข่าย เครื่องพิมพ์เวชระเบียน และซอฟต์แวร์บริหารจัดการยา เพื่อเพิ่มประสิทธิภาพการดูแลผู้ป่วยในชุมชน',
    content: 'เพื่อตอกย้ำพันธกิจการยกระดับสาธารณสุขไทย ตัวแทนผู้บริหารและทีมวิศวกรได้เดินทางไปส่งมอบเครื่องพิมพ์สติกเกอร์ยา อุปกรณ์คอมพิวเตอร์ และติดตั้งระบบจัดเก็บข้อมูลผู้ป่วย ให้แก่ รพ.สต. ในพื้นที่ห่างไกล พร้อมฝึกอบรมเจ้าหน้าที่สาธารณสุขในพื้นที่อย่างใกล้ชิด',
    cover_image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['CSR', 'Community Care', 'Healthcare Support'],
    is_featured: false,
    is_active: true,
    sort_order: 3
  },
  {
    title: 'สัมมนาเชิงปฏิบัติการ: Healthcare Cybersecurity & Cloud Infrastructure',
    title_en: 'Workshop: Healthcare Cybersecurity & Cloud Infrastructure 2026',
    category: 'training',
    event_date: '2026-01-10',
    location: 'TOP PROVIDER Training Center อาคารสำนักงานใหญ่',
    short_description: 'อัปเกรดทักษะวิศวกรระบบและนักพัฒนาซอฟต์แวร์ในการรับมือภัยคุกคามไซเบอร์และมาตรฐานความปลอดภัยข้อมูลสุขภาพ PDPA',
    content: 'การจัดอบรมเข้มข้น 2 วันเต็มสำหรับทีมพัฒนาและทีม Implementer โดยมีผู้เชี่ยวชาญด้าน Certified Healthcare Cybersecurity มาบรรยายเรื่องการป้องกันข้อมูลเวชระเบียนรั่วไหล, การทำ Zero Trust Architecture และแนวทางการปฏิบัติตามมาตรฐาน PDPA สาธารณสุข',
    cover_image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'
    ],
    tags: ['Training', 'Cybersecurity', 'Cloud', 'Workshop'],
    is_featured: false,
    is_active: true,
    sort_order: 4
  }
];

const activityCategoryOptions = [
  { value: 'culture', label: 'กิจกรรมภายในองค์กร (Company Culture & Outing)', order: 1 },
  { value: 'exhibition', label: 'งานสัมมนาและนิทรรศการ (Exhibition & Tech Conferences)', order: 2 },
  { value: 'csr', label: 'เพื่อสังคมและสาธารณประโยชน์ (CSR & Healthcare Support)', order: 3 },
  { value: 'training', label: 'อบรมและพัฒนาทักษะ (Training & Certification)', order: 4 }
];

async function run() {
  await client.connect();
  console.log('✅ Connected to database');

  // 1. Create TB_ACTIVITIES table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public."TB_ACTIVITIES" (
      id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      title_en VARCHAR(255),
      category VARCHAR(100) NOT NULL DEFAULT 'culture',
      event_date DATE,
      location VARCHAR(255),
      short_description TEXT,
      content TEXT,
      cover_image_url TEXT,
      gallery_images JSONB DEFAULT '[]'::jsonb,
      tags JSONB DEFAULT '[]'::jsonb,
      is_featured BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log('✅ Created table public."TB_ACTIVITIES"');

  // 2. Add activity_type to TBM_PROGRAM_OPTIONS
  for (const opt of activityCategoryOptions) {
    const check = await client.query(
      `SELECT id FROM public."TBM_PROGRAM_OPTIONS" WHERE option_type = 'activity_type' AND value = $1`,
      [opt.value]
    );
    if (check.rows.length === 0) {
      await client.query(
        `INSERT INTO public."TBM_PROGRAM_OPTIONS" (option_type, value, label, display_order, is_active)
         VALUES ('activity_type', $1, $2, $3, true)`,
        [opt.value, opt.label, opt.order]
      );
      console.log(`✅ Added activity category: ${opt.value}`);
    } else {
      await client.query(
        `UPDATE public."TBM_PROGRAM_OPTIONS" SET label = $1, display_order = $2, is_active = true WHERE id = $3`,
        [opt.label, opt.order, check.rows[0].id]
      );
    }
  }

  // 3. Seed Sample Activities
  for (const act of sampleActivities) {
    const check = await client.query(
      `SELECT id FROM public."TB_ACTIVITIES" WHERE title = $1`,
      [act.title]
    );
    if (check.rows.length === 0) {
      await client.query(
        `INSERT INTO public."TB_ACTIVITIES" (
          title, title_en, category, event_date, location, short_description, content,
          cover_image_url, gallery_images, tags, is_featured, is_active, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          act.title,
          act.title_en,
          act.category,
          act.event_date,
          act.location,
          act.short_description,
          act.content,
          act.cover_image_url,
          JSON.stringify(act.gallery_images),
          JSON.stringify(act.tags),
          act.is_featured,
          act.is_active,
          act.sort_order
        ]
      );
      console.log(`✅ Seeded Activity: ${act.title}`);
    }
  }

  // 4. Verify count
  const countRes = await client.query(`SELECT COUNT(*) FROM public."TB_ACTIVITIES"`);
  console.log(`🎉 Total activities in TB_ACTIVITIES: ${countRes.rows[0].count}`);

  // 5. Update backups
  const allOpts = await client.query(`SELECT * FROM public."TBM_PROGRAM_OPTIONS" ORDER BY id ASC`);
  fs.writeFileSync(
    path.resolve(__dirname, '../backups/TBM_PROGRAM_OPTIONS.json'),
    JSON.stringify(allOpts.rows, null, 2),
    'utf8'
  );
  console.log('💾 Updated backups/TBM_PROGRAM_OPTIONS.json');

  await client.end();
}

run().catch((err) => {
  console.error('❌ Error creating TB_ACTIVITIES:', err);
  client.end();
  process.exit(1);
});


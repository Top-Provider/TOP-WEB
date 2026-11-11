const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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

const client = new Client({ connectionString: process.env.DATABASE_URL });

const leadershipTeam = [
  {
    prefix_th: 'นางสาว',
    first_name_th: 'พิมพ์ชนก',
    last_name_th: 'ว.',
    position: 'Co-Founder & Managing Director',
    prefix_en: 'Ms.',
    first_name_en: 'Pimchanok',
    last_name_en: 'V.',
    job_role: 'MD',
    badge: 'Managing Director',
    bio: 'บริหารกลยุทธ์องค์กรและการส่งมอบระบบสารสนเทศโรงพยาบาลระดับ Enterprise ทั่วประเทศ',
    avatar_url: '/images/team_1.jpg',
    department: 'ฝ่ายบริหารระดับสูง (Executive Board)',
    email: 'pimchanok@topprovider.co.th',
    show_on_home: true,
    sort_order: 1,
    is_active: true
  },
  {
    prefix_th: 'นาย',
    first_name_th: 'กิตติพงษ์',
    last_name_th: 'ส.',
    position: 'VP of Hospital Engineering',
    prefix_en: 'Mr.',
    first_name_en: 'Kittipong',
    last_name_en: 'S.',
    job_role: 'VP',
    badge: 'VP Engineering',
    bio: 'ผู้เชี่ยวชาญโครงสร้างพื้นฐานคลาวด์และระบบฐานข้อมูลขนาดใหญ่สำหรับสถานพยาบาล',
    avatar_url: '/images/team_2.jpg',
    department: 'ฝ่ายวิศวกรรมระบบโรงพยาบาล',
    email: 'kittipong@topprovider.co.th',
    show_on_home: true,
    sort_order: 2,
    is_active: true
  },
  {
    prefix_th: 'นาย',
    first_name_th: 'ธนวัฒน์',
    last_name_th: 'ร.',
    position: 'Principal System Architect',
    prefix_en: 'Mr.',
    first_name_en: 'Thanawat',
    last_name_en: 'R.',
    job_role: 'CTO',
    badge: 'Chief Architect',
    bio: 'ออกแบบสถาปัตยกรรมระบบ HIS, มาตรฐาน HL7/FHIR และระบบรักษาความปลอดภัยไซเบอร์',
    avatar_url: '/images/team_3.jpg',
    department: 'ฝ่ายสถาปัตยกรรมและเทคโนโลยีสารสนเทศ',
    email: 'thanawat@topprovider.co.th',
    show_on_home: true,
    sort_order: 3,
    is_active: true
  },
  {
    prefix_th: 'นาย',
    first_name_th: 'ชานนท์',
    last_name_th: 'ก.',
    position: 'Head of Solution & Product',
    prefix_en: 'Mr.',
    first_name_en: 'Chanon',
    last_name_en: 'K.',
    job_role: 'CIO',
    badge: 'Head of Product',
    bio: 'พัฒนานวัตกรรม UX/UI สำหรับบุคลากรทางการแพทย์และโซลูชัน Smart Hospital ครบวงจร',
    avatar_url: '/images/team_4.jpg',
    department: 'ฝ่ายนวัตกรรมและโซลูชันผลิตภัณฑ์',
    email: 'chanon@topprovider.co.th',
    show_on_home: true,
    sort_order: 4,
    is_active: true
  }
];

async function seed() {
  await client.connect();
  console.log('✅ Connected to database');

  for (const m of leadershipTeam) {
    const check = await client.query(
      `SELECT id FROM public."TB_USERS" WHERE first_name_en = $1 AND last_name_en = $2`,
      [m.first_name_en, m.last_name_en]
    );

    if (check.rows.length === 0) {
      await client.query(`
        INSERT INTO public."TB_USERS"
          (prefix_th, first_name_th, last_name_th, position, prefix_en, first_name_en, last_name_en, job_role, badge, bio, avatar_url, department, email, show_on_home, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        m.prefix_th, m.first_name_th, m.last_name_th, m.position,
        m.prefix_en, m.first_name_en, m.last_name_en, m.job_role,
        m.badge, m.bio, m.avatar_url, m.department, m.email,
        m.show_on_home, m.sort_order, m.is_active
      ]);
      console.log(`✅ Inserted: ${m.first_name_en} (${m.job_role})`);
    } else {
      await client.query(`
        UPDATE public."TB_USERS"
        SET job_role = $1, badge = $2, bio = $3, show_on_home = $4, sort_order = $5, avatar_url = $6, position = $7
        WHERE id = $8
      `, [m.job_role, m.badge, m.bio, m.show_on_home, m.sort_order, m.avatar_url, m.position, check.rows[0].id]);
      console.log(`🔄 Updated: ${m.first_name_en} (${m.job_role})`);
    }
  }

  const res = await client.query(
    `SELECT id, first_name_en, job_role, badge, show_on_home, sort_order FROM public."TB_USERS" ORDER BY sort_order ASC`
  );
  console.table(res.rows);

  await client.end();
}

seed().catch(err => {
  console.error(err);
  client.end();
});


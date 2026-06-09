import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf";
const OUTPUT = path.join(process.cwd(), "docs", "talkto-features.pdf");

type Section = {
  title: string;
  items: { name: string; detail: string }[];
};

const sections: Section[] = [
  {
    title: "1. บัญชีผู้ใช้ (Authentication)",
    items: [
      { name: "สมัครสมาชิก", detail: "หน้า /register — กรอกชื่อ, อีเมล, รหัสผ่าน" },
      { name: "เข้าสู่ระบบ", detail: "หน้า /login — ระบบ NextAuth (Credentials)" },
      { name: "ออกจากระบบ", detail: "ปุ่มใน sidebar ล่าง" },
      { name: "บทบาท Admin", detail: "แบ่งเป็น ADMIN และ USER" },
      { name: "ตั้งค่า Admin", detail: "npm run db:promote-admin หรือ ADMIN_EMAILS ใน .env" },
      { name: "เข้า Admin", detail: "หน้า /admin-login แล้ว redirect ไป /admin" },
    ],
  },
  {
    title: "2. โปรไฟล์ผู้ใช้",
    items: [
      { name: "แก้ไขชื่อ", detail: 'ปุ่ม "แก้ไขโปรไฟล์" ใน sidebar' },
      { name: "อัปโหลด Avatar", detail: "อัปโหลดไป Cloudinary (JPEG/PNG/WebP ไม่เกิน 2MB)" },
      { name: "ลบรูปโปรไฟล์", detail: "ลบ avatar ได้ใน dialog" },
      { name: "แสดง Avatar", detail: "sidebar, รายการแชท DM, หัวห้องแชท, ข้อความในห้องสนทนา" },
    ],
  },
  {
    title: "3. แชท — ห้องกลุ่ม (GROUP)",
    items: [
      { name: "สร้างห้องกลุ่ม", detail: 'แท็บ "กลุ่ม" → สร้างห้องกลุ่ม + ตั้งชื่อ' },
      { name: "รายการห้อง", detail: "Sidebar แสดงชื่อ, จำนวนสมาชิก, ข้อความล่าสุด, unread" },
      { name: "ส่งข้อความ", detail: "พิมพ์ + Enter หรือกดปุ่มส่ง" },
      { name: "ส่งรูปภาพ", detail: "อัปโหลด Cloudinary สูงสุด 5MB + caption ได้" },
      { name: "แสดงจำนวนสมาชิก", detail: "ที่ header ห้องและรายการ sidebar" },
      { name: "เชิญเข้ากลุ่ม", detail: 'ปุ่ม "เชิญเข้ากลุ่ม" → ค้นหาชื่อ/อีเมล → ส่งคำเชิญในแชทส่วนตัว' },
      { name: "รับคำเชิญ", detail: 'การ์ดในแชท DM → กด "เข้าร่วมกลุ่ม"' },
      { name: "ออกจากกลุ่ม", detail: 'ปุ่ม "ออกจากกลุ่ม" พร้อมยืนยันก่อนออก' },
    ],
  },
  {
    title: "4. แชท — ส่วนตัว (DM)",
    items: [
      { name: "เริ่มแชทใหม่", detail: 'แท็บ "ส่วนตัว" → ค้นหาผู้ใช้ → เริ่มแชท' },
      { name: "สถานะออนไลน์", detail: "แสดงออนไลน์/ออฟไลน์ที่หัวแชท" },
      { name: "เชิญแชทส่วนตัว", detail: "สร้างลิงก์เชิญ (หมดอายุ 7 วัน)" },
      { name: "รับลิงก์เชิญ DM", detail: "หน้า /invite/dm/[token]" },
    ],
  },
  {
    title: "5. ข้อความและ Real-time",
    items: [
      { name: "Push ทันที", detail: "Socket.io push ไป user room — ข้อความแสดงทันที" },
      { name: "Optimistic UI", detail: "ข้อความแสดงก่อน API ตอบกลับ" },
      { name: "Sidebar อัปเดต", detail: "ข้อความล่าสุด, unread, ย้ายขึ้นบนสุดแบบ real-time" },
      { name: "Typing indicator", detail: "แสดงเมื่ออีกฝั่งกำลังพิมพ์" },
      { name: "อ่านแล้ว (Read)", detail: "Mark read อัตโนมัติเมื่อเปิดห้อง" },
      { name: "Unread badge", detail: "นับข้อความที่ยังไม่อ่าน" },
      { name: "Reconnect", detail: "Auto-reconnect + โหลดข้อความที่พลาด" },
    ],
  },
  {
    title: "6. UI / ธีม",
    items: [
      { name: "ธีม GoingWealth", detail: "Primary สีดำ, Secondary สีทอง, card radius 16px" },
      { name: "โลโก้", detail: "talktologo.png ที่หัว sidebar" },
      { name: "Favicon", detail: "favicon.png" },
      { name: "Responsive", detail: "มือถือมี drawer sidebar" },
      { name: "Light/Dark", detail: "สลับธีมได้ (ThemeRegistry)" },
    ],
  },
  {
    title: "7. Admin Dashboard (/admin)",
    items: [
      { name: "Dashboard", detail: "สถิติผู้ใช้, แชท, กราฟ" },
      { name: "จัดการผู้ใช้", detail: "/admin/users — ดูรายชื่อ, เปลี่ยน role, ลบ" },
      { name: "API Docs", detail: "/admin/docs — OpenAPI / Swagger" },
      { name: "สิทธิ์เข้าถึง", detail: "เฉพาะ role ADMIN" },
    ],
  },
];

const apiGroups: { title: string; lines: string[] }[] = [
  {
    title: "Authentication & Profile",
    lines: [
      "POST /api/register — สมัครสมาชิก",
      "POST /api/auth/[...nextauth] — เข้าสู่ระบบ",
      "GET/PATCH /api/users/me — ดู/แก้ไขโปรไฟล์",
      "GET /api/users/search — ค้นหาผู้ใช้",
    ],
  },
  {
    title: "Upload",
    lines: [
      "POST /api/uploads/image — อัปโหลดรูปในแชท",
      "POST /api/uploads/avatar — อัปโหลดรูปโปรไฟล์",
    ],
  },
  {
    title: "Conversations",
    lines: [
      "GET/POST /api/conversations — รายการ/สร้างห้องกลุ่ม",
      "GET /api/conversations/[id] — รายละเอียดห้อง",
      "GET/POST /api/conversations/[id]/messages — ข้อความ",
      "POST /api/conversations/[id]/read — mark as read",
      "POST /api/conversations/[id]/leave — ออกจากกลุ่ม",
      "POST /api/conversations/[id]/invites/user — เชิญเข้ากลุ่ม",
    ],
  },
  {
    title: "DM & Invites",
    lines: [
      "POST /api/dm — เริ่มแชทส่วนตัว",
      "GET /api/invites/[token] — ดูคำเชิญ",
      "POST /api/invites/[token]/accept — ยอมรับคำเชิญ",
    ],
  },
  {
    title: "Admin & Health",
    lines: [
      "GET /api/admin/stats — สถิติ",
      "GET/PATCH/DELETE /api/admin/users — จัดการผู้ใช้",
      "GET /api/health — ตรวจสอบสถานะระบบ",
    ],
  },
];

const socketEvents = {
  client: [
    "conversation:join / leave — เข้า/ออกห้องแชท",
    "message:send — ส่งข้อความ",
    "typing:start / stop — สถานะกำลังพิมพ์",
    "presence:subscribe — ติดตามสถานะออนไลน์",
  ],
  server: [
    "message:new — ข้อความใหม่",
    "conversation:updated — อัปเดตรายการแชท / จำนวนสมาชิก",
    "typing:update — อัปเดตสถานะพิมพ์",
    "presence:update / sync — สถานะออนไลน์",
  ],
};

const techStack = [
  ["Frontend", "Next.js 16, React 19, MUI v9"],
  ["Backend", "Custom server.ts + Socket.io"],
  ["Database", "Prisma + SQLite (dev)"],
  ["Authentication", "NextAuth (JWT session)"],
  ["รูปภาพ", "Cloudinary"],
  ["Real-time", "Socket.io (user room push)"],
];

const envVars = [
  ["DATABASE_URL", "SQLite หรือ PostgreSQL"],
  ["NEXTAUTH_SECRET", "Secret สำหรับ session"],
  ["NEXTAUTH_URL", "URL ของแอป เช่น http://localhost:3010"],
  ["CLOUDINARY_*", "ตั้งค่าสำหรับอัปโหลดรูปภาพ"],
  ["ADMIN_EMAILS", "(optional) อีเมลที่ได้สิทธิ์ Admin"],
  ["PORT", "พอร์ต server (default 3010)"],
];

function ensureSpace(doc: PDFKit.PDFDocument, height: number) {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function writeTitle(doc: PDFKit.PDFDocument, text: string) {
  ensureSpace(doc, 40);
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor("#000000").text(text, { underline: true });
  doc.moveDown(0.4);
}

function writeTable(doc: PDFKit.PDFDocument, items: { name: string; detail: string }[]) {
  doc.fontSize(10).fillColor("#333333");
  for (const item of items) {
    ensureSpace(doc, 36);
    doc.font("Thai-Bold").text(item.name, { continued: true });
    doc.font("Thai").text(` — ${item.detail}`);
    doc.moveDown(0.15);
  }
}

function writeBulletList(doc: PDFKit.PDFDocument, lines: string[]) {
  doc.fontSize(10).fillColor("#333333").font("Thai");
  for (const line of lines) {
    ensureSpace(doc, 20);
    doc.text(`• ${line}`, { indent: 12 });
    doc.moveDown(0.1);
  }
}

function writeKeyValueTable(
  doc: PDFKit.PDFDocument,
  rows: string[][],
) {
  doc.fontSize(10);
  for (const [key, value] of rows) {
    ensureSpace(doc, 24);
    doc.font("Thai-Bold").fillColor("#000000").text(key, { continued: true, width: 140 });
    doc.font("Thai").fillColor("#333333").text(` : ${value}`);
    doc.moveDown(0.1);
  }
}

function generate() {
  if (!fs.existsSync(FONT_PATH)) {
    throw new Error(`Font not found: ${FONT_PATH}`);
  }

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 56, bottom: 56, left: 56, right: 56 },
    info: {
      Title: "Talkto — เอกสารสรุปฟังก์ชัน",
      Author: "Talkto",
      Subject: "Feature documentation",
    },
  });

  const stream = fs.createWriteStream(OUTPUT);
  doc.pipe(stream);

  doc.registerFont("Thai", FONT_PATH);
  doc.registerFont("Thai-Bold", FONT_PATH);

  // Cover
  doc.font("Thai-Bold").fontSize(26).fillColor("#000000")
    .text("Talkto", { align: "center" });
  doc.moveDown(0.3);
  doc.font("Thai").fontSize(16).fillColor("#333333")
    .text("เอกสารสรุปฟังก์ชัน", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#666666")
    .text("แอปพลิเคชันแชทกลุ่มและแชทส่วนตัว", { align: "center" });
  doc.text("Next.js · Socket.io · Prisma · Cloudinary", { align: "center" });
  doc.moveDown(0.3);
  doc.text(`จัดทำเมื่อ 8 มิถุนายน 2026`, { align: "center" });

  doc.addPage();
  doc.font("Thai").fontSize(11).fillColor("#333333")
    .text(
      "เอกสารฉบับนี้สรุปฟังก์ชันทั้งหมดของระบบ Talkto ครอบคลุมการใช้งานสำหรับผู้ใช้ทั่วไป ผู้ดูแลระบบ API และการตั้งค่าเทคนิค",
      { align: "justify" },
    );

  for (const section of sections) {
    writeTitle(doc, section.title);
    writeTable(doc, section.items);
  }

  writeTitle(doc, "8. API หลัก (REST)");
  for (const group of apiGroups) {
    ensureSpace(doc, 30);
    doc.font("Thai-Bold").fontSize(11).fillColor("#000000").text(group.title);
    doc.moveDown(0.2);
    writeBulletList(doc, group.lines);
    doc.moveDown(0.3);
  }

  writeTitle(doc, "9. Socket.io Events");
  doc.font("Thai-Bold").fontSize(11).text("Client → Server");
  doc.moveDown(0.2);
  writeBulletList(doc, socketEvents.client);
  doc.moveDown(0.3);
  doc.font("Thai-Bold").fontSize(11).text("Server → Client");
  doc.moveDown(0.2);
  writeBulletList(doc, socketEvents.server);

  writeTitle(doc, "10. โครงสร้างเทคนิค");
  writeKeyValueTable(doc, techStack);

  writeTitle(doc, "11. คำสั่งที่ใช้บ่อย");
  writeBulletList(doc, [
    "npm run dev — รัน dev server (port 3010)",
    "npm run build — build production",
    "npm run db:push — sync database schema",
    "npm run db:promote-admin -- email@example.com",
  ]);

  writeTitle(doc, "12. การตั้งค่า Environment (.env)");
  writeKeyValueTable(doc, envVars);

  doc.moveDown(1);
  doc.fontSize(9).fillColor("#888888").text(
    "— สิ้นสุดเอกสาร —",
    { align: "center" },
  );

  doc.end();

  stream.on("finish", () => {
    console.log(`PDF created: ${OUTPUT}`);
  });
}

generate();

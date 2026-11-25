# Honey House

เว็บไซต์ตัวอย่างร้านน้ำผึ้งธรรมชาติ สร้างด้วย HTML, CSS และ JavaScript แบบ Static พร้อม Google Apps Script สำหรับบันทึกคำสั่งซื้อใน Google Sheets

## สินค้าตัวอย่าง
- HH-001 น้ำผึ้งดอกลำไย 250 กรัม — 159 บาท — สต็อกเริ่มต้น 50
- HH-002 น้ำผึ้งป่า 500 กรัม — 279 บาท — สต็อกเริ่มต้น 35

## โครงสร้างไฟล์
- \`index.html\`, \`styles.css\`, \`app.js\` — หน้าร้านและตะกร้าสินค้า
- \`config.js\` — URL Google Apps Script และ LINE
- \`admin.html\`, \`admin.js\` — หน้าจัดการออเดอร์ ใบหยิบสินค้า และใบจ่าหน้าพัสดุ
- \`google-apps-script/Code.gs\` — API สำหรับ Google Sheets
- \`vercel.json\` — ตั้งค่า Vercel

## ตั้งค่า Google Sheets
1. เปิด Google Sheet ที่ต้องการใช้
2. ไปที่ **Extensions > Apps Script**
3. วางเนื้อหาจาก \`google-apps-script/Code.gs\` ลงในไฟล์ Code.gs
4. ใน Apps Script เปิด **Project Settings > Script Properties** แล้วเพิ่ม `ADMIN_TOKEN` ด้วยค่ารหัสลับที่คาดเดายาก
5. เลือกฟังก์ชัน \`setupSheets\` แล้วกด Run เพื่อสร้างชีต Products และ Orders
6. กด **Deploy > New deployment > Web app** เลือก Execute as: Me และ Who has access: Anyone แล้ว Deploy
7. คัดลอก URL ที่ลงท้ายด้วย \`/exec\` แล้วใส่ใน \`config.js\` ที่ค่า \`API_URL\`
8. ใส่ LINE Official Account URL จริงใน \`config.js\` ที่ค่า \`LINE_URL\`

## Deploy ผ่าน Vercel
1. Import repository นี้จาก GitHub ใน Vercel
2. เลือก Framework Preset: **Other**
3. Build Command เว้นว่าง และ Output Directory ใช้ \`.\`
4. กด Deploy

## ใช้งานหลังติดตั้ง
- ลูกค้าเลือกสินค้า เพิ่มลงตะกร้า และกรอกชื่อ เบอร์โทร ที่อยู่จัดส่ง
- เมื่อเชื่อม Apps Script แล้ว ระบบจะบันทึกออเดอร์ลงชีต Orders และตัดสต็อกในชีต Products
- เปิด \`/admin.html\` เพื่อโหลดออเดอร์ด้วย URL และ ADMIN_TOKEN
- เปลี่ยนสถานะออเดอร์ และพิมพ์ใบหยิบสินค้า/ใบจ่าหน้าพัสดุได้

## ข้อควรทราบก่อนใช้งานจริง
- โปรเจกต์นี้เป็นต้นแบบ ยังไม่มีระบบชำระเงินออนไลน์ การเชื่อมผู้ให้บริการขนส่ง บาร์โค้ด เลขพัสดุ หรือ tracking
- ใบจ่าหน้าพัสดุเป็นแบบทั่วไป ไม่ใช่ใบปะหน้ามาตรฐานของบริษัทขนส่ง
- หน้า Admin แบบ Static เหมาะสำหรับทดลองเท่านั้น การเก็บ token ในเบราว์เซอร์ไม่ใช่ระบบยืนยันตัวตนระดับ production ควรย้ายการเรียก API ผ่าน backend ที่มี authentication และจำกัดสิทธิ์
- ทดสอบด้วยคำสั่งซื้อจำลองก่อนเปิดรับออเดอร์จริง และตรวจสอบการตั้งค่าสิทธิ์ Google Apps Script/ข้อมูลส่วนบุคคล
- หาก Apps Script ตอบกลับไม่สำเร็จจากข้อจำกัด cross-origin หรือ redirect ควรเพิ่ม Vercel Function เป็น backend proxy ก่อนใช้งานจริง

## License
โปรเจกต์ตัวอย่างสำหรับนำไปปรับใช้และศึกษา
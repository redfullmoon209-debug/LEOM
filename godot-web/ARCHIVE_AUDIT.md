# ตรวจไฟล์แนบ — 5 พฤศจิกายน 2026

ไฟล์ที่แนบจริงชื่อ `เกม(1).zip` (ผู้ใช้เรียกว่า เกม.zip)


แตกไฟล์ทั้งหมดแล้ว: 5,244 entries = 4,802 files + 442 directories, ขนาดรวมเมื่อแตก 499,205,884 bytes. รายการไฟล์ละเอียดเก็บไว้เฉพาะในพื้นที่ทำงาน ไม่เผยแพร่ metadata ของไฟล์แนบ

## เอนจินและโครงสร้าง
- เป็นโครงสร้าง Android APK ที่แตกแล้ว: AndroidManifest.xml (binary), resources.arsc, classes*.dex จำนวน 9 ไฟล์ และ native `.so` จำนวน 19 ไฟล์สำหรับ arm64-v8a/armeabi-v7a
- `lib/arm64-v8a/libguangyv.so` พบ exported symbols `cocos_android_app_init`, `cocos2d::Application`, `cocos2d::Director`, `cocos2d::GLViewImpl`, `cocos2d::experimental::AudioEngine`: ยืนยันส่วนรันไทม์ **Cocos2d-x** แต่ยังระบุเวอร์ชันและการปรับแต่งของผู้ผลิตไม่ได้
- `assets/Script0`, `ScriptU*`, `ScriptS*` และ ResourceC*/ResourceE เป็นข้อมูลไบนารี ไม่ใช่ซอร์ส GDScript/C++ ที่แก้แล้ว build ได้
- ไม่พบ project.godot, Godot scene, source project ของเอนจิน หรือ build configuration ที่ใช้สร้างเกมเดิม
- มี C2S.proto และ S2C.proto (schema สำหรับ client/server), SDK/แพ็กเกจย่อยและข้อมูลตั้งค่าของแอป ข้อมูลเหล่านี้ไม่ใช่ซอร์สเกมหรือเซิร์ฟเวอร์พร้อมใช้

## ทรัพยากร
นับจากนามสกุลทั้ง archive: PNG 515, JPG 4, MP3 62, XML 671, JSON 5, proto 2, SO 19, DEX 9, ไม่มีนามสกุล 3,499; ที่เหลือเป็นทรัพยากร Android/SDK และแพ็กเกจย่อย

ตรวจ header ทุกไฟล์ใน GameAssets: 2,592 มีหัว `EncAss` (บ่งชี้รูปแบบห่อ/เข้ารหัสของผู้ผลิต), 532 มีหัว ZIP, 204 มีหัว `FxPro`, 62 มีหัว `FZ!` ชนิดหนึ่ง และมีเสียง/ฟอนต์/ข้อมูลรูปแบบอื่น การมีหัว ZIP ไม่เท่ากับมี source project. ไม่ได้อ้างว่าถอดรหัสหรือ reverse engineer สำเร็จ

## สิทธิ์และการตัดสินใจ
ไม่พบ license ที่ยืนยันการนำภาพ เสียง และไบนารีเกมไปเผยแพร่สาธารณะ จึง **ไม่ใช้และไม่อัปโหลดทรัพยากรต้นฉบับใด ๆ**. ไม่รัน APK, native binaries หรือ SDK ที่แนบ. หากต้องการใช้ภาพ/เสียงเดิม ต้องมีหลักฐานสิทธิ์และไฟล์รูปแบบที่อ่านได้ก่อน

ทางเลือกที่ทำได้: เขียน Lumen Vale ใหม่ใน Godot 4 ด้วย GDScript และภาพจาก draw primitives. ไม่อ้างว่าคง gameplay/หน้าตาของเกมต้นฉบับหรือแปลง Cocos2d-x อัตโนมัติ. ไฟล์แนบใช้เป็นหลักฐานสำหรับรายงานความเข้ากันได้เท่านั้น

## การตรวจสอบ
Local: แตกและตรวจรายการ/headers สำเร็จ. เครื่อง local ไม่มี Godot และดาวน์โหลดจาก GitHub/downloads.godotengine.org หมดเวลา จึงย้ายการตรวจ import/runtime/export ไป GitHub Actions. สถานะทดสอบจริงดูจาก workflow run และ artifact ที่ระบุใน README; การมี workflow ไม่ได้หมายความว่าทดสอบผ่าน

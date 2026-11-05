/* =========================================================================
   items-data.js
   ข้อมูลอุปกรณ์ทั้งหมด + คำตอบที่ถูกต้องของแต่ละระดับ BSL
   ---------------------------------------------------------------------
   วิธีเพิ่ม/แก้ไขอุปกรณ์:
     1. เพิ่มไอเทมใหม่ในอาเรย์ ITEMS ด้านล่าง (คัดลอกรูปแบบของไอเทมเดิม)
     2. ถ้าไอเทมนั้นเป็นคำตอบที่ถูกต้องของ BSL ระดับใด ให้ไปเพิ่มใน REQUIRED
     3. ใส่ไฟล์รูป .png ชื่อเดียวกับ id ไว้ในโฟลเดอร์ images/
        (ไม่ต้องแก้ index.html หรือ game.js เลย)
   ========================================================================= */

/* ---------- ลำดับ "สล็อต" บนร่างกาย พร้อมลำดับการซ้อนภาพ (z-index) ---------- */
/* zIndex ยิ่งมาก = อยู่ชั้นบนสุด (ทับไอเทมที่ zIndex น้อยกว่า) */
const SLOT_ORDER = [
  { id: "inner_body", label: "ลำตัวชั้นใน", zIndex: 10 },
  { id: "legs", label: "ขา", zIndex: 15 },
  { id: "outer_body", label: "ลำตัวชั้นนอก", zIndex: 20 },
  { id: "gloves1", label: "มือ (ชั้นที่ 1)", zIndex: 25 },
  { id: "gloves2", label: "มือ (ชั้นที่ 2)", zIndex: 26 },
  { id: "feet", label: "เท้า", zIndex: 30 },
  { id: "shoe_cover", label: "ผ้าคลุมรองเท้า", zIndex: 31 },
  { id: "eyewear", label: "ตา", zIndex: 40 },
  { id: "mask", label: "หน้ากาก", zIndex: 41 },
  { id: "hair", label: "ผม", zIndex: 50 },
];

/* สล็อตที่ "ต้องมีของเสมอ" ทุกระดับ (correct answer ไม่เคยเป็นค่าว่าง) */
const ALWAYS_REQUIRED_SLOTS = [
  "hair", "eyewear", "inner_body", "outer_body", "gloves1", "legs", "feet",
];

/* สล็อตที่ "อาจจะต้องมีหรือไม่ต้องมี" แล้วแต่ระดับ BSL */
const OPTIONAL_SLOTS = ["mask", "gloves2", "shoe_cover"];

/* ---------- อุปกรณ์ทั้งหมด ---------- */
/*
  category: "wearable" = สวมใส่บนร่างกายตามสล็อต
            "carry"    = ของพกติดตัว (วางในกล่อง 2 ช่องด้านล่างตัวละคร)
  correctFor: อาเรย์ของระดับ BSL ที่ไอเทมนี้ "ถูกต้อง" (เช่น [1,2] แปลว่าถูกทั้ง BSL-1 และ BSL-2)
  alwaysWrong: true = ไอเทมที่ผิดหลักความปลอดภัยเสมอ ไม่ว่าระดับใด (ใช้กับของพกติดตัว
               เป็นหลัก เพราะสล็อตสวมใส่ตัดสินจาก correctFor พอแล้ว)
  layerZIndex: (ไม่บังคับ) ใช้เมื่อไอเทมชิ้นนี้ต้องอยู่ "ทับ" ชิ้นอื่นเป็นกรณีพิเศษ
               ต่างจากลำดับปกติของสล็อตนั้น เช่น ชุด Tyvek ที่มีฮู้ดคลุมหัว ต้องอยู่ทับ
               หมวก/หน้ากาก/แว่นตา ทั้งที่ปกติ "ลำตัวชั้นนอก" จะอยู่ต่ำกว่าสามอย่างนี้
               ถ้าไม่ใส่ค่านี้ จะใช้ลำดับปกติของสล็อตตาม SLOT_ORDER ด้านบน
*/
const ITEMS = [
  // ---- ผม ----
  { id: "hair_tied", nameTH: "มัดเก็บผม", nameEN: "Tied-back Hair", slot: "hair", category: "wearable", correctFor: [1, 2], alwaysWrong: false },
  { id: "hair_cover", nameTH: "หมวกคลุมผม", nameEN: "Hair Cover / Bonnet", slot: "hair", category: "wearable", correctFor: [3], alwaysWrong: false },

  // ---- หน้ากาก ----
  { id: "mask_surgical", nameTH: "หน้ากากอนามัย", nameEN: "Surgical Mask", slot: "mask", category: "wearable", correctFor: [2], alwaysWrong: false },
  { id: "mask_n95", nameTH: "หน้ากาก N95", nameEN: "N95 Respirator", slot: "mask", category: "wearable", correctFor: [3], alwaysWrong: false },

  // ---- ตา ----
  { id: "eyewear_safety_glasses", nameTH: "แว่นตานิรภัย", nameEN: "Safety Glasses", slot: "eyewear", category: "wearable", correctFor: [1, 2, 3], alwaysWrong: false },

  // ---- ลำตัวชั้นใน ----
  { id: "inner_regular_clothes", nameTH: "เสื้อผ้าปกติ", nameEN: "Regular Clothes", slot: "inner_body", category: "wearable", correctFor: [1, 2], alwaysWrong: false },
  { id: "inner_scrubs", nameTH: "ชุดสครับ", nameEN: "Scrubs", slot: "inner_body", category: "wearable", correctFor: [3], alwaysWrong: false, linkedSlot: "legs" },
  { id: "inner_sleeveless", nameTH: "เสื้อแขนกุด", nameEN: "Sleeveless Top", slot: "inner_body", category: "wearable", correctFor: [], alwaysWrong: true },

  // ---- ลำตัวชั้นนอก ----
  { id: "outer_labcoat_front", nameTH: "เสื้อกาวน์กระดุมหน้า", nameEN: "Front-button Lab Coat", slot: "outer_body", category: "wearable", correctFor: [1], alwaysWrong: false },
  { id: "outer_labcoat_backtie", nameTH: "เสื้อกาวน์ผูกหลัง", nameEN: "Back-tie Lab Coat", slot: "outer_body", category: "wearable", correctFor: [2], alwaysWrong: false },
  { id: "outer_tyvek_suit", nameTH: "ชุด Tyvek", nameEN: "Tyvek Suit", slot: "outer_body", category: "wearable", correctFor: [3], alwaysWrong: false, layerZIndex: 60 },

  // ---- มือ ----
  { id: "gloves_layer1", nameTH: "ถุงมือ", nameEN: "Gloves", slot: "gloves1", category: "wearable", correctFor: [1, 2, 3], alwaysWrong: false },
  { id: "gloves_layer2", nameTH: "ถุงมือชั้นสอง", nameEN: "Double Gloves (Layer 2)", slot: "gloves2", category: "wearable", correctFor: [2, 3], alwaysWrong: false },

  // ---- ขา ----
  { id: "pants_long", nameTH: "กางเกงขายาว", nameEN: "Long Pants", slot: "legs", category: "wearable", correctFor: [1, 2, 3], alwaysWrong: false },
  { id: "pants_short", nameTH: "กางเกงขาสั้น", nameEN: "Shorts", slot: "legs", category: "wearable", correctFor: [], alwaysWrong: true },

  // ---- เท้า ----
  { id: "shoes_closed_toe", nameTH: "รองเท้าหุ้มส้น", nameEN: "Closed-toe Shoes", slot: "feet", category: "wearable", correctFor: [1, 2, 3], alwaysWrong: false },
  { id: "shoes_sandals", nameTH: "รองเท้าแตะ", nameEN: "Sandals", slot: "feet", category: "wearable", correctFor: [], alwaysWrong: true },

  // ---- ผ้าคลุมรองเท้า ----
  { id: "shoe_cover", nameTH: "ผ้าคลุมรองเท้า", nameEN: "Shoe Cover", slot: "shoe_cover", category: "wearable", correctFor: [3], alwaysWrong: false },

  // ---- ของพกติดตัว (carry items) ----
  { id: "item_food", nameTH: "อาหาร", nameEN: "Food (Snack)", slot: "carry", category: "carry", correctFor: [], alwaysWrong: true },
  { id: "item_beverage", nameTH: "เครื่องดื่ม", nameEN: "Beverage / Coffee Cup", slot: "carry", category: "carry", correctFor: [], alwaysWrong: true },
  { id: "item_surgery_knift", nameTH: "มีดผ่าตัด", nameEN: "Surgical Knife", slot: "carry", category: "carry", correctFor: [], alwaysWrong: true },
  { id: "item_testtube", nameTH: "หลอดทดลอง", nameEN: "Test Tube", slot: "carry", category: "carry", correctFor: [], alwaysWrong: true },
  { id: "item_water", nameTH: "น้ำดื่ม", nameEN: "Drinking Water", slot: "carry", category: "carry", correctFor: [], alwaysWrong: true },
  { id: "item_phone", nameTH: "มือถือ", nameEN: "Mobile Phone", slot: "carry", category: "carry", correctFor: [1], alwaysWrong: false },

  { id: "item_notebook", nameTH: "สมุด", nameEN: "Notebook", slot: "carry", category: "carry", correctFor: [1], alwaysWrong: false },
  { id: "item_pencil", nameTH: "ดินสอ", nameEN: "Pencil", slot: "carry", category: "carry", correctFor: [1], alwaysWrong: false },
];

/* ---------- คำตอบที่ถูกต้องของแต่ละระดับ (slot -> itemId) ---------- */
/* ถ้าสล็อตไหนไม่ถูกระบุไว้ในระดับใด แปลว่าระดับนั้น "ไม่บังคับ" ต้องปล่อยว่างไว้ */
const REQUIRED = {
  1: {
    hair: "hair_tied",
    eyewear: "eyewear_safety_glasses",
    inner_body: "inner_regular_clothes",
    outer_body: "outer_labcoat_front",
    gloves1: "gloves_layer1",
    legs: "pants_long",
    feet: "shoes_closed_toe",
  },
  2: {
    hair: "hair_tied",
    mask: "mask_surgical",
    eyewear: "eyewear_safety_glasses",
    inner_body: "inner_regular_clothes",
    outer_body: "outer_labcoat_backtie",
    gloves1: "gloves_layer1",
    gloves2: "gloves_layer2",
    legs: "pants_long",
    feet: "shoes_closed_toe",
  },
  3: {
    hair: "hair_cover",
    mask: "mask_n95",
    eyewear: "eyewear_safety_glasses",
    inner_body: "inner_scrubs",
    outer_body: "outer_tyvek_suit",
    gloves1: "gloves_layer1",
    gloves2: "gloves_layer2",
    legs: "inner_scrubs",
    feet: "shoes_closed_toe",
    shoe_cover: "shoe_cover",
  },
};

/* ---------- จัดวางไอเทมทั้งหมดลงแผงเดียว (ปรับลำดับได้อิสระ ไม่กระทบ logic) ---------- */
const PANEL_ITEMS = [
  "item_food", "item_beverage", "item_water", "item_surgery_knift", "item_testtube", "item_phone",
  "item_notebook", "item_pencil",
  "gloves_layer1", "gloves_layer2", "eyewear_safety_glasses",
  "mask_surgical", "mask_n95",
  "pants_long", "pants_short",
  "inner_regular_clothes", "inner_scrubs", "inner_sleeveless",
  "hair_tied", "hair_cover",
  "shoes_closed_toe", "shoes_sandals", "shoe_cover",
  "outer_labcoat_front", "outer_labcoat_backtie", "outer_tyvek_suit",
];

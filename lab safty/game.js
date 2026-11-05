/* =========================================================================
   game.js — Lab Dress-Up Game logic
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------- ข้อความ UI สองภาษา (ไทย/อังกฤษ) ---------------- */
  const I18N = {
    login_title: { th: "เกมแต่งกายเข้าห้องปฏิบัติการ", en: "Laboratory Dress-Up Game" },
    login_subtitle: { th: "กรอกข้อมูลก่อนเริ่มทำกิจกรรม", en: "Enter your details before starting" },
    label_name: { th: "ชื่อ-นามสกุล", en: "Full Name" },
    label_id: { th: "รหัสนิสิต", en: "Student ID" },
    login_error: { th: "กรุณากรอกชื่อ-นามสกุล และรหัสนิสิตให้ครบ", en: "Please fill in both your name and student ID" },
    btn_start: { th: "เริ่มทำกิจกรรม", en: "Start" },
    carry_label: { th: "ของพกติดตัว", en: "Carry Items" },
    carry_empty_hint: { th: "วางของที่นี่", en: "Place item here" },
    equipped_empty_hint: {
      th: "ยังไม่ได้สวมชิ้นส่วนใด — ลากอุปกรณ์มาวางที่ตัวละครด้านบน",
      en: "Nothing equipped yet — drag items onto the character above",
    },
    btn_check: { th: "ตรวจสอบการแต่งกาย", en: "Check Outfit" },
    btn_close: { th: "ปิด / แก้ไขต่อ", en: "Close / Keep Editing" },
    btn_download: { th: "ดาวน์โหลดภาพ (JPG)", en: "Download Image (JPG)" },
    remove_prefix: { th: "ถอดออก ×", en: "Remove ×" },
    student_id_label: { th: "รหัสนิสิต", en: "Student ID" },
    msg_ok: { th: "แต่งกายเหมาะสม", en: "Outfit is appropriate" },
    msg_wrong: {
      th: "แต่งกายไม่เหมาะสม (มีการเลือกเครื่องแต่งกายผิด)",
      en: "Not appropriate (incorrect item selected)",
    },
    msg_missing: {
      th: "แต่งกายไม่เหมาะสม (ยังแต่งกายไม่ครบ)",
      en: "Not appropriate (outfit incomplete)",
    },
    msg_extra: {
      th: "แต่งกายไม่เหมาะสม (มีการแต่งกายเกินความจำเป็น)",
      en: "Not appropriate (unnecessary extra items)",
    },
  };

  /* ---------------- state ---------------- */
  const state = {
    studentName: "",
    studentId: "",
    bsl: 1,
    lang: "th",
    /* equipped[slotId] = itemId | null */
    equipped: {},
    carry: { carry_1: null, carry_2: null },
  };

  SLOT_ORDER.forEach((s) => (state.equipped[s.id] = null));

  const itemById = (id) => ITEMS.find((it) => it.id === id) || null;
  const t = (key) => (I18N[key] ? I18N[key][state.lang] : key);
  const itemName = (item) => (state.lang === "en" ? item.nameEN : item.nameTH);

  /* ---------------- DOM refs ---------------- */
  const screenLogin = document.getElementById("screen-login");
  const screenGame = document.getElementById("screen-game");
  const loginForm = document.getElementById("login-form");
  const loginName = document.getElementById("input-name");
  const loginId = document.getElementById("input-id");
  const loginError = document.getElementById("login-error");
  const studentTag = document.getElementById("student-tag");
  const bslTabs = document.querySelectorAll(".bsl-tab");
  const langBtns = document.querySelectorAll(".lang-btn");
  const panelItemsEl = document.getElementById("panel-items");
  const characterStage = document.getElementById("character-stage");
  const equippedListEl = document.getElementById("equipped-list");
  const carryBox1 = document.getElementById("carry-box-1");
  const carryBox2 = document.getElementById("carry-box-2");
  const btnCheck = document.getElementById("btn-check");
  const modalOverlay = document.getElementById("modal-overlay");
  const resultMessages = document.getElementById("result-messages");
  const resultStudentName = document.getElementById("result-student-name");
  const resultStudentMeta = document.getElementById("result-student-meta");
  const resultCharacter = document.getElementById("result-character");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnDownload = document.getElementById("btn-download");

  /* ---------------- login ---------------- */
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = loginName.value.trim();
    const id = loginId.value.trim();
    if (!name || !id) {
      loginError.textContent = t("login_error");
      return;
    }
    state.studentName = name;
    state.studentId = id;
    studentTag.textContent = `${name} · ${id}`;
    screenLogin.classList.remove("active");
    screenGame.classList.add("active");
  });

  /* ---------------- BSL tabs ---------------- */
  bslTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      bslTabs.forEach((tb) => tb.classList.remove("selected"));
      tab.classList.add("selected");
      state.bsl = parseInt(tab.dataset.bsl, 10);
    });
  });

  /* ---------------- ปุ่มสลับภาษา ---------------- */
  function applyStaticI18n() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
  }

  function setLanguage(lang) {
    state.lang = lang;
    langBtns.forEach((b) => b.classList.toggle("selected", b.dataset.lang === lang));
    applyStaticI18n();
    // ต้องเรนเดอร์ใหม่ทุกจุดที่มีชื่อไอเทม/ข้อความไดนามิกฝังอยู่
    safeRun("renderPanels", renderPanels);
    safeRun("renderEquippedList", renderEquippedList);
    safeRun("renderCarryBoxes", renderCarryBoxes);
  }

  langBtns.forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  /* ---------------- build item card ---------------- */
  function buildItemVisual(item) {
    const wrap = document.createElement("div");
    wrap.className = "item-visual";
    const img = document.createElement("img");
    // ลำดับการลองโหลดรูป: 1) ไอคอนแยกสำหรับแผง (ถ้าวาดไว้)  2) รูปเดียวกับที่ติดบนตัวละคร  3) ข้อความสำรอง
    img.src = `images/${item.id}_icon.png`;
    img.alt = item.nameEN;
    img.draggable = false;
    let triedMainImage = false;
    img.addEventListener("error", () => {
      if (!triedMainImage) {
        triedMainImage = true;
        img.src = `images/${item.id}.png`;
        return;
      }
      img.classList.add("img-error");
      wrap.classList.add("img-missing");
    });
    const fallback = document.createElement("div");
    fallback.className = "placeholder-fallback";
    fallback.textContent = itemName(item);
    wrap.appendChild(img);
    wrap.appendChild(fallback);
    return wrap;
  }

  function buildItemCard(item) {
    const card = document.createElement("div");
    card.className = "item-card";
    card.dataset.itemId = item.id;
    card.appendChild(buildItemVisual(item));
    const nameEl = document.createElement("div");
    nameEl.className = "item-name";
    nameEl.textContent = itemName(item);
    card.appendChild(nameEl);
    attachDragHandlers(card, item);
    return card;
  }

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function renderPanels() {
    panelItemsEl.innerHTML = "";
    shuffleArray(PANEL_ITEMS).forEach((id) => {
      const item = itemById(id);
      if (item) panelItemsEl.appendChild(buildItemCard(item));
    });
    refreshPanelCardStates();
  }

  function refreshPanelCardStates() {
    document.querySelectorAll(".item-card").forEach((card) => {
      const id = card.dataset.itemId;
      const item = itemById(id);
      let isPlaced = false;
      if (item.category === "wearable") {
        isPlaced = state.equipped[item.slot] === id;
      } else {
        isPlaced = state.carry.carry_1 === id || state.carry.carry_2 === id;
      }
      card.classList.toggle("placed", isPlaced);
    });
  }

  /* ---------------- panel scroll buttons ---------------- */
  document.querySelectorAll(".panel-scroll-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const el = document.getElementById(targetId);
      const amount = 100;
      el.scrollTop += btn.dataset.dir === "up" ? -amount : amount;
    });
  });

  /* ---------------- character layer rendering ---------------- */
  function renderCharacter(targetStage) {
    targetStage.innerHTML = "";

    // ชั้นล่างสุด: ตัวละครฐาน (เดิมไม่เคยถูกวาดเลย เป็นสาเหตุที่ตัวคนไม่ขึ้น)
    const baseHolder = document.createElement("div");
    baseHolder.className = "equipped-slot base-layer";
    baseHolder.style.zIndex = 0;
    const baseImg = document.createElement("img");
    baseImg.className = "layer";
    baseImg.src = "images/base_character.png";
    baseImg.alt = "Base Character";
    baseImg.addEventListener("error", () => {
      baseImg.style.display = "none"; // ยังไม่มีรูป -> ซ่อนเงียบๆ ไม่โชว์ตัวหนังสือทับตัวละครอีกต่อไป
    });
    baseHolder.appendChild(baseImg);
    targetStage.appendChild(baseHolder);

    SLOT_ORDER.forEach((slotDef) => {
      const itemId = state.equipped[slotDef.id];
      if (!itemId) return;
      const item = itemById(itemId);
      // ไอเทมแบบ "สล็อตคู่" (เช่น ชุดสครับที่มีเสื้อ+กางเกงในภาพเดียว) ให้วาดแค่ครั้งเดียวที่สล็อตหลักของมัน
      if (item.slot !== slotDef.id) return;
      const holder = document.createElement("div");
      holder.className = "equipped-slot";
      holder.style.zIndex = item.layerZIndex ?? slotDef.zIndex;
      holder.dataset.slot = slotDef.id;

      const img = document.createElement("img");
      img.className = "layer";
      img.src = `images/${item.id}.png`;
      img.alt = item.nameEN;
      img.addEventListener("error", () => {
        img.style.display = "none"; // ยังไม่มีรูป -> ซ่อนเงียบๆ (ดูชื่อได้จากแถบ "รายการที่สวมใส่แล้ว" แทน)
      });

      holder.appendChild(img);
      targetStage.appendChild(holder);
    });
  }

  /* ---------------- equipped items list (แถบถอดชิ้นส่วน ไม่ซ้อนทับกัน) ---------------- */
  function renderEquippedList() {
    equippedListEl.innerHTML = "";
    // แสดงแค่ครั้งเดียวต่อไอเทม แม้ไอเทมนั้นจะครองหลายสล็อตพร้อมกัน (เช่น ชุดสครับ)
    const wornSlots = SLOT_ORDER.filter((s) => {
      const itemId = state.equipped[s.id];
      if (!itemId) return false;
      const item = itemById(itemId);
      return item.slot === s.id; // นับเฉพาะสล็อตหลักของไอเทม ไม่นับสล็อตที่ถูกลิงก์มา
    });

    if (wornSlots.length === 0) {
      const hint = document.createElement("div");
      hint.className = "equipped-list-hint";
      hint.textContent = t("equipped_empty_hint");
      equippedListEl.appendChild(hint);
      return;
    }

    wornSlots.forEach((slotDef) => {
      const item = itemById(state.equipped[slotDef.id]);
      const chip = document.createElement("div");
      chip.className = "equipped-chip";

      const thumb = buildItemVisual(item);
      thumb.classList.add("equipped-chip-thumb");
      chip.appendChild(thumb);

      const label = document.createElement("span");
      label.className = "equipped-chip-label";
      label.textContent = itemName(item);
      chip.appendChild(label);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "equipped-chip-remove";
      removeBtn.setAttribute("aria-label", `${t("remove_prefix")} ${itemName(item)}`);
      removeBtn.textContent = t("remove_prefix");
      removeBtn.addEventListener("click", () => {
        state.equipped[slotDef.id] = null;
        if (item.linkedSlot) state.equipped[item.linkedSlot] = null;
        renderCharacter(characterStage);
        renderEquippedList();
        refreshPanelCardStates();
      });
      chip.appendChild(removeBtn);

      equippedListEl.appendChild(chip);
    });
  }

  /* ---------------- carry boxes rendering ---------------- */
  function renderCarryBoxes() {
    [["carry_1", carryBox1], ["carry_2", carryBox2]].forEach(([key, box]) => {
      box.innerHTML = "";
      const itemId = state.carry[key];
      if (!itemId) {
        const hint = document.createElement("div");
        hint.className = "empty-hint";
        hint.textContent = t("carry_empty_hint");
        box.appendChild(hint);
        return;
      }
      const item = itemById(itemId);
      const visual = buildItemVisual(item);
      box.appendChild(visual);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-badge";
      removeBtn.setAttribute("aria-label", `${t("remove_prefix")} ${itemName(item)}`);
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.carry[key] = null;
        renderCarryBoxes();
        refreshPanelCardStates();
      });
      box.appendChild(removeBtn);

      box.onclick = () => {
        state.carry[key] = null;
        renderCarryBoxes();
        refreshPanelCardStates();
      };
    });
  }

  /* ---------------- pointer-based drag & drop (works for mouse + touch) ---------------- */
  let dragGhost = null;
  let draggingItem = null;
  let draggingCard = null;

  function attachDragHandlers(card, item) {
    card.addEventListener("pointerdown", (e) => {
      if (card.classList.contains("placed")) return;
      e.preventDefault();
      draggingItem = item;
      draggingCard = card;
      card.classList.add("dragging");

      dragGhost = document.createElement("div");
      dragGhost.className = "drag-ghost";
      dragGhost.appendChild(buildItemVisual(item));
      document.body.appendChild(dragGhost);
      moveGhost(e.clientX, e.clientY);

      // ใช้ pointer capture เพื่อให้ยังได้รับ event ต่อเนื่องแม้นิ้วเลื่อนออกนอกการ์ด
      try {
        card.setPointerCapture(e.pointerId);
      } catch (err) {
        /* บาง browser ไม่รองรับ ไม่เป็นไร ใช้ window listener ต่อได้ */
      }

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerFinish);
      window.addEventListener("pointercancel", onPointerCancel);
    });
  }

  function moveGhost(x, y) {
    if (!dragGhost) return;
    dragGhost.style.left = `${x - 35}px`;
    dragGhost.style.top = `${y - 35}px`;
  }

  function onPointerMove(e) {
    moveGhost(e.clientX, e.clientY);
    highlightDropTargets(e.clientX, e.clientY);
  }

  function highlightDropTargets(x, y) {
    characterStage.classList.remove("drop-hover");
    carryBox1.classList.remove("drop-hover");
    carryBox2.classList.remove("drop-hover");
    if (!draggingItem) return;
    const el = document.elementFromPoint(x, y);
    if (!el) return;
    if (characterStage.contains(el) && draggingItem.category === "wearable") {
      characterStage.classList.add("drop-hover");
    } else if (carryBox1.contains(el) && draggingItem.category === "carry") {
      carryBox1.classList.add("drop-hover");
    } else if (carryBox2.contains(el) && draggingItem.category === "carry") {
      carryBox2.classList.add("drop-hover");
    }
  }

  // เรียกทุกครั้งไม่ว่าการลากจะจบแบบวางสำเร็จ (pointerup) หรือถูกยกเลิกกลางคัน (pointercancel)
  function cleanupDrag() {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerFinish);
    window.removeEventListener("pointercancel", onPointerCancel);
    characterStage.classList.remove("drop-hover");
    carryBox1.classList.remove("drop-hover");
    carryBox2.classList.remove("drop-hover");
    if (dragGhost) {
      dragGhost.remove();
      dragGhost = null;
    }
    if (draggingCard) draggingCard.classList.remove("dragging");
    draggingItem = null;
    draggingCard = null;
    refreshPanelCardStates();
  }

  // ยกเลิกกลางคัน (เช่น browser แย่ง gesture ไปทำอย่างอื่นระหว่างลากบนมือถือ) -> แค่เคลียร์ ไม่วางไอเทม
  function onPointerCancel() {
    cleanupDrag();
  }

  function onPointerFinish(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && draggingItem) {
      if (draggingItem.category === "wearable" && characterStage.contains(el)) {
        state.equipped[draggingItem.slot] = draggingItem.id;
        if (draggingItem.linkedSlot) state.equipped[draggingItem.linkedSlot] = draggingItem.id;
        renderCharacter(characterStage);
        renderEquippedList();
      } else if (draggingItem.category === "carry") {
        if (carryBox1.contains(el)) {
          placeInCarrySlot("carry_1", draggingItem.id);
        } else if (carryBox2.contains(el)) {
          placeInCarrySlot("carry_2", draggingItem.id);
        } else if (characterStage.contains(el)) {
          // ลากของพกติดตัวมาวางที่ตัวละครโดยตรง -> ใส่ในช่องว่างช่องแรก
          const target = !state.carry.carry_1 ? "carry_1" : (!state.carry.carry_2 ? "carry_2" : null);
          if (target) placeInCarrySlot(target, draggingItem.id);
        }
        renderCarryBoxes();
      }
    }
    cleanupDrag();
  }

  function placeInCarrySlot(key, itemId) {
    // ถ้าไอเทมนี้อยู่ในอีกช่องอยู่แล้ว ให้ย้ายแทนการซ้ำ
    if (state.carry.carry_1 === itemId) state.carry.carry_1 = null;
    if (state.carry.carry_2 === itemId) state.carry.carry_2 = null;
    state.carry[key] = itemId;
  }

  /* ---------------- checking logic ---------------- */
  function checkOutfit() {
    const bsl = state.bsl;
    const missing = [];
    const wrong = [];
    const extra = [];

    SLOT_ORDER.forEach((slotDef) => {
      const slotId = slotDef.id;
      const requiredItemId = (REQUIRED[bsl] || {})[slotId] || null;
      const currentItemId = state.equipped[slotId];

      if (requiredItemId) {
        if (!currentItemId) {
          missing.push(slotId);
        } else if (currentItemId !== requiredItemId) {
          wrong.push(slotId);
        }
      } else {
        if (currentItemId) extra.push(slotId);
      }
    });

    ["carry_1", "carry_2"].forEach((key) => {
      const itemId = state.carry[key];
      if (!itemId) return;
      const item = itemById(itemId);
      if (item.alwaysWrong) {
        wrong.push(key);
      } else if (item.correctFor.includes(bsl)) {
        extra.push(key);
      } else {
        wrong.push(key);
      }
    });

    return { missing, wrong, extra };
  }

  function buildResultMessages(result) {
    const messages = [];
    if (result.wrong.length === 0 && result.missing.length === 0 && result.extra.length === 0) {
      messages.push({ ok: true, text: t("msg_ok") });
      return messages;
    }
    if (result.wrong.length > 0) {
      messages.push({ ok: false, text: t("msg_wrong") });
    }
    if (result.missing.length > 0) {
      messages.push({ ok: false, text: t("msg_missing") });
    }
    if (result.extra.length > 0) {
      messages.push({ ok: false, text: t("msg_extra") });
    }
    return messages;
  }

  /* ---------------- modal / result ---------------- */
  btnCheck.addEventListener("click", () => {
    const result = checkOutfit();
    const messages = buildResultMessages(result);

    resultStudentName.textContent = state.studentName;
    resultStudentMeta.textContent = `${t("student_id_label")} ${state.studentId} · BSL-${state.bsl}`;

    resultMessages.innerHTML = "";
    messages.forEach((m) => {
      const div = document.createElement("div");
      div.className = `result-msg ${m.ok ? "ok" : "bad"}`;
      div.textContent = `${m.ok ? "✅" : "⚠️"} ${m.text}`;
      resultMessages.appendChild(div);
    });

    resultCharacter.innerHTML = "";
    renderCharacter(resultCharacter);

    modalOverlay.classList.add("active");
  });

  btnCloseModal.addEventListener("click", () => {
    modalOverlay.classList.remove("active");
  });

  btnDownload.addEventListener("click", () => {
    const target = document.getElementById("result-capture");
    html2canvas(target, { backgroundColor: "#ffffff", scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      const safeId = state.studentId.replace(/[^a-zA-Z0-9_-]/g, "");
      link.download = `${safeId || "student"}_BSL${state.bsl}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.92);
      link.click();
    });
  });

  /* ---------------- init ---------------- */
  function safeRun(label, fn) {
    try {
      fn();
    } catch (err) {
      console.error(`[lab-dressup-game] ${label} failed:`, err);
    }
  }

  safeRun("applyStaticI18n", applyStaticI18n);
  safeRun("renderPanels", renderPanels);
  safeRun("renderCharacter", () => renderCharacter(characterStage));
  safeRun("renderEquippedList", renderEquippedList);
  safeRun("renderCarryBoxes", renderCarryBoxes);
})();

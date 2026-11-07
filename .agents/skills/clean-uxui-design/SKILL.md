---
name: clean-uxui-design
description: >-
  Standards and procedures for modern, clean UI/UX design in the application.
  Enforces strictly no emojis, minimal and necessary icon usage via vector SVG,
  clean Thai typography, food-first visuals, and clutter-free responsive layouts.
---

# Clean UI/UX Design Guidelines

This skill defines the visual design and UX standards for SUT Canteen Express. Use these guidelines whenever creating or modifying UI components, screens, modals, or user-facing cards.

---

## 1. Strictly No Emojis (ห้ามใช้อีโมจิใน UI)

- **Do NOT use Unicode emojis** (e.g., 🔥, ⚡, 🍚, 🍜, 🥤, 🍰, 💳, 🛒, 📍, ⏱) in buttons, chips, titles, badges, or dialogs.
- **Why**: Emojis render inconsistently across different operating systems (iOS vs Android vs Web), breaking visual alignment and creating a cluttered, unprofessional appearance.
- **Rule**:
  - Replace with vector icons from `src/components/common/Icon.js` where a suitable icon exists.
  - If no suitable vector icon exists, use **clean Thai text only** without any icons or emojis.

---

## 2. Minimalist Icon Usage (ใช้ไอคอนเท่าที่จำเป็น)

- **Vector Icons Only**: Always import and use `<Icon name="..." />` from `src/components/common/Icon.js`.
- **Purpose-driven**: Icons should only be used when they provide immediate cognitive value (e.g., `search`, `clock`, `store`, `plus`, `close`, `flame`, `zap`, `wallet`).
- **No decorative clutter**: If an icon does not add functional clarity, omit it.
- **Category Chips Standard**:
  - `ทั้งหมด` -> Text only
  - `แนะนำ` -> Vector icon `flame` + text
  - `พร้อมหยิบ` -> Vector icon `zap` + text
  - Specific food categories (e.g. `ข้าว/ตามสั่ง`, `ก๋วยเตี๋ยว`, `เครื่องดื่ม`, `ของหวาน`) -> **Pure clean text, no icon**.

---

## 3. Food-First Visual Hierarchy (เน้นภาพอาหารชัดเจน)

- **Image Thumbnails**: Food cards must always display a clear, rounded thumbnail (88×88px or 96×96px, `borderRadius: 14`).
- **Smart Fallback**: Always use `getFoodImageFallback(thaiName || name)` from `src/utils/imageUtils.js` when the merchant has not uploaded a photo.
- **Overlay Badges**:
  - `แนะนำ` (Popular): Top-left badge with primary orange background and `<Icon name="flame" size={9} color="#FFFFFF" variant="filled" />`.
  - `พร้อมหยิบ` (Grab & Go): Bottom-left badge with emerald green background (`#10B981`) and `<Icon name="zap" size={9} color="#FFFFFF" variant="filled" />`.

---

## 4. Text & Description Hygiene (ลดความรกของตัวหนังสือ)

- **Strip Raw Meta Comments**: Food descriptions frequently contain embedded system tags. Always sanitize them:
  ```javascript
  import { parseMenuDescription } from '../../services/dbService';
  const parsed = parseMenuDescription(menu.description || menu.desc, menu.thaiName || menu.name);
  const cleanDesc = parsed.desc; // Strips <!--OPTIONS:...--> and <!--GRAB_AND_GO:...-->
  ```
- **Limit Description Length**: Always use `numberOfLines={1}` for descriptions in list cards, or omit the description field if it is empty.
- **Prominent Price & Action**:
  - Price: Bold, high contrast (e.g. 16-17px, `COLORS.primary`).
  - Action Button: Compact rounded pill button (e.g. `+ สั่ง` with 12px font) rather than large heavy blocks.

---

## 5. Direct & Frictionless Interaction (UX Flow)

- **Order from Search**: Allow users to configure toppings (`FoodItemModal`) and schedule arrival (`ClassSyncModal`) directly from the search/browse view without forcing unnecessary tab switches.
- **Instant Feedback**: Clearly display stall open/closed status. If closed, disable the action button and display a subtle `ร้านปิด` indicator.
- **Safe Padding**: Always provide sufficient bottom scroll padding (`height: 90` to `100`) to prevent content from being blocked by the bottom navigation bar.

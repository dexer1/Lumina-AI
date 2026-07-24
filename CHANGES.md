# Зміни у вкладці генерації відео

- Додано стилі для налаштувань відео на бічній панелі (Video Settings UI):
  - Стилізовано картку вибору моделі відео (`.video-select-card`, `.video-model-icon`).
  - Додано стилі для секції стилів відео (`.video-style-cards`, `.video-style-card`, `.vs-icon`, `.circles-icon`).
  - Налаштовано кнопки вибору тривалості та якості відео (`.video-row-buttons`, `.duration-buttons`, `.quality-buttons`).
  - Оновлено сітку розмірів відео (`.video-dims`) та додано кнопку `Auto` (`.auto-btn`).
  - Додано кнопку очищення всіх стилів (`.clear-all`).

- Додано стилі для відображення результатів відео (Video Results UI):
  - Стилізовано загальну секцію результатів та дати генерації (`.video-results-section`, `.video-results-date`).
  - Додано оформлення для блоку з промптом (`.video-prompt-block`, `.video-prompt-text`, `.video-prompt-actions`).
  - Стилізовано кнопки дій з відео (Iterate, меню "...", оцінки результату) та теги (`.vp-btn`, `.iterate-btn`, `.dots-btn`, `.vp-tags`, `.vp-tag`, `.how-was-it`).
  - Додано стилі для сітки згенерованих відео (`.video-generated-grid`).
  - Додано заглушку для відео, що порушує правила безпеки (`.video-card-explicit`).

Всі стилі додано до файлу `GeneratorStudio.css` відповідно до наданого макета.

# Зміни у вкладці генерації 3D

- Додано логіку маршрутизації в `gen.jsx`, щоб клік на "3D" перекидав на потрібну вкладку в `GeneratorStudio.jsx`.
- Додано стани для 3D налаштувань (Mesh Type, Mesh Quality, Material).
- Зверстано бічну панель налаштувань для 3D-моделі (Mesh Type: Triangle/Quad, Mesh Quality: 2k-500k, Material: PBR/Shaded/All).
- Оновлено верхній блок із промптом для вкладки 3D (додано банер з підказкою та посиланням на Blueprint).
- Додано стилі для відображення результатів 3D-генерацій (розмітка із 4 заглушок та панеллю деталей з правого боку).
- Усі нові стилі прописано в `GeneratorStudio.css`.

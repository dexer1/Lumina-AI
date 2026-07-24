# Lumina AI — генератор зображень

Lumina AI — вебзастосунок для створення зображень за текстовим описом через Gemini API. Ви можете налаштувати формат і кількість результатів, імпортувати список промптів, завантажувати готові зображення та редагувати їх у вбудованому Canvas-редакторі.

## Швидкий старт

### 1. Встановіть необхідні програми

Для запуску потрібні:

- [Git](https://git-scm.com/downloads);
- [Node.js](https://nodejs.org/) версії 18 або новішої (npm установлюється разом із Node.js).

Перевірити встановлення можна командами:

```bash
git --version
node --version
npm --version
```

### 2. Завантажте проєкт

```bash
git clone https://github.com/dexer1/Lumina-AI.git
cd Lumina-AI
```

### 3. Встановіть залежності

```bash
npm install
```

### 4. Додайте Gemini API-ключ

1. Створіть ключ у [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Скопіюйте файл `.env.example` у новий файл `.env.local`.
3. Замініть шаблонне значення на свій ключ:

```env
GEMINI_API_KEY=ваш_API_ключ
```

Не публікуйте API-ключ і не додавайте `.env.local` до Git. Цей файл уже виключений у `.gitignore`.

### 5. Налаштуйте Lumina AI Assistant

AI-чат працює через серверний endpoint, тому секретний ключ не потрапляє у браузер. У `.env.local` виберіть один із трьох режимів.

OpenAI-compatible API — підходить для OpenAI, OpenRouter, Groq, DeepSeek, Mistral, xAI, Together та локальних серверів із сумісним endpoint:

```env
AI_PROVIDER=openai-compatible
AI_API_KEY=ваш_API_ключ
AI_MODEL=gpt-5-mini
AI_BASE_URL=https://api.openai.com/v1
```

Google Gemini:

```env
AI_PROVIDER=gemini
AI_API_KEY=ваш_Gemini_API_ключ
AI_MODEL=gemini-2.5-flash
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

Anthropic Claude:

```env
AI_PROVIDER=anthropic
AI_API_KEY=ваш_Anthropic_API_ключ
AI_MODEL=claude-sonnet-4-5
AI_BASE_URL=https://api.anthropic.com/v1
```

Для OpenRouter або іншого сумісного сервісу достатньо змінити `AI_BASE_URL` і `AI_MODEL` на значення провайдера. Якщо `AI_PROVIDER` не задано, але в проєкті вже є тільки `GEMINI_API_KEY`, асистент автоматично використає Gemini.

На Netlify ці самі змінні потрібно додати у **Site configuration → Environment variables**. `.env` і `.env.local` ніколи не комітьте.

### 6. Запустіть застосунок

```bash
npm run dev
```

Відкрийте адресу, яку покаже термінал — зазвичай це [http://localhost:5173](http://localhost:5173). Щоб зупинити сервер, натисніть `Ctrl + C`.

## Як створити зображення

1. Відкрийте Lumina AI у браузері.
2. Натисніть **Generate** або виберіть **Image** у бічному меню.
3. Опишіть бажане зображення у полі промпту.
4. Виберіть модель, формат, роздільну здатність і кількість варіантів.
5. Запустіть генерацію та дочекайтеся результату.
6. Завантажте зображення або відкрийте його у Canvas-редакторі.

Також можна імпортувати промпти з файлів `.txt` і `.docx` для пакетної генерації.

## Основні можливості

- генерація зображень через моделі Gemini/Nano Banana;
- кілька промптів і варіантів за один запуск;
- імпорт промптів із `.txt` та `.docx`;
- вибір формату й роздільної здатності;
- завантаження готових результатів;
- базове редагування у Canvas;
- AI-асистент із підтримкою кількох провайдерів і збереженням історії діалогу;
- адаптивний інтерфейс для комп’ютерів і мобільних пристроїв.

## Production-збірка

Створити оптимізовану версію застосунку:

```bash
npm run build
```

Готові файли з’являться в папці `dist`. Перевірити збірку локально:

```bash
npm run preview
```

## Типові проблеми

### PowerShell не дозволяє запустити npm

Якщо Windows показує помилку про заборону виконання `npm.ps1`, використовуйте:

```powershell
npm.cmd install
npm.cmd run dev
```

### Генерація не працює

Перевірте, що:

- файл називається саме `.env.local` і лежить у корені проєкту;
- змінна має назву `GEMINI_API_KEY`;
- після зміни ключа сервер було перезапущено;
- ключ активний і має доступ до Gemini API;
- пристрій підключений до інтернету.

### AI Assistant не відповідає

Перевірте `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` і `AI_BASE_URL`, після чого перезапустіть dev-сервер. Якщо Windows/Node.js показує `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, запустіть Vite із системним сховищем сертифікатів:

```powershell
node --use-system-ca node_modules/vite/bin/vite.js
```

## Технології

React, Vite, Netlify Functions, Lucide React, CSS, OpenAI-compatible API, Gemini API і Anthropic Messages API.

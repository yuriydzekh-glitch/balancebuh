# balancebuh.lviv.ua

Сайт бухгалтерських послуг для ФОП.

## Файли
- `index.html` — головна сторінка сайту
- `robots.txt` — інструкції для пошукових роботів
- `sitemap.xml` — карта сайту для Google Search Console

## Деплой на Netlify
1. Зареєструйтесь на netlify.com (можна через GitHub-акаунт)
2. New site from Git → оберіть цей репозиторій
3. Build command: залишити порожнім, Publish directory: `/` (корінь)
4. Deploy — сайт з'явиться на тимчасовій адресі *.netlify.app
5. Site settings → Domain management → додати `balancebuh.lviv.ua`

## Форма заявки
Форма в index.html вже налаштована під Netlify Forms — після підключення репозиторію до Netlify вона запрацює автоматично, заявки з'являться в розділі Forms на дашборді Netlify.

## Google Ads / Analytics
У `<head>` файлу index.html є закоментований блок gtag.js — розкоментуйте і вставте свій ID (AW-XXXXXXX), коли зареєструєте акаунт в Google Ads.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/submit" && request.method === "POST") {
      return handleSubmit(request, env);
    }

    // Все інше — віддаємо як звичайний статичний файл (index.html, robots.txt, sitemap.xml тощо)
    return env.ASSETS.fetch(request);
  },
};

const GOOGLE_SHEET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbxkWExZ_BUpd4y6riy2s_kDrElu8o4GctS2I9rK8WIabk0o70Iosw4iAKDOtaga9D4z/exec";

async function handleSubmit(request, env) {
  try {
    const formData = await request.formData();

    const name = (formData.get("name") || "не вказано").toString();
    const contact = (formData.get("contact") || "не вказано").toString();
    const message = (formData.get("message") || "").toString();

    // Надсилаємо в Telegram і в Google Таблицю паралельно.
    // allSettled — щоб навіть якщо один сервіс відповість помилкою,
    // це не зупинило другий.
    const [tgResult, sheetResult] = await Promise.allSettled([
      sendToTelegram(env, name, contact, message),
      sendToGoogleSheet(name, contact, message),
    ]);

    const tgOk = tgResult.status === "fulfilled" && tgResult.value.ok;
    const sheetOk = sheetResult.status === "fulfilled" && sheetResult.value.ok;

    // Заявку вважаємо успішною, якщо спрацював хоча б один канал —
    // так користувач не побачить помилку через збій другорядного сервісу.
    if (!tgOk && !sheetOk) {
      const tgError =
        tgResult.status === "rejected"
          ? tgResult.reason.message
          : tgResult.value.error;
      const sheetError =
        sheetResult.status === "rejected"
          ? sheetResult.reason.message
          : sheetResult.value.error;

      return new Response(
        JSON.stringify({
          ok: false,
          error: `Telegram: ${tgError}; Sheet: ${sheetError}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function sendToTelegram(env, name, contact, message) {
  const text =
    `📩 Нова заявка з сайту balancebuh.lviv.ua\n\n` +
    `👤 Ім'я: ${name}\n` +
    `📞 Контакт: ${contact}\n` +
    (message ? `💬 Про бізнес: ${message}\n` : "");

  const tgResponse = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: text,
      }),
    }
  );

  if (!tgResponse.ok) {
    const errText = await tgResponse.text();
    return { ok: false, error: errText };
  }

  return { ok: true };
}

async function sendToGoogleSheet(name, contact, message) {
  const params = new URLSearchParams();
  params.set("name", name);
  params.set("contact", contact);
  params.set("message", message);

  const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    redirect: "follow",
  });

  if (!response.ok) {
    const errText = await response.text();
    return { ok: false, error: errText };
  }

  return { ok: true };
}

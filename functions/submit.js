export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const formData = await request.formData();

    const name = (formData.get("name") || "не вказано").toString();
    const contact = (formData.get("contact") || "не вказано").toString();
    const message = (formData.get("message") || "").toString();

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
      return new Response(JSON.stringify({ ok: false, error: errText }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
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

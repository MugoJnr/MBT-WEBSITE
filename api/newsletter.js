module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const email = String(body?.email || "")
    .trim()
    .toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID || 0);

  if (!apiKey || !listId) {
    return res.status(500).json({ error: "Newsletter not configured" });
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
        attributes: {
          SOURCE: "mugobyte.com",
        },
      }),
    });

    if (response.ok || response.status === 204) {
      return res.status(200).json({ ok: true });
    }

    const data = await response.json().catch(() => ({}));
    const message = String(data.message || data.error || "");

    // Already subscribed — treat as success
    if (
      response.status === 400 &&
      /already|duplicate|exist/i.test(message)
    ) {
      return res.status(200).json({ ok: true, existing: true });
    }

    return res
      .status(response.status)
      .json({ error: message || "Subscribe failed" });
  } catch (err) {
    return res.status(500).json({ error: "Newsletter service unavailable" });
  }
};

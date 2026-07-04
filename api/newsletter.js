const BREVO_HEADERS = (apiKey) => ({
  "api-key": apiKey,
  "Content-Type": "application/json",
  Accept: "application/json",
});

async function sendWelcomeEmail(apiKey, email) {
  const templateId = Number(process.env.BREVO_WELCOME_TEMPLATE_ID || 1);
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || "admin@mugobyte.com";
  const senderName =
    process.env.BREVO_SENDER_NAME || "MugoByte Technologies";

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email }],
    subject: "Welcome to Mugobyte Technologies",
    tags: ["welcome", "newsletter"],
    htmlContent: `
      <div style="font-family:Arial,sans-serif;background:#0a0f1a;color:#e8eef7;padding:32px">
        <div style="max-width:560px;margin:0 auto;background:#111827;border-radius:16px;padding:28px;border:1px solid #1f2937">
          <p style="color:#00d4ff;letter-spacing:2px;font-size:12px;text-transform:uppercase">Mugobyte Technologies</p>
          <h1 style="color:#fff;font-size:24px;margin:8px 0 16px">Welcome to MBT</h1>
          <p style="color:#cbd5e1;line-height:1.6">Thanks for subscribing. You will get news on new MBT products and updates.</p>
          <p style="margin:24px 0"><a href="https://www.mugobyte.com" style="background:#00d4ff;color:#041018;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">Visit mugobyte.com</a></p>
          <p style="font-size:13px"><a href="https://www.instagram.com/mugobyte/" style="color:#00d4ff">Follow us on Instagram</a></p>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">MUGOBYTE TECHNOLOGIES (MBT) &middot; admin@mugobyte.com</p>
        </div>
      </div>
    `,
  };

  // Prefer template when available
  const withTemplate = {
    templateId,
    to: [{ email }],
    sender: { name: senderName, email: senderEmail },
    tags: ["welcome", "newsletter"],
  };

  let response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: BREVO_HEADERS(apiKey),
    body: JSON.stringify(withTemplate),
  });

  if (response.ok || response.status === 201) {
    return { sent: true };
  }

  response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: BREVO_HEADERS(apiKey),
    body: JSON.stringify(payload),
  });

  if (!(response.ok || response.status === 201)) {
    const err = await response.json().catch(() => ({}));
    console.error("welcome email failed", response.status, err);
    return { sent: false, error: err };
  }

  return { sent: true };
}

async function notifyAdmin(apiKey, subscriberEmail, existing) {
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || "admin@mugobyte.com";
  const senderName =
    process.env.BREVO_SENDER_NAME || "MugoByte Technologies";
  const adminEmail =
    process.env.BREVO_ADMIN_EMAIL || "admin@mugobyte.com";

  const when = new Date().toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
  });
  const status = existing ? "already on the list (resubscribed)" : "new subscriber";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: BREVO_HEADERS(apiKey),
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: adminEmail }],
      subject: `New MBT newsletter signup: ${subscriberEmail}`,
      tags: ["newsletter-admin-alert"],
      htmlContent: `
        <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;padding:16px">
          <h2 style="margin:0 0 12px">Newsletter signup</h2>
          <p style="margin:0 0 8px"><strong>Email:</strong> ${subscriberEmail}</p>
          <p style="margin:0 0 8px"><strong>Status:</strong> ${status}</p>
          <p style="margin:0 0 8px"><strong>Time:</strong> ${when} (EAT)</p>
          <p style="margin:16px 0 0;color:#555;font-size:13px">
            View list:
            <a href="https://app.brevo.com/contact/list-listing/id/5">MBT Newsletter in Brevo</a>
          </p>
        </div>
      `,
    }),
  });

  return response.ok || response.status === 201;
}

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
      headers: BREVO_HEADERS(apiKey),
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    const data = await response.json().catch(() => ({}));
    const message = String(data.message || data.error || "");
    const existing =
      response.status === 400 && /already|duplicate|exist/i.test(message);

    if (!(response.ok || response.status === 204 || existing)) {
      return res
        .status(response.status)
        .json({ error: message || "Subscribe failed" });
    }

    // Always send welcome (new and returning subscribers)
    let welcomeSent = false;
    let adminNotified = false;
    try {
      const welcome = await sendWelcomeEmail(apiKey, email);
      welcomeSent = Boolean(welcome.sent);
    } catch (err) {
      console.error("welcome send error", err);
      welcomeSent = false;
    }

    try {
      adminNotified = await notifyAdmin(apiKey, email, existing);
    } catch (err) {
      console.error("admin notify error", err);
      adminNotified = false;
    }

    return res.status(200).json({
      ok: true,
      existing: Boolean(existing),
      welcomeSent,
      adminNotified,
    });
  } catch (err) {
    console.error("newsletter error", err);
    return res.status(500).json({ error: "Newsletter service unavailable" });
  }
};

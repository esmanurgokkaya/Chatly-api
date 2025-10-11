// Dynamic welcome email template
// Exports a function `welcomeTemplate({name, buttonUrl, preheader, intro})` that returns
// an HTML string suitable for sending as an email body.

export function welcomeTemplate({
  name = 'Friend',
  buttonUrl = '#',
  preheader = "We're excited to have you on Messenger!",
  intro = 'We\'re excited to have you join our messaging platform!'
} = {}) {
  const safeName = typeof name === 'string' ? name : String(name);
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <style>
      /* Basic, email-friendly styles */
      body { margin:0; padding:0; background:#f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
      .container { width:100%; max-width:600px; margin:24px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 6px 18px rgba(20,30,60,0.08); }
      .hero { background:linear-gradient(90deg,#3fc7ff 0%, #6a7bff 100%); color:#fff; padding:28px 28px; text-align:center }
      .hero h1 { margin:0; font-size:24px; }
      .content { padding:24px; color:#0f1724; }
      .greeting { font-weight:600; color:#0b63ff; }
      .card { border-left:4px solid #e6eefb; background:#fbfdff; padding:14px; margin:18px 0; border-radius:6px }
      .btn { display:inline-block; background:#0b63ff; color:#fff; text-decoration:none; padding:12px 20px; border-radius:8px; font-weight:600 }
      .footer { font-size:12px; color:#6b7280; padding:18px 24px; }
      .preheader { display:none !important; visibility:hidden; opacity:0; height:0; width:0; }
    </style>
  </head>
  <body>
    <span class="preheader">${escapeHtml(preheader)}</span>
    <div class="container">
      <div class="hero">
        <h1>Welcome to Messenger!</h1>
      </div>
      <div class="content">
        <p class="greeting">Hello ${escapeHtml(safeName)},</p>
        <p>${escapeHtml(intro)}</p>

        <div class="card">
          <strong>Get started in just a few steps:</strong>
          <ul>
            <li>Set up your profile picture</li>
            <li>Find and add your contacts</li>
            <li>Start a conversation</li>
            <li>Share photos, videos, and more</li>
          </ul>
        </div>

        <p style="text-align:center; margin:22px 0;">
          <a class="btn" href="${escapeAttr(buttonUrl)}" target="_blank">Open Messenger</a>
        </p>

        <p>If you need any help or have questions, we're always here to assist you. Happy messaging!</p>

        <div class="footer">
          Best regards,<br />
          The Messenger Team
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

// Minimal escaping helpers for HTML insertion in templates.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  // For URLs we keep more characters but still escape double-quotes and ampersands
  return String(str).replace(/"/g, '%22').replace(/&/g, '%26');
}

// Serverless-Funktion – proxyt Anfragen sicher an die Anthropic API.
// Funktioniert auf Vercel (Ordner /api). Der API-Key bleibt serverseitig.

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Nur POST erlaubt" });

  // Body sicher einlesen (Vercel parst JSON meist automatisch)
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { mode, prompt } = body || {};
  if (!prompt) return res.status(400).json({ error: "prompt fehlt" });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY ist nicht gesetzt (Vercel → Settings → Environment Variables, danach Redeploy)." });
  }

  const maxTokens = mode === "chat" ? 600 : 4000;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",   // aktuelles, gültiges Modell
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await resp.json();

    // Echte Fehlermeldung der API durchreichen (statt nur "500")
    if (data.error) {
      console.error("Anthropic API Fehler:", data.error);
      return res.status(resp.status || 500).json({ error: data.error.message || "API-Fehler" });
    }

    const text = (data.content || []).map(b => b.text || "").join("");
    return res.status(200).json({ text });
  } catch (e) {
    console.error("Serverfehler:", e);
    return res.status(500).json({ error: e.message });
  }
};

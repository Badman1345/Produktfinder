// Serverless-Funktion – proxyt Anfragen sicher an die Anthropic API.
// Funktioniert auf Vercel (Ordner /api). Der API-Key bleibt serverseitig.

// Nur diese Domain(s) dürfen den Endpoint per Browser aufrufen.
// Falls du später eine eigene Domain (z.B. produktfinder.de) einrichtest,
// hier einfach mit Komma ergänzen.
const ALLOWED_ORIGINS = [
  "https://deinproduktfinder.vercel.app",
];

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin"); // wichtig für korrektes Caching bei mehreren erlaubten Origins
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Nur POST erlaubt" });

  // Anfragen von nicht erlaubten Origins direkt abweisen
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: "Origin nicht erlaubt" });
  }

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

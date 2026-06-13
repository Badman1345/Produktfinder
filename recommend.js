// Serverless-Funktion – proxyt Anfragen sicher an die Anthropic API.
// Funktioniert auf Vercel (Ordner /api) und Netlify (mit netlify.toml redirect).
// Der API-Key bleibt serverseitig und ist NIE im Browser sichtbar.

export default async function handler(req, res) {
  // CORS (optional, für lokale Tests)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Nur POST erlaubt" });

  const { mode, prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt fehlt" });

  // max_tokens je nach Aufgabe
  const maxTokens = mode === "chat" ? 500 : 1500;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,   // <-- aus Umgebungsvariablen
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await resp.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = (data.content || []).map(b => b.text || "").join("");
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

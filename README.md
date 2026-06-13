# ProduktFinder – KI-Produktberater 🛍️

Eine Website, auf der Besucher ihr Wunschprodukt beschreiben und eine KI
6 kategorisierte Empfehlungen liefert – mit Vergleichsmodus, Chat-Berater
und Amazon-Affiliate-Links.

## Was kann die Seite?

- **KI-Suche** – Besucher beschreiben ihr Produkt in normaler Sprache
- **6 kategorisierte Vorschläge** – Günstigste Option, Beste Bewertung,
  Beste Qualität, Bestes Preis-Leistungs-Verhältnis, Premium, Beliebteste Wahl
- **Vergleichsmodus** – bis zu 3 Produkte direkt nebeneinander
- **Chat-Berater** – Besucher können Fragen zu den Produkten stellen
  ("Was können sie?", "Lies mir die Bewertungen vor", "Was empfiehlst du?")
- **Animierter Maskottchen-Assistent** mit Sprechblase
- **Amazon-Affiliate-Links** mit deinem Tag `sunshinevib0d-21`

---

## Wichtig: Warum ein Backend?

Der KI-Aufruf darf **nicht** direkt aus dem Browser laufen – sonst stünde dein
API-Key offen im Quellcode und jeder könnte ihn missbrauchen (= deine Kosten).
Deshalb gibt es die kleine Funktion `api/recommend.js`, die den Key sicher
serverseitig hält. Der Browser spricht nur mit deinem Backend, nie direkt mit
Anthropic.

---

## Deployment auf Vercel (empfohlen, kostenlos, ~5 Min)

1. **Anthropic API-Key holen**
   → https://console.anthropic.com → Settings → API Keys → Create Key

2. **Konto bei Vercel** erstellen → https://vercel.com (mit GitHub einloggen)

3. **Diesen Ordner hochladen**
   - Entweder per GitHub-Repo (Ordner pushen, dann in Vercel importieren)
   - Oder Vercel CLI: `npm i -g vercel` → im Ordner `vercel` ausführen

4. **API-Key als Umgebungsvariable setzen**
   In Vercel → Project → Settings → Environment Variables:
   - Name: `ANTHROPIC_API_KEY`
   - Value: dein Key (sk-ant-...)
   - Speichern → Projekt neu deployen

5. **Fertig!** Deine Seite ist live unter `dein-projekt.vercel.app`

---

## Deployment auf Netlify (Alternative)

1. API-Key holen (wie oben)
2. Ordner zu Netlify ziehen (Drag & Drop auf app.netlify.com)
3. `api/recommend.js` nach `netlify/functions/recommend.js` verschieben
4. In `index.html` `API_ENDPOINT` auf `/.netlify/functions/recommend` ändern
5. Umgebungsvariable `ANTHROPIC_API_KEY` in den Netlify-Einstellungen setzen

---

## Anpassen

In `index.html` ganz oben im `<script>`-Block:

```js
const TAG = "sunshinevib0d-21";        // Dein Amazon Affiliate-Tag
const API_ENDPOINT = "/api/recommend"; // Backend-Pfad
```

- **Affiliate-Tag ändern**: einfach `TAG` anpassen
- **Maskottchen-Texte**: in den `setMascot(...)`-Aufrufen
- **Beispiel-Chips**: in den `.chips`-Buttons im HTML
- **Design/Farben**: in den CSS-Variablen `:root { ... }`

---

## Hinweise

- **Affiliate-Pflicht**: Der Hinweis im Footer ("Als Amazon-Partner...") ist
  rechtlich vorgeschrieben – bitte drinlassen.
- **Echte Live-Preise**: Aktuell erzeugt die KI realistische Beispielprodukte.
  Für echte Live-Preise & garantiert existierende Produkte bräuchtest du die
  Amazon Product Advertising API (PA-API) – dafür sind 3 qualifizierte Verkäufe
  nötig. Bis dahin funktioniert die Suche-mit-Tag-Lösung sehr gut.
- **Kosten**: Jede Suche/Chat-Anfrage kostet ein paar Cent API-Gebühr.
  Bei Anthropic kannst du ein Ausgabenlimit setzen.

# Editor Update für neues Newsletter-Template

## ⚠️ WICHTIG: Editor muss angepasst werden!

Der aktuelle Editor passt NICHT zum neuen Newsletter-Template.

### Aktuelle Probleme:

1. **Falsche Sektionen-Auswahl:**
   - "Relevanz für Bonn" → ENTFERNEN
   - "Handlungsempfehlungen" → NUR FÜR INTERNES DOKUMENT
   - "Chancen & Risiken" → NUR FÜR INTERNES DOKUMENT

2. **Falsche Version-Buttons:**
   - KOMPAKT/DETAIL → ERSETZEN durch ÖFFENTLICH/INTERN

3. **Fokuspunkte-Editor:**
   - Gehört NICHT in öffentlichen Newsletter
   - NUR für internes Dokument

### Neue Struktur:

#### ÖFFENTLICHER NEWSLETTER:
- Aktuelle Entwicklungen
- Was bald kommt
- Quellenverzeichnis

#### INTERNES DOKUMENT:
- Fokuspunkte mit Handlungsschritten
- TCMS-Daten
- Chancen & Risiken
- Praxis-Checklisten
- Interne Kontakte

### Workaround bis zur Anpassung:

1. **Beim Laden des öffentlichen Newsletters:**
   - Ignorieren Sie "Relevanz für Bonn" Sektion
   - Ignorieren Sie "Handlungsempfehlungen"
   - Ignorieren Sie "Chancen & Risiken"
   - Fokuspunkte-Editor NICHT verwenden

2. **Beim Export:**
   - Nur die relevanten Sektionen exportieren
   - Manuell nachbearbeiten falls nötig

### Editor-Anpassungen nötig:

```javascript
// Section selector update needed:
<select id="section-selector">
    <option value="">Bereich wählen...</option>
    <option value="aktuelle_entwicklungen">Aktuelle Entwicklungen</option>
    <option value="was_bald_kommt">Was bald kommt</option>
    <option value="quellenverzeichnis">Quellenverzeichnis</option>
</select>

// Version switcher update needed:
<button id="version-public">ÖFFENTLICH</button>
<button id="version-internal">INTERN</button>
```

## Empfehlung:

Nutzen Sie den Editor vorerst nur für:
- Vorschau-Funktion
- Export zu HTML/PDF
- Fact-Check

Die strukturellen Änderungen sollten direkt in den HTML-Dateien gemacht werden.
# me4-goal-webbuilder

Eigenstaendiges CLI-Skelett fuer einen `/goal`-Website-Build mit
**Stub-Fallbacks**. Das Tool laeuft vollstaendig **ohne externe
API-Credentials** und **ohne Netzwerkzugriff**.

## Was das ist

`goal_webbuild.py` fuehrt vier Phasen aus:

| Phase | Was passiert | Stub? |
|---|---|---|
| `research` | liest Markdown/Txt/JSON aus `inputs/`, schreibt `dist/research/research.json` | **ja** (externe Recherche fehlt) |
| `assets`  | erzeugt deterministische Platzhalter-SVGs aus dem Spec | **ja** (keine Bild-API) |
| `build`   | rendert HTML/CSS/JS aus Spec + Assets nach `dist/` | **nein - die echte Phase** |
| `publish` | schreibt `dist/PUBLISH-STUB.md` mit Anleitung | **ja** (kein Hosting) |

Die drei Stub-Phasen melden das sichtbar im JSON-Output (`stub_used`) und in
`warnings`. Es werden **niemals** plausible Fake-Daten erzeugt.

## Voraussetzungen

- Python 3.11 (Standardbibliothek genuegt)
- `jsonschema` ist **optional**: fehlt es, nutzt das Tool einen eingebauten
  Minimal-Validator und vermerkt das als Hinweis in `warnings`.
- Keine pip-Installation, kein Build, kein Container, kein Netzwerk.

## Nutzung

```bash
# alle Phasen (Default)
python -B goal_webbuild.py all --spec examples/website.spec.json --out dist/

# nur eine Phase
python -B goal_webbuild.py build --spec examples/website.spec.json --out dist/
python -B goal_webbuild.py --phase research --out dist/

# mit lokalen Quellen
python -B goal_webbuild.py all --spec examples/website.spec.json --inputs inputs/ --out dist/
```

`--phase` und das Positionsargument sind alternativ; `all` ist der Default.
Widersprechen sie sich, bricht die CLI mit Exit-Code 2 ab (argparse-Usage-Fehler).

Weitere Flags: `--templates`, `--schema`, `--allow-external` (in dieser Version
ohne Funktion - es erfolgt **keine** Netzwerkanfrage), `--no-offline-guard`,
`--version`.

## Ausgabevertrag

Auf stdout steht genau ein JSON-Objekt:

```json
{
  "ok": true,
  "phase": "all",
  "stub_used": ["assets", "publish", "research"],
  "outputs": ["C:\\...\\dist\\index.html"],
  "warnings": ["stub: keine externe Recherche (externe API-Credentials fehlen)"],
  "metrics": {"phases_run": ["research", "assets", "build", "publish"], "network_calls": 0}
}
```

- `ok: false` bei Fehlern, mit konkreter Ursache in `warnings`.
- `phase` ist die angeforderte Phase (`all` bei Gesamtlauf).
- `outputs` sind absolute Pfade.
- Exit-Codes: `0` = erfolgreich, `1` = Fehler (mit `ok: false`), `2` = Aufruf-Fehler.

## Spec-Format

`spec.schema.json` (JSON-Schema 2020-12) beschreibt die Spezifikation:
`site`, `theme`, `nav`, `sections` (Typen `hero`, `text`, `features`, `gallery`,
`cta`), `footer`. `examples/website.spec.json` ist ein vollstaendiges Beispiel.

## Templates

`templates/` enthaelt ein minimales Grundgeruest ohne Framework und ohne CDN:
`base.html`, `site.css`, `site.js` und je ein Template pro Sektions-Typ.
Platzhalter werden als `@@TOKEN@@` ersetzt (bewusst kein `str.format`, weil CSS
und JS geschweifte Klammern enthalten).

## Offline-Garantie

Waehrend des Laufs blockiert der Offline-Guard `socket.socket` und
`socket.create_connection`. Ein Netzwerkzugriff wuerde als BuildError abbrechen,
nicht stillschweigend Erfindungen produzieren.

## Tests

```bash
python -B -m pytest tests/ -q
```

Die Tests laufen das echte CLI als Subprocess und pruefen Vertrag, Stub-Meldungen,
Determinismus der Assets, Fehlerpfade und die Netzwerkfreiheit.

## Was bewusst NICHT implementiert ist

- Keine Web-Recherche (kein Firecrawl) - Credentials fehlen auf diesem Host.
- Keine echten Bilder/Screenshots (kein Higsfield) - es entstehen beschriftete
  Platzhalter-SVGs.
- Kein Hosting (kein here.now) - `dist/` bleibt lokal, `PUBLISH-STUB.md`
  enthaelt die Anleitung fuer die manuelle Veroeffentlichung.
- Kein HTML-Framework, kein Bundler, kein CDN - bewusst fuer Offline-Faehigkeit.

## Multica-Issue-Bruecke

(`Multica-Issue-Brücke` — ASCII-Schreibweise wie im Rest dieses READMEs.)

`multica_issue_bridge.py` ueberfuehrt einen fertigen `/goal`-Webbuild als
**Multica-Issue-Entwurf**. Die Bruecke ist **stub-first** und **opt-in**:
ohne explizite Eigentuemer-Freigabe wird **nichts** an Multica gesendet.

```bash
# Default: nur entwerfen, nichts senden (Exit 0)
python -B multica_issue_bridge.py --manifest dist/build-manifest.json --title "Test"

# eigener Entwurfs-Pfad
python -B multica_issue_bridge.py --manifest dist/build-manifest.json \
    --title "Test" --draft-out dist/multica-issue-draft.json

# Erzeugung ist GESPERRT -> Exit 3, kein Issue
python -B multica_issue_bridge.py --manifest dist/build-manifest.json \
    --title "Test" --execute

# Erzeugung nur mit Eigentuemer-Freigabe (erzeugt genau EIN Issue)
python -B multica_issue_bridge.py --manifest dist/build-manifest.json \
    --title "Test" --project <PROJEKT-ID> --execute --allow-issue-create
```

### Flags

| Flag | Default | Bedeutung |
|---|---|---|
| `--manifest <pfad>` | `dist/build-manifest.json` | Quelle der Build-Zahlen |
| `--title <text>` | aus Manifest abgeleitet | Issue-Titel |
| `--description <text>` | generiert | Issue-Beschreibung |
| `--project <id>` | – | Multica-Projekt-ID (Pflicht fuer `--execute`) |
| `--draft-out <pfad>` | neben dem Manifest | Ziel des Entwurfs |
| `--dry-run` | **true** | nur entwerfen, nichts senden |
| `--execute` | aus | Issue erzeugen (benoetigt Freigabe) |
| `--allow-issue-create` | aus | **Eigentuemer-Freigabe** fuer die Erzeugung |

### Was der Entwurf enthaelt

`dist/multica-issue-draft.json` nennt Titel, Build-Ausgabepfad und die
**reellen** Zahlen aus dem Manifest und den `dist`-Artefakten:

- Sektionen, Asset-Anzahl, Dateianzahl und Gesamtbytes,
- Phasenliste mit echtem Stub-Status je Phase (`research`/`assets`/`publish`
  sind Stub, `build` ist real) - belegt an den Artefakten selbst,
- `issue_id: null` und `issue_created: false`, bis tatsaechlich ein Issue
  erzeugt wurde.

Es werden **keine Zahlen erfunden** und **keine Issue-IDs vorweggenommen**.
Der Entwurf enthaelt **keine Secrets**.

### Exit-Codes

| Code | Bedeutung |
|---|---|
| `0` | Entwurf erstellt (Dry-Run) bzw. Issue erfolgreich erzeugt |
| `1` | Fehler (Manifest fehlt / nicht lesbar) |
| `2` | Aufruf-Fehler (argparse) |
| `3` | **nicht ausgefuehrt**: Eigentuemer-Freigabe fehlt, keine Multica-Instanz erreichbar, oder `--project` fehlt |

### Freigabe-Hinweis

> **Issue-Erzeugung benoetigt Eigentuemer-Freigabe (`--allow-issue-create` setzen)**

`--execute` **ohne** `--allow-issue-create` endet mit **Exit 3** und erzeugt
**kein** Issue. Ist `--allow-issue-create` gesetzt, wird genau **ein** Issue
gegen das explizit per `--project` benannte Projekt erzeugt; die echte
Issue-ID wird zurueckgegeben und in den Entwurf eingetragen. Ohne
erreichbare Multica-Instanz gibt es einen klaren Stub-Hinweis, Exit 3 und
**keine** erfundene ID.

Die Bruecke bevorzugt `scripts/multica_cli.py` (§B1) als Subprozess und
faellt sonst auf die Multica-CLI direkt zurueck (Umgebung aus dem
CEO-`.env`).

## Rollback

```bash
rm -rf "D:/ME4-Development/IT-Projekte/me4-goal-webbuilder"
```

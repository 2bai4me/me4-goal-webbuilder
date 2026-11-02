# ME4 Goal Webbuilder - lokale Quellen

Dieses Verzeichnis sammelt die Quellen, die Phase research ausliest.

## Zielbild

Ein eigenstaendiges CLI-Tool mit vier Phasen, das ohne externe API-Credentials
vollstaendig lauffaehig ist. Der Build muss ehrlich signalisieren, welche Phase
ein Stub ist.

## Phasen

- research: liest Markdown, Text und JSON aus diesem Ordner
- assets: erzeugt deterministische Platzhalter-SVGs
- build: rendert HTML, CSS und JS in den dist-Ordner
- publish: schreibt eine Anleitung, veroeffentlicht nichts

## Regeln

Keine Netzwerkanfragen, keine pip-Installation, keine Container-Starts.
Jede Behauptung im Abschlussbericht braucht echten Tool-Output.

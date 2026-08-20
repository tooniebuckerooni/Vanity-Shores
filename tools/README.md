# tools

## `bible.js` — the game bible generator

```
npm install --no-save playwright     # tooling only; the game has no dependencies
node tools/bible.js                  # -> docs/game-bible.html
```

Drives the real `index.html` in a headless browser and reads the live game
objects (`ROOMS`, `CAST`, `ITEMS`, `ECONOMY`, `GATES`, `DEATHS`, `HEAT_TIERS`),
then scans the source for dialogue volume and flag traffic. Nothing in the
output is maintained by hand, so the breakdown cannot drift from what ships.

Regenerate it whenever you add a location, a character, a payout or a gate.

Set `CHROME_PATH` if your Chromium is somewhere unusual.

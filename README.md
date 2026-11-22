# best-heist-game-20261122-0559

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/kinoy-1/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/kinoy-1/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**The Velvet Fox — Heist at the Museum of Lost Sounds.** A complete top-down heist game built for make.fun's "Make the best heist game" bounty ($50 in USDC, top 10 share it).

In a city where sounds can be stolen and bottled, the Museum of Lost Sounds keeps the rarest of them behind glass. You are the Velvet Fox, a retired stage magician turned gentleman thief. Steal them back, one gallery a night, for seven nights.

## What makes it a complete heist game

- **One frame says it all:** every room shows the thief crossing the gallery, curators sweeping lantern vision cones, wall cameras panning red cones, the night's loot glowing gold on its pedestal, and the alarm meter ticking up in the HUD.
- **Seven nights, seven stolen sounds:** The First Laugh, The Midnight Bell, The Silent Violin, The Last Lullaby, The Thunder Drum, The Paper Crane's Song, The Sound of Dawn — each gallery a different hand-tuned room with more curators and cameras as the museum's Heat rises.
- **Three routes per room:** the Marble Hall (fast, watched), the Vent Crawl (slow, unseen) and the Service Corridor (locked — a lockpick opens it), plus safe shadow pools to hide in.
- **Tools at a cost:** Smoke Puff, Decoy Music Box, Lockpick and Lantern Snuff, all bought with coins stolen from display cases (Common, Rare and Legendary tiers).
- **A named crew and a meta game:** pick Pip the Lookout, Mara the Safecracker or Joss the Runner each night, and spend coins on the five-track Shadowcraft upgrade tree between nights.
- **A fair caught moment and a getaway that pays off:** a SPOTTED! grace beat before a chase catches you, lockdowns that seal the exit, and a van waiting at the blue door with a full score tally — target, side loot, time bonus and a ghost bonus for never being seen.
- **Feel and polish:** sweeping cones, synthesized WebAudio (footsteps, loot chimes, alarm swell, lockdown bell, getaway engine), and a HUD that never hides the alarm.

## Run it

```sh
node serve.ts
# open http://localhost:8080 — WASD / arrows to move, click to walk, Shift to sneak, 1-4 for tools, Enter to begin
```

## Layout

- `game/` — the playable game (static files, no network): `index.html` + `src/` split by job (`config`, `levels`, `world`, `thief`, `guards`, `cameras`, `alarm`, `loot`, `tools`, `crew`, `upgrades`, `heat`, `render`, `hud`, `audio`, `input`, `shots`, `getaway`, `main`)
- `screenshots/` — 4 real renders of the game's own code (cover, patrol, lockdown, night select)
- `main.ts` — the Node 22 hand-in program (writes `dossier.json` with the kit's vendored library)
- `vendor/makefun-game.ts` — the kit's copy, unchanged

---

<sub>Entered on [make.fun](https://make.fun/?ref=qzezv1jd&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>

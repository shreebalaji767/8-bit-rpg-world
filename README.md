# 8-Bit RPG World

A free, browser-based top-down action RPG built with vanilla HTML, CSS and JavaScript. It is designed for static hosting (GitHub Pages), local saves and offline play after the first successful load.

## Play

After GitHub Pages is enabled for the `main` branch (root), visit:

https://shreebalaji767.github.io/8-bit-rpg-world/

## Current playable foundation

- Character creation with six starting classes.
- Top-down pixel-art Greenvale map with camera tracking.
- Five connected Greenvale areas: Meadowbrook Village, Eastern Meadowlands, Whispering Woods, Old Copper Mine and the Forgotten Root Dungeon.
- A second playable kingdom, Solaria, with five distinct areas: Sunscar Outpost, Singing Dunes, Glasswater Oasis, Buried Sun Ruins and the Sunken Sun Temple.
- A third playable kingdom, Frostholm, with five snowbound areas: Snowfall Hamlet, Whisperfrost Pass, Blueglass Glacier, Hollow Ice Cavern and Frostbound Citadel.
- Area-specific terrain palettes, enemy populations, exploration NPCs and boundary-based routes.
- The Forgotten Root Dungeon, a Runic Switch puzzle gate and its two-phase Rootbound Guardian boss encounter.
- Power Strike special attack (K / mobile skill button), mana cost and animated slash feedback.
- Equipment slots, equipable weapons and armor, plus field crafting recipes for potions and gear, including the Whisperwood Bow and Copperguard Mail.
- Copper Ore drops in the mine and dungeon, used by the crafting system.
- Keyboard and touch movement, real-time directional melee attacks.
- Eleven enemy types across the three kingdoms, including Thorn Wolves, Cave Beetles, Dune Scorpions, Ice Golems and Snow Wraiths, with simple pursuit and contact damage.
- XP, levels, HP/MP, gold, loot and consumables.
- Village NPC dialogue, a merchant, a main quest and a reward.
- Two repeat-safe Greenvale side quests: gather 4 Green Herbs for the Lost Herbalist and deliver 3 Copper Ore to the Retired Miner, each with one-time rewards.
- Solaria chapter quest: meet Captain Samira, recover 3 Sunstone Shards for the Oasis Keeper, activate the solar seal and defeat the 210-HP Sunken Sand Wyrm.
- Solaria unlocks after the Rootbound Guardian is defeated; Frostholm unlocks after the Sunken Sand Wyrm is defeated. Both chapter progress flags are stored in the existing local save format.
- Frostholm chapter quest: meet Warden Eira, collect 3 Frost Cores for the Glacier Hermit, open the Frost Seal and defeat the 240-HP Frostbound Colossus.
- Inventory, character sheet, kingdom overview and local save.
- Three independent local save slots with validated JSON export/import backups; saves never leave the device unless the player explicitly exports a file.
- Service-worker app shell for offline use after the first online visit.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | WASD / Arrow keys | Direction pad |
| Attack | Space / J | Attack |
| Power Strike | K (5 MP) | Power |
| Interact | E | Talk |

## Local development

No build step or dependencies are required. Open `index.html` through a local static server for service-worker testing. GitHub Pages serves it directly.

## Storage and privacy

Game progress is stored in this browser localStorage. It does not sync between devices and clearing browser site data can erase it. Use Save Game before switching devices or clearing browser data. Open **SAVE SLOTS · BACKUP** to choose among three slots or export/import a JSON backup. Imported files are size-limited and validated before replacing the selected slot.

## Roadmap

1. Expand the Solaria chapter with more quests, enemies, dungeon puzzles and boss phases.
2. Add additional equipment tiers, crafting stations and balanced loot tables.
3. Build the remaining five locked kingdoms with distinct tile sets and mechanics.
4. Add expanded save slots, export/import backups and automated browser regression tests.

Greenvale, Solaria and Frostholm are the first three playable kingdoms. Aetheria, Infernia, Thalassia, Shadowmere and Celestia, along with many larger-world features, are still planned.

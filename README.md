# 8-Bit RPG World

A free, browser-based top-down action RPG built with vanilla HTML, CSS and JavaScript. It is designed for static hosting (GitHub Pages), local saves and offline play after the first successful load.

## Play

After GitHub Pages is enabled for the `main` branch (root), visit:

https://shreebalaji767.github.io/8-bit-rpg-world/

## Current playable foundation

- Character creation with six starting classes.
- Top-down pixel-art Greenvale map with camera tracking.
- Four connected Greenvale areas: Meadowbrook Village, Eastern Meadowlands, Whispering Woods and Old Copper Mine.
- Area-specific terrain palettes, enemy populations, exploration NPCs and boundary-based routes.
- The Forgotten Root Dungeon and its Rootbound Guardian boss encounter.
- Power Strike special attack (K / mobile skill button), mana cost and animated slash feedback.
- Equipment slots, equipable weapons and armor, plus field crafting recipes for potions and gear.
- Copper Ore drops in the mine and dungeon, used by the crafting system.
- Keyboard and touch movement, real-time directional melee attacks.
- Three enemy types with simple pursuit and contact damage.
- XP, levels, HP/MP, gold, loot and consumables.
- Village NPC dialogue, a merchant, a main quest and a reward.
- Inventory, character sheet, kingdom overview and local save.
- Service-worker app shell for offline use after the first online visit.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | WASD / Arrow keys | Direction pad |
| Attack | Space / J | Attack |\n| Power Strike | K (5 MP) | Power |
| Interact | E | Talk |

## Local development

No build step or dependencies are required. Open `index.html` through a local static server for service-worker testing. GitHub Pages serves it directly.

## Storage and privacy

Game progress is stored in this browser localStorage. It does not sync between devices and clearing browser site data can erase it. Use Save Game before switching devices or clearing browser data.

## Roadmap

1. Expand Greenvale quest chains, enemy families, dungeon puzzles and boss phases.
2. Add additional equipment tiers, crafting stations and balanced loot tables.
3. Unlock the seven additional kingdoms with distinct tile sets and mechanics.
4. Add expanded save slots, export/import backups and automated browser regression tests.

The eight-kingdom world is planned; not every region or feature is implemented yet.

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
- A fourth playable kingdom, Aetheria, with five floating-island areas: Cloudrest Spire, Whispering Cloudway, Windward Isles, The Shattered Aeries and Elderlight Shrine.
- A fifth playable kingdom, Infernia, with five volcanic areas: Cinderwatch, Emberwild, Ashen Caldera, Magma Tunnels and Infernal Keep.
- A sixth playable kingdom, Thalassia, with five island and underwater areas: Tidecross Port, Coralway Atoll, Whispering Reef, The Drowned Galleon and Pearlheart Palace.
- A seventh playable kingdom, Shadowmere, with five cursed areas: Gloam Village, Blackbriar Wood, Wraithfen Moor, Hollowmoon Crypt and Nightveil Citadel.
- An eighth and final playable kingdom, Celestia, with five celestial areas: Starfall Citadel, Astral Gardens, Moonlit Observatory, Voidglass Sanctum and Zenith Throne.
- Area-specific terrain palettes, enemy populations, exploration NPCs and boundary-based routes.
- The Forgotten Root Dungeon, a Runic Switch puzzle gate and its two-phase Rootbound Guardian boss encounter.
- Six class-specific mana skills on K / the mobile skill button: Warrior Power Strike, Mage Arcane Bolt, Archer Piercing Shot, Rogue Backstab, Ranger Hunter Volley and Paladin Holy Vigor. Skills have different range, damage and support effects.
- Legendary endgame crafting: Starforged Blade (+12 attack) and Eightfold Aegis (+10 defence), requiring materials gathered across multiple kingdoms.
- Equipment slots, equipable weapons and armor, plus field crafting recipes for potions and gear, including the Whisperwood Bow and Copperguard Mail.
- Copper Ore drops in the mine and dungeon, used by the crafting system.
- Keyboard and touch movement, real-time directional melee attacks.
- Twenty-six enemy types across all eight playable kingdoms, including region-specific beasts, undead, elementals, guardians and the Celestia Star Wisp, Astral Drake and Void Seraph. Enemies use scripted pursuit and contact-damage behaviour.
- XP, levels, HP/MP, gold, loot and consumables.
- A persistent in-game day/night clock with dawn, daylight, dusk and night lighting; the time and day are stored in existing local saves, with safe defaults for older saves.
- Night encounters are more dangerous: enemies detect the player from farther away and deal a small additional amount of damage. Resting advances to dawn and restores HP/MP.
- Village NPC dialogue, a merchant, a main quest and a reward.
- Two repeat-safe Greenvale side quests: gather 4 Green Herbs for the Lost Herbalist and deliver 3 Copper Ore to the Retired Miner, each with one-time rewards.
- Solaria chapter quest: meet Captain Samira, recover 3 Sunstone Shards for the Oasis Keeper, activate the solar seal and defeat the 210-HP Sunken Sand Wyrm.
- Kingdom progression follows the main boss chain: Solaria unlocks after the Rootbound Guardian; Frostholm after the Sunken Sand Wyrm; Aetheria after the Frostbound Colossus; Infernia after the Astral Warden; Thalassia after the Infernal Regent; Shadowmere after the Leviathan of the Deep; and Celestia after the Hollow King. Chapter unlocks are recorded in the existing local save format.
- Frostholm chapter quest: meet Warden Eira, collect 3 Frost Cores for the Glacier Hermit, open the Frost Seal and defeat the 240-HP Frostbound Colossus.
- Aetheria chapter quest: meet Skykeeper Luma, deliver 3 Aether Shards to the Aether Sage, awaken the Sky Sigil and defeat the 280-HP Astral Warden.
- Infernia chapter quest: meet Forgekeeper Vela, deliver 3 Ember Hearts to the Ash Sage, open the Infernal Seal and defeat the 340-HP Infernal Regent.
- Thalassia chapter quest: meet Harbormaster Neris, deliver 3 Tide Pearls to Pearl Diver Sela, awaken the Pearlheart Seal and defeat the 380-HP Leviathan of the Deep.
- Shadowmere chapter quest: meet Village Keeper Maelin, deliver 3 Gloom Sigils to the Mourning Seer, awaken the Nightveil Seal and defeat the 430-HP Hollow King.
- Celestia final chapter: meet Astral Navigator Elion in Starfall Citadel; explore Astral Gardens, Moonlit Observatory and Voidglass Sanctum; deliver 3 Star Sigils to the Oracle of the Last Dawn; restore the Starheart; open the Zenith Gate; and defeat the 520-HP Celestial Warden in the Zenith Throne. Victory grants 1,000 gold, 7 Star Sigils, +20 maximum HP and +8 maximum MP, and marks the final chapter complete.
- Inventory, character sheet, kingdom overview, quest journal and local save.
- Six playable character classes: Warrior, Mage, Archer, Rogue, Paladin and Ranger.
- Story progression across eight kingdoms, with chapter quests, collectible materials, seal puzzles and a culminating final boss encounter in Celestia.
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

## World completion and next development

**All eight kingdoms are now playable:** Greenvale, Solaria, Frostholm, Aetheria, Infernia, Thalassia, Shadowmere and Celestia. Celestia is the final kingdom; defeating the Celestial Warden completes the current main-story progression.

The next development phases are expansions to the completed world, rather than additional locked kingdoms:

1. Add more optional side quests, NPC stories and explorable settlements across existing kingdoms.
2. Expand dungeons with additional puzzles, secret rooms, enemy waves and multi-phase boss encounters.
3. Continue balancing class skills, equipment tiers, crafting recipes and loot variety.
4. Add endgame challenges, replayable boss encounters, achievements and personal records.
5. Expand automated regression coverage and perform hands-on browser testing across desktop and mobile devices.

## Project constraints

- Free static-site architecture: vanilla HTML, CSS and JavaScript; no backend or database.
- No paid APIs, subscriptions, advertisements or mandatory accounts.
- Browser-local saves; no automatic cloud sync or server-side collection of game progress.
- Responsive keyboard and touch controls, with offline app-shell caching through the service worker.

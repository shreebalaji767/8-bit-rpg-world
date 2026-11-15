const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("index.html", "utf8");
const game = fs.readFileSync("game.js", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const worker = fs.readFileSync("sw.js", "utf8");

test("game page loads its canvas, script, stylesheet and offline manifest", () => {
  assert.match(html, /id="gameCanvas"/);
  assert.match(html, /src="game\.js"/);
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /rel="manifest"/);
  assert.match(html, /serviceWorker\.register/);
});

test("Greenvale contains four connected exploration areas", () => {
  for (const area of ["village", "meadow", "woods", "mine"]) {
    assert.ok(game.includes(area), "missing area: " + area);
  }
  assert.match(game, /function setupArea\(spawn\)/);
  assert.match(game, /function move\(dx,dy\)/);
});

test("combat only hits the enemy directly in front of the player", () => {
  assert.match(game, /e\.x===p\.x\+dx\*step&&e\.y===p\.y\+dy\*step/);
  assert.match(game, /function attack\(\)/);
});

test("quest rewards require accepting the village quest first", () => {
  assert.match(game, /state\.quests\.village&&p\.kills>=3&&state\.quests\.slimes===false/);
});

test("save data preserves the current Greenvale area", () => {
  assert.match(game, /area:state\.area/);
  assert.match(game, /state\.area=d\.area/);
  assert.match(game, /setupArea\(\{x:state\.player\.x,y:state\.player\.y\}\)/);
});

test("mobile layout and offline cache remain present", () => {
  assert.match(css, /@media\(max-width:850px\)/);
  assert.match(html, /data-move="up"/);
  assert.match(worker, /cache\.addAll\(APP_SHELL\)/);
});

test("Greenvale dungeon has a persistent guardian boss and return route", () => {
  assert.match(game, /dungeon:\{name:"Forgotten Root Dungeon"/);
  assert.match(game, /name:"Rootbound Guardian"/);
  assert.match(game, /state\.quests\.dungeonBoss=true/);
  assert.match(game, /state\.area==="dungeon"&&dy<0/);
});

test("Power Strike consumes mana and has a separate cooldown", () => {
  assert.match(game, /function specialAttack\(\)/);
  assert.match(game, /p\.mp<5/);
  assert.match(game, /p\.class==="Rogue"\?3:p\.class==="Mage"\?2\.35/);
  assert.match(game, /damageEnemy\(e,Math\.max\(1,Math\.floor\(p\.attack\*multiplier\+bonus-i\*2\)\),true\)/);
});

test("crafting recipes consume materials and equipment updates stats", () => {
  assert.match(game, /const RECIPES=/);
  assert.match(game, /function craftItem\(id\)/);
  assert.match(game, /function equipItem\(id\)/);
  assert.match(game, /data-craft=/);
  assert.match(game, /data-equip=/);
});

test("touch and keyboard controls expose the Power Strike", () => {
  assert.match(html, /id="touchSkill"/);
  assert.match(game, /e\.key==="k"\|\|e\.key==="K"/);
  assert.match(html, /data-tab="craft"/);
});


test("enemy defeat or death cannot keep processing the old area's enemy list", () => {
  assert.match(game, /for\(const e of state\.enemies\)/);
  assert.match(game, /if\(respawned\)\{state\.keys=\{\};\}/);
  assert.match(game, /respawned=true;updateUI\(\);break/);
});

test("Rootbound Guardian uses a readable wind-up and a stronger second phase", () => {
  assert.match(game, /e\.name\.toUpperCase\(\)\+\(e\.phase===2\?/);
  assert.match(game, /e\.phase===2\?e\.atk\+6:e\.atk/);
  assert.match(game, /e\.telegraph\?"#f2a84b"/);
});


test("Forgotten Root Dungeon requires its Runic Switch before the boss corridor opens", () => {
  assert.match(game, /name:"Runic Switch",kind:"switch"/);
  assert.match(game, /if\(!state\.quests\.dungeonSealOpen\)for\(let x=21;x<=26;x\+\+\)state\.grid\[5\]\[x\]=2/);
  assert.match(game, /state\.quests\.dungeonSealOpen=true/);
  assert.match(game, /for\(let x=21;x<=26;x\+\+\)state\.grid\[5\]\[x\]=0/);
});

test("Woods and mine rotations include Thorn Wolf and Cave Beetle enemy families", () => {
  assert.match(game, /name:"Thorn Wolf"/);
  assert.match(game, /name:"Cave Beetle"/);
  assert.match(game, /drop:"copper"\},\{name:"Dune Scorpion"/);
});

test("save manager supports three validated local slots and JSON backup transfer", () => {
  assert.ok(game.includes("eightBitRpgSaveV2_slot_"));
  assert.ok(game.includes("function validSaveData(d)"));
  assert.ok(game.includes("function openSaveManager()"));
  assert.ok(game.includes("application/json"));
  assert.ok(game.includes('a.download="8-bit-rpg-slot-'));
  assert.ok(game.includes("state.inventory={...d.inventory}"));
  assert.ok(html.includes('id="manageSaveButton"'));
});

test("Greenvale side quests have one-time herb and copper turn-ins", () => {
  assert.ok(game.includes('kind==="herbalist"'));
  assert.ok(game.includes('kind==="miner"'));
  assert.ok(game.includes("state.quests.herbalistDone=true"));
  assert.ok(game.includes("state.quests.minerDone=true"));
  assert.ok(game.includes("state.inventory.herb-=4"));
  assert.ok(game.includes("state.inventory.copper-=3"));
  assert.ok(game.includes("herbalistDone:false,miner:false,minerDone:false"));
});

test("new Greenvale equipment has craft recipes and UI entries", () => {
  assert.ok(game.includes('forestBow:{name:"Whisperwood Bow"'));
  assert.ok(game.includes('ironArmor:{name:"Copperguard Mail"'));
  assert.ok(game.includes("forestBow:{cost:{wood:2,herb:2,slime:1}}"));
  assert.ok(game.includes("ironArmor:{cost:{copper:4,wood:4,slime:2}}"));
  assert.ok(game.includes('data-craft="forestBow"'));
  assert.ok(game.includes('data-craft="ironArmor"'));
});

test("Solaria is a distinct five-area desert kingdom with connected routes", () => {
  for (const area of ["outpost", "dunes", "oasis", "ruins", "temple"]) {
    assert.ok(game.includes('name:"' + ({outpost:"Sunscar Outpost",dunes:"Singing Dunes",oasis:"Glasswater Oasis",ruins:"Buried Sun Ruins",temple:"Sunken Sun Temple"}[area]) + '"'));
  }
  assert.match(game, /function setupSolariaArea\(spawn\)/);
  assert.match(game, /function moveSolaria\(dx,dy\)/);
  assert.match(game, /state\.region===1/);
  assert.match(game, /name:"Dune Scorpion"/);
  assert.match(game, /name:"Sunken Sand Wyrm"/);
});

test("Solaria chapter has a repeat-safe sunstone quest and puzzle-gated boss", () => {
  assert.match(game, /kind==="solariaGuide"/);
  assert.match(game, /kind==="oasisKeeper"/);
  assert.match(game, /state\.quests\.sunstoneDone=true/);
  assert.match(game, /state\.quests\.solariaSealOpen=true/);
  assert.match(game, /state\.quests\.solariaBoss=true/);
  assert.match(game, /state\.quests\.solariaUnlocked=true/);
  assert.match(game, /sunstone:\{name:"Sunstone Shard"/);
});

test("Solaria unlock state persists in existing local save slots", () => {
  assert.match(game, /solariaUnlocked:false/);
  assert.match(game, /REGIONS\[1\]\.unlocked=!!state\.quests\.solariaUnlocked/);
  assert.match(game, /state\.region=d\.region;state\.area=d\.area/);
  assert.match(game, /state\.region=0;state\.area="village"/);
});


test("Solaria movement dispatches by kingdom without recursive movement", () => {
  assert.match(game, /if\(state\.region===1\)\{moveSolaria\(dx,dy\);return\}/);
  assert.match(game, /function moveSolaria\(dx,dy\)\{const p=state\.player;let nx=p\.x\+dx/);
  assert.doesNotMatch(game, /function moveSolaria\(dx,dy\)\{const p=state\.player;if\(state\.region===1\)/);
});

test("Frostholm has five distinct connected snow areas and its own enemy family", () => {
  for (const name of ["Snowfall Hamlet","Whisperfrost Pass","Blueglass Glacier","Hollow Ice Cavern","Frostbound Citadel"]) {
    assert.ok(game.includes('name:"' + name + '"'), "missing Frostholm area " + name);
  }
  assert.match(game, /function setupFrostholmArea\(spawn\)/);
  assert.match(game, /function moveFrostholm\(dx,dy\)/);
  assert.match(game, /if\(state\.region===2\)\{moveFrostholm\(dx,dy\);return\}/);
  assert.match(game, /name:"Frost Wolf"/);
  assert.match(game, /name:"Ice Golem"/);
  assert.match(game, /name:"Snow Wraith"/);
});

test("Frostholm quest is repeat-safe and the Colossus is gated by the Frost Seal", () => {
  assert.match(game, /kind==="frostGuide"/);
  assert.match(game, /kind==="glacierHermit"/);
  assert.match(game, /state\.inventory\.frostCore-=3/);
  assert.match(game, /state\.quests\.frostCoreDone=true/);
  assert.match(game, /state\.quests\.frostGateOpen=true/);
  assert.match(game, /name:"Frostbound Colossus"/);
  assert.match(game, /state\.quests\.frostholmBoss=true/);
  assert.match(game, /state\.quests\.frostholmUnlocked=true/);
});

test("Frostholm unlock and save compatibility survive loading older Solaria saves", () => {
  assert.match(game, /frostholmUnlocked:false/);
  assert.match(game, /REGIONS\[2\]\.unlocked=!!state\.quests\.frostholmUnlocked/);
  assert.match(game, /if\(state\.quests\.solariaBoss\)state\.quests\.frostholmUnlocked=true/);
  assert.match(game, /d\.region>7/);
  assert.match(game, /d\.region===2&&!\["hamlet","pass","glacier","cavern","citadel"\]\.includes\(d\.area\)/);
});

test("Aetheria adds five connected floating-island areas and a separate movement route", () => {
  for (const name of ["Cloudrest Spire","Whispering Cloudway","Windward Isles","The Shattered Aeries","Elderlight Shrine"]) assert.ok(game.includes('name:"'+name+'"'));
  assert.match(game,/function setupAetheriaArea\(spawn\)/);
  assert.match(game,/function moveAetheria\(dx,dy\)/);
  assert.match(game,/if\(state\.region===3\)\{moveAetheria\(dx,dy\);return\}/);
});
test("Aetheria quest requires three shards and the Sky Sigil before its boss chamber", () => {
  assert.match(game,/name:"Cloud Sprite"/);
  assert.match(game,/name:"Storm Harpy"/);
  assert.match(game,/name:"Void Sentinel"/);
  assert.match(game,/state\.inventory\.aetherShard-=3/);
  assert.match(game,/state\.quests\.aetherGateOpen=true/);
  assert.match(game,/name:"Astral Warden"/);
  assert.match(game,/state\.quests\.aetheriaBoss=true/);
});
test("Aetheria progression unlocks after Frostholm and persists in local saves", () => {
  assert.match(game,/state\.quests\.frostholmBoss=true;state\.quests\.aetheriaUnlocked=true;REGIONS\[3\]\.unlocked=true/);
  assert.match(game,/d\.region>7/);
  assert.match(game,/d\.region===3&&!\["spire","cloudway","windward","lower","shrine"\]\.includes\(d\.area\)/);
  assert.match(game,/if\(state\.quests\.frostholmBoss\)state\.quests\.aetheriaUnlocked=true/);
});

test("Infernia adds five volcanic areas and its own connected movement routes", () => {
  for (const name of ["Cinderwatch","Emberwild","Ashen Caldera","Magma Tunnels","Infernal Keep"]) assert.ok(game.includes('name:"'+name+'"'));
  assert.ok(game.includes("function setupInferniaArea(spawn)"));
  assert.ok(game.includes("function moveInfernia(dx,dy)"));
  assert.ok(game.includes("if(state.region===4){moveInfernia(dx,dy);return}"));
  assert.ok(game.includes('state.area=i===1?"outpost":i===2?"hamlet":i===3?"spire":i===4?"cinderwatch":i===5?"port":i===6?"gloam":i===7?"starfall":"village";'));
});
test("Infernia quest uses Ember Hearts, a sealed keep and the Infernal Regent", () => {
  for (const name of ["Cinder Imp","Magma Hound","Basalt Brute","Infernal Regent"]) assert.ok(game.includes('name:"'+name+'"'));
  assert.ok(game.includes("state.inventory.emberHeart-=3"));
  assert.ok(game.includes("state.quests.inferniaGateOpen=true"));
  assert.ok(game.includes("hp:340,maxHp:340,atk:22"));
  assert.ok(game.includes("state.quests.inferniaBoss=true"));
});
test("Infernia unlocks after Aetheria and its new save area is validated", () => {
  assert.ok(game.includes("state.quests.aetheriaBoss=true;state.quests.inferniaUnlocked=true;REGIONS[4].unlocked=true"));
  assert.ok(game.includes("d.region>7"));
  assert.ok(game.includes('d.region===4&&!["cinderwatch","emberwild","caldera","tunnels","keep"].includes(d.area)'));
  assert.ok(game.includes("if(state.quests.aetheriaBoss)state.quests.inferniaUnlocked=true"));
});

test("Thalassia adds five island and underwater areas with connected routes", () => {
  for (const name of ["Tidecross Port","Coralway Atoll","Whispering Reef","The Drowned Galleon","Pearlheart Palace"]) assert.ok(game.includes('name:"'+name+'"'));
  assert.ok(game.includes("function setupThalassiaArea(spawn)"));
  assert.ok(game.includes("function moveThalassia(dx,dy)"));
  assert.ok(game.includes("if(state.region===5){moveThalassia(dx,dy);return}"));
  assert.ok(game.includes('state.area=i===1?"outpost":i===2?"hamlet":i===3?"spire":i===4?"cinderwatch":i===5?"port":i===6?"gloam":i===7?"starfall":"village";'));
  assert.ok(game.includes('clear(8,6,40,28);h(0,8,16);v(24,0,33)'));
});
test("Thalassia quest uses Tide Pearls, palace seal and the Leviathan", () => {
  for (const name of ["Reef Stalker","Abyssal Eel","Coral Guardian","Leviathan of the Deep"]) assert.ok(game.includes('name:"'+name+'"'));
  assert.ok(game.includes("state.inventory.tidePearl-=3"));
  assert.ok(game.includes("state.quests.thalassiaGateOpen=true"));
  assert.ok(game.includes("hp:380,maxHp:380,atk:24"));
  assert.ok(game.includes("state.quests.thalassiaBoss=true"));
});
test("Thalassia unlocks after Infernia and save migration validates its new areas", () => {
  assert.ok(game.includes("state.quests.inferniaBoss=true;state.quests.thalassiaUnlocked=true;REGIONS[5].unlocked=true"));
  assert.ok(game.includes("d.region>7"));
  assert.ok(game.includes('d.region===5&&!["port","coralway","reef","wreck","palace"].includes(d.area)'));
  assert.ok(game.includes("if(state.quests.inferniaBoss)state.quests.thalassiaUnlocked=true"));
});

test("Shadowmere adds five connected cursed areas and its own region movement", () => {
  for (const name of ["Gloam Village","Blackbriar Wood","Wraithfen Moor","Hollowmoon Crypt","Nightveil Citadel"]) assert.ok(game.includes('name:"'+name+'"'));
  assert.ok(game.includes("function setupShadowmereArea(spawn)"));
  assert.ok(game.includes("function moveShadowmere(dx,dy)"));
  assert.ok(game.includes("if(state.region===6){moveShadowmere(dx,dy);return}"));
  assert.ok(game.includes('state.area=i===1?"outpost":i===2?"hamlet":i===3?"spire":i===4?"cinderwatch":i===5?"port":i===6?"gloam":i===7?"starfall":"village";'));
  assert.ok(game.includes('clear(8,6,40,28);h(0,8,16);v(24,0,33)'));
});
test("Shadowmere quest requires Gloom Sigils and opens the Hollow King boss gate", () => {
  for (const name of ["Gloom Hound","Wisp Revenant","Crypt Knight","The Hollow King"]) assert.ok(game.includes('name:"'+name+'"'));
  assert.ok(game.includes("state.inventory.gloomSigil-=3"));
  assert.ok(game.includes("state.quests.shadowmereGateOpen=true"));
  assert.ok(game.includes("hp:430,maxHp:430,atk:27"));
  assert.ok(game.includes("state.quests.shadowmereBoss=true"));
});
test("Shadowmere unlocks after Thalassia and its save migration validates all new areas", () => {
  assert.ok(game.includes("state.quests.thalassiaBoss=true;state.quests.shadowmereUnlocked=true;REGIONS[6].unlocked=true"));
  assert.ok(game.includes("d.region>7"));
  assert.ok(game.includes('d.region===6&&!["gloam","blackwood","moor","crypt","citadel"].includes(d.area)'));
  assert.ok(game.includes("if(state.quests.thalassiaBoss)state.quests.shadowmereUnlocked=true"));
});

test("Celestia completes the eight-kingdom world with five distinct areas and movement", () => {
  for (const name of ["Starfall Citadel","Astral Gardens","Moonlit Observatory","Voidglass Sanctum","Zenith Throne"]) assert.ok(game.includes('name:"'+name+'"'));
  assert.ok(game.includes("function setupCelestiaArea(spawn)"));
  assert.ok(game.includes("function moveCelestia(dx,dy)"));
  assert.ok(game.includes("if(state.region===7){moveCelestia(dx,dy);return}"));
  assert.ok(game.includes('state.area=i===1?"outpost":i===2?"hamlet":i===3?"spire":i===4?"cinderwatch":i===5?"port":i===6?"gloam":i===7?"starfall":"village";'));
  assert.ok(game.includes('clear(8,6,40,28);h(0,8,16);v(24,0,33)'));
});
test("Celestia Starheart quest requires three Star Sigils and opens the Warden gate", () => {
  for (const name of ["Star Wisp","Astral Drake","Void Seraph","The Celestial Warden"]) assert.ok(game.includes('name:"'+name+'"'));
  assert.ok(game.includes("state.inventory.starSigil-=3"));
  assert.ok(game.includes("state.quests.celestiaGateOpen=true"));
  assert.ok(game.includes("hp:520,maxHp:520,atk:30"));
  assert.ok(game.includes("state.quests.celestiaBoss=true"));
});
test("Celestia unlocks after Shadowmere and final kingdom saves migrate correctly", () => {
  assert.ok(game.includes("state.quests.shadowmereBoss=true;state.quests.celestiaUnlocked=true;REGIONS[7].unlocked=true"));
  assert.ok(game.includes("d.region>7"));
  assert.ok(game.includes('d.region===7&&!["starfall","gardens","observatory","sanctum","zenith"].includes(d.area)'));
  assert.ok(game.includes("if(state.quests.shadowmereBoss)state.quests.celestiaUnlocked=true"));
});


test("day and night cycle renders atmospheric lighting and updates the world clock", () => {
  assert.match(game, /function getNightFactor\(\)/);
  assert.match(game, /function updateWorldClock\(\)/);
  assert.match(game, /rgba\(13,18,42,/);
  assert.match(game, /state\.frame%120===0\)updateWorldClock\(\)/);
  assert.match(game, /· DAWN|DAWN/);
});

test("night increases enemy awareness and danger while rest advances to dawn", () => {
  assert.match(game, /getNightFactor\(\)>.55\?10:8/);
  assert.match(game, /getNightFactor\(\)>.65\?2:0/);
  assert.match(game, /state\.worldMinutes=360/);
  assert.match(game, /You rest until dawn/);
});

test("world time persists without breaking existing version-2 saves", () => {
  assert.match(game, /worldMinutes:state\.worldMinutes/);
  assert.match(game, /state\.worldMinutes=Number\.isInteger\(d\.worldMinutes\).*:480/);
  assert.match(game, /d\.worldMinutes!==undefined/);
  assert.match(game, /state\.day=Number\.isInteger\(d\.day\)/);
});


test("six classes have distinct mana skills with role-specific reach and effects", () => { assert.match(game,/p\.class==="Mage"\?4:p\.class==="Archer"\?3:p\.class==="Ranger"\?3/); for(const skill of ["ARCANE BOLT","PIERCING SHOT","BACKSTAB","HUNTER VOLLEY","HOLY VIGOR","POWER STRIKE"]) assert.ok(game.includes(skill),"missing "+skill); assert.match(game,/p\.hp=Math\.min\(p\.maxHp,p\.hp\+18\)/); });

test("legendary endgame equipment has cross-kingdom recipes and crafting controls", () => { assert.match(game,/starforgedBlade:\{name:"Starforged Blade"/); assert.match(game,/eightfoldAegis:\{name:"Eightfold Aegis"/); assert.match(game,/starforgedBlade:\{cost:\{starSigil:3,gloomSigil:2,emberHeart:2,tidePearl:2\}\}/); assert.match(game,/eightfoldAegis:\{cost:\{starSigil:2,frostCore:3,aetherShard:2,tidePearl:2\}\}/); assert.match(game,/data-craft="starforgedBlade"/); assert.match(game,/data-craft="eightfoldAegis"/); });


test("all kingdom bosses transition into a telegraphed phase-two shockwave", () => {
  assert.match(game, /target\.boss&&target\.hp>0&&target\.hp<=target\.maxHp\/2&&target\.phase!==2/);
  assert.match(game, /e\.phase===2\?2:1/);
  assert.match(game, /e\.phase===2\?e\.atk\+6:e\.atk/);
  assert.match(game, /ultimate attack is charging/);
});

test("Forgotten Root secret vault opens from the inscription and rewards only once", () => {
  assert.match(game, /dungeonSecretOpen:false,dungeonCacheClaimed:false/);
  assert.match(game, /for\(let y=17;y<=26;y\+\+\)state\.grid\[y\]\[38\]=2/);
  assert.match(game, /state\.grid\[21\]\[38\]=0;state\.grid\[22\]\[38\]=0/);
  assert.match(game, /kind:"secretCache"/);
  assert.match(game, /state\.quests\.dungeonCacheClaimed=true/);
});


test("Starbound Keeper opens a persistent Starheart archive after the sigil turn-in", () => {
  assert.match(game, /name:"Starbound Keeper",kind:"starboundKeeper"/);
  assert.match(game, /state\.quests\.celestialVaultQuest=true/);
  assert.match(game, /state\.inventory\.starSigil-=3/);
  assert.match(game, /state\.quests\.celestialVaultOpen=true/);
  assert.match(game, /name:"Starheart Reliquary",kind:"starheartCache"/);
  assert.match(game, /state\.quests\.celestialVaultClaimed=true/);
  assert.match(game, /d\.quests\.celestialTrialWins/);
});

test("Celestial Warden echo challenge can be replayed and records victories in local saves", () => {
  assert.match(game, /state\.quests\.celestialTrialActive=true/);
  assert.match(game, /celestialEchoBoss:true/);
  assert.match(game, /state\.quests\.celestialTrialActive=false/);
  assert.match(game, /celestialTrialWins=\(state\.quests\.celestialTrialWins\|\|0\)\+1/);
  assert.match(game, /p\.coins\+=target\.celestialEchoBoss\?0:target\.boss\?100:5/);
  assert.match(game, /p\.coins\+=250\+Math\.min\(250,\(state\.quests\.celestialTrialWins-1\)\*50\);save\(\)/);
  assert.match(game, /celestialTrialActive:false,celestialTrialWins:0/);
});

test("new Celestia optional quest and trial fields validate without rejecting legacy saves", () => {
  assert.match(game, /typeof d\.quests\[key\]!=="boolean"/);
  assert.match(game, /celestialTrialWins>99999/);
  assert.match(game, /version:2,savedAt/);
});

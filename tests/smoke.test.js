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
  assert.match(game, /d\.region===2&&!\["hamlet","pass","glacier","cavern","citadel","frostvault"\]\.includes\(d\.area\)/);
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
  assert.match(game,/d\.region===3&&!\["spire","cloudway","windward","lower","shrine","skymaze"\]\.includes\(d\.area\)/);
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
  assert.ok(game.includes('d.region===4&&!["cinderwatch","emberwild","caldera","tunnels","keep","emberforge"].includes(d.area)'));
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
  assert.ok(game.includes('d.region===5&&!["port","coralway","reef","wreck","palace","tidearchive"].includes(d.area)'));
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
  assert.ok(game.includes('d.region===6&&!["gloam","blackwood","moor","crypt","citadel","gloomcatacomb"].includes(d.area)'));
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
  assert.ok(game.includes("state.quests.shadowmereBoss=true;state.quests.shadowVaultOpen=true;state.quests.celestiaUnlocked=true;save();REGIONS[7].unlocked=true"));
  assert.ok(game.includes("d.region>7"));
  assert.ok(game.includes('d.region===7&&!["starfall","gardens","observatory","sanctum","zenith","astralmaze"].includes(d.area)'));
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
  assert.match(game, /expRunes1:0,expRunes2:0,expRunes3:0/);
  assert.match(game, /\.\.\.\(d\.quests\|\|\{\}\)/);
});

test("Hollow King victory opens a persistent secret reserve in Hollowmoon Crypt", () => {
  assert.match(game, /state\.quests\.shadowVaultOpen=true/);
  assert.match(game, /clear\(35,19,43,27\)/);
  assert.match(game, /state\.grid\[23\]\[34\]=0/);
  assert.match(game, /name:"Wraithbound Reliquary",kind:"shadowVaultCache"/);
  assert.match(game, /state\.quests\.shadowVaultClaimed=true/);
  assert.match(game, /state\.player\.coins\+=700/);
  assert.match(game, /addItem\("gloomSigil",4\)/);
  assert.match(game, /gainXP\(500\)/);
});
test("Shadowmere secret vault flags are validated and migrated in existing local saves", () => {
  assert.match(game, /shadowVaultOpen:false,shadowVaultClaimed:false/);
  assert.match(game, /"shadowVaultOpen","shadowVaultClaimed"/);
  assert.match(game, /state\.quests\.shadowVaultOpen=true;state\.quests\.celestiaUnlocked=true/);
});


test("Greenvale expands into two connected dungeon floors without adding kingdoms", () => {
  for (const area of ["rootdepths", "rootcore"]) assert.ok(game.includes(area));
  assert.ok(game.includes('name:"Rootbound Depths"'));
  assert.ok(game.includes('name:"Heart of the Roots"'));
  assert.ok(game.includes('next="rootdepths"'));
  assert.ok(game.includes('next="rootcore"'));
  assert.match(game, /d\.region===0&&!\["village","meadow","woods","mine","dungeon","rootdepths","rootcore"\]\.includes\(d\.area\)/);
  assert.match(game, /d\.region>7/);
});
test("Rootbound Depths pressure plate opens the bridge and the tablet reveals a one-time cache", () => {
  assert.match(game, /kind:"depthSwitch"/);
  assert.match(game, /state\.quests\.dungeonDepthsSwitch=true/);
  assert.match(game, /state\.grid\[16\]\[x\]=0/);
  assert.match(game, /kind:"depthInscription"/);
  assert.match(game, /state\.quests\.dungeonCoreCacheOpen=true/);
  assert.match(game, /state\.quests\.dungeonCoreCacheClaimed=true/);
});
test("The Thornbound Matriarch unlocks the Heartseal and the Heartroot Colossus", () => {
  assert.match(game, /name:"Thornbound Matriarch",x:24,y:11,hp:235/);
  assert.match(game, /state\.quests\.dungeonDepthsBoss=true/);
  assert.match(game, /kind:"coreSwitch"/);
  assert.match(game, /state\.quests\.dungeonCoreSeal=true/);
  assert.match(game, /state\.enemies\.push\(\{name:"Heartroot Colossus"/);
  assert.match(game, /name:"Heartroot Colossus",x:24,y:10,hp:310/);
  assert.match(game, /state\.quests\.dungeonCoreBoss=true/);
  assert.match(game, /target\.name==="Thornbound Matriarch"\|\|target\.name==="Heartroot Colossus"/);
});
test("New dungeon progression and rewards remain backward-compatible with version-2 local saves", () => {
  for (const flag of ["dungeonDepthsSwitch","dungeonCoreSeal","dungeonDepthsBoss","dungeonCoreBoss","dungeonCoreCacheOpen","dungeonCoreCacheClaimed"]) assert.ok(game.includes(flag));
  assert.match(game, /version:2,savedAt/);
  assert.match(game, /dungeonDepthsSwitch.*dungeonCoreSeal.*dungeonDepthsBoss/s);
});


test("Six kingdom side dungeons and the Celestia endgame labyrinth are registered", () => {
  for (const area of ["suncrypt","frostvault","skymaze","emberforge","tidearchive","gloomcatacomb","astralmaze"]) assert.ok(game.includes(area));
  assert.ok(game.includes("Tomb of the Sun"));
  assert.ok(game.includes("The Sevenfold Orrery"));
  assert.ok(game.includes("EXP_DUNGEONS"));
});
test("Every expansion dungeon has a return sigil, unique puzzle text and a regional boss", () => {
  assert.match(game, /kind:"expDungeonExit"/);
  assert.match(game, /kind:"expDungeonRune"/);
  assert.match(game, /EXP_PUZZLE_ORDER/);
  assert.match(game, /EXP_RUNE_NAMES/);
  for (const device of ["Sun Mirror","Frost Rune","Sky Anchor","Ember Valve","Tide Valve","Veil Lantern","Star Mark"]) assert.ok(game.includes(device));
  assert.match(game, /state\.quests\[progressKey\]=progress\+1/);
  assert.match(game, /Wrong rune order\. The sequence resets/);
  assert.match(game, /function applyExpansionHazard/);
  assert.match(game, /EXP_PUZZLES/);
  assert.match(game, /expansionBoss:true/);
  assert.match(game, /target\.expansionBoss/);
});
test("Expansion dungeon access and completion flags are stored without changing the eight-region limit", () => {
  for (const flag of ["expPuzzle1","expPuzzle2","expPuzzle3","expPuzzle4","expPuzzle5","expPuzzle6","expPuzzle7","expBoss1","expBoss2","expBoss3","expBoss4","expBoss5","expBoss6","expBoss7","expRunes1","expRunes2","expRunes3","expRunes4","expRunes5","expRunes6","expRunes7"]) assert.ok(game.includes(flag));
  assert.match(game, /d\.region>7/);
  assert.match(game, /version:2,savedAt/);
});

 
test("Adventurer Codex adds a sixth tab and quest, bestiary, achievement and collection views", () => {
  assert.match(html, /data-tab="codex"/);
  for (const view of ["quests","bestiary","achievements","collection"]) assert.ok(game.includes('data-codex-view="'+view+'"'));
  assert.match(game, /function renderCodex\(\)/);
  assert.match(game, /data-quest-filter="active"/);
  assert.match(game, /data-quest-filter="completed"/);
  assert.match(game, /data-track-quest=/);
});
 
test("Tracked quest objectives render map markers and the bestiary records visible and defeated enemies", () => {
  assert.match(game, /function drawQuestMarker\(camX,camY\)/);
  assert.match(game, /drawQuestMarker\(camX,camY\)/);
  assert.match(game, /recordEnemySeen\(e\)/);
  assert.match(game, /state\.codex\.bestiary\[target\.name\]\.defeated/);
});
 
test("Codex achievements and item collection persist in compatible version-2 saves", () => {
  assert.match(game, /codex:\{view:state\.codex\.view/);
  assert.match(game, /state\.codex=\{view:"quests",questFilter:"active"/);
  assert.match(game, /function validSaveData\(d\)\{if\(d&&d\.codex!==undefined\)/);
  assert.match(game, /state\.codex\.collection\[id\]=/);
  assert.match(game, /function evaluateAchievements\(\)/);
  assert.match(game, /version:2,savedAt/);
});
 
test("Codex styles remain responsive and the service worker cache is refreshed", () => {
  assert.match(css, /\.codex-nav/);
  assert.match(css, /@media\(max-width:480px\)\{\.tabbar\{grid-template-columns:repeat\(3/);
  assert.ok(worker.includes("eight-bit-rpg-v30"));
});

 
test("Codex collection also discovers rewards added by legacy quest and NPC reward paths", () => {
  assert.match(game, /function updateUI\(\)\{Object\.entries\(state\.inventory\)/);
  assert.match(game, /done:\(\)=>state\.quests\.slimes==="claimed"/);
});

 
test("Eight realm companions are added in their home kingdom hubs", () => {
  assert.match(game, /const COMPANIONS=\[/);
  assert.equal((game.match(/id:"(?:talia|rafi|brin|nima|korr|sela|nyx|elara)"/g)||[]).length, 8);
  assert.match(game, /function attachRealmCompanion\(\)/);
  assert.match(game, /kind:"realmCompanion"/);
  assert.equal((game.match(/attachRealmCompanion\(\);return/g)||[]).length, 7);
  assert.match(game, /if\(area==="village"\)attachRealmCompanion\(\)/);
});
 
test("Companion dialogue supports trust, side-story delivery, recruitment and dismissal", () => {
  for (const id of ["bondStory","bondQuest","bondTurnIn","bondRecruit","bondDismiss"]) assert.match(game, new RegExp('id="'+id+'"'));
  assert.match(game, /function handleRealmCompanion\(npc\)/);
  assert.match(game, /function drawCompanionFollower\(camX,camY\)/);
  assert.match(game, /drawCompanionFollower\(camX,camY\)/);
});
 
test("Companion side stories appear in the Codex and persist in version-2 saves", () => {
  assert.match(game, /id:"bond-"\+c\.id/);
  assert.match(game, /data-codex-view="bonds"/);
  assert.match(game, /companions:\{active:state\.companions\.active,records:/);
  assert.match(game, /state\.companions=\{active:"",records:/);
  assert.match(game, /function validSaveData\(d\)\{if\(d&&d\.codex!==undefined\)/);
  assert.ok(/eight-bit-rpg-v\\d+/.test(worker));
  assert.match(css, /\.bond-choice/);
});


test("Empty save slots show NEW GAME without a disabled CONTINUE button", () => {
  assert.ok(game.includes('if(data){const loadButton=document.createElement("button");loadButton.type="button";loadButton.textContent="CONTINUE"'));
  assert.ok(game.includes('newButton.textContent=data?"REPLACE":"NEW GAME"'));
  assert.ok(game.includes('newButton.onclick=()=>newGameInSlot(slot)'));
});

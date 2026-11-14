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
  assert.match(game, /state\.area=AREAS\[d\.area\]\?d\.area:"village"/);
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
  assert.match(game, /damageEnemy\(target,p\.attack\*2\+6,true\)/);
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
  assert.match(game, /ROOTBOUND GUARDIAN: a crushing strike is coming/);
  assert.match(game, /e\.hp<=e\.maxHp\/2\?18:12/);
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
  assert.match(game, /drop:"copper"\}\];/);
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

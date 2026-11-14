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

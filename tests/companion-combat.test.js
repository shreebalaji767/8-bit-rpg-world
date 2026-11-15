"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const game = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("all eight companions define a distinct combat role and ability", () => {
  const roles = [...game.matchAll(/role:"(healer|ranged|guard|mana|heavy|support|swift|arcane)",abilityName:"([^"]+)",abilityDesc:"([^"]+)"/g)];
  assert.equal(roles.length, 8);
  assert.equal(new Set(roles.map(([, role]) => role)).size, 8);
  for (const [, , name, description] of roles) {
    assert.ok(name.length > 2);
    assert.ok(description.length > 20);
  }
});

test("companion support is automatic and rate-limited", () => {
  assert.match(game, /function companionCombatSupport\(\)/);
  assert.match(game, /state\.frame%84!==0/);
  assert.match(game, /companionCombatSupport\(\);let respawned=false/);
});

test("healing and mana support cannot exceed player maximums", () => {
  assert.match(game, /Math\.min\(p\.maxHp-p\.hp,3\+Math\.floor\(p\.level\/10\)\+rank\*2/);
  assert.match(game, /Math\.min\(p\.maxMp-p\.mp,2\+rank/);
  assert.match(game, /Math\.min\(p\.maxHp-p\.hp,2\+rank/);
  assert.match(game, /Math\.min\(p\.maxMp-p\.mp,1\+Math\.floor\(rank\/2\)/);
});

test("Brin provides damage reduction without making damage negative", () => {
  assert.match(game, /state\.companions\.active==="brin"\?3:0/);
  assert.match(game, /Math\.max\(1,baseAttack-p\.defence-guard\)/);
});

test("companion strikes use the normal enemy defeat and reward pipeline", () => {
  assert.match(game, /damageEnemy\(target,damage,true,c\.name\)/);
  assert.match(game, /function damageEnemy\(target,dmg,strong=false,attacker="You"\)/);
  assert.match(game, /showToast\(attacker\+" hit "\+target\.name/);
});

test("recruited companion ability is explained in dialogue and Bonds Codex", () => {
  assert.match(game, /COMBAT SKILL · '\+c\.abilityName/);
  assert.match(game, /COMBAT · '\+c\.abilityName/);
});

test("companion combat update preserves version-2 save keys and companion records", () => {
  assert.match(game, /const SAVE_KEY="eightBitRpgSaveV2_slot_"/);
  assert.match(game, /version:2/);
  assert.match(game, /companions:\{active:state\.companions\.active,tactic:state\.companions\.tactic/);
});


test("companion progression is persisted without changing save version 2", () => {
  assert.match(game, /companionLevelNeed\(level\)/);
  assert.match(game, /function companionXP\(amount\)/);
  assert.match(game, /skillPoints\+\+/);
  assert.match(game, /tactic:state\.companions\.tactic/);
  assert.match(game, /skills:\{\.\.\.\(r\.skills\|\|\{\}\)\}/);
  assert.match(game, /gear:\{\.\.\.\(r\.gear\|\|\{\}\)\}/);
  assert.match(game, /version:2/);
});
test("party tactics and skill ranks affect companion combat support", () => {
  assert.match(game, /tactic==="aggressive"\?3:0/);
  assert.match(game, /tactic==="support"\?2:0/);
  assert.match(game, /rank\*2/);
  assert.match(game, /state\.companions\.tactic==="defensive"/);
});
test("party screen exposes loadouts, tactics and skill upgrades", () => {
  assert.match(game, /function renderParty\(\)/);
  assert.match(game, /data-party-gear/);
  assert.match(game, /data-party-tactic/);
  assert.match(game, /data-party-skill/);
  assert.match(html, /data-tab="party"/);
  assert.match(game, /companionXP\(1\)/);
});
test("companion save validation bounds progression fields", () => {
  assert.match(game, /r\.level>20/);
  assert.match(game, /r\.skillPoints>100/);
  assert.match(game, /r\.xp>999999/);
});


test("all-eight companion milestones award Codex achievements", () => {
  assert.match(game, /id:"companion_recruit_all"/);
  assert.match(game, /id:"companion_stories"/);
  assert.match(game, /r\.recruited=true/);
  assert.match(game, /r\.level>=3&&state\.region===c\.region&&!r\.homecomingSeen/);
  assert.match(game, /Trust \+1 · \+50 gold/);
});

test("landing page is the initial entry point with a Play button", () => {
  assert.match(html, /id="landingPage"/);
  assert.match(html, /id="playButton"/);
  assert.match(game, /function init\(\)\{const loaded=load\(\);state\.hasSave=loaded;if\(loaded\)\{setupArea/);
  assert.match(game, /if\(!state.started\|\|state.paused\)/);
});

test("pause, resume and exit controls are wired and freeze game updates", () => {
  assert.match(html, /id="pauseButton"/);
  assert.match(html, /id="resumeButton"/);
  assert.match(html, /id="exitButton"/);
  assert.match(game, /function pauseGame\(\)/);
  assert.match(game, /function resumeGame\(\)/);
  assert.match(game, /function exitToTitle\(\)/);
  assert.match(game, /save\(\);state.started=false/);
  assert.match(game, /if\(state.paused\)resumeGame\(\);else pauseGame\(\)/);
});

test("retro-modern theme and mobile layout are present", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  assert.match(css, /--bg:#111827/);
  assert.match(css, /pixel-showcase/);
  assert.match(css, /@media\(max-width:680px\)/);
});

test("title menu exposes save slots, settings, controls and credits", () => {
  assert.match(html, /id="titleSlots"/);
  for (const id of ["newGameButton","settingsButton","controlsButton","creditsButton"]) assert.match(html, new RegExp('id="'+id+'"'));
  assert.match(game, /function renderTitleSlots\(\)/);
  assert.match(game, /function continueInSlot\(slot\)/);
  assert.match(game, /function continueLatest\(\)/);
});
test("new-game slot replacement requires confirmation and preserves other slots", () => {
  assert.match(game, /function newGameInSlot\(slot\)/);
  assert.match(game, /window\.confirm\("Replace the existing save in Slot "/);
  assert.match(game, /localStorage\.removeItem\(SAVE_KEY\+slot\)/);
  assert.match(game, /eightBitRpgActiveSlot/);
  assert.match(game, /eightBitRpgStartNew/);
  assert.match(game, /const SAVE_KEY="eightBitRpgSaveV2_slot_"/);
  assert.match(game, /version:2/);
});
test("title settings persist sound and reduced-motion preferences separately from game saves", () => {
  assert.match(game, /function openTitleSettings\(\)/);
  assert.match(game, /eightBitRpgSettingsV1/);
  assert.match(game, /document\.body\.classList\.toggle\("reduce-motion"/);
  assert.match(css, /body\.reduce-motion/);
});
test("title slot cards only enable continue for validated local saves", () => {
  assert.match(game, /function titleSaveData\(slot\)/);
  assert.match(game, /return validSaveData\(data\)\?data:null/);
  assert.match(game, /loadButton\.disabled=!data/);
});

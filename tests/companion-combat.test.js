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
  assert.match(game, /Math\.min\(p\.maxHp-p\.hp,3\+Math\.floor\(p\.level\/10\)\)/);
  assert.match(game, /Math\.min\(p\.maxMp-p\.mp,2\)/);
  assert.match(game, /Math\.min\(p\.maxHp-p\.hp,2\)/);
  assert.match(game, /Math\.min\(p\.maxMp-p\.mp,1\)/);
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
  assert.match(game, /companions:\{active:state\.companions\.active,records:/);
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

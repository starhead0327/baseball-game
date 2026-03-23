const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const enginePath = path.join(__dirname, 'pitcher_career_engine.js');
const code = fs.readFileSync(enginePath, 'utf8');
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.runInNewContext(code, sandbox);

const Engine = sandbox.PitcherCareerEngine;

function makeState(){
  return Engine.normalizeGameState({
    inning:1,
    outs:0,
    balls:0,
    strikes:0,
    runs:0,
    faced:1,
    bases:[false, false, false],
    runners:[null, null, null],
    runnerSpeeds:[null, null, null],
    pickoff_attempts:[0, 0, 0],
    pitchHistory:[]
  });
}

function withRandom(values){
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return value;
  };
}

{
  const state = makeState();
  state.runners = [{ speed:'MID', name:'RunnerA' }, { speed:'LOW', name:'RunnerB' }, null];
  Engine.syncBases(state);
  const walk = Engine.forceWalk(state, { name:'Batter', speed:'HIGH' });
  assert.strictEqual(walk.runs, 0);
  assert.deepStrictEqual(state.runners.map(r => r?.name || null), ['Batter', 'RunnerA', 'RunnerB']);
}

{
  const state = makeState();
  state.runners = [null, null, { speed:'MID', name:'ThirdRunner' }];
  Engine.syncBases(state);
  const result = Engine.resolvePickoff(state, withRandom([0.99, 0.10]));
  assert.strictEqual(result.runs, 1);
  assert.deepStrictEqual(state.bases, [false, false, false]);
}

{
  const state = makeState();
  state.runners = [{ speed:'MID', name:'FirstRunner' }, { speed:'LOW', name:'SecondRunner' }, null];
  Engine.syncBases(state);
  const result = Engine.resolvePickoff(state, withRandom([0.99, 0.10]));
  assert.strictEqual(result.runs, 0);
  assert.deepStrictEqual(state.bases, [true, false, true]);
}

{
  const state = makeState();
  state.runners = [null, null, { speed:'HIGH', name:'TagRunner' }];
  Engine.syncBases(state);
  const fly = Engine.resolveFlyout(state, withRandom([0.1]));
  assert.strictEqual(fly.runs, 1);
  assert.deepStrictEqual(state.bases, [false, false, false]);
}

{
  const state = makeState();
  state.runners = [{ speed:'HIGH', name:'Stealer', aggression:0.9, iq:0.7, steal:0.85 }, null, null];
  Engine.syncBases(state);
  const steal = Engine.resolveSteal(state, {
    balls:2,
    strikes:1,
    pitchKind:'breaking',
    pitcherHand:'우투',
    pickoffPressure:0
  }, withRandom([0.01, 0.01]));
  assert.strictEqual(steal.attempted, true);
  assert.strictEqual(steal.success, true);
  assert.deepStrictEqual(state.bases, [false, true, false]);
}

{
  const state = makeState();
  state.selectedZone = 4;
  state.pitchHistory = [
    { pitchKey:'1', kind:'fastball', targetZone:4, actualZone:4, code:'called_k' },
    { pitchKey:'1', kind:'fastball', targetZone:4, actualZone:4, code:'foul' }
  ];
  const seq = Engine.getPitchSequencing(state, '1');
  assert.ok(seq.whiff < 1);
  assert.ok(seq.damage > 1);
}

{
  const auto = Engine.simulateAutoHalfInning({
    offenseRating:1.1,
    preventionRating:0.95
  }, withRandom([0.05, 0.2, 0.9, 0.9, 0.9, 0.9]));
  assert.ok(auto.runs >= 0);
  assert.ok(typeof auto.summary === 'string');
}

console.log('pitcher_career_engine tests passed');

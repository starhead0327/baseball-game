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

console.log('pitcher_career_engine tests passed');

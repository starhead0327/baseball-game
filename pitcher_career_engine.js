(function(global){
  const SPEED_SCORE = { LOW:-0.12, MID:0, HIGH:0.14 };

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function cloneRunner(runner){
    return runner ? { ...runner } : null;
  }

  function syncBases(state){
    state.bases = state.runners.map(Boolean);
    return state;
  }

  function normalizeRunner(index, runner, legacyBases, legacySpeeds){
    if(runner && typeof runner === 'object'){
      return {
        speed: runner.speed || 'MID',
        name: runner.name || `주자 ${index + 1}`,
        archetype: runner.archetype || 'legacy'
      };
    }
    if(legacyBases[index]){
      return {
        speed: legacySpeeds[index] || 'MID',
        name:`레거시 주자 ${index + 1}`,
        archetype:'legacy'
      };
    }
    return null;
  }

  function normalizeGameState(gameState){
    if(!gameState) return null;
    const legacyBases = Array.isArray(gameState.bases) ? gameState.bases.slice(0, 3).map(Boolean) : [false, false, false];
    const legacySpeeds = Array.isArray(gameState.runnerSpeeds) ? gameState.runnerSpeeds.slice(0, 3) : [null, null, null];
    const runners = Array.isArray(gameState.runners)
      ? [0, 1, 2].map(index => normalizeRunner(index, gameState.runners[index], legacyBases, legacySpeeds))
      : [0, 1, 2].map(index => normalizeRunner(index, null, legacyBases, legacySpeeds));
    return {
      ...gameState,
      runners,
      bases:runners.map(Boolean),
      runnerSpeeds:runners.map(runner => runner ? runner.speed : null),
      pickoff_attempts:Array.isArray(gameState.pickoff_attempts)
        ? gameState.pickoff_attempts.slice(0, 3).map(value => Number(value) || 0)
        : [0, 0, 0],
      actionCount:Number(gameState.actionCount) || 0,
      pitchHistory:Array.isArray(gameState.pitchHistory) ? gameState.pitchHistory.slice(-8) : []
    };
  }

  function createRunnerFromBatter(batter){
    return {
      speed:batter?.speed || 'MID',
      name:batter?.name || '주자',
      archetype:batter?.name || '타자'
    };
  }

  function speedAdjustment(speed){
    return SPEED_SCORE[speed] || 0;
  }

  function moveRunnerOneBase(state, baseIndex){
    const runner = cloneRunner(state.runners[baseIndex]);
    if(!runner) return { runs:0, moved:false };
    state.runners[baseIndex] = null;
    if(baseIndex === 2){
      syncBases(state);
      return { runs:1, moved:true };
    }
    if(state.runners[baseIndex + 1]){
      state.runners[baseIndex] = runner;
      syncBases(state);
      return { runs:0, moved:false };
    }
    state.runners[baseIndex + 1] = runner;
    syncBases(state);
    return { runs:0, moved:true };
  }

  function forceWalk(state, batter){
    const incoming = createRunnerFromBatter(batter);
    let runs = 0;
    const next = state.runners.map(cloneRunner);
    if(next[0]){
      if(next[1]){
        if(next[2]){
          runs += 1;
        }
        next[2] = next[1];
      }
      next[1] = next[0];
    }
    next[0] = incoming;
    state.runners = next;
    syncBases(state);
    state.runnerSpeeds = state.runners.map(runner => runner ? runner.speed : null);
    return {
      runs,
      msg:runs ? '볼넷! 만루 밀어내기 실점.' : '볼넷! 타자 1루 출루.'
    };
  }

  function scoreRunner(state, baseIndex){
    if(!state.runners[baseIndex]) return 0;
    state.runners[baseIndex] = null;
    return 1;
  }

  function resolveSingle(state, batter, rng){
    const next = [null, null, null];
    let runs = 0;
    if(state.runners[2]) runs += scoreRunner(state, 2);
    if(state.runners[1]){
      const runner = cloneRunner(state.runners[1]);
      const scoreChance = clamp(0.56 + speedAdjustment(runner.speed), 0.26, 0.86);
      if(rng() < scoreChance) runs += scoreRunner(state, 1);
      else next[2] = runner;
    }
    if(state.runners[0]){
      const runner = cloneRunner(state.runners[0]);
      const thirdChance = clamp(0.28 + speedAdjustment(runner.speed), 0.10, 0.52);
      if(rng() < thirdChance) next[2] = runner;
      else next[1] = runner;
    }
    next[0] = createRunnerFromBatter(batter);
    state.runners = next;
    syncBases(state);
    state.runnerSpeeds = state.runners.map(runner => runner ? runner.speed : null);
    return runs;
  }

  function resolveDouble(state, batter, rng){
    const next = [null, null, null];
    let runs = 0;
    if(state.runners[2]) runs += scoreRunner(state, 2);
    if(state.runners[1]) runs += scoreRunner(state, 1);
    if(state.runners[0]){
      const runner = cloneRunner(state.runners[0]);
      const scoreChance = clamp(0.48 + speedAdjustment(runner.speed), 0.22, 0.78);
      if(rng() < scoreChance) runs += scoreRunner(state, 0);
      else next[2] = runner;
    }
    next[1] = createRunnerFromBatter(batter);
    state.runners = next;
    syncBases(state);
    state.runnerSpeeds = state.runners.map(runner => runner ? runner.speed : null);
    return runs;
  }

  function resolveHomer(state){
    let runs = 1;
    for(let i = 0; i < 3; i++){
      if(state.runners[i]) runs += 1;
    }
    state.runners = [null, null, null];
    syncBases(state);
    state.runnerSpeeds = [null, null, null];
    return runs;
  }

  function resolveHit(state, code, batter, rng){
    if(code === 'homerun') return resolveHomer(state);
    if(code === 'double') return resolveDouble(state, batter, rng);
    return resolveSingle(state, batter, rng);
  }

  function resolveGroundout(state, rng){
    let outsAdded = 1;
    let runs = 0;
    let sub = '내야수가 잡아냈다.';
    let logSuffix = '땅볼 아웃';
    if(state.outs <= 1 && state.runners[0]){
      const firstRunner = state.runners[0];
      const dpChance = clamp(0.38 - speedAdjustment(firstRunner.speed), 0.16, 0.55);
      if(rng() < dpChance){
        outsAdded = 2;
        state.runners[0] = null;
        sub = '병살 처리로 순식간에 아웃 두 개를 잡았다.';
        logSuffix = '병살타';
      }
    } else if(state.outs < 2 && state.runners[2]){
      const tagChance = clamp(0.14 + speedAdjustment(state.runners[2].speed), 0.06, 0.28);
      if(rng() < tagChance){
        runs += 1;
        state.runners[2] = null;
        sub = '느린 땅볼 사이 3루 주자가 홈을 밟았다.';
        logSuffix = '땅볼 타점';
      }
    }
    syncBases(state);
    state.runnerSpeeds = state.runners.map(runner => runner ? runner.speed : null);
    return { outsAdded, runs, sub, logSuffix };
  }

  function resolveFlyout(state, rng){
    let runs = 0;
    let sub = '외야수가 처리했다.';
    let logSuffix = '뜬공 아웃';
    if(state.outs < 2 && state.runners[2]){
      const sacChance = clamp(0.34 + speedAdjustment(state.runners[2].speed), 0.16, 0.58);
      if(rng() < sacChance){
        runs += 1;
        state.runners[2] = null;
        sub = '희생플라이로 3루 주자가 태그업했다.';
        logSuffix = '희생플라이';
      }
    }
    syncBases(state);
    state.runnerSpeeds = state.runners.map(runner => runner ? runner.speed : null);
    return { outsAdded:1, runs, sub, logSuffix };
  }

  function getPickoffTargetBase(state){
    if(state.runners[2]) return 3;
    if(state.runners[1]) return 2;
    if(state.runners[0]) return 1;
    return -1;
  }

  function resolvePickoff(state, rng){
    const targetBase = getPickoffTargetBase(state);
    if(targetBase === -1){
      return { msg:'견제할 주자가 없습니다.', sub:'주자가 없어서 견제가 무의미했다.', log:'주자 없음', tone:'neut' };
    }
    const targetIndex = targetBase - 1;
    state.pickoff_attempts[targetIndex] = (state.pickoff_attempts[targetIndex] || 0) + 1;
    let successChance = targetBase === 1 ? 0.04 : targetBase === 2 ? 0.02 : 0.01;
    const runner = state.runners[targetIndex];
    const speed = runner?.speed || 'MID';
    if(speed === 'HIGH') successChance *= 0.6;
    else if(speed === 'LOW') successChance *= 1.5;
    if(state.pickoff_attempts[targetIndex] >= 2) successChance *= 0.5;
    if(state.balls >= 3) successChance *= 1.3;
    if(state.runners.every(Boolean)) successChance *= 0.7;
    if(state.faced <= 3) successChance *= 0.8;
    if(rng() < successChance){
      state.runners[targetIndex] = null;
      syncBases(state);
      state.runnerSpeeds = state.runners.map(item => item ? item.speed : null);
      return {
        success:true,
        runs:0,
        outsAdded:1,
        msg:`${targetBase}루 견제 아웃!`,
        sub:'주자를 완전히 속였다.',
        log:`${targetBase}루 견제 성공`,
        tone:'good'
      };
    }
    if(rng() < 0.15){
      const move = moveRunnerOneBase(state, targetIndex);
      state.runnerSpeeds = state.runners.map(item => item ? item.speed : null);
      return {
        success:false,
        runs:move.runs,
        outsAdded:0,
        msg:`${targetBase}루 견제 폭투`,
        sub:move.runs ? '악송구로 주자가 홈까지 들어왔다.' : (move.moved ? '악송구로 해당 주자가 한 베이스 진루했다.' : '악송구였지만 주자가 더 움직이진 못했다.'),
        log:`${targetBase}루 견제 폭투${move.runs ? ' · 실점' : ''}`,
        tone:move.runs ? 'bad' : 'neut'
      };
    }
    return {
      success:false,
      runs:0,
      outsAdded:0,
      msg:`${targetBase}루 견제`,
      sub:'주자가 침착하게 귀루했다.',
      log:`${targetBase}루 견제 귀루`,
      tone:'neut'
    };
  }

  function getPitchSequencing(state, pitchKey){
    const history = Array.isArray(state.pitchHistory) ? state.pitchHistory.slice(-4) : [];
    let consecutive = 0;
    for(let i = history.length - 1; i >= 0; i--){
      if(history[i].pitchKey === pitchKey) consecutive++;
      else break;
    }
    const recentUsage = history.filter(item => item.pitchKey === pitchKey).length;
    const previous = history[history.length - 1];
    let whiff = 1;
    let damage = 1;
    let chase = 1;
    if(consecutive >= 2){
      whiff *= 0.84;
      damage *= 1.16;
    } else if(consecutive === 1){
      whiff *= 0.93;
      damage *= 1.07;
    }
    if(recentUsage >= 3){
      whiff *= 0.92;
      damage *= 1.08;
    }
    if(previous){
      if(previous.kind === 'fastball' && pitchKey !== previous.pitchKey){
        whiff *= 1.08;
        chase *= 1.05;
      } else if(previous.kind !== 'fastball' && pitchKey === '1'){
        whiff *= 1.05;
      }
      if(previous.targetZone === previous.actualZone && previous.actualZone === state.selectedZone){
        damage *= 1.05;
      }
    }
    return { whiff, damage, chase };
  }

  function getFatigueModifiers(state){
    const staminaPct = state.maxStamina ? state.stamina / state.maxStamina : 1;
    if(staminaPct >= 0.72) return { whiff:1, damage:1, command:1 };
    if(staminaPct <= 0.2) return { whiff:0.82, damage:1.18, command:0.84 };
    const t = (staminaPct - 0.2) / 0.52;
    return {
      whiff:0.82 + (0.18 * t),
      damage:1.18 - (0.18 * t),
      command:0.84 + (0.16 * t)
    };
  }

  function recordPitchHistory(state, entry){
    state.pitchHistory = [...(state.pitchHistory || []), entry].slice(-8);
  }

  global.PitcherCareerEngine = {
    normalizeGameState,
    syncBases,
    forceWalk,
    resolveHit,
    resolveGroundout,
    resolveFlyout,
    resolvePickoff,
    getPitchSequencing,
    getFatigueModifiers,
    recordPitchHistory
  };
})(typeof window !== 'undefined' ? window : globalThis);

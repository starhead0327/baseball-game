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
        archetype: runner.archetype || 'legacy',
        aggression:runner.aggression ?? 0.45,
        iq:runner.iq ?? 0.60,
        steal:runner.steal ?? 0.35
      };
    }
    if(legacyBases[index]){
      return {
        speed: legacySpeeds[index] || 'MID',
        name:`레거시 주자 ${index + 1}`,
        archetype:'legacy',
        aggression:0.45,
        iq:0.60,
        steal:0.35
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
      archetype:batter?.name || '타자',
      aggression:batter?.aggression ?? 0.45,
      iq:batter?.iq ?? 0.60,
      steal:batter?.steal ?? 0.35
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
      const scoreChance = clamp(0.46 + speedAdjustment(runner.speed) + ((runner.aggression || 0.45) * 0.18) + ((runner.iq || 0.6) * 0.12), 0.24, 0.88);
      if(rng() < scoreChance) runs += scoreRunner(state, 1);
      else next[2] = runner;
    }
    if(state.runners[0]){
      const runner = cloneRunner(state.runners[0]);
      const thirdChance = clamp(0.20 + speedAdjustment(runner.speed) + ((runner.aggression || 0.45) * 0.18) + ((runner.iq || 0.6) * 0.10), 0.08, 0.62);
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
      const scoreChance = clamp(0.40 + speedAdjustment(runner.speed) + ((runner.aggression || 0.45) * 0.14) + ((runner.iq || 0.6) * 0.10), 0.18, 0.84);
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
    if(state.outs < 2 && state.runners[2] && !state.runners[0]){
      const homePlay = clamp(0.42 - speedAdjustment(state.runners[2].speed), 0.18, 0.58);
      if(rng() < homePlay){
        state.runners[2] = null;
        sub = '내야가 홈 승부를 택해 3루 주자를 잡았다.';
        logSuffix = '홈 승부';
      } else {
        runs += 1;
        state.runners[2] = null;
        sub = '1루 아웃과 맞바꿔 3루 주자의 득점을 허용했다.';
        logSuffix = '타점 땅볼';
      }
    } else if(state.outs <= 1 && state.runners[0]){
      const firstRunner = state.runners[0];
      const dpChance = clamp(0.42 - speedAdjustment(firstRunner.speed) - ((firstRunner.iq || 0.6) * 0.10), 0.14, 0.58);
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
    if(state.runners[1] && !state.runners[2]){
      const advanceChance = clamp(0.18 + speedAdjustment(state.runners[1].speed) + ((state.runners[1].iq || 0.6) * 0.10), 0.06, 0.38);
      if(rng() < advanceChance) {
        state.runners[2] = state.runners[1];
        state.runners[1] = null;
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

  function resolveSteal(state, context, rng){
    const candidates = [];
    if(state.runners[0] && !state.runners[1]) candidates.push({ from:0, to:1, runner:state.runners[0], base:'2루' });
    if(state.runners[1] && !state.runners[2]) candidates.push({ from:1, to:2, runner:state.runners[1], base:'3루' });
    if(!candidates.length) return { attempted:false };
    candidates.sort((a, b) => ((b.runner.steal || 0) + (b.runner.aggression || 0)) - ((a.runner.steal || 0) + (a.runner.aggression || 0)));
    const candidate = candidates[0];
    let attemptChance = 0.03 + (candidate.runner.steal || 0) * 0.18 + (candidate.runner.aggression || 0) * 0.12;
    if(context.balls >= 2) attemptChance += 0.04;
    if(context.strikes === 2) attemptChance -= 0.03;
    if(context.pitchKind === 'breaking' || context.pitchKind === 'offspeed') attemptChance += 0.04;
    if(context.pitchKind === 'fastball') attemptChance -= 0.03;
    attemptChance -= context.pickoffPressure * 0.03;
    attemptChance = clamp(attemptChance, 0.02, 0.36);
    if(rng() >= attemptChance) return { attempted:false };
    let successChance = 0.46 + speedAdjustment(candidate.runner.speed) + (candidate.runner.steal || 0) * 0.22 + (candidate.runner.iq || 0.6) * 0.10;
    if(context.pitchKind === 'breaking' || context.pitchKind === 'offspeed') successChance += 0.08;
    if(context.pitchKind === 'fastball') successChance -= 0.05;
    if(context.pitcherHand === '좌투' && candidate.from === 0) successChance -= 0.04;
    successChance = clamp(successChance, 0.18, 0.88);
    if(rng() < successChance){
      state.runners[candidate.to] = state.runners[candidate.from];
      state.runners[candidate.from] = null;
      syncBases(state);
      state.runnerSpeeds = state.runners.map(runner => runner ? runner.speed : null);
      return {
        attempted:true,
        success:true,
        outsAdded:0,
        runs:0,
        msg:`도루 성공! ${candidate.base}를 훔쳤다.`,
        sub:'투수가 공을 던지는 사이 스타트를 끊었다.',
        log:`도루 성공 · ${candidate.base}`,
        tone:'bad'
      };
    }
    state.runners[candidate.from] = null;
    syncBases(state);
    state.runnerSpeeds = state.runners.map(runner => runner ? runner.speed : null);
    return {
      attempted:true,
      success:false,
      outsAdded:1,
      runs:0,
      msg:'도루 실패!',
      sub:'포수가 정확히 송구해 주자를 잡아냈다.',
      log:`도루 실패 · ${candidate.base}`,
      tone:'good'
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
    let command = 1;
    if(consecutive >= 2){
      whiff *= 0.84;
      damage *= 1.16;
      command *= 0.94;
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
      if(previous.actualZone === state.selectedZone){
        whiff *= 0.96;
        damage *= 1.08;
      }
      const sameThird = [1,4,7].includes(previous.actualZone) && [1,4,7].includes(state.selectedZone)
        || [2,5,8].includes(previous.actualZone) && [2,5,8].includes(state.selectedZone)
        || [3,6,9].includes(previous.actualZone) && [3,6,9].includes(state.selectedZone);
      if(sameThird){
        chase *= 0.96;
        damage *= 1.04;
      }
    }
    return { whiff, damage, chase, command };
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

  function advanceSimpleBases(bases, hitType){
    let runs = 0;
    const next = [false, false, false];
    if(hitType === 'walk'){
      if(bases[0] && bases[1] && bases[2]) runs++;
      if(bases[1] && bases[0]) next[2] = true;
      else if(bases[2]) next[2] = true;
      if(bases[0]) next[1] = true;
      if(bases[1] && !next[2]) next[2] = true;
      next[0] = true;
      return { runs, bases:next };
    }
    if(hitType === 'single'){
      if(bases[2]) runs++;
      if(bases[1]) runs++;
      if(bases[0]) next[1] = true;
      next[0] = true;
      return { runs, bases:next };
    }
    if(hitType === 'double'){
      runs += bases.filter(Boolean).length;
      next[1] = true;
      return { runs, bases:next };
    }
    if(hitType === 'homer'){
      runs += bases.filter(Boolean).length + 1;
      return { runs, bases:[false, false, false] };
    }
    return { runs:0, bases };
  }

  function simulateAutoHalfInning(context, rng){
    const offense = context.offenseRating || 1;
    const prevention = context.preventionRating || 1;
    let outs = context.startOuts || 0;
    let runs = 0;
    let bases = [false, false, false];
    const events = [];
    while(outs < 3){
      const walkProb = clamp(0.065 * offense / prevention, 0.03, 0.16);
      const hitProb = clamp(0.19 * offense / prevention, 0.10, 0.34);
      const extraBaseProb = clamp(0.26 * offense / prevention, 0.12, 0.42);
      const homerProb = clamp(0.028 * offense / prevention, 0.01, 0.08);
      const roll = rng();
      if(roll < walkProb){
        const advanced = advanceSimpleBases(bases, 'walk');
        runs += advanced.runs;
        bases = advanced.bases;
        events.push('볼넷');
      } else if(roll < walkProb + hitProb){
        const hitRoll = rng();
        if(hitRoll < homerProb){
          const advanced = advanceSimpleBases(bases, 'homer');
          runs += advanced.runs;
          bases = advanced.bases;
          events.push('홈런');
        } else if(hitRoll < extraBaseProb){
          const advanced = advanceSimpleBases(bases, 'double');
          runs += advanced.runs;
          bases = advanced.bases;
          events.push('2루타');
        } else {
          const advanced = advanceSimpleBases(bases, 'single');
          runs += advanced.runs;
          bases = advanced.bases;
          events.push('안타');
        }
      } else {
        outs++;
        events.push(outs === 3 ? '이닝 종료' : '아웃');
      }
      if(context.walkoffTarget != null && runs >= context.walkoffTarget) break;
      if(runs >= 7) break;
    }
    return {
      runs,
      summary:events.slice(0, 4).join(' · ') || '삼자범퇴'
    };
  }

  global.PitcherCareerEngine = {
    normalizeGameState,
    syncBases,
    forceWalk,
    resolveHit,
    resolveGroundout,
    resolveFlyout,
    resolvePickoff,
    resolveSteal,
    getPitchSequencing,
    getFatigueModifiers,
    recordPitchHistory,
    simulateAutoHalfInning
  };
})(typeof window !== 'undefined' ? window : globalThis);

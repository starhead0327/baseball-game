const STORAGE_KEY = 'career-pitcher-sim-v1';

const ARCHETYPES = {
  ace:{label:'파워 에이스',emoji:'🔥',desc:'구속과 헛스윙 유도력이 높지만 후반 제구 흔들림이 약간 크다.',handBonus:'삼진 지향',maxStamina:100,velo:2,control:0.96,whiff:1.08,damage:0.99,drain:1.05,recovery:4},
  command:{label:'커맨드 마스터',emoji:'🎯',desc:'볼넷 억제와 초구 스트라이크에 강하다. 구속은 살짝 낮다.',handBonus:'제구 지향',maxStamina:98,velo:-1,control:1.09,whiff:0.97,damage:0.96,drain:0.98,recovery:5},
  breaker:{label:'브레이킹 아티스트',emoji:'🌀',desc:'슬라이더와 커브, 체인지업의 헛스윙 유도력이 더 높다.',handBonus:'변화구 지향',maxStamina:96,velo:0,control:1.00,whiff:1.02,damage:0.95,breaking:1.12,drain:1.00,recovery:5},
  ironman:{label:'이닝 이터',emoji:'🛡️',desc:'체력이 높고 이닝 사이 회복이 좋다. 대신 압도적인 구위는 아니다.',handBonus:'지구력 지향',maxStamina:110,velo:-1,control:1.03,whiff:0.95,damage:0.98,drain:0.90,recovery:8}
};

const PITCHES = {
  '1':{name:'직구',emoji:'🔴',velo:145,note:'제구↑',controlMod:1.03,whiffMod:0.74,powerMod:1.16,kind:'fastball'},
  '2':{name:'슬라이더',emoji:'🔵',velo:133,note:'헛스윙↑',controlMod:0.89,whiffMod:1.32,powerMod:0.84,kind:'breaking'},
  '3':{name:'체인지업',emoji:'🟢',velo:124,note:'타이밍 교란',controlMod:0.92,whiffMod:1.18,powerMod:0.88,kind:'offspeed'},
  '4':{name:'커브',emoji:'🟡',velo:118,note:'낙차↑',controlMod:0.84,whiffMod:1.24,powerMod:0.78,kind:'breaking'}
};

const PICKOFF = {name:'견제',emoji:'🫳',note:'주자 자동 견제',kind:'pickoff'};

const LEAGUES = {
  rookie:{label:'루키 리그',emoji:'🌱',contact:0.94,power:0.90,eye:0.93,steal:0.92,seasonGames:8,runSupport:4.9},
  college:{label:'대학 리그',emoji:'🎓',contact:1.00,power:1.00,eye:1.00,steal:1.00,seasonGames:10,runSupport:4.3},
  pro:{label:'프로 리그',emoji:'🏟️',contact:1.08,power:1.12,eye:1.06,steal:1.08,seasonGames:12,runSupport:3.8}
};

const TEAMS = [
  {key:'seoul',name:'서울 스톰',emoji:'⚡',lineup:['contact','eye','aggressive','power','power','contact','aggressive','eye','contact']},
  {key:'busan',name:'부산 웨이브',emoji:'🌊',lineup:['aggressive','contact','power','contact','power','eye','contact','aggressive','eye']},
  {key:'daejeon',name:'대전 코멧',emoji:'☄️',lineup:['eye','contact','power','aggressive','contact','power','eye','contact','aggressive']},
  {key:'daegu',name:'대구 블레이즈',emoji:'🔥',lineup:['aggressive','power','contact','power','eye','aggressive','contact','eye','contact']},
  {key:'incheon',name:'인천 파일럿',emoji:'✈️',lineup:['contact','aggressive','eye','power','contact','power','aggressive','contact','eye']},
  {key:'gwangju',name:'광주 가디언즈',emoji:'🛡️',lineup:['eye','contact','contact','power','aggressive','eye','power','contact','aggressive']}
];

const ZONES = {
  1:{label:'좌상',isStrike:0.18,danger:0.28,command:0.60},
  2:{label:'중상',isStrike:0.82,danger:0.50,command:0.87},
  3:{label:'우상',isStrike:0.18,danger:0.28,command:0.60},
  4:{label:'좌중',isStrike:0.84,danger:0.54,command:0.88},
  5:{label:'중심',isStrike:0.98,danger:0.96,command:0.97},
  6:{label:'우중',isStrike:0.84,danger:0.54,command:0.88},
  7:{label:'좌하',isStrike:0.20,danger:0.24,command:0.64},
  8:{label:'중하',isStrike:0.86,danger:0.48,command:0.89},
  9:{label:'우하',isStrike:0.20,danger:0.24,command:0.64}
};

const ZONE_COORDS = {
  1:{x:188,y:173},2:{x:210,y:173},3:{x:232,y:173},
  4:{x:188,y:182},5:{x:210,y:182},6:{x:232,y:182},
  7:{x:188,y:191},8:{x:210,y:191},9:{x:232,y:191}
};

const PITCHCAM_WORLD = {
  1:{x:-22,y:-24},2:{x:0,y:-24},3:{x:22,y:-24},
  4:{x:-24,y:0},5:{x:0,y:0},6:{x:24,y:0},
  7:{x:-27,y:24},8:{x:0,y:24},9:{x:27,y:24}
};

const PITCHCAM_STRIKE_RECT = { left:47, top:62, width:76, height:86 };
const FIELD_TARGET_RECT = { left:180, top:168, width:60, height:28 };

const MISS_MAP = {
  1:[{zone:2,weight:0.34},{zone:4,weight:0.32},{zone:5,weight:0.34}],
  2:[{zone:1,weight:0.18},{zone:3,weight:0.18},{zone:5,weight:0.42},{zone:8,weight:0.22}],
  3:[{zone:2,weight:0.34},{zone:6,weight:0.32},{zone:5,weight:0.34}],
  4:[{zone:1,weight:0.18},{zone:7,weight:0.18},{zone:5,weight:0.42},{zone:6,weight:0.22}],
  5:[{zone:2,weight:0.23},{zone:4,weight:0.23},{zone:6,weight:0.23},{zone:8,weight:0.23},{zone:1,weight:0.04},{zone:9,weight:0.04}],
  6:[{zone:3,weight:0.18},{zone:9,weight:0.18},{zone:5,weight:0.42},{zone:4,weight:0.22}],
  7:[{zone:4,weight:0.32},{zone:8,weight:0.34},{zone:5,weight:0.34}],
  8:[{zone:7,weight:0.18},{zone:9,weight:0.18},{zone:5,weight:0.42},{zone:2,weight:0.22}],
  9:[{zone:6,weight:0.32},{zone:8,weight:0.34},{zone:5,weight:0.34}]
};

const BATTERS = [
  {key:'power',name:'파워 타자',emoji:'💪',desc:'장타율 높음 · 삼진도 많음',swingBall:0.28,swingStrike:0.82,contact:0.62,power:1.60,threat:0.82,speed:'LOW',aggression:0.34,iq:0.55,steal:0.18,hand:'우'},
  {key:'contact',name:'컨택 타자',emoji:'🎯',desc:'삼진 적음 · 어디든 잘 맞춤',swingBall:0.14,swingStrike:0.88,contact:0.87,power:0.78,threat:0.64,speed:'MID',aggression:0.48,iq:0.74,steal:0.40,hand:'좌'},
  {key:'eye',name:'선구안 타자',emoji:'👁️',desc:'볼넷 잘 고름 · 볼에 거의 안 속음',swingBall:0.06,swingStrike:0.70,contact:0.80,power:1.00,threat:0.70,speed:'MID',aggression:0.33,iq:0.82,steal:0.32,hand:'우'},
  {key:'aggressive',name:'적극적 타자',emoji:'🔥',desc:'볼도 공격적으로 스윙',swingBall:0.38,swingStrike:0.92,contact:0.69,power:1.12,threat:0.58,speed:'HIGH',aggression:0.76,iq:0.48,steal:0.74,hand:'우'}
];

const BATTER_MAP = Object.fromEntries(BATTERS.map(batter => [batter.key, batter]));

const GOAL_TEMPLATES = [
  {key:'strikeouts',label:'삼진 6개 이상',target:6,reward:60,read:state => state.gameStats.strikeouts},
  {key:'quality',label:'실점 2점 이하',target:2,reward:55,read:state => state.runs,inverse:true},
  {key:'efficiency',label:'투구수 90개 이하',target:90,reward:45,read:state => state.pitchCount,inverse:true},
  {key:'firstStrike',label:'1구 스트라이크 60% 이상',target:0.60,reward:45,read:state => computeMetrics(state.gameStats).firstStrike},
  {key:'csw',label:'CSW 28% 이상',target:0.28,reward:50,read:state => computeMetrics(state.gameStats).csw},
  {key:'scoreless',label:'3이닝 이상 무실점',target:9,reward:50,read:state => state.gameStats.outsRecorded,inverse:false,requiresRunsZero:true}
];

const NUMERIC_FIELDS = ['games','starts','outsRecorded','pitches','battersFaced','runs','earnedRuns','hits','singles','doubles','homers','walks','strikeouts','swings','contacts','calledStrikes','swingingStrikes','foulStrikes','strikesThrown','ballsThrown','zonePitches','outZonePitches','chaseSwings','firstPitchStrikes','firstPitchTotal','groundouts','flyouts','ballsInPlay','scorelessInnings','inningsCompleted','wins','losses','noDecisions','saves','blownSaves'];

let saveData = { profile:null, activeGame:null };
let profile = null;
let state = null;
const Engine = window.PitcherCareerEngine;

const $ = id => document.getElementById(id);
const rnd = () => Math.random();
const clamp = (value,min,max) => Math.max(min, Math.min(max, value));
const safeDivide = (a,b) => b ? a / b : 0;
const formatIP = outs => `${Math.floor(outs / 3)}.${outs % 3}`;
const formatPct = value => `${(value * 100).toFixed(1)}%`;
const formatRate = value => Number.isFinite(value) ? value.toFixed(2) : '0.00';
const formatShort = value => !Number.isFinite(value) ? '0.00' : (value >= 1 ? value.toFixed(2) : value.toFixed(3));
const decisionLabel = value => ({ PENDING:'진행중', WIN:'승리투수', LOSS:'패전투수', ND:'노디시전', SAVE:'세이브' }[value] || value);

function emptyStatLine(){
  return {games:0,starts:0,outsRecorded:0,pitches:0,battersFaced:0,runs:0,earnedRuns:0,hits:0,singles:0,doubles:0,homers:0,walks:0,strikeouts:0,swings:0,contacts:0,calledStrikes:0,swingingStrikes:0,foulStrikes:0,strikesThrown:0,ballsThrown:0,zonePitches:0,outZonePitches:0,chaseSwings:0,firstPitchStrikes:0,firstPitchTotal:0,groundouts:0,flyouts:0,ballsInPlay:0,scorelessInnings:0,inningsCompleted:0,wins:0,losses:0,noDecisions:0,saves:0,blownSaves:0};
}

function mergeStatLine(target, source){
  NUMERIC_FIELDS.forEach(field => {
    target[field] = (target[field] || 0) + (source[field] || 0);
  });
}

function computeMetrics(stat){
  const ip = stat.outsRecorded / 3;
  const ab = Math.max(0, stat.battersFaced - stat.walks);
  const tb = stat.singles + stat.doubles * 2 + stat.homers * 4;
  const avg = safeDivide(stat.hits, ab);
  const obp = safeDivide(stat.hits + stat.walks, stat.battersFaced);
  const slg = safeDivide(tb, ab);
  const ops = obp + slg;
  const era = ip ? (stat.earnedRuns * 9) / ip : 0;
  const whip = ip ? (stat.walks + stat.hits) / ip : 0;
  const k9 = ip ? (stat.strikeouts * 9) / ip : 0;
  const bb9 = ip ? (stat.walks * 9) / ip : 0;
  const h9 = ip ? (stat.hits * 9) / ip : 0;
  const hr9 = ip ? (stat.homers * 9) / ip : 0;
  const fip = ip ? (((13 * stat.homers) + (3 * stat.walks) - (2 * stat.strikeouts)) / ip) + 3.2 : 0;
  return {
    ip, avg, obp, slg, ops, era, whip, k9, bb9, h9, hr9, fip,
    csw:safeDivide(stat.calledStrikes + stat.swingingStrikes, stat.pitches),
    zone:safeDivide(stat.zonePitches, stat.pitches),
    chase:safeDivide(stat.chaseSwings, stat.outZonePitches),
    contact:safeDivide(stat.contacts, stat.swings),
    whiff:safeDivide(stat.swingingStrikes, stat.swings),
    firstStrike:safeDivide(stat.firstPitchStrikes, stat.firstPitchTotal),
    kMinusBb:safeDivide(stat.strikeouts - stat.walks, stat.battersFaced),
    ppi:safeDivide(stat.pitches, ip),
    ppa:safeDivide(stat.pitches, stat.battersFaced)
  };
}

function createDefaultProgress(){
  return { level:1, xp:0, skillPoints:0, upgrades:{ control:0, whiff:0, stamina:0, velocity:0 } };
}

function createSeason(leagueKey, year = 1){
  const league = LEAGUES[leagueKey] || LEAGUES.college;
  const teams = TEAMS.slice();
  const schedule = Array.from({ length:league.seasonGames }, (_, index) => {
    const team = teams[index % teams.length];
    return team.key;
  });
  return {
    active:true,
    year,
    league:leagueKey,
    currentGame:0,
    wins:0,
    losses:0,
    goalsCompleted:0,
    schedule,
    stats:emptyStatLine()
  };
}

function normalizeProfile(rawProfile){
  if(!rawProfile) return null;
  const progress = { ...createDefaultProgress(), ...(rawProfile.progress || {}) };
  progress.upgrades = { ...createDefaultProgress().upgrades, ...(rawProfile.progress?.upgrades || {}) };
  const leagueKey = rawProfile.league && LEAGUES[rawProfile.league] ? rawProfile.league : 'college';
  const season = rawProfile.season
    ? { ...createSeason(leagueKey, rawProfile.season.year || 1), ...rawProfile.season, stats:{ ...emptyStatLine(), ...(rawProfile.season.stats || {}) } }
    : createSeason(leagueKey, 1);
  return {
    ...rawProfile,
    appearanceRole:rawProfile.appearanceRole || 'starter',
    league:leagueKey,
    career:{ ...emptyStatLine(), ...(rawProfile.career || {}) },
    progress,
    season
  };
}

function getLeagueConfig(){
  const key = profile?.league || 'college';
  return LEAGUES[key] || LEAGUES.college;
}

function getProgressBonuses(){
  const upgrades = profile?.progress?.upgrades || createDefaultProgress().upgrades;
  return {
    control:1 + upgrades.control * 0.012,
    whiff:1 + upgrades.whiff * 0.014,
    stamina:upgrades.stamina * 2,
    velocity:Math.floor(upgrades.velocity / 2)
  };
}

function chooseAutoUpgrade(){
  const upgrades = profile.progress.upgrades;
  if(profile.archetype === 'command') upgrades.control++;
  else if(profile.archetype === 'ace') upgrades.velocity++;
  else if(profile.archetype === 'breaker') upgrades.whiff++;
  else upgrades.stamina++;
}

function xpForNextLevel(level){
  return 100 + ((level - 1) * 35);
}

function applyProfileXp(xpGain){
  if(!profile) return { levelUps:0 };
  profile.progress.xp += xpGain;
  let levelUps = 0;
  while(profile.progress.xp >= xpForNextLevel(profile.progress.level)){
    profile.progress.xp -= xpForNextLevel(profile.progress.level);
    profile.progress.level++;
    profile.progress.skillPoints++;
    levelUps++;
    chooseAutoUpgrade();
  }
  return { levelUps };
}

function cloneBatterTemplate(key){
  const base = BATTER_MAP[key] || BATTERS[0];
  return { ...base };
}

function hydrateGoal(rawGoal){
  const template = GOAL_TEMPLATES.find(goal => goal.key === rawGoal.key);
  return template ? { ...template, ...rawGoal } : rawGoal;
}

function hydrateGoals(goals){
  return (goals || []).map(hydrateGoal);
}

function buildOpponentTeam(teamKey, leagueKey){
  const league = LEAGUES[leagueKey] || LEAGUES.college;
  const team = TEAMS.find(item => item.key === teamKey) || TEAMS[0];
  const lineup = team.lineup.map((batterKey, index) => {
    const base = cloneBatterTemplate(batterKey);
    return {
      ...base,
      swingBall:clamp(base.swingBall * league.eye, 0.04, 0.55),
      swingStrike:clamp(base.swingStrike * league.contact, 0.55, 0.97),
      contact:clamp(base.contact * league.contact, 0.50, 0.95),
      power:clamp(base.power * league.power, 0.65, 1.95),
      threat:clamp(base.threat * ((league.contact + league.power) / 2), 0.45, 0.95),
      steal:clamp(base.steal * league.steal, 0.08, 0.90),
      teamName:team.name,
      teamEmoji:team.emoji,
      spot:index + 1
    };
  });
  return { ...team, lineup };
}

function assignOutingGoals(){
  const pool = GOAL_TEMPLATES.slice().sort(() => rnd() - 0.5);
  return hydrateGoals(pool.slice(0, 3).map(goal => ({ ...goal, completed:false })));
}

function evaluateGoal(goal, currentState){
  const value = goal.read(currentState);
  if(goal.requiresRunsZero) return currentState.runs === 0 && value >= goal.target;
  return goal.inverse ? value <= goal.target : value >= goal.target;
}

function goalsProgressText(){
  if(!state?.goals?.length) return '목표 없음';
  return state.goals.map(goal => `${goal.completed ? '완료' : '진행'} · ${goal.label}`).join(' / ');
}

function ensureSeasonReady(){
  if(!profile) return;
  if(!profile.season || !profile.season.active){
    profile.season = createSeason(profile.league, (profile.season?.year || 0) + 1);
  }
  if(profile.season.currentGame >= profile.season.schedule.length){
    profile.season = createSeason(profile.league, profile.season.year + 1);
  }
}

function archetypeSummary(key){
  const a = ARCHETYPES[key];
  if(!a) return '';
  return `<div class="overlay-card"><h3>${a.emoji} ${a.label}</h3><div>${a.desc}</div><div class="overlay-note">체력 ${a.maxStamina} / 제구 x${a.control.toFixed(2)} / 헛스윙 x${a.whiff.toFixed(2)}</div></div>`;
}

function loadSave(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    saveData = raw ? JSON.parse(raw) : { profile:null, activeGame:null };
  } catch(error){
    saveData = { profile:null, activeGame:null };
  }
  profile = normalizeProfile(saveData.profile || null);
}

function normalizeGameState(gameState){
  const normalized = Engine.normalizeGameState(gameState);
  if(!normalized) return null;
  return {
    teamRuns:0,
    teamRunsByInning:Array(12).fill(0),
    bullpenRating:1,
    teamOffenseRating:1,
    opponentBullpenRating:1,
    decision:'PENDING',
    leadTakenWhilePitching:false,
    lossCharged:false,
    saveOpportunity:false,
    blownSave:false,
    appearanceRole:profile?.appearanceRole || 'starter',
    ...normalized
  };
}

function persistSave(){
  saveData.profile = profile;
  saveData.activeGame = state && !state.gameEnded ? { ...state, busy:false } : null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
}

function clearCareer(){
  localStorage.removeItem(STORAGE_KEY);
  saveData = { profile:null, activeGame:null };
  profile = null;
  state = null;
  resetUIForNoGame();
  renderStartOverlay();
}

function getArchetype(){ return profile ? ARCHETYPES[profile.archetype] : ARCHETYPES.command; }

function getPitchModel(key){
  const base = PITCHES[key];
  const trait = getArchetype();
  const bonus = getProgressBonuses();
  const breakingBonus = base.kind === 'breaking' ? (trait.breaking || 1) : 1;
  return {
    ...base,
    speed:`${base.velo + trait.velo + bonus.velocity}km/h`,
    controlMod:base.controlMod * trait.control * bonus.control,
    whiffMod:base.whiffMod * trait.whiff * breakingBonus * bonus.whiff,
    powerMod:base.powerMod * trait.damage
  };
}

function buildZoneGrid(){
  const grid = $('zone-grid');
  grid.innerHTML = '';
  for(let i = 1; i <= 9; i++){
    const zone = ZONES[i];
    const cell = document.createElement('div');
    cell.className = `zone-cell${zone.isStrike > 0.5 ? ' strike-zone' : ''}`;
    cell.id = `zone-${i}`;
    cell.innerHTML = `<div class="zone-num">${i}</div><div class="zone-sub">${zone.label}</div>`;
    cell.onclick = () => selectZone(i);
    grid.appendChild(cell);
  }
}

function buildLineScore(){
  const grid = $('line-score-grid');
  grid.innerHTML = '';
  for(let inning = 1; inning <= 9; inning++){
    const cell = document.createElement('div');
    cell.className = 'inning-cell';
    cell.id = `inning-cell-${inning}`;
    cell.innerHTML = `<div class="inning-num">${inning}회</div><div class="inning-run" id="inning-run-${inning}">-</div>`;
    grid.appendChild(cell);
  }
}

function renderPitchButtons(){
  const grid = $('pitch-grid');
  const options = Object.keys(PITCHES).map(key => ({ key, pitch:getPitchModel(key) }));
  if(state && state.bases.some(Boolean)) options.push({ key:'pickoff', pitch:PICKOFF });
  grid.innerHTML = options.map(({ key, pitch }) => {
    const selected = state && state.selectedPitch === key ? ' selected' : '';
    const meta = key === 'pickoff' ? pitch.note : `${pitch.speed} · ${pitch.note}`;
    return `<button class="pitch-btn${selected}" data-key="${key}" onclick="selectPitch('${key}')"><span class="pitch-name">${pitch.name} ${pitch.emoji}</span><span class="pitch-meta">${meta}</span></button>`;
  }).join('');
}

function createProfileFromForm(){
  const existing = profile;
  const name = $('profile-name').value.trim();
  const number = clamp(Number($('profile-number').value || 18), 0, 999);
  const handedness = $('profile-hand').value;
  const archetype = $('profile-archetype').value;
  const league = $('profile-league').value;
  const appearanceRole = $('profile-role').value;
  if(!name){ alert('투수 이름을 입력하세요.'); return false; }
  profile = normalizeProfile({
    name,
    number,
    handedness,
    archetype,
    league,
    appearanceRole,
    createdAt:existing?.createdAt || new Date().toISOString(),
    career:existing?.career || emptyStatLine(),
    progress:existing?.progress || createDefaultProgress(),
    season:existing?.season?.league === league ? existing.season : createSeason(league, (existing?.season?.year || 0) + 1)
  });
  state = null;
  persistSave();
  startNewGame();
  return true;
}

function previewArchetype(){
  const key = $('profile-archetype')?.value || 'command';
  const node = $('archetype-preview');
  if(node) node.innerHTML = archetypeSummary(key);
}

function showOverlay(title, body, actions){
  $('overlay').style.display = 'flex';
  $('overlay-title').textContent = title;
  $('overlay-body').innerHTML = body;
  $('overlay-actions').innerHTML = actions;
}

function hideOverlay(){ $('overlay').style.display = 'none'; }

function renderStartOverlay(){
  const saved = profile;
  const season = saved?.season;
  showOverlay('⚾ 커리어 투수 시뮬레이터', `
    <div>나만의 투수를 생성하고, 모든 등판 기록을 누적하세요. 기록은 이 브라우저의 <strong style="color:var(--accent)">localStorage</strong>에 저장됩니다.</div>
    ${saved ? `<div class="overlay-card"><h3>${ARCHETYPES[saved.archetype].emoji} ${saved.name} #${saved.number}</h3><div>${saved.handedness} / ${ARCHETYPES[saved.archetype].label} / ${getLeagueConfig().label} / ${saved.appearanceRole === 'closer' ? '마무리' : '선발'}</div><div class="summary-grid"><div class="summary-chip"><div class="label">LV</div><div class="value">${saved.progress.level}</div></div><div class="summary-chip"><div class="label">G</div><div class="value">${saved.career.games}</div></div><div class="summary-chip"><div class="label">IP</div><div class="value">${formatIP(saved.career.outsRecorded)}</div></div><div class="summary-chip"><div class="label">ERA</div><div class="value">${formatRate(computeMetrics(saved.career).era)}</div></div></div><div class="overlay-note">시즌 ${season.year} · ${season.wins}승 ${season.losses}패 · ${season.currentGame}/${season.schedule.length} 경기 진행</div></div>` : ''}
    <div class="form-grid">
      <div class="field"><label>이름</label><input id="profile-name" value="${saved ? saved.name : '에이스'}" maxlength="16"/></div>
      <div class="field"><label>등번호</label><input id="profile-number" type="number" value="${saved ? saved.number : 18}" min="0" max="999"/></div>
      <div class="field"><label>투구 손</label><select id="profile-hand"><option value="우투" ${saved?.handedness === '우투' ? 'selected' : ''}>우투</option><option value="좌투" ${saved?.handedness === '좌투' ? 'selected' : ''}>좌투</option><option value="사이드암" ${saved?.handedness === '사이드암' ? 'selected' : ''}>사이드암</option></select></div>
      <div class="field"><label>아키타입</label><select id="profile-archetype" onchange="previewArchetype()">${Object.entries(ARCHETYPES).map(([key, value]) => `<option value="${key}" ${saved?.archetype === key || (!saved && key === 'command') ? 'selected' : ''}>${value.label}</option>`).join('')}</select></div>
      <div class="field"><label>리그 난이도</label><select id="profile-league">${Object.entries(LEAGUES).map(([key, value]) => `<option value="${key}" ${saved?.league === key || (!saved && key === 'college') ? 'selected' : ''}>${value.label}</option>`).join('')}</select></div>
      <div class="field"><label>등판 역할</label><select id="profile-role"><option value="starter" ${saved?.appearanceRole !== 'closer' ? 'selected' : ''}>선발</option><option value="closer" ${saved?.appearanceRole === 'closer' ? 'selected' : ''}>마무리</option></select></div>
    </div>
    <div id="archetype-preview">${archetypeSummary(saved?.archetype || 'command')}</div>
    ${saveData.activeGame ? `<div class="overlay-note">진행 중이던 등판이 저장되어 있습니다. 이어서 할 수 있습니다.</div>` : ''}
  `, `${saveData.activeGame ? `<button class="ghost-btn" onclick="resumeSavedGame()">이어하기</button>` : ''}${saved ? `<button class="ghost-btn" onclick="startNewGame()">현재 캐릭터로 새 경기</button>` : ''}<button class="primary-btn" onclick="createProfileFromForm()">저장하고 시작</button>${saved ? `<button class="danger-btn" onclick="clearCareer()">기록 초기화</button>` : ''}`);
}

function makeFreshState(){
  const trait = getArchetype();
  const bonus = getProgressBonuses();
  const role = profile?.appearanceRole || 'starter';
  return {
    inning:1,
    outs:0,
    balls:0,
    strikes:0,
    runs:0,
    pitchCount:0,
    actionCount:0,
    faced:0,
    bases:[false,false,false],
    runners:[null,null,null],
    runnerSpeeds:[null,null,null],
    pickoff_attempts:[0,0,0],
    pitchHistory:[],
    runsByInning:Array(9).fill(0),
    selectedPitch:null,
    selectedZone:null,
    busy:false,
    betweenInnings:false,
    pendingPull:false,
    gameEnded:false,
    committed:false,
    appearanceRole:role,
    stamina:trait.maxStamina + bonus.stamina,
    maxStamina:trait.maxStamina + bonus.stamina,
    batter:null,
    opponent:null,
    lineupSpot:0,
    goals:[],
    supportRuns:0,
    winOutcome:null,
    teamRuns:0,
    teamRunsByInning:Array(12).fill(0),
    bullpenRating:1,
    teamOffenseRating:1,
    opponentBullpenRating:1,
    decision:'PENDING',
    leadTakenWhilePitching:false,
    lossCharged:false,
    saveOpportunity:false,
    blownSave:false,
    paFirstPitch:true,
    gameStats:emptyStatLine()
  };
}

function pickBatter(){
  if(state?.opponent?.lineup?.length){
    const batter = state.opponent.lineup[state.lineupSpot % state.opponent.lineup.length];
    state.lineupSpot = (state.lineupSpot + 1) % state.opponent.lineup.length;
    return { ...batter };
  }
  return { ...BATTERS[Math.floor(Math.random() * BATTERS.length)] };
}

function loadNextBatter(){
  state.batter = pickBatter();
  state.faced++;
  state.paFirstPitch = true;
  state.balls = 0;
  state.strikes = 0;
  state.pickoff_attempts = [0,0,0];
  updateBatterCard();
}

function syncStateRunners(){
  if(!state) return;
  Engine.syncBases(state);
  state.runnerSpeeds = state.runners.map(runner => runner ? runner.speed : null);
}

function applyRuns(runs){
  if(!runs) return;
  const beforeTeam = state.teamRuns;
  const beforeOpp = state.runs;
  state.runs += runs;
  state.runsByInning[state.inning - 1] += runs;
  state.gameStats.runs += runs;
  state.gameStats.earnedRuns += runs;
  if(beforeTeam > beforeOpp && state.runs >= state.teamRuns){
    state.leadTakenWhilePitching = false;
    state.lossCharged = true;
    if(state.saveOpportunity) state.blownSave = true;
  }
}

function applyTeamRuns(runs, inning){
  if(!runs) return;
  const beforeTeam = state.teamRuns;
  const beforeOpp = state.runs;
  state.teamRuns += runs;
  state.teamRunsByInning[inning - 1] = (state.teamRunsByInning[inning - 1] || 0) + runs;
  if(beforeTeam <= beforeOpp && state.teamRuns > state.runs){
    state.leadTakenWhilePitching = true;
  }
}

function prepareOutingContext(){
  ensureSeasonReady();
  const season = profile.season;
  const opponentKey = season.schedule[season.currentGame % season.schedule.length];
  const league = getLeagueConfig();
  return {
    seasonGame:season.currentGame + 1,
    opponent:buildOpponentTeam(opponentKey, profile.league),
    goals:assignOutingGoals(),
    teamOffenseRating:clamp((league.runSupport / 4.2) + (profile.progress.level * 0.01), 0.85, 1.35),
    bullpenRating:clamp(1.02 + (profile.progress.upgrades.control * 0.01), 0.92, 1.18),
    opponentBullpenRating:clamp(1.0 + ((season.currentGame % 3) * 0.04), 0.94, 1.16)
  };
}

function seedCloserAppearance(context){
  state.inning = 9;
  state.teamRuns = 2 + Math.floor(rnd() * 4);
  state.runs = Math.max(0, state.teamRuns - (1 + Math.floor(rnd() * 3)));
  state.saveOpportunity = state.teamRuns > state.runs && (state.teamRuns - state.runs) <= 3;
  for(let i = 0; i < 8; i++){
    const teamChunk = Math.max(0, Math.round((state.teamRuns * ((i + 1) / 8)) - (state.teamRuns * (i / 8))));
    const oppChunk = Math.max(0, Math.round((state.runs * ((i + 1) / 8)) - (state.runs * (i / 8))));
    state.teamRunsByInning[i] = teamChunk;
    state.runsByInning[i] = oppChunk;
  }
  state.runsByInning[8] = 0;
  state.teamRunsByInning[8] = 0;
  if(rnd() < 0.35) state.runners[0] = { speed:'MID', name:'선행 주자', archetype:'legacy', aggression:0.45, iq:0.55, steal:0.20 };
  syncStateRunners();
}

function updateHintPanel(){
  const list = document.querySelector('#hint-panel ul');
  if(!list) return;
  if(!state || !profile){
    list.innerHTML = `
      <li>9회까지 던질 수 있지만, 피로도가 높아질수록 실투가 중앙으로 몰립니다.</li>
      <li>강판 버튼은 타자 종료 후 교체 예약도 가능합니다.</li>
      <li>존 공략, 추격 유도, CSW%, 1구 스트라이크 비율까지 커리어에 누적됩니다.</li>
      <li>코너만 고집해도 실투가 날 수 있으니 카운트와 체력을 함께 보세요.</li>
    `;
    return;
  }
  list.innerHTML = state.goals.map(goal => {
    const value = goal.read(state);
    const progress = typeof value === 'number'
      ? (value < 1 ? `${Math.round(value * 100)}%` : `${value.toFixed ? value.toFixed(1) : value}`)
      : `${value}`;
    return `<li>${goal.completed ? '완료' : '목표'} · ${goal.label} · 현재 ${progress} · 보상 XP ${goal.reward}</li>`;
  }).join('');
}

function syncGoals(){
  if(!state?.goals) return;
  state.goals = hydrateGoals(state.goals);
  state.goals.forEach(goal => {
    goal.completed = evaluateGoal(goal, state);
  });
}

function playResultAudio(kind){
  if(!window.AudioContext && !window.webkitAudioContext) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  playResultAudio.ctx = playResultAudio.ctx || new Ctx();
  const ctx = playResultAudio.ctx;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const map = {
    strike:[620, 0.07],
    ball:[320, 0.05],
    contact:[520, 0.08],
    big:[760, 0.15],
    out:[260, 0.08]
  };
  const [freq, dur] = map[kind] || [440, 0.06];
  o.frequency.value = freq;
  o.type = kind === 'big' ? 'sawtooth' : 'triangle';
  g.gain.value = 0.03;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  o.stop(ctx.currentTime + dur);
}

function pulseStage(kind){
  const field = $('field-wrap');
  if(!field) return;
  const colors = {
    strike:'0 0 0 2px #f5c84255 inset',
    ball:'0 0 0 2px #42d87b55 inset',
    out:'0 0 0 2px #59b0ff55 inset',
    hit:'0 0 0 2px #ff914d66 inset',
    hr:'0 0 0 2px #ef5f7a77 inset'
  };
  field.style.boxShadow = colors[kind] || '';
  setTimeout(() => { field.style.boxShadow = ''; }, 240);
}

function simulateAutoOffenseHalf(inning, offenseLabel, offenseRating, preventionRating, walkoffTarget = null){
  const result = Engine.simulateAutoHalfInning({
    offenseRating,
    preventionRating,
    walkoffTarget
  }, rnd);
  if(offenseLabel === 'our'){
    applyTeamRuns(result.runs, inning);
    addLog(`우리 팀 공격 ${inning}회말 · ${result.runs}점 (${result.summary})`, result.runs ? 'good' : 'neut');
  } else {
    const beforeLead = state.teamRuns > state.runs;
    state.runs += result.runs;
    state.runsByInning[inning - 1] += result.runs;
    if(result.runs && beforeLead && state.teamRuns <= state.runs) state.leadTakenWhilePitching = false;
    if(result.runs && state.teamRuns <= state.runs) state.lossCharged = true;
    addLog(`상대 자동 공격 ${inning}회초 · ${result.runs}점 (${result.summary})`, result.runs ? 'bad' : 'neut');
  }
  return result;
}

function completeRemainingGameAfterExit(){
  let inning = state.inning;
  let topPlayed = state.outs >= 3;
  if(!topPlayed){
    const beforeLead = state.teamRuns > state.runs;
    const oppHalf = Engine.simulateAutoHalfInning({
      offenseRating:clamp(state.opponent.lineup.reduce((sum, batter) => sum + batter.threat, 0) / state.opponent.lineup.length, 0.75, 1.35),
      preventionRating:state.bullpenRating,
      startOuts:state.outs
    }, rnd);
    state.runs += oppHalf.runs;
    state.runsByInning[inning - 1] += oppHalf.runs;
    if(oppHalf.runs && beforeLead && state.teamRuns <= state.runs) state.leadTakenWhilePitching = false;
    if(oppHalf.runs && state.teamRuns <= state.runs) state.lossCharged = true;
    addLog(`불펜이 ${inning}회초를 마무리함 · ${oppHalf.runs}실점 (${oppHalf.summary})`, oppHalf.runs ? 'bad' : 'good');
    topPlayed = true;
  }
  while(true){
    const walkoffTarget = inning >= 9 && state.teamRuns < state.runs ? (state.runs - state.teamRuns + 1) : null;
    simulateAutoOffenseHalf(inning, 'our', state.teamOffenseRating, state.opponentBullpenRating, walkoffTarget);
    if(inning >= 9 && state.teamRuns !== state.runs) break;
    inning++;
    const oppHalf = Engine.simulateAutoHalfInning({
      offenseRating:clamp(state.opponent.lineup.reduce((sum, batter) => sum + batter.threat, 0) / state.opponent.lineup.length, 0.75, 1.35),
      preventionRating:state.bullpenRating
    }, rnd);
    const beforeLead = state.teamRuns > state.runs;
    state.runs += oppHalf.runs;
    state.runsByInning[inning - 1] = (state.runsByInning[inning - 1] || 0) + oppHalf.runs;
    if(oppHalf.runs && beforeLead && state.teamRuns <= state.runs) state.leadTakenWhilePitching = false;
    if(oppHalf.runs && state.teamRuns <= state.runs) state.lossCharged = true;
    addLog(`불펜 ${inning}회초 · ${oppHalf.runs}실점 (${oppHalf.summary})`, oppHalf.runs ? 'bad' : 'good');
    if(inning >= 9 && state.teamRuns > state.runs) break;
  }
}

function settleDecision(){
  if(state.teamRuns > state.runs){
    if(state.appearanceRole === 'closer'){
      if(state.saveOpportunity && !state.blownSave && state.inning === 9 && state.outs >= 3){
        state.decision = 'SAVE';
        state.gameStats.saves++;
      } else if(state.blownSave){
        state.decision = 'WIN';
        state.gameStats.wins++;
        state.gameStats.blownSaves++;
      } else {
        state.decision = 'WIN';
        state.gameStats.wins++;
      }
    } else if(state.leadTakenWhilePitching && state.gameStats.outsRecorded >= 15){
      state.decision = 'WIN';
      state.gameStats.wins++;
    } else {
      state.decision = 'ND';
      state.gameStats.noDecisions++;
    }
  } else if(state.teamRuns < state.runs){
    if(state.lossCharged){
      state.decision = 'LOSS';
      state.gameStats.losses++;
    } else {
      state.decision = 'ND';
      state.gameStats.noDecisions++;
    }
    if(state.blownSave) state.gameStats.blownSaves++;
  } else {
    state.decision = 'ND';
    state.gameStats.noDecisions++;
    if(state.blownSave) state.gameStats.blownSaves++;
  }
}

function startNewGame(){
  if(!profile){ renderStartOverlay(); return; }
  state = makeFreshState();
  const context = prepareOutingContext();
  state.opponent = context.opponent;
  state.goals = context.goals;
  state.teamOffenseRating = context.teamOffenseRating;
  state.bullpenRating = context.bullpenRating;
  state.opponentBullpenRating = context.opponentBullpenRating;
  if(state.appearanceRole === 'closer') seedCloserAppearance(context);
  renderPitchButtons();
  buildZoneGrid();
  buildLineScore();
  loadNextBatter();
  resetSelections();
  showReaction('idle', '첫 타자를 상대할 준비가 됐습니다.', false);
  showResult('', '구종과 코스를 선택하세요', state.appearanceRole === 'closer' ? '세이브 상황입니다. 리드를 지키면 세이브가 기록됩니다.' : '9회까지 투구할 수 있고, 원하면 중간에 강판할 수 있습니다.');
  $('log-list').innerHTML = '';
  addLog(`${profile.name} 선발 등판. ${state.opponent.emoji} ${state.opponent.name}전 시작.`, 'good');
  refreshUI();
  hideOverlay();
  persistSave();
}

function resumeSavedGame(){
  if(!saveData.activeGame || !profile){ renderStartOverlay(); return; }
  state = { ...normalizeGameState(saveData.activeGame), busy:false, committed:false };
  state.goals = hydrateGoals(state.goals);
  if(!state.opponent || !state.goals?.length){
    const context = prepareOutingContext();
    state.opponent = state.opponent || context.opponent;
    state.goals = state.goals?.length ? state.goals : context.goals;
  }
  renderPitchButtons();
  buildZoneGrid();
  buildLineScore();
  refreshUI();
  if(state.betweenInnings) renderBetweenInningOverlay();
  else hideOverlay();
}
function requestNewOuting(){
  if(!profile){ renderStartOverlay(); return; }
  if(!state || state.gameEnded){ startNewGame(); return; }
  showOverlay('새 경기 시작', `현재 ${state.inning}회 수비 중인 등판을 종료하고 새로운 경기를 시작합니다. 지금 끝내면 현재 기록도 커리어에 반영됩니다.`, `<button class="ghost-btn" onclick="hideOverlay()">취소</button><button class="danger-btn" onclick="endOuting('manager')">현재 등판 종료</button>`);
}

function updateBatterCard(){
  const batter = state?.batter;
  const matchup = $('batter-matchup');
  if(!batter){
    if(matchup){
      matchup.textContent = '';
      matchup.className = '';
    }
    return;
  }
  $('batter-avatar').textContent = batter.emoji;
  $('batter-name').textContent = batter.spot ? `${batter.spot}번 ${batter.name}` : batter.name;
  $('batter-type').textContent = batter.teamName ? `${batter.teamEmoji} ${batter.teamName} · ${batter.desc}` : batter.desc;
  if(!profile){
    matchup.textContent = '';
    matchup.className = '';
  } else {
    const pitcherSide = profile.handedness === '좌투' ? 'L' : 'R';
    const batterSide = batter.hand === '좌' ? 'L' : 'R';
    const handText = batter.hand === '좌' ? '좌타' : '우타';
    matchup.className = '';
    if(profile.handedness === '사이드암' && pitcherSide === batterSide){
      matchup.textContent = `⚡ 사이드암 압도 (${handText})`;
      matchup.className = 'matchup-sidearm';
    } else if(pitcherSide !== batterSide){
      matchup.textContent = `🟢 유리한 매치업 (${handText})`;
      matchup.className = 'matchup-good';
    } else {
      matchup.textContent = `🔴 불리한 매치업 (${handText})`;
      matchup.className = 'matchup-bad';
    }
  }
  $('stat-swing-ball').textContent = `${Math.round(batter.swingBall * 100)}%`;
  $('stat-swing-str').textContent = `${Math.round(batter.swingStrike * 100)}%`;
  $('stat-contact').textContent = `${Math.round(batter.contact * 100)}%`;
  $('stat-power').textContent = batter.power >= 1.4 ? '최강' : batter.power >= 1.1 ? '강함' : batter.power >= 0.9 ? '보통' : '낮음';
  const threat = Math.round(batter.threat * 100);
  $('threat-val').textContent = `${threat}%`;
  $('threat-bar').style.width = `${threat}%`;
  $('threat-bar').style.background = threat > 75 ? 'var(--danger)' : threat > 55 ? 'var(--accent)' : 'var(--safe)';
}

function updatePlayerCard(){
  if(!profile){
    $('player-avatar').textContent = '🧤';
    $('player-name').textContent = '캐릭터 없음';
    $('player-meta').textContent = '투수를 생성하면 커리어가 누적됩니다.';
    $('player-tags').innerHTML = '';
    $('player-games').textContent = '0';
    $('player-ip').textContent = '0.0';
    $('player-era').textContent = '0.00';
    $('player-whip').textContent = '0.00';
    return;
  }
  const trait = getArchetype();
  const metrics = computeMetrics(profile.career);
  const league = getLeagueConfig();
  const season = profile.season;
  $('player-avatar').textContent = trait.emoji;
  $('player-name').textContent = `${profile.name} #${profile.number}`;
  $('player-meta').textContent = `${profile.handedness} · ${trait.label} · ${league.label} · ${profile.appearanceRole === 'closer' ? '마무리' : '선발'}`;
  $('player-tags').innerHTML = `<span class="tag">LV ${profile.progress.level}</span><span class="tag">PTS ${profile.progress.skillPoints}</span><span class="tag">${trait.handBonus}</span><span class="tag">시즌 ${season.year} ${season.wins}승 ${season.losses}패</span>`;
  $('player-games').textContent = profile.career.games;
  $('player-ip').textContent = formatIP(profile.career.outsRecorded);
  $('player-era').textContent = formatRate(metrics.era);
  $('player-whip').textContent = formatRate(metrics.whip);
}

function updateScoreboard(){
  if(!state){
    $('scorebug-inning').textContent = '로스터 준비';
    $('scorebug-outs').textContent = '0 OUT';
    for(let i = 0; i < 3; i++) $('bug-out' + i).className = 'dot scorebug-dot';
    for(let i = 0; i < 2; i++) $('bug-str' + i).className = 'dot scorebug-dot';
    for(let i = 0; i < 3; i++) $('bug-ball' + i).className = 'dot scorebug-dot';
    return;
  }
  $('scorebug-inning').textContent = state.betweenInnings ? `${state.inning + 1}회 준비` : `${state.inning}회 수비`;
  $('scorebug-outs').textContent = `${state.outs} OUT`;
  for(let i = 0; i < 3; i++) $('bug-out' + i).className = 'dot scorebug-dot' + (state.outs > i ? ' out' : '');
  for(let i = 0; i < 2; i++) $('bug-str' + i).className = 'dot scorebug-dot' + (state.strikes > i ? ' strike' : '');
  for(let i = 0; i < 3; i++) $('bug-ball' + i).className = 'dot scorebug-dot' + (state.balls > i ? ' ball' : '');
}

function updateRunners(){
  const bases = state ? state.runners.map(Boolean) : [false,false,false];
  for(let i = 0; i < 3; i++) $('runner' + (i + 1)).setAttribute('opacity', bases[i] ? '1' : '0');
  ['base1','base2','base3'].forEach((id, index) => {
    $(id).setAttribute('fill', bases[index] ? '#6f0a1c' : '#4a2f10');
    $(id).setAttribute('stroke', bases[index] ? '#ef5f7a' : '#8a6a40');
  });
  ['bug-base1','bug-base2','bug-base3'].forEach((id, index) => {
    $(id).classList.toggle('on', Boolean(bases[index]));
  });
}

function updateStamina(){
  if(!state){ $('stam-val').textContent = '0%'; $('stam-bar-fill').style.width = '0%'; return; }
  const pct = clamp(state.stamina / state.maxStamina, 0, 1);
  const fatigue = 1 - pct;
  $('stam-val').textContent = `${Math.round(pct * 100)}%`;
  $('stam-bar-fill').style.width = `${pct * 100}%`;
  $('stam-bar-fill').style.background = pct > 0.6 ? 'linear-gradient(90deg,var(--safe),#b1ff73)' : pct > 0.35 ? 'linear-gradient(90deg,#f5c842,#ff9f1a)' : 'linear-gradient(90deg,var(--danger),#ff8a52)';
  $('fatigue-label').textContent = `${Math.round(fatigue * 100)}%`;
  $('fatigue-bar').style.width = `${fatigue * 100}%`;
  $('fatigue-bar').style.background = fatigue < 0.35 ? 'var(--safe)' : fatigue < 0.7 ? 'var(--accent)' : 'var(--danger)';
}

function updateLineScore(){
  for(let inning = 1; inning <= 9; inning++){
    const cell = $('inning-cell-' + inning);
    const run = $('inning-run-' + inning);
    if(!state){ cell.className = 'inning-cell'; run.textContent = '-'; continue; }
    const inningRuns = state.runsByInning[inning - 1];
    run.textContent = inningRuns || inningRuns === 0 ? inningRuns : '-';
    cell.className = 'inning-cell';
    if(inning < state.inning || (inning === state.inning && state.betweenInnings)) cell.classList.add('done');
    if(inning === state.inning && !state.betweenInnings) cell.classList.add('current');
  }
}

function updateManagerPanel(){
  if(!state || !profile){
    $('manager-copy').textContent = '캐릭터를 생성하거나 기존 투수로 경기를 시작하세요.';
    $('sub-btn').className = 'ghost-btn';
    $('sub-btn').textContent = '강판';
    return;
  }
  const metrics = computeMetrics(state.gameStats);
  const pending = state.pendingPull ? '현재 타자 종료 후 강판 예약됨.' : '원하면 지금 강판하거나, 타자 종료 후 교체를 예약할 수 있습니다.';
  const opponentText = state.opponent ? `${state.opponent.emoji} ${state.opponent.name}` : '상대 없음';
  $('manager-copy').textContent = `${profile.name} ${profile.handedness} / ${getArchetype().label} / ${opponentText}. 스코어 ${state.teamRuns}-${state.runs}, 현재 등판 ERA ${formatRate(metrics.era)}, CSW ${formatPct(metrics.csw)}, 목표 ${goalsProgressText()}. ${pending}`;
  $('sub-btn').className = state.pendingPull ? 'ghost-btn pending' : 'ghost-btn';
  $('sub-btn').textContent = state.pendingPull ? '강판 예약 취소' : '강판';
}

function metricItem(label, value, tone = ''){
  return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value ${tone}">${value}</div></div>`;
}

function updateStatPanels(){
  const outing = state ? state.gameStats : emptyStatLine();
  const outingMetrics = computeMetrics(outing);
  const careerMetrics = computeMetrics(profile ? profile.career : emptyStatLine());
  const season = profile?.season || createSeason(profile?.league || 'college', 1);
  $('outing-grid').innerHTML = [
    metricItem('우리 팀', state ? state.teamRuns : 0, 'accent'),
    metricItem('실점', state ? state.runs : 0, 'accent'),
    metricItem('투구수', state ? state.pitchCount : 0),
    metricItem('상대 타자', state ? state.faced : 0),
    metricItem('유형', profile ? ARCHETYPES[profile.archetype].label : '—'),
    metricItem('역할', profile ? (profile.appearanceRole === 'closer' ? '마무리' : '선발') : '—'),
    metricItem('결정', decisionLabel(state?.decision || 'PENDING')),
    metricItem('리그', profile ? getLeagueConfig().label : '—'),
    metricItem('상대', state?.opponent ? state.opponent.name : '—'),
    metricItem('시즌', profile ? `${season.year} / ${season.currentGame + (state?.gameEnded ? 1 : 0)}G` : '—'),
    metricItem('W-L', profile ? `${season.wins}-${season.losses}` : '0-0'),
    metricItem('IP', formatIP(outing.outsRecorded), 'accent'),
    metricItem('ERA', formatRate(outingMetrics.era), outingMetrics.era <= 3 ? 'safe' : outingMetrics.era >= 5 ? 'danger' : ''),
    metricItem('WHIP', formatRate(outingMetrics.whip)),
    metricItem('K / BB', `${outing.strikeouts} / ${outing.walks}`),
    metricItem('CSW%', formatPct(outingMetrics.csw)),
    metricItem('Zone%', formatPct(outingMetrics.zone)),
    metricItem('Chase%', formatPct(outingMetrics.chase)),
    metricItem('Contact%', formatPct(outingMetrics.contact)),
    metricItem('1st Strike%', formatPct(outingMetrics.firstStrike)),
    metricItem('AVG', formatShort(outingMetrics.avg)),
    metricItem('OPS', formatShort(outingMetrics.ops)),
    metricItem('FIP', formatRate(outingMetrics.fip))
    ].join('');
  $('career-grid').innerHTML = [
    metricItem('LV', profile ? profile.progress.level : 1, 'accent'), metricItem('PTS', profile ? profile.progress.skillPoints : 0),
    metricItem('G', profile ? profile.career.games : 0, 'accent'), metricItem('IP', profile ? formatIP(profile.career.outsRecorded) : '0.0'),
    metricItem('W-L', profile ? `${profile.career.wins}-${profile.career.losses}` : '0-0'), metricItem('SV', profile ? profile.career.saves : 0),
    metricItem('ERA', formatRate(careerMetrics.era)), metricItem('WHIP', formatRate(careerMetrics.whip)),
    metricItem('K/9', formatRate(careerMetrics.k9)), metricItem('BB/9', formatRate(careerMetrics.bb9)),
    metricItem('H/9', formatRate(careerMetrics.h9)), metricItem('HR/9', formatRate(careerMetrics.hr9)),
    metricItem('K-BB%', formatPct(careerMetrics.kMinusBb)), metricItem('CSW%', formatPct(careerMetrics.csw)),
    metricItem('SLG', formatShort(careerMetrics.slg)), metricItem('P/IP', formatRate(careerMetrics.ppi))
  ].join('');
}

function refreshUI(){
  syncStateRunners();
  syncGoals();
  updatePlayerCard();
  updateScoreboard();
  updateRunners();
  updateStamina();
  updateLineScore();
  updateManagerPanel();
  updateStatPanels();
  updateHintPanel();
  setPitcherPose('idle');
  setBatterPose('idle');
  if(!state?.busy) clearBattedBall();
  renderPitchButtons();
  checkReady();
}

function resetUIForNoGame(){
  buildZoneGrid();
  buildLineScore();
  updatePlayerCard();
  $('batter-matchup').textContent = '';
  $('batter-matchup').className = '';
  updateScoreboard();
  updateRunners();
  updateStamina();
  updateLineScore();
  updateManagerPanel();
  updateStatPanels();
  updateHintPanel();
  setPitcherPose('idle');
  setBatterPose('idle');
  clearBattedBall();
  showReaction('idle', '캐릭터를 생성하면 실제 경기 로그가 누적됩니다.', false);
  showResult('', '캐릭터를 준비하세요', '경기를 시작하면 투구와 커리어 지표가 저장됩니다.');
  $('log-list').innerHTML = '';
}

function showReaction(type, detail, crushed){
  const display = $('reaction-display');
  const config = { idle:{icon:'👀',label:'대기'}, look:{icon:'👀',label:'루킹'}, whiff:{icon:'💨',label:'헛스윙'}, contact:{icon:'💥',label:'타격'} };
  const current = config[type] || config.idle;
  display.className = crushed ? 'reaction-crushed' : (type === 'idle' ? '' : `reaction-${type}`);
  $('reaction-icon').textContent = current.icon;
  $('reaction-label').textContent = current.label;
  $('reaction-detail').textContent = detail;
}

function showResult(code, msg, sub){
  const box = $('result-box');
  box.className = '';
  const icons = { ball:'🟢', called_k:'🟡', whiff:'💨', foul:'🏳️', groundout:'⚡', flyout:'🌬️', single:'✅', double:'🔥', homerun:'🚀' };
  const classes = { ball:'result-box-ball', called_k:'result-box-strike', whiff:'result-box-strike', foul:'result-box-strike', groundout:'result-box-out', flyout:'result-box-out', single:'result-box-hit', double:'result-box-hit', homerun:'result-box-hr' };
  $('result-icon').textContent = icons[code] || '⚾';
  $('result-text').textContent = msg;
  $('result-sub').textContent = sub || '';
  if(classes[code]) box.classList.add(classes[code]);
  if(code === 'ball'){ playResultAudio('ball'); pulseStage('ball'); }
  else if(['called_k','whiff','foul'].includes(code)){ playResultAudio('strike'); pulseStage('strike'); }
  else if(['groundout','flyout'].includes(code)){ playResultAudio('out'); pulseStage('out'); }
  else if(['single','double'].includes(code)){ playResultAudio('contact'); pulseStage('hit'); }
  else if(code === 'homerun'){ playResultAudio('big'); pulseStage('hr'); }
}

function addLog(text, type){
  const li = document.createElement('li');
  li.className = type === 'bad' ? 'bad' : type === 'good' ? 'good' : 'neut';
  li.textContent = state ? `[${state.inning}회 / ${state.pitchCount}구 / ${state.actionCount}액션] ${text}` : text;
  $('log-list').prepend(li);
}

function matchupTag() {
  if(!profile || !state?.batter) return '';
  const pitcherSide = profile.handedness === '좌투' ? 'L' : 'R';
  const batterSide = state.batter.hand === '좌' ? 'L' : 'R';
  if(profile.handedness === '사이드암' && pitcherSide === batterSide) return '[사이드암↑]';
  return pitcherSide !== batterSide ? '[플래툰↑]' : '[동측↓]';
}

function selectPitch(key){
  if(!state || state.gameEnded || state.busy || state.betweenInnings) return;
  state.selectedPitch = key;
  if(key === 'pickoff'){
    state.selectedZone = null;
    document.querySelectorAll('.zone-cell').forEach(cell => cell.classList.remove('selected'));
    showResult('', '견제 선택', '주자가 있는 베이스를 자동으로 견제합니다.');
  }
  renderPitchButtons();
  checkReady();
}

function selectZone(zone){
  if(!state || state.gameEnded || state.busy || state.betweenInnings) return;
  if(state.selectedPitch === 'pickoff') return;
  state.selectedZone = zone;
  document.querySelectorAll('.zone-cell').forEach(cell => cell.classList.remove('selected'));
  $('zone-' + zone).classList.add('selected');
  checkReady();
}

function resetSelections(){
  if(state){ state.selectedPitch = null; state.selectedZone = null; }
  document.querySelectorAll('.zone-cell').forEach(cell => cell.classList.remove('selected'));
  renderPitchButtons();
  checkReady();
}

function checkReady(){
  if(!state || state.busy || state.betweenInnings || !state.selectedPitch){
    $('throw-btn').disabled = true;
    return;
  }
  $('throw-btn').disabled = state.selectedPitch === 'pickoff' ? !state.runners.some(Boolean) : !state.selectedZone;
}

function pickWeighted(options){
  let roll = rnd() * options.reduce((sum, option) => sum + option.weight, 0);
  for(const option of options){ roll -= option.weight; if(roll <= 0) return option.zone; }
  return options[options.length - 1].zone;
}

function getCommandModifier(){
  const fatigueMods = Engine.getFatigueModifiers(state);
  const staminaPct = safeDivide(state.stamina, state.maxStamina);
  if(staminaPct >= 0.72) return fatigueMods.command;
  if(staminaPct <= 0.15) return 0.70 * fatigueMods.command;
  return (0.70 + ((staminaPct - 0.15) / 0.57) * 0.30) * fatigueMods.command;
}

function getMatchupMods(pitchKind) {
  if(!profile) return { whiffMult:1, contactMult:1, chaseMult:1 };
  const pitcherSide = profile.handedness === '좌투' ? 'L' : 'R';
  const batterSide = state?.batter?.hand === '좌' ? 'L' : 'R';
  const isSidearm = profile.handedness === '사이드암';
  const opposite = pitcherSide !== batterSide;

  if(isSidearm){
    return opposite
      ? { whiffMult:0.97, contactMult:1.02, chaseMult:0.99 }
      : { whiffMult:1.22, contactMult:0.85, chaseMult:1.15 };
  }

  if(opposite){
    if(pitchKind === 'breaking') return { whiffMult:1.18, contactMult:0.88, chaseMult:1.12 };
    if(pitchKind === 'offspeed') return { whiffMult:1.10, contactMult:0.92, chaseMult:1.06 };
    return { whiffMult:1.06, contactMult:0.96, chaseMult:1.04 };
  }

  if(pitchKind === 'breaking') return { whiffMult:0.84, contactMult:1.12, chaseMult:0.90 };
  if(pitchKind === 'offspeed') return { whiffMult:0.91, contactMult:1.06, chaseMult:0.94 };
  return { whiffMult:0.95, contactMult:1.04, chaseMult:0.97 };
}

function resolveActualZone(targetZoneNum, pitch, sequence){
  const zone = ZONES[targetZoneNum];
  const commandChance = clamp(zone.command * pitch.controlMod * getCommandModifier() * (sequence?.command || 1), 0.40, 0.98);
  if(rnd() < commandChance) return targetZoneNum;
  const missOptions = MISS_MAP[targetZoneNum].map(option => ({ ...option }));
  if(commandChance < 0.68) missOptions.forEach(option => { if(option.zone === 5) option.weight += 0.12; });
  return pickWeighted(missOptions);
}
function bezierPoint(t, p0, p1, p2, p3){
  const mt = 1 - t;
  return {
    x:(mt ** 3) * p0.x + 3 * (mt ** 2) * t * p1.x + 3 * mt * (t ** 2) * p2.x + (t ** 3) * p3.x,
    y:(mt ** 3) * p0.y + 3 * (mt ** 2) * t * p1.y + 3 * mt * (t ** 2) * p2.y + (t ** 3) * p3.y
  };
}

function getTrajectoryProfile(pitch){
  const handedness = profile?.handedness || '우투';
  const armSide = handedness === '좌투' ? -1 : 1;
  if(pitch.kind === 'fastball'){
    return { lift:-10, bend1:4 * armSide, bend2:8 * armSide, drop:0, color:'#f5f8ff', duration:380 };
  }
  if(pitch.name === '슬라이더'){
    return { lift:-14, bend1:8 * armSide, bend2:26 * armSide, drop:6, color:'#69a9ff', duration:450 };
  }
  if(pitch.name === '체인지업'){
    return { lift:-4, bend1:-4 * armSide, bend2:-10 * armSide, drop:20, color:'#63ef97', duration:480 };
  }
  return { lift:-28, bend1:-14 * armSide, bend2:-4 * armSide, drop:34, color:'#ffd45d', duration:560 };
}

function getPitchCamProfile(pitch){
  const handedness = profile?.handedness || '우투';
  const armSide = handedness === '좌투' ? 1 : -1;
  if(pitch.kind === 'fastball'){
    return { bend1:6 * armSide, bend2:10 * armSide, rise:-10, sink:-2, color:'#f5f8ff', duration:420 };
  }
  if(pitch.name === '슬라이더'){
    return { bend1:12 * armSide, bend2:34 * armSide, rise:-6, sink:12, color:'#69a9ff', duration:500 };
  }
  if(pitch.name === '체인지업'){
    return { bend1:-7 * armSide, bend2:-18 * armSide, rise:-1, sink:24, color:'#63ef97', duration:520 };
  }
  return { bend1:-10 * armSide, bend2:-3 * armSide, rise:-20, sink:42, color:'#ffd45d', duration:590 };
}

function randomRange(min, max){
  return min + (rnd() * (max - min));
}

function zoneRow(zoneNum){
  return Math.floor((zoneNum - 1) / 3);
}

function zoneCol(zoneNum){
  return (zoneNum - 1) % 3;
}

function pickBallReferenceZone(actualZone, targetZoneNum){
  if(actualZone !== 5) return actualZone;
  if(targetZoneNum !== 5) return targetZoneNum;
  return [2, 4, 6, 8][Math.floor(rnd() * 4)];
}

function samplePitchLocation(actualZone, targetZoneNum, actualStrike){
  const strike = PITCHCAM_STRIKE_RECT;
  const cellW = strike.width / 3;
  const cellH = strike.height / 3;
  const marginX = 5;
  const marginY = 5;
  let camX;
  let camY;

  if(actualStrike){
    const col = zoneCol(actualZone);
    const row = zoneRow(actualZone);
    camX = randomRange(
      strike.left + (col * cellW) + marginX,
      strike.left + ((col + 1) * cellW) - marginX
    );
    camY = randomRange(
      strike.top + (row * cellH) + marginY,
      strike.top + ((row + 1) * cellH) - marginY
    );
  } else {
    const referenceZone = pickBallReferenceZone(actualZone, targetZoneNum);
    const edgePad = 8;
    switch(referenceZone){
      case 1:
        camX = randomRange(strike.left - 12, strike.left + cellW * 0.55);
        camY = randomRange(strike.top - 16, strike.top - 3);
        break;
      case 2:
        camX = randomRange(strike.left + cellW + marginX, strike.left + cellW * 2 - marginX);
        camY = randomRange(strike.top - 18, strike.top - 4);
        break;
      case 3:
        camX = randomRange(strike.left + cellW * 2.45, strike.left + strike.width + 12);
        camY = randomRange(strike.top - 16, strike.top - 3);
        break;
      case 4:
        camX = randomRange(strike.left - 18, strike.left - 4);
        camY = randomRange(strike.top + marginY, strike.top + strike.height - marginY);
        break;
      case 6:
        camX = randomRange(strike.left + strike.width + 4, strike.left + strike.width + 18);
        camY = randomRange(strike.top + marginY, strike.top + strike.height - marginY);
        break;
      case 7:
        camX = randomRange(strike.left - 12, strike.left + cellW * 0.55);
        camY = randomRange(strike.top + strike.height + 3, strike.top + strike.height + 16);
        break;
      case 8:
        camX = randomRange(strike.left + cellW + edgePad, strike.left + cellW * 2 - edgePad);
        camY = randomRange(strike.top + strike.height + 4, strike.top + strike.height + 18);
        break;
      case 9:
      default:
        camX = randomRange(strike.left + cellW * 2.45, strike.left + strike.width + 12);
        camY = randomRange(strike.top + strike.height + 3, strike.top + strike.height + 16);
        break;
    }
  }

  const nx = (camX - strike.left) / strike.width;
  const ny = (camY - strike.top) / strike.height;
  const fieldX = FIELD_TARGET_RECT.left + (FIELD_TARGET_RECT.width * nx);
  const fieldY = FIELD_TARGET_RECT.top + (FIELD_TARGET_RECT.height * ny);
  return {
    cam:{ x:camX, y:camY },
    field:{ x:fieldX, y:fieldY },
    inZone:actualStrike
  };
}

function getPitchCamColor(actualStrike){
  return actualStrike ? '#ff626d' : '#52dd7c';
}

function getTraceNode(){
  const svg = $('field-svg');
  let trace = $('anim-trace');
  if(trace) return trace;
  trace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  trace.setAttribute('id', 'anim-trace');
  trace.setAttribute('fill', 'none');
  trace.setAttribute('stroke-linecap', 'round');
  trace.setAttribute('stroke-width', '2.2');
  trace.setAttribute('opacity', '0');
  svg.appendChild(trace);
  return trace;
}

function getPitchCamNodes(){
  return {
    ball:$('pitchcam-ball'),
    trace:$('pitchcam-trace'),
    shadow:$('pitchcam-shadow'),
    target:$('pitchcam-target')
  };
}

function getPitcherVisualConfig(){
  const hand = profile?.handedness || '우투';
  if(hand === '좌투'){
    return { x:210, y:120, scaleX:-1, release:{ x:196, y:107 } };
  }
  if(hand === '사이드암'){
    return { x:210, y:122, scaleX:1, release:{ x:226, y:118 } };
  }
  return { x:210, y:120, scaleX:1, release:{ x:224, y:107 } };
}

function setPitcherPose(mode = 'idle'){
  const group = $('pitcher-group');
  if(!group) return;
  const config = getPitcherVisualConfig();
  const sidearm = profile?.handedness === '사이드암';
  let rotate = 0;
  let tx = config.x;
  let ty = config.y;
  let throwArm = 'M7 0 Q15 -4 19 -12';
  let gloveArm = 'M-7 0 Q-15 0 -18 9';
  let glove = 'M-20 7 Q-24 8 -23 13 Q-19 14 -16 12 Z';
  let frontLeg = 'M4 11 L10 28';
  let backLeg = 'M-5 11 L-10 28';

  if(mode === 'windup'){
    rotate = sidearm ? -10 : -6;
    tx -= config.scaleX * 2;
    throwArm = sidearm ? 'M7 0 Q12 -4 8 -15' : 'M7 0 Q10 -10 4 -22';
    gloveArm = 'M-7 0 Q-18 -4 -20 -15';
    glove = 'M-22 -15 Q-17 -18 -14 -13 Q-17 -8 -22 -10 Z';
    frontLeg = 'M4 11 L0 27';
    backLeg = 'M-5 11 L-10 26';
  } else if(mode === 'release'){
    rotate = sidearm ? 7 : 5;
    tx += config.scaleX * 4;
    ty += sidearm ? 2 : 0;
    throwArm = sidearm ? 'M7 -1 Q18 5 28 6' : 'M7 -1 Q18 -6 27 -15';
    gloveArm = 'M-7 0 Q-10 6 -6 12';
    glove = 'M-8 10 Q-4 12 -4 16 Q-9 16 -11 13 Z';
    frontLeg = 'M4 11 L15 28';
    backLeg = 'M-5 11 L-7 28';
  }

  group.setAttribute('transform', `translate(${tx} ${ty}) scale(${config.scaleX} 1) rotate(${rotate})`);
  $('pitcher-arm-throw').setAttribute('d', throwArm);
  $('pitcher-arm-glove').setAttribute('d', gloveArm);
  $('pitcher-glove').setAttribute('d', glove);
  $('pitcher-leg-front').setAttribute('d', frontLeg);
  $('pitcher-leg-back').setAttribute('d', backLeg);
}

function playPitcherAnimation(){
  setPitcherPose('windup');
  setTimeout(() => setPitcherPose('release'), 120);
  setTimeout(() => setPitcherPose('idle'), 460);
}

function getPitcherReleasePoint(){
  return getPitcherVisualConfig().release;
}

function getBatterVisualConfig(){
  const batterHand = state?.batter?.hand || '우';
  if(batterHand === '좌'){
    return { x:224, y:186, scaleX:-1, labelX:250 };
  }
  return { x:196, y:186, scaleX:1, labelX:166 };
}

function setBatterPose(mode = 'idle', crushed = false){
  const group = $('batter-group');
  if(!group) return;
  const config = getBatterVisualConfig();
  let rotate = 0;
  let bat = { x1:12, y1:-13, x2:25, y2:-27 };
  let frontArm = 'M7 -1 Q14 -6 16 -14';
  let backArm = 'M-7 0 Q-13 3 -16 10';
  let frontLeg = 'M5 12 L11 28';
  let backLeg = 'M-4 12 L-8 29';

  if(mode === 'look'){
    rotate = -4;
    bat = { x1:12, y1:-13, x2:24, y2:-26 };
  } else if(mode === 'whiff'){
    rotate = 12;
    bat = { x1:10, y1:-8, x2:28, y2:-1 };
    frontArm = 'M7 -1 Q16 0 23 -4';
    backArm = 'M-7 0 Q-9 6 -6 13';
    frontLeg = 'M5 12 L14 27';
  } else if(mode === 'contact'){
    rotate = crushed ? 18 : 11;
    bat = crushed ? { x1:11, y1:-7, x2:31, y2:8 } : { x1:11, y1:-7, x2:28, y2:2 };
    frontArm = crushed ? 'M7 -1 Q17 4 25 7' : 'M7 -1 Q16 2 23 2';
    backArm = 'M-7 0 Q-8 5 -4 11';
    frontLeg = 'M5 12 L15 27';
  }

  group.setAttribute('transform', `translate(${config.x} ${config.y}) scale(${config.scaleX} 1) rotate(${rotate})`);
  $('batter-bat').setAttribute('x1', `${bat.x1}`);
  $('batter-bat').setAttribute('y1', `${bat.y1}`);
  $('batter-bat').setAttribute('x2', `${bat.x2}`);
  $('batter-bat').setAttribute('y2', `${bat.y2}`);
  $('batter-arm-front').setAttribute('d', frontArm);
  $('batter-arm-back').setAttribute('d', backArm);
  $('batter-leg-front').setAttribute('d', frontLeg);
  $('batter-leg-back').setAttribute('d', backLeg);
  $('batter-action').setAttribute('x', `${config.labelX}`);
}

function getBatterVisualConfig(){
  const batterHand = state?.batter?.hand || '우';
  if(batterHand === '좌'){
    return { x:224, y:186, scaleX:-1, labelX:250 };
  }
  return { x:196, y:186, scaleX:1, labelX:166 };
}

function setBatterPose(mode = 'idle', crushed = false){
  const group = $('batter-group');
  if(!group) return;
  const config = getBatterVisualConfig();
  let rotate = 0;
  let tx = config.x;
  let ty = config.y;
  let bat = { x1:8, y1:-8, x2:20, y2:-30 };
  let frontArm = 'M7 -1 Q14 0 15 -9';
  let backArm = 'M-7 0 Q-13 2 -10 11';
  let frontLeg = 'M5 12 L13 27';
  let backLeg = 'M-5 12 L-10 29';

  if(mode === 'idle'){
    rotate = -8;
    tx += config.scaleX * -3;
    bat = { x1:7, y1:-7, x2:19, y2:-32 };
    frontArm = 'M7 -1 Q14 -1 16 -10';
    backArm = 'M-7 0 Q-12 5 -9 13';
    frontLeg = 'M5 12 L14 27';
    backLeg = 'M-5 12 L-11 29';
  } else if(mode === 'load'){
    rotate = -14;
    tx += config.scaleX * -5;
    ty -= 1;
    bat = { x1:6, y1:-5, x2:15, y2:-34 };
    frontArm = 'M7 -1 Q13 -3 14 -13';
    backArm = 'M-7 0 Q-15 0 -17 9';
    frontLeg = 'M5 12 L11 28';
    backLeg = 'M-5 12 L-12 28';
  } else if(mode === 'look'){
    rotate = -5;
    bat = { x1:8, y1:-8, x2:20, y2:-30 };
  } else if(mode === 'whiff'){
    rotate = 14;
    tx += config.scaleX * 4;
    bat = { x1:11, y1:-7, x2:31, y2:0 };
    frontArm = 'M7 -1 Q18 1 24 -5';
    backArm = 'M-7 0 Q-8 6 -3 14';
    frontLeg = 'M5 12 L15 27';
    backLeg = 'M-5 12 L-6 29';
  } else if(mode === 'contact'){
    rotate = crushed ? 22 : 13;
    tx += config.scaleX * 6;
    bat = crushed ? { x1:12, y1:-5, x2:34, y2:12 } : { x1:11, y1:-6, x2:29, y2:4 };
    frontArm = crushed ? 'M7 -1 Q18 5 26 9' : 'M7 -1 Q17 2 23 4';
    backArm = 'M-7 0 Q-8 6 -4 12';
    frontLeg = 'M5 12 L16 27';
    backLeg = 'M-5 12 L-5 29';
  } else if(mode === 'finish'){
    rotate = crushed ? 28 : 18;
    tx += config.scaleX * 8;
    bat = crushed ? { x1:14, y1:-3, x2:36, y2:16 } : { x1:12, y1:-4, x2:31, y2:7 };
    frontArm = 'M7 -1 Q19 6 27 10';
    backArm = 'M-7 0 Q-7 7 -2 13';
    frontLeg = 'M5 12 L16 28';
    backLeg = 'M-5 12 L-4 29';
  }

  group.setAttribute('transform', `translate(${tx} ${ty}) scale(${config.scaleX} 1) rotate(${rotate})`);
  $('batter-bat').setAttribute('x1', `${bat.x1}`);
  $('batter-bat').setAttribute('y1', `${bat.y1}`);
  $('batter-bat').setAttribute('x2', `${bat.x2}`);
  $('batter-bat').setAttribute('y2', `${bat.y2}`);
  $('batter-arm-front').setAttribute('d', frontArm);
  $('batter-arm-back').setAttribute('d', backArm);
  $('batter-leg-front').setAttribute('d', frontLeg);
  $('batter-leg-back').setAttribute('d', backLeg);
  $('batter-action').setAttribute('x', `${config.labelX}`);
}

function getBattedBallNodes(){
  return {
    ball:$('batted-ball'),
    trace:$('batted-trace')
  };
}

function clearBattedBall(){
  const nodes = getBattedBallNodes();
  if(!nodes.ball || !nodes.trace) return;
  nodes.ball.setAttribute('opacity', '0');
  nodes.ball.setAttribute('cx', '-30');
  nodes.ball.setAttribute('cy', '-30');
  nodes.trace.setAttribute('opacity', '0');
  nodes.trace.setAttribute('d', '');
}

function getBattedBallSpec(result){
  const pullDir = state?.batter?.hand === '좌' ? 1 : -1;
  const start = { x:214, y:180 };
  const sideJitter = (rnd() - 0.5) * 18;
  const lowArc = 12 + (rnd() * 10);
  const midArc = 44 + (rnd() * 18);
  const highArc = 74 + (rnd() * 26);
  if(result.code === 'groundout'){
    const end = { x:214 + (pullDir * (34 + rnd() * 34)) + sideJitter, y:126 + rnd() * 18 };
    return { start, end, c1:{ x:start.x + (pullDir * 18), y:start.y - 10 }, c2:{ x:end.x - (pullDir * 12), y:end.y - lowArc }, color:'#f8f4e7', duration:330, width:2.2 };
  }
  if(result.code === 'flyout'){
    const end = { x:214 + (pullDir * (52 + rnd() * 40)) + sideJitter, y:58 + rnd() * 12 };
    return { start, end, c1:{ x:start.x + (pullDir * 24), y:start.y - highArc }, c2:{ x:end.x - (pullDir * 10), y:end.y - 10 }, color:'#d8f1ff', duration:560, width:2.4 };
  }
  if(result.code === 'single'){
    const end = { x:214 + (pullDir * (48 + rnd() * 54)) + sideJitter, y:92 + rnd() * 24 };
    return { start, end, c1:{ x:start.x + (pullDir * 20), y:start.y - midArc }, c2:{ x:end.x - (pullDir * 16), y:end.y - 16 }, color:'#fff0bd', duration:430, width:2.3 };
  }
  if(result.code === 'double'){
    const end = { x:214 + (pullDir * (86 + rnd() * 50)) + sideJitter, y:44 + rnd() * 16 };
    return { start, end, c1:{ x:start.x + (pullDir * 26), y:start.y - (midArc + 12) }, c2:{ x:end.x - (pullDir * 18), y:end.y - 16 }, color:'#ffd07a', duration:520, width:2.5 };
  }
  if(result.code === 'homerun'){
    const end = { x:214 + (pullDir * (112 + rnd() * 44)) + sideJitter, y:6 + rnd() * 10 };
    return { start, end, c1:{ x:start.x + (pullDir * 30), y:start.y - (highArc + 10) }, c2:{ x:end.x - (pullDir * 20), y:end.y - 18 }, color:'#ff7a93', duration:680, width:2.8 };
  }
  if(result.code === 'foul'){
    const foulDir = pullDir;
    const end = { x:214 + (foulDir * (88 + rnd() * 34)), y:148 + rnd() * 20 };
    return { start, end, c1:{ x:start.x + (foulDir * 24), y:start.y - 30 }, c2:{ x:end.x - (foulDir * 14), y:end.y - 18 }, color:'#d8dbe4', duration:300, width:2.1 };
  }
  return null;
}

function animateBattedBall(result){
  const spec = getBattedBallSpec(result);
  if(!spec) return Promise.resolve();
  return new Promise(resolve => {
    const nodes = getBattedBallNodes();
    nodes.trace.setAttribute('d', Array.from({ length:18 }, (_, index) => {
      const point = bezierPoint(index / 17, spec.start, spec.c1, spec.c2, spec.end);
      return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }).join(' '));
    nodes.trace.setAttribute('stroke', spec.color);
    nodes.trace.setAttribute('stroke-width', `${spec.width}`);
    nodes.trace.setAttribute('opacity', '0.8');
    nodes.ball.setAttribute('fill', spec.color);
    nodes.ball.setAttribute('cx', `${spec.start.x}`);
    nodes.ball.setAttribute('cy', `${spec.start.y}`);
    nodes.ball.setAttribute('r', result.code === 'homerun' ? '5.3' : '4.6');
    nodes.ball.setAttribute('opacity', '1');

    const startTime = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - startTime) / spec.duration);
      const point = bezierPoint(t, spec.start, spec.c1, spec.c2, spec.end);
      nodes.ball.setAttribute('cx', `${point.x}`);
      nodes.ball.setAttribute('cy', `${point.y}`);
      nodes.trace.setAttribute('opacity', `${0.8 - (t * 0.34)}`);
      if(t < 1){
        requestAnimationFrame(tick);
        return;
      }
      setTimeout(() => clearBattedBall(), 420);
      resolve();
    };
    requestAnimationFrame(tick);
  });
}

function animateBall(result){
  return new Promise(resolve => {
    const ball = $('anim-ball');
    const trace = getTraceNode();
    const cam = getPitchCamNodes();
    const dest = result.fieldPoint;
    const camDest = result.pitchCamPoint;
    const camColor = result.pitchCamColor;
    const releasePoint = getPitcherReleasePoint();
    const startX = releasePoint.x;
    const startY = releasePoint.y;
    const profileCurve = getTrajectoryProfile(result.pitch);
    const camCurve = getPitchCamProfile(result.pitch);
    const duration = Math.max(profileCurve.duration, camCurve.duration);
    const p0 = { x:startX, y:startY };
    const p1 = { x:startX + profileCurve.bend1, y:startY + profileCurve.lift };
    const p2 = { x:dest.x - profileCurve.bend2, y:startY + 26 + profileCurve.drop };
    const p3 = { x:dest.x, y:dest.y };
    const c0 = { x:85, y:18 };
    const c1 = { x:85 + camCurve.bend1 * 0.55, y:46 + camCurve.rise * 0.45 };
    const c2 = { x:camDest.x - camCurve.bend2 * 0.24, y:camDest.y - 34 + camCurve.sink * 0.22 };
    const c3 = { x:camDest.x, y:camDest.y };
    const samples = Array.from({ length:16 }, (_, index) => {
      const point = bezierPoint(index / 15, p0, p1, p2, p3);
      return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }).join(' ');
    const camSamples = Array.from({ length:18 }, (_, index) => {
      const point = bezierPoint(index / 17, c0, c1, c2, c3);
      return `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }).join(' ');
    ball.setAttribute('cx', startX);
    ball.setAttribute('cy', startY);
    ball.setAttribute('r', 6);
    ball.setAttribute('fill', profileCurve.color);
    ball.setAttribute('opacity', '1');
    trace.setAttribute('d', samples);
    trace.setAttribute('stroke', profileCurve.color);
    trace.setAttribute('opacity', '0.68');
    cam.ball.setAttribute('cx', c0.x);
    cam.ball.setAttribute('cy', c0.y);
    cam.ball.setAttribute('r', 2.8);
    cam.ball.setAttribute('fill', camColor);
    cam.ball.setAttribute('opacity', '1');
    cam.trace.setAttribute('d', camSamples);
    cam.trace.setAttribute('stroke', camColor);
    cam.trace.setAttribute('opacity', '0.74');
    cam.target.setAttribute('opacity', '0');
    cam.target.setAttribute('cx', `${camDest.x}`);
    cam.target.setAttribute('cy', `${camDest.y}`);
    cam.target.setAttribute('fill', camColor);
    cam.shadow.setAttribute('opacity', '0.18');
    const start = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      const point = bezierPoint(t, p0, p1, p2, p3);
      const camPoint = bezierPoint(t, c0, c1, c2, c3);
      const radius = 6 - (t * 2.4);
      const camRadius = 2.8 + (Math.pow(t, 1.85) * 5.2);
      ball.setAttribute('cx', point.x);
      ball.setAttribute('cy', point.y);
      ball.setAttribute('r', radius.toFixed(2));
      trace.setAttribute('opacity', `${0.68 - (t * 0.3)}`);
      cam.ball.setAttribute('cx', camPoint.x);
      cam.ball.setAttribute('cy', camPoint.y);
      cam.ball.setAttribute('r', camRadius.toFixed(2));
      cam.trace.setAttribute('opacity', `${0.76 - (t * 0.22)}`);
      cam.trace.setAttribute('stroke-width', `${1.2 + (t * 2.3)}`);
      cam.shadow.setAttribute('cx', `${camPoint.x}`);
      cam.shadow.setAttribute('cy', `${148 + (t * 18)}`);
      cam.shadow.setAttribute('rx', `${4 + (t * 7)}`);
      cam.shadow.setAttribute('ry', `${1.8 + (t * 2.2)}`);
      cam.shadow.setAttribute('opacity', `${0.06 + (t * 0.22)}`);
      if(t > 0.82) cam.target.setAttribute('opacity', `${(t - 0.82) / 0.18}`);
      if(t < 1){
        requestAnimationFrame(tick);
        return;
      }
      ball.setAttribute('cx', -30);
      ball.setAttribute('cy', -30);
      ball.setAttribute('opacity', '0');
      ball.setAttribute('fill', '#fff');
      trace.setAttribute('opacity', '0');
      cam.ball.setAttribute('opacity', '0');
      cam.ball.setAttribute('fill', '#fff');
      cam.trace.setAttribute('opacity', '0.22');
      cam.trace.setAttribute('stroke-width', '2.4');
      cam.shadow.setAttribute('opacity', '0');
      cam.target.setAttribute('opacity', '1');
      resolve();
    };
    requestAnimationFrame(tick);
  });
}

function flashZone(zoneNum, code){
  const cell = $('zone-' + zoneNum);
  if(!cell) return;
  const cls = code === 'homerun' ? 'flash-hr' : code === 'ball' ? 'flash-ball' : ['called_k','whiff','foul'].includes(code) ? 'flash-strike' : 'flash-hit';
  cell.classList.add(cls);
  setTimeout(() => cell.classList.remove(cls), 850);
}

function playBatterAnimation(type, crushed){
  $('batter-action').textContent = crushed ? 'BARREL' : type.toUpperCase();
  if(type === 'look'){
    setBatterPose('look', crushed);
  } else if(type === 'whiff'){
    setBatterPose('whiff', crushed);
    setTimeout(() => setBatterPose('finish', false), 160);
  } else if(type === 'contact'){
    setBatterPose('contact', crushed);
    setTimeout(() => setBatterPose('finish', crushed), 140);
  } else {
    setBatterPose('idle');
  }
  setTimeout(resetBatterAnimation, 640);
}

function resetBatterAnimation(){
  setBatterPose('idle');
  $('batter-action').textContent = 'READY';
}

function applyPitchDrain(){
  const trait = getArchetype();
  const heavyTax = state.pitchCount > 70 ? 1 + ((state.pitchCount - 70) * 0.02) : 1;
  const pitch = state.selectedPitch && PITCHES[state.selectedPitch];
  const kindTax = pitch?.kind === 'fastball' ? 1.08 : pitch?.kind === 'breaking' ? 1.04 : 1.0;
  const runnerTax = state.runners.some(Boolean) ? 1.1 : 1.0;
  const drain = (state.pitchCount > 45 ? 3.0 : 1.7) * trait.drain * heavyTax * kindTax * runnerTax;
  state.stamina = Math.max(10, state.stamina - drain);
}

function recordPitchAnalytics(result){
  const stats = state.gameStats;
  stats.pitches++;
  if(result.actualStrike) stats.strikesThrown++;
  else stats.ballsThrown++;
  if(result.actualInZone) stats.zonePitches++;
  else stats.outZonePitches++;
  if(state.paFirstPitch){
    stats.firstPitchTotal++;
    if(result.actualStrike || ['called_k','whiff','foul','groundout','flyout','single','double','homerun'].includes(result.code)) stats.firstPitchStrikes++;
    state.paFirstPitch = false;
  }
  if(result.swings){
    stats.swings++;
    if(!result.actualInZone) stats.chaseSwings++;
    if(result.code !== 'whiff') stats.contacts++;
  }
  if(result.code === 'called_k') stats.calledStrikes++;
  if(result.code === 'whiff') stats.swingingStrikes++;
  if(result.code === 'foul') stats.foulStrikes++;
}

function calcResult(pitchKey, targetZoneNum){
  const pitch = getPitchModel(pitchKey);
  const batter = state.batter;
  const sequence = Engine.getPitchSequencing(state, pitchKey);
  const fatigue = Engine.getFatigueModifiers(state);
  const { whiffMult, contactMult, chaseMult } = getMatchupMods(pitch.kind);
  const actualZone = resolveActualZone(targetZoneNum, pitch, sequence);
  const zone = ZONES[actualZone];
  const actualStrike = rnd() < zone.isStrike;
  const sampledLocation = samplePitchLocation(actualZone, targetZoneNum, actualStrike);
  const actualInZone = sampledLocation.inZone;
  const pitchCamPoint = sampledLocation.cam;
  const fieldPoint = sampledLocation.field;
  const pitchCamColor = getPitchCamColor(actualStrike);
  let countMod = 1;
  if(state.strikes === 2) countMod = 1.28;
  else if(state.balls === 3) countMod = 0.70;
  else if(state.balls >= 2 && state.strikes === 0) countMod = 0.82;
  const chaseBoost = (!actualStrike && ZONES[targetZoneNum].danger < 0.3 ? 1.10 : 1.0) * chaseMult * sequence.chase;
  const swingProb = clamp((actualStrike ? batter.swingStrike : batter.swingBall) * countMod * chaseBoost, 0.03, 0.97);
  const swings = rnd() < swingProb;
  const locationText = actualZone === targetZoneNum ? `${actualZone}번 코스 적중` : `${targetZoneNum}번 노림 → 실제 ${actualZone}번`;
  if(!swings){
    return actualStrike ? { code:'called_k', msg:'루킹 스트라이크!', sub:'타자가 그냥 지켜봤다.', actualZone, actualInZone, actualStrike, swings, reaction:'look', locationText, pitch, pitchCamPoint, fieldPoint, pitchCamColor }
      : { code:'ball', msg:'볼', sub:'타자가 침착하게 골라냈다.', actualZone, actualInZone, actualStrike, swings, reaction:'look', locationText, pitch, pitchCamPoint, fieldPoint, pitchCamColor };
  }
  const aheadBonus = (state.strikes > state.balls && pitch.kind !== 'fastball') ? 1.22 : 1.0;
  const cornerBonus = zone.danger < 0.3 ? 1.20 : zone.danger > 0.9 ? 0.82 : 1.0;
  const chaseWhiff = actualStrike ? 1.0 : 1.08;
  const whiffProb = Math.min((1 - batter.contact * contactMult) * pitch.whiffMod * aheadBonus * cornerBonus * chaseWhiff * sequence.whiff * fatigue.whiff * whiffMult, 0.72);
  if(rnd() < whiffProb){
    const messages = [`헛스윙! ${pitch.name}에 완전히 속았다.`, `스윙 앤 미스! 날카로운 ${pitch.name}.`, `배트가 허공을 갈랐다.`];
    return { code:'whiff', msg:messages[Math.floor(rnd() * messages.length)], sub:'', actualZone, actualInZone, actualStrike, swings, reaction:'whiff', locationText, pitch, pitchCamPoint, fieldPoint, pitchCamColor };
  }
  const quality = zone.danger * batter.power * pitch.powerMod * fatigue.damage * sequence.damage * (actualZone === targetZoneNum ? 1.0 : 1.18);
  if(quality > 0.84 && rnd() < 0.12 * quality){
    return { code:'homerun', msg:'홈런!!!', sub:'실투를 놓치지 않았다.', actualZone, actualInZone, actualStrike, swings, reaction:'contact', locationText, pitch, pitchCamPoint, fieldPoint, pitchCamColor };
  }
  const foulP = 0.22;
  const goP = Math.max(0.10, 0.47 - quality * 0.18);
  const foP = Math.max(0.09, 0.31 - quality * 0.10);
  const sglP = Math.min(0.27, 0.11 + quality * 0.13);
  const dblP = Math.min(0.11, 0.025 + quality * 0.06);
  const total = foulP + goP + foP + sglP + dblP;
  const r = rnd();
  let acc = 0;
  const outcome = (code, msg, sub) => ({ code, msg, sub, actualZone, actualInZone, actualStrike, swings, reaction:'contact', locationText, pitch, pitchCamPoint, fieldPoint, pitchCamColor });
  acc += foulP / total; if(r < acc) return outcome('foul', '파울볼!', '타구가 선 밖으로 빠졌다.');
  acc += goP / total; if(r < acc) return outcome('groundout', '땅볼 아웃!', '내야수가 잡아냈다.');
  acc += foP / total; if(r < acc) return outcome('flyout', '뜬공 아웃!', '외야수가 처리했다.');
  acc += sglP / total; if(r < acc) return outcome('single', '안타!', '내야를 빠져나갔다.');
  return outcome('double', '장타! 2루타!', '갭으로 빠졌다.');
}

function handleWalk(){
  const walk = Engine.forceWalk(state, state.batter);
  const runs = walk.runs;
  applyRuns(runs);
  state.gameStats.walks++;
  return walk;
}

function handleHit(code){
  const runs = Engine.resolveHit(state, code, state.batter, rnd);
  applyRuns(runs);
  if(code === 'homerun'){ state.gameStats.hits++; state.gameStats.homers++; }
  else if(code === 'double'){ state.gameStats.hits++; state.gameStats.doubles++; }
  else if(code === 'single'){ state.gameStats.hits++; state.gameStats.singles++; }
  state.gameStats.ballsInPlay++;
  return runs;
}

function finishPlateAppearance(result){
  const stats = state.gameStats;
  let plateEnded = false;
  let logType = 'neut';
  let extra = '';
  const tag = matchupTag();
  const tagged = text => tag ? `${text} ${tag}` : text;
  if(result.code === 'ball'){
    state.balls++;
    if(state.balls >= 4){
      const walk = handleWalk();
      plateEnded = true;
      logType = walk.runs ? 'bad' : 'neut';
      showResult(result.code, result.msg, `${result.locationText} · ${walk.msg}`);
      addLog(tagged(`${result.pitch.name} / ${result.locationText} / ${walk.msg}`), logType);
    } else {
      showResult(result.code, result.msg, `${result.locationText} · ${result.sub}`);
      addLog(`${result.pitch.name} / ${result.locationText} / 볼카운트 ${state.balls}-${state.strikes}`, 'neut');
    }
  } else if(result.code === 'called_k'){
    state.strikes++;
    if(state.strikes >= 3){ plateEnded = true; state.outs++; stats.outsRecorded++; stats.strikeouts++; extra = '루킹 삼진.'; logType = 'good'; }
    showResult(result.code, result.msg, `${result.locationText} · ${extra || result.sub}`);
    addLog(plateEnded ? tagged(`${result.pitch.name} / ${result.locationText} / ${extra || '스트라이크 누적'}`) : `${result.pitch.name} / ${result.locationText} / ${extra || '스트라이크 누적'}`, logType);
  } else if(result.code === 'whiff'){
    state.strikes++;
    if(state.strikes >= 3){ plateEnded = true; state.outs++; stats.outsRecorded++; stats.strikeouts++; extra = '헛스윙 삼진.'; logType = 'good'; }
    showResult(result.code, result.msg, `${result.locationText}${extra ? ` · ${extra}` : ''}`);
    addLog(plateEnded ? tagged(`${result.pitch.name} / ${result.locationText} / ${extra || '헛스윙 스트라이크'}`) : `${result.pitch.name} / ${result.locationText} / ${extra || '헛스윙 스트라이크'}`, logType);
  } else if(result.code === 'foul'){
    if(state.strikes < 2) state.strikes++;
    showResult(result.code, result.msg, `${result.locationText} · ${result.sub}`);
    addLog(`${result.pitch.name} / ${result.locationText} / 파울`, 'neut');
  } else if(result.code === 'groundout'){
    plateEnded = true;
    const ground = Engine.resolveGroundout(state, rnd);
    state.outs += ground.outsAdded;
    stats.outsRecorded += ground.outsAdded;
    stats.groundouts++;
      stats.ballsInPlay++;
      applyRuns(ground.runs);
      showResult(result.code, result.msg, `${result.locationText} · ${ground.sub}`);
      addLog(tagged(`${result.pitch.name} / ${result.locationText} / ${ground.logSuffix}${ground.runs ? ` · ${ground.runs}점` : ''}`), ground.runs ? 'bad' : 'good');
  } else if(result.code === 'flyout'){
    plateEnded = true;
    const fly = Engine.resolveFlyout(state, rnd);
    state.outs += fly.outsAdded;
    stats.outsRecorded += fly.outsAdded;
    stats.flyouts++;
      stats.ballsInPlay++;
      applyRuns(fly.runs);
      showResult(result.code, result.msg, `${result.locationText} · ${fly.sub}`);
      addLog(tagged(`${result.pitch.name} / ${result.locationText} / ${fly.logSuffix}${fly.runs ? ` · ${fly.runs}점` : ''}`), fly.runs ? 'bad' : 'good');
  } else if(['single','double','homerun'].includes(result.code)){
    plateEnded = true;
    const runs = handleHit(result.code);
    const tail = runs ? ` ${runs}점 실점.` : '';
    showResult(result.code, result.msg, `${result.locationText} · ${result.sub}${tail}`);
    addLog(tagged(`${result.pitch.name} / ${result.locationText} / ${result.msg}${tail}`), runs ? 'bad' : 'neut');
  }
  if(plateEnded) stats.battersFaced++;
  return plateEnded;
}

function betweenInningRecovery(){ state.stamina = Math.min(state.maxStamina, state.stamina + getArchetype().recovery); }

function handleCompletedDefensiveInning(){
  if(state.runsByInning[state.inning - 1] === 0) state.gameStats.scorelessInnings++;
  state.gameStats.inningsCompleted++;
  if(state.inning >= 9 && state.teamRuns > state.runs){
    endOuting('complete');
    return;
  }
  const walkoffTarget = state.inning >= 9 && state.teamRuns < state.runs ? (state.runs - state.teamRuns + 1) : null;
  simulateAutoOffenseHalf(state.inning, 'our', state.teamOffenseRating, state.opponentBullpenRating, walkoffTarget);
  if(state.inning >= 9 && state.teamRuns !== state.runs){
    endOuting('complete');
    return;
  }
  if(state.pendingPull){
    endOuting('manager');
    return;
  }
  renderBetweenInningOverlay();
}

function renderBetweenInningOverlay(){
  state.betweenInnings = true;
  persistSave();
  const inningRuns = state.runsByInning[state.inning - 1];
  const metrics = computeMetrics(state.gameStats);
  showOverlay(`${state.inning}회 종료`, `<div>${state.inning}회를 마쳤습니다. 이번 이닝 실점은 <strong style="color:var(--accent)">${inningRuns}</strong>점입니다.</div><div class="summary-grid"><div class="summary-chip"><div class="label">우리 팀</div><div class="value">${state.teamRuns}</div></div><div class="summary-chip"><div class="label">상대</div><div class="value">${state.runs}</div></div><div class="summary-chip"><div class="label">투구 수</div><div class="value">${state.pitchCount}</div></div><div class="summary-chip"><div class="label">현재 ERA</div><div class="value">${formatRate(metrics.era)}</div></div></div><div class="overlay-note">계속 던지면 ${state.inning + 1}회 수비가 시작되고, 교체를 선택하면 남은 경기는 자동 진행됩니다.</div>`, `<button class="ghost-btn" onclick="endOuting('manager')">여기서 내려간다</button><button class="primary-btn" onclick="continueToNextInning()">다음 이닝 계속</button>`);
}

function continueToNextInning(){
  if(!state) return;
  betweenInningRecovery();
  state.inning++;
  state.outs = 0; state.balls = 0; state.strikes = 0; state.bases = [false,false,false]; state.runners = [null,null,null]; state.runnerSpeeds = [null,null,null]; state.pickoff_attempts = [0,0,0];
  state.betweenInnings = false; state.pendingPull = false;
  loadNextBatter();
  resetSelections();
  showReaction('idle', `${state.inning}회 수비 시작. 새 타자가 들어섰다.`, false);
  showResult('', `${state.inning}회 수비`, '구종과 코스를 다시 선택하세요.');
  hideOverlay(); refreshUI(); persistSave();
}

function requestPull(){
  if(!state || state.gameEnded || state.busy) return;
  if(state.balls === 0 && state.strikes === 0 && !state.betweenInnings){
    showOverlay('강판 선택', `지금 내려가면 ${state.inning}회 ${state.outs}사 시점에서 등판이 종료됩니다. 현재 기록은 커리어에 반영됩니다.`, `<button class="ghost-btn" onclick="hideOverlay()">취소</button><button class="danger-btn" onclick="endOuting('manager')">지금 내려간다</button>`);
    return;
  }
  state.pendingPull = !state.pendingPull;
  hideOverlay();
  showResult('', state.pendingPull ? '강판 예약됨' : '강판 예약 취소', state.pendingPull ? '현재 타자가 끝나면 자동으로 교체됩니다.' : '이번 등판을 계속 이어갑니다.');
  refreshUI(); persistSave();
}

function finalizeSeasonGame(){
  const league = getLeagueConfig();
  const season = profile.season;
  state.supportRuns = state.teamRuns;
  state.winOutcome = state.teamRuns > state.runs ? 'win' : state.teamRuns < state.runs ? 'loss' : 'nd';
  if(state.winOutcome === 'win') season.wins++;
  else if(state.winOutcome === 'loss') season.losses++;
  season.currentGame++;
  mergeStatLine(season.stats, state.gameStats);
}

function finalizeOutingRewards(){
  const completedGoals = state.goals.filter(goal => evaluateGoal(goal, state));
  const xpGain = 40 + Math.round(state.gameStats.outsRecorded * 4) + (state.gameStats.strikeouts * 6) + completedGoals.reduce((sum, goal) => sum + goal.reward, 0);
  const pointsGain = completedGoals.length + (state.winOutcome === 'win' ? 1 : 0);
  const growth = applyProfileXp(xpGain);
  profile.progress.skillPoints += pointsGain;
  profile.season.goalsCompleted += completedGoals.length;
  return { completedGoals, xpGain, pointsGain, growth };
}

function endOuting(reason){
  if(!state || state.committed) return;
  state.gameEnded = true; state.committed = true; state.betweenInnings = false;
  if(reason !== 'complete') completeRemainingGameAfterExit();
  else if(state.teamRuns === state.runs && state.inning >= 9) completeRemainingGameAfterExit();
  settleDecision();
  finalizeSeasonGame();
  profile.career.games++;
  if(state.appearanceRole === 'starter') profile.career.starts++;
  mergeStatLine(profile.career, state.gameStats);
  const reward = finalizeOutingRewards();
  persistSave();
  const metrics = computeMetrics(state.gameStats);
  const season = profile.season;
  showOverlay(reason === 'complete' ? '🏁 9회 완주' : '🧢 등판 종료', reason === 'complete' ? `<div>9회까지 마운드를 지켰습니다.</div>` : `<div>감독이 마운드에 올라와 투수를 교체했습니다.</div>`, `<button class="ghost-btn" onclick="renderStartOverlay()">캐릭터 관리</button><button class="primary-btn" onclick="startNewGame()">같은 투수로 새 경기</button>`);
  $('overlay-body').innerHTML += `<div class="summary-grid"><div class="summary-chip"><div class="label">우리 팀</div><div class="value">${state.teamRuns}</div></div><div class="summary-chip"><div class="label">상대</div><div class="value">${state.runs}</div></div><div class="summary-chip"><div class="label">투구 수</div><div class="value">${state.pitchCount}</div></div><div class="summary-chip"><div class="label">이닝</div><div class="value">${formatIP(state.gameStats.outsRecorded)}</div></div><div class="summary-chip"><div class="label">ERA</div><div class="value">${formatRate(metrics.era)}</div></div><div class="summary-chip"><div class="label">WHIP</div><div class="value">${formatRate(metrics.whip)}</div></div><div class="summary-chip"><div class="label">결정</div><div class="value">${decisionLabel(state.decision)}</div></div><div class="summary-chip"><div class="label">득점 지원</div><div class="value">${state.supportRuns}</div></div><div class="summary-chip"><div class="label">XP</div><div class="value">+${reward.xpGain}</div></div><div class="summary-chip"><div class="label">포인트</div><div class="value">+${reward.pointsGain}</div></div></div><div class="overlay-note">목표 완료 ${reward.completedGoals.length}개 · 시즌 ${season.year} ${season.wins}승 ${season.losses}패 · 레벨 ${profile.progress.level}${reward.growth.levelUps ? ` (+${reward.growth.levelUps})` : ''}</div><div class="overlay-note">${profile.name}의 커리어 누적 기록이 저장되었습니다.</div>`;
  refreshUI();
}

async function throwPitch(){
  if(!state || state.busy || state.betweenInnings || !state.selectedPitch) return;
  state.busy = true;
  $('throw-btn').disabled = true;
  state.actionCount++;
  if(state.selectedPitch === 'pickoff'){
    state.stamina = Math.max(0, state.stamina - 1);
    const pickoff = Engine.resolvePickoff(state, rnd);
    state.outs += pickoff.outsAdded || 0;
    state.gameStats.outsRecorded += pickoff.outsAdded || 0;
    applyRuns(pickoff.runs || 0);
    syncStateRunners();
    updateRunners();
    showReaction('idle', pickoff.sub, false);
    showResult('', pickoff.msg, pickoff.sub);
    playResultAudio(pickoff.outsAdded ? 'out' : pickoff.runs ? 'big' : 'contact');
    pulseStage(pickoff.outsAdded ? 'out' : pickoff.runs ? 'hr' : 'hit');
    addLog(pickoff.log, pickoff.tone);
    resetSelections();
    if(state.outs >= 3){
      state.busy = false;
      persistSave();
      handleCompletedDefensiveInning();
      return;
    }
    state.busy = false;
    refreshUI();
    persistSave();
    return;
  }
  if(!state.selectedZone){ state.busy = false; return; }
  const selectedPitch = getPitchModel(state.selectedPitch);
  const steal = Engine.resolveSteal(state, {
    balls:state.balls,
    strikes:state.strikes,
    pitchKind:selectedPitch.kind,
    pitcherHand:profile.handedness,
    pickoffPressure:Math.max(...state.pickoff_attempts)
  }, rnd);
  if(steal.attempted){
    state.outs += steal.outsAdded || 0;
    state.gameStats.outsRecorded += steal.outsAdded || 0;
    applyRuns(steal.runs || 0);
    syncStateRunners();
    showReaction('idle', steal.sub, false);
    showResult('', steal.msg, steal.sub);
    playResultAudio(steal.success ? 'contact' : 'out');
    pulseStage(steal.success ? 'hit' : 'out');
    addLog(steal.log, steal.tone);
    if(state.outs >= 3){
      if(state.runsByInning[state.inning - 1] === 0) state.gameStats.scorelessInnings++;
      state.gameStats.inningsCompleted++;
      state.busy = false;
      persistSave();
      if(state.inning >= 9) endOuting('complete');
      else if(state.pendingPull) endOuting('manager');
      else renderBetweenInningOverlay();
      return;
    }
    state.busy = false;
    refreshUI();
    persistSave();
    return;
    }
    state.pitchCount++;
    applyPitchDrain();
    clearBattedBall();
    setBatterPose('load');
    const result = calcResult(state.selectedPitch, state.selectedZone);
    Engine.recordPitchHistory(state, {
      pitchKey:state.selectedPitch,
    kind:result.pitch.kind,
    targetZone:state.selectedZone,
    actualZone:result.actualZone,
    code:result.code
    });
    recordPitchAnalytics(result);
    playPitcherAnimation();
    await animateBall(result);
    flashZone(result.actualZone, result.code);
    playBatterAnimation(result.reaction, result.code === 'homerun');
    if(['foul','groundout','flyout','single','double','homerun'].includes(result.code)){
      await animateBattedBall(result);
    }
    showReaction(result.reaction, `${result.locationText} · ${result.pitch.name} ${result.pitch.speed}`, result.code === 'homerun');
  const plateEnded = finishPlateAppearance(result);
  refreshUI();
  if(plateEnded){
    if(state.outs >= 3){
      state.busy = false; resetSelections(); persistSave();
      handleCompletedDefensiveInning();
      return;
    }
    if(state.pendingPull){ state.busy = false; resetSelections(); endOuting('manager'); return; }
    loadNextBatter();
  }
  resetSelections(); state.busy = false; refreshUI(); persistSave();
}

function renderNoProfileState(){ resetUIForNoGame(); renderStartOverlay(); }

function boot(){
  loadSave();
  buildZoneGrid();
  buildLineScore();
  renderPitchButtons();
  if(profile && saveData.activeGame){
    state = { ...normalizeGameState(saveData.activeGame), busy:false, committed:false };
    state.goals = hydrateGoals(state.goals);
    refreshUI();
    showReaction('idle', '저장된 등판이 있습니다. 이어서 시작할 수 있습니다.', false);
    renderStartOverlay();
    return;
  }
  if(profile){ state = null; resetUIForNoGame(); renderStartOverlay(); return; }
  renderNoProfileState();
}

boot();

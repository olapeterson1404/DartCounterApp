const $ = (id) => document.getElementById(id);

const prefs = {
  get(key, fallback = "") {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  },
  set(key, value) {
    localStorage.setItem(key, value);
  },
};

const state = {
  view: "setup",
  playerLibrary: [],
  matchPlayers: [],
  startScore: 301,
  checkoutRule: "STRAIGHT_OUT",
  sets: 1,
  legs: 1,
  mode: "FIRST_TO",
  setsTarget: 1,
  legsTarget: 1,
  currentSet: 1,
  currentLeg: 1,
  currentPlayer: 0,
  pendingBustClear: -1,
  matchFinished: false,
  selectedMultiplier: "SINGLE",
  players: [],
  undoStack: [],
  status: "",
};

function init() {
  fillSelectors();
  bindEvents();
  loadPlayers();
  renderSetup();
  render();
}

function fillSelectors() {
  setOptions($("points"), [301, 501, 201, 101], 301);
  setOptions($("checkout"), ["Straight out", "Double out", "Master out"], "Straight out");
  setOptions($("sets"), [1, 2, 3, 4, 5], 1);
  setOptions($("legs"), [1, 2, 3, 4, 5], 1);
  setOptions($("mode"), ["First to", "Best of"], "First to");
}

function setOptions(select, values, defaultValue) {
  select.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = String(value);
    select.appendChild(option);
  });
  select.value = String(defaultValue);
}

function bindEvents() {
  $("add-player-btn").addEventListener("click", addPlayerToLibrary);
  $("add-to-match").addEventListener("click", addPlayerToMatch);
  $("remove-from-match").addEventListener("click", removePlayerFromMatch);
  $("move-up").addEventListener("click", () => moveMatchPlayer(-1));
  $("move-down").addEventListener("click", () => moveMatchPlayer(1));
  $("start-btn").addEventListener("click", startGame);
  $("back-btn").addEventListener("click", () => {
    state.view = "setup";
    render();
  });

  $("double-btn").addEventListener("click", () => {
    if (state.matchFinished) return;
    state.selectedMultiplier = "DOUBLE";
    renderModifierButtons();
  });

  $("triple-btn").addEventListener("click", () => {
    if (state.matchFinished) return;
    state.selectedMultiplier = "TRIPLE";
    renderModifierButtons();
  });

  $("undo-btn").addEventListener("click", undoLastThrow);

  const keypadValues = [...Array(20).keys()].map((i) => i + 1).concat([25, 0]);
  const keypad = $("keypad");
  keypadValues.forEach((value) => {
    const button = document.createElement("button");
    button.className = "key";
    button.textContent = String(value);
    button.addEventListener("click", () => applyThrow(value));
    keypad.appendChild(button);
  });
}

function loadPlayers() {
  const raw = prefs.get("dartPlayers", "");
  if (!raw.trim()) return;
  state.playerLibrary = raw.split("\n").map((name) => name.trim()).filter(Boolean);
}

function savePlayers() {
  prefs.set("dartPlayers", state.playerLibrary.join("\n"));
}

function addPlayerToLibrary() {
  const input = $("new-player");
  const name = input.value.trim();
  if (!name) {
    setSetupStatus("Skriv ett namn innan du trycker Lägg till.");
    return;
  }
  if (state.playerLibrary.includes(name)) {
    setSetupStatus("Spelaren finns redan i listan.");
    return;
  }
  state.playerLibrary.push(name);
  state.playerLibrary.sort((a, b) => a.localeCompare(b));
  input.value = "";
  setSetupStatus("Spelare sparad.");
  savePlayers();
  renderSetup();
}

function addPlayerToMatch() {
  const selected = $("player-library").value;
  if (!selected) {
    setSetupStatus("Välj en spelare i listan först.");
    return;
  }
  if (state.matchPlayers.length >= 5) {
    setSetupStatus("Max 5 spelare per match.");
    return;
  }
  if (state.matchPlayers.includes(selected)) {
    setSetupStatus("Spelaren är redan tillagd i matchen.");
    return;
  }
  state.matchPlayers.push(selected);
  setSetupStatus("");
  renderSetup();
}

function removePlayerFromMatch() {
  const selected = $("match-players").value;
  if (!selected) return;
  state.matchPlayers = state.matchPlayers.filter((name) => name !== selected);
  renderSetup();
}

function moveMatchPlayer(direction) {
  const selected = $("match-players").value;
  const index = state.matchPlayers.indexOf(selected);
  if (index < 0) return;
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= state.matchPlayers.length) return;
  const [name] = state.matchPlayers.splice(index, 1);
  state.matchPlayers.splice(newIndex, 0, name);
  renderSetup(name);
}

function startGame() {
  if (!state.matchPlayers.length) {
    setSetupStatus("Lägg till minst en spelare i matchen.");
    return;
  }

  state.startScore = Number($("points").value);
  state.checkoutRule = parseCheckoutRule($("checkout").value);
  state.sets = Number($("sets").value);
  state.legs = Number($("legs").value);
  state.mode = $("mode").value === "Best of" ? "BEST_OF" : "FIRST_TO";

  state.setsTarget = targetWins(state.sets, state.mode);
  state.legsTarget = targetWins(state.legs, state.mode);
  state.currentSet = 1;
  state.currentLeg = 1;
  state.currentPlayer = 0;
  state.pendingBustClear = -1;
  state.matchFinished = false;
  state.selectedMultiplier = "SINGLE";
  state.status = "";
  state.undoStack = [];

  state.players = state.matchPlayers.map((name) => ({
    name,
    remaining: state.startScore,
    turnStartRemaining: state.startScore,
    dartsThrown: 0,
    turnsCompleted: 0,
    totalRoundPoints: 0,
    setsWon: 0,
    legsWonInSet: 0,
    legsWonTotal: 0,
    bustHighlight: false,
    throws: [],
  }));

  state.view = "game";
  render();
}

function parseCheckoutRule(label) {
  if (label === "Double out") return "DOUBLE_OUT";
  if (label === "Master out") return "MASTER_OUT";
  return "STRAIGHT_OUT";
}

function targetWins(value, mode) {
  return mode === "FIRST_TO" ? value : Math.floor(value / 2) + 1;
}

function applyThrow(baseValue) {
  if (state.matchFinished || !state.players.length) return;

  const current = state.players[state.currentPlayer];
  if (current.throws.length >= 3) return;

  if (baseValue === 25 && state.selectedMultiplier === "TRIPLE") {
    state.status = "Triple 25 finns inte på tavlan.";
    renderGame();
    return;
  }

  state.undoStack.push(snapshot());

  const hit = createHit(baseValue, state.selectedMultiplier);
  current.throws.push(hit);
  current.dartsThrown += 1;

  if (state.pendingBustClear >= 0 && current.throws.length === 1) {
    state.players[state.pendingBustClear].bustHighlight = false;
    state.pendingBustClear = -1;
  }

  const projected = current.remaining - hit.score;
  let bust = projected < 0;
  if (!bust && state.checkoutRule !== "STRAIGHT_OUT" && projected === 1) bust = true;
  if (!bust && projected === 0 && !isValidFinisher(hit)) bust = true;

  if (bust) {
    current.remaining = current.turnStartRemaining;
    current.turnsCompleted += 1;
    current.throws = [];
    current.bustHighlight = true;
    state.pendingBustClear = state.currentPlayer;
    state.status = `${current.name} blev tjock (bust). Poängen återställdes.`;
    advancePlayer();
    state.selectedMultiplier = "SINGLE";
    renderGame();
    return;
  }

  current.remaining = projected;

  if (current.remaining === 0) {
    finalizeTurn(current);
    processLegWin(state.currentPlayer);
    state.selectedMultiplier = "SINGLE";
    renderGame();
    return;
  }

  if (current.throws.length === 3) {
    finalizeTurn(current);
    advancePlayer();
    state.status = "";
  }

  state.selectedMultiplier = "SINGLE";
  renderGame();
}

function createHit(base, mult) {
  const multiplierValue = mult === "DOUBLE" ? 2 : mult === "TRIPLE" ? 3 : 1;
  const label = mult === "DOUBLE" ? `D${base}` : mult === "TRIPLE" ? `T${base}` : String(base);
  return { base, multiplier: multiplierValue, score: base * multiplierValue, label };
}

function isValidFinisher(hit) {
  if (state.checkoutRule === "STRAIGHT_OUT") return true;
  if (state.checkoutRule === "DOUBLE_OUT") return hit.multiplier === 2;
  return hit.multiplier === 2 || hit.multiplier === 3;
}

function finalizeTurn(player) {
  const roundPoints = player.turnStartRemaining - player.remaining;
  player.turnsCompleted += 1;
  player.totalRoundPoints += roundPoints;
  player.throws = [];
}

function processLegWin(winnerIndex) {
  const winner = state.players[winnerIndex];
  winner.legsWonInSet += 1;
  winner.legsWonTotal += 1;

  if (winner.legsWonInSet >= state.legsTarget) {
    winner.setsWon += 1;
    if (winner.setsWon >= state.setsTarget) {
      state.matchFinished = true;
      state.status = `${winner.name} vann matchen.`;
      return;
    }

    state.players.forEach((p) => {
      p.legsWonInSet = 0;
      p.remaining = state.startScore;
      p.turnStartRemaining = state.startScore;
      p.throws = [];
      p.bustHighlight = false;
    });
    state.currentSet += 1;
    state.currentLeg = 1;
    state.currentPlayer = winnerIndex;
    state.pendingBustClear = -1;
    state.status = `${winner.name} vann setet. Nytt set startat.`;
    return;
  }

  state.players.forEach((p) => {
    p.remaining = state.startScore;
    p.turnStartRemaining = state.startScore;
    p.throws = [];
    p.bustHighlight = false;
  });
  state.currentLeg += 1;
  state.currentPlayer = winnerIndex;
  state.pendingBustClear = -1;
  state.status = `${winner.name} vann leget. Nytt leg startat.`;
}

function advancePlayer() {
  state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
  const next = state.players[state.currentPlayer];
  next.turnStartRemaining = next.remaining;
  next.throws = [];
}

function undoLastThrow() {
  if (!state.undoStack.length) {
    state.status = "Inget att ångra.";
    renderGame();
    return;
  }
  const snap = state.undoStack.pop();
  Object.assign(state, JSON.parse(JSON.stringify(snap)));
  renderGame();
}

function snapshot() {
  return {
    startScore: state.startScore,
    checkoutRule: state.checkoutRule,
    sets: state.sets,
    legs: state.legs,
    mode: state.mode,
    setsTarget: state.setsTarget,
    legsTarget: state.legsTarget,
    currentSet: state.currentSet,
    currentLeg: state.currentLeg,
    currentPlayer: state.currentPlayer,
    pendingBustClear: state.pendingBustClear,
    matchFinished: state.matchFinished,
    selectedMultiplier: state.selectedMultiplier,
    players: state.players,
    status: state.status,
    view: state.view,
    matchPlayers: state.matchPlayers,
    playerLibrary: state.playerLibrary,
    undoStack: state.undoStack,
  };
}

function render() {
  $("setup-view").classList.toggle("hidden", state.view !== "setup");
  $("game-view").classList.toggle("hidden", state.view !== "game");
  if (state.view === "setup") renderSetup();
  if (state.view === "game") renderGame();
}

function renderSetup(selectMatchName = "") {
  renderSelect($("player-library"), state.playerLibrary);
  renderSelect($("match-players"), state.matchPlayers, selectMatchName);

  $("points").value = String(state.startScore);
  $("checkout").value =
    state.checkoutRule === "DOUBLE_OUT"
      ? "Double out"
      : state.checkoutRule === "MASTER_OUT"
      ? "Master out"
      : "Straight out";
  $("sets").value = String(state.sets);
  $("legs").value = String(state.legs);
  $("mode").value = state.mode === "BEST_OF" ? "Best of" : "First to";

  $("setup-status").textContent = state.setupStatus || "";
}

function setSetupStatus(message) {
  state.setupStatus = message;
  $("setup-status").textContent = message;
}

function renderSelect(select, values, selected = "") {
  select.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (selected && value === selected) option.selected = true;
    select.appendChild(option);
  });
}

function renderGame() {
  const modeLabel = state.mode === "BEST_OF" ? "Best of" : "First to";
  const checkoutLabel =
    state.checkoutRule === "DOUBLE_OUT"
      ? "Double out"
      : state.checkoutRule === "MASTER_OUT"
      ? "Master out"
      : "Straight out";

  $("game-title").textContent = String(state.startScore);
  $("game-subtitle").textContent = `${checkoutLabel} | ${modeLabel} | Set ${state.currentSet} (${state.setsTarget} att vinna) | Leg ${state.currentLeg} (${state.legsTarget} att vinna)`;
  $("game-status").textContent = state.status || "";

  const board = $("players-board");
  board.innerHTML = "";

  state.players.forEach((player, index) => {
    const turnTotal = player.throws.reduce((sum, hit) => sum + hit.score, 0);
    const avg = player.turnsCompleted ? (player.totalRoundPoints / player.turnsCompleted).toFixed(1) : "0.0";

    const row = document.createElement("article");
    row.className = "player-row";

    const indicator = document.createElement("div");
    indicator.className = "turn-indicator";
    if (player.bustHighlight) indicator.classList.add("bust");
    else if (index === state.currentPlayer && !state.matchFinished) indicator.classList.add("active");

    const content = document.createElement("div");

    const top = document.createElement("div");
    top.className = "player-top";
    top.innerHTML = `
      <div>
        <div class="remaining">${player.remaining}</div>
        <div class="player-name">${player.name}</div>
      </div>
      <div class="stats">→ ${player.dartsThrown}<br>Snitt/runda: ${avg}<br>Set: ${player.setsWon} | Leg: ${player.legsWonInSet}</div>
    `;

    const throwRow = document.createElement("div");
    throwRow.className = "throw-row";
    for (let i = 0; i < 3; i += 1) {
      const box = document.createElement("div");
      box.className = "throw-box";
      const hit = player.throws[i];
      box.textContent = hit ? hit.label : "";
      if (hit?.multiplier === 2) box.classList.add("double");
      if (hit?.multiplier === 3) box.classList.add("triple");
      throwRow.appendChild(box);
    }

    const total = document.createElement("div");
    total.className = "round-total";
    total.textContent = `Runda: ${turnTotal}`;

    content.appendChild(top);
    content.appendChild(throwRow);
    content.appendChild(total);

    row.appendChild(indicator);
    row.appendChild(content);
    board.appendChild(row);
  });

  if (!state.matchFinished) {
    const remaining = state.players[state.currentPlayer].remaining;
    const suggestions = buildCheckoutSuggestions(remaining, state.checkoutRule, 4);
    $("checkout-main").textContent = `Checkout-förslag: ${suggestions[0] || "Ingen 3-pils checkout"}`;
    $("checkout-alt1").textContent = suggestions[1] ? `Alt 1: ${suggestions[1]}` : "";
    $("checkout-alt2").textContent = suggestions[2] ? `Alt 2: ${suggestions[2]}` : "";
    $("checkout-alt3").textContent = suggestions[3] ? `Alt 3: ${suggestions[3]}` : "";
  } else {
    $("checkout-main").textContent = "Matchen är klar.";
    $("checkout-alt1").textContent = "";
    $("checkout-alt2").textContent = "";
    $("checkout-alt3").textContent = "";
  }

  renderModifierButtons();
}

function renderModifierButtons() {
  $("double-btn").classList.toggle("selected", state.selectedMultiplier === "DOUBLE");
  $("triple-btn").classList.toggle("selected", state.selectedMultiplier === "TRIPLE");
}

function buildCheckoutSuggestions(remaining, rule, limit) {
  if (remaining <= 1) return [];

  const scoringHits = buildScoringHitOrder();
  const finishHits = buildFinishingHits(rule);
  const routes = [];
  const seen = new Set();

  for (let darts = 1; darts <= 3; darts += 1) {
    collectRoutes(remaining, darts, scoringHits, finishHits, routes, seen);
  }

  routes.sort((a, b) => compareRoutes(a, b, rule));
  return routes.slice(0, limit).map((route) => route.map((hit) => hit.label).join(" + "));
}

function collectRoutes(remaining, darts, scoringHits, finishHits, routes, seen) {
  if (darts === 1) {
    finishHits.forEach((finisher) => {
      if (finisher.score === remaining) {
        pushRoute([finisher], routes, seen);
      }
    });
    return;
  }

  scoringHits.forEach((first) => {
    if (first.score >= remaining) return;
    const left1 = remaining - first.score;

    if (darts === 2) {
      finishHits.forEach((finisher) => {
        if (finisher.score === left1) pushRoute([first, finisher], routes, seen);
      });
      return;
    }

    scoringHits.forEach((second) => {
      if (second.score >= left1) return;
      const left2 = left1 - second.score;
      finishHits.forEach((finisher) => {
        if (finisher.score === left2) pushRoute([first, second, finisher], routes, seen);
      });
    });
  });
}

function pushRoute(route, routes, seen) {
  const key = route.map((h) => h.label).join("+");
  if (seen.has(key)) return;
  seen.add(key);
  routes.push(route);
}

function compareRoutes(left, right, rule) {
  if (left.length !== right.length) return left.length - right.length;

  const leftFinal = finalShotPreference(left[left.length - 1], rule);
  const rightFinal = finalShotPreference(right[right.length - 1], rule);
  if (leftFinal !== rightFinal) return rightFinal - leftFinal;

  const leftAgg = nonFinalAggression(left);
  const rightAgg = nonFinalAggression(right);
  if (leftAgg !== rightAgg) return rightAgg - leftAgg;

  return left.map((h) => h.label).join("+").localeCompare(right.map((h) => h.label).join("+"));
}

function finalShotPreference(hit, rule) {
  if (rule === "DOUBLE_OUT") return preferredDoubleBaseScore(hit.base);
  if (rule === "MASTER_OUT") {
    if (hit.multiplier === 2) return 220 + preferredDoubleBaseScore(hit.base);
    return 170 + hit.base;
  }
  if (hit.multiplier === 2) return 300;
  if (hit.multiplier === 3) return 250;
  if (hit.base === 25) return 200;
  return 100;
}

function preferredDoubleBaseScore(base) {
  const preferred = [20, 16, 18, 12, 10, 8, 14, 6, 4, 2, 25, 15, 11, 9, 7, 5, 3, 1, 13, 17, 19];
  const idx = preferred.indexOf(base);
  return idx >= 0 ? 100 - idx : 0;
}

function nonFinalAggression(route) {
  let score = 0;
  for (let i = 0; i < route.length - 1; i += 1) {
    const hit = route[i];
    if (hit.multiplier === 3) score += 300 + hit.base;
    else if (hit.multiplier === 2) score += 200 + hit.base;
    else score += 100 + hit.base;
  }
  return score;
}

function buildScoringHitOrder() {
  const hits = [];
  for (let value = 20; value >= 1; value -= 1) hits.push({ base: value, multiplier: 3, score: value * 3, label: `T${value}` });
  for (let value = 20; value >= 1; value -= 1) hits.push({ base: value, multiplier: 2, score: value * 2, label: `D${value}` });
  for (let value = 20; value >= 1; value -= 1) hits.push({ base: value, multiplier: 1, score: value, label: `${value}` });
  hits.push({ base: 25, multiplier: 2, score: 50, label: "D25" });
  hits.push({ base: 25, multiplier: 1, score: 25, label: "25" });
  return hits;
}

function buildFinishingHits(rule) {
  const doublesPriority = [20, 16, 18, 12, 10, 8, 14, 6, 4, 2, 25, 15, 11, 9, 7, 5, 3, 1, 13, 17, 19];
  const finishes = doublesPriority.map((value) => ({ base: value, multiplier: 2, score: value * 2, label: `D${value}` }));

  if (rule === "MASTER_OUT") {
    for (let value = 20; value >= 1; value -= 1) {
      finishes.push({ base: value, multiplier: 3, score: value * 3, label: `T${value}` });
    }
  }

  if (rule === "STRAIGHT_OUT") {
    for (let value = 20; value >= 1; value -= 1) {
      finishes.push({ base: value, multiplier: 3, score: value * 3, label: `T${value}` });
    }
    for (let value = 20; value >= 1; value -= 1) {
      finishes.push({ base: value, multiplier: 1, score: value, label: `${value}` });
    }
    finishes.push({ base: 25, multiplier: 1, score: 25, label: "25" });
  }

  return finishes;
}

init();

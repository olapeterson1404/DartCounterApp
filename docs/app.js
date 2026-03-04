const $ = (id) => document.getElementById(id);

const store = {
  get(key, fallback = "") {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  },
  set(key, value) {
    localStorage.setItem(key, value);
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};

const i18n = {
  sv: {
    title: "Dart Counter",
    subtitle:
      "Ange din kroppsvikt och dina personliga rekord (1RM eller reps) för att få nivåer och färgkodad feedback.",
    labelLanguage: "Språk",
    labelGender: "Kön",
    labelBodyweight: "Kroppsvikt (kg)",
    labelSquat: "Knäböj 1RM (kg)",
    labelBench: "Bänkpress 1RM (kg)",
    labelClean: "Frivändning 1RM (kg)",
    labelChins: "Chins (max reps)",
    labelBrutal: "Brutalbänk (max reps)",
    labelDips: "Dips (max reps)",
    labelCooper: "Cooper (min)",
    promptBodyweight: "t.ex. 82,5",
    promptSquat: "t.ex. 140",
    promptBench: "t.ex. 95",
    promptClean: "t.ex. 80",
    promptChins: "t.ex. 12",
    promptBrutal: "t.ex. 18",
    promptDips: "t.ex. 22",
    btnCalculate: "Beräkna nivåer",
    btnClear: "Rensa fält",
    btnUndo: "Ångra rensa",
    tabResults: "Resultat",
    tabTable: "SHF Kravprofil",
    tabRadar: "Spindelnät",
    tabAll: "Mina vikt-nivåer",
    statusFillField: "Fyll i {0}.",
    statusInvalidNumber: "Ogiltigt tal i {0}.",
    statusBodyweightRequired: "Ange kroppsvikt för 1RM-övningar.",
    statusBodyweightInvalid: "Kroppsvikt måste vara större än 0.",
    statusFillOne: "Fyll i minst en övning.",
    statusCooperPick: "Välj både minuter och sekunder för Cooper.",
    statusAllNeedWeight: "Ange kroppsvikt för att räkna kg-värden.",
    placeholderResults: "Fyll i de fält du vill och tryck på Beräkna.",
    color: {
      red: "Röd",
      yellow: "Gul",
      green: "Grön",
      blue: "Ljusblå",
    },
    levelMsg: {
      1: "Måste tränas.",
      2: "Måste tränas.",
      3: "Hög prioritet.",
      4: "Prioritet.",
      5: "Kan följa ordinarie träning.",
      6: "Medel.",
      7: "God fysisk bas.",
      8: "Mycket god fysisk bas.",
      9: "Elitidrottare.",
      10: "Olympisk nivå.",
    },
    exercise: {
      squat: "Knäböj",
      bench: "Bänkpress",
      clean: "Frivändning",
      chins: "Chins",
      brutal: "Brutalbänk",
      dips: "Dips",
      cooper: "Cooper",
    },
    suffix: {
      bw: "(x BW)",
      reps: "(reps)",
      min: "(min)",
      kg: "(kg)",
    },
    gender: {
      male: "Herr",
      female: "Dam",
    },
    language: {
      sv: "Svenska",
      en: "Engelska",
    },
    labelLevel: "Nivå",
    detail: {
      ratio: "1RM {0} kg ({1} x kroppsvikt) - nivågräns {2} x BW",
      reps: "Max {0} reps - nivågräns {1} reps",
      time: "Tid {0} - nivågräns {1}",
    },
  },
  en: {
    title: "Dart Counter",
    subtitle:
      "Enter your body weight and personal records (1RM or reps) to get levels and color-coded feedback.",
    labelLanguage: "Language",
    labelGender: "Gender",
    labelBodyweight: "Body weight (kg)",
    labelSquat: "Squat 1RM (kg)",
    labelBench: "Bench press 1RM (kg)",
    labelClean: "Power clean 1RM (kg)",
    labelChins: "Chins (max reps)",
    labelBrutal: "Brutal bench (max reps)",
    labelDips: "Dips (max reps)",
    labelCooper: "Cooper (min)",
    promptBodyweight: "e.g. 82.5",
    promptSquat: "e.g. 140",
    promptBench: "e.g. 95",
    promptClean: "e.g. 80",
    promptChins: "e.g. 12",
    promptBrutal: "e.g. 18",
    promptDips: "e.g. 22",
    btnCalculate: "Calculate levels",
    btnClear: "Clear fields",
    btnUndo: "Undo clear",
    tabResults: "Results",
    tabTable: "SHF Requirement Profile",
    tabRadar: "Radar",
    tabAll: "My weight levels",
    statusFillField: "Fill in {0}.",
    statusInvalidNumber: "Invalid number in {0}.",
    statusBodyweightRequired: "Enter body weight for 1RM exercises.",
    statusBodyweightInvalid: "Body weight must be greater than 0.",
    statusFillOne: "Fill in at least one exercise.",
    statusCooperPick: "Select both minutes and seconds for Cooper.",
    statusAllNeedWeight: "Enter body weight to calculate kg values.",
    placeholderResults: "Fill in the fields you want and press Calculate.",
    color: {
      red: "Red",
      yellow: "Yellow",
      green: "Green",
      blue: "Light blue",
    },
    levelMsg: {
      1: "Must be trained.",
      2: "Must be trained.",
      3: "High priority.",
      4: "Priority.",
      5: "Can follow regular training.",
      6: "Average.",
      7: "Good physical base.",
      8: "Very good physical base.",
      9: "Elite athlete.",
      10: "Olympic level.",
    },
    exercise: {
      squat: "Squat",
      bench: "Bench press",
      clean: "Power clean",
      chins: "Chins",
      brutal: "Brutal bench",
      dips: "Dips",
      cooper: "Cooper",
    },
    suffix: {
      bw: "(x BW)",
      reps: "(reps)",
      min: "(min)",
      kg: "(kg)",
    },
    gender: {
      male: "Male",
      female: "Female",
    },
    language: {
      sv: "Swedish",
      en: "English",
    },
    labelLevel: "Level",
    detail: {
      ratio: "1RM {0} kg ({1} x bodyweight) - level threshold {2} x BW",
      reps: "Max {0} reps - level threshold {1} reps",
      time: "Time {0} - level threshold {1}",
    },
  },
};

const state = {
  lang: store.get("lang", "sv"),
  genderIndex: parseInt(store.get("genderIndex", "0"), 10) || 0,
  lastCleared: null,
  view: "results",
  lastLevels: [],
};

const EXERCISES = {
  male: [
    {
      id: "squat",
      type: "ratio",
      levels: [1.1, 1.22, 1.33, 1.44, 1.55, 1.66, 1.77, 1.88, 1.99, 2.1],
    },
    {
      id: "bench",
      type: "ratio",
      levels: [0.75, 0.82, 0.89, 0.96, 1.04, 1.11, 1.18, 1.25, 1.33, 1.4],
    },
    {
      id: "clean",
      type: "ratio",
      levels: [0.75, 0.82, 0.89, 0.96, 1.04, 1.11, 1.18, 1.25, 1.33, 1.4],
    },
    {
      id: "chins",
      type: "reps",
      levels: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    },
    {
      id: "brutal",
      type: "reps",
      levels: [3, 6, 9, 10, 13, 16, 20, 23, 26, 30],
    },
    {
      id: "dips",
      type: "reps",
      levels: [3, 6, 9, 10, 13, 16, 20, 23, 26, 30],
    },
    {
      id: "cooper",
      type: "time",
      levels: [
        13 * 60 + 15,
        12 * 60 + 58,
        12 * 60 + 41,
        12 * 60 + 24,
        12 * 60 + 7,
        11 * 60 + 50,
        11 * 60 + 33,
        11 * 60 + 17,
        11 * 60 + 1,
        10 * 60 + 45,
      ],
    },
  ],
  female: [
    {
      id: "squat",
      type: "ratio",
      levels: [0.75, 0.84, 0.94, 1.03, 1.13, 1.22, 1.32, 1.41, 1.51, 1.6],
    },
    {
      id: "bench",
      type: "ratio",
      levels: [0.5, 0.58, 0.67, 0.75, 0.83, 0.92, 1.0, 1.08, 1.17, 1.25],
    },
    {
      id: "clean",
      type: "ratio",
      levels: [0.5, 0.58, 0.67, 0.75, 0.83, 0.92, 1.0, 1.08, 1.17, 1.25],
    },
    {
      id: "chins",
      type: "reps",
      levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    {
      id: "brutal",
      type: "reps",
      levels: [3, 6, 10, 10, 13, 17, 20, 23, 27, 30],
    },
    {
      id: "dips",
      type: "reps",
      levels: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    },
    {
      id: "cooper",
      type: "time",
      levels: [
        14 * 60 + 10,
        13 * 60 + 50,
        13 * 60 + 30,
        13 * 60 + 10,
        12 * 60 + 50,
        12 * 60 + 30,
        12 * 60 + 10,
        11 * 60 + 50,
        11 * 60 + 30,
        11 * 60 + 10,
      ],
    },
  ],
};

function t(path) {
  const lang = i18n[state.lang];
  return path.split(".").reduce((acc, key) => acc[key], lang);
}

function format(template, ...values) {
  return template.replace(/\{(\d+)\}/g, (match, index) => values[index] ?? "");
}

function parseNumber(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(",", ".");
  const num = Number.parseFloat(normalized);
  return Number.isNaN(num) ? NaN : num;
}

function formatTime(seconds) {
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function levelDescriptor(level) {
  if (level <= 3) {
    return { color: t("color.red"), cls: "level-red", msg: t(`levelMsg.${level}`) };
  }
  if (level <= 6) {
    return {
      color: t("color.yellow"),
      cls: "level-yellow",
      msg: t(`levelMsg.${level}`),
    };
  }
  if (level <= 8) {
    return { color: t("color.green"), cls: "level-green", msg: t(`levelMsg.${level}`) };
  }
  return { color: t("color.blue"), cls: "level-blue", msg: t(`levelMsg.${level}`) };
}

function buildExercises() {
  const key = state.genderIndex === 1 ? "female" : "male";
  return EXERCISES[key].map((exercise) => ({
    ...exercise,
    name: t(`exercise.${exercise.id}`),
  }));
}

function setStatus(message = "") {
  $("status").textContent = message;
}

function readCooper() {
  const minutes = $("cooper-min").value;
  const seconds = $("cooper-sec").value;
  const minutesEmpty = minutes === "";
  const secondsEmpty = seconds === "";
  if (minutesEmpty && secondsEmpty) return null;
  if (minutesEmpty || secondsEmpty) {
    setStatus(t("statusCooperPick"));
    return NaN;
  }
  return parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
}

function readInputs(exercises) {
  const bodyWeight = parseNumber($("bodyweight").value);
  const hasRatioInput = ["squat", "bench", "clean"].some((id) => {
    const value = parseNumber($(id).value);
    return value !== null && !Number.isNaN(value);
  });
  if (hasRatioInput) {
    if (bodyWeight === null) {
      setStatus(format(t("statusFillField"), t("labelBodyweight")));
      return null;
    }
    if (Number.isNaN(bodyWeight) || bodyWeight <= 0) {
      setStatus(t("statusBodyweightInvalid"));
      return null;
    }
  }

  const values = {};
  for (const exercise of exercises) {
    if (exercise.id === "cooper") {
      const time = readCooper();
      if (Number.isNaN(time)) return null;
      values[exercise.id] = time;
      continue;
    }

    const field = $(exercise.id);
    const parsed = parseNumber(field.value);
    if (parsed === null) {
      values[exercise.id] = null;
      continue;
    }
    if (Number.isNaN(parsed)) {
      setStatus(format(t("statusInvalidNumber"), field.previousElementSibling?.textContent || ""));
      return null;
    }
    values[exercise.id] = parsed;
  }

  return { bodyWeight, values };
}

function computeLevel(exercise, value, bodyWeight) {
  if (exercise.type === "ratio") {
    if (!bodyWeight) return 1;
    const ratio = value / bodyWeight;
    let level = 1;
    exercise.levels.forEach((threshold, index) => {
      if (ratio >= threshold) level = index + 1;
    });
    return level;
  }
  if (exercise.type === "time") {
    let level = 1;
    exercise.levels.forEach((threshold, index) => {
      if (value <= threshold) level = index + 1;
    });
    return level;
  }
  let level = 1;
  exercise.levels.forEach((threshold, index) => {
    if (value >= threshold) level = index + 1;
  });
  return level;
}

function buildDetail(exercise, value, level, bodyWeight) {
  if (exercise.type === "ratio") {
    const ratio = value / bodyWeight;
    return format(
      t("detail.ratio"),
      value.toFixed(1),
      ratio.toFixed(2),
      exercise.levels[level - 1].toFixed(2)
    );
  }
  if (exercise.type === "time") {
    return format(t("detail.time"), formatTime(value), formatTime(exercise.levels[level - 1]));
  }
  return format(t("detail.reps"), value.toFixed(0), exercise.levels[level - 1].toFixed(0));
}

function renderResults(results) {
  const container = $("results-list");
  container.innerHTML = "";
  if (!results.length) {
    container.innerHTML = `<div class="result-card">${t("placeholderResults")}</div>`;
    return;
  }
  results.forEach((item) => {
    const card = document.createElement("div");
    card.className = `result-card ${item.descriptor.cls}`;
    card.innerHTML = `
      <div>
        <div class="result-title">${item.exercise} - ${t("labelLevel")} ${item.level}</div>
        <div class="result-msg">${item.descriptor.msg}</div>
        <div class="result-detail">${item.detail}</div>
      </div>
      <div class="result-chip">${item.descriptor.color}</div>
    `;
    container.appendChild(card);
  });
}

function renderLevelTable(exercises) {
  const container = $("table-container");
  const headers = Array.from({ length: 10 }, (_, i) => i + 1);
  const rows = exercises.map((ex) => {
    const values = ex.levels.map((val) => {
      if (ex.type === "ratio") return val.toFixed(2);
      if (ex.type === "time") return formatTime(val);
      return val.toFixed(0);
    });
    const suffix = ex.type === "ratio" ? t("suffix.bw") : ex.type === "time" ? t("suffix.min") : t("suffix.reps");
    return { label: `${ex.name} ${suffix}`, values };
  });

  container.innerHTML = buildTable([t("labelLevel"), ...headers], rows);
}

function renderAllLevels(exercises, bodyWeight) {
  const container = $("all-container");
  const headers = Array.from({ length: 10 }, (_, i) => i + 1);
  const rows = exercises.map((ex) => {
    const values = ex.levels.map((val) => {
      if (ex.type === "ratio") {
        if (!bodyWeight) return "-";
        return (val * bodyWeight).toFixed(1);
      }
      if (ex.type === "time") return formatTime(val);
      return val.toFixed(0);
    });
    const suffix = ex.type === "ratio" ? t("suffix.kg") : ex.type === "time" ? t("suffix.min") : t("suffix.reps");
    return { label: `${ex.name} ${suffix}`, values };
  });

  container.innerHTML = buildTable([t("labelLevel"), ...headers], rows);
}

function buildTable(headers, rows) {
  const thead = `<thead><tr>${headers
    .map((h, i) => (i === 0 ? `<th>${h}</th>` : `<th class="lvl-${i}">${h}</th>`))
    .join("")}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map(
      (row) => `<tr>${[
        `<td>${row.label}</td>`,
        ...row.values.map((v, i) => `<td class="lvl-${i + 1}">${v}</td>`),
      ].join("")}</tr>`
    )
    .join("")}</tbody>`;
  return `<table class="table">${thead}${tbody}</table>`;
}

function drawRadar(exercises, levels) {
  const canvas = $("radar");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const radius = Math.min(width, height) / 2 - 40;
  const cx = width / 2;
  const cy = height / 2;

  ctx.strokeStyle = "rgba(60, 70, 90, 0.25)";
  for (let ring = 1; ring <= 10; ring += 1) {
    const r = (radius * ring) / 10;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const count = exercises.length;
  const step = (Math.PI * 2) / count;
  ctx.fillStyle = "rgba(22, 27, 34, 0.92)";
  ctx.font = '12px "Avenir Next"';
  for (let i = 0; i < count; i += 1) {
    const angle = -Math.PI / 2 + step * i;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();

    const label = exercises[i].name;
    const offsetX = x > cx ? 8 : -8;
    const offsetY = y > cy ? 14 : -6;
    ctx.fillText(label, x + offsetX - label.length * 3, y + offsetY);
  }

  if (!levels.length) return;

  const points = levels.map((level, i) => {
    const value = Math.max(0, Math.min(10, level));
    const angle = -Math.PI / 2 + step * i;
    const r = (radius * value) / 10;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      value,
    };
  });

  ctx.strokeStyle = "rgba(31, 58, 147, 0.7)";
  ctx.fillStyle = "rgba(31, 58, 147, 0.25)";
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  ctx.fillStyle = "rgba(31, 58, 147, 0.95)";
  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(22, 27, 34, 0.95)";
  points.forEach((p, i) => {
    const label = String(levels[i]);
    const offsetX = p.x > cx ? 8 : -8;
    const offsetY = p.y > cy ? 14 : -8;
    ctx.fillText(label, p.x + offsetX, p.y + offsetY);
  });
}

function render() {
  const exercises = buildExercises();
  const inputs = readInputs(exercises);
  if (inputs === null) return;
  setStatus("");

  const results = [];
  const levelsByExercise = [];
  exercises.forEach((exercise) => {
    const value = inputs.values[exercise.id];
    if (value === null) {
      levelsByExercise.push(0);
      return;
    }
    if (exercise.type === "ratio" && !inputs.bodyWeight) {
      setStatus(t("statusBodyweightRequired"));
      return;
    }
    const level = computeLevel(exercise, value, inputs.bodyWeight);
    levelsByExercise.push(level);
    const descriptor = levelDescriptor(level);
    const detail = buildDetail(exercise, value, level, inputs.bodyWeight);
    results.push({
      exercise: exercise.name,
      level,
      descriptor,
      detail,
    });
  });

  if (!results.length) {
    setStatus(t("statusFillOne"));
    renderResults([]);
    state.lastLevels = [];
    drawRadar(exercises, []);
    return;
  }

  state.lastLevels = levelsByExercise;
  renderResults(results);
  renderLevelTable(exercises);
  renderAllLevels(exercises, inputs.bodyWeight);
  drawRadar(exercises, levelsByExercise);

  saveInputs();
}

function setView(view) {
  state.view = view;
  [
    "results",
    "table",
    "radar",
    "all",
  ].forEach((name) => {
    $("view-" + name).classList.toggle("hidden", name !== view);
    $("tab-" + name).classList.toggle("active", name === view);
  });
  $("results-title").textContent =
    view === "results"
      ? t("tabResults")
      : view === "table"
      ? t("tabTable")
      : view === "all"
      ? t("tabAll")
      : t("tabRadar");
}

function saveInputs() {
  store.set("bodyWeight", $("bodyweight").value.trim());
  ["squat", "bench", "clean", "chins", "brutal", "dips"].forEach((id) => {
    store.set(id, $(id).value.trim());
  });
  store.set("cooperMinutes", $("cooper-min").value);
  store.set("cooperSeconds", $("cooper-sec").value);
}

function restoreInputs() {
  $("bodyweight").value = store.get("bodyWeight", "");
  ["squat", "bench", "clean", "chins", "brutal", "dips"].forEach((id) => {
    $(id).value = store.get(id, "");
  });
  const minutes = store.get("cooperMinutes", "");
  const seconds = store.get("cooperSeconds", "");
  $("cooper-min").value = minutes;
  $("cooper-sec").value = seconds;
}

function snapshotInputs() {
  return {
    bodyweight: $("bodyweight").value,
    squat: $("squat").value,
    bench: $("bench").value,
    clean: $("clean").value,
    chins: $("chins").value,
    brutal: $("brutal").value,
    dips: $("dips").value,
    cooperMin: $("cooper-min").value,
    cooperSec: $("cooper-sec").value,
  };
}

function restoreSnapshot(snapshot) {
  $("bodyweight").value = snapshot.bodyweight;
  $("squat").value = snapshot.squat;
  $("bench").value = snapshot.bench;
  $("clean").value = snapshot.clean;
  $("chins").value = snapshot.chins;
  $("brutal").value = snapshot.brutal;
  $("dips").value = snapshot.dips;
  $("cooper-min").value = snapshot.cooperMin;
  $("cooper-sec").value = snapshot.cooperSec;
}

function updateUndo() {
  const btn = $("undo");
  btn.style.display = state.lastCleared ? "inline-flex" : "none";
}

function initSelects() {
  const langSelect = $("language");
  langSelect.innerHTML = `
    <option value="sv">${t("language.sv")}</option>
    <option value="en">${t("language.en")}</option>
  `;
  langSelect.value = state.lang;

  const genderSelect = $("gender");
  genderSelect.innerHTML = `
    <option value="0">${t("gender.male")}</option>
    <option value="1">${t("gender.female")}</option>
  `;
  genderSelect.value = String(state.genderIndex);

  const minSelect = $("cooper-min");
  minSelect.innerHTML = '<option value=""></option>';
  for (let i = 1; i <= 59; i += 1) {
    minSelect.innerHTML += `<option value="${i}">${i}</option>`;
  }

  const secSelect = $("cooper-sec");
  secSelect.innerHTML = '<option value=""></option>';
  for (let i = 0; i <= 59; i += 1) {
    const val = String(i).padStart(2, "0");
    secSelect.innerHTML += `<option value="${val}">${val}</option>`;
  }
}

function applyTexts() {
  $("title").textContent = t("title");
  $("subtitle").textContent = t("subtitle");
  $("label-language").textContent = t("labelLanguage");
  $("label-gender").textContent = t("labelGender");
  $("label-bodyweight").textContent = t("labelBodyweight");
  $("label-squat").textContent = t("labelSquat");
  $("label-bench").textContent = t("labelBench");
  $("label-clean").textContent = t("labelClean");
  $("label-chins").textContent = t("labelChins");
  $("label-brutal").textContent = t("labelBrutal");
  $("label-dips").textContent = t("labelDips");
  $("label-cooper").textContent = t("labelCooper");

  $("bodyweight").placeholder = t("promptBodyweight");
  $("squat").placeholder = t("promptSquat");
  $("bench").placeholder = t("promptBench");
  $("clean").placeholder = t("promptClean");
  $("chins").placeholder = t("promptChins");
  $("brutal").placeholder = t("promptBrutal");
  $("dips").placeholder = t("promptDips");

  $("calculate").textContent = t("btnCalculate");
  $("clear").textContent = t("btnClear");
  $("undo").textContent = t("btnUndo");

  $("tab-results").textContent = t("tabResults");
  $("tab-table").textContent = t("tabTable");
  $("tab-radar").textContent = t("tabRadar");
  $("tab-all").textContent = t("tabAll");
}

function init() {
  if (!i18n[state.lang]) state.lang = "sv";
  applyTexts();
  initSelects();
  restoreInputs();
  updateUndo();
  setView(state.view);
  renderResults([]);

  $("language").addEventListener("change", (e) => {
    state.lang = e.target.value;
    store.set("lang", state.lang);
    applyTexts();
    initSelects();
    restoreInputs();
    render();
  });

  $("gender").addEventListener("change", (e) => {
    state.genderIndex = Number(e.target.value);
    store.set("genderIndex", String(state.genderIndex));
    render();
  });

  $("calculate").addEventListener("click", () => {
    setStatus("");
    render();
  });

  $("clear").addEventListener("click", () => {
    state.lastCleared = snapshotInputs();
    ["bodyweight", "squat", "bench", "clean", "chins", "brutal", "dips"].forEach((id) => {
      $(id).value = "";
    });
    $("cooper-min").value = "";
    $("cooper-sec").value = "";
    setStatus("");
    saveInputs();
    updateUndo();
    renderResults([]);
    drawRadar(buildExercises(), []);
  });

  $("undo").addEventListener("click", () => {
    if (!state.lastCleared) return;
    restoreSnapshot(state.lastCleared);
    state.lastCleared = null;
    saveInputs();
    updateUndo();
  });

  $("tab-results").addEventListener("click", () => setView("results"));
  $("tab-table").addEventListener("click", () => setView("table"));
  $("tab-radar").addEventListener("click", () => setView("radar"));
  $("tab-all").addEventListener("click", () => {
    const bodyWeight = parseNumber($("bodyweight").value);
    if (bodyWeight === null) {
      setStatus(t("statusAllNeedWeight"));
    }
    renderAllLevels(buildExercises(), bodyWeight);
    setView("all");
  });

  window.addEventListener("resize", () => {
    const canvas = $("radar");
    canvas.width = Math.min(700, canvas.parentElement.clientWidth - 40);
    canvas.height = 520;
    drawRadar(buildExercises(), state.lastLevels);
  });
}

init();

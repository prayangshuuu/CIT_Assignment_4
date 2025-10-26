// scripts.js

/* Header */
const el = (sel) => document.querySelector(sel);
const els = (sel) => Array.from(document.querySelectorAll(sel));

/* Header */
const SETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digits: "0123456789",
    symbols: "!@#$%^&*+-=_?~|",
    ambig: "{}[]()/'\"`~,;:.<>\\",
    similar: "il1Lo0O",
};

/* Header */
function buildCharset(opts) {
    let chars = "";
    if (opts.lower) chars += SETS.lower;
    if (opts.upper) chars += SETS.upper;
    if (opts.digits) chars += SETS.digits;
    if (opts.symbols) chars += SETS.symbols;
    if (opts.noAmbig) chars = [...chars].filter((c) => !SETS.ambig.includes(c)).join("");
    if (opts.noSimilar) chars = [...chars].filter((c) => !SETS.similar.includes(c)).join("");
    return chars;
}

/* Header */
function getOptions() {
    const len = clamp(parseInt(el("#length").value, 10) || 16, 6, 64);
    return {
        length: len,
        lower: el("#lower").checked,
        upper: el("#upper").checked,
        digits: el("#digits").checked,
        symbols: el("#symbols").checked,
        noSimilar: el("#noSimilar").checked,
        noAmbig: el("#noAmbig").checked,
        noRepeat: el("#noRepeat").checked,
        requireEach: el("#requireEach").checked,
    };
}

/* Header */
function randInt(maxExclusive) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % maxExclusive;
}

/* Header */
function sample(chars) { return chars[randInt(chars.length)]; }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

/* Header */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/* Header */
function generatePassword(opts) {
    let charset = buildCharset(opts);
    if (!charset) throw new Error("Select at least one character set.");

    const pools = [];
    if (opts.lower) pools.push(SETS.lower);
    if (opts.upper) pools.push(SETS.upper);
    if (opts.digits) pools.push(SETS.digits);
    if (opts.symbols) pools.push(SETS.symbols);

    if (opts.noAmbig) {
        for (let i = 0; i < pools.length; i++) {
            pools[i] = [...pools[i]].filter((c) => !SETS.ambig.includes(c)).join("");
        }
    }
    if (opts.noSimilar) {
        for (let i = 0; i < pools.length; i++) {
            pools[i] = [...pools[i]].filter((c) => !SETS.similar.includes(c)).join("");
        }
    }

    const activePools = pools.filter((p) => p.length > 0);
    if (activePools.length === 0) throw new Error("All selected sets were filtered out. Relax exclusions.");

    const result = [];
    if (opts.requireEach) activePools.forEach((p) => result.push(sample(p)));

    while (result.length < opts.length) {
        const ch = sample(charset);
        if (opts.noRepeat && result.includes(ch)) continue;
        result.push(ch);
    }

    if (result.length > opts.length) result.length = opts.length;

    return shuffle(result).join("");
}

/* Header */
function bitsPerCharFromCharsetSize(n) { return Math.log2(n); }
function entropy(bitsPerChar, length) { return bitsPerChar * length; }
function classifyStrength(ent) {
    if (ent < 40) return { label: "Weak", pct: 25 };
    if (ent < 60) return { label: "Okay", pct: 45 };
    if (ent < 80) return { label: "Strong", pct: 70 };
    return { label: "Excellent", pct: 100 };
}

/* Header */
const lengthRange = el("#length");
const lengthNum = el("#lengthNum");
const lengthVal = el("#lengthVal");
const $password = el("#password");
const $bar = el("#bar");
const $entropy = el("#entropyLabel");
const $strength = el("#strengthLabel");
const $charset = el("#charsetLabel");
const $hint = el("#hint");

/* Header */
function syncLengthInputs(v) {
    v = clamp(parseInt(v, 10) || 16, 6, 64);
    lengthRange.value = v;
    lengthNum.value = v;
    lengthVal.textContent = v;
}

/* Header */
[lengthRange, lengthNum].forEach((inp) => {
    inp.addEventListener("input", (e) => {
        syncLengthInputs(e.target.value);
        updatePreview(false);
    });
});

/* Header */
els('.options input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", () => updatePreview(false));
});

/* Header */
function updatePreview(regen = true) {
    try {
        const opts = getOptions();
        const charset = buildCharset(opts);
        const bpc = bitsPerCharFromCharsetSize(charset.length);
        const H = entropy(bpc, opts.length);
        const str = classifyStrength(H);

        $entropy.textContent = `Entropy: ${H.toFixed(1)} bits`;
        $charset.textContent = `Charset: ${charset.length} chars`;
        $strength.textContent = `Strength: ${str.label}`;
        requestAnimationFrame(() => { $bar.style.width = str.pct + "%"; });
        $hint.textContent = "Entropy is the log₂ of the search space. Higher is stronger.";

        if (regen) {
            const pwd = generatePassword(opts);
            $password.textContent = pwd;
        }
    } catch (err) {
        $entropy.textContent = "Entropy: —";
        $charset.textContent = "Charset: —";
        $strength.textContent = "Strength: —";
        $bar.style.width = "0%";
        $hint.textContent = err.message;
    }
}

/* Header */
function copyToClipboard(text) { return navigator.clipboard.writeText(text); }
function toast(btn, ok = true) {
    const prev = btn.textContent;
    btn.textContent = ok ? "Copied!" : "Failed";
    btn.disabled = true;
    setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 900);
}

/* Header */
function regen() { updatePreview(true); }
el("#generate").addEventListener("click", regen);
el("#regen").addEventListener("click", regen);

/* Header */
function copyHandler(btn) {
    const txt = $password.textContent;
    if (!txt || txt === "—") return;
    copyToClipboard(txt).then(() => toast(btn, true)).catch(() => toast(btn, false));
}
el("#copy").addEventListener("click", (e) => copyHandler(e.currentTarget));
el("#copy2").addEventListener("click", (e) => copyHandler(e.currentTarget));

/* Header */
const HISTORY_KEY = "vaultforge_pw_history_v1";
const $hist = el("#history");

/* Header */
function loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } }
function saveHistory(arr) { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, 100))); }

/* Header */
function renderHistory() {
    const items = loadHistory();
    $hist.innerHTML = "";
    if (!items.length) { $hist.innerHTML = '<div class="mini">No saved passwords yet.</div>'; return; }
    items.forEach((p, idx) => {
        const row = document.createElement("div");
        row.className = "history-item";
        row.innerHTML = `<span>${p}</span><span class="row" style="gap:.35rem; justify-content:end;"><button class="btn ghost sm" data-copy>Copy</button><button class="btn ghost sm" data-del>Delete</button></span>`;
        row.querySelector("[data-copy]").addEventListener("click", () => copyToClipboard(p));
        row.querySelector("[data-del]").addEventListener("click", () => {
            const all = loadHistory();
            all.splice(idx, 1);
            saveHistory(all); renderHistory();
        });
        $hist.appendChild(row);
    });
}

/* Header */
el("#save").addEventListener("click", () => {
    const txt = $password.textContent;
    if (!txt || txt === "—") return;
    const items = loadHistory();
    if (!items.includes(txt)) items.unshift(txt);
    saveHistory(items); renderHistory();
});
el("#clearHistory").addEventListener("click", () => { saveHistory([]); renderHistory(); });

/* Header */
const themeBtn = el("#themeToggle");
const THEME_KEY = "vaultforge_theme_v1";

/* Header */
function applyTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    themeBtn.dataset.mode = mode;
}
function detectPreferred() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
themeBtn.addEventListener("click", () => {
    const current = themeBtn.dataset.mode || detectPreferred();
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
});

/* Header */
(function init() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    applyTheme(savedTheme || detectPreferred());
    syncLengthInputs(lengthRange.value);
    updatePreview(true);
    renderHistory();
})();

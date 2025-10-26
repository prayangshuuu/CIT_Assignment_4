/* Header */
const $ = (s) => document.querySelector(s);
const el = {
    root: document.documentElement,
    themeBtn: $("#themeBtn"),
    themeLabel: $("#themeLabel"),
    form: $("#bmiForm"),
    alert: $("#alert"),
    age: $("#age"),
    gender: () => document.querySelector('input[name="gender"]:checked')?.value,
    heightFt: $("#heightFt"),
    heightIn: $("#heightIn"),
    weight: $("#weight"),
    unit: $("#unit"),
    results: $("#results"),
    bmiPill: $("#bmiPill"),
    classPill: $("#classPill"),
    bfpPill: $("#bfpPill"),
    meterBar: $("#meterBar"),
    rangeText: $("#rangeText"),
    interpretation: $("#interpretation"),
    resetBtn: $("#resetBtn"),
};

/* Main */
function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function setTheme(mode) {
    if (mode === "system") {
        el.root.setAttribute("data-theme", systemPrefersDark() ? "dark" : "light");
    } else {
        el.root.setAttribute("data-theme", mode);
    }
    el.themeBtn?.setAttribute("data-mode", mode);
    el.themeLabel.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    try { localStorage.setItem("bmi-theme", mode); } catch {}
}
(function initTheme() {
    const saved = (() => {
        try { return localStorage.getItem("bmi-theme") || "system"; } catch { return "system"; }
    })();
    setTheme(saved);
})();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if ((el.themeBtn.getAttribute("data-mode") || "system") === "system") setTheme("system");
});
el.themeBtn?.addEventListener("click", (e) => {
    // ripple coords
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--y", `${((e.clientY - r.top) / r.height) * 100}%`);

    const current = el.themeBtn.getAttribute("data-mode") || "system";
    const next = current === "system" ? "dark" : current === "dark" ? "light" : "system";
    setTheme(next);
});

function showError(msg) {
    el.alert.textContent = msg;
    el.alert.style.display = "block";
    el.alert.setAttribute("aria-live", "assertive");
}
function clearError() {
    el.alert.textContent = "";
    el.alert.style.display = "none";
    el.alert.removeAttribute("aria-live");
}

function validate() {
    const age = Number(el.age.value);
    if (!Number.isFinite(age) || age < 2 || age > 120) { showError("Age must be between 2 and 120."); return false; }
    const ft = Number(el.heightFt.value), inch = Number(el.heightIn.value);
    if (!Number.isFinite(ft) || !Number.isFinite(inch) || ft < 0 || inch < 0) { showError("Enter a valid height (non-negative)."); return false; }
    if (ft === 0 && inch === 0) { showError("Height cannot be zero."); return false; }
    const w = Number(el.weight.value);
    if (!Number.isFinite(w) || w <= 0) { showError("Enter a weight greater than zero."); return false; }
    clearError(); return true;
}

["age","heightFt","heightIn","weight"].forEach(id => document.getElementById(id)?.addEventListener("input", clearError));

function toMeters(ft, inch) { return (ft * 12 + inch) * 0.0254; }
function kgFrom(w, unit) { return unit === "kg" ? w : w * 0.45359237; }
function r2(n) { return Math.round(n * 100) / 100; }
function classify(bmi) { if (bmi < 18.5) return "Underweight"; if (bmi < 25) return "Normal"; if (bmi < 30) return "Overweight"; return "Obese"; }
function bfp(bmi, age, gender) { const sex = gender === "male" ? 1 : 0; return 1.2 * bmi + 0.23 * age - 10.8 * sex - 5.4; }
function barWidth(bmi) { const c = Math.max(0, Math.min(40, bmi)); return (c / 40) * 100; }

el.form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;

    const age = Number(el.age.value);
    const gender = el.gender();
    const m = toMeters(Number(el.heightFt.value), Number(el.heightIn.value));
    const kg = kgFrom(Number(el.weight.value), el.unit.value);

    const bmi = kg / (m * m);
    const bmiR = r2(bmi);
    const cls = classify(bmi);
    const bf = r2(bfp(bmi, age, gender));

    el.bmiPill.textContent = `BMI: ${bmiR}`;
    el.classPill.textContent = `Category: ${cls}`;
    el.bfpPill.textContent = `Est. Body Fat: ${bf}%`;

    el.meterBar.style.width = `${barWidth(bmi)}%`;
    el.rangeText.textContent = "Healthy BMI range: 18.5–24.9";

    const lines = [];
    lines.push(`Your BMI is ${bmiR} (${cls}).`);
    lines.push(
        gender === "male"
            ? `For males, ${bf}% is ${bf >= 10 && bf <= 20 ? "within" : "outside"} a typical healthy body-fat range.`
            : `For females, ${bf}% is ${bf >= 18 && bf <= 28 ? "within" : "outside"} a typical healthy body-fat range.`
    );
    lines.push("BMI is a screening tool and may not reflect body composition.");
    el.interpretation.textContent = lines.join(" ");

    el.results.hidden = false;

    try { el.results.scrollIntoView({ behavior: "smooth", block: "start" }); } catch {}
});

el.resetBtn?.addEventListener("click", () => {
    el.form.reset();
    clearError();
    el.results.hidden = true;
    el.meterBar.style.width = "0%";
    el.bmiPill.textContent = "BMI: —";
    el.classPill.textContent = "Category: —";
    el.bfpPill.textContent = "Est. Body Fat: —";
    el.interpretation.textContent = "Fill the form and click “Calculate”.";
});

/* subtle parallax on mouse move */
document.addEventListener("pointermove", (e) => {
    const xp = (e.clientX / window.innerWidth - 0.5) * 6;
    const yp = (e.clientY / window.innerHeight - 0.5) * 6;
    document.body.style.setProperty("--tiltX", `${yp}deg`);
    document.body.style.setProperty("--tiltY", `${-xp}deg`);
});

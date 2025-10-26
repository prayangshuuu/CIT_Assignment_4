# CIT_Assignment_4

Two small, polished web apps built with **HTML, CSS, and JavaScript**:

1) **BMI Calculator** — calculates Body Mass Index with friendly guidance, theme toggle, and accessibility.
2) **Random Password Generator** — builds strong passwords with live entropy (strength) feedback and a handy history.
---

## 🌐 Live Links

- **BMI Calculator:**
- **Random Password Generator:**

---

# 1) BMI Calculator

### 🧠 What it does
Enter **age, gender, height (ft + in), and weight**. The app:
- Validates inputs and explains problems clearly.
- Computes **BMI**, shows the **category** (Underweight/Normal/Overweight/Obese).
- Estimates **Body Fat % (BFP)** (Deurenberg-like equation) as an *approximation*.
- Animates a **meter bar** and provides **plain-language interpretation**.

### 🔩 Core Logic (in plain English)

- **Height to meters**  
  Convert feet+inches to inches, then to meters:  
  `meters = (feet * 12 + inches) × 0.0254`

- **Weight to kg**  
  If you choose pounds, convert to kilograms:  
  `kg = pounds × 0.45359237` (if already kg, use as-is)

- **BMI formula**  
  BMI compares your weight to your height squared:  
  `BMI = weight_in_kg / (height_in_meters × height_in_meters)`

- **BMI categories**
    - `< 18.5` → Underweight
    - `18.5 – 24.9` → Normal
    - `25.0 – 29.9` → Overweight
    - `≥ 30.0` → Obese

- **Estimated Body Fat % (BFP)**  
  A rough estimate that depends on BMI, age, and sex:  
  `BFP = 1.2 × BMI + 0.23 × age − 10.8 × sex − 5.4`  
  where `sex = 1` for male, `0` for female.
  > ⚠️ This is a **screening estimate**, not a medical diagnosis.

- **Safety checks**
    - Age between 2 and 120.
    - Height cannot be zero.
    - Weight must be greater than zero.

### 🧪 Example
If you are **5 ft 8 in** (68 inches → 1.7272 m) and **70 kg**:
- `BMI = 70 / (1.7272²) ≈ 23.5` → **Normal**
- If age 25 and male: `BFP ≈ 1.2×23.5 + 0.23×25 - 10.8×1 - 5.4 ≈ 16%`
 
> 🗂 **Folder:** `BMICalculator/`

---

# 2) Random Password Generator

### 🧠 What it does
Create strong, unique passwords with **custom character sets**, **length control**, **no-repeat**, **exclude ambiguous/similar characters**, and **“require at least one of each selected set.”**  
Shows **entropy** (strength estimate) with a live **strength bar**, and lets you **copy** or **save** to local history.

### 🔩 Core Logic (in plain English)

- **Character sets you can include**
    - Lowercase: `a–z`
    - Uppercase: `A–Z`
    - Digits: `0–9`
    - Symbols: `!@#$%^&*+-=_?~|`
    - Optional exclusions:
        - **Ambiguous**: `{ } [ ] ( ) / ' " \` ~ , ; : . < > \`
        - **Similar** (look-alikes): `i l 1 L o 0 O`

- **Building the pool**
    1) Start with an empty string.
    2) Append each selected set.
    3) Filter ambiguous/similar characters if needed.
    4) If nothing remains, show an error suggesting to relax exclusions.

- **Fair randomness**
  Uses the browser’s **`crypto.getRandomValues`** for secure random character selection.

- **Guaranteeing variety**
  If **“require each”** is on:
    - One random char from each selected set is added first.
    - The rest are filled from the full pool.
    - The final result is **shuffled** for true randomness.

- **No repeated characters (optional)**
  Skips characters that already exist in the result.
  > If your pool is too small, disable this or increase password length.

- **Entropy (strength estimate)**
  Entropy measures how hard it is to brute-force the password:
    - Bits per character ≈ `log₂(pool size)`
    - Total entropy ≈ `bits per char × length`
    - Strength levels:
        - `< 40 bits` → Weak
        - `40–60` → Okay
        - `60–80` → Strong
        - `≥ 80` → Excellent

### 🧪 Example
Choose: **lower + upper + digits + symbols**, length **16**
- Pool size: `26 + 26 + 10 + 14 = 76`
- Bits per char: `log₂(76) ≈ 6.25`
- Entropy: `6.25 × 16 ≈ 100 bits` → **Excellent**

> 🗂 **Folder:** `RandomPasswordGenerator/`

---


## 🧩 Logics

### BMI Calculator
- `toMeters(ft, inch)` → Converts height.
- `kgFrom(w, unit)` → Converts lb → kg.
- `classify(bmi)` → Returns BMI category.
- `bfp(bmi, age, gender)` → Estimates body fat %.
- `barWidth(bmi)` → Adjusts visual meter.

### Password Generator
- `buildCharset(opts)` → Builds character set.
- `randInt(n)` → Secure random index via crypto API.
- `generatePassword(opts)` → Builds final password.
- `entropy(bpc, len)` → Calculates entropy bits.
- `classifyStrength(H)` → Maps entropy to label.

---
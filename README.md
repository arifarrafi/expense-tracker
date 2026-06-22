# 📚 Exam Solutions Portal — Setup & Deployment Guide

**Three-layer system:** Google Sheets (data) → Apps Script (API) → GitHub Pages (frontend)

**Write answers as plain text — no HTML, no coding.** The system auto-formats headings, bold text, lists, tables, code blocks, formulas, and images (including pasted Google Drive links) into a polished page. See Section 9.

---

## Table of Contents
1. [Create the Google Sheet](#1-create-the-google-sheet)
2. [Set Up Apps Script Backend](#2-set-up-apps-script-backend)
3. [Deploy the Web App (API)](#3-deploy-the-web-app-api)
4. [Set Up GitHub Pages (Frontend)](#4-set-up-github-pages-frontend)
5. [Connect Frontend to Backend](#5-connect-frontend-to-backend)
6. [Test the Site](#6-test-the-site)
7. [Adding Questions (Content Guide)](#7-adding-questions-content-guide)
8. [Managing Users (Access Control)](#8-managing-users-access-control)
9. [Writing Questions & Answers — Plain Text Guide](#9-writing-questions--answers--plain-text-guide)
10. [Choosing the Right Format for Your Answer](#10-choosing-the-right-format-for-your-answer)
11. [The Category Filter (Programming / Circuit / Electronics…)](#11-the-category-filter)
12. [In-Sheet Tools (Templates, Cheat Sheet, Validator)](#12-in-sheet-tools)
13. [Image Hosting Guide](#13-image-hosting-guide)
14. [Math Formula Guide (Advanced, Optional)](#14-math-formula-guide-advanced-optional)
15. [Troubleshooting](#15-troubleshooting)
16. [Future Expansion](#16-future-expansion)

---

## 1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a **new blank spreadsheet**.
2. Name it something like **"Exam Solutions Portal"**.
3. Note the **Spreadsheet ID** from the URL — it looks like:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
   You will not need this ID directly (the script is "bound" to the sheet), but keep it for reference.

---

## 2. Set Up Apps Script Backend

1. In your Google Sheet, click **Extensions → Apps Script**.
2. A new Apps Script editor opens. **Delete all existing code** in `Code.gs`.
3. **Paste the entire contents of `Code.gs`** from this project.
4. Click **💾 Save** (Ctrl+S / Cmd+S).

### Run the Setup Function

5. In the function dropdown at the top, select **`setupSheets`**.
6. Click **▶ Run**.
7. A permissions dialog will appear — click **Review permissions → Allow**.
   *(This allows the script to read/write your Google Sheet.)*
8. You should see a popup:

   ```
   ✅ Setup complete!
   Sheets created: QUESTIONS, USERS, 📋 HOW_TO_ADD_CONTENT
   Default logins:
     admin    / admin123
     student1 / student2026
   ⚠️ CHANGE THE ADMIN PASSWORD before publishing!
   ```

9. Go back to your Google Sheet — you will see three new tabs created:
   - **QUESTIONS** — where all exam questions live
   - **USERS** — login credentials and access control
   - **📋 HOW_TO_ADD_CONTENT** — in-sheet reference guide

---

## 3. Deploy the Web App (API)

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the **gear icon ⚙️** next to "Type" → select **Web app**.
3. Configure:
   - **Description:** `Exam Portal API v1` (any name)
   - **Execute as:** `Me` (your Google account)
   - **Who has access:** `Anyone`
4. Click **Deploy**.
5. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
   **Keep this URL — you need it in Step 5.**

> ⚠️ **Important:** Every time you edit `Code.gs`, you must create a **new deployment version** to apply changes:
> Deploy → Manage deployments → click ✏️ edit on your deployment → Version: "New version" → Deploy.

---

## 4. Set Up GitHub Pages (Frontend)

### Option A — GitHub.com (no Git required)

1. Go to [github.com](https://github.com) and create a **new public repository**.
   - Name it: `exam-portal` (or anything you like)
   - Visibility: **Public** (required for free GitHub Pages)
2. Click **Add file → Upload files**.
3. Upload **`index.html`** from this project.
4. Commit the file with message: `Add exam portal frontend`.
5. Go to **Settings → Pages** (left sidebar).
6. Under "Source": select branch **`main`**, folder **`/ (root)`**.
7. Click **Save**.
8. After ~60 seconds, your site will be live at:
   ```
   https://YOUR_GITHUB_USERNAME.github.io/exam-portal/
   ```

### Option B — Custom Domain

After completing Option A, go to **Settings → Pages → Custom domain** and enter your domain.

---

## 5. Connect Frontend to Backend

1. Open `index.html` in a text editor.
2. Find this line near the top of the `<script>` section (~line 18):
   ```javascript
   const GAS_URL = 'PASTE_YOUR_GAS_DEPLOYMENT_URL_HERE';
   ```
3. Replace the placeholder with your actual URL from Step 3:
   ```javascript
   const GAS_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```
4. Save the file and re-upload it to your GitHub repository (replace the existing `index.html`).
5. Wait ~30 seconds for GitHub Pages to update.

---

## 6. Test the Site

1. Visit your GitHub Pages URL.
2. Log in with: **admin / admin123**
3. You should see the sample question (C++ rope problem) loaded from the sheet.
4. **Immediately change the admin password** (see Section 8).

### Quick connectivity test
If questions don't load, open your browser's **Developer Tools → Console** and look for error messages. Common issues are listed in Section 12.

---

## 7. Adding Questions (Content Guide)

Open the **QUESTIONS** sheet in your Google Sheet. Each row = one question card on the website.

### Column Reference

| Column | What to Enter | Example |
|--------|--------------|---------|
| **ID** | Unique ID. Use Q001, Q002… | `Q042` |
| **University** | Full name (consistent spelling!) | `Chandpur STU` |
| **Department** | Abbreviation | `EEE` |
| **Year** | 4-digit year | `2026` |
| **ExamType** | See options below | `Written` |
| **Category** | Broad subject — powers the topic filter chips | `Programming`, `Circuit Analysis` |
| **QuestionNumber** | Badge on card | `Q3` or `Q1a` |
| **Topic** | Short title on card header (different from Category!) | `Kruskal's MST Algorithm` |
| **QuestionText** | The question — **plain text**, same formatting as Answer | Supports code blocks, tables, formulas, images too (Section 9) |
| **Answer** | The full solution — **plain text** | See Section 9 for the formatting guide |
| **CardColor** | Card header colour — optional | `blue`, or leave **blank** to auto-pick based on Category |
| **DefaultOpen** | Show body on load? | `TRUE` or `FALSE` |
| **Active** | Show on site? | `TRUE` (draft = `FALSE`) |
| **Tags** | Comma-separated, used by search | `cpp,greedy,heap,2026` |

> 💡 **Topic vs Category — what's the difference?**
> - **Topic** = the specific headline shown on each card, e.g. *"Kruskal's MST Algorithm"*.
> - **Category** = the broad subject used for filtering across the whole site, e.g. *"Programming"*. Many different Topics can share one Category.

### ExamType Options

| Value | Where it appears |
|-------|-----------------|
| `Written` | Normal question section |
| `Interview` | Normal question section |
| `Preliminary` | Normal question section |
| `Tips` | Special 📌 Tips section (always at bottom) |

### CardColor Options
`blue` · `green` · `red` · `purple` · `teal` · `orange`

### Entering the Answer

The **Answer** column is plain text — type it like you're writing a WhatsApp message or a Word document. No HTML, no code, no special tools required. The system automatically turns it into a formatted page with headings, bold text, bullet points, tables, code blocks, formulas, and images.

👉 **Full guide: [Section 9 — Writing Answers](#9-writing-answers--plain-text-guide)**

The fastest way to start: open the sheet, select the Answer cell, and use the menu **📘 Exam Portal Tools → Insert Answer Template** to drop in a ready-made starting point (see [Section 12](#12-in-sheet-tools)).

---

## 8. Managing Users (Access Control)

### Change the Admin Password (do this first!)

1. In Apps Script editor, find the `changePassword()` function.
2. Edit the two values:
   ```javascript
   const TARGET_USERNAME = 'admin';
   const NEW_PASSWORD    = 'YourNewSecurePassword';
   ```
3. Click **▶ Run** (select `changePassword` in the dropdown).
4. Done — the session is invalidated and you must log in again.

### Add a New User

1. Find the `addUser()` function.
2. Edit the `CFG` block:
   ```javascript
   const CFG = {
     username           : 'dr_rahman',
     password           : 'SecurePass123',
     role               : 'viewer',
     accessUniversities : 'Chandpur STU',          // or 'all'
     accessDepartments  : 'EEE',                   // or 'all'
     accessExamTypes    : 'Written, Interview',    // or 'all'
     active             : 'TRUE',
   };
   ```
3. Run `addUser()`.

### Access Control Rules

| USERS column | Value | Meaning |
|---|---|---|
| `AccessUniversities` | `all` | User sees questions from ALL universities |
| `AccessUniversities` | `Chandpur STU` | Only Chandpur questions |
| `AccessUniversities` | `Chandpur STU, BUET` | Two universities |
| `AccessDepartments` | `all` | All departments |
| `AccessDepartments` | `EEE, CSE` | Only EEE and CSE |
| `AccessExamTypes` | `Written, Tips` | Written questions and Tips only |
| `Role` | `admin` | Full access (future admin panel) |
| `Role` | `viewer` | Standard read-only (default) |

### Deactivate a User

1. Find the `deactivateUser()` function.
2. Set `TARGET_USERNAME` and run it.
   OR: simply change `Active` from `TRUE` to `FALSE` in the USERS sheet directly.

---

## 9. Writing Questions & Answers — Plain Text Guide

Type the **QuestionText** and **Answer** columns like a normal message. No tags, no brackets-and-slashes to remember for 90% of content. The system reads your plain text and turns it into a formatted page automatically — **the same formatting works in both columns**, so a question that includes a code snippet to analyze, a circuit diagram to refer to, or a data table just works the same way an answer does.

> 🧩 **Don't want to memorize any of this?** Open the menu **📘 Exam Portal Tools → Insert Answer Template** in the Google Sheet and pick Programming / Circuit / Formula / Tips — it inserts a ready example into your selected cell (Question or Answer) that you just fill in. See [Section 12](#12-in-sheet-tools).

### The Cheat Sheet (one page)

| Type this | Get this |
|---|---|
| Just write normally | A paragraph. Leave a **blank line** to start a new paragraph. |
| `# Heading text` | A section heading |
| `*bold text*` | **Bold** — same style as WhatsApp |
| `_italic text_` | *Italic* — same style as WhatsApp |
| `~strikethrough~` | ~~Strikethrough~~ |
| `- item` | • Bullet point |
| `1. item` | Numbered step (just type 1. each time — the page numbers them correctly) |
| ` ```cpp ` … ` ``` ` | A syntax-highlighted code block (3 backticks before and after) |
| `` `variable_name` `` | Inline code/variable inside a sentence (1 backtick) |
| `Col A \| Col B` (one row per line) | A table — first row becomes the header |
| `= Vdc = (2 × Vm) / π` | A styled formula box (start the line with `=` and a space) |
| `TIP: text` | 🟢 Green tip box |
| `NOTE: text` | 🔵 Blue note box |
| `WARNING: text` | 🟠 Orange warning box |
| `IMPORTANT: text` | 🔴 Red highlighted box |
| A Google Drive / image link on its own line | An embedded, click-to-zoom figure exactly where you placed it |

### Worked Examples

**Heading + emphasis + a list:**
```
# Approach

Always merge the *two shortest items* first, following the _greedy_ principle.

1. Step one
2. Step two
3. Step three
```

**A code block** (language name after the backticks is optional — the system tries to auto-detect it if you skip it):
```
\`\`\`cpp
#include <iostream>
int main() {
    std::cout << "Hello";
}
\`\`\`
```

**A table** — just separate columns with `|`, one row per line, first row is the header:
```
Component | Value | Function
R1 | 1 kΩ | Current limiting
C1 | 10 µF | Filtering
```

**A formula:**
```
= Hosts per Subnet = 2^(host bits) − 2
```

**A tip box** (single line):
```
TIP: Always show step-by-step workings for full marks.
```

**A tip box spanning several lines** — type the keyword alone, then your lines, then a blank line to close it:
```
TIP:
First point to remember.
Second point to remember.

Normal paragraph continues here.
```

**An image placed between paragraphs of text** — paste the link on its own line exactly where you want the figure to appear, optionally followed by ` - ` and a caption:
```
The current splits evenly across both branches.

https://drive.google.com/file/d/1AbCdEfGhIjK/view?usp=sharing - Figure 1: Parallel circuit diagram

This is confirmed by Kirchhoff's Current Law.
```
The image will appear exactly between those two paragraphs on the live site, click-to-zoom enabled. Drive share links are converted automatically — paste exactly what Google gives you, no editing needed. See [Section 13](#13-image-hosting-guide) for hosting details.

**A code block inside the QUESTION itself** — common for "predict the output" or "find the bug" style questions:
```
What will be the output of the following C++ code? Explain your reasoning.

\`\`\`cpp
int arr[] = {10, 20, 30, 40};
int *p = arr;
p++;
cout << *p << " " << *(p+1) << endl;
\`\`\`
```
This renders with the same syntax highlighting as an answer's code block — type it into the **QuestionText** cell exactly the same way. The sample row **Q003** already in your sheet shows this end-to-end.

### Advanced / Power-User Mode (optional, rarely needed)

If a QuestionText or Answer cell already contains real HTML tags (`<table>`, `<h3>`, `<div>`, etc.), the system detects this and renders it exactly as typed, skipping the plain-text conversion. This is an escape hatch for pixel-level custom layouts — **not required for normal use.**

---

## 10. Choosing the Right Format for Your Answer

Not sure which style to use for a given answer? Use this quick decision guide:

| Your answer is mainly… | Use this |
|---|---|
| A written explanation / theory | Just write paragraphs. Use `# Heading` to break into sections. |
| A step-by-step procedure | `1. 2. 3.` numbered list |
| A list of points with no particular order | `- ` bullet list |
| Source code | ` ```language ` code block |
| Comparison of multiple items/values | A `\|`-separated table |
| A key equation or result | `= formula text` |
| A circuit / block diagram / graph | Paste the Drive image link on its own line |
| An exam strategy tip or common mistake | `TIP:` / `WARNING:` / `NOTE:` / `IMPORTANT:` box |

Most real answers combine several of these — see the sample rows already in your QUESTIONS sheet (Q001 = Programming, Q002 = Circuit, Q003 = code-in-question example, T001 = Tips) for full worked examples mixing headings, lists, code, tables, formulas, and tip boxes together.

---

## 11. The Category Filter

The **Category** column powers the topic filter chips at the top of the website (🗂️ All Topics, 💻 Programming, ⚡ Circuit Analysis, …), letting aspirants jump straight to the subject they're revising — independent of which university or year the question came from.

### Suggested Categories (free text — use these or your own)

| Category | Typical icon shown |
|---|---|
| `Programming` | 💻 |
| `Digital Logic` | 🔢 |
| `Circuit Analysis` | ⚡ |
| `Power Electronics` | 🔌 |
| `Electronics` | 🔧 |
| `Control Systems` | 🎛️ |
| `Communication Systems` | 📡 |
| `Networking` | 🌐 |
| `Microprocessor & Embedded` | 🖥️ |
| `Power Systems` | ⚙️ |
| `Database / SQL` | 🗄️ |
| `Machine Learning / AI` | 🧠 |
| `Mathematics` | 📐 |
| `General / Viva Tips` | 📌 |

Spelling must stay **consistent** across rows for the filter to group correctly (e.g. always `Circuit Analysis`, not sometimes `circuit analysis` or `Circuits`). Use **📘 Exam Portal Tools → Validate Question Data** to catch inconsistent spelling automatically (see Section 12).

> 💡 If you leave **CardColor** blank, the card header colour is automatically chosen based on Category (e.g. Programming → blue, Circuit Analysis → orange) — one less thing to decide per question.

---

## 12. In-Sheet Tools

After running `setupSheets()`, **reload the spreadsheet browser tab once**. A new menu appears at the top: **📘 Exam Portal Tools**.

### 🧩 Insert Answer Template
Select an empty Answer cell, open the menu, pick **Insert Answer Template**, then choose:
- **💻 Programming / Code Question** — Approach → Code block → Explanation → Complexity → Tip
- **⚡ Circuit / Table Question** — Explanation → Component table → Figure → Formula → Note
- **📐 Formula / Math Question** — Concept → Formula → Worked example → Important note
- **📌 Tips / Short-Answer** — Bullet list → Tip

The template text is written directly into your selected cell — just fill in the blanks.

### 📖 Formatting Cheat Sheet
Opens the same quick-reference table as Section 9, right inside the spreadsheet — no need to switch to this document while you're entering content.

### ✅ Validate Question Data
Scans every row in QUESTIONS and reports:
- **Errors** (will break the site): missing ID/University/Department/ExamType/Answer, duplicate IDs, invalid TRUE/FALSE values
- **Warnings** (recommended fixes): missing Year/Topic/QuestionText, unusual Drive link formats, and **possible spelling typos** — e.g. if you have both "Chandpur STU" and "Chandpur STU " (trailing space) or "Chandpur ST" in different rows, it flags them as likely duplicates so your filters don't silently split into two groups.

Run this periodically as your sheet grows — it takes a few seconds and catches mistakes that are easy to miss by eye in a large spreadsheet.

---

## 13. Image Hosting Guide

Images must be at a **public URL**. Just paste the link directly into the QuestionText or Answer text on its own line — no shortcode needed (see Section 9).

### Google Drive (recommended)
1. Upload to Drive → Right-click → **Share → Change to "Anyone with the link"** (the dropdown must say *Anyone with the link*, **not** *Restricted* — this is the single most common reason images fail to load).
2. Click **Copy link**.
3. Paste that link directly into the cell, on its own line. The system automatically converts it to a viewable image — you don't need to edit the URL format yourself.

> **Why images used to fail, and how this is fixed:** Google's older `uc?export=view` link format frequently shows a blank or broken image when hotlinked from an external website like this one — Drive serves an HTML "preview" page instead of the actual image file in that format. The site now uses Drive's **`thumbnail`** endpoint instead (the same one Drive's own interface uses to render previews), which is far more reliable for direct embedding. If that ever fails too, the page automatically retries with a second Google image format before giving up — so most sharing-permission issues self-resolve without you doing anything once the file is shared correctly. If both formats fail, the page shows a clear **"Open the original link →"** message instead of a broken icon, so you immediately know which question needs fixing.

### GitHub
1. Upload the image to any public GitHub repository.
2. Click the image file → **Right-click → Copy image address**.
3. Paste that URL into the cell (QuestionText or Answer), on its own line.

### Imgur
1. Go to [imgur.com](https://imgur.com) → New post → drag image.
2. Once uploaded, **right-click the image → Copy image address**.
3. Paste that URL into the cell (QuestionText or Answer), on its own line.

> 💡 GitHub and Imgur links almost never have the loading issues that Drive links can have, since they're designed for direct hotlinking. If a particular Drive image keeps failing even after fixing sharing permissions, these are reliable alternatives.

---

## 14. Math Formula Guide (Advanced, Optional)

For most answers, the simple `= formula text` box (Section 9) is enough. If you need precise mathematical typesetting — fractions, summations, Greek letters, exact exponents — you can optionally use LaTeX, which renders automatically via MathJax:

### Inline Math (inside a sentence)
```
The formula is $E = mc^2$ where $c$ is the speed of light.
```

### Display Math (centred on its own line)
```
$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$
```

### Common Symbols

| Symbol | LaTeX |
|--------|-------|
| Fraction | `\frac{a}{b}` |
| Subscript | `x_{n}` |
| Superscript | `x^{2}` |
| Square root | `\sqrt{x}` |
| Sum | `\sum_{i=1}^{n}` |
| Integral | `\int_0^\infty` |
| Greek letters | `\alpha \beta \gamma \lambda \omega` |
| Arrows | `\rightarrow \Rightarrow \Leftrightarrow` |
| Approximately | `\approx` |
| Belongs to | `\in` |

---

## 15. Troubleshooting

### "Questions not loading" / blank page
1. Open browser **Developer Tools → Console** (F12).
2. Look for errors. Common causes:

| Error | Fix |
|-------|-----|
| `GAS_URL not configured` | Paste your deployment URL in `index.html` |
| `CORS` error | Make sure Web App is deployed as **Access: Anyone** |
| `401` or `403` | Re-deploy the Apps Script with correct settings |
| `Sheet not found` | Run `setupSheets()` again in Apps Script |
| Blank response | Create a **new deployment version** (not edit existing) |

### "Login fails with correct password"
- Passwords are hashed with SHA-256. If you manually edited the USERS sheet, the hash is wrong.
- Use the `changePassword()` function in Apps Script instead of editing directly.

### "CORS error in console"
1. Go to Apps Script → Deploy → Manage Deployments.
2. Click ✏️ Edit → confirm **Who has access: Anyone**.
3. Create a new deployment version.
4. Copy the new URL and update `GAS_URL` in `index.html`.

### "Token expired / logged out frequently"
- Edit `const TOKEN_HOURS = 24;` in `Code.gs` to a higher value (e.g., `168` for 1 week).
- Create a new deployment version after changing.

### "Images not showing" / "Google Drive image fails to load"
This is almost always a **sharing permission** issue. To fix it:
1. Open the file in Google Drive → **Share** → confirm the dropdown says **"Anyone with the link"**, not "Restricted."
2. Re-copy the link with **Copy link** and make sure it's pasted exactly as given (no edits needed — the site converts it automatically).
3. Quick test: open the link in a **private/incognito browser window** (logged out of your Google account). If it asks for access, the permission isn't set correctly yet.

The page already tries two different Google image formats automatically before giving up. If you still see **"⚠️ This image could not be loaded"** with an "Open the original link" button, click that link directly — if Google prompts you for access, that confirms the sharing setting is the issue. If the link opens fine for you, double-check it's a **file** link (not a folder), and that you copied the whole URL.

If a specific image is persistently unreliable even with correct sharing, switch to GitHub or Imgur hosting instead (Section 13) — both tend to be more consistent for hotlinking than Drive.

### "Formulas not rendering"
- MathJax loads asynchronously. Wait 1-2 seconds after the page loads.
- Ensure `$...$` or `$$...$$` syntax with no extra spaces right after the `$`.
- For the simple `= formula text` style, make sure there's a space right after the `=` sign.

### "My table/list/code isn't formatting correctly"
- Tables: every row needs at least one `|` separating two or more columns, with no blank line between rows.
- Lists: the dash `-` or number `1.` must be followed by a space, and have no blank line between items.
- Code blocks: make sure there are exactly three backticks ` ``` ` on their own — both opening and closing.
- Run **📘 Exam Portal Tools → Validate Question Data** to catch missing/malformed fields, or open **Formatting Cheat Sheet** from the same menu to double-check the syntax.

### "Category chips not showing on the site"
- Make sure the **Category** column is filled in (and `Active` is `TRUE`) for at least one question.
- Category spelling must match exactly across rows — `Programming` and `programming` are treated as different by the filter buttons (though search itself is case-insensitive). Use **Validate Question Data** to catch inconsistent spelling.

### "📘 Exam Portal Tools menu isn't showing in the sheet"
- The custom menu only appears after the `onOpen()` function has run once. **Reload the spreadsheet browser tab** after running `setupSheets()` for the first time, or after pasting updated code.

---

## 16. Future Expansion

The system is designed to grow. Here are built-in expansion paths:

### More Universities & Departments
Just add rows to QUESTIONS with different University/Department values.
Filter dropdowns update automatically from live data.

### More Exam Types
Add any value to the `ExamType` column — it appears automatically in the dropdown.
Use `Tips` for the special tips section.

### More Categories
Add any value to the `Category` column — a new filter chip appears automatically. No code changes needed. Use **Validate Question Data** periodically to catch spelling drift as your category list grows.

### More Years
Add `2027`, `2028` etc. — they appear in the Year dropdown (newest first).

### Admin Panel
The `role` field in USERS is pre-designed for an admin panel (add/edit questions, manage users from the browser). This can be added as a second page later.

### Offline Support
Add a service worker to `index.html` to cache questions for offline access.

### Export to PDF
Add a "Print / Export PDF" button that uses `window.print()` with print-specific CSS.

---

## File Summary

| File | Goes where | Purpose |
|------|-----------|---------|
| `Code.gs` | Google Apps Script | Backend API + user auth |
| `index.html` | GitHub repository root | Frontend (the website) |
| `SETUP_GUIDE.md` | Your reference | This guide |

---

*Built for University Teacher Aspirants — Bangladesh EEE / CSE Written Examinations*

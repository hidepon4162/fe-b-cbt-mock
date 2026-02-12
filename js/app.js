/**
 * 基本情報技術者試験 科目B 模擬試験 アプリ
 */

import { questions } from "../data/questions.js";

// ========= State =========
const LS_KEY = "fe_b_mock_cbt_v2";
const SEC_PER_QUESTION = 2 * 60; // 1問あたり2分
let idx = 0;
let submitted = false;
let locked = false;
let remainingSec = questions.length * SEC_PER_QUESTION;
let timerId = null;

const state = {
    answers: Array(questions.length).fill(null), // "ア".."エ"
    flagged: Array(questions.length).fill(false),
};

// ========= Elements =========
const elGrid = document.getElementById("grid");
const elTimer = document.getElementById("timer");
const elProgress = document.getElementById("progressBadge");
const elFlagBadge = document.getElementById("flagBadge");
const elQNo = document.getElementById("qNo");
const elGroup = document.getElementById("groupPill");
const elTheme = document.getElementById("themePill");
const elStatus = document.getElementById("statusPill");
const elStem = document.getElementById("stem");
const elCode = document.getElementById("codeBlock");
const elQText = document.getElementById("qText");
const elOpts = document.getElementById("opts");
const elExplain = document.getElementById("explain");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const toggleFlagBtn = document.getElementById("toggleFlagBtn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");
const submitBtn = document.getElementById("submitBtn");
const jumpFirst = document.getElementById("jumpFirst");
const jumpLast = document.getElementById("jumpLast");

const dlg = document.getElementById("resultDlg");
const closeDlg = document.getElementById("closeDlg");
const scoreBadge = document.getElementById("scoreBadge");
const answeredBadge = document.getElementById("answeredBadge");
const timeBadge = document.getElementById("timeBadge");
const reviewWrong = document.getElementById("reviewWrong");
const reviewFlagged = document.getElementById("reviewFlagged");
const lockBtn = document.getElementById("lockBtn");

// ========= Helpers =========
const fmt = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
};
const answeredCount = () => state.answers.filter(v => v !== null).length;
const flaggedCount = () => state.flagged.filter(Boolean).length;

function calcScore() {
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
        if (state.answers[i] && state.answers[i] === questions[i].answer) score++;
    }
    return score;
}

function buildGrid() {
    elGrid.innerHTML = "";
    for (let i = 0; i < questions.length; i++) {
        const b = document.createElement("button");
        b.className = "qbtn";
        b.textContent = (i + 1);
        b.addEventListener("click", () => go(i));
        elGrid.appendChild(b);
    }
}

function updateGridStyles() {
    const btns = [...elGrid.querySelectorAll(".qbtn")];
    btns.forEach((b, i) => {
        b.classList.toggle("active", i === idx);
        b.classList.toggle("answered", state.answers[i] !== null);
        b.classList.toggle("flagged", state.flagged[i]);

        b.classList.remove("review-ok", "review-ng");
        if (submitted) {
            const ok = state.answers[i] !== null && state.answers[i] === questions[i].answer;
            const ng = state.answers[i] !== null && state.answers[i] !== questions[i].answer;
            if (ok) b.classList.add("review-ok");
            if (ng) b.classList.add("review-ng");
        }
    });
}

function updateBadges() {
    elProgress.textContent = `進捗: ${answeredCount()} / ${questions.length}`;
    elFlagBadge.textContent = `旗: ${flaggedCount()}`;
}

function escapeHtml(s) {
    return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function render() {
    const q = questions[idx];
    elQNo.textContent = String(idx + 1);
    const elQTotal = document.getElementById("qTotal");
    if (elQTotal) elQTotal.textContent = String(questions.length);
    elGroup.textContent = q.group;
    elTheme.textContent = q.theme ?? q.group;
    elStem.innerHTML = `<div class="muted" style="font-size:12px;">${escapeHtml(q.stem)}</div>`;

    if (q.code && q.code.trim().length > 0) {
        elCode.style.display = "block";
        elCode.textContent = q.code;
    } else {
        elCode.style.display = "none";
        elCode.textContent = "";
    }

    elQText.textContent = q.text;

    const ans = state.answers[idx];
    elStatus.textContent = ans ? `選択中：${ans}` : "未回答";
    elStatus.style.borderColor = ans ? "rgba(53,208,127,.55)" : "rgba(255,255,255,.10)";
    elStatus.style.background = ans ? "rgba(53,208,127,.10)" : "rgba(0,0,0,.18)";
    elStatus.style.color = ans ? "rgba(53,208,127,.95)" : "var(--muted)";

    elOpts.innerHTML = "";
    q.options.forEach((op) => {
        const wrap = document.createElement("label");
        wrap.className = "opt";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "opt";
        radio.value = op.k;
        radio.checked = (ans === op.k);
        radio.disabled = locked || (submitted && locked);

        const lab = document.createElement("div");
        lab.className = "lab";
        lab.innerHTML = `<b>${op.k}</b>　${escapeHtml(op.t)}`;

        wrap.appendChild(radio);
        wrap.appendChild(lab);

        if (ans === op.k) wrap.classList.add("selected");

        wrap.addEventListener("click", (e) => {
            if (locked) { e.preventDefault(); return; }
            if (submitted && locked) { e.preventDefault(); return; }
            choose(op.k);
        });

        elOpts.appendChild(wrap);
    });

    elExplain.classList.remove("show");
    elExplain.innerHTML = "";
    if (submitted) {
        const picked = state.answers[idx];
        const correct = q.answer;

        [...elOpts.children].forEach((node) => {
            const val = node.querySelector("input")?.value;
            node.classList.remove("correct", "wrong");
            if (val === correct) node.classList.add("correct");
            if (picked && val === picked && picked !== correct) node.classList.add("wrong");
        });

        const ok = picked && picked === correct;
        const ng = picked && picked !== correct;
        const badge = ok
            ? `<span class="badge ok">正解</span>`
            : (ng ? `<span class="badge ng">不正解</span>` : `<span class="badge ng">未回答</span>`);

        elExplain.innerHTML = `${badge}　正解：<b>${correct}</b><br>${escapeHtml(q.explain)}`;
        elExplain.classList.add("show");
    }

    prevBtn.disabled = (idx === 0);
    nextBtn.disabled = (idx === questions.length - 1);

    toggleFlagBtn.textContent = state.flagged[idx] ? "旗を外す" : "旗を付ける";
    toggleFlagBtn.disabled = false;

    clearBtn.disabled = (state.answers[idx] === null) || locked;

    submitBtn.disabled = submitted;
    updateBadges();
    updateGridStyles();
}

function choose(k) {
    state.answers[idx] = k;
    render();
}

function clearAnswer() {
    state.answers[idx] = null;
    render();
}

function toggleFlag() {
    state.flagged[idx] = !state.flagged[idx];
    render();
}

function go(i) {
    idx = Math.max(0, Math.min(questions.length - 1, i));
    render();
}

function next() { if (idx < questions.length - 1) go(idx + 1); }
function prev() { if (idx > 0) go(idx - 1); }

// ========= Timer =========
function startTimer() {
    if (timerId) return;
    timerId = setInterval(() => {
        if (remainingSec > 0) remainingSec--;
        elTimer.textContent = fmt(remainingSec);
        if (remainingSec === 0) {
            clearInterval(timerId);
            timerId = null;
            if (!submitted) doSubmit(true);
        }
    }, 1000);
}

// ========= Persistence =========
function save() {
    const payload = {
        v: 1,
        idx,
        submitted,
        locked,
        remainingSec,
        state
    };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
    toast("保存しました");
}

function load() {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) { toast("保存データがありません"); return; }
    try {
        const p = JSON.parse(raw);
        if (!p || !p.state) throw new Error("bad");
        idx = p.idx ?? 0;
        submitted = !!p.submitted;
        locked = !!p.locked;
                remainingSec = (typeof p.remainingSec === "number" && p.remainingSec >= 0) ? p.remainingSec : questions.length * SEC_PER_QUESTION;
        state.answers = Array.isArray(p.state.answers) ? p.state.answers.slice(0, questions.length) : state.answers;
        state.flagged = Array.isArray(p.state.flagged) ? p.state.flagged.slice(0, questions.length) : state.flagged;
        while (state.answers.length < questions.length) state.answers.push(null);
        while (state.flagged.length < questions.length) state.flagged.push(false);
        elTimer.textContent = fmt(remainingSec);
        render();
        toast("復元しました");
    } catch {
        toast("復元に失敗しました");
    }
}

function resetAll() {
    localStorage.removeItem(LS_KEY);
    state.answers = Array(questions.length).fill(null);
    state.flagged = Array(questions.length).fill(false);
    idx = 0;
    submitted = false;
    locked = false;
            remainingSec = questions.length * SEC_PER_QUESTION;
    elTimer.textContent = fmt(remainingSec);
    render();
    toast("リセットしました");
}

// ========= Submit / Review =========
function doSubmit(auto = false) {
    submitted = true;
    const score = calcScore();
    const ac = answeredCount();

    scoreBadge.textContent = `得点: ${score} / ${questions.length}`;
    answeredBadge.textContent = `回答: ${ac} / ${questions.length}`;
    timeBadge.textContent = `残り時間: ${fmt(remainingSec)}`;

    if (!auto) dlg.showModal();
    render();
}

function gotoFirstWrong() {
    for (let i = 0; i < questions.length; i++) {
        const a = state.answers[i];
        if (a !== null && a !== questions[i].answer) { go(i); return; }
    }
    toast("不正解がありません（または未回答のみ）");
}

function gotoFirstFlagged() {
    for (let i = 0; i < questions.length; i++) {
        if (state.flagged[i]) { go(i); return; }
    }
    toast("旗の問題がありません");
}

function lockReview() {
    locked = true;
    toast("採点状態を固定しました（回答変更不可）");
    render();
}

// ========= Toast =========
function toast(msg) {
    const d = document.createElement("div");
    d.textContent = msg;
    d.style.position = "fixed";
    d.style.left = "50%";
    d.style.bottom = "18px";
    d.style.transform = "translateX(-50%)";
    d.style.background = "rgba(0,0,0,.75)";
    d.style.border = "1px solid rgba(255,255,255,.14)";
    d.style.color = "white";
    d.style.padding = "10px 12px";
    d.style.borderRadius = "12px";
    d.style.boxShadow = "0 10px 30px rgba(0,0,0,.35)";
    d.style.zIndex = "9999";
    d.style.fontSize = "13px";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1200);
}

// ========= Events =========
prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
jumpFirst.addEventListener("click", () => go(0));
jumpLast.addEventListener("click", () => go(questions.length - 1));

toggleFlagBtn.addEventListener("click", toggleFlag);
clearBtn.addEventListener("click", clearAnswer);
saveBtn.addEventListener("click", save);
loadBtn.addEventListener("click", load);
resetBtn.addEventListener("click", resetAll);

submitBtn.addEventListener("click", () => doSubmit(false));

closeDlg.addEventListener("click", () => dlg.close());
reviewWrong.addEventListener("click", () => { dlg.close(); gotoFirstWrong(); });
reviewFlagged.addEventListener("click", () => { dlg.close(); gotoFirstFlagged(); });
lockBtn.addEventListener("click", () => { lockReview(); dlg.close(); });

window.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.key === "ArrowRight") { next(); }
    if (e.key === "ArrowLeft") { prev(); }
    if (!locked) {
        if (e.key === "1") choose("ア");
        if (e.key === "2") choose("イ");
        if (e.key === "3") choose("ウ");
        if (e.key === "4") choose("エ");
    }
});

// ========= Init =========
const examMeta = document.getElementById("examMeta");
if (examMeta) examMeta.textContent = `${questions.length}問・${Math.round(questions.length * SEC_PER_QUESTION / 60)}分想定（CBT練習）`;
buildGrid();
elTimer.textContent = fmt(remainingSec);
render();
startTimer();

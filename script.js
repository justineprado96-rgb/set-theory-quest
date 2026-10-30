"use strict";

const root = document.querySelector(".game-container");
const $ = id => document.getElementById(id);

const state = { names: ["Player 1", "Player 2"], scores: [0, 0], turn: 0, difficulty: "Easy" };
let quiz = null, bag = null, timerId = null, keyHandler = null, vennId = 0;

// Counts are even so both players answer the same number of questions.
const levels = {
  Easy:   { seconds: 30, points: 10, count: 4 },
  Medium: { seconds: 20, points: 20, count: 6 },
  Hard:   { seconds: 12, points: 30, count: 8 }
};
const BAG_MOVES = 3;

const topicMeta = [
  { name: "Types of sets", note: "Finite, empty, equal and disjoint sets, plus the symbols" },
  { name: "Set operations", note: "Union, intersection, difference and complement" },
  { name: "Binary addition", note: "Add binary numbers and carry" },
  { name: "Number system conversions", note: "Decimal, binary and hexadecimal" },
  { name: "Boolean algebra", note: "Identity, complement, absorption and consensus laws" }
];

const topics = [
  {
    title: "📚 TYPES OF SETS",
    questions: [
      { question: "Which set contains a limited number of elements?", choices: ["Finite Set", "Infinite Set", "Empty Set"], answer: "Finite Set", hint: "Its number of elements can be counted.", explain: "A finite set has a countable number of elements, so you could list them all and reach an end. {1, 2, 3} is finite." },
      { question: "Which set has no elements?", choices: ["Singleton Set", "Empty Set", "Universal Set"], answer: "Empty Set", hint: "It is also called the null set.", explain: "The empty set, written ∅ or { }, has zero elements. A singleton has exactly one, and the universal set holds everything under discussion." },
      { question: "Which set contains exactly one element?", choices: ["Infinite Set", "Singleton Set", "Empty Set"], answer: "Singleton Set", hint: "Think of a set with just one member.", explain: "A singleton set has exactly one element, such as {7}. One member only, no more and no fewer." },
      { question: "Which set contains an unlimited number of elements?", choices: ["Finite Set", "Empty Set", "Infinite Set"], answer: "Infinite Set", hint: "Its elements never end.", explain: "An infinite set never runs out of elements. The natural numbers {1, 2, 3, …} keep going forever." },
      { question: "If A = {1, 2} and B = {1, 2}, what is their relationship?", choices: ["Equal Sets", "Disjoint Sets", "Empty Sets"], answer: "Equal Sets", hint: "Both sets have the exact same elements.", explain: "Sets are equal when they contain exactly the same elements. Order and repeats don’t matter, so {1, 2} and {2, 1} are equal." },
      { question: "If A = {1, 2} and B = {3, 4}, what are these sets?", choices: ["Equal Sets", "Disjoint Sets", "Overlapping Sets"], answer: "Disjoint Sets", hint: "They have no common elements.", explain: "Disjoint sets have no element in common, so their intersection is empty. {1, 2} and {3, 4} share nothing." },
      { question: "If A = {1, 2} and B = {2, 3}, what type of sets are they?", choices: ["Disjoint Sets", "Overlapping Sets", "Empty Sets"], answer: "Overlapping Sets", hint: "They share one element.", explain: "Overlapping sets share at least one element but each also has elements the other lacks. Here 2 is shared, 1 is only in A and 3 is only in B." },
      { question: "If every element of A is also in B, what is A in relation to B?", choices: ["A subset of B", "A disjoint set", "An infinite set"], answer: "A subset of B", hint: "Use the subset relationship.", explain: "A is a subset of B when every element of A is also in B. That is what “A ⊆ B” says." },
      { question: "Which symbol means 'is an element of'?", choices: ["∈", "∪", "∩"], answer: "∈", hint: "This symbol indicates membership.", explain: "∈ reads “is an element of”, as in 2 ∈ {1, 2, 3}. ∪ means union and ∩ means intersection." },
      { question: "If A = {2, 4, 6}, is 4 an element of A?", choices: ["Yes", "No", "A is empty"], answer: "Yes", hint: "Check whether 4 appears in A.", explain: "Check membership by looking for 4 in the list. A = {2, 4, 6} contains 4, so 4 ∈ A." },
      { question: "Which symbol means 'is a subset of'?", choices: ["⊆", "∩", "∪"], answer: "⊆", hint: "It represents a subset.", explain: "⊆ reads “is a subset of”. ∪ is union and ∩ is intersection, which are operations rather than relationships." },
      { question: "If A = {1, 2} and B = {1, 2, 3}, is A a subset of B?", choices: ["Yes", "No", "They are disjoint"], answer: "Yes", hint: "Every element of A appears in B.", explain: "Both 1 and 2 appear in B = {1, 2, 3}, so every element of A is in B. That makes A a subset of B." },
      { question: "What is a proper subset?", choices: ["A subset that is not equal to the original set", "A set with no elements", "A set with infinite elements"], answer: "A subset that is not equal to the original set", hint: "It is a subset but not the same set.", explain: "A proper subset sits inside a set but is not equal to it, so the larger set has at least one extra element. {1} is a proper subset of {1, 2}." },
      { question: "What makes two finite sets equivalent?", choices: ["They have the same number of elements", "They have exactly the same elements", "They have no elements"], answer: "They have the same number of elements", hint: "Compare their cardinalities.", explain: "Equivalent sets have the same number of elements (the same cardinality), even if the elements differ. {1, 2} and {a, b} are equivalent but not equal." },
      { question: "What is the universal set?", choices: ["The set of all elements being considered", "A set with one element only", "A set with no elements"], answer: "The set of all elements being considered", hint: "It contains the elements under discussion.", explain: "The universal set U contains every element being considered in a problem. Other sets are subsets of it, and complements are taken relative to it." },
      { question: "Which symbol commonly represents the empty set?", choices: ["∅", "∪", "∈"], answer: "∅", hint: "It looks like a crossed-out circle.", explain: "The empty set is written ∅ (or { }). ∪ is union and ∈ is “is an element of”." },
      { question: "If A = {a, b, c}, how many elements are in A?", choices: ["2", "3", "4"], answer: "3", hint: "Count each different element.", explain: "Count each different element once. A = {a, b, c} has a, b and c, which makes 3." },
      { question: "If A = {1, 2, 3}, which statement is true?", choices: ["2 ∈ A", "5 ∈ A", "4 ∈ A"], answer: "2 ∈ A", hint: "Check which number belongs to A.", explain: "Membership means the number is listed in the set. A = {1, 2, 3} lists 2, but not 4 or 5." },
      { question: "If A = {1, 2} and B = {2, 3}, which element do they share?", choices: ["1", "2", "3"], answer: "2", hint: "Find the common element.", explain: "Look for elements listed in both sets. A = {1, 2} and B = {2, 3} both contain 2, while 1 and 3 each appear only once." }
    ]
  },
  {
    title: "🔢 SET OPERATIONS",
    questions: [
      { question: "What is {1, 2} ∪ {2, 3}?", choices: ["{2}", "{1, 2, 3}", "{1, 3}"], answer: "{1, 2, 3}", hint: "Union combines elements without duplicates.", explain: "Union combines every element from both sets and lists shared ones once. {1, 2} ∪ {2, 3} gives {1, 2, 3}." },
      { question: "What is {1, 2} ∩ {2, 3}?", choices: ["{1, 2, 3}", "{1}", "{2}"], answer: "{2}", hint: "Intersection means common elements.", explain: "Intersection keeps only the elements found in both sets. Only 2 appears in {1, 2} and {2, 3}, so the result is {2}." },
      { question: "What is {1, 2} − {2, 3}?", choices: ["{1}", "{2}", "{1, 2, 3}"], answer: "{1}", hint: "Keep elements in the first set only.", explain: "A − B keeps what is in A but not in B. 1 is only in the first set, and 2 is removed because it is also in the second." },
      { question: "If U = {1, 2, 3, 4} and A = {1, 2}, what is Aᶜ?", choices: ["{1, 2}", "{3, 4}", "{1, 2, 3, 4}"], answer: "{3, 4}", hint: "Complement contains elements in U but not A.", explain: "The complement Aᶜ is everything in U that is not in A. Remove 1 and 2 from {1, 2, 3, 4} and {3, 4} is left." },
      { question: "What is {a, b} ∪ {b, c}?", choices: ["{b}", "{a, b, c}", "{a, c}"], answer: "{a, b, c}", hint: "Combine all unique elements.", explain: "Gather every element once: a, b and c. The shared b is listed only one time, giving {a, b, c}." },
      { question: "What is {2, 4, 6} ∩ {4, 6, 8}?", choices: ["{2, 8}", "{4, 6}", "{2, 4, 6, 8}"], answer: "{4, 6}", hint: "Choose the elements in both sets.", explain: "Only 4 and 6 appear in both sets. 2 is only in the first and 8 is only in the second, so the answer is {4, 6}." },
      { question: "What is {1, 2, 3} − {1, 3}?", choices: ["{1, 3}", "{2}", "{1, 2, 3}"], answer: "{2}", hint: "Remove 1 and 3 from the first set.", explain: "Take {1, 2, 3} and remove 1 and 3. Only 2 is left, so the answer is {2}." },
      { question: "If U = {a, b, c, d} and A = {a, c}, what is Aᶜ?", choices: ["{a, c}", "{b, d}", "{a, b, c, d}"], answer: "{b, d}", hint: "Find the elements of U not in A.", explain: "Aᶜ is U without A. Remove a and c from {a, b, c, d} and b and d remain." },
      { question: "What is {1, 2} ∪ ∅?", choices: ["∅", "{1, 2}", "{1}"], answer: "{1, 2}", hint: "Union with the empty set adds nothing.", explain: "The empty set has no elements to add, so {1, 2} ∪ ∅ is still {1, 2}." },
      { question: "What is {1, 2} ∩ ∅?", choices: ["{1, 2}", "{1}", "∅"], answer: "∅", hint: "There are no shared elements.", explain: "The empty set has nothing to share, so any intersection with ∅ is empty. {1, 2} ∩ ∅ = ∅." },
      { question: "What is {3, 4, 5} − {4}?", choices: ["{4}", "{3, 5}", "{3, 4, 5}"], answer: "{3, 5}", hint: "Remove 4 from the first set.", explain: "Remove 4 from {3, 4, 5} and the answer is {3, 5}." },
      { question: "What is {a, b, c} ∪ {c, d}?", choices: ["{c}", "{a, b, c, d}", "{a, b, d}"], answer: "{a, b, c, d}", hint: "List every element only once.", explain: "Union lists every element once. c appears in both sets but is written one time, giving {a, b, c, d}." },
      { question: "What is {2, 4, 6} ∩ {1, 3, 5}?", choices: ["{2, 4, 6}", "{1, 3, 5}", "∅"], answer: "∅", hint: "Do these sets share any elements?", explain: "Even numbers and odd numbers never overlap, so these sets are disjoint and their intersection is empty: ∅." },
      { question: "If A = {1, 3, 5} and B = {1, 2, 3}, what is A − B?", choices: ["{1, 3}", "{5}", "{1, 2, 3, 5}"], answer: "{5}", hint: "Keep elements in A that are not in B.", explain: "1 and 3 are also in B, so they are removed from A. Only 5 stays, so A − B = {5}. The 2 belongs to B only, so it is not in the answer." },
      { question: "What does union combine?", choices: ["All elements from both sets without duplicates", "Only the common elements", "Only elements in the first set"], answer: "All elements from both sets without duplicates", hint: "Union is the combined set.", explain: "Union is the combined set: everything from both sets, with no duplicates. Common elements alone describe intersection." },
      { question: "What does intersection find?", choices: ["All elements from both sets", "Elements common to both sets", "Elements outside the universal set"], answer: "Elements common to both sets", hint: "Think about overlap.", explain: "Intersection finds the overlap, the elements that belong to both sets at once." },
      { question: "What does A − B contain?", choices: ["Elements in A that are not in B", "Elements in B that are not in A", "All elements in A and B"], answer: "Elements in A that are not in B", hint: "The order of subtraction matters.", explain: "A − B means elements in A that are not in B. Order matters: B − A would give a different set." },
      { question: "The complement of A is defined relative to which set?", choices: ["The universal set", "The empty set only", "Any unrelated set"], answer: "The universal set", hint: "It establishes the full group of possible elements.", explain: "A complement only makes sense relative to a full group of possible elements. That group is the universal set U." }
    ]
  },
  {
    title: "💻 BINARY ADDITION",
    questions: [
      { question: "What is 0 + 0 in binary?", choices: ["0", "1", "10"], answer: "0", hint: "Adding two zeroes gives zero.", explain: "In any base, 0 + 0 = 0. Adding nothing to nothing leaves nothing." },
      { question: "What is 0 + 1 in binary?", choices: ["0", "1", "10"], answer: "1", hint: "One plus zero is one.", explain: "0 + 1 = 1. Adding zero doesn’t change a value, so the answer is 1." },
      { question: "What is 1 + 1 in binary?", choices: ["0", "1", "10"], answer: "10", hint: "Binary uses base two, so carry a one.", explain: "1 + 1 equals 2, and in binary 2 is written 10. Write 0 in this column and carry 1 to the next." },
      { question: "What is 1 + 1 + 1 in binary?", choices: ["10", "11", "100"], answer: "11", hint: "Three in decimal is 11 in binary.", explain: "1 + 1 + 1 equals 3, and 3 is 2 + 1, written 11 in binary. Write 1 and carry 1." },
      { question: "What is 10₂ + 1₂?", choices: ["10₂", "11₂", "100₂"], answer: "11₂", hint: "Two plus one equals three.", explain: "10₂ is 2 and 1₂ is 1, so the sum is 3, written 11₂. Only the last column changes: 0 + 1 = 1 with no carry." },
      { question: "What is 11₂ + 1₂?", choices: ["100₂", "101₂", "111₂"], answer: "100₂", hint: "Three plus one equals four.", explain: "11₂ is 3, and 3 + 1 = 4, which is 100₂. In the right column 1 + 1 = 0 carry 1, the next column does the same, and the carry becomes a new leading 1." },
      { question: "What is 101₂ + 10₂?", choices: ["110₂", "111₂", "1000₂"], answer: "111₂", hint: "Five plus two equals seven.", explain: "101₂ is 5 and 10₂ is 2, so the sum is 7, which is 111₂. Adding column by column (1+0, 0+1, 1+0) gives no carries." },
      { question: "What is 110₂ + 11₂?", choices: ["1000₂", "1001₂", "1010₂"], answer: "1001₂", hint: "Six plus three equals nine.", explain: "110₂ is 6 and 11₂ is 3, so the sum is 9, written 1001₂. Right to left: 0+1 = 1; 1+1 = 0 carry 1; 1+0+1 = 0 carry 1; the last carry becomes the leading 1." }
    ]
  },
  {
    title: "🔄 NUMBER SYSTEM CONVERSIONS",
    questions: [
      { question: "What is decimal 5 in binary?", choices: ["101", "110", "111"], answer: "101", hint: "Four plus one equals five.", explain: "Break 5 into place values: 4 + 1 = 1·4 + 0·2 + 1·1, which reads 101 in binary." },
      { question: "What is binary 1010₂ in decimal?", choices: ["8", "10", "12"], answer: "10", hint: "Eight plus two equals ten.", explain: "Add the place values where there is a 1. In 1010₂ those are 8 and 2, so the value is 10." },
      { question: "What is decimal 8 in binary?", choices: ["1000", "1010", "1100"], answer: "1000", hint: "Eight is 2³.", explain: "8 is 2³, so it is a single 1 in the eights place followed by three zeros: 1000." },
      { question: "What is binary 111₂ in decimal?", choices: ["5", "6", "7"], answer: "7", hint: "Four plus two plus one.", explain: "111₂ means 4 + 2 + 1 = 7. Each 1 adds its place value." },
      { question: "What is decimal 15 in hexadecimal?", choices: ["E", "F", "10"], answer: "F", hint: "Hexadecimal digits A through F represent 10 through 15.", explain: "Hexadecimal uses 0–9 and then A–F for 10–15. Fifteen is the last digit, F." },
      { question: "What is hexadecimal A in decimal?", choices: ["8", "10", "12"], answer: "10", hint: "A is the first letter used for a two-digit decimal value.", explain: "In hexadecimal A stands for 10, B for 11, and so on up to F for 15." },
      { question: "What is decimal 16 in hexadecimal?", choices: ["F", "10", "11"], answer: "10", hint: "A new hexadecimal place begins at sixteen.", explain: "Hexadecimal moves to a new place at 16, so decimal 16 is written 10 (one sixteen, zero ones). It is not “ten”." },
      { question: "What is binary 10000₂ in decimal?", choices: ["8", "16", "32"], answer: "16", hint: "The leftmost 1 represents 2 to the fourth power.", explain: "In 10000₂ the only 1 sits in the 2⁴ place. 2⁴ = 16, so the value is 16." }
    ]
  },
  {
    title: "⚡ BOOLEAN ALGEBRA",
    questions: [
      { question: "What values can a Boolean variable have?", choices: ["True or False (1 or 0)", "Any integer", "Only positive numbers"], answer: "True or False (1 or 0)", hint: "Boolean logic has two possible values.", explain: "A Boolean variable has exactly two values: true or false, written 1 or 0." },
      { question: "What is the identity law for OR?", choices: ["A + 0 = A", "A + 1 = A", "A · 0 = A"], answer: "A + 0 = A", hint: "OR with zero does not change A.", explain: "OR with 0 leaves A unchanged, because the result depends only on A. That is the identity law A + 0 = A. (A + 1 = 1 is a different law.)" },
      { question: "What is the identity law for AND?", choices: ["A · 1 = A", "A · 0 = A", "A + 1 = A"], answer: "A · 1 = A", hint: "AND with one does not change A.", explain: "AND with 1 leaves A unchanged, so A · 1 = A. (A · 0 = 0 is a different law.)" },
      { question: "According to the complement law, A + A′ equals what?", choices: ["A", "0", "1"], answer: "1", hint: "A value OR its complement is always true.", explain: "Either A is true or its complement A′ is true, so “A or A′” is always true: A + A′ = 1." },
      { question: "According to the complement law, A · A′ equals what?", choices: ["1", "0", "A"], answer: "0", hint: "A value AND its opposite is always false.", explain: "A and A′ can never be true together, so “A and A′” is always false: A · A′ = 0." },
      { question: "Simplify A + A using the idempotent law.", choices: ["0", "A", "1"], answer: "A", hint: "Repeating the same value with OR changes nothing.", explain: "The idempotent law says repeating a value with OR changes nothing: A + A = A." },
      { question: "Simplify A · (A + B) using the absorption law.", choices: ["A", "B", "A + B"], answer: "A", hint: "Apply the absorption law.", explain: "Expand: A · (A + B) = A·A + A·B = A + AB = A(1 + B) = A. B adds nothing, so it is absorbed." },
      { question: "Simplify AB + A′C + BC using the Consensus theorem.", choices: ["AB + A′C", "AB + BC", "A′C + BC"], answer: "AB + A′C", hint: "The consensus term BC is redundant.", explain: "If B and C are both 1, then either A or A′ is 1, so one of the other two terms is already true. BC adds nothing, which makes it redundant: AB + A′C + BC = AB + A′C." }
    ]
  }
];

const topicLinks = ["https://en.wikipedia.org/wiki/Set_(mathematics)", "https://en.wikipedia.org/wiki/Algebra_of_sets", "https://en.wikipedia.org/wiki/Binary_number", "https://en.wikipedia.org/wiki/Hexadecimal", "https://en.wikipedia.org/wiki/Boolean_algebra"];

/* ---------- helpers ---------- */

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

function stopTimer() {
  if (timerId !== null) clearInterval(timerId);
  timerId = null;
}

function render(html) {
  stopTimer();
  if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
  root.innerHTML = html;
  const heading = root.querySelector("h1");
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}

function click(id, fn) { $(id).addEventListener("click", fn); }

function updateScores() {
  [0, 1].forEach(i => { const el = $("sc" + i); if (el) el.textContent = state.scores[i]; });
}

function spawnReward(text, extra = "") {
  const el = document.createElement("div");
  el.className = `floating-reward ${extra}`.trim();
  el.textContent = text;
  el.setAttribute("aria-hidden", "true");
  root.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
  setTimeout(() => el.remove(), 1500);
}

/* Two overlapping sets: one per player. The overlap is the shared game. */
function venn(r1 = 56, r2 = 56, on = 0, cls = "") {
  const id = "lens" + (++vennId);
  return `
    <svg class="venn ${cls}" viewBox="0 0 240 150" role="img" aria-label="Two overlapping sets, one for each player">
      <defs><clipPath id="${id}"><circle cx="95" cy="75" r="${r1}"/></clipPath></defs>
      <g class="ga"><circle class="va ${on === 2 ? "dim" : ""}" cx="95" cy="75" r="${r1}"/></g>
      <g class="gb"><circle class="vb ${on === 1 ? "dim" : ""}" cx="145" cy="75" r="${r2}"/></g>
      <circle class="lens" clip-path="url(#${id})" cx="145" cy="75" r="${r2}"/>
    </svg>`;
}

function hud() {
  const seat = i => `
    <div class="seat ${state.turn === i ? "on" : ""}">
      <span>${esc(state.names[i])}</span><b id="sc${i}">${state.scores[i]}</b><em>On turn</em>
    </div>`;
  return `<div class="hud">${seat(0)}${venn(56, 56, state.turn + 1)}${seat(1)}</div>`;
}

/* ---------- screens ---------- */

function showWelcome() {
  const prefill = i => (/^Player \d$/.test(state.names[i]) ? "" : esc(state.names[i]));
  render(`
    ${venn(56, 56, 0, "hero-venn converge")}
    <h1>The Set Theory Treasure Quest</h1>
    <p class="lead">Two players, one screen. Answer questions on alternate turns and collect points. Whoever has more points at the end wins.</p>
    <form id="nameForm">
      <label for="n1">First player</label>
      <input id="n1" maxlength="30" autocomplete="off" required value="${prefill(0)}">
      <label for="n2">Second player</label>
      <input id="n2" maxlength="30" autocomplete="off" required value="${prefill(1)}">
      <div class="actions"><button type="submit">Start game</button></div>
    </form>
    <p class="muted" style="margin-top:22px">Covers types of sets, set operations, binary addition, number system conversions and Boolean algebra.</p>
  `);
  $("n1").focus();
  $("nameForm").addEventListener("submit", e => {
    e.preventDefault();
    const a = $("n1").value.trim(), b = $("n2").value.trim();
    if (!a || !b) return;
    state.names = [a, b];
    state.scores = [0, 0];
    state.turn = 0;
    showDifficulty();
  });
}

function showDifficulty() {
  render(`
    ${hud()}
    <h1>Pick a difficulty</h1>
    <p class="lead">It applies to both players. You can change it between topics.</p>
    <div class="levels">
      ${Object.entries(levels).map(([name, v]) => `
        <button class="level" data-level="${name}" aria-pressed="${name === state.difficulty}">
          <b>${name}</b>
          <small>${v.seconds} seconds per question</small>
          <small>${v.points} points per correct answer</small>
          <small>${v.count} questions per topic</small>
        </button>`).join("")}
    </div>
    <div class="actions"><button id="go">Continue to topics</button></div>
  `);
  root.querySelectorAll("[data-level]").forEach(b => b.addEventListener("click", () => {
    state.difficulty = b.dataset.level;
    root.querySelectorAll("[data-level]").forEach(x => x.setAttribute("aria-pressed", x === b));
  }));
  click("go", showTopics);
}

function showTopics() {
  render(`
    ${hud()}
    <h1>Choose a topic</h1>
    <p class="lead">${esc(state.names[state.turn])}, you’re up. The turn passes to the other player after every question. Difficulty: ${state.difficulty}.</p>
    <div class="topic-list">
      <button class="row special" data-topic="bag"><b>Treasure bag</b><span>Pick ${BAG_MOVES} of your 5 cards that belong to the target set</span></button>
      ${topicMeta.map((t, i) => `<button class="row" data-topic="${i}"><b>${t.name}</b><span>${t.note}</span></button>`).join("")}
    </div>
    <div class="actions">
      <button class="ghost" id="changeLevel">Change difficulty</button>
      <button class="ghost" id="finish">Finish game</button>
    </div>
  `);
  root.querySelectorAll("[data-topic]").forEach(b => b.addEventListener("click", () => {
    b.dataset.topic === "bag" ? startBag() : startTopic(Number(b.dataset.topic));
  }));
  click("changeLevel", showDifficulty);
  click("finish", showResults);
}

/* ---------- treasure bag ---------- */

function startBag() {
  const digits = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const target = digits.slice(0, 3 + Math.floor(Math.random() * 3)).sort((a, b) => a - b);
  const inside = shuffle(target).slice(0, 2 + Math.floor(Math.random() * 2));
  const outside = shuffle(digits.filter(n => !target.includes(n))).slice(0, 5 - inside.length);
  bag = { target, cards: shuffle([...inside, ...outside]), picked: [], moves: BAG_MOVES, msg: "", kind: "" };
  showBag();
}

function showBag() {
  const done = bag.moves === 0;
  const kept = bag.picked.filter(p => p.ok).map(p => p.n);
  render(`
    ${hud()}
    <h1>Treasure bag</h1>
    <p class="lead">${esc(state.names[state.turn])}, pick the cards that belong to this set. ${done ? "No picks left." : `You have ${bag.moves} ${bag.moves === 1 ? "pick" : "picks"} left.`}</p>
    <p class="setnote">{${bag.target.join(", ")}}</p>
    <div class="tiles">
      ${bag.cards.map(n => {
        const hit = bag.picked.find(p => p.n === n);
        const cls = hit ? (hit.ok ? "in" : "out") : "ghost";
        return `<button class="tile ${cls}" data-n="${n}" ${hit || done ? "disabled" : ""}>${n}</button>`;
      }).join("")}
    </div>
    <h2>Your bag</h2>
    <p class="bag">${kept.length ? `{${kept.join(", ")}}` : "Empty"}</p>
    <p class="feedback ${bag.kind}" role="status">${bag.msg || "Pick a card."}</p>
    <div class="actions">
      ${done ? `<button id="bagDone">Back to topics</button>` : `<button class="ghost" id="bagLeave">Leave challenge</button>`}
    </div>
  `);
  root.querySelectorAll(".tile:not(:disabled)").forEach(b => b.addEventListener("click", () => {
    const n = Number(b.dataset.n);
    const ok = bag.target.includes(n);
    const pts = levels[state.difficulty].points;
    bag.moves--;
    bag.picked.push({ n, ok });
    if (ok) {
      state.scores[state.turn] += pts;
      bag.msg = `${n} belongs to the set because it is listed in {${bag.target.join(", ")}}. +${pts} points.`;
      bag.kind = "good";
    } else {
      bag.msg = `${n} is not in the set, because it is not listed in {${bag.target.join(", ")}}.`;
      bag.kind = "bad";
    }
    showBag();
    if (ok) spawnReward(`+${pts}`);
  }));
  if (done) click("bagDone", () => { state.turn = 1 - state.turn; showTopics(); });
  else click("bagLeave", showTopics);
}

/* ---------- questions ---------- */

function startTopic(ti) {
  quiz = { ti, list: shuffle(topics[ti].questions).slice(0, levels[state.difficulty].count), i: 0 };
  showQuestion();
}

function showQuestion() {
  if (quiz.i >= quiz.list.length) return showTopicDone();

  const L = levels[state.difficulty];
  const q = quiz.list[quiz.i];
  const last = quiz.i + 1 === quiz.list.length;
  let left = L.seconds;
  let answered = false;

  render(`
    ${hud()}
    <div class="meta">
      <span>${topicMeta[quiz.ti].name}, question ${quiz.i + 1} of ${quiz.list.length}</span>
      <span class="timer" id="timer" role="timer" aria-label="Seconds left">${left}</span>
    </div>
    <div class="clock"><i id="clock"></i></div>
    <div class="segs">${quiz.list.map((_, k) => `<span class="${k < quiz.i ? "done" : k === quiz.i ? "now" : ""}"></span>`).join("")}</div>
    <p class="q">${esc(q.question)}</p>
    <div>
      ${shuffle(q.choices).map((c, k) => `<button class="answer ghost" data-a="${esc(c)}"><kbd>${k + 1}</kbd><span class="t">${esc(c)}</span></button>`).join("")}
    </div>
    <p class="feedback" id="fb" role="status">${esc(state.names[state.turn])}, choose an answer. Keys 1 to ${q.choices.length} also work.</p>
    <div id="hintArea"></div>
    <div id="explainArea"></div>
    <div class="actions">
      <button class="ghost" id="hintBtn">Show hint</button>
      <button class="ghost" id="quit">Back to topics</button>
      <span id="next"></span>
    </div>
  `);

  const buttons = [...root.querySelectorAll(".answer")];
  const fb = $("fb");

  function settle(pick, timedOut) {
    if (answered) return;
    answered = true;
    stopTimer();
    buttons.forEach(b => {
      b.disabled = true;
      if (b.dataset.a === q.answer) b.classList.add("correct");
    });
    if (!timedOut && pick.dataset.a === q.answer) {
      state.scores[state.turn] += L.points;
      updateScores();
      fb.textContent = `Correct. +${L.points} points.`;
      fb.className = "feedback good";
      spawnReward(`+${L.points}`);
    } else {
      if (pick) pick.classList.add("wrong");
      fb.textContent = `${timedOut ? "Time’s up." : "Not quite."} The answer is ${q.answer}.`;
      fb.className = "feedback bad";
      if (timedOut) spawnReward("Time’s up", "late");
    }
    $("hintBtn").disabled = true;
    const missed = timedOut || pick.dataset.a !== q.answer;
    const label = missed ? "See why" : "Why is this the answer?";
    $("next").innerHTML = `
      <button class="ghost ${missed ? "need" : ""}" id="explainBtn" aria-expanded="false" aria-controls="explainArea">${label}</button>
      <button id="cont">${last ? "Finish topic" : "Next question"}</button>`;
    click("explainBtn", e => {
      const area = $("explainArea");
      const opening = area.innerHTML === "";
      area.innerHTML = opening
        ? `<div class="explain"><p>${esc(q.explain)}</p><a href="${topicLinks[quiz.ti]}" target="_blank" rel="noopener">Read more on Wikipedia</a></div>`
        : "";
      e.currentTarget.setAttribute("aria-expanded", opening);
      e.currentTarget.textContent = opening ? "Hide explanation" : label;
    });
    click("cont", () => { state.turn = 1 - state.turn; quiz.i++; showQuestion(); });
    $("cont").focus();
  }

  buttons.forEach(b => b.addEventListener("click", () => settle(b, false)));

  keyHandler = e => {
    const k = Number(e.key);
    if (!answered && k >= 1 && k <= buttons.length) settle(buttons[k - 1], false);
  };
  document.addEventListener("keydown", keyHandler);

  click("hintBtn", e => {
    if (answered) return;
    $("hintArea").innerHTML = `<p class="hint">Hint: ${esc(q.hint || "Read the question again and rule out the choices that can’t be right.")}</p>`;
    e.currentTarget.disabled = true;
  });
  click("quit", showTopics);

  timerId = setInterval(() => {
    left--;
    $("timer").textContent = left;
    $("clock").style.width = `${(left / L.seconds) * 100}%`;
    if (left <= 0) settle(null, true);
  }, 1000);
}

function showTopicDone() {
  const [a, b] = state.scores;
  const standing = a === b ? "The score is tied." : `${esc(state.names[a > b ? 0 : 1])} leads by ${Math.abs(a - b)}.`;
  render(`
    ${hud()}
    <h1>Topic complete</h1>
    <p class="lead">${topicMeta[quiz.ti].name} is finished. ${standing}</p>
    <div class="actions">
      <button id="more">Choose another topic</button>
      <button class="ghost" id="finish">See final results</button>
    </div>
  `);
  click("more", showTopics);
  click("finish", showResults);
}

function showResults() {
  const [a, b] = state.scores;
  const top = Math.max(a, b, 1);
  const radius = s => (a + b === 0 ? 48 : 26 + (44 * s) / top);
  const title = a === b ? "It’s a tie" : `${esc(state.names[a > b ? 0 : 1])} wins`;
  render(`
    <div class="results">
    ${venn(radius(a), radius(b), 0, "result-venn")}
    <h1>${title}</h1>
    <ul class="final">
      <li><span>${esc(state.names[0])}</span><b>${a}</b></li>
      <li><span>${esc(state.names[1])}</span><b>${b}</b></li>
    </ul>
    <p class="muted">Difficulty: ${state.difficulty}</p>
    <div class="actions">
      <button id="again">Play again</button>
      <button class="ghost" id="fresh">New players</button>
      <button class="ghost" id="back">Back to topics</button>
    </div>
    </div>
  `);
  click("again", () => { state.scores = [0, 0]; state.turn = 0; showDifficulty(); });
  click("fresh", () => { state.names = ["Player 1", "Player 2"]; state.scores = [0, 0]; state.turn = 0; showWelcome(); });
  click("back", showTopics);
}

showWelcome();

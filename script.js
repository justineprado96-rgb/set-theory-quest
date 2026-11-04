"use strict";

const root = document.querySelector(".game-container");
const $ = id => document.getElementById(id);

const state = { names: ["Player 1", "Player 2"], scores: [0, 0], turn: 0, difficulty: "Easy", done: [] };
let quiz = null, timerId = null, keyHandler = null, vennId = 0;

// Counts are even so both players answer the same number of questions.
const levels = {
  Easy:   { seconds: 30, points: 10, count: 6 },
  Medium: { seconds: 20, points: 20, count: 8 },
  Hard:   { seconds: 12, points: 30, count: 10 }
};

const PENALTY = 5; // points lost for a wrong pick

const topicMeta = [
  { name: "Types of sets", note: "Finite, empty, equal and disjoint sets, plus the symbols" },
  { name: "Set operations", note: "Union, intersection, difference and complement" },
  { name: "Addition and subtraction in number systems", note: "Binary, octal, hexadecimal and decimal arithmetic" },
  { name: "Number system conversions", note: "Decimal, binary, octal and hexadecimal" },
  { name: "Boolean algebra", note: "Identity, complement, absorption and consensus laws" }
];

const topics = [
  {
    title: "📚 TYPES OF SETS",
    questions: [
      { question: "Which set contains a limited number of elements?", choices: ["Finite Set", "Infinite Set", "Empty Set"], answer: "Finite Set", explain: "A finite set has a countable number of elements, so you could list them all and reach an end. {1, 2, 3} is finite." },
      { question: "Which set has no elements?", choices: ["Singleton Set", "Empty Set", "Universal Set"], answer: "Empty Set", explain: "The empty set, written ∅ or { }, has zero elements. A singleton has exactly one, and the universal set holds everything under discussion." },
      { question: "Which set contains exactly one element?", choices: ["Infinite Set", "Singleton Set", "Empty Set"], answer: "Singleton Set", explain: "A singleton set has exactly one element, such as {7}. One member only, no more and no fewer." },
      { question: "Which set contains an unlimited number of elements?", choices: ["Finite Set", "Empty Set", "Infinite Set"], answer: "Infinite Set", explain: "An infinite set never runs out of elements. The natural numbers {1, 2, 3, …} keep going forever." },
      { question: "If A = {1, 2} and B = {1, 2}, what is their relationship?", choices: ["Equal Sets", "Disjoint Sets", "Empty Sets"], answer: "Equal Sets", explain: "Sets are equal when they contain exactly the same elements. Order and repeats don’t matter, so {1, 2} and {2, 1} are equal." },
      { question: "If A = {1, 2} and B = {3, 4}, what are these sets?", choices: ["Equal Sets", "Disjoint Sets", "Overlapping Sets"], answer: "Disjoint Sets", explain: "Disjoint sets have no element in common, so their intersection is empty. {1, 2} and {3, 4} share nothing." },
      { question: "If A = {1, 2} and B = {2, 3}, what type of sets are they?", choices: ["Disjoint Sets", "Overlapping Sets", "Empty Sets"], answer: "Overlapping Sets", explain: "Overlapping sets share at least one element but each also has elements the other lacks. Here 2 is shared, 1 is only in A and 3 is only in B." },
      { question: "If every element of A is also in B, what is A in relation to B?", choices: ["A subset of B", "A disjoint set", "An infinite set"], answer: "A subset of B", explain: "A is a subset of B when every element of A is also in B. That is what “A ⊆ B” says." },
      { question: "Which symbol means 'is an element of'?", choices: ["∈", "∪", "∩"], answer: "∈", explain: "∈ reads “is an element of”, as in 2 ∈ {1, 2, 3}. ∪ means union and ∩ means intersection." },
      { question: "If A = {2, 4, 6}, is 4 an element of A?", choices: ["Yes", "No", "A is empty"], answer: "Yes", explain: "Check membership by looking for 4 in the list. A = {2, 4, 6} contains 4, so 4 ∈ A." },
      { question: "Which symbol means 'is a subset of'?", choices: ["⊆", "∩", "∪"], answer: "⊆", explain: "⊆ reads “is a subset of”. ∪ is union and ∩ is intersection, which are operations rather than relationships." },
      { question: "If A = {1, 2} and B = {1, 2, 3}, is A a subset of B?", choices: ["Yes", "No", "They are disjoint"], answer: "Yes", explain: "Both 1 and 2 appear in B = {1, 2, 3}, so every element of A is in B. That makes A a subset of B." },
      { question: "What is a proper subset?", choices: ["A subset that is not equal to the original set", "A set with no elements", "A set with infinite elements"], answer: "A subset that is not equal to the original set", explain: "A proper subset sits inside a set but is not equal to it, so the larger set has at least one extra element. {1} is a proper subset of {1, 2}." },
      { question: "What makes two finite sets equivalent?", choices: ["They have the same number of elements", "They have exactly the same elements", "They have no elements"], answer: "They have the same number of elements", explain: "Equivalent sets have the same number of elements (the same cardinality), even if the elements differ. {1, 2} and {a, b} are equivalent but not equal." },
      { question: "What is the universal set?", choices: ["The set of all elements being considered", "A set with one element only", "A set with no elements"], answer: "The set of all elements being considered", explain: "The universal set U contains every element being considered in a problem. Other sets are subsets of it, and complements are taken relative to it." },
      { question: "Which symbol commonly represents the empty set?", choices: ["∅", "∪", "∈"], answer: "∅", explain: "The empty set is written ∅ (or { }). ∪ is union and ∈ is “is an element of”." },
      { question: "If A = {a, b, c}, how many elements are in A?", choices: ["2", "3", "4"], answer: "3", explain: "Count each different element once. A = {a, b, c} has a, b and c, which makes 3." },
      { question: "If A = {1, 2, 3}, which statement is true?", choices: ["2 ∈ A", "5 ∈ A", "4 ∈ A"], answer: "2 ∈ A", explain: "Membership means the number is listed in the set. A = {1, 2, 3} lists 2, but not 4 or 5." },
      { question: "If A = {1, 2} and B = {2, 3}, which element do they share?", choices: ["1", "2", "3"], answer: "2", explain: "Look for elements listed in both sets. A = {1, 2} and B = {2, 3} both contain 2, while 1 and 3 each appear only once." }
    ]
  },
  {
    title: "🔢 SET OPERATIONS",
    questions: [
      { question: "What is {1, 2} ∪ {2, 3}?", choices: ["{2}", "{1, 2, 3}", "{1, 3}"], answer: "{1, 2, 3}", explain: "Union combines every element from both sets and lists shared ones once. {1, 2} ∪ {2, 3} gives {1, 2, 3}." },
      { question: "What is {1, 2} ∩ {2, 3}?", choices: ["{1, 2, 3}", "{1}", "{2}"], answer: "{2}", explain: "Intersection keeps only the elements found in both sets. Only 2 appears in {1, 2} and {2, 3}, so the result is {2}." },
      { question: "What is {1, 2} − {2, 3}?", choices: ["{1}", "{2}", "{1, 2, 3}"], answer: "{1}", explain: "A − B keeps what is in A but not in B. 1 is only in the first set, and 2 is removed because it is also in the second." },
      { question: "If U = {1, 2, 3, 4} and A = {1, 2}, what is Aᶜ?", choices: ["{1, 2}", "{3, 4}", "{1, 2, 3, 4}"], answer: "{3, 4}", explain: "The complement Aᶜ is everything in U that is not in A. Remove 1 and 2 from {1, 2, 3, 4} and {3, 4} is left." },
      { question: "What is {a, b} ∪ {b, c}?", choices: ["{b}", "{a, b, c}", "{a, c}"], answer: "{a, b, c}", explain: "Gather every element once: a, b and c. The shared b is listed only one time, giving {a, b, c}." },
      { question: "What is {2, 4, 6} ∩ {4, 6, 8}?", choices: ["{2, 8}", "{4, 6}", "{2, 4, 6, 8}"], answer: "{4, 6}", explain: "Only 4 and 6 appear in both sets. 2 is only in the first and 8 is only in the second, so the answer is {4, 6}." },
      { question: "What is {1, 2, 3} − {1, 3}?", choices: ["{1, 3}", "{2}", "{1, 2, 3}"], answer: "{2}", explain: "Take {1, 2, 3} and remove 1 and 3. Only 2 is left, so the answer is {2}." },
      { question: "If U = {a, b, c, d} and A = {a, c}, what is Aᶜ?", choices: ["{a, c}", "{b, d}", "{a, b, c, d}"], answer: "{b, d}", explain: "Aᶜ is U without A. Remove a and c from {a, b, c, d} and b and d remain." },
      { question: "What is {1, 2} ∪ ∅?", choices: ["∅", "{1, 2}", "{1}"], answer: "{1, 2}", explain: "The empty set has no elements to add, so {1, 2} ∪ ∅ is still {1, 2}." },
      { question: "What is {1, 2} ∩ ∅?", choices: ["{1, 2}", "{1}", "∅"], answer: "∅", explain: "The empty set has nothing to share, so any intersection with ∅ is empty. {1, 2} ∩ ∅ = ∅." },
      { question: "What is {3, 4, 5} − {4}?", choices: ["{4}", "{3, 5}", "{3, 4, 5}"], answer: "{3, 5}", explain: "Remove 4 from {3, 4, 5} and the answer is {3, 5}." },
      { question: "What is {a, b, c} ∪ {c, d}?", choices: ["{c}", "{a, b, c, d}", "{a, b, d}"], answer: "{a, b, c, d}", explain: "Union lists every element once. c appears in both sets but is written one time, giving {a, b, c, d}." },
      { question: "What is {2, 4, 6} ∩ {1, 3, 5}?", choices: ["{2, 4, 6}", "{1, 3, 5}", "∅"], answer: "∅", explain: "Even numbers and odd numbers never overlap, so these sets are disjoint and their intersection is empty: ∅." },
      { question: "If A = {1, 3, 5} and B = {1, 2, 3}, what is A − B?", choices: ["{1, 3}", "{5}", "{1, 2, 3, 5}"], answer: "{5}", explain: "1 and 3 are also in B, so they are removed from A. Only 5 stays, so A − B = {5}. The 2 belongs to B only, so it is not in the answer." },
      { question: "What does union combine?", choices: ["All elements from both sets without duplicates", "Only the common elements", "Only elements in the first set"], answer: "All elements from both sets without duplicates", explain: "Union is the combined set: everything from both sets, with no duplicates. Common elements alone describe intersection." },
      { question: "What does intersection find?", choices: ["All elements from both sets", "Elements common to both sets", "Elements outside the universal set"], answer: "Elements common to both sets", explain: "Intersection finds the overlap, the elements that belong to both sets at once." },
      { question: "What does A − B contain?", choices: ["Elements in A that are not in B", "Elements in B that are not in A", "All elements in A and B"], answer: "Elements in A that are not in B", explain: "A − B means elements in A that are not in B. Order matters: B − A would give a different set." },
      { question: "The complement of A is defined relative to which set?", choices: ["The universal set", "The empty set only", "Any unrelated set"], answer: "The universal set", explain: "A complement only makes sense relative to a full group of possible elements. That group is the universal set U." }
    ]
  },
  {
    title: "💻 BINARY ADDITION",
    questions: [
      { question: "What is 0 + 0 in binary?", choices: ["0", "1", "10"], answer: "0", explain: "In any base, 0 + 0 = 0. Adding nothing to nothing leaves nothing." },
      { question: "What is 0 + 1 in binary?", choices: ["0", "1", "10"], answer: "1", explain: "0 + 1 = 1. Adding zero doesn’t change a value, so the answer is 1." },
      { question: "What is 1 + 1 in binary?", choices: ["0", "1", "10"], answer: "10", explain: "1 + 1 equals 2, and in binary 2 is written 10. Write 0 in this column and carry 1 to the next." },
      { question: "What is 1 + 1 + 1 in binary?", choices: ["10", "11", "100"], answer: "11", explain: "1 + 1 + 1 equals 3, and 3 is 2 + 1, written 11 in binary. Write 1 and carry 1." },
      { question: "What is 10₂ + 1₂?", choices: ["10₂", "11₂", "100₂"], answer: "11₂", explain: "10₂ is 2 and 1₂ is 1, so the sum is 3, written 11₂. Only the last column changes: 0 + 1 = 1 with no carry." },
      { question: "What is 11₂ + 1₂?", choices: ["100₂", "101₂", "111₂"], answer: "100₂", explain: "11₂ is 3, and 3 + 1 = 4, which is 100₂. In the right column 1 + 1 = 0 carry 1, the next column does the same, and the carry becomes a new leading 1." },
      { question: "What is 101₂ + 10₂?", choices: ["110₂", "111₂", "1000₂"], answer: "111₂", explain: "101₂ is 5 and 10₂ is 2, so the sum is 7, which is 111₂. Adding column by column (1+0, 0+1, 1+0) gives no carries." },
      { question: "What is 110₂ + 11₂?", choices: ["1000₂", "1001₂", "1010₂"], answer: "1001₂", explain: "110₂ is 6 and 11₂ is 3, so the sum is 9, written 1001₂. Right to left: 0+1 = 1; 1+1 = 0 carry 1; 1+0+1 = 0 carry 1; the last carry becomes the leading 1." },
      { question: "What is 1₂ − 1₂?", choices: ["0₂", "1₂", "10₂"], answer: "0₂", explain: "1 − 1 = 0 in every base. Subtracting a number from itself always leaves 0." },
      { question: "What is 10₂ − 1₂?", choices: ["0₂", "1₂", "11₂"], answer: "1₂", explain: "10₂ is 2 and 1₂ is 1, so 2 − 1 = 1. In the right column you borrow: the 0 becomes 10₂, and 10₂ − 1₂ = 1₂." },
      { question: "What is 110₂ − 11₂?", choices: ["10₂", "11₂", "101₂"], answer: "11₂", explain: "110₂ is 6 and 11₂ is 3, so 6 − 3 = 3, which is 11₂. Check by adding back: 11₂ + 11₂ = 110₂." },
      { question: "What is 1010₂ − 101₂?", choices: ["100₂", "101₂", "111₂"], answer: "101₂", explain: "1010₂ is 10 and 101₂ is 5, so 10 − 5 = 5, which is 101₂. Check: 101₂ + 101₂ = 1010₂." },
      { question: "In binary subtraction, what do you do when a column needs 0 − 1?", choices: ["Borrow from the next column to the left", "Carry a 1 to the next column", "Skip the column"], answer: "Borrow from the next column to the left", explain: "You borrow from the next column on the left. The borrowed 1 is worth 2 in this column, so the 0 becomes 10₂ and 10₂ − 1₂ = 1₂." },
      { question: "What is 5₈ + 3₈?", choices: ["7₈", "10₈", "11₈"], answer: "10₈", explain: "5 + 3 = 8 in decimal. Octal starts a new place at 8, so 8 is written 10₈: write 0 and carry 1." },
      { question: "What is 27₈ + 16₈?", choices: ["43₈", "45₈", "53₈"], answer: "45₈", explain: "Right column: 7 + 6 = 13, which is one eight and 5 ones, so write 5 and carry 1. Left column: 2 + 1 + 1 = 4. The answer is 45₈ (decimal 23 + 14 = 37)." },
      { question: "What is 10₈ − 1₈?", choices: ["1₈", "7₈", "11₈"], answer: "7₈", explain: "10₈ is 8 in decimal, and 8 − 1 = 7. In the column you borrow one eight, so 0 becomes 8 and 8 − 1 = 7." },
      { question: "What is 52₈ − 17₈?", choices: ["33₈", "35₈", "43₈"], answer: "33₈", explain: "52₈ is 42 and 17₈ is 15, so 42 − 15 = 27, which is 33₈. The right column borrows one eight: 2 + 8 = 10, and 10 − 7 = 3. The left column is 5 − 1 (lent) − 1 = 3." },
      { question: "In octal addition, what happens when a column adds up to 8 or more?", choices: ["Write the remainder and carry 1 to the next column", "Write 8 and keep going", "Carry 2 to the next column"], answer: "Write the remainder and carry 1 to the next column", explain: "Every place in octal is worth 8 times the one before it, so each 8 in a column becomes a carry of 1. The leftover stays in that column." },
      { question: "What is 9₁₆ + 1₁₆?", choices: ["10₁₆", "A₁₆", "B₁₆"], answer: "A₁₆", explain: "9 + 1 = 10 in decimal. Hexadecimal has a single digit for ten, which is A, so no carry is needed yet." },
      { question: "What is F₁₆ + 1₁₆?", choices: ["F₁₆", "10₁₆", "11₁₆"], answer: "10₁₆", explain: "F is 15, and 15 + 1 = 16. Hexadecimal starts a new place at 16, so the result is 10₁₆: write 0 and carry 1." },
      { question: "What is 2A₁₆ + 15₁₆?", choices: ["3E₁₆", "3F₁₆", "40₁₆"], answer: "3F₁₆", explain: "Right column: A (10) + 5 = 15, which is F. Left column: 2 + 1 = 3. The answer is 3F₁₆ (decimal 42 + 21 = 63)." },
      { question: "What is 1B₁₆ + 9₁₆?", choices: ["23₁₆", "24₁₆", "32₁₆"], answer: "24₁₆", explain: "B (11) + 9 = 20, which is one sixteen and 4 ones, so write 4 and carry 1. Then 1 + 1 = 2. The answer is 24₁₆ (decimal 27 + 9 = 36)." },
      { question: "What is 10₁₆ − 1₁₆?", choices: ["1₁₆", "E₁₆", "F₁₆"], answer: "F₁₆", explain: "10₁₆ is 16 in decimal, and 16 − 1 = 15, which is F in hexadecimal." },
      { question: "What is 3C₁₆ − 1F₁₆?", choices: ["1C₁₆", "1D₁₆", "2D₁₆"], answer: "1D₁₆", explain: "3C₁₆ is 60 and 1F₁₆ is 31, so 60 − 31 = 29, which is 1D₁₆. Right column: C (12) − F (15) needs a borrow, so 12 + 16 = 28 and 28 − 15 = 13 = D. Left column: 3 − 1 (lent) − 1 = 1." },
      { question: "What is 47 + 38 in decimal?", choices: ["75", "85", "95"], answer: "85", explain: "7 + 8 = 15, so write 5 and carry 1. Then 4 + 3 + 1 = 8. The answer is 85." },
      { question: "What is 256 + 189 in decimal?", choices: ["435", "445", "455"], answer: "445", explain: "6 + 9 = 15: write 5, carry 1. 5 + 8 + 1 = 14: write 4, carry 1. 2 + 1 + 1 = 4. The answer is 445." },
      { question: "What is 82 − 37 in decimal?", choices: ["35", "45", "55"], answer: "45", explain: "2 − 7 needs a borrow, so 12 − 7 = 5. Then 8 − 1 (lent) − 3 = 4. The answer is 45." },
      { question: "What is 500 − 276 in decimal?", choices: ["224", "234", "324"], answer: "224", explain: "Borrow across the zeros: 10 − 6 = 4, then 9 − 7 = 2, then 4 − 2 = 2. The answer is 224. Check: 224 + 276 = 500." },
    ]
  },
  {
    title: "🔄 NUMBER SYSTEM CONVERSIONS",
    questions: [
      { question: "What is decimal 5 in binary?", choices: ["101", "110", "111"], answer: "101", explain: "Break 5 into place values: 4 + 1 = 1·4 + 0·2 + 1·1, which reads 101 in binary." },
      { question: "What is binary 1010₂ in decimal?", choices: ["8", "10", "12"], answer: "10", explain: "Add the place values where there is a 1. In 1010₂ those are 8 and 2, so the value is 10." },
      { question: "What is decimal 8 in binary?", choices: ["1000", "1010", "1100"], answer: "1000", explain: "8 is 2³, so it is a single 1 in the eights place followed by three zeros: 1000." },
      { question: "What is binary 111₂ in decimal?", choices: ["5", "6", "7"], answer: "7", explain: "111₂ means 4 + 2 + 1 = 7. Each 1 adds its place value." },
      { question: "What is decimal 15 in hexadecimal?", choices: ["E", "F", "10"], answer: "F", explain: "Hexadecimal uses 0–9 and then A–F for 10–15. Fifteen is the last digit, F." },
      { question: "What is hexadecimal A in decimal?", choices: ["8", "10", "12"], answer: "10", explain: "In hexadecimal A stands for 10, B for 11, and so on up to F for 15." },
      { question: "What is decimal 16 in hexadecimal?", choices: ["F", "10", "11"], answer: "10", explain: "Hexadecimal moves to a new place at 16, so decimal 16 is written 10 (one sixteen, zero ones). It is not “ten”." },
      { question: "What is binary 10000₂ in decimal?", choices: ["8", "16", "32"], answer: "16", explain: "In 10000₂ the only 1 sits in the 2⁴ place. 2⁴ = 16, so the value is 16." },
      { question: "Which digits does the octal system use?", choices: ["0 to 7", "0 to 8", "1 to 8"], answer: "0 to 7", explain: "Octal is base 8, so it has eight digits: 0, 1, 2, 3, 4, 5, 6 and 7. There is no 8 or 9." },
      { question: "What is decimal 8 in octal?", choices: ["7", "10", "18"], answer: "10", explain: "Octal starts a new place at 8, so decimal 8 is written 10 (one eight, zero ones)." },
      { question: "What is octal 17 in decimal?", choices: ["7", "15", "17"], answer: "15", explain: "17₈ = 1 × 8 + 7 × 1 = 15." },
      { question: "What is decimal 64 in octal?", choices: ["64", "100", "1000"], answer: "100", explain: "64 = 8², so it is a single 1 in the 8² place followed by two zeros: 100₈." },
      { question: "What is binary 101110 in octal?", choices: ["56", "65", "46"], answer: "56", explain: "Group the bits in threes from the right: 101 and 110. 101₂ = 5 and 110₂ = 6, so the octal number is 56." },
    ]
  },
  {
    title: "⚡ BOOLEAN ALGEBRA",
    questions: [
      { question: "What values can a Boolean variable have?", choices: ["True or False (1 or 0)", "Any integer", "Only positive numbers"], answer: "True or False (1 or 0)", explain: "A Boolean variable has exactly two values: true or false, written 1 or 0." },
      { question: "What is the identity law for OR?", choices: ["A + 0 = A", "A + 1 = A", "A · 0 = A"], answer: "A + 0 = A", explain: "OR with 0 leaves A unchanged, because the result depends only on A. That is the identity law A + 0 = A. (A + 1 = 1 is a different law.)" },
      { question: "What is the identity law for AND?", choices: ["A · 1 = A", "A · 0 = A", "A + 1 = A"], answer: "A · 1 = A", explain: "AND with 1 leaves A unchanged, so A · 1 = A. (A · 0 = 0 is a different law.)" },
      { question: "According to the complement law, A + A′ equals what?", choices: ["A", "0", "1"], answer: "1", explain: "Either A is true or its complement A′ is true, so “A or A′” is always true: A + A′ = 1." },
      { question: "According to the complement law, A · A′ equals what?", choices: ["1", "0", "A"], answer: "0", explain: "A and A′ can never be true together, so “A and A′” is always false: A · A′ = 0." },
      { question: "Simplify A + A using the idempotent law.", choices: ["0", "A", "1"], answer: "A", explain: "The idempotent law says repeating a value with OR changes nothing: A + A = A." },
      { question: "Simplify A · (A + B) using the absorption law.", choices: ["A", "B", "A + B"], answer: "A", explain: "Expand: A · (A + B) = A·A + A·B = A + AB = A(1 + B) = A. B adds nothing, so it is absorbed." },
      { question: "Simplify AB + A′C + BC using the Consensus theorem.", choices: ["AB + A′C", "AB + BC", "A′C + BC"], answer: "AB + A′C", explain: "If B and C are both 1, then either A or A′ is 1, so one of the other two terms is already true. BC adds nothing, which makes it redundant: AB + A′C + BC = AB + A′C." },
      { question: "What does A + 1 equal in Boolean algebra?", choices: ["A", "1", "0"], answer: "1", explain: "OR with 1 is always true, whatever A is. This is the domination law: A + 1 = 1." },
      { question: "What does A · 0 equal in Boolean algebra?", choices: ["A", "1", "0"], answer: "0", explain: "AND with 0 is always false, whatever A is: A · 0 = 0." },
      { question: "What is the double complement (A′)′ equal to?", choices: ["A", "A′", "1"], answer: "A", explain: "Negating twice cancels out, so (A′)′ = A." },
      { question: "By De Morgan’s law, what is (A · B)′ equal to?", choices: ["A′ + B′", "A′ · B′", "A + B"], answer: "A′ + B′", explain: "De Morgan’s law: the complement of an AND is the OR of the complements. Break the bar and change the operator: (A · B)′ = A′ + B′." },
    ]
  }
];

const topicLinks = [
  "https://en.wikipedia.org/wiki/Set_(mathematics)",
  "https://en.wikipedia.org/wiki/Algebra_of_sets",
  "https://en.wikipedia.org/wiki/Numeral_system",
  "https://en.wikipedia.org/wiki/Numeral_system",
  "https://en.wikipedia.org/wiki/Boolean_algebra"
];

/* ---------- sound effects (synthesized, no audio files needed) ---------- */

const sfx = (() => {
  let ctx = null;
  let on = true;
  try { on = localStorage.getItem("mindDuelSound") !== "off"; } catch (e) { /* storage unavailable */ }

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, delay, length, type, volume) {
    if (!on) return;
    const c = audio();
    if (!c) return;
    const t = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + length + 0.05);
  }

  const play = (notes, type, volume, step) => notes.forEach((f, i) => tone(f, i * step, step * 1.6, type, volume));

  return {
    isOn: () => on,
    toggle() {
      on = !on;
      try { localStorage.setItem("mindDuelSound", on ? "on" : "off"); } catch (e) { /* ignore */ }
      if (on) tone(660, 0, 0.1, "triangle", 0.1);
    },
    pick: () => tone(660, 0, 0.08, "triangle", 0.07),
    correct: () => play([523, 659, 784], "triangle", 0.14, 0.09),
    wrong: () => play([196, 147], "sawtooth", 0.08, 0.16),
    timeout: () => play([330, 262, 196], "square", 0.06, 0.13),
    win: () => play([523, 659, 784, 1047, 784, 1047], "triangle", 0.15, 0.12),
    tie: () => play([523, 523, 659], "triangle", 0.12, 0.16)
  };
})();

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

function resetGame() {
  state.scores = [0, 0];
  state.turn = 0;
  state.done = [];
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

/* Scores stay hidden during play: the scoreboard only shows whose turn it is. */
function hud() {
  const seat = i => `
    <div class="seat ${state.turn === i ? "on" : ""}">
      <span>${esc(state.names[i])}</span><em>On turn</em>
    </div>`;
  return `<div class="hud">${seat(0)}${venn(56, 56, state.turn + 1)}${seat(1)}</div>`;
}

/* ---------- screens ---------- */

function showWelcome() {
  const prefill = i => (/^Player \d$/.test(state.names[i]) ? "" : esc(state.names[i]));
  render(`
    ${venn(56, 56, 0, "hero-venn converge")}
    <h1>Mind Duel: Are You Set Enough?</h1>
    <p class="lead">Two players, one screen. Answer questions on alternate turns and collect points, but a wrong answer costs ${PENALTY} points. Scores stay hidden until the very end, so nobody knows who is winning until the duel is over.</p>
    <form id="nameForm">
      <label for="n1">First player</label>
      <input id="n1" maxlength="30" autocomplete="off" required value="${prefill(0)}">
      <label for="n2">Second player</label>
      <input id="n2" maxlength="30" autocomplete="off" required value="${prefill(1)}">
      <div class="actions"><button type="submit">Start the duel</button></div>
    </form>
    <p class="muted" style="margin-top:22px">Covers types of sets, set operations, addition and subtraction in number systems, number system conversions (including octal) and Boolean algebra.</p>
  `);
  $("n1").focus();
  $("nameForm").addEventListener("submit", e => {
    e.preventDefault();
    const a = $("n1").value.trim(), b = $("n2").value.trim();
    if (!a || !b) return;
    state.names = [a, b];
    resetGame();
    showDifficulty();
  });
}

function showDifficulty() {
  render(`
    ${hud()}
    <h1>Pick a difficulty</h1>
    <p class="lead">It applies to both players for the whole duel and can’t be changed once you continue.</p>
    <div class="levels">
      ${Object.entries(levels).map(([name, v]) => `
        <button class="level" data-level="${name}" aria-pressed="${name === state.difficulty}">
          <b>${name}</b>
          <small>${v.seconds} seconds per question</small>
          <small>${v.points} points per correct answer</small>
          <small>-${PENALTY} points for a wrong pick</small>
          <small>${v.count} questions per topic</small>
        </button>`).join("")}
    </div>
    <div class="actions"><button id="go">Lock it in</button></div>
  `);
  root.querySelectorAll("[data-level]").forEach(b => b.addEventListener("click", () => {
    state.difficulty = b.dataset.level;
    root.querySelectorAll("[data-level]").forEach(x => x.setAttribute("aria-pressed", x === b));
  }));
  click("go", showTopics);
}

function showTopics() {
  if (state.done.length === topicMeta.length) return showResults();
  render(`
    ${hud()}
    <h1>Choose a topic</h1>
    <p class="lead">${esc(state.names[state.turn])}, you’re up. Each topic can only be played once, and the scores stay a surprise until the game is finished. Difficulty: ${state.difficulty}.</p>
    <div class="topic-list">
      ${topicMeta.map((t, i) => {
        const finished = state.done.includes(i);
        return `<button class="row" data-topic="${i}" ${finished ? "disabled" : ""}><b>${t.name}</b><span>${finished ? "Completed" : t.note}</span></button>`;
      }).join("")}
    </div>
    <div class="actions"><button class="ghost" id="finish">Finish game</button></div>
  `);
  root.querySelectorAll("[data-topic]:not(:disabled)").forEach(b => b.addEventListener("click", () => startTopic(Number(b.dataset.topic))));
  click("finish", showResults);
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
    <div id="explainArea"></div>
    <div class="actions"><span id="next"></span></div>
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
    const right = !timedOut && pick.dataset.a === q.answer;
    if (right) {
      state.scores[state.turn] += L.points;
      fb.textContent = "Correct.";
      fb.className = "feedback good";
      spawnReward("Correct!");
      sfx.correct();
    } else {
      if (pick) pick.classList.add("wrong");
      fb.textContent = `${timedOut ? "Time’s up." : "Not quite."} The answer is ${q.answer}.`;
      fb.className = "feedback bad";
      if (timedOut) {
        spawnReward("Time’s up", "late");
        sfx.timeout();
      } else {
        state.scores[state.turn] -= PENALTY;
        spawnReward(`-${PENALTY} Wrong`, "late");
        sfx.wrong();
      }
    }
    const label = right ? "Why is this the answer?" : "See why";
    $("next").innerHTML = `
      <button class="ghost ${right ? "" : "need"}" id="explainBtn" aria-expanded="false" aria-controls="explainArea">${label}</button>
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
    // The turn passes after every question except the last one, so the other player opens the next topic.
    click("cont", () => { if (!last) state.turn = 1 - state.turn; quiz.i++; showQuestion(); });
    $("cont").focus();
  }

  buttons.forEach(b => b.addEventListener("click", () => settle(b, false)));

  keyHandler = e => {
    const k = Number(e.key);
    if (!answered && k >= 1 && k <= buttons.length) settle(buttons[k - 1], false);
  };
  document.addEventListener("keydown", keyHandler);

  timerId = setInterval(() => {
    left--;
    $("timer").textContent = left;
    $("clock").style.width = `${(left / L.seconds) * 100}%`;
    if (left <= 0) settle(null, true);
  }, 1000);
}

function showTopicDone() {
  if (!state.done.includes(quiz.ti)) state.done.push(quiz.ti);
  const all = state.done.length === topicMeta.length;
  render(`
    ${hud()}
    <h1>Topic complete</h1>
    <p class="lead">${topicMeta[quiz.ti].name} is finished and can’t be played again. ${all
      ? "That was the last topic. Time to find out who is set enough!"
      : `${esc(state.names[state.turn])} picks the next topic.`}</p>
    <div class="actions">
      ${all ? "" : `<button id="more">Choose another topic</button>`}
      <button class="${all ? "" : "ghost"}" id="finish">Finish game</button>
    </div>
  `);
  if (!all) click("more", showTopics);
  click("finish", showResults);
}

function showResults() {
  const [a, b] = state.scores;
  const low = Math.min(a, b, 0);
  const span = Math.max(a, b) - low;
  const radius = s => (span === 0 ? 48 : 26 + (44 * (s - low)) / span);
  const tie = a === b;
  const winner = esc(state.names[a > b ? 0 : 1]);
  render(`
    <div class="results">
      ${venn(radius(a), radius(b), 0, "result-venn")}
      <h1>${tie ? "It’s a tie" : `${winner} wins!`}</h1>
      <p class="lead">${tie ? "Neither of you is set enough for this duel!" : `${winner} is set enough for this duel!`}</p>
      <ul class="final">
        <li><span>${esc(state.names[0])}</span><b>${a}</b></li>
        <li><span>${esc(state.names[1])}</span><b>${b}</b></li>
      </ul>
      <p class="muted">Difficulty: ${state.difficulty}</p>
      <div class="actions">
        <button id="again">Play again</button>
        <button class="ghost" id="fresh">New players</button>
      </div>
    </div>
  `);
  if (tie) sfx.tie(); else sfx.win();
  click("again", () => { resetGame(); showDifficulty(); });
  click("fresh", () => { state.names = ["Player 1", "Player 2"]; resetGame(); showWelcome(); });
}

/* ---------- sound toggle + button click sound ---------- */

const soundBtn = $("soundBtn");
function paintSound() {
  if (!soundBtn) return;
  soundBtn.textContent = sfx.isOn() ? "Sound: on" : "Sound: off";
  soundBtn.setAttribute("aria-pressed", sfx.isOn());
}
if (soundBtn) soundBtn.addEventListener("click", () => { sfx.toggle(); paintSound(); });
paintSound();

root.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (b && !b.disabled && !b.classList.contains("answer")) sfx.pick();
});

showWelcome();

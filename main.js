const wordDisplay = document.getElementById("wordDisplay");
const timerDisplay = document.getElementById("timer");
const results = document.getElementById("results");
const timerButtons = document.querySelectorAll(".timerButton");
const resetButton = document.getElementById("resetTestButton");

let words = [];
let currentIndex = 0;
let allChars = [];
let typedChars = [];
let correctChars = 0;
let incorrectChars = 0;
let totalTyped = 0;
let timer = 30;
let countdownStarted = false;
let interval;
let currentWordIndex = 0;
let currentLineIndex = 0;
let allLines = [];
let charsTypedSinceLastSpace = 0;
let committedIndex = 0;
let firstScroll = true;
let initialTimer = 30;
let generatedText = "";


fetch("words.json")
  .then((response) => response.json())
  .then((data) => {
    words = data.words;
    generatedText = generateWords();
    renderText(generatedText);
  })
  .catch((error) => console.error("Error loading words:", error));

function generateWords() {
  const wordCount = 600;
  const wordList = Array.from(
    { length: wordCount },
    () => words[Math.floor(Math.random() * words.length)]
  );

  return wordList.join(" ");
}

const lineContainer = document.getElementById("lineContainer");

function renderText(text) {
  lineContainer.innerHTML = "";
  allChars = [];
  
  text.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    if (index === 0) span.classList.add("current");
    lineContainer.appendChild(span);
    allChars.push(span);
  });

  wordDisplay.focus();
}

function startTest() {
  timerDisplay.style.visibility = "visible";
  resetButton.style.visibility = "visible";
  incorrectChars = 0;
  results.innerHTML = "";
  currentIndex = 0;
  typedChars = [];
  correctChars = 0;
  totalTyped = 0;
  countdownStarted = true;
  initialTimer = timer;

  currentWordIndex = 0;
  currentLineIndex = 0;
  committedIndex = 0;

  renderText(generatedText);
  startTimer();
}

function startTimer() {
  timerDisplay.textContent = `${timer}`;
  timerDisplay.style.visibility = "visible";
  const buttons = document.querySelectorAll(".timerButton");
  buttons.forEach((btn) => {
    btn.classList.add("hidden");
  });
  interval = setInterval(() => {
    timer--;
    timerDisplay.textContent = `${timer}`;
    if (timer <= 0) {
      clearInterval(interval);
      endTest();
    }
  }, 1000);
}

resetButton.addEventListener("click", () => {
  window.location.reload();
});

function endTest() {
  resetButton.style.visibility = "hidden";
  document.removeEventListener("keydown", handleKey);
  const timeInMinutes = initialTimer / 60;
  const wpm = Math.round(correctChars / 5 / timeInMinutes);
  const totalEvaluated = correctChars + incorrectChars;
  const accuracy = totalEvaluated > 0 ? Math.round((correctChars / totalEvaluated) * 100) : 0;
  results.innerHTML = `
<p><strong>შედეგები:</strong></p>
<p>სისწრაფე: ${wpm} სიტყვა/წუთში</p>
<p>სიზუსტე: ${accuracy}%</p>
`;
}

function handleKey(e) {
  if (!countdownStarted) {
    if (
      e.key.length === 1 ||
      e.key === " " ||
      e.key === "Backspace"
    ) {
      startTest();
    } else {
      return;
    }
  }

  const char = e.key;

  if (
    char === "Shift" ||
    char === "Alt" ||
    char === "Control" ||
    char === "Meta" ||
    char === "Tab" ||
    char === "CapsLock" ||
    char === "Enter" ||
    char === "ArrowLeft" ||
    char === "ArrowRight" ||
    char === "ArrowUp" ||
    char === "ArrowDown" ||
    char === "Escape" ||
    char.startsWith("F")
  ) {
    return;
  }

  if (char === "Backspace") {
    if (currentIndex > 0) {
      currentIndex--;
      totalTyped--;
      allChars[currentIndex].classList.remove("correct", "incorrect");
      allChars[currentIndex + 1]?.classList.remove("current");
      allChars[currentIndex].classList.add("current");
    }
    return;
  }

  const currentChar = allChars[currentIndex];
  if (!currentChar) return;

  if (char === currentChar.textContent) {
    currentChar.classList.add("correct");
    correctChars++;
  } else {
    currentChar.classList.add("incorrect");
    incorrectChars++;
  }

  currentChar.classList.remove("current");
  currentIndex++;
  if (allChars[currentIndex]) {
    allChars[currentIndex].classList.add("current");
  }
  totalTyped++;

  const currentSpan = document.querySelector("#wordDisplay .current");
  if (currentSpan) {
    const offset = currentSpan.offsetTop;
    const lineHeight = parseFloat(getComputedStyle(wordDisplay).lineHeight);
    const containerHeight = wordDisplay.clientHeight;
    const desiredOffset = containerHeight / 2 - lineHeight / 2;
    const scroll = Math.max(0, offset - desiredOffset);
    lineContainer.style.transform = `translateY(-${scroll}px)`;
  }
}


document.addEventListener("keydown", handleKey);

Array.from(timerButtons).forEach((button) => {
  button.addEventListener("click", () => {
    timerButtons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
    timer = parseInt(button.getAttribute("data-time"));
  });
});

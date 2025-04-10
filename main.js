const wordDisplay = document.getElementById("wordDisplay");
const timerDisplay = document.getElementById("timer");
const results = document.getElementById("results");
const timerButtons = document.querySelectorAll(".timerButton");

let words = [];
let currentIndex = 0;
let allChars = [];
let typedChars = [];
let correctChars = 0;
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

fetch("words.json")
  .then((response) => response.json())
  .then((data) => {
    words = data.words;
    allLines = generateWords();
    renderText(allLines);
  })
  .catch((error) => console.error("Error loading words:", error));

function generateWords() {
  const wordCount = 600;
  const wordList = Array.from(
    { length: wordCount },
    () => words[Math.floor(Math.random() * words.length)]
  );

  const lines = [];
  for (let i = 0; i < wordList.length; i += 8) {
    lines.push(wordList.slice(i, i + 8).join(" "));
  }

  return lines;
}

const lineContainer = document.getElementById("lineContainer");

function renderText(linesToRender) {
  lineContainer.innerHTML = "";
  allChars = [];

  linesToRender.forEach((lineText, lineIndex) => {
    const lineDiv = document.createElement("div");
    lineDiv.className = "line";

    lineText.split("").forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      if (allChars.length === 0) span.classList.add("current");
      lineDiv.appendChild(span);
      allChars.push(span);
    });

    const spaceSpan = document.createElement("span");
    spaceSpan.textContent = " ";
    lineDiv.appendChild(spaceSpan);
    allChars.push(spaceSpan);

    lineContainer.appendChild(lineDiv);
  });

  wordDisplay.focus();
}

function startTest() {
  timerDisplay.style.display = "block";
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

  renderText(allLines);
  startTimer();
}

function startTimer() {
  timerDisplay.textContent = `${timer}`;
  timerDisplay.style.display = "block";
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

function endTest() {
  document.removeEventListener("keydown", handleKey);
  const timeInMinutes = initialTimer / 60;
  const wpm = Math.round(correctChars / 5 / timeInMinutes);
  const accuracy =
    totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;
  results.innerHTML = `
<p><strong>შედეგები:</strong></p>
<p>სისწრაფე: ${wpm} სიტყვა/წუთში</p>
<p>სიზუსტე: ${accuracy}%</p>
`;
}

function handleKey(e) {
  if (!countdownStarted) {
    startTest();
  }

  const char = e.key;

  if (
    char === "Shift" ||
    char === "Alt" ||
    char === "Control" ||
    char === "Meta"
  )
    return;

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
  }

  if (currentIndex === committedIndex) {
    committedIndex++;

    if (
      currentChar.textContent !== " " &&
      allChars[committedIndex] &&
      allChars[committedIndex].textContent === " "
    ) {
      currentWordIndex++;
    }
  }

  if (
    char === " " &&
    currentWordIndex > 0 &&
    ((firstScroll && currentWordIndex % 16 === 0) ||
      (!firstScroll && currentWordIndex % 8 === 0))
  ) {
    if (firstScroll) {
      firstScroll = false;
    }
    currentLineIndex++;
    lineContainer.style.transform = `translateY(-${currentLineIndex * 2.02}em)`;
  }

  currentChar.classList.remove("current");
  currentIndex++;
  if (allChars[currentIndex]) {
    allChars[currentIndex].classList.add("current");
  }
  totalTyped++;
}

document.addEventListener("keydown", handleKey);

Array.from(timerButtons).forEach((button) => {
  button.addEventListener("click", () => {
    timerButtons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
    timer = parseInt(button.getAttribute("data-time"));
  });
});

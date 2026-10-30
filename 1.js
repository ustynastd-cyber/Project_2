const dialog = document.querySelector("#game-dialog");
const gameContent = document.querySelector("#game-content");
const dialogTitle = document.querySelector("#dialog-title");
const closeDialog = document.querySelector(".close-dialog");
const gameCards = [...document.querySelectorAll(".game-card")];
const filterButtons = [...document.querySelectorAll(".filter-chip")];
const searchInput = document.querySelector("#game-search");
const emptyState = document.querySelector("#empty-state");

const gameTitles = {
  rps: "Камінь, ножиці, папір",
  guess: "Вгадай число",
  word: "Збери слово",
  riddle: "Загадка дня",
  memory: "Знайди пару",
  tictactoe: "Хрестики-нулики",
  math: "Математичний спринт",
  reaction: "Тест на реакцію",
  hangman: "Словесний детектив",
  higherlower: "Вища чи нижча?",
  chess: "Шахи",
  uno: "Кольорові карти",
};

const wordList = [
  { word: "веселка", hint: "Кольорова дуга після дощу" },
  { word: "планета", hint: "Земля — одна з них" },
  { word: "гарбуз", hint: "Помаранчевий овоч, головний на Геловін" },
  { word: "сонях", hint: "Квітка, що повертається до сонця" },
  { word: "олівець", hint: "Ним можна малювати й писати" },
  { word: "парасолька", hint: "Допомагає не змокнути під дощем" },
];

const riddles = [
  { question: "Що можна побачити із заплющеними очима?", answers: ["Сон", "Веселку", "Море"], correct: 0 },
  { question: "Що стає мокрішим, поки сушить?", answers: ["Рушник", "Пісок", "Сонце"], correct: 0 },
  { question: "Що має багато клавіш, але не відчиняє дверей?", answers: ["Піаніно", "Замок", "Телефон"], correct: 0 },
  { question: "Що завжди попереду, але його не видно?", answers: ["Майбутнє", "Ніс", "Тінь"], correct: 0 },
  { question: "Без рук, без ніг, а малює на вікні?", answers: ["Мороз", "Олівець", "Вітер"], correct: 0 },
];

let activeFilter = "all";
let mathTimer = null;
let gameTimeout = null;
let gameSession = 0;

function renderGame(game) {
  clearInterval(mathTimer);
  mathTimer = null;
  clearTimeout(gameTimeout);
  gameTimeout = null;
  gameSession += 1;
  dialogTitle.textContent = gameTitles[game];

  if (game === "rps") renderRps();
  if (game === "guess") renderGuess();
  if (game === "word") renderWord();
  if (game === "riddle") renderRiddle();
  if (game === "memory") renderMemory();
  if (game === "tictactoe") renderTicTacToe();
  if (game === "math") renderMath();
  if (game === "reaction") renderReaction();
  if (game === "hangman") renderHangman();
  if (game === "higherlower") renderHigherLower();
  if (game === "chess") renderChess();
  if (game === "uno") renderUno();

  dialog.showModal();
}

function renderRps() {
  const choices = [
    { id: "rock", icon: "✊", label: "Камінь" },
    { id: "scissors", icon: "✌️", label: "Ножиці" },
    { id: "paper", icon: "✋", label: "Папір" },
  ];
  gameContent.innerHTML = `
    <p class="game-instructions">Обирай свій знак — побачимо, хто сьогодні чемпіон!</p>
    <div class="choice-row">${choices.map(({ id, icon, label }) => `<button class="game-choice" type="button" data-choice="${id}" aria-label="${label}">${icon}<small>${label}</small></button>`).join("")}</div>
    <p class="game-message" aria-live="polite">Твій хід!</p>`;
  const result = gameContent.querySelector(".game-message");
  gameContent.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const player = button.dataset.choice;
      const computer = choices[Math.floor(Math.random() * choices.length)].id;
      const playerIcon = choices.find((item) => item.id === player).icon;
      const computerIcon = choices.find((item) => item.id === computer).icon;
      let outcome = "Нічия! Спробуй ще раз.";
      if (player !== computer) {
        outcome = (player === "rock" && computer === "scissors") ||
          (player === "scissors" && computer === "paper") ||
          (player === "paper" && computer === "rock")
          ? "Ти переміг! 🎉"
          : "Цього разу комп’ютер переміг. Ще раунд?";
      }
      result.textContent = `${playerIcon} Ти · ${computerIcon} Комп’ютер — ${outcome}`;
    });
  });
}

function renderGuess() {
  const answer = Math.floor(Math.random() * 100) + 1;
  let attempts = 0;
  gameContent.innerHTML = `
    <p class="game-instructions">Я загадав число від 1 до 100. Введи свій варіант і дізнайся, чи він близько!</p>
    <form class="input-row" id="guess-form">
      <input class="game-input" id="guess-input" type="number" min="1" max="100" placeholder="Наприклад, 42" aria-label="Твоє число" required />
      <button class="game-action" type="submit">Перевірити</button>
    </form>
    <p class="game-message" id="guess-message" aria-live="polite">Кількість спроб: 0</p>`;
  const form = gameContent.querySelector("#guess-form");
  const input = gameContent.querySelector("#guess-input");
  const message = gameContent.querySelector("#guess-message");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const guess = Number(input.value);
    if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
      message.textContent = "Введи ціле число від 1 до 100.";
      return;
    }
    attempts += 1;
    if (guess === answer) {
      message.textContent = `Так! Це було число ${answer}. Спроб: ${attempts} 🎉`;
      form.querySelector("button").disabled = true;
      input.disabled = true;
    } else {
      message.textContent = `Моє число ${guess > answer ? "менше" : "більше"}! Спроб: ${attempts}`;
      input.select();
    }
  });
}

function renderWord() {
  const item = wordList[Math.floor(Math.random() * wordList.length)];
  const letters = [...item.word];
  let scrambled = item.word;
  while (scrambled === item.word) {
    scrambled = [...letters].sort(() => Math.random() - 0.5).join("");
  }
  gameContent.innerHTML = `
    <p class="game-instructions">Склади слово з перемішаних літер. Підказка: ${item.hint.toLowerCase()}.</p>
    <div class="word-display" aria-label="Перемішані літери">${scrambled.toLocaleUpperCase("uk-UA")}</div>
    <form class="input-row" id="word-form">
      <input class="game-input" id="word-input" type="text" autocomplete="off" placeholder="Твоє слово" aria-label="Відгадане слово" required />
      <button class="game-action" type="submit">Відповісти</button>
    </form>
    <p class="game-message" id="word-message" aria-live="polite"></p>`;
  const form = gameContent.querySelector("#word-form");
  const input = gameContent.querySelector("#word-input");
  const message = gameContent.querySelector("#word-message");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (input.value.trim().toLocaleLowerCase("uk-UA") === item.word) {
      message.textContent = "Правильно! Чудово впорався 🎉";
      input.disabled = true;
      form.querySelector("button").disabled = true;
    } else {
      message.textContent = "Не зовсім. Спробуй ще раз!";
      input.select();
    }
  });
}

function renderRiddle() {
  const riddle = riddles[Math.floor(Math.random() * riddles.length)];
  gameContent.innerHTML = `
    <p class="game-instructions">${riddle.question}</p>
    <div class="answer-row">${riddle.answers.map((answer, index) => `<button class="answer-button" type="button" data-answer="${index}">${answer}</button>`).join("")}</div>
    <p class="game-message" aria-live="polite">Обирай відповідь!</p>`;
  const message = gameContent.querySelector(".game-message");
  gameContent.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const correct = Number(button.dataset.answer) === riddle.correct;
      message.textContent = correct ? "Так, правильно! Ти кмітливий 🎉" : `Не цього разу. Правильна відповідь: ${riddle.answers[riddle.correct]}.`;
      gameContent.querySelectorAll("[data-answer]").forEach((answerButton) => {
        answerButton.disabled = true;
      });
    });
  });
}

function renderMemory() {
  const symbols = ["🍋", "🐸", "🌈", "🍓", "🐸", "🍋", "🍓", "🌈"];
  const cards = symbols.map((symbol, index) => ({ symbol, index })).sort(() => Math.random() - 0.5);
  let open = [];
  let matched = 0;
  let moves = 0;
  let locked = false;
  gameContent.innerHTML = `
    <p class="game-instructions">Знайди всі чотири пари. Кількість ходів: <strong id="memory-moves">0</strong></p>
    <div class="memory-board">${cards.map((card, index) => `<button class="memory-card" type="button" data-card="${index}" aria-label="Відкрити картку ${index + 1}">?</button>`).join("")}</div>
    <p class="game-message" id="memory-message" aria-live="polite"></p>`;
  const buttons = [...gameContent.querySelectorAll(".memory-card")];
  const movesLabel = gameContent.querySelector("#memory-moves");
  const message = gameContent.querySelector("#memory-message");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.card);
      if (locked || button.classList.contains("is-matched") || open.includes(index)) return;
      button.textContent = cards[index].symbol;
      button.classList.add("is-open");
      open.push(index);
      if (open.length !== 2) return;
      moves += 1;
      movesLabel.textContent = String(moves);
      const [first, second] = open;
      if (cards[first].symbol === cards[second].symbol) {
        buttons[first].classList.add("is-matched");
        buttons[second].classList.add("is-matched");
        matched += 1;
        open = [];
        if (matched === 4) message.textContent = `Усі пари знайдені за ${moves} ходів! 🎉`;
      } else {
        locked = true;
        window.setTimeout(() => {
          buttons[first].textContent = "?";
          buttons[second].textContent = "?";
          buttons[first].classList.remove("is-open");
          buttons[second].classList.remove("is-open");
          open = [];
          locked = false;
        }, 700);
      }
    });
  });
}

function renderTicTacToe() {
  let board = Array(9).fill("");
  let finished = false;
  gameContent.innerHTML = `
    <p class="game-instructions" id="tic-message" aria-live="polite">Ти граєш за ✕. Зроби перший хід!</p>
    <div class="tic-board">${board.map((_, index) => `<button class="tic-cell" type="button" data-cell="${index}" aria-label="Клітинка ${index + 1}"></button>`).join("")}</div>
    <div class="restart-row"><button class="game-action" id="tic-restart" type="button">Нова гра</button></div>`;
  const message = gameContent.querySelector("#tic-message");
  const cells = [...gameContent.querySelectorAll(".tic-cell")];
  const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

  function winner() {
    for (const [a, b, c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return "";
  }

  function updateCell(index, mark) {
    board[index] = mark;
    cells[index].textContent = mark;
    cells[index].disabled = true;
  }

  function takeComputerTurn() {
    const available = board.map((value, index) => value ? -1 : index).filter((index) => index !== -1);
    if (!available.length) return;
    const move = available[Math.floor(Math.random() * available.length)];
    updateCell(move, "○");
    if (winner() === "○") {
      finished = true;
      message.textContent = "Комп’ютер виграв. Зіграємо ще?";
    } else if (board.every(Boolean)) {
      finished = true;
      message.textContent = "Нічия! Гарна гра.";
    }
  }

  cells.forEach((cell) => {
    cell.addEventListener("click", () => {
      const index = Number(cell.dataset.cell);
      if (finished || board[index]) return;
      updateCell(index, "✕");
      if (winner() === "✕") {
        finished = true;
        message.textContent = "Ти переміг! Красиво зіграв 🎉";
        return;
      }
      if (board.every(Boolean)) {
        finished = true;
        message.textContent = "Нічия! Гарна гра.";
        return;
      }
      message.textContent = "Хід комп’ютера…";
      window.setTimeout(() => {
        if (finished || !dialog.open) return;
        takeComputerTurn();
        if (!finished) message.textContent = "Твій хід — ✕!";
      }, 350);
    });
  });

  gameContent.querySelector("#tic-restart").addEventListener("click", renderTicTacToe);
}

function renderMath() {
  const session = gameSession;
  let seconds = 60;
  let score = 0;
  let currentAnswer = 0;
  let started = false;
  gameContent.innerHTML = `
    <p class="game-instructions">Розв’язуй приклади за 60 секунд — і подивимось, який буде результат!</p>
    <div class="math-timer" id="math-timer">Час: 60 с</div>
    <div class="math-problem" id="math-problem">Готовий?</div>
    <form class="input-row" id="math-form">
      <input class="game-input" id="math-input" type="number" inputmode="numeric" placeholder="Відповідь" aria-label="Відповідь на приклад" required disabled />
      <button class="game-action" id="math-start" type="button">Почати</button>
    </form>
    <div class="math-score" id="math-score">Правильних відповідей: 0</div>
    <p class="game-message" id="math-message" aria-live="polite"></p>`;
  const problem = gameContent.querySelector("#math-problem");
  const timer = gameContent.querySelector("#math-timer");
  const input = gameContent.querySelector("#math-input");
  const start = gameContent.querySelector("#math-start");
  const scoreLabel = gameContent.querySelector("#math-score");
  const message = gameContent.querySelector("#math-message");

  function nextProblem() {
    const first = Math.floor(Math.random() * 12) + 2;
    const second = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? "+" : "−";
    if (operation === "−" && second > first) {
      currentAnswer = second - first;
      problem.textContent = `${second} − ${first} = ?`;
    } else {
      currentAnswer = operation === "+" ? first + second : first - second;
      problem.textContent = `${first} ${operation} ${second} = ?`;
    }
  }

  function finish() {
    started = false;
    clearInterval(mathTimer);
    mathTimer = null;
    input.disabled = true;
    start.disabled = false;
    start.textContent = "Ще раз";
    problem.textContent = `${score} ${score === 1 ? "відповідь" : "відповідей"} правильно!`;
    message.textContent = "Час вийшов! Спробуй побити свій результат.";
  }

  gameContent.querySelector("#math-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!started || input.value === "") return;
    if (Number(input.value) === currentAnswer) {
      score += 1;
      scoreLabel.textContent = `Правильних відповідей: ${score}`;
      message.textContent = "Так! Наступний приклад ⏩";
    } else {
      message.textContent = "Трохи не так — наступний приклад!";
    }
    input.value = "";
    nextProblem();
    input.focus();
  });

  start.addEventListener("click", () => {
    if (started) return;
    started = true;
    seconds = 60;
    score = 0;
    input.disabled = false;
    start.disabled = true;
    start.textContent = "Граємо!";
    scoreLabel.textContent = "Правильних відповідей: 0";
    message.textContent = "";
    timer.textContent = "Час: 60 с";
    nextProblem();
    input.focus();
    mathTimer = window.setInterval(() => {
      if (session !== gameSession || !dialog.open) {
        clearInterval(mathTimer);
        mathTimer = null;
        return;
      }
      seconds -= 1;
      timer.textContent = `Час: ${seconds} с`;
      if (seconds <= 0) finish();
    }, 1000);
  });
}

function renderReaction() {
  let state = "ready";
  let startedAt = 0;
  gameContent.innerHTML = `
    <p class="game-instructions">Натисни кнопку, щоб почати. Коли вона стане зеленою — тисни якомога швидше!</p>
    <button class="reaction-pad" id="reaction-pad" type="button" aria-live="polite">Почати тест</button>
    <p class="game-message" id="reaction-message" aria-live="polite">Готовий перевірити свою реакцію?</p>`;
  const pad = gameContent.querySelector("#reaction-pad");
  const message = gameContent.querySelector("#reaction-message");

  pad.addEventListener("click", () => {
    if (state === "ready" || state === "too-soon" || state === "done") {
      state = "waiting";
      pad.classList.remove("is-go");
      pad.disabled = false;
      pad.textContent = "Чекай на зелений…";
      message.textContent = "Не натискай завчасно!";
      const session = gameSession;
      gameTimeout = window.setTimeout(() => {
        if (session !== gameSession || !dialog.open) return;
        state = "go";
        pad.classList.add("is-go");
        pad.textContent = "ТИСНИ!";
        message.textContent = "Зараз! Зараз!";
        startedAt = performance.now();
      }, 1500 + Math.random() * 3000);
    } else if (state === "waiting") {
      clearTimeout(gameTimeout);
      gameTimeout = null;
      state = "too-soon";
      pad.classList.remove("is-go");
      pad.textContent = "Занадто рано!";
      message.textContent = "Поспішив 🙂 Натисни кнопку, щоб спробувати ще раз.";
    } else if (state === "go") {
      state = "done";
      const elapsed = Math.round(performance.now() - startedAt);
      pad.classList.remove("is-go");
      pad.textContent = `${elapsed} мс · ще раз?`;
      message.textContent = elapsed < 250 ? "Вау, блискавична реакція! ⚡" : "Гарний результат! Спробуй ще раз і побий його.";
    }
  });
}

function renderHangman() {
  const words = [
    { word: "веселка", hint: "Кольорова дуга на небі" },
    { word: "морозиво", hint: "Улюблений літній десерт" },
    { word: "черепаха", hint: "Повільна тварина з панциром" },
    { word: "космос", hint: "Там літають ракети й супутники" },
    { word: "бджола", hint: "Комаха, яка збирає нектар" },
    { word: "кавун", hint: "Велика смугаста літня ягода" },
  ];
  const item = words[Math.floor(Math.random() * words.length)];
  const guessed = new Set();
  const alphabet = [..."абвгґдеєжзиіїйклмнопрстуфхцчшщьюя"];
  let mistakes = 0;
  let finished = false;
  gameContent.innerHTML = `
    <p class="game-instructions">Підказка: ${item.hint}. Знайди всі літери, поки маєш спроби!</p>
    <div class="hangman-word" id="hangman-word" aria-live="polite"></div>
    <p class="hangman-lives" id="hangman-lives">Помилки: 0 / 6</p>
    <div class="letter-grid">${alphabet.map((letter) => `<button class="letter-button" type="button" data-letter="${letter}">${letter.toLocaleUpperCase("uk-UA")}</button>`).join("")}</div>
    <p class="game-message" id="hangman-message" aria-live="polite">Обирай літеру!</p>`;
  const wordDisplay = gameContent.querySelector("#hangman-word");
  const lives = gameContent.querySelector("#hangman-lives");
  const message = gameContent.querySelector("#hangman-message");
  const letterButtons = [...gameContent.querySelectorAll(".letter-button")];

  function updateWord() {
    wordDisplay.textContent = [...item.word].map((letter) => guessed.has(letter) ? letter.toLocaleUpperCase("uk-UA") : "_").join(" ");
  }

  updateWord();
  letterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (finished) return;
      const letter = button.dataset.letter;
      button.disabled = true;
      guessed.add(letter);
      if (!item.word.includes(letter)) mistakes += 1;
      lives.textContent = `Помилки: ${mistakes} / 6`;
      updateWord();
      if ([...item.word].every((character) => guessed.has(character))) {
        finished = true;
        message.textContent = "Відгадано! Ти справжній словесний детектив 🎉";
      } else if (mistakes >= 6) {
        finished = true;
        wordDisplay.textContent = [...item.word].map((letter) => letter.toLocaleUpperCase("uk-UA")).join(" ");
        message.textContent = `Спроби закінчилися! Це було слово «${item.word}».`;
      }
      if (finished) letterButtons.forEach((letterButton) => { letterButton.disabled = true; });
    });
  });
}

function renderHigherLower() {
  const suits = ["♠", "♥", "♦", "♣"];
  let current = Math.floor(Math.random() * 13) + 2;
  let score = 0;
  let finished = false;
  gameContent.innerHTML = `
    <p class="game-instructions">Чи буде наступна карта вища, чи нижча? Туз — найстарша карта!</p>
    <div class="higher-score" id="higher-score">Вгадувань поспіль: 0</div>
    <div class="card-pair">
      <div class="playing-card" id="current-card"></div>
      <div class="playing-card card-hidden" id="next-card">?</div>
    </div>
    <div class="answer-row">
      <button class="answer-button" type="button" data-prediction="higher">⬆ Вище</button>
      <button class="answer-button" type="button" data-prediction="lower">⬇ Нижче</button>
    </div>
    <p class="game-message" id="higher-message" aria-live="polite">Вгадай наступну карту!</p>
    <div class="restart-row"><button class="game-action" id="higher-restart" type="button" hidden>Ще раз</button></div>`;
  const currentCard = gameContent.querySelector("#current-card");
  const nextCard = gameContent.querySelector("#next-card");
  const scoreLabel = gameContent.querySelector("#higher-score");
  const message = gameContent.querySelector("#higher-message");
  const choices = [...gameContent.querySelectorAll("[data-prediction]")];
  const restart = gameContent.querySelector("#higher-restart");

  function cardLabel(value) {
    const ranks = { 11: "J", 12: "Q", 13: "K", 14: "A" };
    return ranks[value] || String(value);
  }

  function showCard(element, value) {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    element.textContent = `${cardLabel(value)}${suit}`;
    element.classList.toggle("is-red", suit === "♥" || suit === "♦");
  }

  function endRound() {
    finished = true;
    choices.forEach((button) => { button.disabled = true; });
    restart.hidden = false;
  }

  showCard(currentCard, current);
  choices.forEach((button) => {
    button.addEventListener("click", () => {
      if (finished) return;
      let next = Math.floor(Math.random() * 13) + 2;
      while (next === current) next = Math.floor(Math.random() * 13) + 2;
      showCard(nextCard, next);
      nextCard.classList.remove("card-hidden");
      const correct = button.dataset.prediction === (next > current ? "higher" : "lower");
      if (correct) {
        score += 1;
        scoreLabel.textContent = `Вгадувань поспіль: ${score}`;
        message.textContent = "Так! Твій хід — вгадуй наступну 🎉";
        current = next;
        showCard(currentCard, current);
        nextCard.textContent = "?";
        nextCard.classList.add("card-hidden");
      } else {
        message.textContent = `Цього разу ні! Правильна відповідь — ${next > current ? "вище" : "нижче"}. Твій рахунок: ${score}.`;
        endRound();
      }
    });
  });
  restart.addEventListener("click", renderHigherLower);
}

function renderChess() {
  clearTimeout(gameTimeout);
  gameTimeout = null;
  const chessGlyphs = {
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
  };
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
  const board = [
    [..."rnbqkbnr"],
    [..."pppppppp"],
    ...Array.from({ length: 4 }, () => Array(8).fill("")),
    [..."PPPPPPPP"],
    [..."RNBQKBNR"],
  ];
  let turn = "w";
  let selected = -1;
  let legalMoves = [];
  let rights = { K: true, Q: true, k: true, q: true };
  let enPassant = -1;
  let finished = false;
  const session = gameSession;
  gameContent.innerHTML = `
    <p class="game-instructions" id="chess-status" aria-live="polite">Ти граєш білими. Обери фігуру, а потім клітинку для ходу.</p>
    <div class="chess-board" id="chess-board" role="grid" aria-label="Шахова дошка"></div>
    <div class="restart-row"><button class="game-action" id="chess-restart" type="button">Нова партія</button></div>`;
  const boardElement = gameContent.querySelector("#chess-board");
  const status = gameContent.querySelector("#chess-status");
  const files = "abcdefgh";

  function color(piece) {
    if (!piece) return "";
    return piece === piece.toUpperCase() ? "w" : "b";
  }

  function isAttacked(position, square, by) {
    const row = Math.floor(square / 8);
    const col = square % 8;
    const pawnRow = row + (by === "w" ? 1 : -1);
    for (const pawnCol of [col - 1, col + 1]) {
      if (pawnRow >= 0 && pawnRow < 8 && pawnCol >= 0 && pawnCol < 8) {
        const pawn = position[pawnRow][pawnCol];
        if (pawn && color(pawn) === by && pawn.toLowerCase() === "p") return true;
      }
    }
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const piece = position[r][c];
        if (piece && color(piece) === by && piece.toLowerCase() === "n") return true;
      }
    }
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
      let r = row + dr;
      let c = col + dc;
      let distance = 1;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const piece = position[r][c];
        if (piece) {
          if (color(piece) === by) {
            const type = piece.toLowerCase();
            if (distance === 1 && type === "k") return true;
            if (dr !== 0 && dc !== 0 && (type === "b" || type === "q")) return true;
            if ((dr === 0 || dc === 0) && (type === "r" || type === "q")) return true;
          }
          break;
        }
        distance += 1;
        r += dr;
        c += dc;
      }
    }
    return false;
  }

  function inCheck(position, side) {
    const king = side === "w" ? "K" : "k";
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        if (position[row][col] === king) return isAttacked(position, row * 8 + col, side === "w" ? "b" : "w");
      }
    }
    return true;
  }

  function applyMove(position, currentRights, currentEnPassant, move) {
    const next = position.map((row) => row.slice());
    const moving = next[Math.floor(move.from / 8)][move.from % 8];
    const fromRow = Math.floor(move.from / 8);
    const fromCol = move.from % 8;
    const toRow = Math.floor(move.to / 8);
    const toCol = move.to % 8;
    let captured = next[toRow][toCol];
    const nextRights = { ...currentRights };
    if (moving.toLowerCase() === "k") {
      if (color(moving) === "w") {
        nextRights.K = false;
        nextRights.Q = false;
      } else {
        nextRights.k = false;
        nextRights.q = false;
      }
    }
    if (moving.toLowerCase() === "r") {
      if (move.from === 56) nextRights.Q = false;
      if (move.from === 63) nextRights.K = false;
      if (move.from === 0) nextRights.q = false;
      if (move.from === 7) nextRights.k = false;
    }
    if (captured.toLowerCase() === "r") {
      if (move.to === 56) nextRights.Q = false;
      if (move.to === 63) nextRights.K = false;
      if (move.to === 0) nextRights.q = false;
      if (move.to === 7) nextRights.k = false;
    }
    if (moving.toLowerCase() === "p" && move.to === currentEnPassant && fromCol !== toCol) {
      const captureRow = toRow + (color(moving) === "w" ? 1 : -1);
      captured = next[captureRow][toCol];
      next[captureRow][toCol] = "";
    }
    next[fromRow][fromCol] = "";
    next[toRow][toCol] = move.promotion || moving;
    if (moving.toLowerCase() === "k" && Math.abs(toCol - fromCol) === 2) {
      const rookFrom = toCol > fromCol ? fromRow * 8 + 7 : fromRow * 8;
      const rookTo = toCol > fromCol ? fromRow * 8 + 5 : fromRow * 8 + 3;
      next[fromRow][rookTo % 8] = next[fromRow][rookFrom % 8];
      next[fromRow][rookFrom % 8] = "";
    }
    const nextTarget = moving.toLowerCase() === "p" && Math.abs(toRow - fromRow) === 2
      ? ((fromRow + toRow) / 2) * 8 + fromCol
      : -1;
    return { board: next, rights: nextRights, enPassant: nextTarget, captured };
  }

  function pseudoMoves(position, side, currentRights, currentEnPassant) {
    const moves = [];
    const add = (from, to, promotion) => moves.push({ from, to, promotion });
    const stepMoves = (row, col, piece, directions, sliding) => {
      for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
          const target = position[r][c];
          if (!target) add(row * 8 + col, r * 8 + c);
          else {
            if (color(target) !== side && target.toLowerCase() !== "k") add(row * 8 + col, r * 8 + c);
            break;
          }
          if (!sliding) break;
          r += dr;
          c += dc;
        }
      }
    };
    const knightDirections = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    const kingDirections = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const piece = position[row][col];
        if (!piece || color(piece) !== side) continue;
        const from = row * 8 + col;
        const type = piece.toLowerCase();
        if (type === "p") {
          const direction = side === "w" ? -1 : 1;
          const startRow = side === "w" ? 6 : 1;
          const promotionRow = side === "w" ? 0 : 7;
          const oneRow = row + direction;
          if (oneRow >= 0 && oneRow < 8 && !position[oneRow][col]) {
            add(from, oneRow * 8 + col, oneRow === promotionRow ? (side === "w" ? "Q" : "q") : undefined);
            const twoRow = row + direction * 2;
            if (row === startRow && !position[twoRow][col]) add(from, twoRow * 8 + col);
          }
          for (const dc of [-1, 1]) {
            const r = row + direction;
            const c = col + dc;
            if (r < 0 || r >= 8 || c < 0 || c >= 8) continue;
            const target = position[r][c];
            const to = r * 8 + c;
            if ((target && color(target) !== side && target.toLowerCase() !== "k") || to === currentEnPassant) {
              add(from, to, r === promotionRow ? (side === "w" ? "Q" : "q") : undefined);
            }
          }
        } else if (type === "n") {
          stepMoves(row, col, piece, knightDirections, false);
        } else if (type === "b") {
          stepMoves(row, col, piece, kingDirections.slice(0, 1).concat([[-1, 1], [1, -1], [1, 1]]), true);
        } else if (type === "r") {
          stepMoves(row, col, piece, [[-1, 0], [1, 0], [0, -1], [0, 1]], true);
        } else if (type === "q") {
          stepMoves(row, col, piece, kingDirections, true);
        } else if (type === "k") {
          stepMoves(row, col, piece, kingDirections, false);
          const homeRow = side === "w" ? 7 : 0;
          const kingRight = side === "w" ? "K" : "k";
          const queenRight = side === "w" ? "Q" : "q";
          const enemy = side === "w" ? "b" : "w";
          if (row === homeRow && col === 4 && !inCheck(position, side)) {
            if (currentRights[kingRight] && position[homeRow][7] === (side === "w" ? "R" : "r") &&
                !position[homeRow][5] && !position[homeRow][6] &&
                !isAttacked(position, homeRow * 8 + 5, enemy) && !isAttacked(position, homeRow * 8 + 6, enemy)) {
              add(from, homeRow * 8 + 6);
            }
            if (currentRights[queenRight] && position[homeRow][0] === (side === "w" ? "R" : "r") &&
                !position[homeRow][1] && !position[homeRow][2] && !position[homeRow][3] &&
                !isAttacked(position, homeRow * 8 + 3, enemy) && !isAttacked(position, homeRow * 8 + 2, enemy)) {
              add(from, homeRow * 8 + 2);
            }
          }
        }
      }
    }
    return moves;
  }

  function validMoves(position, side, currentRights, currentEnPassant) {
    return pseudoMoves(position, side, currentRights, currentEnPassant).filter((move) => {
      const result = applyMove(position, currentRights, currentEnPassant, move);
      return !inCheck(result.board, side);
    });
  }

  function renderBoard() {
    const destinations = new Set(legalMoves.map((move) => move.to));
    boardElement.innerHTML = board.flatMap((row, rowIndex) => row.map((piece, colIndex) => {
      const square = rowIndex * 8 + colIndex;
      const classes = ["chess-square", (rowIndex + colIndex) % 2 ? "is-dark" : "is-light"];
      if (square === selected) classes.push("is-selected");
      if (destinations.has(square)) classes.push(piece ? "is-capture" : "is-legal");
      const name = `${files[colIndex]}${8 - rowIndex}`;
      return `<button class="${classes.join(" ")}" type="button" role="gridcell" data-square="${square}" aria-label="${piece ? `${piece === piece.toUpperCase() ? "Біла" : "Чорна"} фігура ${name}` : `Порожня клітинка ${name}`}">${piece ? `<span class="chess-piece ${color(piece) === "w" ? "white-piece" : "black-piece"}">${chessGlyphs[piece]}</span>` : ""}</button>`;
    })).join("");
    boardElement.querySelectorAll("[data-square]").forEach((button) => {
      button.addEventListener("click", () => selectSquare(Number(button.dataset.square)));
    });
  }

  function updateStatus() {
    if (finished) return;
    const moves = validMoves(board, turn, rights, enPassant);
    if (!moves.length) {
      finished = true;
      status.textContent = inCheck(board, turn)
        ? (turn === "w" ? "Мат! Комп’ютер переміг." : "Шах і мат! Ти переміг 🎉")
        : "Пат! Нічия.";
      renderBoard();
      return;
    }
    const checked = inCheck(board, turn) ? " Шах!" : "";
    status.textContent = turn === "w" ? `Твій хід — білі.${checked}` : `Хід комп’ютера — чорні.${checked}`;
    if (turn === "b") {
      const token = session;
      gameTimeout = window.setTimeout(() => {
        if (!dialog.open || token !== gameSession || finished) return;
        const candidates = validMoves(board, "b", rights, enPassant);
        if (!candidates.length) return;
        const ranked = candidates.map((move) => {
          const result = applyMove(board, rights, enPassant, move);
          const capturedValue = result.captured ? values[result.captured.toLowerCase()] : 0;
          const givesCheck = inCheck(result.board, "w") ? 1.5 : 0;
          return { move, score: capturedValue + givesCheck + Math.random() * 2 };
        }).sort((a, b) => b.score - a.score);
        makeMove(ranked[0].move);
      }, 450);
    }
  }

  function makeMove(move) {
    const result = applyMove(board, rights, enPassant, move);
    for (let row = 0; row < 8; row += 1) board[row] = result.board[row];
    rights = result.rights;
    enPassant = result.enPassant;
    turn = turn === "w" ? "b" : "w";
    selected = -1;
    legalMoves = [];
    renderBoard();
    updateStatus();
  }

  function selectSquare(square) {
    if (finished || turn !== "w") return;
    const move = legalMoves.find((candidate) => candidate.to === square);
    if (move) {
      makeMove(move);
      return;
    }
    const row = Math.floor(square / 8);
    const piece = board[row][square % 8];
    if (piece && color(piece) === "w") {
      selected = square;
      legalMoves = validMoves(board, "w", rights, enPassant).filter((candidate) => candidate.from === square);
    } else {
      selected = -1;
      legalMoves = [];
    }
    renderBoard();
  }

  gameContent.querySelector("#chess-restart").addEventListener("click", renderChess);
  renderBoard();
  updateStatus();
}

function renderUno() {
  clearTimeout(gameTimeout);
  gameTimeout = null;
  const colors = ["red", "blue", "green", "yellow"];
  const colorNames = { red: "червона", blue: "синя", green: "зелена", yellow: "жовта" };
  const colorIcons = { red: "🔴", blue: "🔵", green: "🟢", yellow: "🟡" };
  const playerNames = ["Ти", "Лис", "Панда", "Кіт"];
  let deck = [];
  let discard = [];
  let hands = [[], [], [], []];
  let currentPlayer = 0;
  let direction = 1;
  let activeColor = "red";
  let hasDrawn = false;
  let pendingWild = null;
  let finished = false;
  const session = gameSession;

  function makeDeck() {
    const cards = [];
    colors.forEach((cardColor) => {
      cards.push({ color: cardColor, value: "0" });
      for (let number = 1; number <= 9; number += 1) {
        cards.push({ color: cardColor, value: String(number) });
        cards.push({ color: cardColor, value: String(number) });
      }
      ["skip", "reverse", "draw2"].forEach((value) => {
        cards.push({ color: cardColor, value });
        cards.push({ color: cardColor, value });
      });
    });
    for (let index = 0; index < 4; index += 1) {
      cards.push({ color: "wild", value: "wild" });
      cards.push({ color: "wild", value: "draw4" });
    }
    return cards.sort(() => Math.random() - 0.5);
  }

  function drawCard(player) {
    if (!deck.length && discard.length > 1) {
      const top = discard.pop();
      deck = discard.splice(0).sort(() => Math.random() - 0.5);
      discard = [top];
    }
    if (deck.length) hands[player].push(deck.pop());
  }

  deck = makeDeck();
  for (let player = 0; player < 4; player += 1) {
    for (let card = 0; card < 7; card += 1) drawCard(player);
  }
  let startingCardIndex = deck.findIndex((card) => card.color !== "wild");
  if (startingCardIndex < 0) startingCardIndex = 0;
  const firstCard = deck.splice(startingCardIndex, 1)[0];
  discard.push(firstCard);
  activeColor = firstCard.color;

  function cardLabel(card) {
    return { skip: "🚫", reverse: "⇄", draw2: "+2", wild: "🌈", draw4: "+4" }[card.value] || card.value;
  }

  function cardClass(card) {
    return card.color === "wild" ? "uno-wild" : `uno-${card.color}`;
  }

  function canPlay(card) {
    const top = discard[discard.length - 1];
    return card.color === "wild" || card.color === activeColor || card.value === top.value;
  }

  function render() {
    const top = discard[discard.length - 1];
    const counts = hands.slice(1).map((hand, index) => `<span class="uno-player-count">${playerNames[index + 1]} <b>${hand.length}</b></span>`).join("");
    const handHtml = hands[0].map((card, index) => {
      const disabled = finished || pendingWild || (currentPlayer !== 0) || !canPlay(card);
      return `<button class="uno-card ${cardClass(card)}" type="button" data-hand-card="${index}" aria-label="${colorNames[card.color] || "будь-якого кольору"} карта ${cardLabel(card)}"${disabled ? " disabled" : ""}>${cardLabel(card)}</button>`;
    }).join("");
    const colorPicker = pendingWild
      ? `<div class="uno-color-picker"><span>Обери колір:</span>${colors.map((cardColor) => `<button class="uno-color-choice uno-${cardColor}" type="button" data-wild-color="${cardColor}" aria-label="${colorNames[cardColor]}">${colorIcons[cardColor]}</button>`).join("")}</div>`
      : "";
    gameContent.innerHTML = `
      <p class="game-instructions">Скидай карти того ж кольору або знака. Спеціальні карти пропускають хід чи змушують брати карти. Перший, хто позбудеться всіх карт, виграє!</p>
      <p class="game-message" id="uno-status" aria-live="polite"></p>
      <div class="uno-opponents">${counts}</div>
      <div class="uno-table">
        <div class="uno-active-color">${colorIcons[activeColor]} <span>активний колір</span></div>
        <div class="uno-discard ${cardClass(top)}">${cardLabel(top)}</div>
        <div class="uno-deck-count">У колоді: ${deck.length}</div>
      </div>
      <div class="uno-hand-label">Твої карти <span>${hands[0].length}</span></div>
      <div class="uno-hand">${handHtml}</div>
      ${colorPicker}
      <div class="uno-actions">
        <button class="game-action" id="uno-draw" type="button"${finished || currentPlayer !== 0 || hasDrawn || hands[0].some(canPlay) ? " disabled" : ""}>Взяти карту</button>
        <button class="answer-button" id="uno-pass" type="button"${finished || currentPlayer !== 0 || !hasDrawn || pendingWild ? " hidden" : ""}>Пропустити хід</button>
        <button class="answer-button" id="uno-restart" type="button">Нова гра</button>
      </div>`;
    const status = gameContent.querySelector("#uno-status");
    if (finished) status.textContent = `${playerNames[currentPlayer]} виграв${currentPlayer === 0 ? "!" : ". Спробуй ще раз!"}`;
    else if (pendingWild) status.textContent = "Обери колір карти.";
    else if (currentPlayer === 0) status.textContent = hasDrawn ? "Ти взяв карту. Зіграй її або пропусти хід." : `Твій хід! Виклади карту ${colorNames[activeColor]} або з відповідним знаком.`;
    else status.textContent = `Хід гравця ${playerNames[currentPlayer]}…`;

    gameContent.querySelectorAll("[data-hand-card]").forEach((button) => {
      button.addEventListener("click", () => playHumanCard(Number(button.dataset.handCard)));
    });
    const drawButton = gameContent.querySelector("#uno-draw");
    drawButton.addEventListener("click", drawForHuman);
    const passButton = gameContent.querySelector("#uno-pass");
    passButton.addEventListener("click", () => advanceTurn());
    gameContent.querySelector("#uno-restart").addEventListener("click", renderUno);
    gameContent.querySelectorAll("[data-wild-color]").forEach((button) => {
      button.addEventListener("click", () => {
        activeColor = button.dataset.wildColor;
        pendingWild = null;
        finishPlayedCard(0);
      });
    });
  }

  function nextIndex(from, steps = 1) {
    return (from + direction * steps + 4 * steps) % 4;
  }

  function advanceTurn(skip = false, drawCount = 0) {
    if (finished) return;
    let next = nextIndex(currentPlayer);
    if (drawCount) {
      for (let count = 0; count < drawCount; count += 1) drawCard(next);
      skip = true;
    }
    currentPlayer = skip ? nextIndex(next) : next;
    hasDrawn = false;
    startTurn();
  }

  function finishPlayedCard(player) {
    if (hands[player].length === 0) {
      currentPlayer = player;
      finished = true;
      render();
      return;
    }
    const card = discard[discard.length - 1];
    let skip = card.value === "skip";
    if (card.value === "reverse") {
      direction *= -1;
      if (hands.length === 2) skip = true;
    }
    const drawCount = card.value === "draw2" ? 2 : card.value === "draw4" ? 4 : 0;
    advanceTurn(skip, drawCount);
  }

  function playCard(player, index, chosenColor) {
    const card = hands[player][index];
    if (!card || (card.color !== "wild" && !canPlay(card))) return;
    hands[player].splice(index, 1);
    discard.push(card);
    activeColor = chosenColor || card.color;
    if (card.color === "wild" && player === 0 && !chosenColor) {
      pendingWild = card;
      render();
      return;
    }
    finishPlayedCard(player);
  }

  function playHumanCard(index) {
    if (currentPlayer !== 0 || pendingWild || finished) return;
    playCard(0, index);
  }

  function drawForHuman() {
    if (currentPlayer !== 0 || hasDrawn || finished || hands[0].some(canPlay)) return;
    drawCard(0);
    hasDrawn = true;
    render();
  }

  function startTurn() {
    if (finished) return;
    render();
    if (currentPlayer === 0) return;
    const token = session;
    gameTimeout = window.setTimeout(() => {
      if (token !== gameSession || !dialog.open || finished) return;
      const hand = hands[currentPlayer];
      const playableIndex = hand.findIndex(canPlay);
      if (playableIndex >= 0) {
        const card = hand[playableIndex];
        const chosenColor = card.color === "wild"
          ? colors.slice().sort((a, b) => hand.filter((item) => item.color === b).length - hand.filter((item) => item.color === a).length)[0]
          : undefined;
        playCard(currentPlayer, playableIndex, chosenColor);
      } else {
        drawCard(currentPlayer);
        const drawnIndex = hand.length - 1;
        if (hand[drawnIndex] && canPlay(hand[drawnIndex])) {
          const card = hand[drawnIndex];
          const chosenColor = card.color === "wild"
            ? colors[Math.floor(Math.random() * colors.length)]
            : undefined;
          playCard(currentPlayer, drawnIndex, chosenColor);
        } else {
          advanceTurn();
        }
      }
    }, 750);
  }

  render();
}

function updateVisibleGames() {
  const query = searchInput.value.trim().toLocaleLowerCase("uk-UA");
  let visibleCount = 0;
  gameCards.forEach((card) => {
    const matchesFilter = activeFilter === "all" || card.dataset.categories.split(" ").includes(activeFilter);
    const matchesSearch = !query || card.dataset.search.includes(query) || card.querySelector("h3").textContent.toLocaleLowerCase("uk-UA").includes(query);
    const isVisible = matchesFilter && matchesSearch;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });
  emptyState.hidden = visibleCount > 0;
}

document.querySelector("#game-grid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-game]");
  if (button) renderGame(button.dataset.openGame);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filter) => filter.classList.toggle("is-active", filter === button));
    updateVisibleGames();
  });
});

searchInput.addEventListener("input", updateVisibleGames);
closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => {
  clearInterval(mathTimer);
  mathTimer = null;
  clearTimeout(gameTimeout);
  gameTimeout = null;
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
    document.querySelector("#games").scrollIntoView({ behavior: "smooth" });
  }
});

updateVisibleGames();
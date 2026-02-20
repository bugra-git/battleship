import { Game } from "./gameplay.js";

class UI {
  constructor() {
    this.cellSize = 48;
    this.game = new Game();
    this.gameStarted = false;
    this.cacheDOM();
    this.generateGrid();
    this.initShipRender();
    this.bindEvents();
  }

  cacheDOM() {
    this.playerBoard = document.querySelector(".player-board");
    this.compBoard = document.querySelector(".opponent-board");
    this.buttons = document.querySelector(".buttons");
    this.playerHeader = document.querySelector(".playerHeader");
    this.compHeader = document.querySelector(".compHeader");
  }

  generateGrid() {
    const boards = [this.playerBoard, this.compBoard];
    boards.forEach((board) => {
      for (let r = -1; r < 10; r++) {
        for (let c = -1; c < 10; c++) {
          const cell = document.createElement("div");

          if (r === -1 && c === -1) {
          } else if (r === -1) {
            cell.textContent = String.fromCharCode(65 + c); // A–J
            cell.classList.add("label");
          } else if (c === -1) {
            cell.textContent = r + 1; // 1–10
            cell.classList.add("label");
          } else {
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;
          }

          board.appendChild(cell);
        }
      }
    });
  }

  renderShip(ship) {
    for (let i = 0; i < ship.ship.length; i++) {
      const r =
        ship.alignment === "vertical" ? ship.coords[0] + i : ship.coords[0];
      const c =
        ship.alignment === "horizontal" ? ship.coords[1] + i : ship.coords[1];

      const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);

      if (cell) {
        cell.classList.add("hasShip");
        cell.dataset.ship = ship.title;
      }
    }
  }

  initShipRender() {
    this.game.humanShips.forEach((s) => this.renderShip(s));
  }

  bindEvents() {
    this.buttons.addEventListener("click", (e) => {
      if (e.target.id === "play") {
        this.startGame();
      } else if (e.target.id === "reset") {
        this.resetGame();
      }
    });

    this.compBoard.addEventListener("click", (e) => {
      const cell = e.target.closest(".cell");
      if (!cell || !this.gameStarted) return;

      this.handlePlayerMove(cell);
    });

    this.playerBoard.addEventListener("click", (e) => {
      this.rotateShip(e.target);
    });
  }

  startGame() {
    this.gameStarted = true;
    this.playerHeader.textContent = "Your board";
    this.compHeader.textContent = "Opponent's board";
    this.buttons.innerHTML = `<button id="reset">Reset</button>`;
  }

  handlePlayerMove(cell) {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    const result = this.game.playRound([row, col]);
    if (!result) return;

    this.compHeader.textContent = "Opponent's board";

    if (result.attack === "hit") {
      cell.classList.add("hit");
      if (result.sunk) {
        this.compHeader.textContent = "You sunk a ship!";
      }
    } else if (result.attack === "miss") {
      cell.classList.add("miss");
    }

    if (result.compAttack) {
      const { row, col, compResult } = result.compAttack;
      const computerTarget = document.querySelector(
        `.player-board [data-row="${row}"][data-col="${col}"]`,
      );

      if (compResult === "hit") {
        computerTarget.classList.add("hit");
      } else if (compResult === "miss") {
        computerTarget.classList.add("miss");
      }
    }

    if (result.winner) {
      this.playerHeader.textContent =
        result.winner === "player" ? "You win!" : "You lost!";
      this.compHeader.textContent =
        result.winner === "computer" ? "Computer wins!" : "Computer lost!";
    }
  }

  resetGame() {
    this.gameStarted = false;
    this.game = new Game();
    this.playerHeader.textContent = "Drag and drop to move, click to rotate";
    this.compHeader.textContent = "Opponent's board";
    this.buttons.innerHTML = `<button id="play">Play</button>`;

    [this.playerBoard, this.compBoard].forEach((board) => {
      board.querySelectorAll(".cell").forEach((cell) => {
        cell.className = "cell";
      });
    });

    this.initShipRender();
  }

  rotateShip(target) {
    if (this.gameStarted) return;

    const cell = target.closest(".hasShip");
    if (!cell) return;

    const shipTitle = cell.dataset.ship;

    const shipObj = this.game.humanShips.find((s) => s.title === shipTitle);

    const newAlignment =
      shipObj.alignment === "vertical" ? "horizontal" : "vertical";

    const success = this.game.positionShip(
      shipObj.title,
      shipObj.coords,
      newAlignment,
    );

    if (success) {
      const formerCells = document.querySelectorAll(
        `.player-board [data-ship="${shipObj.title}"]`,
      );
      formerCells.forEach((c) => {
        c.classList.remove("hasShip");
        delete c.dataset.ship;
      });

      this.renderShip(shipObj);
    }
  }
}

export { UI };

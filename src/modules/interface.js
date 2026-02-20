import { Game } from "./gameplay.js";

class UI {
  constructor() {
    this.cellSize = 48;
    this.game = new Game();
    this.gameStarted = false;
    this.draggedShip = null;
    this.dragOffset = 0;
    this.previewCells = [];
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
        cell.setAttribute("draggable", true);
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

    this.playerBoard.addEventListener("dragstart", (e) => {
      this.startDrag(e.target, e);
    });

    this.playerBoard.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (this.gameStarted) return;
      if (!this.draggedShip) return;

      const cell = e.target.closest(".cell");
      if (!cell) return;

      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);

      this.showPreview(row, col);
    });

    this.playerBoard.addEventListener("drop", (e) => {
      this.drop(e.target);
    });

    this.playerBoard.addEventListener("dragend", () => {
      this.clearPreview();
      this.draggedShip = null;
      this.dragOffset = 0;
    });
  }

  startGame() {
    this.gameStarted = true;
    this.playerHeader.textContent = "Your board";
    this.compHeader.textContent = "Opponent's board";
    this.buttons.innerHTML = `<button id="reset">Reset</button>`;

    this.game.humanShips.forEach((s) => {
      for (let i = 0; i < s.ship.length; i++) {
        const r = s.alignment === "vertical" ? s.coords[0] + i : s.coords[0];
        const c = s.alignment === "horizontal" ? s.coords[1] + i : s.coords[1];

        const cell = document.querySelector(
          `[data-row="${r}"][data-col="${c}"]`,
        );

        if (cell) {
          cell.removeAttribute("draggable");
        }
      }
    });
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
    } else {
      this.playerHeader.textContent = "Invalid rotation, try again!";

      setTimeout(() => {
        this.playerHeader.textContent = "Drag and drop to move, click to rotate";
      }, 2000);
    }
  }

  startDrag(target, event) {
    if (this.gameStarted) return;

    const cell = target.closest(".hasShip");
    if (!cell) return;

    event.dataTransfer.setDragImage(new Image(), 0, 0);

    const shipTitle = cell.dataset.ship;
    const shipObj = this.game.humanShips.find((s) => s.title === shipTitle);

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    this.draggedShip = shipTitle;

    if (shipObj.alignment === "vertical") {
      this.dragOffset = row - shipObj.coords[0];
    } else {
      this.dragOffset = col - shipObj.coords[1];
    }
  }

  drop(target) {
    if (this.gameStarted) return;
    if (!this.draggedShip) return;

    const cell = target.closest(".cell");
    if (!cell) return;

    const dropRow = Number(cell.dataset.row);
    const dropCol = Number(cell.dataset.col);

    const shipObj = this.game.humanShips.find(
      (s) => s.title === this.draggedShip,
    );

    let startRow = dropRow;
    let startCol = dropCol;

    if (shipObj.alignment === "vertical") {
      startRow = dropRow - this.dragOffset;
    } else {
      startCol = dropCol - this.dragOffset;
    }

    const success = this.game.positionShip(
      shipObj.title,
      [startRow, startCol],
      shipObj.alignment,
    );

    if (success) {
      const formerCells = document.querySelectorAll(
        `.player-board [data-ship="${shipObj.title}"]`,
      );

      formerCells.forEach((c) => {
        c.classList.remove("hasShip");
        c.removeAttribute("data-ship");
        c.removeAttribute("draggable");
      });
      this.renderShip(shipObj);
    } else {
      this.playerHeader.textContent = "Invalid position, try again!";

      setTimeout(() => {
        this.playerHeader.textContent = "Drag and drop to move, click to rotate";
      }, 2000);
    }

    this.draggedShip = null;
    this.dragOffset = 0;

    this.clearPreview();
  }

  clearPreview() {
    this.previewCells.forEach((cell) => {
      cell.classList.remove("preview");
    });
    this.previewCells = [];
  }

  showPreview(dropRow, dropCol) {
    this.clearPreview();

    const shipObj = this.game.humanShips.find(
      (s) => s.title === this.draggedShip,
    );
    if (!shipObj) return;

    let startRow = dropRow;
    let startCol = dropCol;

    if (shipObj.alignment === "vertical") {
      startRow = dropRow - this.dragOffset;
    } else {
      startCol = dropCol - this.dragOffset;
    }

    const coords = [];

    for (let i = 0; i < shipObj.ship.length; i++) {
      const r = shipObj.alignment === "vertical" ? startRow + i : startRow;

      const c = shipObj.alignment === "horizontal" ? startCol + i : startCol;

      coords.push([r, c]);
    }

    coords.forEach(([r, c]) => {
      const cell = document.querySelector(
        `.player-board [data-row="${r}"][data-col="${c}"]`,
      );

      if (cell) {
        cell.classList.add("preview");
        this.previewCells.push(cell);
      }
    });
  }
}

export { UI };

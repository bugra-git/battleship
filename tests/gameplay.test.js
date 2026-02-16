import { Game } from "../src/modules/gameplay.js";

test("human ships can be placed on board", () => {
  const game = new Game();
  game.initHumanShips();
  expect(game.human.board.ships.length).toBe(5);
  expect(game.human.board.grid[0][0].ship).toBe(game.human.board.ships[0]);
  expect(game.human.board.grid[7][6].ship).toBe(game.human.board.ships[1]);
  expect(game.human.board.grid[0][5].ship).toBe(game.human.board.ships[2]);
  expect(game.human.board.grid[4][4].ship).toBe(game.human.board.ships[3]);
  expect(game.human.board.grid[8][2].ship).toBe(game.human.board.ships[4]);
});

test("computer ships can be placed on board randomly", () => {
  const game = new Game();
  game.placeComShips();
  expect(game.comp.board.ships.length).toBe(5);
})
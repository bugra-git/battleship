import { Ship, Gameboard } from "../modules/gameLogic";

test("ship is vertically placed", () => {
  const ship = new Ship(3);
  const board = new Gameboard();

  board.placeShip(ship, [4, 3], "vertical");

  expect(board.grid[4][3]).toBe(ship);
  expect(board.grid[5][3]).toBe(ship);
  expect(board.grid[6][3]).toBe(ship);
});

test("ship is horizontally placed", () => {
  const ship = new Ship(3);
  const board = new Gameboard();

  board.placeShip(ship, [4, 3], "horizontal");

  expect(board.grid[4][3]).toBe(ship);
  expect(board.grid[4][4]).toBe(ship);
  expect(board.grid[4][5]).toBe(ship);
});

test("ship cant be placed in occupied squares", () => {
  const board = new Gameboard();

  const firstShip = new Ship(4);
  board.placeShip(firstShip, [3, 4], "vertical");

  const secondShip = new Ship(3);
  const result = board.placeShip(secondShip, [3, 2], "horizontal");

  expect(board.grid[3][4]).toBe(firstShip);
  expect(result).toBe(false);
});

test("ship cant be placed adjacent to other ships", () => {
  const board = new Gameboard();

  const firstShip = new Ship(4);
  board.placeShip(firstShip, [3, 4], "vertical");

  const secondShip = new Ship(3);
  const result1 = board.placeShip(secondShip, [1, 3], "vertical");

  const thirdShip = new Ship(5);
  const result2 = board.placeShip(thirdShip, [7, 1], "horizontal");

  const fourthShip = new Ship(3);
  const result3 = board.placeShip(fourthShip, [4, 6], "vertical");

  expect(result1).toBe(false);
  expect(result2).toBe(false);
  expect(result3).toBe(true);
});

test("ship cant start outside of grid", () => {
  const board = new Gameboard();
  const ship = new Ship(4);
  const result = board.placeShip(ship, [-3, 4], "vertical");

  expect(result).toBe(false);
});

test("ship cant overflow vertically", () => {
  const board = new Gameboard();
  const ship = new Ship(4);
  const result = board.placeShip(ship, [7, 4], "vertical");

  expect(result).toBe(false);
});

test("ship cant overflow horizontally", () => {
  const board = new Gameboard();
  const ship = new Ship(3);
  const result = board.placeShip(ship, [3, 8], "horizontal");

  expect(result).toBe(false);
});

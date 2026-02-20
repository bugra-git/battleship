import { Ship, Gameboard, Player } from "../src/modules/gameLogic";

test("ship is vertically placed", () => {
  const ship = new Ship(3);
  const board = new Gameboard();

  board.placeShip(ship, [4, 3], "vertical");

  expect(board.grid[4][3].ship).toBe(ship);
  expect(board.grid[5][3].ship).toBe(ship);
  expect(board.grid[6][3].ship).toBe(ship);
});

test("ship is horizontally placed", () => {
  const ship = new Ship(3);
  const board = new Gameboard();

  board.placeShip(ship, [4, 3], "horizontal");

  expect(board.grid[4][3].ship).toBe(ship);
  expect(board.grid[4][4].ship).toBe(ship);
  expect(board.grid[4][5].ship).toBe(ship);
});

test("ship cant be placed in occupied squares", () => {
  const board = new Gameboard();

  const firstShip = new Ship(4);
  board.placeShip(firstShip, [3, 4], "vertical");

  const secondShip = new Ship(3);
  const result = board.placeShip(secondShip, [3, 2], "horizontal");

  expect(board.grid[3][4].ship).toBe(firstShip);
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

test("gameboard can check if a ship is hit", () => {
  const board = new Gameboard();
  const ship = new Ship(3);
  board.placeShip(ship, [4, 6], "vertical");
  expect(board.receiveAttack([6, 6])).toBe("hit");
  expect(board.receiveAttack([7, 6])).toBe("miss");
});

test("gameboard can run hit function for hitted ship", () => {
  const board = new Gameboard();
  const ship = new Ship(3);
  board.placeShip(ship, [4, 6], "vertical");

  board.receiveAttack([6, 6]);
  expect(ship.hitCount).toBe(1);

  board.receiveAttack([7, 6]);
  expect(ship.hitCount).toBe(1);

  board.receiveAttack([5, 6]);
  expect(ship.hitCount).toBe(2);
});

test("ship cant be hit in same spot multiple times", () => {
  const board = new Gameboard();
  const ship = new Ship(3);
  board.placeShip(ship, [4, 6], "vertical");

  board.receiveAttack([6, 6]);
  expect(ship.hitCount).toBe(1);

  expect(board.receiveAttack([6, 6])).toBe(false);
  expect(ship.hitCount).toBe(1);
});

test("gameboard can tell when all ships are sunk", () => {
  const board = new Gameboard();

  const ship1 = new Ship(3);
  board.placeShip(ship1, [4, 6], "vertical");

  const ship2 = new Ship(4);
  board.placeShip(ship2, [3, 1], "horizontal");

  board.receiveAttack([4, 6]);
  board.receiveAttack([4, 7]);
  board.receiveAttack([5, 6]);

  board.receiveAttack([6, 6]);
  expect(ship1.isSunk()).toBe(true);
  expect(board.allShipsSunk()).toBe(false);

  board.receiveAttack([3, 2]);
  board.receiveAttack([3, 1]);
  board.receiveAttack([3, 0]);
  board.receiveAttack([3, 3]);

  board.receiveAttack([3, 4]);
  expect(ship2.isSunk()).toBe(true);
  expect(board.allShipsSunk()).toBe(true);
});

test("players can attack opponents board", () => {
  const player1 = new Player();
  const ship1 = new Ship(3);
  player1.board.placeShip(ship1, [4, 6], "vertical");

  const player2 = new Player();
  const ship2 = new Ship(2);
  player2.board.placeShip(ship2, [7, 3], "horizontal");

  player1.attack(player2.board, [7, 4]);
  player2.attack(player1.board, [4, 6]);
  player1.attack(player2.board, [7, 3]);

  expect(ship1.hitCount).toBe(1);
  expect(ship2.isSunk()).toBe(true);
  expect(player2.board.allShipsSunk()).toBe(true);
});

test("ship can be removed from board", () => {
  const board = new Gameboard();
  const ship = new Ship(3);
  board.placeShip(ship, [4, 6], "vertical");

  board.removeShip(ship);

  expect(board.grid[4][6].ship).toBe(null);
  expect(board.grid[5][6].ship).toBe(null);
  expect(board.grid[6][6].ship).toBe(null);
  expect(board.ships.includes(ship)).toBe(false);
});

test("ship can be placed after being removed", () => {
  const board = new Gameboard();
  const ship = new Ship(3);
  board.placeShip(ship, [4, 6], "vertical");

  board.removeShip(ship);

  const result = board.placeShip(ship, [2, 2], "horizontal");

  expect(result).toBe(true);
  expect(board.grid[2][2].ship).toBe(ship);
  expect(board.grid[2][3].ship).toBe(ship);
  expect(board.grid[2][4].ship).toBe(ship);
  expect(board.ships.includes(ship)).toBe(true);
});

test("ship can be hit after being removed and placed again in different position", () => {
  const board = new Gameboard();
  const ship = new Ship(3);
  board.placeShip(ship, [4, 6], "vertical");

  board.removeShip(ship);

  board.placeShip(ship, [2, 2], "horizontal");

  board.receiveAttack([4, 6]);
  expect(ship.hitCount).toBe(0);

  board.receiveAttack([2, 3]);
  expect(ship.hitCount).toBe(1);

  board.receiveAttack([4, 7]);
  expect(ship.hitCount).toBe(1);

  board.receiveAttack([2, 4]);
  expect(ship.hitCount).toBe(2);

  board.receiveAttack([2, 2]);
  expect(ship.hitCount).toBe(3);
});

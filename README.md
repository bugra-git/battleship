# 🚢 Battleship -- Browser Strategy Game

A fully interactive browser implementation of the classic **Battleship**
game built with vanilla JavaScript.

This project focuses on clean architecture, game logic design, and
implementing custom drag-and-drop ship placement without external
libraries.

https://bugra-git.github.io/battleship/

------------------------------------------------------------------------

## ✨ Features

-   🔲 10×10 grid for player and computer
-   🖱 Drag & drop ship positioning
-   🔄 Click-to-rotate ships before game start
-   🧠 Intelligent computer attack logic
-   🎯 Hit / miss visual indicators
-   🚢 Ship sinking detection
-   🏆 Win / lose state handling
-   🔁 Game reset functionality

------------------------------------------------------------------------

## 🧠 Technical Highlights

### gameLogic.js

Core domain logic: - Ship - Gameboard - Player

Handles: - Placement validation - Collision detection (including
surrounding cell checks) - Attack processing - Win condition checks

------------------------------------------------------------------------

### gameplay.js

Game orchestration: - Player and computer initialization - Turn
handling - Smart AI targeting strategy: - Random search phase - Targeted
directional attacks after hit - State tracking for partially discovered
ships

------------------------------------------------------------------------

### interface.js

UI layer: - Grid generation - Ship rendering - Drag-and-drop
interaction - Rotation handling - Live placement preview - Event binding
and DOM updates

All validation remains inside the game logic layer --- the UI never
makes placement decisions independently.

------------------------------------------------------------------------

## 🖱 Drag & Drop System

Ships can be repositioned before the game starts using HTML5 Drag and
Drop.

Implementation details:

-   Every ship cell is draggable
-   Drag offset is calculated to preserve relative grab position
-   A dynamic preview renders the entire ship footprint during drag
-   dragover enables dropping via preventDefault()
-   drop handles placement
-   dragend ensures guaranteed state cleanup
-   Native drag ghost image is suppressed for cleaner UX

------------------------------------------------------------------------

## 🎮 How to Play

1.  Arrange ships:
    -   Drag ships to reposition
    -   Click ships to rotate
2.  Press Play
3.  Click on the opponent's grid to attack
4.  Sink all enemy ships to win

------------------------------------------------------------------------

## 🛠 Technologies

-   HTML5
-   CSS3
-   Vanilla JavaScript (ES6 Modules)
-   No external libraries

------------------------------------------------------------------------

## 📚 What This Project Demonstrates

-   Object-Oriented JavaScript
-   Game state management
-   DOM-driven UI architecture
-   Event lifecycle handling
-   Custom drag-and-drop logic
-   AI behavior implementation
-   Defensive UI cleanup patterns

------------------------------------------------------------------------

## 🚀 Possible Improvements

-   Mobile / touch drag support (Pointer Events)
-   Animated placement feedback
-   Visual valid/invalid preview states
-   Difficulty scaling for AI
-   Sound effects
-   Improved UI styling
-   Persistent game state (localStorage)

------------------------------------------------------------------------


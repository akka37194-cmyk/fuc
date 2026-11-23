# REAL WORLD — Browser 3D Prototype

A first playable vertical slice for the REAL WORLD life-simulation concept.

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## Controls
- W / A / S / D or arrow keys: walk / drive
- Shift: sprint
- E: interact with a nearby landmark
- F: enter or exit the red car (walk close first)
- C: switch first-person / third-person camera
- On mobile: use the on-screen directional pad and CAM / CAR / USE buttons

## Included in this prototype
- Three.js 3D city block with roads, buildings, trees and landmarks
- Walkable character with first-person and third-person camera modes
- Drivable car with acceleration, reverse, steering and wheel rotation
- Moving pedestrian NPCs
- School, medical centre, market and home interaction points
- HUD, nearby-location indicator and mini-map
- Local browser autosave for player position, money and camera mode
- Responsive mobile touch controls

## Current limitations
This is a local single-player prototype, not the complete global online game. The city, NPC routines, economy, buildings and vehicle handling are intentionally simplified. Online multiplayer, accounts, server persistence, advanced collision, full interiors, careers, global map streaming and production-grade simulation are future development milestones.

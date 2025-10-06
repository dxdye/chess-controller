# Chess Controller

## Description

Chess controller is my approach to implement a web app to play some chess!

### It impements:

- a geometry/rules set and FEN parsing/ translation
- uci via stockfish.wasm to calculate moves

### Components are:

- Typescript + SWC (Node.js)
- React
- Vite (as bundler)
- react-dnd (drag 'n drop) backend

It will be hosted on `playchess.tilmanbertram.com`.

## Features

It should:

- visualize the game
- calculate _best_ moves
- support different elos
- feature the change of side
- feature view history and export as PGN notation
- allow take back move
- allow to flip the board
- feature an editor to customize board
- support all formats (phone, desktop)
- feature smooth animation (drag 'n drop mechanics)
- feature themeing, of course!

## Development

### to clean install app:

`npm ci`

### to run in dev mode:

`npm run dev`

### create release build:

`npm run build`

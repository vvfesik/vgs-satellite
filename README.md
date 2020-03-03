# VGS-Satellite

VGS Offline integration project.

## Building and running on localhost

First install dependencies:

```sh
npm install
```

Then build and serve at [http://localhost:5432/](http://localhost:5432/):

```sh
npm start
```

## Running

To build and serve at custom port (eg. 8888):

```sh
npm run build && npx static-server --port 8888 --open dist
```

To run in hot module reloading mode:

```sh
npm run dev
```

Then open [http://localhost:1234](http://localhost:1234) in your browser

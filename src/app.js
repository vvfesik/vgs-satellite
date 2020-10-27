const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const isDev = require("electron-is-dev");

const { spawn } = require('child_process');
const waitOn = require('wait-on');

let mainWindow;

const webPort = 8089;  // TODO: read port from the config
const backendPath = path.join(path.dirname(app.getAppPath()), "./vgs-satellite-backend");
const backendParams = ["--silent", "--web-server-port", webPort];

let backend;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:1234");
  } else {
    mainWindow.loadFile("dist/index.html");
  }
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", () => {
  if (isDev) {
    createWindow();
  } else {
    backend = spawn(backendPath, backendParams);
    waitOn({
      resources: [`http://localhost:${webPort}`]
    }).then(createWindow);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("will-quit", () => {
  if (backend) {
    backend.kill("SIGINT");
  }
});

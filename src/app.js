const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const isDev = require("electron-is-dev");

const { spawn } = require('child_process');
const waitOn = require('wait-on');

const { is } = require("electron-util");

let mainWindow;

const webPort = 8089;  // TODO: read port from the config
const rootPath = path.join(path.dirname(app.getAppPath()), "..");
const backendPath = path.join(process.resourcesPath, "./vgs-satellite-backend");
const backendParams = ["--silent", "--web-server-port", webPort];

let backend;

const enableCookies = `
  const ElectronCookies = require("@exponent/electron-cookies");
  ElectronCookies.enable({ origin: 'https://VGSsatellite.localhoste' });
`;

function createWindow() {
  let options = {
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  };
  if (is.linux) {
    options = Object.assign({}, options, {
      icon: path.join(rootPath, "./vgs-satellite.png")
    });
  }
  mainWindow = new BrowserWindow(options);
  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    mainWindow.loadURL("http://localhost:1234");
  } else {
    mainWindow.loadFile("dist/preloader.html");
    waitOn({
      resources: [`http://localhost:${webPort}`]
    })
      .then(() => {
        mainWindow.loadFile("dist/index.html");
        mainWindow.webContents.once('dom-ready', function() {
          mainWindow.webContents.executeJavaScript(enableCookies);
        });
      });
  }
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", () => {
  if (isDev) {
    createWindow();
  } else {
    backend = spawn(backendPath, backendParams);
    backend.on("exit", (code) => {
      if (code !== null && code !== 0) {
        let error = 'Unknown error';
        const output = backend.stderr.read()
        if (output !== null) {
          error = output.toString('utf8');
        }
        electron.dialog.showErrorBox('Backend crashed', error);
        app.quit()
      }
    })
    createWindow();
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
  if (backend && backend.exitCode === null) {
    backend.kill("SIGINT");
  }
});

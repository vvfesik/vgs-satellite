const { app, dialog, protocol, shell, session, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const { is } = require('electron-util');

const DIST_PATH = path.join(__dirname, '../dist');
const scheme = 'localhoste';

const mimeTypes = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.ico': 'image/vnd.microsoft.icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.map': 'text/plain',
  ".woff": "font/woff",
};

function charset(mimeType) {
  return ['.html', '.htm', '.js', '.mjs'].some((m) => m === mimeType)
    ? 'utf-8'
    : null;
}

function mime(filename) {
  const type = mimeTypes[path.extname(`${filename || ''}`).toLowerCase()];
  return type ? type : null;
}

function requestHandler(req, next) {
  const reqUrl = new URL(req.url);
  let reqPath = path.normalize(reqUrl.pathname);
  if (reqPath === '/') {
    reqPath = '/index.html';
  }
  const reqFilename = path.basename(reqPath);
  fs.readFile(path.join(DIST_PATH, reqPath), (err, data) => {
    const mimeType = mime(reqFilename);
    if (!err) {
      next({
        mimeType: mimeType,
        charset: charset(mimeType),
        data: data,
      });
    } else {
      console.error(err);
    }
  });
}

const enableCookies = `
  const ElectronCookies = require("@exponent/electron-cookies");
  ElectronCookies.enable({ origin: 'localhoste://satellite' });
`;

let mainWindow;

const webPort = 8089; // TODO: read port from the config
const rootPath = path.join(path.dirname(app.getAppPath()), '..');
const backendPath = path.join(process.resourcesPath, './vgs-satellite-backend');
const backendParams = ['--silent', '--web-server-port', webPort];

let backend;

function createWindow() {
  let options = {
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true,
      enableRemoteModule: true,
    },
  };
  if (is.linux) {
    options = Object.assign({}, options, {
      icon: path.join(rootPath, './vgs-satellite.png'),
    });
  }
  mainWindow = new BrowserWindow(options);
  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    mainWindow.loadURL('http://localhost:1234');
  } else {
    protocol.registerBufferProtocol(scheme, requestHandler);
    mainWindow.loadFile('dist/preloader.html');
    waitOn({
      resources: [`http://localhost:${webPort}`],
    }).then(() => {
      mainWindow.loadURL(`${scheme}://satellite/index.html`);
      mainWindow.webContents.on('dom-ready', function() {
        mainWindow.webContents.executeJavaScript(enableCookies);
      });
    });
  }

  mainWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });
  mainWindow.on('closed', () => (mainWindow = null));
}

protocol.registerSchemesAsPrivileged([
  {
    scheme,
    privileges: {
      standard: true,
      secure: true,
    },
  },
]);

function modifyHeaders() {
  const filter = {
    urls: ['https://auth.verygoodsecurity.com/*'],
  };
  session.defaultSession.webRequest.onHeadersReceived(
    filter,
    ({ responseHeaders }, callback) => {
      responseHeaders = {
        ...responseHeaders,
        'Access-Control-Allow-Origin': [`${scheme}://satellite`],
        'Access-Control-Allow-Credentials': 'true',
      };
      callback({ responseHeaders });
    },
  );
}

app.on('ready', () => {
  if (isDev) {
    createWindow();
  } else {
    backend = spawn(backendPath, backendParams);
    backend.on('exit', (code) => {
      if (code !== null && code !== 0) {
        let error = 'Unknown error';
        const output = backend.stderr.read();
        if (output !== null) {
          error = output.toString('utf8');
        }
        dialog.showErrorBox('Backend crashed', error);
        app.quit();
      }
    });
    modifyHeaders();
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  if (backend && backend.exitCode === null) {
    backend.kill('SIGINT');
  }
});

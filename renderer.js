// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// renderer process
const {
  rgbToHex,
  rgbToHsv,
  rgbToCmyk
} = require('./src/lib/colorFunctions');

let currentDisplay = null;

const electron = require('electron');
const {remote, desktopCapturer} = electron;
const screen = remote.require('./src/screen').screen;

const colorScreen = document.querySelector('#colorScreen');
const colorCodes = document.querySelector('#colorCodes');
let cursor = {x: 0, y: 0};

function initScreen(scr) {
  return new Promise((resolve, reject) => {
    const displays = screen.getAllDisplays();

    const [display] = displays.filter((d) => d.id === parseInt(scr.display_id, 10));

    // setTimeout(resolve, 10000);
    getUserMedia(scr, display)
      .then((stream) => {
        handleStream(stream, display)
          .then(resolve);
      })
      .catch((e) => {
        handleError(e);
        reject(e);
      });
    return false
  });
}

function start() {
  desktopCapturer.getSources({types: ['screen']}, (error, sources) => {
    if (error) throw error;

    const sourcePromises = [];
    const multipleScreens = sources.filter((screen) => /^Screen \d{0,2}$/.test(screen.name));
    const [entireScreen] = sources.filter((source) => source.name === 'Entire screen');

    if (multipleScreens.length) {
      multipleScreens.forEach((scr) => {
        sourcePromises.push(initScreen(scr));
      })
    } else {
      sourcePromises.push(initScreen(entireScreen));
    }

    Promise.all(sourcePromises).then(() => {
      handleCursor();
    })
  });
}

function getUserMedia(screen, display) {
  const {bounds, scaleFactor} = display;
  const {width, height} = bounds;

  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: screen.id,
        minWidth: width * scaleFactor,
        maxWidth: width * scaleFactor,
        minHeight: height * scaleFactor,
        maxHeight: height * scaleFactor
      }
    }
  });
}

function handleColorPick() {
  if (!currentDisplay) {
    return null  ;
  }
  const ctx = document.querySelector(`#canvas_id_${currentDisplay.id}`).getContext('2d');
  const rgba = ctx.getImageData(0, 0, 1, 1).data;
  const rgb = rgba.slice(0, 3);
  colorScreen.style.background = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`;
  colorCodes.innerHTML = `
    <div class="row">
        pixel at [${cursor.x}:${cursor.y}]
    </div>
    <div class="row">
      <div class="key">html:</div>
      <div class="value">${rgbToHex(rgba)}</div>
    </div>
    <div class="row">
      <div class="key">rgb:</div>
      <div class="value">(${rgb.join(',')})</div>
    </div>
    <div class="row">
      <div class="key">cmyk:</div>
      <div class="value">(${rgbToCmyk(rgb).join(',')})</div>
    </div>
    <div class="row">
      <div class="key">hsv:</div>
      <div class="value">(${rgbToHsv(rgb).join(',')})</div>
    </div>
  `
}

function handleStream(stream, display) {
  return new Promise((resolve, reject) => {
    const {scaleFactor} = display;
    let {width, height} = stream.getVideoTracks()[0].getSettings();
    width = width / scaleFactor;
    height = height / scaleFactor;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const video = document.createElement('video');
    video.style.width = `${width}px`;
    video.style.height = `${height}px`;
    video.id = `video_id_${display.id}`;
    canvas.style.width = '1px';
    canvas.style.height = '1px';
    canvas.width = 1;
    canvas.height = 1;
    canvas.id = `canvas_id_${display.id}`;

    document.querySelector('#videoSources').appendChild(canvas);

    video.srcObject = stream;
    video.onloadedmetadata = (e) => video.play();

    video.addEventListener('play', function () {
      var thisVideo = this; //cache
      console.info('play');

      function loop() {
        if (!thisVideo.paused && !thisVideo.ended) {
          const {x, y} = cursor;
          ctx.clearRect(0,0,width, height);
          ctx.drawImage(thisVideo, -x+3, -y+3, width, height);
          handleColorPick();
          requestAnimationFrame(loop);
        }
      }
      loop();
      resolve(this); // Video source
    }, 0);
  });
}

function handleError(e) {
  console.log(e)
}

function handleCursor() {
  cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayMatching({
    x: cursor.x - 3,
    y: cursor.y - 3,
    width: 1,
    height: 1
  });

  if (!currentDisplay || currentDisplay.id !== display.id) {
    currentDisplay = display;
  }

  requestAnimationFrame(handleCursor);
}

start();

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// renderer process
const mapNumbers = require('electron').remote.require('./src/mapNumbers')
const withRendererCb = mapNumbers.withRendererCallback(x => x + 1)
const withLocalCb = mapNumbers.withLocalCallback()
const SCALE = .2;
console.log(withRendererCb, withLocalCb);
let currentDisplay = null;
let currentCanvas = null;
// [undefined, undefined, undefined], [2, 3, 4]


const electron = require('electron');
const {remote, desktopCapturer} = electron;
const screen = remote.require('./src/screen').screen;

const colorScreen = document.querySelector('#colorScreen');

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


    console.info(sourcePromises);

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

function getMouseCoordsWithCorrection() {
  const {x, y} = screen.getCursorScreenPoint();

  return {
    x: x + (currentDisplay.bounds.x * -1),
    y: y +(currentDisplay.bounds.y * -1),
}
}

function handleColorPick() {
  console.log(`#canvas_id_${currentDisplay.id}`);
  console.dir(document.querySelector(`#canvas_id_${currentDisplay.id}`));
  const ctx = document.querySelector(`#canvas_id_${currentDisplay.id}`).getContext('2d');
  let {x, y} = getMouseCoordsWithCorrection();
  const rgba = ctx.getImageData(x - 2, y - 2, 1, 1).data;
  colorScreen.style.background = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`;
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
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width;
    canvas.height = height;
    canvas.id = `canvas_id_${display.id}`;

    document.querySelector('#videoSources').appendChild(canvas);
    document.querySelector('#videoSources').appendChild(video);

    video.srcObject = stream;
    video.onloadedmetadata = (e) => video.play();

    video.addEventListener('play', function () {
      var $this = this; //cache
      (function loop() {
        if (!$this.paused && !$this.ended) {
          ctx.drawImage($this, 0, 0, width, height);
          setTimeout(loop, 1000 / 60); // drawing at 30fps
        }
      })();
      resolve(this); // Video source
    }, 0);
  });
}

function handleError(e) {
  console.log(e)
}

function handleCursor() {
  setInterval(() => {
    const cursor = screen.getCursorScreenPoint();
    const display = screen.getDisplayMatching({
      x: cursor.x - 2,
      y: cursor.y - 2,
      width: 1,
      height: 1
    });

    if (!currentDisplay || currentDisplay.id !== display.id) {
      currentDisplay = display;
    }

    handleColorPick();
    console.info(currentDisplay);
  }, 16);
}

start();
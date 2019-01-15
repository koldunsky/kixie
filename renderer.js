// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// renderer process
const mapNumbers = require('electron').remote.require('./src/mapNumbers')
const withRendererCb = mapNumbers.withRendererCallback(x => x + 1)
const withLocalCb = mapNumbers.withLocalCallback()
const SCALE = .2;
console.log(withRendererCb, withLocalCb)
// [undefined, undefined, undefined], [2, 3, 4]


const electron = require('electron');
const {remote, desktopCapturer} = electron;
const screen = remote.require('./src/screen').screen;

const colorScreen = document.querySelector('#colorScreen');


// In the renderer process.
desktopCapturer.getSources({types: ['screen']}, (error, sources) => {
  if (error) throw error;

  const multipleScreens = sources.filter((screen) => /^Screen \d{0,2}$/.test(screen.name));
  const displays = screen.getAllDisplays();

  if (multipleScreens.length) {
    multipleScreens.forEach((screen) => {
      const [display] = displays.filter((d) => d.id === screen.id);

      getUserMedia(screen, display).then((stream) => handleStream(stream, display))
        .catch((e) => handleError(e));
      return false
    })
  }

  for (let i = 0; i < sources.length; ++i) {
    if (sources[i].name === 'Entire screen') {
      const display = screen.getPrimaryDisplay();
      handleCursor([sources[i]]);
      getUserMedia(sources[i], display).then((stream) => handleStream(stream, display))
        .catch((e) => handleError(e));
      return
    }
  }
});

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

function handleStream(stream, display) {
  const {scaleFactor} = display;
  let {width, height} = stream.getVideoTracks()[0].getSettings();
  width = width / scaleFactor;
  height = height / scaleFactor;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const video = document.createElement('video');
  video.style.width = `${width}px`;
  video.style.height = `${height}px`;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width;
  canvas.height = height;

  document.querySelector('#videoSources').appendChild(canvas);
  document.querySelector('#videoSources').appendChild(video);

  video.srcObject = stream;
  video.onloadedmetadata = (e) => video.play();

  video.addEventListener('play', function () {
    var $this = this; //cache
    (function loop() {
      if (!$this.paused && !$this.ended) {
        ctx.drawImage($this, 0, 0, width, height);
        const {x, y} = screen.getCursorScreenPoint();
        const rgba = ctx.getImageData(x - 2, y - 2, 1, 1).data;
        colorScreen.style.background = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`;
        setTimeout(loop, 1000 / 60); // drawing at 30fps
      }
    })();
  }, 0);
}

function handleError(e) {
  console.log(e)
}

function handleCursor(screens) {
  setInterval(() => {
    const display = screen.getDisplayMatching({
      ...screen.getCursorScreenPoint(),
      width: 1,
      height: 1
    });
    console.info(display.id);
  }, 16);
  console.info(screens);
}

function moveMouseImmitationMouse() {
  const pointer = document.getElementById('pointer');
  const {y: top, x: left} = screen.getCursorScreenPoint();
  pointer.style.top = top * SCALE + 'px';
  pointer.style.left = left * SCALE + 'px';
}

function renderDesktopImmitation() {
  const [{size: {width, height}}] = screen.getAllDisplays();
  const immitator = document.getElementById('screenImmitation');
  immitator.style.width = width * SCALE + 'px';
  immitator.style.height = height * SCALE + 'px';

  // setInterval(moveMouseImmitationMouse, 16);
}

renderDesktopImmitation();
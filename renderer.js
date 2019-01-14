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

const screen = require('electron').remote.require('./src/screen').screen;

setInterval(() => {
  console.info(screen.getCursorScreenPoint());
}, 16);

// In the renderer process.
const { desktopCapturer } = require('electron')

desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
  if (error) throw error;

  for (let i = 0; i < sources.length; ++i) {
    console.info(sources[i]);
    if (sources[i].name === 'Entire screen') {
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sources[i].id,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        }
      }).then((stream) => handleStream(stream))
        .catch((e) => handleError(e))
      return
    }
  }
})

function handleStream (stream) {
  const video = document.querySelector('video')
  video.srcObject = stream
  video.onloadedmetadata = (e) => video.play()
}

function handleError (e) {
  console.log(e)
}

function moveMouseImmitationMouse() {
  const pointer = document.getElementById('pointer');
  const {y: top, x: left} = screen.getCursorScreenPoint();
  pointer.style.top = top * SCALE + 'px';
  pointer.style.left = left * SCALE + 'px';
}

function renderDesktopImmitation() {
  const [{ size: {width, height }}] =  screen.getAllDisplays();
  const immitator = document.getElementById('screenImmitation');
  immitator.style.width = width * SCALE + 'px';
  immitator.style.height = height * SCALE + 'px';

  setInterval(moveMouseImmitationMouse, 16);
}

renderDesktopImmitation();
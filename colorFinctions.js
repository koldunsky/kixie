function rgbToHex (rgb) {
    const r = rgb[0],
          g = rgb[1],
          b = rgb[2];

  return ('#' + r.toString(16) + g.toString(16) + b.toString(16));
}

module.exports = {
  rgbToHex,
};
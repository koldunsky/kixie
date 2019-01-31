function rgbToHex (rgb) {
    const r = rgb[0],
          g = rgb[1],
          b = rgb[2];

  return ('#' + r.toString(16) + g.toString(16) + b.toString(16));
}

function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

function rgbToHsv ([r, g, b]) {
  let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
  rabs = r / 255;
  gabs = g / 255;
  babs = b / 255;
  v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
  diffc = c => (v - c) / 6 / diff + 1 / 2;
  percentRoundFn = num => Math.round(num * 100) / 100;
  if (diff == 0) {
    h = s = 0;
  } else {
    s = diff / v;
    rr = diffc(rabs);
    gg = diffc(gabs);
    bb = diffc(babs);

    if (rabs === v) {
      h = bb - gg;
    } else if (gabs === v) {
      h = (1 / 3) + rr - bb;
    } else if (babs === v) {
      h = (2 / 3) + gg - rr;
    }
    if (h < 0) {
      h += 1;
    }else if (h > 1) {
      h -= 1;
    }
  }
  return [Math.round(h * 360), percentRoundFn(s * 100), percentRoundFn(v * 100)];
}

function CMYK(c, m, y, k) {
  if (c <= 0) { c = 0; }
  if (m <= 0) { m = 0; }
  if (y <= 0) { y = 0; }
  if (k <= 0) { k = 0; }

  if (c > 100) { c = 100; }
  if (m > 100) { m = 100; }
  if (y > 100) { y = 100; }
  if (k > 100) { k = 100; }

  this.c = c;
  this.m = m;
  this.y = y;
  this.k = k;
}

function rgbToCmyk([r, g, b]){
  var result = new CMYK(0, 0, 0, 0);

  r = r / 255;
  g = g / 255;
  b = b / 255;

  result.k = Math.min( 1 - r, 1 - g, 1 - b );
  result.c = ( 1 - r - result.k ) / ( 1 - result.k );
  result.m = ( 1 - g - result.k ) / ( 1 - result.k );
  result.y = ( 1 - b - result.k ) / ( 1 - result.k );

  result.c = Math.round( result.c * 100 );
  result.m = Math.round( result.m * 100 );
  result.y = Math.round( result.y * 100 );
  result.k = Math.round( result.k * 100 );

  const {c, m, y, k} = result;

  return [c, m, y, k];
}


module.exports = {
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToCmyk
};
// Draw the TS logo.

var font = "Baloo Da";
var fontUrl = "https://fonts.googleapis.com/css?family=" +
  font.replace(" ", "+");

function drawLogo(base) {
  $(base).empty();

  // Force load of font by adding an empty div with the font up top.
  var d = document.createElement('div');
  $(d).css('font-family', '"' + font + '"');
  $(d).html('&nbsp;');
  base.appendChild(d);

  // Create canvas.
  var cnv = document.createElement('canvas');
  var ctx = cnv.getContext("2d");
  base.appendChild(cnv);

  // Borrowed from http://stackoverflow.com/questions/2756575/
  // Load font.
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  //link.href = 'https://fonts.googleapis.com/css?family=Varela+Round';
  link.href = fontUrl;
  document.getElementsByTagName('head')[0].appendChild(link);

  // Trick from http://stackoverflow.com/questions/2635814/
  var image = new Image;
  image.src = link.href;
  image.onerror = function() {
    setTimeout(function() { finishLogo(cnv, ctx); }, 1000);
  };
}

function finishLogo(cnv, ctx) {
  // Basic window dimension.
  var d = Math.min(window.innerWidth, window.innerHeight) * 0.95;
  // Circle diameter.
  var cd = d * 0.3;

  cnv.width = d;
  cnv.height = d;
  ctx = cnv.getContext("2d");

  ctx.strokeStyle = "#285b7b";
  ctx.beginPath();
  ctx.arc(d / 2, d / 2, cd, 0, 2 * Math.PI);
  ctx.lineWidth = cd / 4.5;
  ctx.stroke();

  // Font size for TS.
  var fs = cd * 1.3;
  ctx.font = fs+'px "' + font + '"';
  ctx.fillStyle = "#50514f";
  ctx.fillText("TS", d*0.28, d*0.62);

  // Font size for circle.
  var cfs = cd / 3;
  ctx.fillStyle = "#285b7b";
  drawCircularText(cnv, "TEAM SIDNEY'S POINT TRACKER", d, 0, "center",
  true, true, font, cfs + "px", 0);
}

// From http://blog.graphicsgen.com/2015/03/html5-canvas-rounded-text.html
function drawCircularText(cnv, text, diameter, startAngle, align, textInside, inwardFacing, fName, fSize, kerning) {
  // text:         The text to be displayed in circular fashion
  // diameter:     The diameter of the circle around which the text will
  //               be displayed (inside or outside)
  // startAngle:   In degrees, Where the text will be shown. 0 degrees
  //               if the top of the circle
  // align:        Positions text to left right or center of startAngle
  // textInside:   true to show inside the diameter. False draws outside
  // inwardFacing: true for base of text facing inward. false for outward
  // fName:        name of font family. Make sure it is loaded
  // fSize:        size of font family. Don't forget to include units
  // kearning:     0 for normal gap between letters. positive or
  //               negative number to expand/compact gap in pixels
  //------------------------------------------------------------------------

  // declare and intialize canvas, reference, and useful variables
  align = align.toLowerCase();
  var mainCanvas = cnv;
  var ctxRef = mainCanvas.getContext('2d');
  var clockwise = align == "right" ? 1 : -1; // draw clockwise for aligned right. Else Anticlockwise
  startAngle = startAngle * (Math.PI / 180); // convert to radians

  // calculate height of the font. Many ways to do this
  // you can replace with your own!
  var div = document.createElement("div");
  div.innerHTML = text;
  div.style.position = 'absolute';
  div.style.top = '-10000px';
  div.style.left = '-10000px';
  div.style.fontFamily = fName;
  div.style.fontSize = fSize;
  document.body.appendChild(div);
  var textHeight = div.offsetHeight;
  document.body.removeChild(div);

  // in cases where we are drawing outside diameter,
  // expand diameter to handle it
  if (!textInside) diameter += textHeight * 2;

  ctxRef.font = fSize + ' ' + fName;

  // Reverse letter order for align Left inward, align right outward 
  // and align center inward.
  if (((["left", "center"].indexOf(align) > -1) && inwardFacing) || (align == "right" && !inwardFacing)) text = text.split("").reverse().join("");

  // Setup letters and positioning
  ctxRef.translate(diameter / 2, diameter / 2); // Move to center
  startAngle += (Math.PI * !inwardFacing); // Rotate 180 if outward
  ctxRef.textBaseline = 'middle'; // Ensure we draw in exact center
  ctxRef.textAlign = 'center'; // Ensure we draw in exact center

  // rotate 50% of total angle for center alignment
  if (align == "center") {
    for (var j = 0; j < text.length; j++) {
      var charWid = ctxRef.measureText(text[j]).width;
      startAngle += ((charWid + (j == text.length - 1 ? 0 : kerning)) / (diameter / 2 - textHeight)) / 2 * -clockwise;
    }
  }

  // Phew... now rotate into final start position
  ctxRef.rotate(startAngle);

  // Now for the fun bit: draw, rotate, and repeat
  for (var j = 0; j < text.length; j++) {
    var charWid = ctxRef.measureText(text[j]).width; // half letter

    ctxRef.rotate((charWid / 2) / (diameter / 2 - textHeight) * clockwise); // rotate half letter

    // draw char at "top" if inward facing or "bottom" if outward
    ctxRef.fillText(text[j], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2));

    ctxRef.rotate((charWid / 2 + kerning) / (diameter / 2 - textHeight) * clockwise); // rotate half letter
  }
}

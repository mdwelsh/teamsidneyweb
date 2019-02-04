/* Escher main JS code */

window.onload = function() {
  // Load the Etch-a-Sketch image.
  var c = $("#etchCanvas");
  var ctx = c.get(0).getContext("2d");
  ctx.imageSmoothingQuality = 'medium';

  var image = new Image();
  image.src = "EtchASketch.jpg";
  $(image).load(function () {
    ctx.drawImage(image, 0, 0, c.get(0).width, c.get(0).height);
    etch();
  });

  resizeCanvas();
  $(window).on("resize", function(){
    resizeCanvas();
  });

};

// Scale canvas outerWidth/outerHeight to match dimensions
// of background image.
function resizeCanvas(){
  console.log('Resizing canvas');
  var ow = $("#etchCanvas").outerWidth;
  // This is the background image height and width.
  // Yeah, I'm being lazy by hardcoding these.
  var oh = (ow * (1081.0 / 1326.0));
  $("#etchCanvas").outerHeight(oh);
}

function etch(points) {
  // Offsets to screen of Etch-a-Sketch (experimentally determined).
  var sx0 = 210;
  var sy0 = 210;
  var sw = 900;
  var sh = 620;

  var c = $("#etchCanvas");
  var ctx = c.get(0).getContext("2d");

  // Debugging - Draw blue border.
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx0, sy0, sw, sh);

  points.forEach(function(elem) {
    var x = elem.x;
    var y = elem.y;
  });

  console.log('Etching done');
}

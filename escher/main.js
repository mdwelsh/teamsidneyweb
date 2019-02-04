/* Escher main JS code */

window.onload = function() {
  // Load the Etch-a-Sketch image.
  var c = $("#etchCanvas");
  var ctx = c.get(0).getContext("2d");
  ctx.imageSmoothingQuality = 'medium';

  var image = new Image();
  image.src = "EtchASketch.jpg";
  $(image).load(function () {
    console.log('Image width ' + image.width);
    console.log('Image height ' + image.height);
    console.log('Canvas width ' + c.get(0).width);
    console.log('Canvas height ' + c.get(0).height);
    ctx.drawImage(image, 0, 0, c.get(0).width, c.get(0).height);

    resizeCanvas();
    $(window).on("resize", function(){
      resizeCanvas();
    });
  });

};

// Scale canvas outerWidth/outerHeight to match dimensions
// of background image.
function resizeCanvas(){
  console.log('Resizing canvas');
  var ow = $("#etchCanvas").outerWidth;
  // This is the background image height and width.
  // Yeah, I'm being lazy by hardcoding these.
  var oh = int(ow * (1081.0 / 1326.0));
  $("#etchCanvas").outerHeight(oh);
}

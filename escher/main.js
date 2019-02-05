/* Escher main JS code */

var backgroundImage;

window.onload = function() {
  setup();
};

function setup() {
  // Configure UI actions.
  $('#fileUploadButton').click(function (e) {
    console.log('fileUploadButton clicked');
    uploadGcodeStart();
    $("#uploadGcode").get()[0].showModal();
  });
  $('#uploadGcodeConfirm').click(function (e) {
    console.log('uploadGcodeConfirm clicked');
    $("#uploadGcode").get()[0].close();
    gcodeUploadDone();
  });
  $('#uploadGcodeCancel').click(function (e) {
    console.log('uploadGcodeCancel clicked');
    $("#uploadGcode").get()[0].close();
  });
  $('#uploadGcodeClose').click(function (e) {
    console.log('uploadGcodeClose clicked');
    $("#uploadGcode").get()[0].close();
  });
  $('#uploadGcodeFile').change(function() {
    console.log('uploadGcodeFile changed');
    var file = $('#uploadGcodeFile')[0].files[0];
    uploadGcode(file);
  });

  // Load Etch-A-Sketch background image.
  backgroundImage = new Image();
  backgroundImage.src = "EtchASketch.jpg";
  $(backgroundImage).load(function () {
    showEtchASketch();
  });

  resizeCanvas();
  $(window).on("resize", function(){
    resizeCanvas();
  });
}

var uploadedGcode = null;
var uploadedGcodeUrl = null;

// Called when Gcode upload dialog is opened.
function uploadGcodeStart() {
  $('#uploadGcodeSelectedFile').empty();
  $('#uploadGcodeError').empty();
  $('#uploadGcodeLink').empty();
  $('#uploadGcodeSpinner').hide();
}

// Called when Gcode upload dialog is closed.
function uploadGcode(file) {
  uploadedGcode = file;
  $('#uploadGcodeConfirm').prop('disabled', true);
  $('#uploadGcodeSelectedFile').text('File: ' + file.name);
  $('#uploadGcodeError').empty();
  $('#uploadGcodeLink').empty();

  console.log('Reading: ' + file.name);
  var reader = new FileReader();
  reader.onloadend = function() {
    uploadGcodeFinished(reader.result);
  }
  reader.readAsArrayBuffer(file);
}

// Callback when file data has been read.
function uploadGcodeFinished(data) {
  console.log('Finished reading ' + uploadedGcode.name);
  var waypoints = parseGcode(data);
  $('#uploadGcodeConfirm').prop('disabled', false);
  console.log('Parsed ' + waypoints.length + ' waypoints from ' + uploadedGcode.name);
  console.log(waypoints);

  var scaled = scaleToScreen(waypoints);
  console.log('Scaled:');
  console.log(scaled);

  etch(scaled);
}

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


function showEtchASketch() {
  // Paint the Etch-a-Sketch image.
  var c = $("#etchCanvas");
  var ctx = c.get(0).getContext("2d");
  ctx.clearRect(0, 0, c.get(0).width, c.get(0).height);

  ctx.imageSmoothingQuality = 'medium';
  ctx.drawImage(backgroundImage, 0, 0, c.get(0).width, c.get(0).height);
}

function etch(points) {
  console.log('Etching ' + points.length + ' points');
  showEtchASketch();

  // Offsets to screen of Etch-a-Sketch (experimentally determined).
  var sx0 = 210;
  var sy0 = 210;
  var sw = 900;
  var sh = 620;

  var c = $("#etchCanvas");
  var ctx = c.get(0).getContext("2d");

  // Debugging - Draw blue border.
  //ctx.strokeStyle = 'blue';
  //ctx.lineWidth = 2;
  //ctx.strokeRect(sx0, sy0, sw, sh);

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  // Start at origin.
  ctx.moveTo(sx0, sy0 + sh);

  points.forEach(function(elem) {
    var x = elem.x;
    var y = elem.y;

    // First flip the y-axis.
    y = sh - y;

    var tx = x + sx0;
    var ty = y + sy0;
    ctx.lineTo(tx, ty);
  });
  ctx.stroke();

  console.log('Etching done');
}

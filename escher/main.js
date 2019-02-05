/* Escher main JS code */

// Image with Etch-a-Sketch background.
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
  $('#uploadGcodeFile').change(function() {
    console.log('uploadGcodeFile changed');
    var file = $('#uploadGcodeFile')[0].files[0];
    uploadGcode(file);
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

  // Load Etch-A-Sketch background image.
  backgroundImage = new Image();
  backgroundImage.src = "EtchASketch.jpg";
  $(backgroundImage).load(function () {
    showEtchASketch($("#etchCanvas").get(0));
  });

  //resizeCanvas($("#etchCanvas"));
  //$(window).on("resize", function(){
  //  resizeCanvas($("#etchCanvas"));
  //});
}

var uploadedGcode = null;
var uploadedGcodeUrl = null;

// Called when Gcode upload dialog is opened.
function uploadGcodeStart() {
  $('#uploadGcodeConfirm').prop('disabled', true);
  $('#uploadGcodeSelectedFile').empty();
  $('#uploadGcodeError').empty();
  $('#uploadGcodeLink').empty();
  $('#uploadGcodeSpinner').hide();
  //resizeCanvas($("#previewCanvas"));
  showEtchASketch($("#previewCanvas").get(0));
}

// Called when Gcode file selector changes.
function uploadGcode(file) {
  uploadedGcode = file;
  $('#uploadGcodeConfirm').prop('disabled', true);
  $('#uploadGcodeSelectedFile').text('File: ' + file.name);
  $('#uploadGcodeError').empty();
  $('#uploadGcodeLink').empty();

  console.log('Reading: ' + file.name);
  var reader = new FileReader();
  reader.onloadend = function() {
    uploadGcodePreview(reader.result);
  }
  reader.readAsArrayBuffer(file);
}

// Callback when file data has been read and preview needs to be shown.
function uploadGcodePreview(data) {
  console.log('Finished reading ' + uploadedGcode.name);

  // Parse and preview Gcode.
  var waypoints = parseGcode(data);
  if (waypoints.length == 0) {
    console.log('Error: Cannot parse Gcode');
    $('#uploadGcodeError').text('Error - cannot parse Gcode.');
    return;
  }
  console.log('Parsed ' + waypoints.length + ' waypoints from ' + uploadedGcode.name);
  console.log(waypoints);

  var scaled = scaleToScreen(waypoints);
  console.log('Scaled:');
  console.log(scaled);

  etch($("#previewCanvas").get(0), scaled, 2);

  $('#uploadGcodeConfirm').prop('disabled', false);
}

// Called when upload has been confirmed by user.
function uploadGcodeDone() {
}

// Scale canvas outerHeight to match proportions
// of background image relative to outerWidth.
function resizeCanvas(canvasElem){
  console.log('Resizing canvas - outerWidth ' + canvasElem.outerWidth());
  console.log('Resizing canvas - outerHeight ' + canvasElem.outerHeight());
  //var ow = canvasElem.outerWidth;
  //var oh = (ow * (backgroundImage.height / backgroundImage.width));
  //canvasElem.outerHeight(oh);
  console.log('Resizing canvas - outerHeight now ' + canvasElem.outerHeight());
}


function showEtchASketch(canvas) {
  // Paint the Etch-a-Sketch image on the given canvas.
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function etch(canvas, points, lineWidth) {
  console.log('Etching ' + points.length + ' points');
  showEtchASketch(canvas);

  // Offsets to screen of Etch-a-Sketch (experimentally determined).
  var sx0 = 210;
  var sy0 = 210;
  var sw = 900;
  var sh = 620;

  var ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = lineWidth;
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

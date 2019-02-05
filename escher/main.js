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

function setup() {
  // Upload Gcode actions.
  $('#fileUploadButton').click(function (e) {
    uploadGcodeStart();
    $("#uploadGcode").get()[0].showModal();
  });
  $('#uploadGcodeConfirm').click(function (e) {
    $("#uploadGcode").get()[0].close();
    gcodeUploadDone();
  });
  $('#uploadGcodeCancel').click(function (e) {
    $("#uploadGcode").get()[0].close();
  });
  $('#uploadGcodeClose').click(function (e) {
    $("#uploadGcode").get()[0].close();
  });
  $('#uploadGcodeFile').change(function() {
    var file = $('#uploadGcodeFile')[0].files[0];
    uploadGcode(file);
  });
}

var uploadedGcode = null;
var uploadedGcodeUrl = null;

function uploadGcodeStart() {
  $('#uploadGcodeSelectedFile').empty();
  $('#uploadGcodeError').empty();
  $('#uploadGcodeLink').empty();
  $('#uploadGcodeSpinner').hide();
}

function uploadGcode(file) {
  uploadedGcode = file;
  $('#uploadGcodeConfirm').prop('disabled', true);
  $('#uploadGcodeSelectedFile').text('File: ' + file.name);
  $('#uploadGcodeError').empty();
  $('#uploadGcodeLink').empty();

  var reader = new FileReader();
  reader.onloadend = function() {
    uploadGcodeFinished(reader.result);
  }
  reader.readAsArrayBuffer(file);
}

// XXX XXX MDW Update below for Gcode
function uploadFirmwareFinished(data) {
  uploadedFirmwareVersion = getFirmwareVersion(data);
  if (uploadedFirmwareVersion == null) {
    $('#uploadFirmwareError')
      .text('File missing magic version string. Is this a Blinky binary?');
    uploadedFirmware = null;
    return;
  }

  // Valid binary - make it possible to add.
  console.log('Got firmware version: ' + uploadedFirmwareVersion);
  $('#uploadFirmwareVersion').text('Version string: ' + uploadedFirmwareVersion);
  $('#uploadFirmwareConfirm').prop('disabled', false);

  // Start the upload.
  $('#uploadFirmwareSpinner').show();
  var fname = uploadedFile.name + ' ' + uploadedFirmwareVersion;
  console.log('Starting upload of ' + fname);
  var uploadRef = storageRef.child(fname);
  uploadRef.put(uploadedFile).then(function(snapshot) {
    // Upload done.
    $('#uploadFirmwareSpinner').hide();
    console.log('Upload complete');
    // Add link.
    uploadRef.getDownloadURL().then(function(url) {
      uploadedFirmwareUrl = url;
      $('#uploadFirmwareLink').html('Uploaded: <a href="'+url+'">'+fname+'</a>');
    });
  });
}

function firmwareUploadDone() {
  var dbRef = firebase.database().ref('firmware/' + uploadedFirmwareVersion);
  var metadata = {
    dateUploaded: firebase.database.ServerValue.TIMESTAMP,
    version: uploadedFirmwareVersion,
    filename: uploadedFile.name + ' ' + uploadedFirmwareVersion,
    url: uploadedFirmwareUrl,
  };
  dbRef.set(metadata).then(function() {
    addLogEntry('added firmware '+uploadedFirmwareVersion);
  })
  .catch(function(error) {
    $('#uploadFirmwareError').text(error.message);
  });
}
// XXX XXX MDW Update above for Gcode



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

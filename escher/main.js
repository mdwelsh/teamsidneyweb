/* Escher main JS code */

var provider = new firebase.auth.GoogleAuthProvider();

// Image with Etch-a-Sketch background.
var backgroundImage;

window.onload = function() {
  setup();
};

// Show an error toast.
function showError(msg) {
  var notification = document.querySelector('.mdl-js-snackbar');
  notification.MaterialSnackbar.showSnackbar({
    message: msg
  });
}

// Return the current user.
function currentUser() {
  return firebase.auth().currentUser;
}

// Perform login action.
function doLogin() {
  firebase.auth().signInWithPopup(provider).then(function(result) {
  }).catch(function(error) {
    showError('Sorry, could not log you in: ' + error.message);
  });
}

// Log out.
function logout() {
  firebase.auth().signOut().then(function() {
    setup(); // Get back to initial state.
  }, function(error) {
    showError('Problem logging out: ' + error.message);
  });
}

// Toggle login buttons.
function toggleLoginState() {
  if (currentUser() == null) {
    // Not logged in yet.
    $('#login').show();
    $('#logout').hide();
  } else {
    // Already logged in.
    $('#login').hide();
    $('#logout').show();
  }
}

// Callback when signin complete.
firebase.auth().onAuthStateChanged(function(user) {
  setup();
});

// Called when there is an error reading the database.
function dbErrorCallback(err) {
  console.log('Database error:');
  console.log(err);
  // Ignore the error if not logged in yet.
  if (currentUser() != null) {
    showError(err.message);
  }
}

// Invoked whenever we need to reset the UI to a known state.
function setup() {
  // Configure UI actions.

  // Login/logout buttons.
  $('#login').off('click');
  $('#login').click(doLogin);
  $('#logout').off('click');
  $('#logout').click(logout);

  toggleLoginState();

  // File upload dialog.
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

// Paint the Etch-a-Sketch image on the given canvas.
function showEtchASketch(canvas) {
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Draw the given points on the canvas with a given linewidth.
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

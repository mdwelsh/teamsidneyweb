/* Escher main JS code */

var provider = new firebase.auth.GoogleAuthProvider();
var db = firebase.firestore();

// Image with Etch-a-Sketch background.
var backgroundImage;

// Bounding box for screen of Etch-a-Sketch (experimentally determined).
const ETCH_A_SKETCH_BBOX = {
  x: 210,
  y: 210,
  width: 900,
  height: 620,
};

window.onload = function() {
  setup();
};

function showMessage(msg) {
  var notification = document.querySelector('.mdl-js-snackbar');
  notification.MaterialSnackbar.showSnackbar({
    message: msg
  });
}

// Show an error toast.
function showError(msg) {
  showMessage(msg);
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
  // Login/logout buttons.
  $('#login').off('click');
  $('#login').click(doLogin);
  $('#logout').off('click');
  $('#logout').click(logout);

  toggleLoginState();

  // File upload dialog.

  $('#fileUploadButton').off('click');
  $('#fileUploadButton').click(function (e) {
    console.log('fileUploadButton clicked');
    console.log(e);
    uploadGcodeStart();
    $("#uploadGcode").get()[0].showModal();
  });
  $('#uploadGcodeFile').off('change');
  $('#uploadGcodeFile').change(function() {
    console.log('uploadGcodeFile changed');
    var file = $('#uploadGcodeFile')[0].files[0];
    uploadGcodeFileSelected(file);
  });
  $('#uploadGcodeConfirm').off('click');
  $('#uploadGcodeConfirm').click(function (e) {
    console.log('uploadGcodeConfirm clicked');
    uploadGcodeDoUpload();
  });
  $('#uploadGcodeCancel').off('click');
  $('#uploadGcodeCancel').click(function (e) {
    console.log('uploadGcodeCancel clicked');
    $("#uploadGcode").get()[0].close();
  });
  $('#uploadGcodeClose').off('click');
  $('#uploadGcodeClose').click(function (e) {
    console.log('uploadGcodeClose clicked');
    $("#uploadGcode").get()[0].close();
  });

  // Gcode file selector.
  $('#fileSelect').off('change');
  $('#fileSelect').change(function(e) {
    selectGcode(this.value);
  });
  // Device selector.
  $('#deviceSelect').off('change');
  $('#deviceSelect').change(function(e) {
    selectDevice(this.value);
  });

  // Control buttons.
  $('#controlLeft').off('click');
  $('#controlLeft').click(function(e) {
    controlLeftClicked();
  });
  $('#controlRight').off('click');
  $('#controlRight').click(function(e) {
    controlRightClicked();
  });
  $('#controlUp').off('click');
  $('#controlUp').click(function(e) {
    controlUpClicked();
  });
  $('#controlDown').off('click');
  $('#controlDown').click(function(e) {
    controlDownClicked();
  });
  $('#controlZoomIn').off('click');
  $('#controlZoomIn').click(function(e) {
    controlZoomInClicked();
  });
  $('#controlZoomOut').off('click');
  $('#controlZoomOut').click(function(e) {
    controlZoomOutClicked();
  });
  $('#controlHome').off('click');
  $('#controlHome').click(function(e) {
    controlHomeClicked();
  });

  // Action bttons.
  $('#drawButton').off('click');
  $('#drawButton').click(function(e) {
    drawButtonClicked();
  });
  $('#stopButton').off('click');
  $('#stopButton').click(function(e) {
    stopButtonClicked();
  });

  // Load Etch-A-Sketch background image.
  backgroundImage = new Image();
  backgroundImage.src = "EtchASketch.jpg";
  $(backgroundImage).load(function () {
    showEtchASketch($("#etchCanvas").get(0), true);
  });

  // Set up listener for Gcode metadata updates.
  db.collection("escher").doc("root").collection("gcode")
    .onSnapshot(function(snapshot) {
      snapshot.docChanges().forEach(function(change) {
        if (change.type === "added") {
          addGcodeEntry(change.doc.data());
        }
        if (change.type === "removed") {
          removeGcodeEntry(change.doc.data());
        }
     });
  });

  // Set up listener for device metadata updates.
  db.collection("escher").doc("root").collection("devices")
    .onSnapshot(function(snapshot) {
      snapshot.docChanges().forEach(function(change) {
        if (change.type === "added") {
          addDevice(change.doc.data());
        }
        if (change.type === "removed") {
          removeDevice(change.doc.data());
        }
     });
  });

  // Debugging - get user token.
  
  firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
    .then(function(idToken) {
    console.log("Got token:");
    console.log(idToken);
  }).catch(function(error) {
    console.log("Error getting token:");
    console.log(error);
  });
}

// The list of Gcode files that we know about.
var gcodeFiles = new Map();

// Called when we learn about a new Gcode file.
function addGcodeEntry(gcodeDoc) {
  gcodeFiles.set(gcodeDoc.filename, gcodeDoc);
  updateGcodeSelector();
}

// Called when a Gcode file has been deleted.
function removeGcodeEntry(gcodeDoc) {
  gcodeFiles.delete(gcodeDoc.filename);
  updateGcodeSelector();
}

// Update list of Gcode files in the selector UI.
function updateGcodeSelector() {
  var select = $("#fileSelect");
  select.empty();
  $('<option/>')
    .text('')
    .appendTo(select);
  for (var fname of gcodeFiles.keys()) {
    $('<option/>')
      .text(fname)
      .appendTo(select);
  }
}

// The list of devices thta we know about.
var devices = new Map();

// Called when we learn about a new device.
function addDevice(deviceDoc) {
  devices.set(deviceDoc.mac, deviceDoc);
  updateDeviceSelector();
}

// Called when a device has been deleted.
function removeDevice(deviceDoc) {
  devices.delete(deviceDoc.mac);
  updateDeviceSelector();
}

// Update list of devices in the selector UI.
function updateDeviceSelector() {
  var select = $("#deviceSelect");
  select.empty();
  $('<option/>')
    .text('')
    .appendTo(select);
  for (var mac of devices.keys()) {
    var ds = 'never';
    var d = devices.get(mac);
    if (d != null) {
      var ts = d.updateTime;
      if (ts != null) {
        var m = moment.unix(ts.seconds);
        ds = m.fromNow();
      }
    }
    $('<option/>')
      .text(mac + ' (last seen ' + ds + ')')
      .appendTo(select);
  }
}

// The currently selected Gcode data object.
var curGcodeData = null;

function selectGcode(fname) {
  curGcodeData = null;

  offset_left = 0;
  offset_bottom = 0;
  zoom = 1.0;

  var gcodeDoc = gcodeFiles.get(fname);
  if (gcodeDoc == null) {
    return;
  }

  $.get(gcodeDoc.url, data => {
    curGcodeData = data;
    showGcode();
    updateDrawButton();
  })
  .fail(err => {
    showError('Error fetching gcode: ' + err);
    curGcodeData = null;
    updateDrawButton();
  });
}

// The currently selected device.
var curDevice = null;

function selectDevice(value) {
  curDevice = null;

  console.log("Selected device: " + value);
  var mac = value.split(' ')[0];
  var device = devices.get(mac);
  curDevice = device;
  updateDrawButton();
}

// Update Draw button state.
function updateDrawButton() {
  var btn = $('#drawButton');
  if (curGcodeData != null && curDevice != null) {
    btn.prop('disabled', false);
  } else {
    btn.prop('disabled', true);
  }
}

// Start drawing.
function drawButtonClicked() {
  var bbox = {
    x: 0,
    y: 0,
    // TODO(mdw) - Provide interface to configure this.
    width: 900,
    height: 620,
  };
  var waypoints = parseGcode(curGcodeData);
  if (waypoints == null) {
    showError('Unable to parse Gcode!');
  }
  var rendered = render(waypoints, bbox);
  console.log('Rendered for device bbox ' + bbox + ':');
  console.log(rendered);

  startDrawing(rendered, curDevice)
    .then(() => {
      showMessage('Drawing started on ' + curDevice.mac)
    });
}

// https://stackoverflow.com/questions/19126994/what-is-the-cleanest-way-to-get-the-progress-of-jquery-ajax-request
function makeUploadXhr() {
  var xhr = new window.XMLHttpRequest();
  xhr.upload.addEventListener("progress", function(e) {
    if (e.lengthComputable) {
      var percentComplete = e.loaded / e.total;
      console.log("Upload progress " + percentComplete);
    }
  }, false);
  xhr.addEventListener("progress", function(e) {
    if (e.lengthComputable) {
      var percentComplete = e.loaded / e.total;
      console.log("Progress " + percentComplete);
    }
  }, false);
  return xhr;
}

function startDrawing(points, device) {
  console.log('Starting drawing of ' + points.length + ' points on ' +
    device.mac + ' with ip ' + device.ip);

  var controlMsg = 'START\n';
  points.forEach(function(p) {
    controlMsg += 'MOVE ' + Math.floor(p.x) + ' ' + Math.floor(p.y) + '\n';
  });
  controlMsg += 'END\n';

  // Fake a file upload via FormData:
  // https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
  // This is necessary because we have great built-in support for large file uploads
  // on the ESP32, so we want to make use of that.

  var formData = new FormData();
  var action = '/upload';
  var blob = new Blob([controlMsg], { type: "text/plain"});
  formData.append("file", blob, "cmddata.txt");

  var url = 'http://' + device.ip + '/upload';

  return $.ajax({
    xhr: makeUploadXhr,
    url: url,
    data: formData,
    type: 'POST',
    contentType: false,
    processData: false,
  })
  .done(function() {
    console.log('Ajax done!');
    showMessage('Uploaded command file to device at ' + device.ip);
  })
  .fail(function() {
    console.log('Ajax fail!');
    showError('Unable to upload command file');
  });
}

// Show the given GCode on the canvas.
function previewGcode(gcodeData, canvas) {
  var waypoints = parseGcode(gcodeData);
  if (waypoints.length == 0) {
    console.log('Error: Cannot parse Gcode');
    showError('Error: Cannot parse Gcode');
    return;
  }
  console.log('Parsed ' + waypoints.length + ' waypoints');

  showEtchASketch(canvas, true);
  etch(waypoints, canvas, ETCH_A_SKETCH_BBOX, 1);
}


// Code for control buttons.
var offset_left = 0;
var offset_bottom = 0;
var zoom = 1.0;

// Called when control buttons are clicked.
function controlLeftClicked() {
  offset_left -= 10;
  showGcode();
}
function controlRightClicked() {
  offset_left += 10;
  showGcode();
}
function controlUpClicked() {
  offset_bottom += 10;
  showGcode();
}
function controlDownClicked() {
  offset_bottom -= 10;
  showGcode();
}
function controlZoomInClicked() {
  zoom += 0.1;
  showGcode();
}
function controlZoomOutClicked() {
  zoom -= 0.1;
  showGcode();
}
function controlHomeClicked() {
  offset_left = 0;
  offset_bottom = 0;
  zoom = 1.0;
  showGcode();
}

function showGcode() {
  previewGcode(curGcodeData, $("#etchCanvas").get(0));
}


var uploadedGcode = null;
var uploadedGcodeUrl = null;

// Called when Gcode upload dialog is opened.
function uploadGcodeStart() {
  uploadedGcode = null;
  uploadedGcodeUrl = null;
  $('#uploadGcodeConfirm').prop('disabled', true);
  $('#uploadGcodeSelectedFile').empty();
  $('#uploadGcodeError').empty();
  $('#uploadGcodeLink').empty();
  $('#uploadGcodeSpinner').hide();
  showEtchASketch($("#previewCanvas").get(0), true);
}

// Called when Gcode file selector changes.
function uploadGcodeFileSelected(file) {
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

  var enc = new TextDecoder("utf-8");
  var gcode = enc.decode(data);

  // Parse and preview Gcode.
  previewGcode(gcode, $("#previewCanvas").get(0));
  $('#uploadGcodeConfirm').prop('disabled', false);
}

// Called when upload has been confirmed by user.
function uploadGcodeDoUpload() {
  // Start the upload.
  $('#uploadGcodeSpinner').show();

  var fname = uploadedGcode.name;
  console.log('Starting upload of ' + fname);
  var storageRef = firebase.storage().ref();
  var uploadRef = storageRef.child(fname);
  uploadRef.put(uploadedGcode).then(function(snapshot) {
    // Upload done.
    console.log('Upload complete');
    $('#uploadGcodeSpinner').hide();
    // Add link.
    uploadRef.getDownloadURL().then(function(url) {
      // Add a DB entry with metadata about the uploaded file.
      db.collection("escher").doc("root").collection("gcode").add({
        dateUploaded: firebase.firestore.FieldValue.serverTimestamp(),
        filename: fname,
        url: url,
      }).then(function(docRef) {
        // Close the dialog.
        console.log('Done with upload, closing dialog');
        $("#uploadGcode").get()[0].close();
        showMessage('Uploaded ' + fname);
      }).catch(function(error) {
        // Close the dialog.
        console.log('Upload error, closing dialog');
        $("#uploadGcode").get()[0].close();
        showError('Error uploading Gcode: ' + error.message);
      });
    });
  });
}

// Paint the Etch-a-Sketch image on the given canvas.
function showEtchASketch(canvas, frame) {
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (frame) {
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#bebbb6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Render the given points into a set of waypoints contained within 
// the given bounding box.
function render(points, bbox) {
  ret = []
  var scaled = scaleToBbox(points, bbox);
  scaled.forEach(function(elem) {
    var x = elem.x;
    var y = elem.y;

    var tx = zoom * (x + bbox.x + offset_left);
    var ty = zoom * (y + bbox.y + offset_bottom);

    if (tx < bbox.x) {
      tx = bbox.x;
    }
    if (tx > bbox.x + bbox.width) {
      tx = bbox.x + bbox.width;
    }
    if (ty < bbox.y) {
      ty = bbox.y;
    }
    if (ty > bbox.y + bbox.height) {
      ty = bbox.y + bbox.height;
    }

    ret.push({x: tx, y: ty});
  });
  return ret;
}

// Draw the given points on the canvas with a given linewidth.
function etch(points, canvas, bbox, lineWidth) {
  console.log('Etching ' + points.length +
      ' points onto bbox ' + JSON.stringify(bbox));

  var ctx = canvas.getContext("2d");

  // Debugging - draw bounding box.
  //ctx.strokeStyle = 'blue';
  //ctx.lineWidth = 5;
  //ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
  
  var rendered = render(points, bbox);

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = lineWidth;
  // Start at origin.
  ctx.moveTo(bbox.x, (bbox.y + bbox.height));

  rendered.forEach(function(elem) {
    var x = elem.x;
    var y = elem.y;

    // Flip the y-axis.
    y = bbox.height - (y - bbox.y) + bbox.y;
    ctx.lineTo(x, y);
  });
  ctx.stroke();

  console.log('Etching done');
}

/* Escher main JS code */

var provider = new firebase.auth.GoogleAuthProvider();
var db = firebase.firestore();

// Show/hide appropriate section of UI based on login state.
firebase.auth().onAuthStateChanged(firebaseUser => {
  showUI();
});

// Update the UI to reflect the current state.
function showUI() {
  if (currentUser() != null) {
    showAdminUI();
  } else {
    showNormalUI();
  }
  // Update the current device info.
  if (curDevice != null) {
    $('#currentDevice').text(curDevice.mac);
  }
}

// Image with Etch-a-Sketch background.
var backgroundImage;

// Bounding box for screen of virtual Etch-a-Sketch.
const VIRTUAL_ETCH_A_SKETCH_BBOX = {
  x: 210,
  y: 210,
  width: 900,
  height: 620,
};

// Bounding box for physical Etch-a-Sketch.
// TODO(mdw): Provide an interface to configure this.
const PHYSICAL_ETCH_A_SKETCH_BBOX = {
  x: 0,
  y: 0,
  width: 720,
  height: 400,
};

window.onload = function () {
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

// Perform admin login action.
function doAdminLogin() {
  firebase.auth().signInWithPopup(provider).then(function (result) {
  }).catch(function (error) {
    showError('Sorry, could not log you in: ' + error.message);
  });
}

// Log out.
function logout() {
  firebase.auth().signOut().then(function () {
    showUI();
  }, function (error) {
    showError('Problem logging out: ' + error.message);
  });
}

// Show UI when admin is logged in.
function showAdminUI() {
  $('#adminLogin').hide();
  $('#logout').show();

  // Hide the login tab.
  $('#login-tab-button').addClass('hidden');
  $('#etch-tab-button').removeClass('hidden');
  $('#files-tab-button').removeClass('hidden');
  $('#about-tab-button').removeClass('hidden');

  // Make the etch tab active.
  $('#login-tab-button').removeClass('is-active');
  $('#etch-tab-button').addClass('is-active');
  $('#files-tab-button').removeClass('is-active');
  $('#about-tab-button').removeClass('is-active');

  $('#scroll-tab-login').removeClass('is-active');
  $('#scroll-tab-etch').addClass('is-active');
  $('#scroll-tab-files').removeClass('is-active');
  $('#scroll-tab-about').removeClass('is-active');
}

// Show normal UI.
function showNormalUI() {
  $('#adminLogin').show();
  $('#logout').hide();

  // If we don't have a current device selected...
  if (curDevice == null) {
    showNoDeviceUI();
  } else {
    showDeviceUI();
  }
}

// Show normal UI when no device selected.
function showNoDeviceUI() {
  // Hide all tabs except for login and about.
  $('#login-tab-button').removeClass('hidden');
  $('#etch-tab-button').addClass('hidden');
  $('#files-tab-button').addClass('hidden');
  $('#about-tab-button').removeClass('hidden');

  // Make the login tab active.
  $('#login-tab-button').addClass('is-active');
  $('#etch-tab-button').removeClass('is-active');
  $('#files-tab-button').removeClass('is-active');
  $('#about-tab-button').removeClass('is-active');

  $('#scroll-tab-login').addClass('is-active');
  $('#scroll-tab-etch').removeClass('is-active');
  $('#scroll-tab-files').removeClass('is-active');
  $('#scroll-tab-about').removeClass('is-active');
}

// Show normal UI when device selected.
function showDeviceUI() {
  // Show non-admin tabs.
  $('#login-tab-button').addClass('hidden');
  $('#etch-tab-button').removeClass('hidden');
  $('#files-tab-button').removeClass('hidden');
  $('#about-tab-button').removeClass('hidden');

  // Make the etch tab active.
  $('#login-tab-button').removeClass('is-active');
  $('#etch-tab-button').addClass('is-active');
  $('#files-tab-button').removeClass('is-active');
  $('#about-tab-button').removeClass('is-active');

  $('#scroll-tab-login').removeClass('is-active');
  $('#scroll-tab-etch').addClass('is-active');
  $('#scroll-tab-files').removeClass('is-active');
  $('#scroll-tab-about').removeClass('is-active');
}

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
  $('#adminLogin').off('click');
  $('#adminLogin').click(doAdminLogin);
  $('#logout').off('click');
  $('#logout').click(logout);

  // Lists.
  $("#fileList").empty();
  $("#deviceList").empty();

  // Access code entry.
  $('#accessCode').off('input');

  $('#accessCode').on('input', function () {
    var code = $('#accessCode').val();
    accessCodeChanged(code);
  });

  // File upload dialog.
  $('#fileUploadButton').off('click');
  $('#fileUploadButton').click(function (e) {
    console.log('fileUploadButton clicked');
    console.log(e);
    uploadGcodeStart();
    $("#uploadGcode").get()[0].showModal();
  });
  $('#uploadGcodeFile').off('change');
  $('#uploadGcodeFile').change(function () {
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

  // Etch control dialog.
  $('#etchControlStart').off('click');
  $('#etchControlStart').click(function (e) {
    etchControlStartClicked();
  });
  $('#etchControlCancel').off('click');
  $('#etchControlCancel').click(function (e) {
    $("#etchControl").get()[0].close();
  });
  $('#etchControlClose').off('click');
  $('#etchControlClose').click(function (e) {
    $("#etchControl").get()[0].close();
  });

  // Gcode file selector.
  $('#fileSelect').off('change');
  $('#fileSelect').change(function (e) {
    selectGcode(this.value);
  });
  // Device selector.
  $('#deviceSelect').off('change');
  $('#deviceSelect').change(function (e) {
    deviceSelectChanged(this.value);
  });

  // Control buttons.
  $('#controlLeft').off('click');
  $('#controlLeft').click(function (e) {
    controlLeftClicked();
  });
  $('#controlRight').off('click');
  $('#controlRight').click(function (e) {
    controlRightClicked();
  });
  $('#controlUp').off('click');
  $('#controlUp').click(function (e) {
    controlUpClicked();
  });
  $('#controlDown').off('click');
  $('#controlDown').click(function (e) {
    controlDownClicked();
  });
  $('#controlZoomIn').off('click');
  $('#controlZoomIn').click(function (e) {
    controlZoomInClicked();
  });
  $('#controlZoomOut').off('click');
  $('#controlZoomOut').click(function (e) {
    controlZoomOutClicked();
  });
  $('#controlHome').off('click');
  $('#controlHome').click(function (e) {
    controlHomeClicked();
  });

  // Action bttons.
  $('#loginButton').off('click');
  $('#loginButton').click(function (e) {
    loginButtonClicked();
  });
  $('#etchButton').off('click');
  $('#etchButton').click(function (e) {
    etchButtonClicked();
  });
  $('#stopButton').off('click');
  $('#stopButton').click(function (e) {
    stopButtonClicked();
  });

  // Load Etch-A-Sketch background image.
  backgroundImage = new Image();
  backgroundImage.src = "EtchASketch.jpg";
  $(backgroundImage).load(function () {
    showEtchASketch($("#etchCanvas").get(0), true);
    showEtchASketch($("#loginCanvas").get(0), true);
    showLoginPreview();
  });

  // Set up listener for Gcode metadata updates.
  db.collection("escher").doc("root").collection("gcode")
    .onSnapshot(function (snapshot) {
      snapshot.docChanges().forEach(function (change) {
        if (change.type === "added") {
          addGcodeEntry(change.doc.data());
        }
        if (change.type === "removed") {
          removeGcodeEntry(change.doc.data());
        }
      });
    });

  // Set up listener for device metadata updates, only if we're an admin.
  if (currentUser() != null) {
    db.collection("escher").doc("root").collection("secret")
      .onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === "added") {
            addDevice(change.doc);
          }
          if (change.type === "removed") {
            removeDevice(change.doc);
          }
        });
      });
  }
}

// Login tab and access code entry.

function accessCodeChanged(code) {
  $("#accessCodeError").hide();
  if (code.length > 0) {
    $("#loginButton").prop('disabled', false);
  } else {
    $("#loginButton").prop('disabled', true);
  }
}

function loginButtonClicked() {
  var code = $('#accessCode').val();
  findDevice(code);
}

// The list of Gcode files that we know about.
var gcodeFiles = new Map();

// Called when we learn about a new Gcode file.
function addGcodeEntry(gcodeDoc) {
  gcodeFiles.set(gcodeDoc.filename, gcodeDoc);
  updateGcodeSelector();
  addGcodeCard(gcodeDoc, gcodeFiles.size);
}

// Called when a Gcode file has been deleted.
function removeGcodeEntry(gcodeDoc) {
  gcodeFiles.delete(gcodeDoc.filename);
  updateGcodeSelector();
  updateGcodeList();
}

// Refresh the entire Gcode list. Expensive.
function updateGcodeList() {
  var container = $("#fileList");
  container.empty();
  var index = 0;
  for (var gcode of gcodeFiles.values()) {
    addGcodeCard(gcode, index);
    index++;
  }
}

function addGcodeCard(gcode, index) {
  // Create UI card.
  var container = $('#fileList');
  var cardline = $('<div/>')
    .addClass('gcode-line')
    .appendTo(container);
  gcode.cardElem = cardline;

  var card = $('<div/>')
    .addClass('gcode-card')
    .addClass('mdl-card')
    .addClass('mdl-shadow--2dp')
    .attr('id', 'gcode-' + index)
    .appendTo(cardline);
  var cardtitle = $('<div/>')
    .attr('id', 'gcode-title')
    .addClass('mdl-card__title')
    .addClass('mdl-card--expand')
    .appendTo(card);
  var cardbody = $('<div/>')
    .addClass('gcode-body')
    .addClass('mdl-card__supporting-text')
    .appendTo(card);
  var cardactions = $('<div/>')
    .addClass('gcode-actions')
    .addClass('mdl-card__actions')
    .addClass('mdl-card--border')
    .appendTo(card);

  // Card title (preview).
  var previewArea = $('<div/>')
    .addClass('container')
    .addClass('gcode-preview')
    .appendTo(cardtitle);
  var previewCanvas = $('<canvas/>')
    .attr('width', 1326)
    .attr('height', 1081)
    .addClass('responsive')
    .appendTo(previewArea);

  // Do the preview.
  $.get(gcode.url, data => {
    previewGcode(data, previewCanvas.get(0), 0, 0, 1.0, true);
  });

  // Card body (supporting text).
  var tl = $('<div/>')
    .addClass('gcode-title-line')
    .appendTo(cardbody);
  $('<div/>')
    .addClass('gcode-filename')
    .text(gcode.filename)
    .appendTo(tl);


  // Card actions.
  $('<a/>')
    .addClass('mdl-button')
    .addClass('mdl-button--primary')
    .addClass('mdl-js-button')
    .addClass('mdl-button--raised')
    .addClass('mdl-js-ripple-effect')
    .attr('href', gcode.url)
    .text('Download')
    .appendTo(cardactions);

  // Needed for MD Lite to kick in.
  componentHandler.upgradeElements(card.get());
}

// Update list of Gcode files in the file UI.
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

// The list of devices that we know about.
var devices = new Map();

// Called when we learn about a new device.
function addDevice(deviceDoc) {
  devices.set(deviceDoc.id, deviceDoc.data());
  updateDeviceSelector();
}

// Called when a device has been deleted.
function removeDevice(deviceDoc) {
  devices.delete(deviceDoc.id);
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

// Show the static Escher logo on the login canvas.
function showLoginPreview() {
  $.get('/escher-logo.gcode', data => {
    previewGcode(data, $("#loginCanvas").get(0), 0, 0, 1.0, true);
  });
}

// The currently selected Gcode data object.
var curGcodeData = null;
// The currently selected Gcode filename.
var curGcodeFname = null;

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
    curGcodeFname = fname;
    showGcode();
    updateEtchState();
  }).fail(err => {
    showError('Error fetching gcode: ' + err);
    curGcodeData = null;
    updateEtchState();
  });
}

// The currently selected device.
var curDevice = null;
var curDeviceID = null;
var curDeviceListener = null;

// Callback when device selector changes value.
function deviceSelectChanged(value) {
  console.log("Selected device: " + value);
  var mac = value.split(' ')[0];
  selectDevice(mac, devices.get(mac));
  updateEtchState();
}

// Look for a device checkin using the given secret.
function findDevice(accessCode) {
  db.collection("escher").doc("root").collection('secret').doc(accessCode).collection('devices').get()
    .then((result) => {
      if (result.docs == null || result.docs.empty) {
        showMessage("Bad access code.");
        return;
      }
      // If more than one device is using the same access code, we arbitrarily use the
      // one with the newest checkin time.
      var chosenDoc = null;
      result.docs.forEach((d) => {
        if (chosenDoc == null || d.data().updateTime > newest) {
          chosenDoc = d;
        }
      });

      if (chosenDoc == null) {
        // Nothing found at this location.
        showMessage("Bad access code.");
        return;
      }

      selectDevice(chosenDoc.id, chosenDoc.data());
      showMessage("Selected device: " + chosenDoc.id);
      showUI();
      updateEtchState();

      // Subscribe to status updates on this device entry.
      curDeviceListener = chosenDoc.ref.onSnapshot((snapshot) => {
        updateEtchState();
      });
    });
}

// Select the given device by MAC.
function selectDevice(mac, device) {
  console.log("Selecting device: " + mac);
  // Unsubscribe to state changes on old device.
  if (curDeviceListener != null) {
    curDeviceListener();
    curDeviceListener = null;
  }
  curDeviceID = mac;
  curDevice = device;
}

// Update UI state associated with the state of the currently-selected device.
function updateEtchState() {
  var ebtn = $('#etchButton');
  var sbtn = $('#stopButton');

  // By default no buttons are enabled.
  var etchButtonDisabled = true;
  var stopButtonDisabled = true;

  // If no device is selected, just set the state now.
  if (curDevice == null) {
    ebtn.prop('disabled', etchButtonDisabled);
    sbtn.prop('disabled', stopButtonDisabled);
    $("#currentDevice").text("no device selected");
    return;
  }

  var deviceState = curDevice.status;
  var ts = curDevice.updateTime;
  var ds = "never";
  if (ts != null) {
    var m = moment.unix(ts.seconds);
    ds = m.fromNow();
    if ((Date.now()/1000) - ts.seconds < 60*60) {
      $('#currentDeviceWarning').addClass('hidden');
    } else {
      $('#currentDeviceWarning').removeClass('hidden');
    }
  } else {
    $('#currentDeviceWarning').removeClass('hidden');
  }
  $("#currentDeviceState").text(deviceState + ", last seen " + ds);

  if (deviceState == "idle" && curGcodeData != null) {
    etchButtonDisabled = false;
    stopButtonDisabled = true;
  } else if (deviceState == "etching") {
    etchButtonDisabled = true;
    stopButtonDisabled = false;
  }
  ebtn.prop('disabled', etchButtonDisabled);
  sbtn.prop('disabled', stopButtonDisabled);
}

// Called when Etch button is clicked.
function etchButtonClicked() {
  // Show the etch control dialog.
  $("#etchControl").get(0).showModal();
}

// The URL of the current command file to be etched.
var curEscherFileURL = null;

// Called when etch control start button is clicked.
function etchControlStartClicked() {
  if (curDevice == null) {
    showError('No device selected');
    return;
  }
  if (curEscherFileURL == null) {
    showError('No Gcode ready for etching');
    return;
  }

  // TODO(mdw): Push control message to device to start etching.
  $("#etchControl").get()[0].close();
  showMessage('Etching started!');
  updateEtchState();
}

// Called when stop button is clicked.
function stopButtonClicked() {
  if (curDevice == null) {
    showError('No device selected');
    return;
  }

  // TODO(mdw): Push control message to stop etching.

  showMessage('Etching stopped!');
  updateEtchState();
}

// Show the given GCode on the canvas.
function previewGcode(gcodeData, canvas, offsetLeft, offsetBottom, zoomLevel,
  showFrame) {
  var waypoints = parseGcode(gcodeData);
  if (waypoints.length == 0) {
    console.log('Error: Cannot parse Gcode');
    showError('Error: Cannot parse Gcode');
    return;
  }
  if (showFrame) {
    showEtchASketch(canvas, true);
  }
  etch(waypoints, canvas, VIRTUAL_ETCH_A_SKETCH_BBOX, 1, offsetLeft,
    offsetBottom, zoomLevel);
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
  previewGcode(curGcodeData, $("#etchCanvas").get(0), offset_left, offset_bottom, zoom, true);
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
  reader.onloadend = function () {
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
  previewGcode(gcode, $("#previewCanvas").get(0), 0, 0, 1.0, true);
  $('#uploadGcodeConfirm').prop('disabled', false);
}

// Called when upload has been confirmed by user.
function uploadGcodeDoUpload() {
  // Start the upload.
  $('#uploadGcodeSpinner').show();

  var fname = uploadedGcode.name;
  console.log('Starting upload of ' + fname);
  var storageRef = firebase.storage().ref();
  var uploadRef = storageRef.child("escher/gcode/" + fname);
  uploadRef.put(uploadedGcode).then(function (snapshot) {
    // Upload done.
    console.log('Upload complete');
    $('#uploadGcodeSpinner').hide();
    // Add link.
    uploadRef.getDownloadURL().then(function (url) {
      // Add a DB entry with metadata about the uploaded file.
      db.collection("escher").doc("root").collection("gcode").add({
        dateUploaded: firebase.firestore.FieldValue.serverTimestamp(),
        filename: fname,
        url: url,
      }).then(function (docRef) {
        // Close the dialog.
        console.log('Done with upload, closing dialog');
        $("#uploadGcode").get()[0].close();
        showMessage('Uploaded ' + fname);
      }).catch(function (error) {
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
function render(points, bbox, offsetLeft, offsetBottom, zoomLevel) {
  var ret = []
  var last = { x: null, y: null };
  points.forEach(function (elem) {
    var x = elem.x;
    var y = elem.y;
    var tx = (zoomLevel * x) + (bbox.x + offsetLeft);
    var ty = (zoomLevel * y) + (bbox.y + offsetBottom);

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
    var pt = { x: tx, y: ty };
    // Eliminate duplicates.
    if (pt.x != last.x || pt.y != last.y) {
      ret.push({ x: tx, y: ty });
      last = pt;
    }
  });
  return ret;
}

// Draw the given points on the canvas with a given linewidth.
function etch(waypoints, canvas, bbox, lineWidth, offsetLeft, offsetBottom, zoomLevel) {
  var ctx = canvas.getContext("2d");

  // Debugging - draw bounding box on canvas.
  //ctx.strokeStyle = 'blue';
  //ctx.lineWidth = 5;
  //ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);

  // Translate the gCode object so it exactly fits into the given bbox.
  var minx = Math.min(...waypoints.map(wp => wp.x));
  var maxx = Math.max(...waypoints.map(wp => wp.x));
  var miny = Math.min(...waypoints.map(wp => wp.y));
  var maxy = Math.max(...waypoints.map(wp => wp.y));

  // Translate gCode object to lower left corner.
  waypoints.forEach(function(pt) {
    pt.x = pt.x - minx;
    pt.y = pt.y - miny;
  });

  // Calculate scaling factor and offsets.
  var dx = maxx - minx;
  var dy = maxy - miny;
  var scale;
  var offset_x;
  var offset_y;
  bbox_ratio = bbox.width/bbox.height;
  if ((dx/bbox_ratio) > dy) {
    scale = bbox.width / dx;
    offset_x = 0.0;
    offset_y = (bbox.height - (scale * dy)) / 2.0;
  } else {
    scale = bbox.height / dy;
    offset_x = (bbox.width - (scale * dx)) / 2.0;
    offset_y = 0.0;
  }

  // Debugging - draw bounding box on canvas.
  //ctx.strokeStyle = 'green';
  //ctx.lineWidth = 5;
  //ctx.strokeRect(bbox.x + offset_x, bbox.y + offset_y, dx * scale, dy * scale);

  var rendered = render(waypoints, bbox, offsetLeft + offset_x, offsetBottom + offset_y, zoomLevel * scale);
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = lineWidth;
  // Start at origin.
  ctx.moveTo(bbox.x, (bbox.y + bbox.height));

  rendered.forEach(function (elem) {
    var x = elem.x;
    var y = elem.y;

    // Flip the y-axis.
    y = bbox.height - (y - bbox.y) + bbox.y;
    ctx.lineTo(x, y);
  });
  ctx.stroke();
}

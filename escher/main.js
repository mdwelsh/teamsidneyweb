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
  $('#login-tab-button').removeClass('hidden');

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
  $('#pauseButton').off('click');
  $('#pauseButton').click(function (e) {
    pauseButtonClicked();
  });

  // Load Etch-A-Sketch background image.
  backgroundImage = new Image();
  backgroundImage.src = "EtchASketch.jpg";
  $(backgroundImage).load(function () {
    showEtchASketch($("#etchCanvas").get(0), true);
    showEtchASketch($("#loginCanvas").get(0), true);
    showLoginPreview();
  });

  // XXX XXX XXX MDW STOPPED HERE.
  // - Need to make discovery of gCode files tied to entering a correct access code
  //    (or being logged in). For now, we can make them public.
  // - Need to implement TOTA protocol for device discovery.

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

  // Set up listener for device metadata updates.
  db.collection("escher").doc("root").collection("devices")
    .onSnapshot(function (snapshot) {
      snapshot.docChanges().forEach(function (change) {
        if (change.type === "added") {
          addDevice(change.doc.data());
        }
        if (change.type === "removed") {
          removeDevice(change.doc.data());
        }
      });
    });
}

// Login tab and access code entry.

function accessCodeChanged(code) {
  $("#accessCodeError").hide();
  // Only allow login on 6-digit entry.
  if (code.length == 6) {
    $("#loginButton").prop('disabled', false);
  } else {
    $("#loginButton").prop('disabled', true);
  }
}

function loginButtonClicked() {
  var code = $('#accessCode').val();
  if (code.length != 6) {
    $("#accessCodeError").text("Code must be 6 characters");
    $("#accessCodeError").show();
    return;
  }

  // TODO(mdw): Implement actual TOTA code check.
  if (code != "abc123") {
    $("#accessCodeError").text("Invalid access code!");
    $("#accessCodeError").show();
    return;
  }

  // TODO(mdw): Implement actual device info fetch.
  selectDevice("30:AE:A4:20:A0:A4");
  showUI();
  updateEtchState();
}

// The list of Gcode files that we know about.
var gcodeFiles = new Map();

// Called when we learn about a new Gcode file.
function addGcodeEntry(gcodeDoc) {
  console.log("MDW: addGcodeEntry called");
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

// Show the static Escher logo on the login canvas.
function showLoginPreview() {
  $.get('/escher-logo.gcode', data => {
    previewGcode(data, $("#loginCanvas").get(0), 80, 230, 0.9, true);
  });
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
    updateEtchState();
  })
    .fail(err => {
      showError('Error fetching gcode: ' + err);
      curGcodeData = null;
      updateEtchState();
    });
}

// The currently selected device.
var curDevice = null;

// Callback when device selector changes value.
function deviceSelectChanged(value) {
  curDevice = null;
  console.log("Selected device: " + value);
  var mac = value.split(' ')[0];
  selectDevice(device);
  updateEtchState();
}

// Select the given device by MAC.
function selectDevice(mac) {
  console.log("Selecting device: " + mac);
  curDevice = devices.get(mac);
  console.log("curDevice is now " + curDevice);
}

function pingDevice(ip) {
  var url = 'http://' + ip + '/ping';
  return $.get(url);
}

// Update Etch, Pause, and Stop button states.
function updateEtchState() {
  var ebtn = $('#etchButton');
  var pbtn = $('#pauseButton');
  var sbtn = $('#stopButton');

  // By default no buttons are enabled.
  var etchButtonDisabled = true;
  var pauseButtonDisabled = true;
  var stopButtonDisabled = true;

  // If no device is selected, just set the state now.
  if (curDevice == null) {
    ebtn.prop('disabled', etchButtonDisabled);
    pbtn.prop('disabled', pauseButtonDisabled);
    sbtn.prop('disabled', stopButtonDisabled);
    $("#currentDevice").text("no device selected");
    return;
  }

  console.log("Pinging device " + curDevice.ip);
  $("#currentDeviceState").text("(pinging...)");
  var xhr = pingDevice(curDevice.ip);
  xhr
    .done(function (data) {
      console.log('Got back ping data:');
      console.log(data);
      $("#currentDeviceState").text("(" + data.state + ")");
      // Can't start etching when already doing it.
      if (data.state == "etching" || data.state == "paused") {
        etchButtonDisabled = true;
        pauseButtonDisabled = false;
        stopButtonDisabled = false;
      }
      if (data.state == "paused") {
        pbtn.html('Resume');
      } else {
        pbtn.html('Pause');
      }
    })
    .fail(function (data) {
      console.log('Ping failed:');
      console.log(data);
      $("#currentDeviceState").text("(not responding)");
    })
    .always(function () {
      ebtn.prop('disabled', etchButtonDisabled);
      pbtn.prop('disabled', pauseButtonDisabled);
      sbtn.prop('disabled', stopButtonDisabled);
    });
}

// Called when Etch button is clicked.
function etchButtonClicked() {
  // Show the etch control dialog.
  var btn = $('#etchControlStart');
  btn.prop('disabled', true);
  $('#etchControlSpinner').show();
  $('#etchUploadingMessage').show();
  $('#etchReadyMessage').hide();
  $("#etchControl").get(0).showModal();

  // Render the Gcode to commands for the Etch-a-Sketch.
  var bbox = PHYSICAL_ETCH_A_SKETCH_BBOX;
  var waypoints = parseGcode(curGcodeData);
  if (waypoints == null) {
    showError('Unable to parse Gcode!');
  }
  var rendered = render(waypoints, bbox, offset_left, offset_bottom, zoom);

  // Upload the command file.
  uploadCommandFile(rendered, curDevice).then(() => {
    btn.prop('disabled', false);
    $('#etchControlSpinner').hide();
    $('#etchUploadingMessage').hide();
    $('#etchReadyMessage').show();
    $("#currentDeviceState").text("(ready to etch)");
  });
}

// https://stackoverflow.com/questions/19126994/what-is-the-cleanest-way-to-get-the-progress-of-jquery-ajax-request
function makeUploadXhr() {
  var xhr = new window.XMLHttpRequest();
  xhr.upload.addEventListener("progress", function (e) {
    if (e.lengthComputable) {
      var percentComplete = e.loaded / e.total;
      console.log("Upload progress " + percentComplete);
    }
  }, false);
  xhr.addEventListener("progress", function (e) {
    if (e.lengthComputable) {
      var percentComplete = e.loaded / e.total;
      console.log("Progress " + percentComplete);
    }
  }, false);
  return xhr;
}

function uploadCommandFile(points, device) {
  console.log('Starting drawing of ' + points.length + ' points on ' +
    device.mac + ' with ip ' + device.ip);

  var controlMsg = 'START\n';
  points.forEach(function (p) {
    controlMsg += 'MOVE ' + Math.floor(p.x) + ' ' + Math.floor(p.y) + '\n';
  });
  controlMsg += 'END\n';

  console.log('Uploading ' + controlMsg.length + ' bytes to device');

  // Fake a file upload via FormData:
  // https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
  // This is necessary because we have great built-in support for large file uploads
  // on the ESP32, so we want to make use of that.

  var formData = new FormData();
  var action = '/upload';
  var blob = new Blob([controlMsg], { type: "text/plain" });
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
    .done(function () {
      console.log('Ajax done!');
      showMessage('Uploaded image to device at ' + device.ip);
    })
    .fail(function () {
      console.log('Ajax fail!');
      showError('Unable to upload image to device');
      $("#etchControl").get()[0].close();
    });
}

// Called when etch control start button is clicked.
function etchControlStartClicked() {
  if (curDevice == null) {
    showError('No device selected');
    return;
  }
  var url = 'http://' + curDevice.ip + '/etch';
  $.get(url, data => {
    $("#etchControl").get()[0].close();
    showMessage('Etching started!');
  })
    .fail(err => {
      $("#etchControl").get()[0].close();
      showError('Error starting etch: ' + err);
    })
    .always(function () {
      updateEtchState();
    });
}

// Called when pause button is clicked.
function pauseButtonClicked() {
  if (curDevice == null) {
    showError('No device selected');
    return;
  }

  var state = $("#pauseButton").html();
  var url;
  var action;
  if (state == "Pause") {
    url = 'http://' + curDevice.ip + '/pause';
    action = 'Etching paused!';
  } else {
    url = 'http://' + curDevice.ip + '/resume';
    action = 'Etching resumed!';
  }
  $.get(url, data => {
    showMessage(action);
  })
    .fail(err => {
      console.log('Got error on pause/resume:');
      console.log(err);
      showError('Error: ' + err.responseText);
    })
    .always(function () {
      updateEtchState();
    });
}

// Called when stop button is clicked.
function stopButtonClicked() {
  if (curDevice == null) {
    showError('No device selected');
    return;
  }
  var url = 'http://' + curDevice.ip + '/stop';
  $.get(url, data => {
    showMessage('Etching stopped!');
  })
    .fail(err => {
      console.log('Got error stopping:');
      console.log(err);
      showError('Error stopping: ' + err.responseText);
    })
    .always(function () {
      updateEtchState();
    });
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
  previewGcode(curGcodeData, $("#etchCanvas").get(0),
    offset_left, offset_bottom, zoom, true);
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
  var uploadRef = storageRef.child(fname);
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
  var scaled = scaleToBbox(points, bbox);
  scaled.forEach(function (elem) {
    var x = elem.x;
    var y = elem.y;

    var tx = zoomLevel * (x + bbox.x + offsetLeft);
    var ty = zoomLevel * (y + bbox.y + offsetBottom);

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
    if (pt.x != last.x || pt.y != last.y) {
      ret.push({ x: tx, y: ty });
      last = pt;
    }
  });
  return ret;
}

// Draw the given points on the canvas with a given linewidth.
function etch(points, canvas, bbox, lineWidth, offsetLeft, offsetBottom,
  zoomLevel) {
  var ctx = canvas.getContext("2d");

  // Debugging - draw bounding box.
  //ctx.strokeStyle = 'blue';
  //ctx.lineWidth = 5;
  //ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);

  var rendered = render(points, bbox, offsetLeft, offsetBottom, zoomLevel);

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

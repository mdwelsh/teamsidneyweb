/* Team Sidney Light Controller - Main Javascript code */

/* Set to true to stub out authentication code. */
var FAKE_AUTH = false;
var SIDNEY_PHOTO = "http://howtoprof.com/profsidney.jpg";
var provider = new firebase.auth.GoogleAuthProvider();
var fakeUser = null;

var totalPoints = null;

// Initialize click handlers.
$('#login').off('click');
$('#login').button().click(doLogin);
$('#userinfo').off('click');
$('#userinfo').click(logout);

setup();

// Set up initial UI elements.
function setup() {
  if (currentUser() == null) {
    // Not logged in yet.
    showLoginButton();
    countRef = null;
    logRef = null;

  } else {
    showFullUI();

    var countRef = firebase.database().ref('stats/count');
    var logRef = firebase.database().ref('log/');
    /* Callback when count is updated */
    countRef.on('value', countUpdated, dbErrorCallback);
    logRef.on('child_added', newLogEntry, dbErrorCallback);
  }
}

function currentUser() {
  if (FAKE_AUTH) {
    return fakeUser;
  } else {
    return firebase.auth().currentUser;
  }
}

// Called when there is an error reading the database.
function dbErrorCallback(err) {
  // Ignore the error if not logged in yet.
  if (currentUser() != null) {
    showError($('#dberror'), err.message);
  }
}

// Clear error.
function clearError(elem) {
  elem.text('');
  elem.hide();
}

// Show error.
function showError(elem, msg) {
  elem.text(msg);
  elem.show();
}

// Show the login button.
function showLoginButton() {
  $('#postlogin').hide();
  $('#userinfo').hide();
  $('#login').show();
}

function doLogin() {
  if (FAKE_AUTH) {
    fakeUser = {
      displayName: "Fakey McFakerson",
      photoURL: SIDNEY_PHOTO,
      email: "fake@teamsidney.com",
    };
    showFullUI();
  } else {
    firebase.auth().signInWithPopup(provider).then(function(result) {
    }).catch(function(error) {
      showError($('#loginerror'),
                'Sorry, could not log you in: ' + error.message);
    });
  }
}

// Show the full UI.
function showFullUI() {
  // Update header.
  $('#login').hide();
  $('#userphoto')
     .html("<img class='userphoto' src='" + currentUser().photoURL + "'>");
  $('#userinfo').show();

  $('#postlogin').hide('blind');

  // Populate main content.
  $("#striplist").empty();
  addStrip("strip1");
  addStrip("strip2");
  addStrip("strip3");

  // Show it.
  $('#postlogin').show('fade', 1000);
}

// Mapping from strip-ID to object maintaining strip state.
var allStrips = {};

// Add a new strip with the given ID.
function addStrip(id) {
  var container = $('#striplist');
  var strip = $('<div/>')
    .attr('id', 'stripline-strip-'+id)
    .addClass('strip-line')
    .appendTo(container);
  $('<span/>')
    .addClass('strip-id')
    .text(id)
    .appendTo(strip);
  $('<span/>')
    .addClass('strip-status')
    .text('---')
    .appendTo(strip);
  var ss = $('<select/>')
    .addClass('strip-select')
    .attr('id', 'strip-'+id)
    .appendTo(strip);
  $('<option/>')
    .text('Off')
    .appendTo(ss);
  $('<option/>')
    .text('Fire')
    .appendTo(ss);

  ss.change(selectorChanged);

  var stripState = {
    id: id,
    lastCheckin: null,
    stripElem: strip,
  };
  allStrips['strip-'+id] = stripState;
}

// Callback invoked when selector for a strip has changed.
function selectorChanged(event) {
  var stripid = event.target.id;
  var value = event.target.value;
  $('#stripline-' + stripid).effect('highlight');
  setStripValue(stripid, value);
}

// Set a given strip to the given value.
function setStripValue(stripid, value) {
  var strip = allStrips[stripid];
  if (strip == null) {
    return;
  }
  showLogEntry(new Date(), 'Set ' + strip.id + ' to ' + value);
  $('#' + stripid).val(value);

  // TODO(mdw) - Add Firebase code to update database.

  // XXX MDW - The following is just for testing.
  stripCheckin(stripid);
}

// Callback invoked when a given strip checks in.
function stripCheckin(stripid) {
  var strip = allStrips[stripid];
  if (strip == null) {
    addStrip(stripid);
  }
  var d = new Date();
  strip.lastCheckin = d;
  updateAllStripStatus();
}

// Update the last checkin status of all strips.
function updateAllStripStatus() {
  $.each(allStrips, function(index, elem) {
    console.log('Iterating over strips: ' + index);
    console.log(elem);
    var d = elem.lastCheckin;
    var dateString = 'never';
    if (d != null) {
      var m = new moment(d);
      dateString = m.fromNow();
    }
    $(elem.stripElem).find('.strip-status').text(dateString);
  });
}

// Add a new log entry.
function showLogEntry(date, text) {
  var container = $('#log');
  var line = $('<div/>').addClass('log-line').appendTo(container);

  // Log entry.
  var entry = $('<div/>').addClass('log-line-entry').appendTo(line);

  var m = new moment(date);
  var dateString = moment().format("ddd, h:mmA");

  $('<span/>')
    .addClass("log-line-date")
    .text(dateString)
    .appendTo(entry);
  $('<span/>')
    .addClass("log-line-text")
    .text(text)
    .appendTo(entry);
  entry.effect('highlight');
}

function logout() {
  firebase.auth().signOut().then(function() {
    setup(); // Get back to initial state.
  }, function(error) {
    console.log('Problem logging out: ' + error.message);
  });
}

// Callback when signin complete.
firebase.auth().onAuthStateChanged(function(user) {
  setup();
});

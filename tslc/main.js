/* Team Sidney Light Controller - Main Javascript code */

/* Firebase rules are set up to allow public REST access to read
 * the strips entries in the database. The value of a strip with
 * ID "strip3" can be accessed via:
 * 
 * https://team-sidney.firebaseio.com/strips/strip3.json
 *
 * which returns a JSON-encoded string for the value (e.g., "Off"), with
 * the quotes around it.
 */

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

var logRef = null;

setup();

// Set up initial UI elements.
function setup() {
  if (currentUser() == null) {
    // Not logged in yet.
    showLoginButton();
    logRef = null;

  } else {
    showFullUI();

    logRef = firebase.database().ref('log/');
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
  $("#log").empty();
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
  console.log("addStrip called");

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

  // Get database ref.
  var stripRef = firebase.database().ref('strips/' + id);

  var stripState = {
    id: id,
    val: null,
    lastCheckin: null,
    stripElem: strip,
    ref: stripRef,
  };
  allStrips['strip-'+id] = stripState;

  ss.change(selectorChanged);
  stripRef.on('value', stripUpdated, dbErrorCallback);
}

// Callback invoked when database returns new value for a strip.
function stripUpdated(snapshot) {
  console.log("stripUpdated called");
  console.log("Got new value for strip " + snapshot.key + ": " +
    snapshot.val());
  var stripid = "strip-" + snapshot.key;
  var strip = allStrips[stripid];
  if (strip == null) {
    console.log("Whoops, no entry for " + stripid);
    console.log(allStrips);
    return;
  }
  $('#' + stripid).val(snapshot.val());
}

// Callback invoked when selector for a strip has changed.
function selectorChanged(event) {
  console.log("selectorChange called");
  var stripid = event.target.id;
  var value = event.target.value;
  $('#stripline-' + stripid).effect('highlight');
  setStripValue(stripid, value);
}

// Set a given strip to the given value.
function setStripValue(stripid, value) {
  console.log("setStripValue called");
  var strip = allStrips[stripid];
  if (strip == null) {
    return;
  }

  // Write current state to the database.
  strip.ref.set(value)
    .then(function() {
      addLogEntry('set ' + strip.id + ' to ' + value);
      $('#' + stripid).val(value);
    })
    .catch(function(error) {
      showError($('#dberror'), error.message);
    });

  // XXX MDW - The following is just for testing.
  stripCheckin(stripid);
}

// Callback invoked when a given strip checks in.
function stripCheckin(stripid) {
  console.log("stripCheckin called");
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
  console.log("updateAllStripStatus called");
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

// Add a new log entry to the database.
function addLogEntry(text) {
  console.log("Writing log entry: " + text);
  var logRef = firebase.database().ref('log/');
  var entry = logRef.push();
  entry.set({
    'date': new Date().toJSON(),
    'name': currentUser().displayName,
    'text': text,
  });

  if (FAKE_AUTH) {
    showLogEntry(new Date(), currentUser().displayName, text);
  }
}

// Callback invoked when new log entry hits the database.
function newLogEntry(snapshot, preChildKey) {
  console.log('newLogEntry called');
  clearError($('#dberror'));
  var entry = snapshot.val();
  console.log("Received new log entry: " + JSON.stringify(entry));
  showLogEntry(new Date(entry.date), entry.name, entry.text);
}

// Show a log entry.
function showLogEntry(date, name, text) {
  console.log('showLogEntry called: '+text);

  var container = $('#log');
  var line = $('<div/>').addClass('log-line').appendTo(container);

  // Log entry.
  var entry = $('<div/>').addClass('log-line-entry').appendTo(line);

  console.log('Date received: ' + date);
  var m = new moment(date);
  console.log('Moment is: ' + moment);
  var dateString = m.format("ddd, h:mmA");

  $('<span/>')
    .addClass("log-line-date")
    .text(dateString)
    .appendTo(entry);
  $('<span/>')
    .addClass("log-line-name")
    .text(name)
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

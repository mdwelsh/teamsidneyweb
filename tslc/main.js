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
$('#login').click(doLogin);
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
  $('#userphoto').hide();
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
  $('#userphoto').show();

  $('#postlogin').hide('blind');

  // Populate main content.
  
  var dialog = $("#addStripDialog" ).dialog({
    autoOpen: false,
    height: 400,
    width: 350,
    modal: true,
    buttons: {
      "Add": addStripDone,
      Cancel: function() {
        dialog.dialog( "close" );
      }
    },
    close: function() {
      form[ 0 ].reset();
      //allFields.removeClass( "ui-state-error" );
    }
  });

  var form = dialog.find("form").on("submit", function(event) {
    event.preventDefault();
    addStripDone();
  });
 
  $("#addStrip").off('click');
  $("#addStrip").on('click', function() {
    dialog.dialog("open");
  });

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

// Callback invoked when add strip dialog completes.
function addStripDone() {
  console.log("addStripDone called");
}

// Add a new strip with the given ID.
function addStrip(id) {
  console.log("addStrip called");

  var container = $('#striplist');
  var strip = $('<div/>')
    .addClass('card')
    .addClass('list-group-item')
    .attr('id', 'stripline-strip-'+id)
    .appendTo(container);
  var cardbody = $('<div/>')
    .addClass('card-body')
    .appendTo(strip);
  $('<h5/>')
    .addClass('card-title')
    .text(id)
    .appendTo(cardbody);

  var tbl = $('<table/>')
    .addClass('table')
    .addClass('table-sm')
    .appendTo(cardbody);
  var tbody = $('<tbody/>')
    .appendTo(tbl);

  var r0 = $('<tr/>')
    .appendTo(tbody);
  $('<td/>')
    .text('Current mode')
    .appendTo(r0);
  $('<td/>')
    .text('unknown')
    .appendTo(r0);
  
  var r1 = $('<tr/>')
    .appendTo(tbody);
  $('<td/>')
    .text('Last checkin')
    .appendTo(r1);
  $('<td/>')
    .text('unknown')
    .appendTo(r1);

  var r2 = $('<tr/>')
    .appendTo(tbody);
  $('<td/>')
    .text('MAC address')
    .appendTo(r2);
  $('<td/>')
    .text('xx:xx:xx:xx:xx:xx')
    .appendTo(r2);

  var r3 = $('<tr/>')
    .appendTo(tbody);
  $('<td/>')
    .text('IP address')
    .appendTo(r3);
  $('<td/>')
    .text('127.0.0.1')
    .appendTo(r3);

  // Button group.
  var bg = $('<div/>')
    .addClass('btn-group')
    .attr('role', 'group')
    .appendTo(cardbody);

  // Dropdown as part of button group.
  var dd = $('<div/>')
    .addClass('btn-group')
    .attr('role', 'group')
    .appendTo(bg);

  // Dropdown button itself.
  var ddt = $('<button/>')
    .attr('id', 'stripline-strip-'+id+'-dd')
    .attr('type', 'button')
    .addClass('btn')
    .addClass('btn-secondary')
    .addClass('dropdown-toggle')
    .attr('data-toggle', 'dropdown')
    .attr('aria-haspopup', 'true')
    .attr('aria-expanded', 'false')
    .text('Mode')
    .appendTo(dd);

  var ddm = $('<div/>')
    .addClass('dropdown-menu')
    .attr('aria-labelledby', 'stripline-strip-'+id+'-dd')
    .appendTo(dd);
  $('<a/>')
    .addClass('dropdown-item')
    .attr('href', '#')
    .text('Off')
    .appendTo(ddm);
  $('<a/>')
    .addClass('dropdown-item')
    .attr('href', '#')
    .text('Fire')
    .appendTo(ddm);

  $('<button/>')
    .attr('type', 'button')
    .addClass('btn')
    .addClass('btn-secondary')
    .addClass('material-icons')
    .text('refresh')
    .appendTo(bg);

  $('<button/>')
    .attr('type', 'button')
    .addClass('btn')
    .addClass('btn-secondary')
    .addClass('material-icons')
    .text('delete')
    .appendTo(bg);
    
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

  // XXX TODO(mdw) - Add code to deal with mode change

  //ss.change(selectorChanged);
  stripRef.on('value', stripUpdated, dbErrorCallback);
}

// Callback invoked when database returns new value for a strip.
function stripUpdated(snapshot) {
  var stripid = "strip-" + snapshot.key;
  var strip = allStrips[stripid];
  if (strip == null) {
    return;
  }
  $('#' + stripid).val(snapshot.val());
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
  clearError($('#dberror'));
  var entry = snapshot.val();
  showLogEntry(new Date(entry.date), entry.name, entry.text);
}

// Show a log entry.
function showLogEntry(date, name, text) {
  var container = $('#log');
  var line = $('<div/>').addClass('log-line').appendTo(container);

  // Log entry.
  var entry = $('<div/>').addClass('log-line-entry').appendTo(line);

  var m = new moment(date);
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

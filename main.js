/* Team Sidney - Main Javascript code */

/* Set to true to stub out authentication code. */
var FAKE_AUTH = false;
var SIDNEY_PHOTO = "http://howtoprof.com/profsidney.jpg";
var provider = new firebase.auth.GoogleAuthProvider();
var fakeUser = null;

var totalPoints = null;

// Initialize click handlers.
$('#login').off('click');
$('#login').button().click(doLogin);
$('#welcome').off('click');
$('#welcome').click(logout);

setup();

// Set up initial UI elements.
function setup() {
  doLogo();
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

// Draw the logo.
function doLogo() {
  drawLogo(document.getElementById("logo"));
  $('#prelogin').show();
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

function showFullUI() {
  // Update header.
  $('#login').hide();
  $('#welcome')
     .text("Hi, " + currentUser().displayName.split(" ")[0] + "!");
  $('#userphoto')
     .html("<img class='userphoto' src='" + currentUser().photoURL + "'>");
  $('#userinfo').show();

  // Hide logo.
  $('#prelogin').hide('blind');

  // Populate main content.
  populateCount();
  populateLog();

  $('#plus').off('click');
  $('#plus').click(function() {
    doUpdate("+");
  });
  $('#minus').off('click');
  $('#minus').click(function() {
    doUpdate("-");
  });

  // Show it.
  $('#postlogin').show('fade', 2000);
}

function populateCount() {
  if (FAKE_AUTH) {
    totalPoints = 120;
    showCount();
  }
}

function showCount() {
  $('#count').text(totalPoints);
  $('#count').effect('highlight', 500);
}

function populateLog() {
  if (FAKE_AUTH) {
    var c = totalPoints;
    for (i = 0; i < 4; i++) {
      showLogEntry(new Date(), "Mr. Fake", SIDNEY_PHOTO, "+", 10, c+10,
      "Washing dishes and generally being awesome");
      c += 10;
    }
    totalPoints = c;
    showCount();
  } else {
    // Clear out log in DOM.
    $("#log").empty();
  }
}

function addLogEntry(op, points, total, descr) {
  console.log("Writing log entry: " + op + " " + points + " " + total +
              " " + descr);
  var logRef = firebase.database().ref('log/');
  var entry = logRef.push();
  entry.set({
    'date': new Date().toJSON(),
    'name': currentUser().displayName,
    'photo': currentUser().photoURL,
    'op': op,
    'points': points,
    'total': total,
    'descr': descr,
  });

  if (FAKE_AUTH) {
    showLogEntry(new Date(), currentUser().displayName,
                 currentUser().photoURL, op, points, total, descr);
  }
}

function newLogEntry(snapshot, preChildKey) {
  clearError($('#dberror'));
  var entry = snapshot.val();
  console.log("Received new log entry: " + JSON.stringify(entry));
  showLogEntry(new Date(entry.date), entry.name, entry.photo,
               entry.op, entry.points, entry.total, entry.descr);
}

function showLogEntry(date, name, photo, op, points, total, descr) {
  var container = $('#log');
  var line = $('<div/>').addClass('log-line').prependTo(log);

  // Date.
  var datediv = $('<div/>')
    .addClass("log-line-date-div")
    .appendTo(line);
  var datestring = (date.getMonth() + 1) + '/' + date.getDate();
  $('<span/>')
    .addClass("log-line-date")
    .text(datestring)
    .appendTo(datediv);
  // Total.
  var tdiv = $('<span/>')
    .addClass("log-line-date-total")
    .appendTo(datediv);

  $('<span/>').text('Total').appendTo(tdiv);
  $('<span/>')
     .addClass("log-line-total")
     .text(total)
     .appendTo(tdiv);

  // Log entry.
  var entry = $('<div/>').addClass('log-line-entry').appendTo(line);

  // Photo.
  $('<span/>')
    .html("<img class='userphoto' src='"+photo+"'>")
    .appendTo(entry);
  // Op.
  $('<span/>')
    .addClass("log-line-op")
    .text(op + points)
    .appendTo(entry);
  // Description.
  $('<span/>')
    .addClass("log-line-descr")
    .text('for ' +descr)
    .appendTo(entry);
}

function doUpdate(op) {
  // Hide log.
  $('#log').hide('fade', 250);

  // Twiddle which controls are visible.
  var thisbtn = (op == "+" ? $("#plus") : $("#minus"));
  var otherbtn = (op == "+" ? $("#minus") : $("#plus"));
  thisbtn.toggleClass('fade-btn', true);
  otherbtn.hide();
  $('#updatenum').val('20').show();
  $('#for').show();
  $('#check').off('click');
  $('#check')
    .click(function() { doCheck(op); })
    .show();
  $('#cancel').off('click');
  $('#cancel')
    .click(function() { updateDone(op); })
    .show();
}

function doCheck(op) {
  var descr = $('#for').val();
  var pts = parseInt($('#updatenum').val(), 10);
  applyUpdate(op, pts, descr);
  updateDone(op);
}

function applyUpdate(op, pts, descr) {
  if (op == "+") {
    totalPoints += pts;
  } else {
    totalPoints -= pts;
  }

  if (!FAKE_AUTH) {
    // Write back to database.
    firebase.database().ref('stats').set({
      count: totalPoints,
    })
    .catch(function(error) {
      $('#button').text('You must sign in first!');
    });
  }

  addLogEntry(op, pts, totalPoints, descr);

  showCount();
}

function updateDone(op) {
  // Clear form.
  $('#for').val('');

  // Twiddle which controls are visible.
  var thisbtn = (op == "+" ? $("#plus") : $("#minus"));
  var otherbtn = (op == "+" ? $("#minus") : $("#plus"));
  thisbtn.toggleClass('fade-btn', false);
  otherbtn.show();
  $('#updatenum').hide();
  $('#for').hide();
  $('#check').hide();
  $('#cancel').hide();

  // Show log.
  $('#log').show('fade', 250);
}

/* Called when count updated from DB. */
function countUpdated(snapshot) {
  console.log("Got new value for stats/count: " + snapshot.val());
  clearError($('#dberror'));
  totalPoints = snapshot.val();
  showCount();
}

function logout() {
  firebase.auth().signOut().then(function() {
    setup(); // Get back to initial state.
  }, function(error) {
    console.log('Problem logging out: ' + error.message);
  });
}

/* Callback when signin complete */
firebase.auth().onAuthStateChanged(function(user) {
  setup();
});

/* Team Sidney - Main Javascript code */

/* Set to true to stub out authentication code. */
var FAKE_AUTH = false;
var SIDNEY_PHOTO = "http://howtoprof.com/profsidney.jpg";
var provider = new firebase.auth.GoogleAuthProvider();
var fakeUser = null;

var totalPoints = null;

// Initialize click handlers.
$('#login').button().click(doLogin);
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
    countRef.on('value', countUpdated);
    logRef.on('child_added', newLogEntry);
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

// Clear error.
function clearError() {
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

  $('#plus').click(function() {
    doUpdate("+");
  });
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
      addLogEntry(new Date(), "Mr. Fake", SIDNEY_PHOTO, "+", 10, c+10,
      "Washing dishes and generally being awesome");
      c += 10;
    }
    totalPoints = c;
    showCount();
  }
}

function addLogEntry(op, points, total, descr) {
  console.log("Writing log entry: " + op + " " + points + " " + total +
              " " + descr);
  var entry = logRef.push();
  entry.set({
    'date': new Date(),
    'name': currentUser().displayName,
    'photo': currentUser().photoURL,
    'op': op,
    'points': points,
    'total': total,
    'descr': descr,
  });
}

function newLogEntry(snapshot, preChildKey) {
  var entry = snapshot.val();
  console.log("Received new log entry: " + JSON.stringify(entry));
  showLogEntry(entry.date, entry.name, entry.photo,
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
  $('#check')
    .click(function() { doCheck(op); })
    .show();
  $('#cancel')
    .click(function() { updateDone(op); })
    .show();
}

function doCheck(op) {
  var descr = $('#for').val();
  var pts = parseInt($('#updatenum').val(), 10);
  applyUpdate(new Date(), op, pts, descr);
  updateDone(op);
}

function applyUpdate(date, op, pts, descr) {
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

  addLogEntry(date, currentUser().displayName,
              currentUser().photoURL, op, pts, totalPoints, descr);

  showCount();
}

function updateDone(op) {
  // Remove click handlers on buttons.
  $('#check').off('click');
  $('#cancel').off('click');
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

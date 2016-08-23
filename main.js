/* Team Sidney - Main Javascript code */

/* Set to true to stub out authentication code. */
var FAKE_AUTH = true;
var provider = new firebase.auth.GoogleAuthProvider();
var fakeUser = null;

var SIDNEY_PHOTO = "http://howtoprof.com/profsidney.jpg";

setup();

// Set up initial UI elements.
function setup() {
  doLogo();
  if (currentUser() == null) {
    // Not logged in yet.
    showLoginButton();
  } else {
    showFullUI();
  }
}

function currentUser() {
  if (FAKE_AUTH) {
    return fakeUser;
  } else {
    return firebase.auth().currentUser();
  }
}

function showLoginButton() {
  console.log("Show login button called");
  $('#userinfo').hide();
  $('#login').button().click(doLogin);
  $('#login').show();
}

function doLogin() {
  console.log("doLogin called");
  if (FAKE_AUTH) {
    fakeUser = {
      displayName: "Mr. Fake",
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
  $('#welcome').text("Hi, " + currentUser().displayName + "!");
  $('#userphoto').html("<img class='userphoto' src='" + currentUser().photoURL + "'>");
  $('#userinfo').show();

  // Hide logo.
  $('#prelogin').hide('blind');

  // Populate main content.
  $('#count').text('120'); // TODO
  populateLog();
  $('#postlogin').show('fade', 1000);
}

function populateLog() {
  // TODO
  var c = 50;
  for (i = 0; i < 10; i++) {
    addLogEntry("8/22", "Mr. Fake", SIDNEY_PHOTO, "+", 10, c+10,
    "Washing dishes and generally being awesome");
    c += 10;
  }
}

function addLogEntry(date, name, photo, op, points, total, descr) {
  var container = $('#log');
  var line = $('<div/>').addClass('log-line').appendTo(log);

  // Date.
  var datediv = $('<div/>')
    .addClass("log-line-date-div")
    .appendTo(line);
  $('<span/>')
    .addClass("log-line-date")
    .text(date)
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

// Draw the logo.
function doLogo() {
  drawLogo(document.getElementById("logo"));
  $('#prelogin').show();
}

function clearError() {
  elem.hide();
}

function showError(elem, msg) {
  elem.text(msg);
  elem.show();
}

/*

var count = 0;

$('#login').css('color', 'blue');
$('#login').css('text-decoration', 'underline');
$('#login').text('Sign in');
$('#login').click(login);

$('#logout').hide();
$('#logout').css('color', 'red');
$('#logout').css('text-decoration', 'underline');
$('#logout').text('Sign out');
$('#logout').click(logout);

$('#userinfo').text('No user yet');
$('#button').text('Click me');
$('#current').text('No value yet');



var countRef = firebase.database().ref('stats/count');
countRef.on('value', function(snapshot) {
  count = snapshot.val();
  $('#current').text('Button clicked ' + count + ' times');
});

$('#button').click(function() {
  count++;
  firebase.database().ref('stats').set({
    count: count
  })
  .catch(function(error) {
    $('#button').text('You must sign in first!');
  });
});


function logout() {
  firebase.auth().signOut().then(function() {
  }, function(error) {
    $('#userinfo').text('Sorry, could not log you out: ' + error.message);
  });
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    $('#userinfo').css('color', 'black');
    $('#userinfo').css('text-decoration', 'none');
    $('#userinfo').text('Hi, ' + user.displayName + '!');
    $('#login').hide();
    $('#logout').show();
  } else {
    $('#userinfo').text('No user yet');
    $('#login').show();
    $('#logout').hide();
  }
});

*/

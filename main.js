/* Team Sidney - Main Javascript code */

/* Set to true to stub out authentication code. */
var FAKE_AUTH = true;
var provider = new firebase.auth.GoogleAuthProvider();
var fakeUser = null;

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
      photoURL: "http://howtoprof.com/profsidney.jpg",
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
  console.log("Show full UI called");
  $('#login').hide();
  $('#welcome').text("Hi, " + currentUser().displayName + "!");
  $('#userphoto').html("<img class='userphoto' src='" + currentUser().photoURL + "'>");
  $('#userinfo').show();

  $('#prelogin').hide('blind');

  $('#count').text('120'); // TODO
  $('#postlogin').show('fade', 1000);
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

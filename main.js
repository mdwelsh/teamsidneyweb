// Team Sidney

var provider = new firebase.auth.GoogleAuthProvider();
setup();

// Set up initial UI elements.
function setup() {
  doLogo();
  if (firebase.auth().currentUser == null) {
    // Not logged in yet.
    showLoginButton();
  } else {
    showFullUI();
  }
}

function showLoginButton() {
  console.log("Show login button called");
  var login = $('#login');
  login.button().click(doLogin);
}

function doLogin() {
  console.log("doLogin called");
  firebase.auth().signInWithPopup(provider).then(function(result) {
  }).catch(function(error) {
    showError($('#loginerror'), 'Sorry, could not log you in: ' + error.message);
  });
}

function showFullUI() {
  console.log("Show full UI called");
  $('#login').text("The full UI should be here");
}

// Draw the logo.
function doLogo() {
  drawLogo(document.getElementById("logo"));
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

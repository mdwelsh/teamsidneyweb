// Team Sidney

var count = 0;

$('#login').css('color', 'blue');
$('#login').css('text-decoration', 'underline');
$('#login').text('Sign in');
$('#login').click(login);
$('#userinfo').text('No user yet');
$('#button').text('Click me');
$('#current').text('No value yet');

var provider = new firebase.auth.GoogleAuthProvider();

var countRef = firebase.database().ref('stats/count');
countRef.on('value', function(snapshot) {
  count = snapshot.val();
  $('#current').text('Button clicked ' + count + ' times');
});

$('#button').click(function() {
  count++;
  firebase.database().ref('stats').set({
    count: count
  });
});

function login() {
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // Do nothing on success.
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    $('#userinfo').text('Sorry, could not log you in: ' + errorMessage);
    $('#login').show();
  });
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    $('#login').hide();
    $('#userinfo').css('color', 'black');
    $('#userinfo').css('text-decoration', 'none');
    $('#userinfo').text('Hi, ' + user.displayName + '!');
  } else {
    $('#login').show();
    $('#userinfo').text('No user yet');
  }
});


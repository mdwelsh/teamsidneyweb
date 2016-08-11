// Team Sidney

var count = 0;
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
  });
});

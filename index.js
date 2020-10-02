$(document).ready(function () {
  $('#get-token').click(function (e) {
    e.preventDefault();

    var password = $('#password').val();
    var username = $('#user').val();
    var url =
      'http://identity-nlb-dev-e81f9e4165eb0f4b.elb.eu-central-1.amazonaws.com/connect/token';

    $.ajax({
      type: 'POST',
      url: url,
      data: {
        client_id: 'autoproff',
        client_secret: 'autoproff',
        grant_type: 'password',
        password: password,
        username: username,
      },
    })
      .done(function (data) {
        console.log('Success');
        console.log(data);
        $('#token').val(data.access_token);
      })
      .fail(function (data) {
        console.log('Failed');
        console.log(data);
      });
  });

  var firebaseConfig = {
    apiKey: 'AIzaSyC_SwM-Rc9X7DHmGkz34hN18Asb6MCK2P8',
    authDomain: 'auctionservicedev.firebaseapp.com',
    databaseURL: 'https://auctionservicedev.firebaseio.com',
    projectId: 'auctionservicedev',
    storageBucket: 'auctionservicedev.appspot.com',
    messagingSenderId: '1052773579869',
    appId: '1:1052773579869:web:e89839c5375dfa03f5a1b4',
    measurementId: 'G-LPDKK5YSHM',
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
  db.collection('cities')
    .doc('test-realtime')
    .onSnapshot(function (doc) {
      console.log('Current data: ', doc.data());
    });
});

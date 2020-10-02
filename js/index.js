$(document).ready(function () {
  //endpoints and authorization
  var identityEndpoint =
    'http://identity-nlb-dev-e81f9e4165eb0f4b.elb.eu-central-1.amazonaws.com';
  var serviceEndpoint =
    'https://6k7536fv9c.execute-api.eu-central-1.amazonaws.com';
  var authorization = 'Bearer ' + $('#token').val();

  //handle token
  $('#get-token').click(function (e) {
    e.preventDefault();
    $.notify('Getting token, please wait', 'info');

    var password = $('#password').val();
    var username = $('#user').val();
    var identityUrl = identityEndpoint + '/connect/token';
    var identityRequestBody = {
      client_id: 'autoproff',
      client_secret: 'autoproff',
      grant_type: 'password',
      password: password,
      username: username,
    };

    $.ajax({
      type: 'POST',
      url: identityUrl,
      data: identityRequestBody,
    })
      .done(function (data) {
        console.log('Success');
        console.log(data);
        $('#token').val(data.access_token);
        $.notify('Token returned', 'success');
      })
      .fail(function (data) {
        console.log('Failed');
        console.log(data);
        $.notify('Error occured', 'error');
      });
  });

  //handle manual bid
  $('#manual-bid').click(function (e) {
    e.preventDefault();
    $.notify('Placing manual bid', 'info');

    var slotId = $('#auction-slot-id').val();
    var requestBody = {
      bidAmount: $('#manual-bid-current').val() + $('#bid-increase').val(),
      currency: $('#currency-code').val(),
    };
    var url = serviceEndpoint + '/dev/api/auctionslots/' + slotId + '/bid';

    $.ajax({
      type: 'POST',
      url: url,
      crossDomain: true,
      "headers": {
        "Authorization": authorization,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(requestBody),
    })
      .done(function (data) {
        console.log(data);
        $.notify(data, 'info');
      })
      .fail(function (jqXHR) {
        console.log('Manual bid failed');
        console.log(jqXHR.responseJSON.message);
        $.notify('Manual bid failed', 'error');
      });
  });

  //handle autobid
  $('#auto-bid').click(function (e) {
    e.preventDefault();
    $.notify('Placing auto bid', 'info');

    var slotId = $('#auction-slot-id').val();
    var requestBody = {
      maxPrice: $('#autobid-max').val(),
      currency: $('#currency-code').val(),
    };
    var url = serviceEndpoint + slotId + '/autobid';

    $.ajax({
      type: 'POST',
      url: url,
      crossDomain: true,
      "headers": {
        "Authorization": authorization,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(requestBody)
    })
      .done(function (data) {
        console.log(data);
        $.notify(data, 'info');
      })
      .fail(function (jqXHR) {
        console.log('Auto bid failed');
        console.log(jqXHR.responseJSON.message);
        $.notify('Auto bid failed', 'error');
      });
  });

  //handle firebase
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
  db.collection('AddBidEvent').onSnapshot(function (doc) {
    doc.forEach(function (data) {
      console.log(data.data());
    });
  });
});

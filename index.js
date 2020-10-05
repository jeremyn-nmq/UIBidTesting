$(document).ready(function () {
  //endpoints and authorization
  var identityEndpoint =
    'http://identity-nlb-dev-e81f9e4165eb0f4b.elb.eu-central-1.amazonaws.com';
  var serviceEndpoint =
    'https://6k7536fv9c.execute-api.eu-central-1.amazonaws.com';

  //handle inputs
  $('.actions').prop('disabled', true);

  $('#token-area').keyup(function () {
    $('#token-area').find("button").prop('disabled', $('#user').val() == "" || $('#password').val() != "testPassword" ? true : false);
  });

  $('#bid-area').keyup(function () {
    let token = $('#token').val();
    let slotId = $('#auction-slot-id').val();
    $('#bid-area').find("#manual-bid").prop('disabled', token == "" || slotId == "" || $('#bid-increase').val() == "" ? true : false);
    $('#bid-area').find("#auto-bid").prop('disabled', token == "" || slotId == "" || $('#autobid-max').val() == "" ? true : false);
  })

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
    let bidIncrease = parseInt($('#bid-increase').val());
    var currencyCode = $('#currency-code').val();
    let currentBid = parseInt($('#manual-bid-current').val());
    var requestBody = {
      bidAmount: currentBid + bidIncrease,
      currency: currencyCode,
    };
    var url = serviceEndpoint + '/dev/api/auctionslots/' + slotId + '/bid';
    var authorization = 'Bearer ' + $('#token').val();

    $.ajax({
      type: 'POST',
      url: url,
      crossDomain: true,
      headers: {
        "Authorization": authorization,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(requestBody),
    })
      .done(function (data) {
        console.log(data);
        $.notify(data.message, 'info');
      })
      .fail(function (jqXHR) {
        console.log('Manual bid failed');
        console.log(jqXHR.responseJSON.message);
        $.notify(jqXHR.responseJSON.message, 'error');
      });
  });

  //handle autobid
  $('#auto-bid').click(function (e) {
    e.preventDefault();
    $.notify('Placing auto bid', 'info');

    var slotId = $('#auction-slot-id').val();
    var maxAutoBidPrice = parseInt($('#autobid-max').val());
    var currencyCode = $('#currency-code').val();

    var requestBody = {
      maxPrice: maxAutoBidPrice,
      currency: currencyCode,
    };
    var url = serviceEndpoint + '/dev/api/auctionslots/' + slotId + '/autobid';
    var authorization = 'Bearer ' + $('#token').val();

    $.ajax({
      type: 'POST',
      url: url,
      crossDomain: true,
      headers: {
        "Authorization": authorization,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(requestBody),
    })
      .done(function (data) {
        console.log(data);
        $.notify(data.message, 'info');
      })
      .fail(function (jqXHR) {
        console.log('Auto bid failed');
        console.log(jqXHR.responseJSON.message);
        $.notify(jqXHR.responseJSON.message, 'error');
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
      if (data.id == $('#auction-slot-id').val()) {
        var bidData = data.data();
        $('#manual-bid-current').val(data.data().currentPrice);
        $('.alert.alert-success').removeClass().addClass("alert alert-secondary");
        var innerHtml = $('#bid-history').html();
        var historyRecord = '<div class="alert alert-success" role="alert">' +
          bidData.currentPrice + ' - ' + bidData.buyerName
          + '</div>';
        historyRecord += innerHtml;
        $('#bid-history').html(historyRecord);
      }
    });
  });
});

const mockAuctionRoom = {
  id : "00000000-0000-0000-0000-000000000000",
  title : "auction room",
  auctionType : "Open",
  minHoursForProductOnAuction: 0,
  minActiveAuctionsWithOpenSlots: 0,
  auctionImageUrl: "https://www.usa-car-import.com/images/car-placeholder.png",
  activeFrom: "yyyy-mm-dd",
  extendAuctionSeconds: 0,
  auctionCurrency: "DKK",
  state: "Draft",
  totalOfVehicles: 0,
  buyers: [],
  countries: [],
  schedule: [],
  requirements: {
    sellers: [],
    countries: [],
    tags: []
  }
}

$(document).ready(function () {
  if (window.location.href.indexOf("auctionRoomDetail") > -1){
    var params = new window.URLSearchParams(window.location.search);
    var id = params.get("id");
    var factories = JSON.parse(localStorage.getItem('factories'));
    renderAutionRoomDetail(factories.find(af => af.id == id));
  }
  
  //endpoints and authorization
  var identityEndpoint =
    'http://identity-nlb-dev-e81f9e4165eb0f4b.elb.eu-central-1.amazonaws.com';
  var serviceEndpoint =
    'https://6k7536fv9c.execute-api.eu-central-1.amazonaws.com';

  var auctionFactories = [];

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
    $('#bid-area').find("#total-price").html(parseFloat($('#bid-increase').val()) + parseFloat($('#manual-bid-current').val()));
  })

  //handle navs
  $(function() {
    $('nav a[href^="/' + location.pathname.split("/")[1] + '"]').addClass('active');
  });

  //datetimepicker
  if ($('#af-active-from').length){
    $('#af-active-from').datetimepicker({
      format: 'Y-m-d h:m'
    });
  }
 
  
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
        localStorage.token = data.access_token;
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
    handlePostRequest(localStorage.token, url, requestBody)
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

    handlePostRequest(localStorage.token, url, requestBody)
  });

  $('#af-create-new').click(function (e) {
    e.preventDefault();
    $.notify("Creating Auction Factory button pressed", 'info')
 
    var url = serviceEndpoint + '/dev/api/auctionrooms';
    var title = $('#af-title').val();
    var minHour = parseInt($('#af-min-hour-product').val());
    var minActive = parseInt($('#af-min-active').val());
    var aucType = $('#af-auc-type').val();
    var imgUrl = $('#af-url').val();
    var activeFrom = $('#af-active-from').val().replace(/ /g,"T") + "Z";
    var extend = parseInt($('#af-extend').val());
    var currency = $('#af-currency-code').val();
    var requestBody = {
      "title": title,
      "minHoursForProductOnAuction": minHour,
      "minActiveAuctionsWithOpenSlots": minActive,
      "auctionType": aucType,
      "auctionImageUrl": imgUrl,
      "activeFrom": activeFrom,
      "extendAuctionSeconds": extend,
      "auctionCurrency": currency
    };
    handlePostRequest(localStorage.token, url, JSON.stringify(requestBody));
  })

     //handle add buyer list
  $('#add-buyer').click(function (e) {
    e.preventDefault();
    var auctionFactoryId = $('#room-id').val();
    var url = serviceEndpoint + '/dev/api/auctionrooms/'+auctionFactoryId+'/buyers';
    var requestBody = $("#buyerlist").val();
    handlePostRequest(localStorage.token, url, requestBody)
  })

  //handle add permitted country
  $('#add-permittedcountry').click(function (e) {
    e.preventDefault();
    var auctionFactoryId = $('#room-id').val();
    var url = serviceEndpoint + '/dev/api/auctionrooms/'+auctionFactoryId+'/permittedcountries';
    var requestBody = $("#permittedcountry").val();
    handlePostRequest(localStorage.token, url, requestBody)
  })

  //handle add seller requirement
  $('#add-sellerrequirement').click(function (e) {
    e.preventDefault();
    var auctionFactoryId = $('#room-id').val();
    var url = serviceEndpoint + '/dev/api/auctionrooms/'+auctionFactoryId+'/sellerrequirement';
    var requestBody = $("#sellerrequirement").val();
    handlePostRequest(localStorage.token, url, requestBody)
  })

  //handle add country requirement
  $('#add-countryrequirement').click(function (e) {
    e.preventDefault();
    var auctionFactoryId = $('#room-id').val();
    var url = serviceEndpoint + '/dev/api/auctionrooms/'+auctionFactoryId+'/countryrequirement';
    var requestBody = $("#countryrequirement").val();
    handlePostRequest(localStorage.token, url, requestBody)
  })

  //handle post requests
  var handlePostRequest = function (token, url, body) {
    $.ajax({
      type: 'POST',
      url: url,
      crossDomain: true,
      headers: {
        "Authorization": 'Bearer ' + token,
        "Content-Type": "application/json"
      },
      data: body,
    })
      .done(function (data) {
        console.log(data);
      })
      .fail(function (jqXHR) {
        if (jqXHR.responseJSON['message']){
          $.notify(jqXHR.responseJSON.message, 'error');
        }
        else{
          $.each(jqXHR.responseJSON.errors, function(key, item) 
          {
            console.log(item);
            $.notify(item);
          });
        }
      });
  }

  //handle render data into auction room detail
  function renderAutionRoomDetail(auctionRoom) {
    if (!auctionRoom) {
      auctionRoom = mockAuctionRoom
    }
    $('#room-image').attr("src",auctionRoom.auctionImageURL)
    $('#room-id').val(auctionRoom.id);
    $('#room-title').val(auctionRoom.title);
    $('#room-currency').val(auctionRoom.auctionCurrency);
    $('#room-auctiontype').val(auctionRoom.auctionType);
    $('#room-state').val(auctionRoom.state);
    $('#room-minhours').val(auctionRoom.minHoursForProductOnAuction);
    $('#room-minactive').val(auctionRoom.minActiveAuctionsWithOpenSlots);
    $('#room-activefrom').val(auctionRoom.activeFrom);
    $('#room-extendsecond').val(auctionRoom.extendAuctionSeconds);
    $('#room-totalvehicle').val(auctionRoom.totalOfVehicles);
    var buyerIds = [];
    if (auctionRoom.buyers.length > 0) {
      buyerIds = auctionRoom.buyers.map(buyer => buyer.id)
    }   
    $('#buyerlist').html(JSON.stringify(buyerIds));
    $('#nav-buyerlist-tab').html('Buyer list('+buyerIds.length+')');
    $('#permittedcountry').html(JSON.stringify(auctionRoom.countries));
    $('#nav-permittedcountry-tab').html('Permitted Country('+auctionRoom.countries.length+')');
    var sellerRequirement = [];
    var countryRequirement = []
    if (auctionRoom.requirements) {
      if (auctionRoom.requirements.sellers) {
        sellerRequirement = auctionRoom.requirements.sellers;      
      }
      if (auctionRoom.requirements.countries) {
        sellerRequirement = auctionRoom.requirements.countries;      
      }
    }
    $('#sellerrequirement').html(JSON.stringify(sellerRequirement));
    $('#nav-sellerrequirement-tab').html('Seller requirement('+sellerRequirement.length+')');
    $('#countryrequirement').html(JSON.stringify(countryRequirement));
    $('#nav-countryrequirement-tab').html('Country requirement('+countryRequirement.length+')');
  }

  //handle get requests
  var handleGetRequest = function (token, url, body) {
    $.ajax({
      type: 'GET',
      url: url,
      crossDomain: true,
      headers: {
        "Authorization": 'Bearer ' + token,
        "Content-Type": "application/json"
      },
      data: body,
    })
      .done(function (data) {
        console.log(data);
      })
      .fail(function (jqXHR) {
        if (jqXHR.responseJSON['message']){
          $.notify(jqXHR.responseJSON.message, 'error');
        }
        else{
          $.each(jqXHR.responseJSON.errors, function(key, item) 
          {
            console.log(item);
            $.notify(item);
          });
        }
      });
  }
  //handle show auction factory
  $('#af-get-btn').click(function (e) {
    e.preventDefault();
    var url = serviceEndpoint + '/dev/api/auctionrooms/';
    var requestBody = [];
    $.ajax({
      type: 'GET',
      url: url,
      crossDomain: true,
      headers: {
        "Authorization": 'Bearer ' + localStorage.token,
        "Content-Type": "application/json"
      },
      data: requestBody,
    })
      .done(function (data) {
        console.log(data);
        var displayBox = $('#af-show-area').html();
        auctionFactories = [];
        
        for (let i in data.results)
        {
          console.log(data.results[i]);
          auctionFactories.push(data.results[i]);
          var afCard = 
              '<div class="card mb-3" style="min-width: 18rem;">\n' +
                '<div class="overflow-hidden" style="max-height: 200px;">\n' +
                  '<img class="mx-auto d-block w-100" alt="Card image cap" src="'+data.results[i].auctionImageURL+'" id="af-card-img">\n' +
                '</div>\n' +
                '<div class="card-body">\n' +
                  '<h5 class="card-title">' + data.results[i].title + '</h5>\n' +
                  '<p class="card-text">' + data.results[i].id + '</p>\n' +
                '</div>\n' +
                '<ul class="list-group list-group-flush">\n' +
                  '<li class="list-group-item">State: <span>'+data.results[i].state+'</span></li>\n' +
                  '<li class="list-group-item">AuctionType: <span>'+data.results[i].auctionType+'</span></li>\n' +
                '</ul>\n' +
                '<div class="card-body">\n' +
                  '<a class="card-link" href="'+window.location.origin+'/auctionRoomDetail.html?id='+data.results[i].id+'">Details</a>\n' +
                '</div>\n' +
              '</div>\n';
          displayBox += afCard;
          $('#af-show-area').html(displayBox);
        }
        $('#total-result').html(auctionFactories.length);
        localStorage.setItem('factories', JSON.stringify(auctionFactories));
      })
      .fail(function (jqXHR) {
        if (jqXHR.responseJSON['message']){
          $.notify(jqXHR.responseJSON.message, 'error');
        }
        else{
          $.each(jqXHR.responseJSON.errors, function(key, item) 
          {
            console.log(item);
            $.notify(item);
          });
        }
      });
  })

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
        //update current price
        var bidData = data.data();
        $('#manual-bid-current').val(data.data().currentPrice);
        $('.alert.alert-success').removeClass().addClass("alert alert-secondary");
        var innerHtml = $('#bid-history').html();
        var historyRecord = '<div class="alert alert-success" role="alert">' +
          bidData.currentPrice + ' - ' + bidData.buyerName
          + '</div>';
        historyRecord += innerHtml;
        $('#bid-history').html(historyRecord);
        $('#total-price').html(parseFloat(data.data().currentPrice) + parseFloat($('#bid-increase').val()));
      }
    });
  });
});

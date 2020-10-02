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
      })
      .fail(function (data) {
        console.log('Failed');
        console.log(data);
      });
  });
});

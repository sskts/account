var username = localStorage.getItem('username', username);
if (username !== null) {
    $('#username').val(username);
}

$(document).on('submit', 'form[name=cognitoSignInForm]', function (event) {
    event.preventDefault();
    var $this = $(this);
    var button = $('button[name=signInSubmitButton]');
    button.prop('disabled', true);
    $.ajax({
        type: 'POST',
        url: '/checkLogin',
        data: { username : $('#username').val(), password: $('#password').val() },
    })
        .done(function (data) {
            localStorage.setItem('username', data.username);
            $(document).off('submit', 'form[name=cognitoSignInForm]');
            $this.trigger('submit');
        })
        .fail(function (XMLHttpRequest) {
            $(document).off('submit', 'form[name=cognitoSignInForm]');
            $this.trigger('submit');
            // var message = XMLHttpRequest.responseJSON.message;
            // $('#loginErrorMessage').remove();
            // $this.prepend('<p id="loginErrorMessage" class="error text-danger mb-3">'+ message +'</p>');
            // button.prop('disabled', false);
        });
})
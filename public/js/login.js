var usernameModal = new Modal('usernameModal');
$(document).on('click', '#usernameTrigger', function (event) {
    event.preventDefault();
    usernameModal.show();
});
$(function () {
    $(document).on('submit', 'form', submitDisabled);
});

/**
 * 複数リクエスト防止
 */
function submitDisabled() {
    $('button[type=submit]').prop('disabled', true);
}

/**
 * ローディング表示
 */
function showLoading() {
    if ($('#username').val().length > 0 && $('#password').val().length > 0)
        $('.loading-cover, .loading').addClass('active');
}
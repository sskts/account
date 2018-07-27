$(function(){
    $('button[type="submit"]').on('click', showLoading);
});

/**
 * ローディング表示
 */
function showLoading () {
    if ($('#username').val().length > 0 && $('#password').val().length > 0)
        $('.loading-cover, .loading').addClass('active');
}
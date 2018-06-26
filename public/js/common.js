$(function(){
    $('button[type="submit"]').on('click', showLoading);
});

/**
 * ローディング表示
 */
function showLoading () {
    $('.loading-cover, .loading').addClass('active');
}
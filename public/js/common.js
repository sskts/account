$(function () {
    $(document).on('submit', 'form', submitDisabled);
    $(document).on('DOMFocusIn', onDOMFocusIn);
    $(document).on('DOMFocusOut', onDOMFocusOut);
});

function onDOMFocusIn(event) {
    if (event.target === null) {
        return;
    }
    const element = event.target;
    const tagName = element.tagName;
    const type = element.type;
    if (tagName === undefined || tagName !== 'INPUT') {
        return;
    }
    if (type === undefined) {
        return;
    }
    if (type === 'text'
        || type === 'number'
        || type === 'password'
        || type === 'email'
        || type === 'tel') {
        $('#keybordSpace').removeClass('d-none');
    }
};

function onDOMFocusOut(_event) {
    $('#keybordSpace').addClass('d-none');
};

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

/**
 * URLパラメータ取得
 */
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
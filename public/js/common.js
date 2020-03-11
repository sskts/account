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

/**
 * モーダル
 */
var Modal = /** @class */ (function () {
    function Modal(id) {
        this.id = id;
    }
    Modal.prototype.getElement = function () {
        return $('#' + this.id);
    };
    Modal.prototype.show = function () {
        var _this = this;
        $('body').append('<div class="modal-backdrop fade show"></div>')
            .addClass('show');
        this.getElement().one('click', function () {
            _this.hide();
        });
        this.getElement().find('.modal-content').on('click', function (event) {
            if ($(event.target).hasClass('close')) {
                return;
            }
            event.stopPropagation();
        });
        this.getElement().addClass('show');
    };
    Modal.prototype.hide = function () {
        this.getElement().removeClass('show');
        $('.modal-backdrop').remove();
        this.getElement().find('.modal-content').off();
    };
    return Modal;
}());
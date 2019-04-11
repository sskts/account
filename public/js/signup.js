$(function(){
    $(document).on('click', '.eye, .eye-slash', visualizationPasswordToggle);
});

/**
 * パスワード表示切り替え
 * @param {Event} event 
 */
function visualizationPasswordToggle(event) {
    event.preventDefault();
    var isVisible = $(this).hasClass('eye-slash');
    var target = $('input[name=password]');
    if (isVisible) {
        $('.eye-slash').removeClass('active');
        $('.eye').addClass('active');
        target.attr('type', 'password');
    } else {
        $('.eye').removeClass('active');
        $('.eye-slash').addClass('active');
        target.attr('type', 'text');
    }
}

/**
 * パスワード検証
 * @param {'pc' | 'mobile'} screenSize 
 */
function checkPasswordMatch(screenSize) {
    var passwordPolicy = [];
    passwordPolicy.lowercase = "パスワードには小文字を含める必要があります";
    passwordPolicy.uppercase = "パスワードは大文字を含める必要があります";
    passwordPolicy.number = "パスワードには数字を含める必要です";
    passwordPolicy.special = "パスワードには特殊文字を含める必要があります";
    var passwordLength = 8;
    passwordPolicy.lengthCheck = "パスワードは" + passwordLength + "文字以上でなければなりません";

    var password = $("#password-" + screenSize).val();
    var username_input = $("#username-input-" + screenSize).val() != "";

    var requireLowerletter = false;
    var requireUpperletter = false;
    var requireNumber = false;
    var requireSymbol = false;
    var requireLength = false;

    if (password) {

        if (true) {
            if (/[a-z]/.test(password)) {
                $("#check-lowerletter-" + screenSize).html("&#10003;");
                $("#checkPasswordText-lowerletter-" + screenSize).html(passwordPolicy.lowercase);
                $("#checkPassword-lowerletter-" + screenSize).addClass("passwordCheck-valid-customizable").removeClass(
                    "passwordCheck-notValid-customizable");
                requireLowerletter = true;
            } else {
                $("#check-lowerletter-" + screenSize).html("&#10006;");
                $("#checkPasswordText-lowerletter-" + screenSize).html(passwordPolicy.lowercase);
                $("#checkPassword-lowerletter-" + screenSize).addClass("passwordCheck-notValid-customizable").removeClass(
                    "passwordCheck-valid-customizable");
                requireLowerletter = false;
            }
        } else {
            requireLowerletter = true;
        }
        if (true) {
            if (/[A-Z]/.test(password)) {
                $("#check-upperletter-" + screenSize).html("&#10003;");
                $("#checkPasswordText-upperletter-" + screenSize).html(passwordPolicy.uppercase);
                $("#checkPassword-upperletter-" + screenSize).addClass("passwordCheck-valid-customizable").removeClass(
                    "passwordCheck-notValid-customizable");
                requireUpperletter = true;
            } else {
                $("#check-upperletter-" + screenSize).html("&#10006;");
                $("#checkPasswordText-upperletter-" + screenSize).html(passwordPolicy.uppercase);
                $("#checkPassword-upperletter-" + screenSize).addClass("passwordCheck-notValid-customizable").removeClass(
                    "passwordCheck-valid-customizable");
                requireUpperletter = false;
            }
        } else {
            requireUpperletter = true;
        }
        if (true) {
            if (/[!|#|$|%|^|&|*|_]/.test(password)) {
                $("#check-symbols-" + screenSize).html("&#10003;");
                $("#checkPasswordText-symbols-" + screenSize).html(passwordPolicy.special);
                $("#checkPassword-symbols-" + screenSize).addClass("passwordCheck-valid-customizable").removeClass(
                    "passwordCheck-notValid-customizable");
                requireSymbol = true;
            } else {
                $("#check-symbols-" + screenSize).html("&#10006;");
                $("#checkPasswordText-symbols-" + screenSize).html(passwordPolicy.special);
                $("#checkPassword-symbols-" + screenSize).addClass("passwordCheck-notValid-customizable").removeClass(
                    "passwordCheck-valid-customizable");
                requireSymbol = false;
            }
        } else {
            requireSymbol = true;
        }
        if (true) {
            if (/[0-9]/.test(password)) {
                $("#check-numbers-" + screenSize).html("&#10003;");
                $("#checkPasswordText-numbers-" + screenSize).html(passwordPolicy.number);
                $("#checkPassword-numbers-" + screenSize).addClass("passwordCheck-valid-customizable").removeClass(
                    "passwordCheck-notValid-customizable")
                requireNumber = true;
            } else {
                $("#check-numbers-" + screenSize).html("&#10006;");
                $("#checkPasswordText-numbers-" + screenSize).html(passwordPolicy.number);
                $("#checkPassword-numbers-" + screenSize).addClass("passwordCheck-notValid-customizable").removeClass(
                    "passwordCheck-valid-customizable");
                requireNumber = false;
            }
        } else {
            requireNumber = true;
        }

        if (password.length < passwordLength) {
            $("#check-length-" + screenSize).html("&#10006;");
            $("#checkPasswordText-length-" + screenSize).html(passwordPolicy.lengthCheck);
            $("#checkPassword-length-" + screenSize).addClass("passwordCheck-notValid-customizable").removeClass(
                "passwordCheck-valid-customizable");
            requireLength = false;
        } else {
            $("#check-length-" + screenSize).html("&#10003;");
            $("#checkPasswordText-length-" + screenSize).html(passwordPolicy.lengthCheck);
            $("#checkPassword-length-" + screenSize).addClass("passwordCheck-valid-customizable").removeClass(
                "passwordCheck-notValid-customizable");
            requireLength = true;
        }
    }
    if (requireLowerletter && requireUpperletter && requireNumber && requireSymbol && requireLength && username_input) {
        document.getElementById("signupButton-" + screenSize).disabled = false;
        return true;
    } else {
        document.getElementById("signupButton-" + screenSize).disabled = true;
        return false;
    }
}

function checkConfirmPasswordMatch(screenSize) {
    if(!checkPasswordMatch(screenSize)) {
        return;
    }
    var password = $("#password-" + screenSize).val();
    var confirmPassword = $("#confirm_password-" + screenSize).val();
    var confirmCheck = "パスワードを同じにする必要があります";
    if (password === confirmPassword) {
        $("#check-confirm-" + screenSize).html("&#10003;");
        $("#checkPasswordText-confirm-" + screenSize).html(confirmCheck);
        $("#checkPassword-confirm-" + screenSize).addClass("passwordCheck-notValid-customizable").removeClass(
            "passwordCheck-valid-customizable");
        document.getElementById("signupButton-" + screenSize).disabled = false;
    } else {
        $("#check-confirm-" + screenSize).html("&#10006;");
        $("#checkPasswordText-confirm-" + screenSize).html(confirmCheck);
        $("#checkPassword-confirm-" + screenSize).addClass("passwordCheck-notValid-customizable").removeClass(
            "passwordCheck-valid-customizable");
        document.getElementById("signupButton-" + screenSize).disabled = true;
    }
}

function clickCopyToClipboard() {
   setTimeout(function(){
      const domainNode = document.getElementById("cinemasunshine-domain");
      const range = document.createRange();
      range.selectNode(domainNode)
      window.getSelection().addRange(range);
      const rtn = document.execCommand('copy');
      alert(rtn);
      $("#copy-to-clipboard>strong").html("✔　コピーしました")
      $("#copy-to-clipboard").addClass("active");
      setTimeout(function () {
        $("#copy-to-clipboard>strong").html("ドメインをコピーする")
        $("#copy-to-clipboard").removeClass("active");
      }, 10000);
    }, 100);
}

/**
 * クリップボードコピー関数
 * 入力値をクリップボードへコピーする
 * @param  textVal {string} 入力値
 * @return boolean true: 成功　false: 失敗
 */
function copyTextToClipboard(textVal){
  // テキストエリアを用意する
  var temp = document.createElement('textarea');

  temp.value = string;
  temp.selectionStart = 0;
  temp.selectionEnd = temp.value.length;

  var s = temp.style;
  s.position = 'fixed';
  s.left = '-100%';

  document.body.appendChild(temp);
  temp.focus();
  var result = document.execCommand('copy');
  temp.blur();
  document.body.removeChild(temp);
  // true なら実行できている falseなら失敗か対応していないか
  return result;
  /*var copyFrom = document.createElement("textarea");
  copyFrom.textContent = textVal;
  var bodyElm = document.getElementsByTagName("body")[0];
  bodyElm.appendChild(copyFrom);
  copyFrom.select();
  var retVal = document.execCommand('copy');
  bodyElm.removeChild(copyFrom);
  // 処理結果を返却
  return retVal;*/
}

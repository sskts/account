function checkPasswordMatch(screenSize) {
    var passwordPolicy = [];
    passwordPolicy.lowercase = "パスワードには小文字を含める必要があります";
    passwordPolicy.uppercase = "パスワードは大文字でなければなりません";
    passwordPolicy.number = "パスワードには数字が必要です";
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
            if (/[!|@|#|$|%|^|&|*|(|)|-|_]/.test(password)) {
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
    } else {
        document.getElementById("signupButton-" + screenSize).disabled = true;
    }
}
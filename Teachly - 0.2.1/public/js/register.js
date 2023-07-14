function getFile() {
    document.getElementById("upfile").click();
}
function sub(obj) {
    var file = obj.value;
    var fileName = file.split("\\");
    document.getElementById("profile-image").innerHTML = fileName[fileName.length - 1];
}
sendEmailCode = async function () {
    emailCode = $("#email-input").val();
    if (emailCode == "") { return }
    email = $("#email").val();
    res = await axios.get('/auth/emailValidation', { params: { "emailCode": emailCode, "email": email } });
    if (res.data.err) {
        console.log(res.data.err)
        $("#emailcode-err-popup").attr("display", "grid");
        setTimeout(function () {
            $("#emailcode-err-popup").fadeOut('fast')
        }, 1000);
    }
    else {
        window.location = "/"
    }
}
sendSigninReq = async function () {

    function validateEmail(email) {
        const res = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return res.test(String(email).toLowerCase());
    }

    try {
        reader = new FileReader();
        reader.onloadend = () => {
            name = $("#username").val()
            pass = $("#password").val()
            email = $("#email").val()

            if (pass.name < 5) { return }
            if (pass.length < 5) { return }
            if (reader.result.substring(0, 10) != "data:image") { return }
            if (validateEmail(email) == false) { return }

            sendReq([name, reader.result, pass, email])
        };
        reader.readAsDataURL($('#upfile').prop('files')[0])
        sendReq = async function (arr) {
            try {
                formData = {
                    'name': arr[0],
                    'profileImage': arr[1],
                    'password': arr[2],
                    'email': arr[3],
                }
                res = await axios({
                    method: 'post',
                    url: '/auth/register',
                    data: formData,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                if (res.data.err) {
                    $("#err-popup").attr("display", "grid");
                    document.getElementById("err-popup").style.display = "grid";
                    if (res.data.err == "name taken") {
                        $('#name-err').show();
                        $('#email-err').hide();
                        setTimeout(function () {
                            $('#err-popup').fadeOut('fast')
                        }, 1000);
                    }
                    if (res.data.err == "email taken") {
                        $('#name-err').hide();
                        $('#email-err').show();
                        setTimeout(function () {
                            $('#err-popup').fadeOut('fast')
                        }, 1000);
                    }
                }
                else {
                    document.getElementById("email-popup").style.display = "grid";
                    document.getElementById("register").style.visibility = "hidden";
                }
            }
            catch (err) {
                console.log(err)
            }
        }
    }
    catch {
    }
}


window.addEventListener('load', function () {

    document.getElementById("profile-image").addEventListener("click", e => {
        getFile()
    })

    document.getElementById("upfile").addEventListener("change", e => {
        sub(this)
    })

    document.getElementById("send-signin-req").addEventListener("change", e => {
        sendSigninReq()
    })

    
    document.getElementById("email-popup-submit").addEventListener("change", e => {
        sendEmailCode()
    })


})  
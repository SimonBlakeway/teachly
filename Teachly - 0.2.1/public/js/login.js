sendloginReq = async function () {
  try {
    let name = $("#username").val()
    let password = $("#password").val()
    if (name == "" || password == "") { return }
    formData = {
      'name': name,
      'password': password,
    }
    res = await axios({
      method: 'post',
      url: '/auth/login',
      data: formData,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (res.data.err) {
      $("#err-popup").attr("display", "grid");
      document.getElementById("err-popup").style.display = "grid";
      if (res.data.err == "invalid name") {
        $('#name-err').show();
        $('#password-err').hide();
        setTimeout(function () {
          $('#err-popup').fadeOut('fast')
        }, 1000);
      }
      if (res.data.err == "invalid password") {
        $('#name-err').hide();
        $('#password-err').show();
        setTimeout(function () {
          $('#err-popup').fadeOut('fast')
        }, 1000);
      }
    }
    else {
      console.log(res.data)
          window.location = "/" 
    }
  }
  catch (err) { console.log(err) }
}





window.addEventListener('load', async function () {

  document.getElementById("send-login-req").addEventListener('click', event => {
    sendloginReq()
  })


  document.getElementById("onsubmit-return-false").addEventListener('onsubmit', event => {
    console.log("reee")
    return false
  })

})
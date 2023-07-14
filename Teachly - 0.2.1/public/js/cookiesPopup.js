
async function acceptCookies() {
    document.getElementById("cookies-popup").style.display = "none";
    res = await axios({
      method: 'post',
      url: '/auth/settings',
      data: {},
      headers: {
        'Content-Type': 'application/json'
      },
    })
  }



window.addEventListener('load', function () {
    document.getElementById("cookies-popup-submit").addEventListener("click", e => {
        acceptCookies()
    })
})
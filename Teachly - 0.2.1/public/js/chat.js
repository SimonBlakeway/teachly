

socket.on("connect", () => {
    console.log("eerer");
});

socket.on("recieve message", (data) => {
    switchSignaler("notification", turnOn = true)
    notOuter = document.getElementById("notifications-list")
    notOuter.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        box = document.createElement("li")
        box.className = "px-0 mx-0 py-1"
        box.id = `${data[i].notification_id}-notification`
        divClass = ""
        if (data[i].url) { object.onclick = () => { redirectByUrl(data[i].url, data[i].notification_id) } }
        box.innerHTML = `
            <div class="d-flex border-top-light mt-1">
              <div style="width: 220px">
                <div>${data[i].text}</div>
                <div class="pt-1 fs-6" style="color: #f2f2f2">${prettyifyDate(data[i].created_at)}</div>
              </div>
              <div onclick="event.stopPropagation();">
                <div>
                  <div onClick="deleteNotification('${data[i].notification_id}')" class="color-white fs-3" style="margin-left: 10px;"><i class="fa fa-times" aria-hidden="true"></i></div>
                </div>
              </div>
            </div>
              `
        notOuter.appendChild(box)
    }
});

socket.on("disconnect", () => {
    console.log("socket disconected");
});




function navLangSearch() {
    var input, filter;
    input = document.getElementById("nav-language-search-input");
    filter = input.value.toUpperCase();
    list = document.getElementById("language-change").children;
    for (i = 0; i < list.length; i++) {
        txtValue = list[i].textContent || list[i].innerHTML;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            list[i].style.display = "block";
        } else {
            list[i].style.display = "none";
        }
    }
}

function navCurSearch() {
    var input, filter;
    input = document.getElementById("nav-currency-search-input");
    filter = input.value.toUpperCase();
    list = document.getElementById("currency-change").children;
    for (i = 0; i < list.length; i++) {
        txtValue = list[i].textContent || list[i].innerHTML;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            list[i].style.display = "block";
        } else {
            list[i].style.display = "none";
        }
    }
}

function changeNavSettings(settingName, change) {
    changeObj = {
        settingName: settingName,
        change: change
    }
    axios.post('/auth/settings', changeObj)
        .then(res => {
            window.location.reload();
        })
        .catch(err => {
            console.log(error);
        });
}

async function logout() {
    res = await axios.get('/auth/logout');
    if (res.data.err) {
        console.log(res.data.err)
    }
    else {
        window.location = "/"
    }

}

function toggleNavPopup(id) {
    var popup = document.getElementById(id);
    if ((popup.style.display != "block")) {
        clearNavPopups()
        popup.style.display = "block";
        popup.style.visibility = "visible";
        try {
            document.getElementById("nav-" + id.split("-")[0] + "-search-input").focus(); //auto focus on input in popup
        }
        catch {
        }
    }
    else {
        popup.style.display = "none";
        popup.style.visibility = "hidden";
    }
}

function clearNavPopups() {
    popupArr = document.getElementsByClassName("nav-popup")
    for (i = 0; i < popupArr.length; i++) {
        popupArr[i].style.display = "none";
        popupArr[i].style.visibility = "hidden";
    }
}

window.addEventListener('load', function () {

    async function langSetup() {
        arr = languageArr.sort((a, b) => { return a[0].localeCompare(b[0], userLang) })
        for (let i = 0; i < arr.length; i++) {
            langPair = arr[i].split(",")
            node = document.createElement("li");
            node.innerHTML = `<div class="nav-li" onclick='changeNavSettings("lang", "${langPair[1]}")'>${langPair[0]}</div>`;
            document.getElementById("language-change").appendChild(node);
        }
    }
    async function curSetup() {
        arr = currenciesArr.sort((a, b) => { return a.split(",")[0].localeCompare(b.split(",")[0], userLang) })
        for (let i = 0; i < arr.length; i++) {
            node = document.createElement("li");
            node.innerHTML = `<div class="nav-li" onclick='changeNavSettings("cur","${arr[i]}")''>${arr[i]}</div>`;
            document.getElementById("currency-change").appendChild(node);
        }
    }

    langSetup()
    curSetup()
})


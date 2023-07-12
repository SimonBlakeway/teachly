const origin = window.location.origin;
var socket;
refresh = () => axios({ method: 'post', url: `/auth/refresh-token` }).catch(error => { /* handle error here */ });
now = () => Math.floor(Date.now() / 1000)
var refreshInterval = 0;


setRefreshInterval = () => {
    refreshInterval = refreshInterval = setInterval(() => {
        refresh()
        lastRefresh = now()
    }, (1000 * 60 * 10))
}
setRefreshTimeout = async () => {
    refreshInterval = setTimeout(() => {
        refresh();
        setRefreshInterval();
    }, ((60 * 10) - (now() - lastRefresh)) * 1000)

}


async function socketSetup() {
    socket = io.connect(origin);


    socket.on("connect", () => {
        console.log("socket connected");
    });

    socket.on("old notifications", (data) => {
        switchSignaler("notification", turnOn = true)
        notOuter = document.getElementById("notifications-list")
        notOuter.innerHTML = '';
        for (let i = 0; i < data.length; i++) {
            box = document.createElement("li")
            box.className = "px-0 mx-0 py-1"
            box.id = `${data[i].notification_id}-notification`
            divClass = ""
            if (data[i].url) { object.onclick = () => { redirectByUrl(data[i].url, data[i].notification_id) } }

            function genInner() {

                inner = `
                <div class="d-flex border-top-light mt-1">
                  <div class="w-220p">
                    <div>${data[i].text}</div>
                    <div class="pt-1 fs-6 clr-f2f2f2">${prettyifyDate(data[i].created_at)}</div>
                  </div>
                  <div onclick="event.stopPropagation();">
                    <div>
                      <div onClick="deleteNotification('${data[i].notification_id}')" class="color-white fs-3 ml-10p"><i class="fa fa-times" aria-hidden="true"></i></div>
                    </div>
                  </div>
                </div>
                  `

                outDiv = document.createElement("div")
                outDiv.className = "d-flex border-top-light mt-1"

                in1 = document.createElement("div")
                in1.className = "w-220p"
                in1.innerHTML = `
                  <div>${data[i].text}</div>
                  <div class="pt-1 fs-6 clr-f2f2f2">${prettyifyDate(data[i].created_at)}</div>
                  `

                in2 = document.createElement("div")
                in2.addEventListener('click', event => {
                    event.stopPropagation();
                })

                in2in = document.createElement("div")
                in2in2 = document.createElement("div")
                in2in2.addEventListener('click', event => {
                    deleteNotification(`${data[i].notification_id}`)
                })
                in2in2.className = "color-white fs-3 ml-10p"
                in2in2.innerHTML = `<i class="fa fa-times" aria-hidden="true"></i>`


                in2in.appendChild(in2in2)
                in2.appendChild(in2in)

                outDiv.append(in1, in2)
                return outDiv
            }
            box = genInner()
            notOuter.appendChild(box)
        }
    });

    socket.on("old messages", (data) => {
        console.log("old messages");
        console.log(data)
    });

    socket.on("notification", (data) => {
        switchSignaler("notification", turnOn = true)
        console.log("notifications");
        console.log(data)

        notOuter = document.getElementById("notifications-list")
        console.log([data.length], "free")

        for (let i = 0; i < data.length; i++) {

            box = createElement("li")
            box.innerHTML = `
                  <div>${data[i].text}</div>
                  <div>${data[i].created_at}</div>
                  `
            notOuter.appendChild(box)
        }
    });

    socket.on("message", (data) => {
        switchSignaler("message", turnOn = true)

        //fill messages
        console.log("old messages");
        console.log(data)
    });

    socket.on("disconnect", () => {
        console.log("socket disconected");
    });
}

async function initialLoad() {
    if ((now() - lastRefresh) > (60 * 5)) { await axios({ method: 'post', url: `/auth/refresh-token` }) }
    socketSetup()
    setRefreshTimeout()
}

initialLoad()

window.addEventListener('online', function (event) {
    setRefreshTimeout()
});
window.addEventListener('offline', function (event) {
    clearInterval(refreshInterval)
});


function switchSignaler(id, turnOn = false) {
    signaler = document.getElementById(`${id}-signaler`)
    if (turnOn) {
        signaler.style.display = "block"
        return
    }
    if (signaler.style.display == "block") {
        signaler.style.display = "none"
    }
    else {
        signaler.style.display = "block"
    }
}
function deleteNotification(notId) {
    removeElement(`${notId}-notification`)
    socket.emit('delete notification', notId);

}
function redirectByUrl(url, notId) {
    notification = document.getElementById(`${id}-notification`)
    socket.emit('delete notification', notId);
    if (url[0] == "/") { //in house redirect
        window.location.href = origin + url;
    }
    else { //out house redirect
        window.location.href = url;
    }
}
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
        box = document.createElement("div")
        arr = languageArr.sort((a, b) => { return a[0].localeCompare(b[0], userLang) })
        for (let i = 0; i < arr.length; i++) {
            langPair = arr[i].split(",")
            node = document.createElement("li");
            //node.innerHTML = `<div class="nav-li" onclick='changeNavSettings("lang", "${langPair[1]}")'>${langPair[0]}</div>`;
            div = document.createElement("div")
            div.className = "nav-li"
            div.innerHTML = `${langPair[0]}`
            div.addEventListener("click", e => {
                changeNavSettings("lang", `${langPair[1]}`)
            })
            node.append(div)
            box.appendChild(node);
        }
        document.getElementById("language-change").innerHTML = box.innerHTML
    }
    async function curSetup() {
        arr = currenciesArr.sort((a, b) => { return a.split(",")[0].localeCompare(b.split(",")[0], userLang) })
        box = document.createElement("div")
        for (let i = 0; i < arr.length; i++) {
            node = document.createElement("li");
            node.innerHTML = `<div class="nav-li" onclick='changeNavSettings("cur","${arr[i]}")''>${arr[i]}</div>`;

            div = document.createElement("div")
            div.className = "nav-li"
            div.innerHTML = `${arr[i]}`
            div.addEventListener("click", e => {
                changeNavSettings("cur", `${arr[i]}`)
            })
            node.append(div)
            box.appendChild(node);
        }
        document.getElementById("currency-change").innerHTML = box.innerHTML
    }

    langSetup()
    curSetup()



    document.getElementById("clear-nav-popups").addEventListener('click', event => {
        clearNavPopups()
    })

    document.getElementById("toggle-navlist-popup").addEventListener('click', event => {
        toggleNavPopup('navlist-popup')
    })

    document.querySelectorAll('.toggle-nav-lang-popup').forEach(el => el.addEventListener('click', event => {
        toggleNavPopup('language-popup')
    }));

    document.querySelectorAll('.toggle-nav-currency-popup').forEach(el => el.addEventListener('click', event => {
        toggleNavPopup('currency-popup')
    }));

    document.getElementById("toggle-nav-notifications-popup").addEventListener('click', event => {
        toggleNavPopup('notifications-popup')
    })

    document.getElementById("toggle-nav-messages-popup").addEventListener('click', event => {
        toggleNavPopup('messages-popup')
    })

    document.getElementById("toggle-nav-profile-popup").addEventListener('click', event => {
        toggleNavPopup('profile-popup')
    })

    document.getElementById("nav-currency-search-input").addEventListener('keyup', event => {
        navCurSearch()
    })

    document.getElementById("nav-language-search-input").addEventListener('keyup', event => {
        navLangSearch()
    })

})

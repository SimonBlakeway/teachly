
var nav = document.getElementById('navlist');

function windowResizeHandler() {
    if (window.innerWidth > 1045) {
        nav.style.visibility = "visible";
        nav.style.display = "block";

    }
    else {
        nav.style.display = "none";
        nav.style.visibility = "hidden";
    }
}

function toggleNav() {

    if (nav.style.display === "none") {
        nav.style.display = "block";
        nav.style.visibility = "visible";
    }

    else {
        nav.style.display = "none";
        nav.style.visibility = "hidden";
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
var a = "ss"

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

    var nav = document.getElementById('navlist');

    if (window.innerWidth > 1045) {
        nav.style.visibility = "visible";
        nav.style.display = "block";
    }
    else {
        nav.style.display = "none";
        nav.style.visibility = "hidden";
    }

    window.addEventListener("resize", windowResizeHandler);



    axios.get('/get/validLanguages').then(res => {
        if (res.data == "404") { }
        else {
            arr = res.data.sort((a, b) => { return a[0].localeCompare(b[0], userLang) })
            for (let i = 0; i < arr.length; i++) {
                node = document.createElement("li");
                node.innerHTML = `<div class="nav-li" onclick='changeNavSettings("lang", "${arr[i][1]}")'>${arr[i][0]}</div>`;
                document.getElementById("language-change").appendChild(node);
            }
        }
    })


    axios.get('/get/validCurrencies').then(res => {
        if (res.data == "404") { }
        else {
            arr = res.data.sort((a, b) => { return a.localeCompare(b, userLang) })
            for (let i = 0; i < arr.length; i++) {
                node = document.createElement("li");
                node.innerHTML = `<div class="nav-li" onclick='changeNavSettings("cur","${arr[i]}")''>${arr[i]}</div>`;
                document.getElementById("currency-change").appendChild(node);
            }
        }
    })
})





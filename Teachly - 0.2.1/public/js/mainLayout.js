
toLocalCurClass = new Intl.NumberFormat(userLang, { //method call
    style: 'currency',
    currency: userCur,
});

function toLocalCur(num) {
    return toLocalCurClass.format(num)
}
function updateCurrency(ratio) {
    curVals = document.getElementsByClassName("currency")
    for (let i = 0; i < curVals.length; i++) {
        convertedCur = Number(curVals[i].children[0].innerHTML) * Number(ratio)
        curVals[i].children[1].innerHTML = toLocalCur(convertedCur)
    }
}
function updateCurrencyInterval() {
    setInterval(async function () {
        try {
            res = await axios({ method: 'get', url: `/get/curConversionRatio/${userCur}` })
            if (res.data.ratio != undefined) {
                updateCurrency(res.data.ratio)
                curConversionRatio = res.data.ratio
            }
        }
        catch (err) {
        }
    }, 300000);
    window.addEventListener('load', function () { updateCurrency(curConversionRatio) }, false);
}
function updateDatesInterval() {
    setInterval(function () {
        try {
            updateDates()
        }
        catch (err) {
            console.log(err)
        }
    }, 5000);
    window.addEventListener('load', function () { updateCurrency(curConversionRatio) }, false);

}
function removeElement(id) {
    node = document.getElementById(id)
    node.parentNode.removeChild(node);
}
function toLocalNum(num) {
    try {
        return num.toLocaleString(userLang);
    }
    catch (err) {
        num = 0
        return num.toLocaleString(userLang);
    }
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function createOnScreenNotification(text) {
    notBox = document.getElementById("screen-notifications")
    newNotDiv = document.createElement("div")
    newNotDiv.className = "br-40p p-5p pl-20p pr-20p bg-aqua"
    randInt = getRandomInt(99999999999)
    randInt = crypto.getRandomValues(new Uint32Array(1))[0] //math.random didn't work, was overlap
    newNotDiv.innerHTML = text
    let id = `screen-notification-${randInt}`
    newNotDiv.id = id
    notBox.prepend(newNotDiv)
    setTimeout(() => {
        $(`#${id}`).fadeOut('fast', () => {
            document.getElementById(`${id}`).remove()
        })
    }, 1000);
}

function fadeout(id, callback) {
    /*
    obj = {
        id: id pointing to element,
    }
    */
    let element = document.getElementById(id)
    animClasses = ["anim-dur-1000", "anim-perm", "anim-n-disappear"]
    element.classList.add(...animClasses)

    setTimeout(async function () {
        element.classList.add("display-nonei")
        element.classList.remove(...animClasses)

        callback()
    }, 1000)

}

updateCurrencyInterval(userCur)

updateDatesInterval()

window.addEventListener('load', function () {
    document.querySelectorAll('.stop-prop').forEach(el => el.addEventListener('click', event => {
        event.stopPropagation();
    }));

    document.querySelectorAll('.onsubmit-return-false').forEach(el => el.addEventListener('submit', e => {
        e.preventDefault();
    }));
})




function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
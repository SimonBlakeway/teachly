function updateCurrency(ratio) {
    curVals = document.getElementsByClassName("currency")
    for (let i = 0; i < curVals.length; i++) {
        convertedCur = Number(curVals[i].children[0].innerHTML) * Number(ratio)
        convertedCur = convertedCur.toLocaleString(userLang, { style: 'currency', currency: userCur });
        curVals[i].children[1].innerHTML = convertedCur
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
        console.log("toLocalNum")
        console.log(num)
        console.log(err)
        num = 0
        return num.toLocaleString(userLang);
    }
}





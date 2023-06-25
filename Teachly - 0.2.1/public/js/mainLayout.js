

toLocalCurClass = new Intl.NumberFormat(userLang, { //method call
    style: 'currency',
    currency: userCur,
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
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


updateCurrencyInterval(userCur)

updateDatesInterval()







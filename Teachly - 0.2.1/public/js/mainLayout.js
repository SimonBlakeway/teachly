function prettyifyDate(date) { // it comes in as seconds from epoch
    var secs = date - Math.floor(Date.now() / 1000)
    if (secs < 60) return secs + " sec(s) ago";
    if (secs < 3600) return Math.floor(secs / 60) + " min(s) ago";
    if (secs < 86400) return Math.floor(secs / 3600) + " hour(s) ago";
    if (secs < 604800) return Math.floor(secs / 86400) + " day(s) ago";
    return date.toDateString();
}
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
            if (res.data.ratio != undefined) { updateCurrency(res.data.ratio) }
            else { }
            console.log(res)
        }
        catch (err) {
        }
    }, 300000);
    window.addEventListener('load', function () { updateCurrency(curConversionRatio) }, false);
}
const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",]
const currentDay = days[new Date().getDay()]
const dayIndex = new Date().getDay()
const adaptedDays = [...days.slice(dayIndex, days.length), ...days.slice(0, dayIndex)]
const nowInMinutes = Math.floor(Date.now() / 1000)
const timeOffset = new Date().getTimezoneOffset() / 60



function formDataSetup() {
    teachlyFormDataDefault = {
        "subject": subject,
        "specialities": [],
        "priceRange": [0.05, 5],
        "searchby": "",
        "taughtIn": [userLang],
        "orderBy": "Popularity",
        "courseTime": [20, 60],
        "activePage": 1,
        "availableTimeRanges": [],
        "pageAmount": 1,

    }
    teachlyFormData = JSON.parse(localStorage.getItem("TeachlyFormData"))

    if (teachlyFormData === null) {
        teachlyFormData = teachlyFormDataDefault
        localStorage.setItem("TeachlyFormData", JSON.stringify(teachlyFormData))
    }

    if (teachlyFormData.subject != teachlyFormDataDefault.subject) {
        teachlyFormData = teachlyFormDataDefault
        localStorage.setItem("TeachlyFormData", JSON.stringify(teachlyFormData))
    }

    if (!(teachlyFormData.specialities.includes(speciality)) && speciality != "") {
        teachlyFormData = teachlyFormDataDefault
        teachlyFormData.specialities.push(speciality)
    }
    for (i = 0; i < teachlyFormData.specialities.length; i++) {
        document.getElementById(teachlyFormData.specialities[i].replaceAll("'", "&apos").replaceAll(" ", "-")).checked = true;
    }

    range1Shown = document.getElementById('min-price-shown');
    range2Shown = document.getElementById('max-price-shown');

    range1Shown.setAttribute("data-amount-in-usd", teachlyFormData.priceRange[0])
    range2Shown.setAttribute("data-amount-in-usd", teachlyFormData.priceRange[1])

    range1Shown.innerHTML = teachlyFormData.priceRange[0] * curConversionRatio;
    range2Shown.innerHTML = teachlyFormData.priceRange[1] * curConversionRatio;

    regularSlider = document.querySelector('.regular-slider')
    prefixFormat = wNumb({ decimals: 2 })

    slider = noUiSlider.create(regularSlider, {
        start: [teachlyFormData.priceRange[0] * curConversionRatio, teachlyFormData.priceRange[1] * curConversionRatio],
        connect: true,
        margin: 0.05 * curConversionRatio,
        range: { min: 0.05 * curConversionRatio, max: 5 * curConversionRatio },
        tooltips: [prefixFormat, prefixFormat],
        pips: {
            mode: 'count',
            values: 5,
            density: -1
        },
    })
    slider.on('update', function (values) {
        updateformData("priceRange", values)
    })

    prefixFormatTime = wNumb({ decimals: 0 })
    timeSlider = document.querySelector('.time-slider')
    slider = noUiSlider.create(timeSlider, {
        start: [teachlyFormData.courseTime[0], teachlyFormData.courseTime[1]],
        connect: true,
        step: 1,
        margin: 5,
        range: { min: 20, max: 60 },
        tooltips: [prefixFormatTime, prefixFormatTime],
        pips: {
            mode: 'count',
            values: 5,
            density: -1
        },
    })
    slider.on('update', function (values) {
        updateformData("courseTime", values)
    })

    document.getElementById("min-course-time").innerHTML = teachlyFormData.courseTime[0]
    document.getElementById("max-course-time").innerHTML = teachlyFormData.courseTime[1]

    setInterval(async function () {
        try {
            priceRange = JSON.parse(localStorage.getItem("TeachlyFormData")).priceRange
            range1Shown = document.getElementById('min-price-shown');
            range2Shown = document.getElementById('max-price-shown');

            minSelectedPriceInUSD = Number(range1Shown.getAttribute("data-amount-in-usd"))
            maxSelectedPriceInUSD = Number(range2Shown.getAttribute("data-amount-in-usd"))

            slider.updateOptions({
                step: 0.05 * curConversionRatio,
                margin: 0.05 * curConversionRatio,
                range: { min: 0.05 * curConversionRatio, max: 5 * curConversionRatio },
            });
            slider.set([minSelectedPriceInUSD * curConversionRatio, maxSelectedPriceInUSD * curConversionRatio]);
        }
        catch (err) {
            console.log(err)
        }
    }, 300000);

    document.getElementById("searchBy-input").value = teachlyFormData.searchby;
    document.getElementById(teachlyFormData.orderBy.replaceAll(" ", "-")).checked = true;
    document.getElementById('orderBy-button').innerHTML = teachlyFormData.orderBy;


    for (i = 0; i < teachlyFormData.taughtIn.length; i++) {
        document.getElementById(teachlyFormData.taughtIn[i]).checked = true;
    }


    cleanedCalenderTimesArr = []
    for (i = 0; i < teachlyFormData.availableTimeRanges.length; i++) {
        range = teachlyFormData.availableTimeRanges[i]
        start = range[0]
        finish = range[1]


        if (start > nowInMinutes) { // times isn't in the past
            cleanedCalenderTimesArr.push(range)
            day = (days[new Date(start * 1000).getDay()])
            start = convertIntegerToTime(start)
            finish = convertIntegerToTime(finish)
            addTimeCalenderFromMemory("searchCalenderTimes", day, start, finish)
        }
    }
    teachlyFormData.availableTimeRanges = cleanedCalenderTimesArr

    localStorage.setItem("TeachlyFormData", JSON.stringify(teachlyFormData))
}

function updateformData(type, val) {
    teachlyFormData = JSON.parse(localStorage.getItem("TeachlyFormData"))
    if (type == "specialities") {
        val = val.replaceAll("&apos", "'").replaceAll("-", " ")
        index = teachlyFormData["specialities"].indexOf(val)
        if (index != -1) { teachlyFormData["specialities"].splice(index, 1) }
        else { teachlyFormData["specialities"].push(val) }
    }
    else if (type == "priceRange") {
        min = val[0] / curConversionRatio;
        max = val[1] / curConversionRatio;

        range1Shown = document.getElementById('min-price-shown');
        range2Shown = document.getElementById('max-price-shown');

        range1Shown.setAttribute("data-amount-in-usd", min)
        range2Shown.setAttribute("data-amount-in-usd", max)


        range1Shown.innerHTML = val[0]
        range2Shown.innerHTML = val[1]
        teachlyFormData["priceRange"] = [min, max];
        updateCurrency(curConversionRatio)
    }
    else if (type == "searchBy") {
        teachlyFormData.searchby = document.getElementById(val).value;
    }
    else if (type == "taughtIn") {
        index = teachlyFormData["taughtIn"].indexOf(val.replaceAll("-", " "))
        if (index != -1) { teachlyFormData["taughtIn"].splice(index, 1) }
        else { teachlyFormData["taughtIn"].push(val.replaceAll("-", " ")) }
    }
    else if (type == "orderBy") {
        document.getElementById('orderBy-button').innerHTML = val.replaceAll("-", " ");
        teachlyFormData["orderBy"] = val.replaceAll("-", " ")
    }
    else if (type == "calenderTimes") {
        range = val[0]
        actionType = val[1]

        if (actionType == "removeTime") {

            teachlyFormData.availableTimeRanges

            for (let index = 0; index < teachlyFormData.availableTimeRanges.length; index++) {
                const element = teachlyFormData.availableTimeRanges[index];
                if ((element[0] = range[0]) && (element[1] = range[1])) {
                    preElements = teachlyFormData.availableTimeRanges.splice(0, index)
                    portElements = teachlyFormData.availableTimeRanges.splice(index, teachlyFormData.availableTimeRanges.length)
                    teachlyFormData.availableTimeRanges = [...preElements, ...portElements]
                    break;
                }
            }
        }
        else {
            teachlyFormData.availableTimeRanges.push(range)
        }
    }
    else if (type == "courseTime") {
        min = `${val[0]}`.split(".")[0];
        max = `${val[1]}`.split(".")[0];
        document.getElementById('min-course-time').innerHTML = min
        document.getElementById('max-course-time').innerHTML = max
        teachlyFormData["courseTime"] = [min, max];
    }
    else if (type == "pageNum") {
        if (teachlyFormData.pageNum == val) {
            return
        }
        else {
            teachlyFormData.pageNum = val
            searchCourses()
        }
    }
    localStorage.setItem("TeachlyFormData", JSON.stringify(teachlyFormData))
}

function searchBox(boxId, inputId) {
    filter = document.getElementById(inputId).value.toUpperCase();
    boxChildren = document.getElementById(boxId).children;
    for (i = 0; i < boxChildren.length; i++) {
        txtValue = boxChildren[i].textContent || boxChildren[i].innerHTML;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            boxChildren[i].style.display = "";
        } else {
            boxChildren[i].style.display = "none";
        }
    }
}

function clearSearchBarPopups() {
    popupArr = document.getElementsByClassName("popup")
    for (i = 0; i < popupArr.length; i++) {
        popupArr[i].style.display = "none";
        popupArr[i].style.visibility = "hidden";
    }
}

function toggleSearchBarPopup(id) {
    subjectPopup = document.getElementById(id);
    if (subjectPopup.style.display == "block") {
        subjectPopup.style.display = "none";
        subjectPopup.style.visibility = "hidden";
    }
    else {
        clearSearchBarPopups()
        subjectPopup.style.display = "block";
        subjectPopup.style.visibility = "visible";
    }
}

function getUTCTimeStampNoHours(date = new Date()) {
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    ).getTime()
}

function generateCalenderTimeTable(calenderId) {
    //calenderId: str, valid css/html class/id, no "-"

    timeRange = document.createElement("div")
    timeRange.id = `calender-outer-${calenderId}`
    timeRange.className = "w-300pi h-300pi p-0 m-0 m-0pi p-0pi bg-white brdr-r-2 custom-shadow position-absolute"

    //generate days
    for (let i = 0; i < 7; i++) {
        let day = adaptedDays[i]
        outerDiv = document.createElement("div");
        outerDiv.className = "row container d-flex align-items-center justify-content-center px-0 w-255p p-0 m-0 pb-3 w-300pi h-300pi";
        dayVal = document.createElement("div");
        outerDiv.id = `${i}-calender-${calenderId}`
        dayVal.className = "h-50pi fs-30p m-0pi p-0pi bg-blacki clr-white user-select-none brdr-r-2 display-flex justify-content-space-between w-300pi h-300pi"

        if (i == 0) {
            outerDiv.className = "h-50pi w-100 text-center fs-30p m-0pi p-0pi bg-blacki brdr-r-5p w-300pi h-300pi"
            dayVal.innerHTML = `
        <button type="button"class="m-1 w-60p display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline disabled">prev</button>
        <div class="display-inline">
        <span class="user-select-none fs-25p" id="day-${day}-goto">${day}</span>
        </div>
        <button id="goto-cal-day-${i + 1}-from-${i}-${calenderId}"  type="button" class="m-1 display-inline bg-blacki h-40p w-60p fs-20p btn btn-outline-primary display-inline goto-calender-day-button">next</button>
            `;

        }
        else if (i == 6) {
            outerDiv.className = "px-0 h-50pi w-100 text-center fs-30p px-0 bg-blacki display-nonei"
            dayVal.innerHTML = `
            <button type="button" id="goto-cal-day-${i - 1}-from-${i}-${calenderId}" class="m-1 mx-3 float-left display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline goto-calender-day-button">prev</button>
            <div class="display-inline">
            <span class="user-select-none fs-25p" id="day-${day}-goto">${day}</span>
            </div>
            <button type="button" class="m-1 mx-3 float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline" disabled>next</button>
            `;
        }
        else {
            outerDiv.className = "px-0 h-50pi w-100 text-center fs-30p px-0 bg-blacki display-nonei"
            dayVal.innerHTML = `
            <button type="button" id="goto-cal-day-${i - 1}-from-${i}-${calenderId}" class="m-1 mx-3 float-left display-inline bg-blacki h-40p fs-20p btn btn-outline-primary goto-calender-day-button">prev</button>
            <div class="display-inline">
            <span class="user-select-none fs-25p" id="day-${day}-goto">${day}</span>
            </div>       
            <button type="button" id="goto-cal-day-${i + 1}-from-${i}-${calenderId}" class="m-1 mx-3 float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary goto-calender-day-button">next</button>
        `;
        }

        outerDiv.appendChild(dayVal);
        let box = document.createElement("div");
        box.id = `${day}-dates`
        box.className = "inline-grid-r-auto2-c-auto2 justify-items-center align-items-center grid-gap-3p m-0 p-0"

        innerDiv = document.createElement("div");
        innerDiv.className = "w-40p p-0 fs-15p text-center d-flex align-items-center justify-content-center brdr-r-5 h-30pi my-1 bg-blacki h-40p fs-20p btn btn-outline-primary"
        innerDiv.innerHTML = `+`;
        innerDiv.addEventListener("click", e => {
            toggleCalenderDayPopup(calenderId, day)

        })
        box.appendChild(innerDiv);
        outerDiv.append(box)

        timeRange.appendChild(outerDiv);
    }

    //genreate add time popup

    addTimePopup = document.createElement("div")
    addTimePopup.id = `${calenderId}-add-time-popup`
    addTimePopup.className = "display-nonei w-300pi h-200pi p-0 m-0 bg-white brdr-r-2 brdr-w-5p border-style-solid brdr-clr-white custom-shadow position-absolute"
    addTimePopup.addEventListener("click", e => {
        e.stopPropagation();
    })
    header = document.createElement("div");
    header.className = "h-50pi w-100 text-center fs-30p px-0 bg-blacki clr-white user-select-none brdr-r-2"
    span = document.createElement("span")
    span.id = `${calenderId}-add-time-calender-day`
    button = document.createElement("button")
    button.type = "button"
    button.className = "m-1 mx-3 float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline"
    button.addEventListener("click", e => {
        toggleCalenderDayPopup(calenderId)
    })
    button.innerHTML = " ╳ "

    body = document.createElement("div")
    body.id = "add-time-calender-body"


    header.append(span, button)

    addTimePopup.append(header, body)

    timeRange.append(addTimePopup)
    return timeRange
}

function toggleCalenderDayPopup(calenderId, day) {
    if (typeof day == "undefined") {
        dayName = window[`${calenderId}-activeCalenderDay`]
        document.getElementById(`${dayName}-dates`).classList.remove("display-nonei")
        document.getElementById(`${calenderId}-add-time-popup`).classList.add("display-nonei")
        return
    }
    window[`${calenderId}-activeCalenderDay`] = day

    document.getElementById(`${calenderId}-add-time-popup`).classList.remove("display-nonei")
    document.getElementById(`${day}-dates`).classList.remove("display-nonei")

    document.getElementById(`${calenderId}-add-time-calender-day`).innerHTML = day


    box = document.getElementById("add-time-calender-body")
    currentMinutes = new Date().getMinutes() + 5
    currentHours = new Date().getHours()

    function makeSureMaxIsGood(e) {
        startTime = convertTimeToInteger(getCustomTimeDateInfo("startTimeDate", "currentTimeStr"))
        endTime = convertTimeToInteger(getCustomTimeDateInfo("endTimeDate", "currentTimeStr"))

        updateCustomTimeDateSettings("endTimeDate", {
            updateType: "max",
            updateVal: startTime + 60
        })
        updateCustomTimeDateSettings("endTimeDate", {
            updateType: "min",
            updateVal: startTime + 20
        })
    }
    {
        divOuter = document.createElement("div")
        divOuter.className = "p-3 px-5"

        divInner1 = document.createElement("div")
        divInner1.className = "float-left"

        divInner1Text = document.createElement("div")
        divInner1Text.innerHTML = "Start"

        divInner1Input = document.createElement("div")
        divInner1Input.className = ""
        baseMin = 1
        if (adaptedDays.indexOf(day) == 0) {
            baseMin = (currentHours * 60) + currentMinutes
        }
        divInner1Input.append(createCustomTimeDate({
            id: "startTimeDate",
            max: 1440, //5 min before midnight
            min: baseMin,
            eventListeners: [
                {
                    eventType: "input",
                    eventFunction: makeSureMaxIsGood
                }
            ]
        }))
        divInner1.append(divInner1Text, divInner1Input)

        divInner2 = document.createElement("div")
        divInner2.className = "float-right"

        divInner2Text = document.createElement("div")
        divInner2Text.className = "m-0 p-0"
        divInner2Text.innerHTML = "Finish"

        divInner2Input = document.createElement("div")
        divInner2Input.className = ""
        divInner2Input.append(createCustomTimeDate({
            id: "endTimeDate",
            max: 1440, //5 min before midnight
            min: baseMin + 20,
            eventListeners: [
                {
                    eventType: "input",
                    eventFunction: makeSureMaxIsGood
                }
            ]
        }))

        divInner2.append(divInner2Text, divInner2Input)

        buttonOuter = document.createElement("div")
        buttonOuter.className = "w-100 p-0 m-0 d-flex align-items-center justify-content-center h-60pi"

        button = document.createElement("button")
        button.type = "button"
        button.id = "add-time-calender"
        button.className = "btn btn-outline-primary bg-blacki"
        button.innerHTML = "Submit"
        button.addEventListener("click", e => {
            addTimeCalender(calenderId, day)
        })

        buttonOuter.append(button)

        divOuter.append(divInner1, divInner2)

        box.innerHTML = '';
        box.append(divOuter, buttonOuter)

    }
}

function addTimeCalender(calenderId) {

    day = window[`${calenderId}-activeCalenderDay`]

    toggleCalenderDayPopup(calenderId)

    startDate = getCustomTimeDateInfo("startTimeDate", "currentTimeStr")
    endDate = getCustomTimeDateInfo("endTimeDate", "currentTimeStr")

    base = Math.floor(getUTCTimeStampNoHours() / 1000)

    startDateInMinutes = parseInt(startDate.split(":")[0] * 60) + parseInt(startDate.split(":")[1])
    endDateInMinutes = parseInt(endDate.split(":")[0] * 60) + parseInt(endDate.split(":")[1])
    dayNum = adaptedDays.indexOf(day)
    startDateTimeStamp = base + (dayNum * (60 * 60 * 24)) + (startDateInMinutes * 60)
    endDateTimeStamp = base + (dayNum * (60 * 60 * 24)) + (endDateInMinutes * 60)

    updateformData("calenderTimes", [[startDateTimeStamp, endDateTimeStamp], "addTime"])

    dateBox = document.getElementById(`${day}-dates`)

    let id = `${getRandomInt(999999999999999)}-${day}-calender-date-${calenderId}`

    timeDiv = document.createElement("div")
    timeDiv.id = `${id}`
    timeDiv.className = `w-136pi p-0 fs-15p d-flex brdr-r-5 h-30pi my-1 bg-blacki h-40p fs-20p btn btn-outline-primary calender-time-${calenderId}`

    timeText = document.createElement("div")
    timeText.innerHTML = `${startDate} - ${endDate}`
    timeText.className = "w-108pi pt-2p h-30pi"

    timeRemove = document.createElement("button")
    timeRemove.className = "float-right text-btn bg-blacki btn btn-outline-primary h-28pi d-flex align-items-center justify-content-center w-28pi"
    timeRemove.type = "button"
    timeRemove.innerHTML = `<div class="fs-w-bolder mb-3-5pi">  ╳  </div>`
    timeRemove.addEventListener("click", e => {
        removeTimeCalender(calenderId, id)
    })
    timeDiv.append(timeText, timeRemove)

    dateBox.removeChild(dateBox.lastChild); //remove addTime button


    let times = document.querySelectorAll(`.calender-time-${calenderId}`).length
    if (times == 11) { //if range is full
        dateBox.append(timeDiv)
    }
    else {
        addDateButton = document.createElement("div");
        addDateButton.className = "w-40p p-0 fs-15p text-center d-flex align-items-center justify-content-center brdr-r-5 h-30p my-1 bg-blacki fs-20p btn btn-outline-primary"
        addDateButton.innerHTML = "+";
        addDateButton.addEventListener("click", e => {
            toggleCalenderDayPopup(calenderId, day)
        })
        dateBox.append(timeDiv, addDateButton)
    }
}

function addTimeCalenderFromMemory(calenderId, day, startDate, endDate) {



    let dateBox = document.getElementById(`${day}-dates`)
    let id = `${getRandomInt(999999999999999)}-${day}-calender-date-${calenderId}`


    timeDiv = document.createElement("div")
    timeDiv.id = `${id}`
    timeDiv.className = `w-136pi p-0 fs-15p d-flex brdr-r-5 h-30pi my-1 bg-blacki h-40p fs-20p btn btn-outline-primary calender-time-${calenderId}`


    let timeText = document.createElement("div")
    timeText.innerHTML = `${startDate} - ${endDate}`
    timeText.className = "w-108pi pt-2p"

    let timeRemove = document.createElement("button")
    timeRemove.className = "float-right text-btn bg-blacki btn btn-outline-primary h-28pi d-flex align-items-center justify-content-center w-28pi"
    timeRemove.type = "button"
    timeRemove.innerHTML = `<div class="fs-w-bolder mb-3-5pi">  ╳  </div>`
    timeRemove.addEventListener("click", e => {
        removeTimeCalender(calenderId, id)
    })
    timeDiv.append(timeText, timeRemove)


    let addDateButton = document.createElement("div");
    addDateButton.className = "w-40p p-0 fs-15p text-center d-flex align-items-center justify-content-center brdr-r-5 h-30pi my-1 bg-blacki fs-20p btn btn-outline-primary"
    addDateButton.innerHTML = "+";
    addDateButton.addEventListener("click", e => {
        toggleCalenderDayPopup(calenderId, day)
    })

    dateBox.removeChild(dateBox.lastChild); //remove addTime button
    dateBox.append(timeDiv, addDateButton)

}

function removeTimeCalender(calenderId, timeId) {
    let timesDiv = document.getElementById(timeId)
    let day = timesDiv.id.split("-")[1]
    let dayNum = adaptedDays.indexOf(day)
    times = timesDiv.children[0].innerHTML.split(" - ")
    startDate = times[0]
    endDate = times[1]

    base = Math.floor(getUTCTimeStampNoHours() / 1000)

    startDateInMinutes = parseInt(startDate.split(":")[0] * 60) + parseInt(startDate.split(":")[1]) * 1000
    endDateInMinutes = parseInt(endDate.split(":")[0] * 60) + parseInt(endDate.split(":")[1]) * 1000

    startDateTimeStamp = base + (dayNum * (60 * 24)) + startDateInMinutes
    endDateTimeStamp = base + (dayNum * (60 * 24)) + endDateInMinutes

    updateformData("calenderTimes", [[startDateTimeStamp, endDateTimeStamp], "removeTime"])
    removeElement(timeId)
}

function clearCoursePopups() {
    let popups = document.querySelectorAll(`.active-course-popup`)
    for (let index = 0; index < popups.length; index++) {
        const popup = popups[index];
        popup.classList.remove("active-course-popup")
        popup.classList.add("display-nonei")
    }
}

function toggleCoursePopup(id) {
    let popup = document.getElementById(id)
    popup.classList.toggle("active-course-popup")
    popup.classList.toggle("display-nonei")
}

window.addEventListener('load', function () {

    searchCourses()

    //populate subject
    validSubject = axios.get('/get/validSubject').then(res => {
        if (res.data == "404") { }
        else {
            arr = res.data.sort((a, b) => { return a.localeCompare(b, userLang) })
            for (let i = 0; i < arr.length; i++) {
                node = document.createElement("li");
                node.className = "py-1 h-40p"
                node.innerHTML = `<a class="text-dark text-decoration-none text-hover" href="/learn/${arr[i]}">${arr[i]}</a>`;
                document.getElementById("subject-links").appendChild(node);
            }
        }
    })
    //populate Specialities
    validSpecialities = axios.get(`/get/validSpecialities/${subject}`).then(res => {
        if (res.data == "404") {
        }
        else {
            arr = res.data.sort((a, b) => { return a.localeCompare(b, userLang) })

            box = this.document.createElement("div")

            for (let i = 0; i < arr.length; i++) {
                node = document.createElement("div");
                specialityWithBars = arr[i].replaceAll(" ", "-").replaceAll("'", "&apos")


                label = document.createElement("label");
                label.className = "form-check-label text-dark fs-12p"
                label.for = `${specialityWithBars}`
                label.innerHTML = `${arr[i]}`

                input = document.createElement("input");
                input.className = "form-check-input w-20p mr-5p"
                input.type = "checkbox"
                input.id = `${specialityWithBars}`
                input.addEventListener('click', event => {
                    updateformData("specialities", `${specialityWithBars}`)
                })

                br = document.createElement("br")

                /*
                                node.innerHTML = `
                                    <input class="form-check-input w-20p mr-5p" type="checkbox" id="${specialityWithBars}" name="${specialityWithBars}" o000nclick='updateformData("specialities", "${specialityWithBars}")'></input>
                                    <label class="form-check-label text-dark fs-12p" for=${specialityWithBars}>${arr[i]}</label>
                                    <br>
                                    `;
                                    */

                node.append(input, label, br)
                box.appendChild(node);
            }
            document.getElementById("speciality-checkboxes").innerHTML = box.innerHTML;

        }
    })

    //populate taughtin
    arr = languageArr.sort((a, b) => { return a[0].localeCompare(b[0], userLang) })
    box = document.createElement("div")
    for (let i = 0; i < arr.length; i++) {
        langPair = arr[i].split(",")
        node = document.createElement("div");


        label = document.createElement("label");
        label.className = "form-check-label text-dark"
        label.for = `${langPair[0]}`
        label.innerHTML = `${langPair[0]}`

        input = document.createElement("input");
        input.className = "form-check-input w-20p mr-5p"
        input.type = "checkbox"
        input.id = `${langPair[1]}`
        input.name = `${langPair[0]}`
        input.addEventListener('click', event => {
            updateformData("taughtIn", `${langPair[1]}`)
        })

        br = document.createElement("br")


        /*
        node.innerHTML = `
                    <input class="form-check-input w-20p mr-5p" type="checkbox" id="${langPair[1]}" name="${langPair[0]}" o000nclick='updateformData("taughtIn", "${langPair[1]}")'></input>
                    <label class="form-check-label text-dark" for=${langPair[0]}>${langPair[0]}</label><br>`;
        document.getElementById("taughtIn-checkboxes").appendChild(node);
        */


        node.append(input, label, br)
        box.appendChild(node);
    }
    document.getElementById("taughtIn-checkboxes").innerHTML = box.innerHTML

    //populate/generate calender

    document.getElementById("timeRange-popup-rows").appendChild(generateCalenderTimeTable("searchCalenderTimes"))


    document.querySelectorAll(".goto-calender-day-button").forEach(el => el.addEventListener("click", e => {
        idArr = e.target.id.split("-")
        calenderId = idArr[6]
        newDayIndex = parseInt(idArr[3])
        oldDayIndex = parseInt(idArr[5])
        document.getElementById(`${oldDayIndex}-calender-${calenderId}`).classList.add("display-nonei")
        document.getElementById(`${newDayIndex}-calender-${calenderId}`).classList.remove("display-nonei")
        document.getElementById(`${calenderId}-add-time-popup`).classList.add("display-nonei")
    }))


    Promise.all([validSubject, validSpecialities]).then((values) => {
        formDataSetup()
        updateCurrency(curConversionRatio)
    });


    document.getElementById("toggle-search-bar-button").addEventListener('click', event => {
        togglesearchBar()
    })
    document.getElementById("advanced-search-button").addEventListener('click', event => {
        toggleAdvancedsearchBar()
    })

    document.getElementById("toggle-subject-popup").addEventListener('click', event => {
        toggleSearchBarPopup("subject-popup")
    })

    document.getElementById("speciality-subject-popup").addEventListener('click', event => {
        toggleSearchBarPopup("speciality-popup")
    })

    document.getElementById("taughtIn-subject-popup").addEventListener('click', event => {
        toggleSearchBarPopup("taughtIn-popup")
    })

    document.getElementById("pricePerLesson-subject-popup").addEventListener('click', event => {
        toggleSearchBarPopup("pricePerLesson-popup")
    })

    document.getElementById("orderBy-subject-popup").addEventListener('click', event => {
        toggleSearchBarPopup("orderBy-popup")
    })

    document.getElementById("Popularity").addEventListener('click', event => {
        updateformData("orderBy", "Popularity")
    })

    document.getElementById("Price:-highest-first").addEventListener('click', event => {
        updateformData("orderBy", "Price:-highest-first")
    })

    document.getElementById("Price:-lowest-first").addEventListener('click', event => {
        updateformData("orderBy", "Price:-lowest-first")
    })

    document.getElementById("Number-of-reviews").addEventListener('click', event => {
        updateformData("orderBy", "Number-of-reviews")
    })

    document.getElementById("Best-rating").addEventListener('click', event => {
        updateformData("orderBy", "Best-rating")
    })

    document.getElementById("timeRange-subject-popup").addEventListener('click', event => {
        toggleSearchBarPopup("timeRange-popup")
    })

    document.getElementById("course-time-subject-popup").addEventListener('click', event => {
        toggleSearchBarPopup("course-time-popup")
    })

    document.querySelectorAll('.clear-search-popups').forEach(el => el.addEventListener('click', event => {
        clearSearchBarPopups()
    }));

    document.getElementById("search-courses").addEventListener('click', event => {
        searchCourses()
    })

    document.getElementById("course-time-subject-popup").addEventListener('click', event => {
        toggleSearchBarPopup("course-time-popup")
    })

    document.getElementById("course-time-subject-popup").addEventListener('click', event => {
        toggleSearchBarPopup("course-time-popup")
    })

    document.getElementById("subject-search-input").addEventListener('click', event => {
        searchBox("subject-links", "subject-search-input")
    })

    document.getElementById("speciality-search-input").addEventListener('click', event => {
        searchBox("speciality-checkboxes", "speciality-search-input")
    })

    document.getElementById("searchBy-input").addEventListener('click', event => {
        updateformData("searchBy", "searchBy-input")
    })

    document.getElementById("taughtIn-search-input").addEventListener('click', event => {
        searchBox("taughtIn-checkboxes", "taughtIn-search-input")
    })


    document.getElementById("courses").addEventListener('click', event => {
        clearCoursePopups()
    })


})

function togglesearchBar() {
    button = document.getElementById("toggle-search-bar-button")
    bar = document.getElementById("product-search-bar")
    symbol = document.getElementById("toggle-search-bar-button-symbol")
    advancedSearchButton = document.getElementById("advanced-search-button")
    advancedBars = document.getElementById("advanced-search-bar")
    if (bar.classList.contains("display-blocki") == false) {
        bar.classList.add("display-blocki", "visibility-visiblei")
        symbol.className = "fa fa-times fa-stack-1x fa-inverse h-40pi fs-30p clr-wht light-blue-text-shadowi h-40p mt--10p w-40pi"

        advancedSearchButton.classList.remove('display-nonei');
    }
    else {
        //hide
        bar.classList.remove("display-blocki", "visibility-visiblei")
        symbol.className = "fa fa-bars fa-stack-1x fa-inverse h-40pi fs-30p clr-wht light-blue-text-shadowi h-40p mt--10p w-40pi"
        advancedSearchButton.classList.remove("active-advanced-search-button")
        advancedSearchButton.classList.add("display-nonei")

        advancedBars.classList.add("display-nonei")
        advancedBars.classList.remove("d-flex")
    }
}

function toggleAdvancedsearchBar() {
    clearSearchBarPopups()


    advancedBars = document.getElementById("advanced-search-bar")
    advancedSearchButton = document.getElementById("advanced-search-button")
    if (advancedBars.classList.contains("display-nonei")) {
        advancedBars.classList.remove("display-nonei")
        advancedBars.classList.add("d-flex")
        advancedSearchButton.classList.add("active-advanced-search-button")
    }
    else {
        advancedBars.classList.add("display-nonei")
        advancedBars.classList.remove("d-flex")
        advancedSearchButton.classList.remove("active-advanced-search-button")
    }
}

async function searchCourses() {
    function generateCourse(courseObj) {
        courseId = courseObj.course_id
        teacherId = courseObj.teacher_id
        teacher_name = courseObj.teacher_name
        ratings = (typeof courseObj.ratings == "undefined") ? 0 : courseObj.ratings;
        ratingsAmount = courseObj.number_of_reviews

        description = ""
        if (courseObj.description.length > 232) {
            description = courseObj.description
            cutoff = description.substring(0, 232).lastIndexOf(" ")

            shortenedDesc = description.substring(0, cutoff)
            moreDesc = description.substring(cutoff, description.length)

            description = `                                   
                 <p class="card-text mb-0 fs-6" id="${courseObj.teacher_name.replaceAll(" ", "-")}-course">
                   ${shortenedDesc}
                    <span id="${courseId}-ellipses">...</span>
                    <div id="${courseId}-more-course-description" class="more-course-description">
                    ${moreDesc}
                    </div>
                </p>
                <button id="${courseId}-more-course-btn" class="mb-4 read-more-button">
                    ${courseJson.readMore}
                </button>`


        }
        else {
            description = `
                    <p class="card-text mb-0 fs-6" id="${teacher_name.replaceAll(" ", "-")}-course">
                        ${courseObj.description}
                    </p>`
        }
        box = document.createElement("div")
        box.innerHTML = `            
                           <div class="row mx-0 p-0 my-0  mt-5 custom-rounded custom-shadow align-items-center en-100-366px bg-wht mn-w-300p mx-w-1000p w-90">
                            <div class="col p-3 m-0 mn-w-300p">
                                <img src="/get/images/course/${courseId}" class="course-img rounded-start" width="1000" height="800"
                                    alt="${courseJson.imageAlt.pre}${teacher_name}${courseJson.imageAlt.post}">
                            </div>
                            <div class="col p-0 m-0 mn-w-300p">
                                <div class="card-body p-4 m-0 py-3">
                                    <h5 class="card-title fs-1">${teacher_name}</h5>
                                    <h5 class="card-text text-muted fs-5">${courseObj.subject}</h5>
                                    <h6 class="card-text text-muted fs-6">${courseObj.specialities.join(", ")}</h6>
                                    <div class="row d-flex justify-content-around mb-3 text-left p-3p w-auto">
                                        <span class="w-50 mn-w-180pi px-0 py-2 text-center">
                                            <i class="fa fa-users fs-15p" aria-hidden="true"></i>
                                            ${courseJson.activeStudents.pre}
                                            ${toLocalNum(courseObj.active_students)}
                                            ${courseJson.activeStudents.post}
                                        </span>
                                        <span class="w-50 mn-w-180pi px-0 py-2 text-center">
                                            <i class="fa fa-circle" aria-hidden="true"></i> 
                                            ${courseJson.totalLessons.pre}
                                            ${toLocalNum(courseObj.course_lessons)}
                                            ${courseJson.totalLessons.post}
                                        </span>
                                    </div>
                                    <p class="card-text mb-0" id="${teacher_name.replaceAll(" ", "-")}-course-description">
                                        ${description}
                                    </p>
                                    <div class="row mt-5 h-auto">
                                        <div class="col container d-flex justify-content-center">
                                            <div class="row d-flex justify-content-center">
                                                <div class="row d-flex justify-content-center">
                                                    <div class="col d-flex justify-content-center m-1 ">
                                                        <div class="h-50p d-flex justify-content-center align-items-center">
                                                            <span>
                                                                <i class="fa fa-star fs-15p clr-gold" aria-hidden="true"></i>
                                                                <span class="mt-20">${ratings}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                <div class="col d-flex justify-content-center m-1">
                                                    <div class=" h-50p d-flex justify-content-center align-items-center">
                                                        <span class="text-center">
                                                            ${courseJson.ratings.pre}${ratingsAmount}${courseJson.ratings.post}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                                <div class="row d-flex justify-content-center">
                                                    <div class="col d-flex justify-content-center m-1 ">
                                                        <div class=" h-50p d-flex justify-content-center align-items-center">
                                                            <span class="text-center">
                                                                <span class="currency pr-3p" data-amount-in-usd="${courseObj.price_per_minute}">
                                                                    ${toLocalCur(courseObj.price_per_minute * curConversionRatio)}
                                                                </span>
                                                                <span>
                                                                    per minute
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div class="col d-flex justify-content-center m-1">
                                                        <div class=" h-50p d-flex justify-content-center align-items-center w-50pi">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col container d-flex justify-content-center">
                                            <div class="row d-flex justify-content-center mn-w-150p w-100">
                                               <div class="col d-flex justify-content-center m-1 w-130p">
                                                   <button id="${courseId}-view-reviews-button" class="btn btn-md btn-outline-secondary text-capitalize mn-w-135pi h-50p view-reviews-button">
                                                   view reviews
                                                   </button>
                                               </div>
                                                <div class="col d-flex justify-content-center m-1 w-130p">
                                                    <button data-course-id="${courseId}" class="btn btn-md btn-outline-secondary text-capitalize mn-w-135pi h-50p view-calender-button">
                                                    view calender
                                                    </button>
                                                    <div id="${courseId}-calender-popup" class="mr-465pi position-absolute display-nonei stop-prop-course mt-55pi">
                                                    </div>
                                                </div>
                                                <div class="col d-flex justify-content-center m-1 w-130p">
                                                    <button data-course-id="${courseId}" data-teacher-id="${teacherId}"  class="btn btn-md btn-outline-secondary text-capitalize mn-w-135pi h-50p request-lesson-button">
                                                    request lesson
                                                    </button>
                                                </div>
                                                <div class="col d-flex justify-content-center m-1 w-130p">
                                                    <button data-course-id="${courseId}" data-teacher-id="${teacherId}" class="btn btn-md btn-outline-secondary text-capitalize mn-w-135pi h-50p request-chat-button">
                                                        message
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `

        return box.children[0]
    }

    function generatePagination(rows, offset) {
        pageNum = Math.ceil(rows / 10) //limited to 10 cols per page
        function genPagButton(active = false, text, offset) {
            classPair = {
                false: "pagination-button",
                true: "active-pagination-button"
            }
            button = document.createElement("button")
            button.className = classPair[`${active}`]
            button.innerHTML = text
            button.onclick = () => { searchCourses(offset) }
            button.type = "button"
            return button
        }
        buttonBox = document.createElement("div")
        buttonBox.className = "pagination d-flex align-items-center justify-content-center"
        buttonBox.id = "pagination-buttons"
        if (offset > 3) {
            buttonBox.appendChild(genPagButton(false, "&laquo;", 0))
        }
        startIndex = offset - 3
        if ((pageNum - startIndex) < 4) {
            startIndex--
        }
        startIndex = (((offset - 3) <= 0) ? 1 : (offset - 3));
        for (let i = startIndex; i < offset; i++) {
            buttonBox.appendChild(genPagButton(false, i, i))
        }
        buttonBox.appendChild(genPagButton(true, offset, offset))
        if ((offset + 3) < pageNum) {
            endIndex = (offset + 2)
            if (((buttonBox.childElementCount) < 4) && ((pageNum - offset) > 1)) {
                endIndex++
            }
            for (let i = (offset + 1); i < endIndex; i++) {
                buttonBox.appendChild(genPagButton(false, i))
            }
            buttonBox.appendChild(genPagButton(false, "&raquo"))
        }
        else {
            for (let i = (offset + 1); i <= pageNum; i++) {
                buttonBox.appendChild(genPagButton(false, i, pageNum))
            }
        }


        //pag is not empty
        if (buttonBox.children.length != 1) document.getElementById("course-pagination").appendChild(buttonBox)
    }

    function generateCourseTimeTable(calender_times, courseId) {


        function convertToFormat(calender_times) {
            const pad = num => ("0" + num).slice(-2); // or use padStart
            const getTimeFromDate = timestamp => {
                const date = new Date(timestamp);
                let hours = date.getHours(),
                    minutes = date.getMinutes()
                //seconds = date.getSeconds();
                return pad(hours) + ":" + pad(minutes)// + ":" + pad(seconds)
            }
            obj = {
                "sunday": [], "monday": [], "tuesday": [], "wednesday": [], "thursday": [], "friday": [], "saturday": [],
            }
            rangeArr = calender_times.split(`"`).slice(1, -1)
            for (let index = 0; index < rangeArr.length; index += 2) {
                rangeStr = rangeArr[index].split(",")
                start = parseInt(rangeStr[0].slice(1, rangeStr[0].length)) * 1000
                finish = parseInt((rangeStr[1])) * 1000
                day = days[new Date(start).getDay()]
                obj[`${day}`].push([getTimeFromDate(start), getTimeFromDate(finish)])
            }
            return obj
        }

        const cleanedCalenderTimes = convertToFormat(calender_times)

        const timeZoneCorrect = (availableTimes, offset, stripTime = false) => {
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            indexToRemove = []

            if (stripTime == false) {
                for (let i = 0; i < 7; i++) {
                    for (let j = 0; j < availableTimes[`${days[i]}`].length; j++) {
                        availableTimes[`${days[i]}`][j][0] = availableTimes[`${days[i]}`][j][0] + offset
                        availableTimes[`${days[i]}`][j][1] = availableTimes[`${days[i]}`][j][1] + offset
                        if (availableTimes[`${days[i]}`][j][0] < 0) {
                            console.log("ddddddddd")
                            indexToRemove.push([i, j])
                            newIndex = (i - 1)
                            if (newIndex == -1) newIndex = 6
                            offsettedTime = [availableTimes[`${days[i]}`][j][0] + 1440, availableTimes[`${days[i]}`][j][1] + 1440]
                            availableTimes[`${days[newIndex]}`].push(offsettedTime)
                            delete availableTimes[`${days[i]}`][j]
                        }
                        else if (availableTimes[`${days[i]}`][j][0] > 1440) {
                            console.log("ddddddddd")
                            indexToRemove.push([i, j])
                            newIndex = (i + 1)
                            if (newIndex == 7) newIndex = 0
                            offsettedTime = [availableTimes[`${days[i]}`][j][0] - 1440, availableTimes[`${days[i]}`][j][1] - 1440]
                            availableTimes[`${days[newIndex]}`].push(offsettedTime)
                            delete availableTimes[`${days[i]}`][j]
                        }

                    }
                }
            }
            else {
                for (let i = 0; i < times.length; i++) {
                    for (let j = 0; j < availableTimes[`${days[i]}`].length; j++) {
                        availableTimes[`${days[i]}`][j][0] = availableTimes[`${days[i]}`][j][0] - offset
                        availableTimes[`${days[i]}`][j][1] = availableTimes[`${days[i]}`][j][1] - offset
                        if (availableTimes[`${days[i]}`][j][0] < 0) {
                            indexToRemove.push([i, j])
                            newIndex = (i - 1)
                            if (newIndex == -1) newIndex = 6
                            offsettedTime = [availableTimes[`${days[i]}`][j][0] + 1440, availableTimes[`${days[i]}`][j][1] + 1440]
                            availableTimes[`${days[newIndex]}`].push(offsettedTime)
                            delete availableTimes[`${days[i]}`][j]
                        }
                        else if (availableTimes[`${days[i]}`][j][1] > 1440) {
                            indexToRemove.push([i, j])
                            newIndex = (i + 1)
                            if (newIndex == 7) newIndex = 0
                            offsettedTime = [availableTimes[`${days[i]}`][j][0] - 1440, availableTimes[`${days[i]}`][j][1] - s1440]
                            availableTimes[`${days[newIndex]}`].push(offsettedTime)
                            delete availableTimes[`${days[i]}`][j]
                        }
                    }
                }
            }

            for (let i = 0; i < indexToRemove.length; i++) {
                availableTimes[`${days[indexToRemove[i][0]]}`].splice(indexToRemove[i][1], 1); // 2nd parameter means remove one item only
            }


            return availableTimes

        }


        timeRange = document.createElement("div")
        timeRange.className = "w-300pi h-300pi p-0 m-0 bg-white brdr-r-2 brdr-w-5p border-style-solid brdr-clr-white custom-shadow position-absolute"

        for (let i = 0; i < 7; i++) {
            outerDiv = document.createElement("div");
            outerDiv.className = "row container d-flex align-items-center justify-content-center px-0 w-255p p-0 m-0 pb-3";
            dayVal = document.createElement("div");
            outerDiv.id = `${i}-calender-${calenderId}`
            dayVal.className = "h-50pi w-100 text-center fs-30p px-0 bg-blacki clr-white user-select-none brdr-r-2"

            if (i == 0) {
                outerDiv.className = "h-50pi w-100 text-center fs-30p px-0 bg-blacki brdr-r-5p"
                dayVal.innerHTML = `
                <button type="button" class="m-1 float-left display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline disabled">prev</button>
                <span class="user-select-none fs-25p" id="day-${days[i]}-goto">${days[i]}</span>
                <button id="goto-cal-day-${i + 1}-from-${i}" data-course-id="${courseId}"  type="button" class="m-1 float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline goto-calender-day-button-course">next</button>
                `;
            }
            else if (i == 6) {
                outerDiv.className = "px-0 h-50pi w-100 text-center fs-30p px-0 bg-blacki display-nonei"
                dayVal.innerHTML = `
                <button type="button" id="goto-cal-day-${i - 1}-from-${i}" data-course-id="${courseId}" class="m-1 float-left display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline goto-calender-day-button-course">prev</button>
                <span class="user-select-none fs-25p" id="day-${days[i]}-goto">${days[i]}</span>
                <button type="button" class="m-1 float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline" disabled>next</button>
                `;
            }
            else {
                outerDiv.className = "px-0 h-50pi w-100 text-center fs-30p px-0 bg-blacki display-nonei"
                dayVal.innerHTML = `
                <button type="button" data-course-id="${courseId}" id="goto-cal-day-${i - 1}-from-${i}" class="m-1 float-left display-inline bg-blacki h-40p fs-20p btn btn-outline-primary goto-calender-day-button-course">prev</button>
                <span class="user-select-none fs-25p" id="day-${days[i]}-goto">${days[i]}</span>
                <button type="button" data-course-id="${courseId}" id="goto-cal-day-${i + 1}-from-${i}" class="m-1  float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary goto-calender-day-button-course">next</button>
            `;
            }

            outerDiv.appendChild(dayVal);
            let box = document.createElement("div");


            for (let j = 0; j < cleanedCalenderTimes[`${days[i]}`].length; j++) {
                times = cleanedCalenderTimes[`${days[i]}`][j]
                startDate = times[0]
                endDate = times[1]

                timeDiv = document.createElement("div")
                timeDiv.className = `w-100p p-0 fs-15p d-flex brdr-r-5 h-30pi bg-blacki h-40p fs-20p btn btn-outline-primary m-0 my-2`

                let timeText = document.createElement("div")
                timeText.innerHTML = `${startDate} - ${endDate}`
                timeText.className = "pt-2p"

                timeDiv.append(timeText)
                box.append(timeDiv)
            }

            box.className = "inline-grid-r-auto3-c-auto3 justify-items-center align-items-center grid-gap-3p m-0 p-0"
            outerDiv.append(box)
            timeRange.appendChild(outerDiv);
        }
        return timeRange
    }

    function generateCourseReviews(courseId) {



    }

    try {
        teachlyFormData = JSON.parse(localStorage.getItem("TeachlyFormData"))

        if (typeof window.pageAmount == "undefined") {
            window.pageAmount = -1
        }
        teachlyFormData.pageAmount = window.pageAmount

        res = await axios({
            method: 'post',
            url: '/learn/searchTutorCourses',
            data: teachlyFormData,
            headers: {
                'Content-Type': 'application/json',
            },
        })


        if (res.data.err) {
            if (res.data.err == 404) {
                document.getElementById("courses").style.display = "none"
                document.getElementById("no-courses").style.display = "block"
                document.getElementById("server-error").style.display = "none"
            }
            else if (res.data.err == "server error") {
                document.getElementById("courses").style.display = "none"
                document.getElementById("no-courses").style.display = "none"
                document.getElementById("server-error").style.display = "block"
            }
        }
        else {

            courseBox = document.createElement("div")
            timeTableBox = document.createElement("div")

            //generate course displays
            courseArr = res.data.courses
            for (let i = 0; i < courseArr.length; i++) {
                courseBox.appendChild(generateCourse(courseArr[i]))

            }
            document.getElementById("course-cards").append(...courseBox.children)
            document.getElementById("courses").style.display = "block"
            document.getElementById("no-courses").style.display = "none"
            document.getElementById("server-error").style.display = "none"
            generatePagination(res.data.count, teachlyFormData.activePage)

            document.querySelectorAll('.read-more-button').forEach(el => el.addEventListener('click', e => {
                courseId = e.target.id.split("-")[0]
                readMoreDescToggle(courseId)
            }));


            document.querySelectorAll('.stop-prop-course').forEach(el => el.addEventListener('click', e => {
                e.stopPropagation();
            }));

            //the stuff the user will see insantly is done after here, now generating the popups and less visible


            for (let i = 0; i < courseArr.length; i++) {
                document.getElementById(`${courseArr[i].course_id}-calender-popup`).appendChild(generateCourseTimeTable(courseArr[i]["calender_times"], courseArr[i].course_id))
            }

            document.querySelectorAll('.request-chat-button').forEach(el => el.addEventListener('click', async e => {
                try {
                    teacherId = e.target.getAttribute("data-teacher-id")
                    chatId = await requestChat(courseId)
                    hostname = location.hostname
                    window.location.href = `${hostname}/profile/chat?id=${chatId}`;
                } catch (error) {
                    text = courseJson.requestChatError[`${error.message}`]
                    if (typeof text == "undefined") createOnScreenNotification(text)
                    else createOnScreenNotification(error.message)
                }
            }));
            document.querySelectorAll(".request-lesson-button").forEach(el => el.addEventListener('click', e => {
                courseId = e.target.getAttribute("data-course-id")
                teacherId = e.target.getAttribute("data-teacher-id")
                text = learnJson.requestCourseLessonNot
                createOnScreenNotification(text)
                requestLesson(courseId, teacherId)
            }))
            document.querySelectorAll(".view-calender-button").forEach(el => el.addEventListener("click", e => {
                let id = `${e.target.getAttribute("data-course-id")}-calender-popup`
                toggleCoursePopup(id)
                e.stopPropagation();
            }))


            document.querySelectorAll(".view-reviews-button").forEach(el => el.addEventListener("click", e => {
                let id = `${e.target.getAttribute("data-course-id")}-reviews-popup`
                toggleCoursePopup(id)
                e.stopPropagation();
            }))


            document.querySelectorAll(".goto-calender-day-button-course").forEach(el => el.addEventListener("click", e => {
                courseId = e.target.getAttribute("data-course-id")
                newDayIndex = parseInt(e.target.id.split("-")[3])
                oldDayIndex = parseInt(e.target.id.split("-")[5])
                document.getElementById(`${oldDayIndex}-calender-${courseId}`).classList.add("display-nonei")
                document.getElementById(`${newDayIndex}-calender-${courseId}`).classList.remove("display-nonei")
            }))


        }

    }
    catch (err) {
        console.log(err)
        document.getElementById("courses").style.display = "none"
        document.getElementById("no-courses").style.display = "none"
        document.getElementById("server-error").style.display = "block"
    }


}

async function requestChat(courseId, teacherId) {
    try {
        res = await axios({
            method: 'post',
            url: '/learn/request-chat',
            data: {
                courseId: courseId,
                teacherId: teacherId,
                subject: subject
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return res.data.chatId
    } catch (error) {
        console.log(error)
        //maybe show the user an error message?
        createOnScreenNotification(error.message)

    }
}


async function requestLesson(courseId, teacherId) {
    res = await axios({
        method: 'post',
        url: '/learn/request-lesson',
        data: {
            courseId: courseId,
            teacherId: teacherId
        },
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

function readMoreDescToggle(courseId) {

    dotsId = `${courseId}-ellipses`
    MoreId = `${courseId}-more-course-description`
    btnId = `${courseId}-more-course-btn`

    let dots = document.getElementById(dotsId);
    if (dots.style.display === "none") {
        dots.style.display = "inline";
        document.getElementById(btnId).innerHTML = "Read more";
        document.getElementById(MoreId).style.display = "none";
    } else {
        dots.style.display = "none";
        document.getElementById(btnId).innerHTML = "Read less";
        document.getElementById(MoreId).style.display = "inline";
    }
}
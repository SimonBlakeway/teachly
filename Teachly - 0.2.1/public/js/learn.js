function formDataSetup() {
    teachlyFormDataDefault = {
        "subject": subject,
        "specialities": [],
        "priceRange": [10, 60],
        "searchby": "",
        "taughtIn": [userLang],
        "orderBy": "Popularity",
        "availableTimes": [],
        "courseTime": [20, 60],
        "activePage": 1,
        "availableTimeRanges": []

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
    range1Shown.innerHTML = teachlyFormData.priceRange[0] * curConversionRatio;
    range2Shown.innerHTML = teachlyFormData.priceRange[1] * curConversionRatio;

    regularSlider = document.querySelector('.regular-slider')
    prefixFormat = wNumb({ decimals: 2 })

    slider = noUiSlider.create(regularSlider, {
        start: [teachlyFormData.priceRange[0] * curConversionRatio, teachlyFormData.priceRange[1] * curConversionRatio],
        connect: true,
        margin: 5 * curConversionRatio,
        range: { min: 10 * curConversionRatio, max: 60 * curConversionRatio },
        tooltips: [prefixFormat, prefixFormat],
        pips: {
            mode: 'steps',
            density: 5,
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
        margin: 1,
        range: { min: 20, max: 60 },
        tooltips: [prefixFormatTime, prefixFormatTime],
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
            range1Shown.innerHTML = priceRange[0] * curConversionRatio;
            range2Shown.innerHTML = priceRange[1] * curConversionRatio;
            slider.updateOptions({
                margin: 5 * curConversionRatio,
                range: { min: 0, max: 60 * curConversionRatio },
            });
            slider.set([priceRange[0] * curConversionRatio, priceRange[1] * curConversionRatio]);
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
    for (i = 0; i < teachlyFormData.availableTimes.length; i++) {
        document.getElementById(teachlyFormData.availableTimes[i]).classList.add("active-time-slot-div");
    }

}

async function formSetup() {
    let days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    document.getElementById("subject-search-input").placeholder = subject
    timeRange = document.getElementById("timeRange-popup-rows")

    for (let i = 0; i <= 6; i++) {
        outerDiv = document.createElement("div");
        outerDiv.className = "row container d-flex align-items-center justify-content-center px-0 w-255p p-0 m-0 pb-3";
        //outerDiv.style.marginLeft = "0px"
        dayVal = document.createElement("div");
        dayVal.className = "day-div px-0"
        dayVal.innerHTML = `${days[i]}`;
        outerDiv.appendChild(dayVal);
        for (let j = 0; j <= 23; j++) {
            innerDiv = document.createElement("div");
            innerDiv.className = "container d-flex align-items-center justify-content-center time-slot-div px-0";
            innerDiv.innerHTML = `${j} - ${j + 1}`;
            innerDiv.id = `${j}-${j + 1}_${days[i]}`;
            innerDiv.onclick = function () { updateformData(`availableTimes`, `${j}-${j + 1}_${days[i]}`) }
            outerDiv.appendChild(innerDiv);
        }
        timeRange.appendChild(outerDiv);
    }

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
        document.getElementById('min-price-shown').innerHTML = min
        document.getElementById('max-price-shown').innerHTML = max
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
    else if (type == "availableTimes") {
        index = teachlyFormData.availableTimes.indexOf(val)
        if (index != -1) {
            teachlyFormData.availableTimes.splice(index, 1);
            document.getElementById(val).classList.remove("active-time-slot-div");
        }
        else {
            teachlyFormData.availableTimes.push(val)
            document.getElementById(val).classList.add("active-time-slot-div");
        }
    }
    else if (type == "courseTime") {
        min = `${val[0]}`.split(".")[0];
        max = `${val[1]}`.split(".")[0];
        document.getElementById('min-course-time').innerHTML = min
        document.getElementById('max-course-time').innerHTML = max
        teachlyFormData["priceRange"] = [min, max];
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






function generateCalenderTimeTable(calenderId) {
    //calenderId: str, valid css/html class/id, no "-"
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    currentDay = days[new Date().getDay()]
    dayIndex = new Date().getDay() - 1
    adaptedDays = [...days.slice(dayIndex, days.length), ...days.slice(0, dayIndex)]
    const timeOffset = new Date().getTimezoneOffset() / 60

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
        innerDiv.className = "w-40p p-0 fs-15p text-center d-flex align-items-center justify-content-center brdr-r-5 h-30p my-1 bg-blacki h-40p fs-20p btn btn-outline-primary"
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
    button.innerHTML = "❌"

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



    dateBox = document.getElementById(`${day}-dates`)

    let id = `${getRandomInt(999999999999999)}-${day}-calender-date-${calenderId}`


    timeDiv = document.createElement("div")
    timeDiv.id = `${id}`
    timeDiv.className = `w-136pi p-0 fs-15p d-flex brdr-r-5 h-30p my-1 bg-blacki h-40p fs-20p btn btn-outline-primary calender-time-${calenderId}`

    timeText = document.createElement("div")
    timeText.innerHTML = `${startDate} - ${endDate}`
    timeText.className = "w-108pi pt-2p"

    timeRemove = document.createElement("button")
    timeRemove.className = "float-right text-btn bg-blacki btn btn-outline-primary h-28pi d-flex align-items-center justify-content-center w-28pi"
    timeRemove.type = "button"
    timeRemove.innerHTML = `<div class="fs-w-bolder mb-3-5pi">  ╳  </div>`
    timeRemove.addEventListener("click", e => {
        removeTimeCalender(calenderId, id)
    })
    timeDiv.append(timeText, timeRemove)


    addDateButton = document.createElement("div");
    addDateButton.className = "w-40p p-0 fs-15p text-center d-flex align-items-center justify-content-center brdr-r-5 h-30p my-1 bg-blacki h-40p fs-20p btn btn-outline-primary"
    addDateButton.innerHTML = "+";
    addDateButton.addEventListener("click", e => {
        toggleCalenderDayPopup(calenderId, day)
    })

    dateBox.removeChild(dateBox.lastChild); //remove addTime button
    dateBox.append(timeDiv, addDateButton)

    timeRanges = getTimesCalender(calenderId, removeTimeZone = true)

    if (timeRanges.length == 0) {
        hiddenInput = document.getElementById("hidden-timeRange-input")
        hiddenInput.value = hiddenInput.defaultValue //"the user has not selected a time"
    }
    else {
        hiddenInput = document.getElementById("hidden-timeRange-input")
        hiddenInput.value = "the user has selected a time"
    }
}

function removeTimeCalender(calenderId, timeId) {
    timeRangeBox = document.getElementById(timeId)
    removeElement(timeId)
    const timeRanges = getTimesCalender(calenderId, removeTimeZone = true)
    if (timeRanges.length == 0) {
        hiddenInput = document.getElementById("hidden-timeRange-input")
        hiddenInput.value = hiddenInput.defaultValue //"the user has not selected a time"
    }
    else {
        hiddenInput = document.getElementById("hidden-timeRange-input")
        hiddenInput.value = "the user has selected a time"
    }
}

function getTimesCalender(calenderId, removeTimeZone = true, removeMilliseconds = true) {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    adaptedDays = [...days.slice(dayIndex, days.length), ...days.slice(0, dayIndex)]

    let timesArr = []
    let timesDivs = document.querySelectorAll(`.calender-time-${calenderId}`)
    const timeOffset = new Date().getTimezoneOffset()
    const BaseTime = getUTCTimeStampNoHours()

    if (removeTimeZone) {
        if (removeMilliseconds) {
            for (let i = 0; i < timesDivs.length; i++) {
                let timesDiv = timesDivs[i]
                let day = timesDiv.id.split("-")[1]
                let dayIndex = adaptedDays.indexOf(day)
                times = timesDiv.children[0].innerHTML.split(" - ")

                start = convertTimeToInteger(times[0]) - timeOffset
                finish = convertTimeToInteger(times[1]) - timeOffset

                if (start < 0) {
                    //use prev day
                    dayIndex--
                }
                if (start > 1440) {
                    //use next day
                    dayIndex++
                }
                start = Math.floor((BaseTime + (dayIndex * (1000 * 60 * 60 * 24)) + (start * 1000 * 60)) / 1000)

                finish = Math.floor((BaseTime + (dayIndex * (1000 * 60 * 60 * 24)) + (finish * 1000 * 60)) / 1000)

                timesArr.push([start, finish])

            }
        }
        else {
            for (let i = 0; i < timesDivs.length; i++) {
                let timesDiv = timesDivs[i]
                let day = timesDiv.id.split("-")[1]
                let dayIndex = adaptedDays.indexOf(day)
                times = timesDiv.children[0].innerHTML.split(" - ")

                start = convertTimeToInteger(times[0]) - timeOffset
                finish = convertTimeToInteger(times[1]) - timeOffset

                if (start < 0) {
                    //use prev day
                    dayIndex--
                }
                if (start > 1440) {
                    //use next day
                    dayIndex++
                }
                start = BaseTime + (dayIndex * (1000 * 60 * 60 * 24)) + (start * 1000 * 60)

                finish = BaseTime + (dayIndex * (1000 * 60 * 60 * 24)) + (finish * 1000 * 60)

                timesArr.push([start, finish])

            }
        }
    }
    else {
        if (removeMilliseconds) {
            for (let i = 0; i < timesDivs.length; i++) {
                let timesDiv = timesDivs[i]
                let day = timesDiv.id.split("-")[1]
                let dayIndex = adaptedDays.indexOf(day)
                let times = timesDiv.children[0].innerHTML.split(" - ")

                start = parseInt(convertTimeToInteger(times[0])) - timeOffset
                finish = parseInt(convertTimeToInteger(times[1])) - timeOffset

                start = Math.floor((BaseTime + (dayIndex * (1000 * 60 * 60 * 24)) + (start * 1000)) / 1000)

                finish = Math.floor((BaseTime + (dayIndex * (1000 * 60 * 60 * 24)) + (start * 1000)) / 1000)

                timesArr.push([start, finish])

            }
        }
        else {
            for (let i = 0; i < timesDivs.length; i++) {
                let timesDiv = timesDivs[i]
                let day = timesDiv.id.split("-")[1]
                let dayIndex = adaptedDays.indexOf(day)
                let times = timesDiv.children[0].innerHTML.split(" - ")

                start = parseInt(convertTimeToInteger(times[0])) - timeOffset
                finish = parseInt(convertTimeToInteger(times[1])) - timeOffset

                start = BaseTime + (dayIndex * (1000 * 60 * 60 * 24)) + (start * 1000)

                finish = BaseTime + (dayIndex * (1000 * 60 * 60 * 24)) + (start * 1000)

                timesArr.push([start, finish])

            }

        }
    }

    if (timesArr.length == 0) {
        return timesArr
    }
    return timesArr
}















window.addEventListener('load', function () {

    searchCourses()

    formSetupRes = formSetup()
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



    Promise.all([formSetupRes, validSubject, validSpecialities]).then((values) => {
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

})

function togglesearchBar() {
    button = document.getElementById("toggle-search-bar-button")
    bar = document.getElementById("product-search-bar")
    symbol = document.getElementById("toggle-search-bar-button-symbol")
    advancedSearchButton = document.getElementById("advanced-search-button")
    advancedBars = document.getElementById("advanced-search-bar")
    if (bar.classList.contains("display-blocki") == false) {
        bar.classList.add("display-blocki", "visibility-visiblei")
        symbol.className = "fa fa-times fa-stack-1x fa-inverse h-40pi fs-30p clr-wht light-blue-text-shadowi h-40p mt--10p w-50p"

        advancedSearchButton.classList.remove('display-nonei');
    }
    else {
        //hide
        bar.classList.remove("display-blocki", "visibility-visiblei")
        symbol.className = "fa fa-bars fa-stack-1x fa-inverse h-40pi fs-30p clr-wht light-blue-text-shadowi h-40p mt--10p w-50p"
        advancedSearchButton.classList.remove("active-advanced-search-button")
        advancedSearchButton.classList.add("display-nonei")

        advancedBars.classList.add("display-nonei")
        advancedBars.classList.remove("d-flex")
    }
}

function toggleAdvancedsearchBar() {
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
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
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
                                <div class="card-body p-4 m-0">
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
                                        <div class="col container d-flex justify-content-center mb-4">
                                            <div class="row d-flex justify-content-center h-100">
                                                <div class="col d-flex justify-content-center w-100p">
                                                    <div class="w-100p">
                                                        <div class="d-flex justify-content-center w-100 h-50"">
                                                            <i class="fa fa-star fs-15p clr-gold mt-5pi" aria-hidden="true"></i>
                                                            <span>${ratings}</span>
                                                        </div>
                                                        <div class="d-flex justify-content-center h-50">
                                                        <span>
                                                        ${courseJson.ratings.pre}${ratingsAmount}${courseJson.ratings.post}
                                                        </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col w-130p"
                                                    class="d-flex justify-content-center">
                                                    <div class="d-flex justify-content-center w-100 h-50">
                                                        <span class="currency">
                                                            <span id="max-price-shown" class="display-none">
                                                                ${courseObj.price_per_lesson}
                                                            </span>
                                                            <span>${toLocalCur(courseObj.price_per_lesson * curConversionRatio)}</span>
                                                        </span>
                                                    </div>
                                                    <div class="d-flex justify-content-center w-100 text-center">${courseJson.lesson_time.pre}${courseObj.lesson_time}${courseJson.lesson_time.post}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col container d-flex justify-content-center mb-4">
                                            <div class="row d-flex justify-content-center mn-w-150p w-100">
                                               <div class="col d-flex justify-content-center m-1 w-130p">
                                                   <button id="${courseId}-view-reviews-button" class="btn btn-md btn-outline-secondary text-capitalize mn-w-135pi h-50p view-calender-button">
                                                   view reviews
                                                   </button>
                                               </div>
                                                <div class="col d-flex justify-content-center m-1 w-130p">
                                                    <button id="${courseId}-view-calender-button" class="btn btn-md btn-outline-secondary text-capitalize mn-w-135pi h-50p view-calender-button">
                                                    view calender
                                                    </button>
                                                </div>
                                                <div class="col d-flex justify-content-center m-1 w-130p">
                                                    <button id="${courseId}-request-lesson-button" class="btn btn-md btn-outline-secondary text-capitalize mn-w-135pi h-50p request-lesson-button">
                                                    request lesson
                                                    </button>
                                                </div>
                                                <div class="col d-flex justify-content-center m-1 mn-w-130p-i">
                                                    <button id="${courseId}-courseId-${teacherId}-teacherId-message-button" class="btn btn-md btn-outline-secondary text-capitalize mn-w-130p-i h-50p request-chat-button">
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

        if ("the pag is just an activated button wioth nothing else") { console.log("empty pag") }
        document.getElementById("course-pagination").appendChild(buttonBox)
    }

    function generateCourseTimeTable(availableTimes) {
        currentDay = days[new Date().getDay()]
        dayIndex = new Date().getDay() - 1
        adaptedDays = [days.slice(dayIndex, days.length), days.slice(0, dayIndex)]
        const timeOffset = new Date().getTimezoneOffset() / 60



        availableTimes = {
            "Sunday": [
                [0, 1130],
                [1440, 1440],
                [1440, 1440],

            ]


            ,
            "Monday": [],
            "Tuesday": [],
            "Wednesday": [],
            "Thursday": [],
            "Friday": [],
            "Saturday": [],
        }

        const rand = (min, max) => {
            return min + Math.floor(Math.random() * (max - min))
        }

        const generateTime = () => {
            for (let i = 0; i < 7; i++) {

                for (let j = 0; j < rand(2, 6); j++) {
                    baseTime = rand(0, 1400)
                    addedTime = baseTime + rand(0, 40)
                    availableTimes[`${days[i]}`].push([baseTime, addedTime])
                }
            }
        }

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

        generateTime()

        availableTimes = timeZoneCorrect(availableTimes, timeOffset)



        const convertToTimeFormat = (num) => {
            var time = new Date(num * 1000 * 60).toLocaleTimeString().substring(0, 5)
            return time
        }


        timeRange = document.createElement("div")
        timeRange.id = `calender-outer`
        timeRange.className = "w-300pi h-300pi p-0 m-0 bg-white brdr-r-2 brdr-w-5p border-style-solid brdr-clr-white custom-shadow position-absolute"

        for (let i = 0; i < 7; i++) {
            outerDiv = document.createElement("div");
            outerDiv.className = "row container d-flex align-items-center justify-content-center px-0 w-255p p-0 m-0 pb-3";
            dayVal = document.createElement("div");
            outerDiv.id = `${i}-calender`
            dayVal.className = "h-50pi w-100 text-center fs-30p px-0 bg-blacki clr-white user-select-none brdr-r-2"

            if (i == 0) {
                outerDiv.className = "h-50pi w-100 text-center fs-30p px-0 bg-blacki brdr-r-5p"
                dayVal.innerHTML = `
                <button type="button" class="m-1 mx-3 float-left display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline disabled">prev</button>
                <span class="user-select-none fs-25p" id="day-${days[i]}-goto">${days[i]}</span>
                <button id="goto-cal-day-${i + 1}-from-${i}"  type="button" class="m-1 mx-3 float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline goto-calender-day-button">next</button>
                `;
            }
            else if (i == 6) {
                outerDiv.className = "px-0 h-50pi w-100 text-center fs-30p px-0 bg-blacki display-nonei"
                dayVal.innerHTML = `
                <button type="button" id="goto-cal-day-${i - 1}-from-${i}" class="m-1 mx-3 float-left display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline goto-calender-day-button">prev</button>
                <span class="user-select-none fs-25p" id="day-${days[i]}-goto">${days[i]}</span>
                <button type="button" class="m-1 mx-3 float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline" disabled>next</button>
                `;
            }
            else {
                outerDiv.className = "px-0 h-50pi w-100 text-center fs-30p px-0 bg-blacki display-nonei"
                dayVal.innerHTML = `
                <button type="button" id="goto-cal-day-${i - 1}-from-${i}" class="m-1 mx-3 float-left display-inline bg-blacki h-40p fs-20p btn btn-outline-primary goto-calender-day-button">prev</button>
                <span class="user-select-none fs-25p" id="day-${days[i]}-goto">${days[i]}</span>
                <button type="button" id="goto-cal-day-${i + 1}-from-${i}" class="m-1 mx-3 float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary goto-calender-day-button">next</button>
            `;
            }

            outerDiv.appendChild(dayVal);
            let box = document.createElement("div");
            box.className = "inline-grid-r-auto-c-auto justify-items-center align-items-center grid-gap-3p m-0 p-0"
            for (let j = 0; j < availableTimes[days[i]].length; j++) {
                start = availableTimes[days[i]][j][0]
                finish = availableTimes[days[i]][j][1]
                innerDiv = document.createElement("div");
                let innerStr = `${convertToTimeFormat(start)} - ${convertToTimeFormat(finish)}`;

                innerDiv.className = "w-100p p-0 fs-15p text-center d-flex align-items-center justify-content-center brdr-r-5 h-30p my-1 bg-blacki h-40p fs-20p btn btn-outline-primary"
                innerDiv.innerHTML = innerStr
                box.appendChild(innerDiv);
            }
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
                //timeTableBox.appendChild
                courseBox.appendChild(generateCourseTimeTable(courseArr[i].time_schedule))

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
            document.querySelectorAll('.request-chat-button').forEach(el => el.addEventListener('click', e => {
                try {
                    courseId = e.target.id.split("-")[0]
                    teacherId = e.target.id.split("-")[2]
                    chatId = requestChat(courseId)
                    gotoChat(chatId)
                } catch (error) {
                    text = courseJson.requestChatError[`${error.message}`]
                    if (typeof text == "undefined") createOnScreenNotification(text)
                    else createOnScreenNotification(error.message)
                }
            }));
            document.querySelectorAll(".request-lesson-button").forEach(el => el.addEventListener('click', e => {
                courseId = e.target.id.split("-")[0]
                teacherId = e.target.id.split("-")[2]
                requestLesson(courseId)
                text = courseJson.requestCourseLessonNot
                createOnScreenNotification(text)
            }))
            document.querySelectorAll(".view-calender-button").forEach(el => el.addEventListener("click", e => {
                courseId = e.target.id.split("-")[0]
                toggleCourseCalender(courseId)
            }))
            document.querySelectorAll(".goto-calender-day-button").forEach(el => el.addEventListener("click", e => {

                newDayIndex = parseInt(e.target.id.split("-")[3])
                oldDayIndex = parseInt(e.target.id.split("-")[5])
                document.getElementById(`${oldDayIndex}-calender`).classList.add("display-nonei")
                document.getElementById(`${newDayIndex}-calender`).classList.remove("display-nonei")
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
                teacherId: teacherId
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return res.data.chatId
    } catch (error) {
        console.log(error)
        //maybe show the user an error message?

    }

}

async function gotoChat(chatId) {
    hostname = location.hostname
    window.location.href = `${hostname}/profile/chat?id=${chatId}`;

}

async function toggleCourseCalender(courseId) {

}

async function gotoCalenderDay(day) {
    document.getElementById(`day-${day}-goto`)  // .scrollBy(0, 400);

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

function toggleCourseTimeTable(courseId) {
    timeTable = document.getElementById(`time-table-${courseId}`)
    if (timeTable.classList.includes("visible")) {
        timeTable.classList.remove("visible")
    }
    else {
        document.querySelector(".time-table-div").forEach(el => {
            e.classList.remove("visible")
        })
        timeTable.classList.add("visible")
    }
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


function toggleCourseReviews(courseId) {

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

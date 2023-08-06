function convertTimeToInteger(time) {
    //time format "11:22"
    let d = new Date(0);
    //time += "" //":00"
    let newDate = new Date(d.toString().split(":")[0].slice(0, -2) + time);
    newNum = ((newDate.getTime() / 1000) / 60) - newDate.getTimezoneOffset()
    return newNum
}

function convertStrToInvalidDates(str) {
    if (typeof str == "undefined") return false
    newArr = []
    str = str.split(",")
    for (i = 0; i < str.length; i += 2) {
        newArr.push([str[i], str[i + 1]])
    }
    return newArr
}

function setCaretPosition(elemId, caretPos) {
    var elem = document.getElementById(elemId);

    if (elem != null) {
        if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        }
        else {
            if (elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            }
            else
                elem.focus();
        }
    }
}

function convertIntegerToTime(int) {
    //int format "minutes from start of day"
    let d = new Date(int * 1000);
    str = `${d.getHours()}:${d.getMinutes()}`
    return str
}

function isInteger(value) {
    return /^\d+$/.test(value);
}

function dateRules(e) {
    idArr = e.target.id.split("-")
    baseId = idArr.splice(4, idArr.length).join("-")

    isHours = e.target.id.includes("hours")
    minutes = parseInt(document.getElementById(`custom-date-input-minutes-${baseId}`).value)
    hours = parseInt(document.getElementById(`custom-date-input-hours-${baseId}`).value)
    timeInt = (hours * 60) + minutes
    newAddition = e.data


    let currentValue = e.target.getAttribute("data-current-val")
    newValue = e.target.value
    caretIndex = e.target.selectionStart
    maxTime = parseInt(document.getElementById(`${baseId}-box`).getAttribute("data-max"))
    minTime = parseInt(document.getElementById(`${baseId}-box`).getAttribute("data-min"))


    if (e.inputType === "insertText") {
        if (isInteger(newAddition) == false) {
            e.target.value = currentValue
            return
        }

        if (isHours) {
            baseTime = minutes
            newVal = "";
            newCaretPos = ""
            inputId = "";

            if (caretIndex == 1) { //1
                newVal = newAddition + currentValue[1]
                newCaretPos = 1
                inputId = `custom-date-input-hours-${baseId}`
            }
            else if (caretIndex == 2) { //2
                newVal = currentValue[0] + newAddition
                newCaretPos = 0
                inputId = `custom-date-input-minutes-${baseId}`
            }

            if (caretIndex > 2) {
                e.target.value = currentValue
                setCaretPosition(`custom-date-input-hours-${baseId}`, 1)
            }


            posNewTimeInt = (baseTime + (parseInt(newVal) * 60))
            if ((posNewTimeInt < maxTime) && (posNewTimeInt >= minTime)) {
                e.target.value = newVal
                e.target.setAttribute("data-current-val", newVal)
                setCaretPosition(inputId, newCaretPos)

                if ((`custom-date-input-minutes-${baseId}`) && (newCaretPos == 1)) {
                    inputMinutes.setAttribute("data-push-switch", "false")
                }
            }

            else {
                e.target.value = currentValue
                setCaretPosition(`custom-date-input-hours-${baseId}`, 1)
            }
        }
        else {
            baseTime = (hours * 60)
            newVal = "";
            newCaretPos = ""
            inputId = "";

            if (caretIndex == 1) { //1
                newVal = parseInt(newAddition + currentValue[1])
                newCaretPos = 1
                inputId = `custom-date-input-minutes-${baseId}`
            }

            else if (caretIndex == 2) { //2
                newVal = parseInt(currentValue[0] + newAddition)
                newCaretPos = 2
                inputId = `custom-date-input-minutes-${baseId}`
            }

            if (caretIndex > 2) {
                e.target.value = currentValue
                setCaretPosition(`custom-date-input-hours-${baseId}`, 1)
                return // maybe reomve
            }

            posNewTimeInt = (baseTime + (parseInt(newVal)))

            if (((posNewTimeInt < maxTime) && (posNewTimeInt >= minTime)) && (newVal < 60)) {
                newValPadded = `${newVal}`.padStart(2, "0")
                e.target.value = newValPadded
                e.target.setAttribute("data-current-val", newValPadded)
                setCaretPosition(inputId, newCaretPos)
            }

            else {
                e.target.value = currentValue
                setCaretPosition(inputId, (caretIndex - 1))
            }
        }

    }

    else if (e.inputType == "deleteContentBackward") {
        if (newValue == currentValue[0]) {
            newValue == newValue.padStart(2, '0')
        }
        else if (newValue == currentValue[1]) {
            console.log("sdfsdfsdfafcafjnqekfjwbf")
            newValue == newValue.padEnd(2, '0')
        }

        newValueInt = parseInt(newValue)
        if (newValueInt < min) {
            //add tens place plus one for now, if more complex needed add more
            newValueInt += 10
        }
        newVal = `${newValueInt}`.padStart(2, '0')
        e.target.value = newVal
        e.target.setAttribute("data-current-val", newVal)
    }

    else {
        e.target.value = currentValue
    }
}

function moveOnDate(e) {
    key = e.code

    idArr = e.target.id.split("-")
    baseId = idArr.splice(4, idArr.length).join("-")
    isHours = e.target.id.includes("hours")
    caretIndex = e.target.selectionStart

    if ((key == "ArrowRight") && (isHours == true) && (caretIndex == 2)) { //maybe 1 or 2
        setCaretPosition(`custom-date-input-minutes-${baseId}`, 0)
        document.getElementById(`custom-date-input-minutes-${baseId}`).setAttribute("data-push-switch", "true")
    }
    else if ((key == "ArrowLeft") && (isHours == false) && (caretIndex == 0)) { //maybe 1 or 2
        let inputMinutes = document.getElementById(`custom-date-input-minutes-${baseId}`)
        bool = inputMinutes.getAttribute("data-push-switch") == "true"
        if (bool) {
            setCaretPosition(`custom-date-input-hours-${baseId}`, 1)
            inputMinutes.setAttribute("data-push-switch", "false")
        }
        else {
            inputMinutes.setAttribute("data-push-switch", "true")
        }
    }
    else if ((key == "ArrowRight") && (isHours == false) && (caretIndex == 1)) { //maybe 1 or 2
        //this stops another problem from the data-push-switch atribute, which would lead to the focus moves too early
        let inputMinutes = document.getElementById(`custom-date-input-minutes-${baseId}`)
        inputMinutes.setAttribute("data-push-switch", "false")
    }
}

function stopWrongCaretsClick(e) {
    idArr = e.target.id.split("-")
    baseId = idArr.splice(4, idArr.length).join("-")
    caretIndex = e.target.selectionStart
    isHours = e.target.id.includes("hours")
    if (isHours) {
        setCaretPosition(`custom-date-input-hours-${baseId}`, 0)
    }
    else {
        setCaretPosition(`custom-date-input-minutes-${baseId}`, 0)
    }
}

function createCustomTimeDate(obj) {
    /*
    obj = {
        id: valid css str/int, no "-",
        min: str,
        max: str,
        smallestValidRange: integer, default 20
        invalidTimeRanges: [[start, end], [start, end]]
        eventListeners: [
            {
                eventType: "str",
                eventFunction: function
            }
        ]
    }
    */

    if (obj.id.includes("-")) throw new Error(`invalid id, includes "-"`)

    max = obj.max
    min = obj.min
    id = obj.id
    listeners = obj.eventListeners


    minMinutes = `${min % 60}`.padStart(2, '0')
    minHours = `${Math.floor(min / 60)}`.padStart(2, '0')

    maxMinutes = `${max % 60}`.padStart(2, '0')
    maxHours = `${Math.floor(max / 60)}`.padStart(2, '0')

    div = document.createElement("div")
    div.className = "custom-date-input-box w-auto"

    div.id = `${id}-box`

    div.setAttribute("data-max", max)
    div.setAttribute("data-min", min)

    if (obj.invalidTimeRanges) {
        div.setAttribute("invalid-ranges", obj.invalidTimeRanges.toString())
    }

    if (obj.smallestValidRangeSize) {
        div.setAttribute("invalid-ranges", obj.smallestValidRangeSize)
    }
    else {
        div.setAttribute("invalid-ranges", 20)
    }

    inputHours = document.createElement("input")
    inputHours.type = "text"
    inputHours.id = `custom-date-input-hours-${id}`
    inputHours.className = "borderless no-focus custom-date-input w-30p"
    inputHours.value = minHours
    inputHours.min = minHours
    inputHours.max = maxHours
    inputHours.setAttribute("data-current-val", minHours)
    inputHours.addEventListener("input", e => {
        dateRules(e)
    })
    inputHours.addEventListener("keyup", e => {
        moveOnDate(e)
    })
    inputHours.addEventListener("click", e => {
        stopWrongCaretsClick(e)
    })



    span = document.createElement("span")
    span.className = "custom-date-input-separator"
    span.innerHTML = ":"

    inputMinutes = document.createElement("input")
    inputMinutes.type = "text"
    inputMinutes.id = `custom-date-input-minutes-${id}`
    inputMinutes.className = "borderless no-focus custom-date-input w-30p"
    inputMinutes.value = minMinutes
    inputMinutes.max = maxMinutes
    inputMinutes.min = minMinutes
    inputMinutes.setAttribute("data-current-val", minMinutes)

    inputMinutes.addEventListener("input", e => {
        dateRules(e)
    })
    inputMinutes.addEventListener("keyup", e => {
        moveOnDate(e)
    })

    inputMinutes.addEventListener("click", e => {
        stopWrongCaretsClick(e)
    })

    for (let index = 0; index < listeners.length; index++) {
        const element = listeners[index];

        eventType = element.eventType
        eventFunction = element.eventFunction

        inputMinutes.addEventListener(`${eventType}`, e => {
            eventFunction(e)
        })

        inputHours.addEventListener(`${eventType}`, e => {
            eventFunction(e)
        })
    }
    div.append(inputHours, span, inputMinutes)
    return div
}

function deleteCustomTimeDate(id) {
    removeElement(id)
}

function updateCustomTimeDateSettings(id, details) {
    /*
      details = {
        updateType: "max" | "min" | "addInvalidTime" | "removeInvalidTime" | "overrideInvalidTime"| "smallestValidRange",
        updateVal: val | anything
      }
      "max" | "min"  input type is integer
    */
    minutesInput = document.getElementById(`custom-date-input-minutes-${id}`)
    hoursInput = document.getElementById(`custom-date-input-hours-${id}`)
    minutesInputVal = parseInt(minutesInput.value)
    hoursInputVal = parseInt(hoursInput.value)
    updateType = details.updateType
    updateVal = details.updateVal

    if (updateType == "max") {
        newMaxInt = details.updateVal

        newMaxHoursStr = `${Math.floor(details.updateVal / 60)}`.padStart(2, '0')
        newMaxMinutesStr = `${details.updateVal % 60}`.padStart(2, '0')

        newMaxMinutes = updateVal % 60
        newMaxHours = Math.floor(updateVal / 60)
        currentTime = (hoursInputVal * 60) + minutesInputVal

        if (currentTime > newMaxInt) {
            minutesInput.value = newMaxMinutesStr
            minutesInput.setAttribute("data-current-val", newMaxMinutesStr)
            minutesInput.max = newMaxMinutesStr

            hoursInput.value = newMaxHoursStr
            hoursInput.setAttribute("data-current-val", newMaxHoursStr)
            minutesInput.max = newMaxHoursStr
        }
    }
    else if (updateType == "min") {
        newMinInt = details.updateVal

        newMinHoursStr = `${Math.floor(details.updateVal / 60)}`.padStart(2, '0')
        newMinMinutesStr = `${details.updateVal % 60}`.padStart(2, '0')

        newMinMinutes = updateVal % 60
        newMinHours = Math.floor(updateVal / 60)
        currentTime = (hoursInputVal * 60) + minutesInputVal


        if (currentTime < newMinInt) {
            minutesInput.value = newMinMinutesStr
            minutesInput.setAttribute("data-current-val", newMinMinutesStr)
            minutesInput.min = newMinMinutesStr

            hoursInput.value = newMinHoursStr
            hoursInput.setAttribute("data-current-val", newMinHoursStr)
            minutesInput.min = newMinHoursStr
        }
    }
    else if (updateType == "addInvalidTime") {
        currentTime = (hoursInputVal * 60) + minutesInputVal
        invalidTimes = convertStrToInvalidDates(document.getElementById(`${id}-box`).getAttribute("invalid-ranges"))
        invalidTimes.push(updateVal)

        document.getElementById(`${id}-box`).setAttribute("invalid-ranges")

        min = getCustomTimeDateInfo(id, "min")
        min = getCustomTimeDateInfo(id, "max")

        currentTimeInt = getCustomTimeDateInfo(id, "currentTimeInt")

        newTimeInt = rangeCheck(min, max, currentTime, invalidTimeRanges, moveUp = false, smallestRange = 20)

        if (newTimeInt == false) {
            //set val to input to 00:00
        }
        else {
            //set val to input to 00:00
            newMaxHoursStr = `${Math.floor(details.updateVal / 60)}`.padStart(2, '0')
            newMaxMinutesStr = `${details.updateVal % 60}`.padStart(2, '0')


        }

    }
    else if (updateType == "removeInvalidTime") {
        invalidTimes = convertStrToInvalidDates(document.getElementById(`${id}-box`).getAttribute("invalid-ranges"))
        invalidTimes.remove(updateVal)
        document.getElementById(`${id}-box`).setAttribute("invalid-ranges", invalidTimes.toString())
    }
    else if (updateType == "overRideInvalidTime") {
        invalidTimes = updateVal
    }
    //range calculation here
}

function getCustomTimeDateInfo(id, type) {
    /*
    type: "max" | "min" | "invalidTimes" | "validTimes"|  "validTimesIndex" | "smallestValidRangeSize" | "currentTimeStr" | "currentTimeInt"
    */
    minutesInput = document.getElementById(`custom-date-input-minutes-${id}`)
    hoursInput = document.getElementById(`custom-date-input-hours-${id}`)
    minutesInputVal = parseInt(minutesInput.value)
    hoursInputVal = parseInt(hoursInput.value)

    if (type == "max") {
        maxTime = parseInt(document.getElementById(`${id}-box`).getAttribute("data-max"))
        return maxTime
    }
    else if (type == "min") {
        minTime = parseInt(document.getElementById(`${id}-box`).getAttribute("data-min"))
        return minTime

    }
    else if (type == "invalidTimes") {
        invalidTimeRanges = convertStrToInvalidDates(document.getElementById(`${baseId}-box`).getAttribute("invalid-ranges"))
        return invalidTimeRanges
    }
    else if (type == "validTimes") {
        maxTime = parseInt(document.getElementById(`${id}-box`).getAttribute("data-max"))
        minTime = parseInt(document.getElementById(`${id}-box`).getAttribute("data-min"))
        invalidTimeRanges = convertStrToInvalidDates(document.getElementById(`${id}-box`).getAttribute("invalid-ranges"))
        validTimeRanges = getValidRangesFromInvalid(invalidTimeRanges, currentTime, min, max, smallestInterval = 20)
        return validTimeRanges
    }
    else if (type == "validTimesIndex") {
        minutesInput = document.getElementById(`custom-date-input-minutes-${id}`)
        hoursInput = document.getElementById(`custom-date-input-hours-${id}`)
        minutesInputVal = parseInt(minutesInput.value)
        hoursInputVal = parseInt(hoursInput.value)
        currentTime = (hoursInputVal * 60) + minutesInputVal

        maxTime = parseInt(document.getElementById(`${id}-box`).getAttribute("data-max"))
        minTime = parseInt(document.getElementById(`${id}-box`).getAttribute("data-min"))
        invalidTimeRanges = convertStrToInvalidDates(document.getElementById(`${baseId}-box`).getAttribute("invalid-ranges"))
        validTimeRanges = getValidRangesFromInvalid(invalidTimeRanges, currentTime, min, max)

        if (validTimeRanges == false) return false

        for (let index = 0; index < validTimeRanges.length; index++) {
            const range = validTimeRanges[index];
            if (rangeIncudesVal(range, currentTime)) {
                return index
            }
        }
    }
    else if (type == "smallestValidRangeSize") {
        return parseInt(document.getElementById(`${id}-box`).getAttribute("smallestValidRangeSize"))
    }
    else if (type == "currentTimeStr") {
        minutes = document.getElementById(`custom-date-input-minutes-${id}`).value
        hours = document.getElementById(`custom-date-input-hours-${id}`).value
        return `${hours}:${minutes}`
    }
    else if (type == "currentTimeInt") {
        minutesInput = document.getElementById(`custom-date-input-minutes-${id}`)
        hoursInput = document.getElementById(`custom-date-input-hours-${id}`)
        minutesInputVal = parseInt(minutesInput.value)
        hoursInputVal = parseInt(hoursInput.value)
        currentTime = (hoursInputVal * 60) + minutesInputVal
        return currentTime
    }

}



function getValidRangesFromInvalid(min, max, invalidTimeRanges, smallestRange = 20) {
    if (invalidTimeRanges.constructor !== Array) throw new Error("invalid time range")
    if (invalidTimeRanges[0].constructor !== Array) throw new Error("invalid time range")
    validRanges = []

    for (let index = 0; index < (invalidTimeRanges.length + 1); index++) { //length + 1 for last range
        startTime = 0
        endTime = 0

        if (index == 0) {
            startTime = min + 1;
            endTime = invalidTimeRanges[index][0] - 1;
        }
        else if (index == (invalidTimeRanges.length)) {
            startTime = invalidTimeRanges[index - 1][1] + 1;
            endTime = max - 1;
        }
        else {
            startTime = invalidTimeRanges[index - 1][1] + 1;
            endTime = invalidTimeRanges[index][0] - 1;
        }
        if ((endTime - startTime) > smallestRange) {
            validRanges.push([startTime, endTime])
        }
    }

    if (validRanges == []) return false
    return validRanges
}
function isOverlapRange(range1, range2) {
    x1 = range1[0]
    x2 = range1[1]
    y1 = range2[0]
    y2 = range2[1]
    return x1 <= y2 && y1 <= x2
}
function addRanges(range1, range2) {
    lowPoint = range1[0]
    highPoint = range1[1]
    if (range1[0] > range2[0]) lowPoint = range2[0]
    if (range1[1] < range2[1]) highPoint = range2[1]
    return [lowPoint, highPoint]
}
function isOverlapRangeArr(arrOfRanges) {
    for (let i = 0; i < arrOfRanges.length; i++) {
        const range1 = arrOfRanges[i];
        for (let j = (i + 1); j < arrOfRanges.length; j++) {
            const range2 = arrOfRanges[j];
            if (isOverlapRange(range1, range2)) {
                return true
            }
        }

    }
    return false
}
function addRangesArr(arrOfRanges) {

    if (isOverlap(arrOfRanges)) {
        newRanges = []
        for (let i = 0; i < arrOfRanges.length; i++) {
            const range = arrOfRanges[i];
            if (newRanges.length > 0) {
                for (let j = 0; j < newRanges.length; j++) {
                    if (newRanges[j][0] > arrOfRanges[i][0]) {
                        //overlap at min
                    }
                    if (newRanges[j][1] < arrOfRanges[i][1]) {
                        //overlap at max
                    }
                }
            }
            else {
                newRanges.push(range)
            }
        }
        return addRanges(newRanges, shrinkRange = { min: 20, max: 60 })
    }
    else {
        return arrOfRanges
    }
}
function rangeIncudesVal(range, val) {
    return ((range[0] < val) && (range[1] > val))
}

function rangeCheck(min, max, currentTime, invalidTimeRanges, moveUp = false, smallestRange = 20) {
    let validRanges = getValidRangesFromInvalid(min, max, invalidTimeRanges, smallestRange)
    isInvalidTime = false; //doubles up as bool and arr



    for (let index = 0; index < invalidTimeRanges.length; index++) {
        const range = invalidTimeRanges[index];
        if (rangeIncudesVal(range, currentTime)) {
            //if the current time is invalid, then we need to find the next best time
            isInvalidTime = range //invalid range that current time is in
            break;
        }
    }

    if (isInvalidTime) {

        totalRanges = validRanges.push(invalidTimeRanges)
        totalRanges.sort(function (a, b) { return a[0] - b[0] });

        for (let index = 0; index < totalRanges.length; index++) {
            const element = totalRanges[index];
            if (element == isInvalidTime) {
                if (moveUp) {
                    if (totalRanges[index + 1]) {
                        return totalRanges[index + 1][0]
                    }
                    else if (totalRanges[index - 1]) {
                        return totalRanges[index - 1][0]
                    }
                    else {
                        return false
                    }
                }
                else {
                    if (totalRanges[index - 1]) {
                        return totalRanges[index - 1][0]
                    }
                    else if (totalRanges[index + 1]) {
                        return totalRanges[index + 1][0]
                    }
                    else {
                        return false
                    }
                }
            }
        }
    }
    else {
        for (let index = 0; index < validRanges.length; index++) {
            const range = validRanges[index];
            difference = validRanges[index][1] - validRanges[index][0]
            if (difference > smallestRange) {
                if (rangeIncudesVal(range, currentTime)) {
                    return currentTime
                }
            }
        }
    }
}
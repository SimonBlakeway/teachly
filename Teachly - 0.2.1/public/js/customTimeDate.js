function convertTimeToInteger(time) {
    //time format "11:22"
    let d = new Date(0);
    //time += "" //":00"
    let newDate = new Date(d.toString().split(":")[0].slice(0, -2) + time);
    newNum = ((newDate.getTime() / 1000) / 60) - newDate.getTimezoneOffset()
    return newNum
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
                newVal = parseInt(newAddition + currentValue[1])
                newCaretPos = 2
                inputId = `custom-date-input-minutes-${baseId}`
            }

            if (caretIndex > 2) {
                e.target.value = currentValue
                setCaretPosition(`custom-date-input-hours-${baseId}`, 1)
            }

            posNewTimeInt = (baseTime + (parseInt(newVal)))

            if (((posNewTimeInt < maxTime) && (posNewTimeInt >= minTime)) && (newVal < 59)) {
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
        //this stops another proble from the data-push-switch atribute, which would lead to the focus movins too early


        let inputMinutes = document.getElementById(`custom-date-input-minutes-${baseId}`)
        inputMinutes.setAttribute("data-push-switch", "false")
    }
}

function createCustomTimeDate(obj) {
    /*
    obj = {
        id: valid css str/int,
        min: str,
        max: str,
        eventListeners: [
            {
                eventType: "str",
                eventFunction: function
            }
        ]
    }
    */

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
        updateType: "max" | "min",
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
}

function getCustomTimeDateVals(id) {
    minutes = document.getElementById(`custom-date-input-minutes-${id}`).value
    hours = document.getElementById(`custom-date-input-hours-${id}`).value
    return `${hours}:${minutes}`
}
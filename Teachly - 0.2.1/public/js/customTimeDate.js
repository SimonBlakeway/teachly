
function convertTimeToInteger(time) {
    //time format "11:22"
    let d = new Date(0);
    time += ":00"
    let newDate = new Date(d.toString().split(":")[0].slice(0, -2) + time);
    return newDate.getTime() / 1000
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


    minutes = parseInt(document.getElementById(`custom-date-input-minutes-${baseId}`).value)
    hours = parseInt(document.getElementById(`custom-date-input-hours-${baseId}`).value)
    timeInt = (hours * 60) + minutes


    newAddition = e.data
    currentValue = e.target.getAttribute("currentValue")
    max = parseInt(e.target.getAttribute("max"))
    min = parseInt(e.target.getAttribute("min"))
    newValue = e.target.value

    console.log([document.getElementById(`custom-date-input-minutes-${baseId}`).getAttribute("currentValue")], "Ree")

    if (e.inputType === "insertText") {
        if (isInteger(newAddition) == false) {
            e.target.value = oldValue
            return
        }

        if (timeInt > max) {
            e.target.value = oldValue
            return
        }

        if (timeInt <= min) {
            e.target.value = oldValue
            return
        }


    }

    else if (e.inputType == "deleteContentBackward") {
        if (newValue == currentValue[0]) {
            newValue == newValue.padStart(2, '0')
        }
        else if (newValue == currentValue[1]) {
            newValue == newValue.padEnd(2, '0')
        }

        newValueInt = parseInt(newValue)

        if (newValueInt < min) {
            //add tens place plus one for now, if more complex needed add more
            newValueInt += 10
        }

        e.target.value = newValueInt



    }
}

function createCustomTimeDate(obj) {
    /*
    obj = {
        id: valid css str/int,
        min: str,
        max: str,
    }
    
    */


    max = obj.max
    min = obj.min
    id = obj.id

    minMinutes = `${min % 60}`.padStart(2, '0')
    minHours = `${min / 60}`.padStart(2, '0')


    div = document.createElement("div")
    div.className = "custom-date-input-box w-auto"

    div.id = id

    inputHours = document.createElement("input")
    inputHours.type = "text"
    inputHours.id = `custom-date-input-hours-${id}`
    inputHours.className = "borderless no-focus custom-date-input w-30p"
    inputHours.currentValue = minHours
    inputHours.value = minHours
    inputHours.max = max
    inputHours.min = min


    input.addEventListener("input", e => {
        dateRules(e)
    })

    span = document.createElement("span")
    span.className = "custom-date-input-separator"
    span.innerHTML = ":"

    inputMinutes = document.createElement("input")
    inputMinutes.type = "text"
    inputMinutes.id = `custom-date-input-minutes-${id}`
    inputMinutes.className = "borderless no-focus custom-date-input w-30p"
    inputMinutes.currentValue = minMinutes
    inputMinutes.value = minMinutes

    inputMinutes.max = max
    inputMinutes.min = min
    inputMinutes.addEventListener("input", e => {
        dateRules(e)
    })

    div.append(inputHours, span, inputMinutes)
    return div

}

function deleteCustomTimeDate(id) {

}

function undateCustomTimeDateSettings(id) {

}

function getCustomTimeDateVals(id) {
    minutes = document.getElementById(`${id}-custom-date-input-minutes`)
    hours = document.getElementById(`${id}-custom-date-input-hours`)
    return `${hours}:${minutes}`
}

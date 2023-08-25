toggleTimePopup = function () {
    popup = document.getElementById("time-range-popup")
    popup.classList.toggle("display-nonei")
}


sendBooking = async function () {


    time = this.window.timeRangeArr



    if (typeof time != "undefined") {

        body = {
            timeRange: time,
            courseId: courseId,
            subject: subject,
            teacherId: teacherId
        }




        res = await axios({
            method: 'post',
            url: '/learn/book-lesson',
            data: body,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

}
window.addEventListener('load', function () {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",]
    const currentDay = days[new Date().getDay()]
    const dayIndex = new Date().getDay()
    const adaptedDays = [...days.slice(dayIndex, days.length), ...days.slice(0, dayIndex)]
    const nowInMinutes = Math.floor(Date.now() / 1000)
    const timeOffset = new Date().getTimezoneOffset() / 60




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
                obj[`${day}`].push([getTimeFromDate(start), getTimeFromDate(finish), [start, finish]])
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
            outerDiv.id = `${i}-calender-${courseId}`
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
                timeDiv.className = `w-100p p-0 fs-15p d-flex brdr-r-5 h-30pi bg-blacki h-40p fs-20p btn btn-outline-primary m-0 my-2 select-time`

                let timeText = document.createElement("div")
                timeText.innerHTML = `${startDate} - ${endDate}`
                timeText.className = "pt-2p"
                timeText.setAttribute("data-start", times[2][0])
                timeText.setAttribute("data-finish", times[2][1])

                timeDiv.append(timeText)
                box.append(timeDiv)
            }

            box.className = "inline-grid-r-auto3-c-auto3 justify-items-center align-items-center grid-gap-3p m-0 p-0"
            outerDiv.append(box)
            timeRange.appendChild(outerDiv);
        }
        return timeRange
    }

    document.getElementById("time-range-popup").append(generateCourseTimeTable(CourseTimeRange, courseId))


    document.querySelectorAll(".goto-calender-day-button-course").forEach(el => el.addEventListener("click", e => {
        let course_Id = e.target.getAttribute("data-course-id")
        let newDayIndex = parseInt(e.target.id.split("-")[3])
        let oldDayIndex = parseInt(e.target.id.split("-")[5])
        document.getElementById(`${oldDayIndex}-calender-${course_Id}`).classList.add("display-nonei")
        document.getElementById(`${newDayIndex}-calender-${course_Id}`).classList.remove("display-nonei")
    }))

    document.querySelectorAll(".select-time").forEach(el => el.addEventListener("click", e => {
        let start = e.target.getAttribute("data-start") / 1000
        let finish = e.target.getAttribute("data-finish") / 1000
        this.window.timeRangeArr = [start, finish]
        toggleTimePopup()

        document.getElementById("toggle-time-popup").innerHTML = e.target.innerHTML


        document.getElementById('hidden-time-input').value = "activated" 

    }))


    document.getElementById("book-lesson").addEventListener("click", e => {
        document.getElementById("time-range-popup").classList.add("display-nonei")
    })



    document.getElementById("send-lesson-booking-req").addEventListener("click", e => {
        sendBooking()
    })


    document.getElementById("toggle-time-popup").addEventListener("click", e => {
        toggleTimePopup()
    })
})  
var imageWorker; //= new Worker('/js/imageWorker.js', { credentials: "include" });



const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
var specialitiesObj = {};
var imageStr = false
var taughtInArr = []

function getUTCTimeStampNoHours(date = new Date()) {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ).getTime()
}


function setSubject(subject) {
  document.getElementById("subject").innerText = subject
  document.getElementById("hidden-subject-input").value = subject
  document.getElementById("speciality-checkboxes").innerHTML = ""
  arr = specialitiesObj[`${subject}`]
  if (arr == "") {
    node = document.createElement("div");
    node.innerHTML = "no specialties";
    node.className = "text-center fs-5"
    document.getElementById("speciality-checkboxes").appendChild(node);
    return
  }
  for (let i = 0; i < arr.length; i++) {
    node = document.createElement("div");
    node.className = "my-2"
    specialityWithBars = arr[i].replaceAll(" ", "-").replaceAll("'", "&apos")


    label = document.createElement("label")
    label.for = `${specialityWithBars}`

    input = document.createElement("input")

    input.className = "form-check-input mr-5pi"
    input.type = "checkbox"
    input.id = `${specialityWithBars}`
    input.name = `${specialityWithBars}`

    input.addEventListener("click", e => {
      setSpeciality(`${specialityWithBars}`)
    })


    label.className = "form-check-label text-dark"
    label.for = `${specialityWithBars}`
    label.innerHTML = `${arr[i]}`

    br = document.createElement("br")


    //  node.innerHTML = `
    //                  <input class="form-check-input" type="checkbox" id="${specialityWithBars}" name="${specialityWithBars}" o000nclick='setSpeciality("${specialityWithBars}")'></input>
    //                  <label class="form-check-label text-dark" for=${specialityWithBars}>${arr[i]}</label><br>`;

    node.append(input, label, br)
    document.getElementById("speciality-checkboxes").appendChild(node);
  }
  clearCoursePopups()
}

function setSpeciality() {
  innerDivs = document.getElementById("speciality-checkboxes").children
  chosenSpec = []
  for (i = 0; i < innerDivs.length; i++) {
    if (innerDivs[i].children[0].checked) {
      chosenSpec.push(innerDivs[i].children[1].innerText)
    }
  }
  if (chosenSpec.length != 0) {
    document.getElementById("specialities").innerText = chosenSpec.join(", ")
  }
  else {
    textBox = document.getElementById("specialities")
    defaultText = textBox.getAttribute("data-default-val")
    textBox.innerText = defaultText
  }
}

function setTimeRange(id) {
  timeRangeCheckbox = document.getElementById(id)
  classNameArr = timeRangeCheckbox.className.split(" ")
  isActivated = classNameArr.indexOf("active-time-slot-div")
  if (isActivated != -1) {
    classNameArr.splice(isActivated, 1)
    timeRangeCheckbox.className = classNameArr.join(" ")
  }
  else { timeRangeCheckbox.className += " active-time-slot-div" }
  timeRanges = document.getElementsByClassName("active-time-slot-div")
  field = document.getElementById('hidden-timeRange-input');
  if (timeRanges.length != 0) { field.value = "activated" }
  else { field.value = field.defaultValue; } //setting to "" stops required from working}
}

function convertTimeToInteger(time) {
  //time format "11:22"
  let d = new Date(0);
  time += ":00"
  console.log(d.toString().split(":")[0].slice(0, -2) + time)
  let newDate = new Date(d.toString().split(":")[0].slice(0, -2) + time);
  return newDate.getTime() / 1000
}

function convertIntegerToTime(int) {
  //int format "minutes from start of day"
  let d = new Date(int * 1000);
  str = `${d.getHours()}:${d.getMinutes()}`
  return str
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
    console.log("is good")
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
    console.log("is good")
    hiddenInput = document.getElementById("hidden-timeRange-input")
    hiddenInput.value = "the user has selected a time"
  }
}

function getTimesCalender(calenderId, removeTimeZone = true) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  adaptedDays = [...days.slice(dayIndex, days.length), ...days.slice(0, dayIndex)]


  let timesArr = []
  let timesDivs = document.querySelectorAll(`.calender-time-${calenderId}`)
  const timeOffset = new Date().getTimezoneOffset()
  const BaseTime = getUTCTimeStampNoHours()



  if (removeTimeZone) {
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

  if (timesArr.length == 0) {
    return timesArr
  }
  return timesArr
}

function setTaughtIn() {
  innerDivs = document.getElementById("taughtIn-list").children
  chosenSpec = []
  taughtInArr = []
  for (i = 0; i < innerDivs.length; i++) {
    if (innerDivs[i].children[0].checked) {
      chosenSpec.push(innerDivs[i].children[1].innerHTML)
      taughtInArr.push(innerDivs[i].children[1].id.split("-")[0])
    }
  }
  if (chosenSpec.length != 0) {
    document.getElementById("taughtIn").innerText = chosenSpec.join(", ")
  }
  else {
    document.getElementById("taughtIn").innerText = "{{context.bodyContext.choose}}"
  }
}

function searchBox(boxId, inputId) {
  try {
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
  catch (err) {

  }
}

function clearCoursePopups() {
  popupArr = document.getElementsByClassName("popup")
  for (i = 0; i < popupArr.length; i++) {
    popupArr[i].style.display = "none";
    popupArr[i].style.visibility = "hidden";
  }
}

function toggleCoursePopup(id) {
  var subjectPopup = document.getElementById(id);
  if (subjectPopup.style.display == "block") {
    subjectPopup.style.display = "none";
    subjectPopup.style.visibility = "hidden";
  }
  else {
    clearCoursePopups()
    subjectPopup.style.display = "block";
    subjectPopup.style.visibility = "visible";

    try {
      document.getElementById(id.split("-")[0] + "-search-input").focus();
    }
    catch {

    }
  }
}

function toggleErrPopup(errName) {
  var ErrPopups = document.getElementsByClassName("err");
  for (i = 0; i < ErrPopups.length; i++) {
    ErrPopups[i].style.display = "none";
    ErrPopups[i].style.visibility = "hidden";

  }
  chosenPopup = document.getElementById(errName + "-err")
  chosenPopup.style.display = "block";
  chosenPopup.style.visibility = "visible";

  popup = document.getElementById("err-popup")
  popup.style.display = "block";
  popup.style.visibility = "visible";
  setTimeout(function () {
    $(`#${errName}-err`).fadeOut('fast')
  }, 1000);
}

function sub() {
  clearCoursePopups()
  input = document.getElementById("upfile")
  var file = input.files[0];
  reader = new FileReader();
  var fileName = file.name.split(".")[0]
  reader.onloadend = () => {
    base64Image = reader.result.split(';base64,').pop();
    imageStr = false;
    if (imageWorker) { // if image is already proceesing, stop and restart
      imageWorker.terminate()
      imageWorker = new Worker('/js/imageWorker.js', { credentials: "include" });
      imageWorker.postMessage(base64Image);

    }
    else { // else just create and activate
      imageWorker = new Worker('/js/imageWorker.js', { credentials: "include" });
      imageWorker.postMessage(base64Image);
    }

    imageWorker.onmessage = function (e) {
      imageStr = e.data;
      imageWorker.terminate() //stop worker when done
    };

    imageWorker.postMessage(base64Image);
  }
  reader.readAsDataURL(file)
  document.getElementById("upfile").click(); //click the required input

  console.log("fileName", fileName)

  if (fileName[fileName.length - 1] == "") {
    defaultText = document.getElementById("course-image").getAttribute("default-val")
    document.getElementById("course-image").innerHTML = defaultText
  }
  else {
    console.log(fileName.slice(0, 15))
    document.getElementById("course-image").innerHTML = fileName.slice(0, 15) //50 chars for now
  }
}

async function sendCourseData() {

  if (imageStr == false) return

  function basicCourseObjCheck(obj) {
    if (obj.subject == "") { return false }
    if (obj.description == "") { return false }
    if (obj.taughtIn == "") { return false }
    if (obj.price_per_minute > 0.05) { return false }
    if (obj.price_per_minute > 5) { return false }
    if (obj.courseTimeRanges.length == 0) { return false }
    return true
  }

  async function sendReq(courseData) {
    try {
      res = await axios({
        method: 'post',
        url: '/teach/createCourse',
        data: courseData,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (res.data.err) {
        toggleErrPopup(res.data.err)
      }
      else {
        switchToFinanceLogin()
      }
    }
    catch (err) {
      console.log(err)
    }
  }
  try {
    specialities = $("#specialities").text()
    if (specialities == "\n                  Choose") { specialities = [] }
    else { specialities = specialities.split(", ") }

    courseData = {
      subject: $("#subject").text(),
      specialities: specialities,
      description: $("#description").val(),
      courseImg: imageStr,
      taughtIn: taughtInArr,
      pricePerMinute: Number($("#price").val()) / curConversionRatio, 
      courseTimeRanges: getTimesCalender("courseTimes", removeTimeZone = true)
    }
    if (!basicCourseObjCheck(courseData)) {
      return
    }
    sendReq(courseData)
  }
  catch (err) {
    console.log(err)
  }
}

window.addEventListener('load', async function () {
  async function populateSubjects() {
    try {
      res = await axios.get('/get/validSubject')
      let arr = res.data.sort((a, b) => { return a.localeCompare(b, userLang) })
      subjectArr = arr
      for (let i = 0; i < arr.length; i++) {
        node = document.createElement("li");

        div = document.createElement("div")
        div.addEventListener("click", e => {
          setSubject(`${arr[i]}`)
        })
        div.className = "subject-li"
        div.innerHTML = `${arr[i]}`
        node.appendChild(div)
        //node.innerHTML = `<div class="subject-li" o000nclick='setSubject("${arr[i]}")''>${arr[i]}</div>`;
        document.getElementById("subject-box").appendChild(node);
      }
      return arr
    }
    catch (err) {
    }
  }

  async function populateSpecialities(subjects) {
    async function appendSpec(subject) {
      res = await axios.get(`/get/validSpecialities/${subject}`)
      specArr = [];
      if (res.data) {
        specArr = res.data.sort((a, b) => { return a.localeCompare(b, userLang) })
      }
      else {
        specArr = ""
      }
      specialitiesObj[`${subject}`] = specArr
    }
    try {
      for (i = 0; i < subjects.length; i++) {
        appendSpec(subjects[i])
      }
    }
    catch (err) {
    }
  }

  subjects = await populateSubjects()
  populateSpecialities(subjects)

  //populate taughtin
  arr = languageArr.sort((a, b) => { return a[0].localeCompare(b[0], userLang) })
  for (let i = 0; i < arr.length; i++) {
    langPair = arr[i].split(",")
    node = document.createElement("div");


    label = document.createElement("label");
    label.className = "form-check-label text-dark"
    label.id = `${langPair[1]}-label`
    label.for = `${langPair[0]}`
    label.innerHTML = `${langPair[0]}`

    input = document.createElement("input");
    input.className = "form-check-input w-20p mr-5p"
    input.type = "checkbox"
    input.id = `${langPair[0]}`
    input.name = `${langPair[0]}`
    input.addEventListener('click', event => {
      setTaughtIn()
    })

    br = document.createElement("br")


    //node.innerHTML = `
    //                <input class="form-check-input w-20p mr-5p" type="checkbox" id="${langPair[0]}" name="${langPair[0]}" o000nclick='setTaughtIn()'></input>
    //                <label class="form-check-label text-dark" id="${langPair[1]}-label" for=${langPair[0]}>${langPair[0]}</label><br>`;

    node.append(input, label, br)
    document.getElementById("taughtIn-list").appendChild(node);
  }

  document.getElementById("timeRange-popup").appendChild(generateCalenderTimeTable("courseTimes"))

  document.querySelectorAll(".goto-calender-day-button").forEach(el => el.addEventListener("click", e => {
    idArr = e.target.id.split("-")
    calenderId = idArr[6]
    newDayIndex = parseInt(idArr[3])
    oldDayIndex = parseInt(idArr[5])
    document.getElementById(`${oldDayIndex}-calender-${calenderId}`).classList.add("display-nonei")
    document.getElementById(`${newDayIndex}-calender-${calenderId}`).classList.remove("display-nonei")
    document.getElementById(`${calenderId}-add-time-popup`).classList.add("display-nonei")
  }))


  //populate price input
  price = document.getElementById("price")
  price.max = 60 * curConversionRatio

})

function switchToFinanceLogin() {
  document.getElementById("create-course").add("display-nonei");
  document.getElementById("create-course-finance").classList.remove("display-nonei");
  document.getElementById("create-course-finance").classList.add("d-flex");
}

async function financeLoginPayPal() {
  res = await axios.get('/gateway/paypal/signin-with-paypal')
  url = res.data
  window.location = url
}

async function financeLoginStripe() {
  res = await axios.get('/gateway/stripe/signin-with-stripe')
  url = res.data
  window.location = url
}

window.addEventListener('load', function () {
  document.getElementById('subject-search-input').addEventListener('keyup', event => {
    searchBox('subject-box', 'subject-search-input')
  })
  document.querySelectorAll(".subject-box-toggle-popup").forEach(el => el.addEventListener('click', event => {
    toggleCoursePopup("subject-popup")
  }))
  document.getElementById('speciality-box-toggle-popup').addEventListener('click', event => {
    toggleCoursePopup("speciality-popup")
  })
  document.querySelectorAll(".taughtIn-box-toggle-popup").forEach(el => el.addEventListener('click', event => {
    toggleCoursePopup("taughtIn-popup")
  }))
  document.querySelectorAll('.clear-course-popups').forEach(el => el.addEventListener('click', event => {
    clearCoursePopups()
  }));
  document.getElementById('send-course-data').addEventListener('click', event => {
    sendCourseData()
  })
  document.getElementById('course-image').addEventListener('click', e => {
    document.getElementById('upfile').click()
  })
  document.getElementById('upfile').addEventListener('change', event => {
    sub()
  })
  document.getElementById('speciality-search-input').addEventListener('keyup', event => {
    searchBox('speciality-checkboxes', 'speciality-search-input')
  })
  document.querySelectorAll('.timeRange-box-toggle-popup').forEach(el => el.addEventListener('click', event => {
    toggleCoursePopup("timeRange-popup")
  }));
  document.getElementById('taughtIn-search-input').addEventListener('keyup', event => {
    searchBox('taughtIn-list', 'taughIn-search-input')
  })
  document.getElementById('finance-login-paypal-btn').addEventListener('change', event => {
    financeLoginPayPal()
  })
  document.getElementById('finance-login-stripe-btn').addEventListener('change', event => {
    financeLoginStripe()
  })
})

const imageWorker = new Worker('/js/imageWorker.js', { credentials: "include" });
imageWorker.onmessage = function (e) {
  imageStr = e.data;
};

imageWorker.postMessage("base64Image");

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
var specialitiesObj = {};
var imageStr = false
var taughtInArr = []

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
    document.getElementById("specialities").innerText = "{{context.bodyContext.choose}}"
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
  let newDate = new Date(d.toString().split(":")[0].slice(0, -2) + time);
  return newDate.getTime() / 1000
}

function convertIntegerToTime(int) {
  //int format "minutes from start of day"
  let d = new Date(int * 1000);
  str = `${d.getHours()}:${d.getMinutes()}`
  return str
}


function generateCourseTimeTable() {
  currentDay = days[new Date().getDay()]
  dayIndex = new Date().getDay()
  adaptedDays = [days.slice(dayIndex, days.length), days.slice(0, dayIndex)]
  const timeOffset = new Date().getTimezoneOffset() / 60



  const convertToTimeFormat = (num) => {
    var time = new Date(num * 1000 * 60).toLocaleTimeString().substring(0, 5)
    return time
  }


  timeRange = document.createElement("div")
  timeRange.id = `calender-outer`
  timeRange.className = "w-300pi h-300pi p-0 m-0 m-0pi p-0pi bg-white brdr-r-2 custom-shadow position-absolute"

  //generate days
  for (let i = 0; i < 7; i++) {
    let day = days[i]
    outerDiv = document.createElement("div");
    outerDiv.className = "row container d-flex align-items-center justify-content-center px-0 w-255p p-0 m-0 pb-3 w-300pi h-300pi";
    dayVal = document.createElement("div");
    outerDiv.id = `${i}-calender`
    dayVal.className = "h-50pi fs-30p m-0pi p-0pi bg-blacki clr-white user-select-none brdr-r-2 display-flex justify-content-space-between w-300pi h-300pi"

    if (i == 0) {
      outerDiv.className = "h-50pi w-100 text-center fs-30p m-0pi p-0pi bg-blacki brdr-r-5p w-300pi h-300pi"
      dayVal.innerHTML = `
      <button type="button"class="m-1 w-60p display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline disabled">prev</button>
      <div class="display-inline">
      <span class="user-select-none fs-25p" id="day-${days[i]}-goto">${days[i]}</span>
      </div>
      <button id="goto-cal-day-${i + 1}-from-${i}"  type="button" class="m-1 display-inline bg-blacki h-40p w-60p fs-20p btn btn-outline-primary display-inline goto-calender-day-button">next</button>
          `;

    }
    else if (i == 6) {
      outerDiv.className = "px-0 h-50pi w-100 text-center fs-30p px-0 bg-blacki display-nonei"
      dayVal.innerHTML = `
          <button type="button" id="goto-cal-day-${i - 1}-from-${i}" class="m-1 mx-3 float-left display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline goto-calender-day-button">prev</button>
          <div class="display-inline">
          <span class="user-select-none fs-25p" id="day-${days[i]}-goto">${days[i]}</span>
          </div>
          <button type="button" class="m-1 mx-3 float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline" disabled>next</button>
          `;
    }
    else {
      outerDiv.className = "px-0 h-50pi w-100 text-center fs-30p px-0 bg-blacki display-nonei"
      dayVal.innerHTML = `
          <button type="button" id="goto-cal-day-${i - 1}-from-${i}" class="m-1 mx-3 float-left display-inline bg-blacki h-40p fs-20p btn btn-outline-primary goto-calender-day-button">prev</button>
          <div class="display-inline">
          <span class="user-select-none fs-25p" id="day-${days[i]}-goto">${days[i]}</span>
          </div>       
          <button type="button" id="goto-cal-day-${i + 1}-from-${i}" class="m-1 mx-3 float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary goto-calender-day-button">next</button>
      `;
    }

    outerDiv.appendChild(dayVal);
    let box = document.createElement("div");
    box.id = `${days[i]}-dates`
    box.className = "inline-grid-r-auto-c-auto justify-items-center align-items-center grid-gap-3p m-0 p-0"

    innerDiv = document.createElement("div");

    innerDiv.className = "w-40p p-0 fs-15p text-center d-flex align-items-center justify-content-center brdr-r-5 h-30p my-1 bg-blacki h-40p fs-20p btn btn-outline-primary"
    innerDiv.innerHTML = `+`;
    innerDiv.addEventListener("click", e => {
      toggleDayPopup(day)

    })
    box.appendChild(innerDiv);
    outerDiv.append(box)




    timeRange.appendChild(outerDiv);
  }

  //genreate add time popup

  addTimePopup = document.createElement("div")
  addTimePopup.id = `add-time-popup`
  addTimePopup.className = "display-nonei w-300pi h-200pi p-0 m-0 bg-white brdr-r-2 brdr-w-5p border-style-solid brdr-clr-white custom-shadow position-absolute"
  addTimePopup.addEventListener("click", e => {
    e.stopPropagation();
  })
  header = document.createElement("div");
  header.className = "h-50pi w-100 text-center fs-30p px-0 bg-blacki clr-white user-select-none brdr-r-2"
  span = document.createElement("span")
  span.id = "add-time-calender-day"
  button = document.createElement("button")
  button.type = "button"
  button.className = "m-1 mx-3 float-right display-inline bg-blacki h-40p fs-20p btn btn-outline-primary display-inline"
  button.addEventListener("click", e => {
    toggleDayPopup("empty-day-val")
  })
  button.innerHTML = "❌"

  body = document.createElement("div")
  body.id = "add-time-calender-body"


  header.append(span, button)

  addTimePopup.append(header, body)

  timeRange.append(addTimePopup)
  return timeRange
}

function toggleDayPopup(day) {
  document.getElementById(`add-time-popup`).classList.toggle("display-nonei")
  document.getElementById("add-time-calender-day").innerHTML = day

  box = document.getElementById("add-time-calender-body")


  {
    divOuter = document.createElement("div")
    divOuter.className = "p-3 px-5"


    divInner1 = document.createElement("div")
    divInner1.className = "float-left"

    divInner1Text = document.createElement("div")
    divInner1Text.innerHTML = "start"

    divInner1Input = document.createElement("div")
    divInner1Input.className = ""
    divInner1Input.append(createCustomTimeDate({
      id: "start-time-date",
      max: 1440,
      min: 0
    }))
    divInner1.append(divInner1Text, divInner1Input)

    divInner2 = document.createElement("div")
    divInner2.className = "float-right"

    divInner2Text = document.createElement("div")
    divInner2Text.className = "m-0 p-0"
    divInner2Text.innerHTML = "finish"

    divInner2Input = document.createElement("div")
    divInner2Input.className = ""
    divInner2Input.append(createCustomTimeDate({
      id: "start-time-date",
      max: 1440,
      min: 0
    }))

    divInner2.append(divInner2Text, divInner2Input)

    buttonOuter = document.createElement("div")
    buttonOuter.className = "w-100 p-0 m-0 d-flex align-items-center justify-content-center h-60pi"

    button = document.createElement("button")
    button.type = "button"
    button.id = "add-time-calender"
    button.innerHTML = "Submit"

    buttonOuter.append(button)

    divOuter.append(divInner1, divInner2)


    box.append(divOuter, buttonOuter)

  }
  /*
    document.getElementById("add-time-calender-body").innerHTML = `
    <div class="p-3 px-5">
      <div class="float-left">
        <div class="">
          start
        </div>
      <div>
        <input type="time" id="start-time-calender" min="00:00" max="24:00" required>
      </div>
    </div>
    <div class="float-right">
      <div class="">
        end
      </div>
      <div>
        <input type="time" id="end-time-calender" min="09:00" max="18:00" required disabled>
      </div>
    </div>
  </div>
  
  
  <div class="w-100 p-0 m-0 d-flex align-items-center justify-content-center h-60pi">
    <button type="button" value="Submit" id="add-time-calender">Submit</input>
  </div>
    `
    */


  function dateRules() {


    startDateInput = document.getElementById(`start-time-calender`)
    endDateInput = document.getElementById(`end-time-calender`)


    startDate = convertTimeToInteger(startDateInput.value)
    endDate = convertTimeToInteger(endDateInput.value)


    if (startDate != "some values other than time str") {

      if (startDate >= (60 * 23)) {
        endDateInput.max = convertIntegerToTime(startDate)
      }
      else {
        endDateInput.max = convertIntegerToTime(startDate)
      }
    }

    console.log("reee")

  }




}

function addTimeCalender(day) {

  dateBox = document.getElementById(`${day}-dates`)

  startDate = document.getElementById(`start-time-calender`).value
  endDate = document.getElementById(`end-time-calender`).value
  let id = `${getRandomInt(999999999999999)}-calender-date`


  console.log(day, startDate, endDate)


  /*
    div = document.createElement("div")
    div.id = `${id}`
    div.className = "w-100p p-0 fs-15p text-center d-flex align-items-center justify-content-center brdr-r-5 h-30p my-1 bg-blacki h-40p fs-20p btn btn-outline-primary"
  
    span = document.createElement("div")
    span.innerHTML = "someting"
    button = document.createElement("button")
    button.type = "button"
    button.innerHTML = "X"
    button.addEventListener("click", e => {
      removeElement(id)
    })
  
    addDateButton = dateBox.lastChild
    dateBox.removeChild(dateBox.lastChild);
    dateBox.append(div, addDateButton)
  
    */

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

function getFile() {
  clearCoursePopups()
  document.getElementById("upfile").click();
}

function sub() {
  clearCoursePopups()
  input = document.getElementById("upfile")
  var file = input.files[0];
  console.log(file)
  console.log((file))
  reader = new FileReader();
  var fileName = file.name
  reader.onloadend = () => {
    base64Image = reader.result.split(';base64,').pop();
    imageStr = false;
    imageWorker.postMessage(base64Image);
  }
  reader.readAsDataURL(file)

  if (fileName[fileName.length - 1] == "") {
    document.getElementById("course-image").innerHTML = "{{context.bodyContext.clickUploadImageRatio}}"
  }
  else {
    document.getElementById("course-image").innerHTML = fileName[fileName.length - 1];
  }
}

async function sendCourseData() {

  if (imageStr == false) return

  function convertTimeRange(arr) {
    obj = {}
    for (i = 0; i < arr.length; i++) {
      index = days.indexOf(arr[i].split("-")[0])
      if (index != -1) {
        subObj = days[index]
        if (obj[subObj]) {
          obj[subObj].push(arr[i].split("-").slice(1, 3).join("-"))
        }
        else {
          obj[subObj] = [arr[i].split("-").slice(1, 3).join("-")]
        }
      }
    }
    return Object.keys(obj) != 0 ? obj : false
  }

  function basicCourseObjCheck(obj) {
    if (obj.subject == "") { return false }
    if (obj.description == "") { return false }
    if (obj.taughtIn == "") { return false }
    if (obj.price == "") { return false }
    if (obj.price > 60) { return false }
    if (obj.price < 1) { return false }
    if (obj.timeRange == "") { return false }
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
      pricePerLesson: Number($("#price").val()),
      availableTimes: $(".active-time-slot-div").map(function () { return this.id }).get(),
      lesson_time: Number(document.getElementById("time-shown").innerHTML),
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

  regularSlider = document.querySelector('.regular-slider')
  slider = noUiSlider.create(regularSlider, {
    start: 20,
    connect: false,
    step: 5,
    margin: 5,
    range: { min: 10, max: 60 },
  })
  regularSlider.noUiSlider.on('update', function (values, handle) {
    document.getElementById("time-shown").innerHTML = Math.trunc(values[handle])
  });


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

  document.getElementById("timeRange-popup").appendChild(generateCourseTimeTable())

  document.querySelectorAll(".goto-calender-day-button").forEach(el => el.addEventListener("click", e => {

    newDayIndex = parseInt(e.target.id.split("-")[3])
    oldDayIndex = parseInt(e.target.id.split("-")[5])
    document.getElementById(`${oldDayIndex}-calender`).classList.add("display-nonei")
    document.getElementById(`${newDayIndex}-calender`).classList.remove("display-nonei")

    document.getElementById(`add-time-popup`).classList.add("display-nonei")


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

  document.getElementById('course-image').addEventListener('click', event => {
    getFile()
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
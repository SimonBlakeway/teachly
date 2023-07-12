  const imageWorker = new Worker('/js/imageWorker.js');
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
      node.innerHTML = `
                    <input class="form-check-input" type="checkbox" id="${specialityWithBars}" name="${specialityWithBars}" onclick='setSpeciality("${specialityWithBars}")'></input>
                    <label class="form-check-label text-dark" for=${specialityWithBars}>${arr[i]}</label><br>`;
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

  function sub(obj) {
    clearCoursePopups()
    var file = obj.value;
    reader = new FileReader();
    reader.onloadend = () => {
      base64Image = reader.result.split(';base64,').pop();
      imageStr = false;
      imageWorker.postMessage(base64Image);
    }
    reader.readAsDataURL($('#upfile').prop('files')[0])

    var fileName = file.split("\\");
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
          console.log("reee")
          window.location.href = window.location.origin + "/";
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
          node.innerHTML = `<div class="subject-li" onclick='setSubject("${arr[i]}")''>${arr[i]}</div>`;
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
      node.innerHTML = `
                    <input class="form-check-input w-20p mr-5p" type="checkbox" id="${langPair[0]}" name="${langPair[0]}" onclick='setTaughtIn()'></input>
                    <label class="form-check-label text-dark" id="${langPair[1]}-label" for=${langPair[0]}>${langPair[0]}</label><br>`;
      document.getElementById("taughtIn-list").appendChild(node);
    }

    timeRange = document.getElementById("timeRange-popup-rows")
    for (let i = 0; i <= 6; i++) {
      outerDiv = document.createElement("div");
      outerDiv.className = "row container d-flex align-items-center justify-content-center px-0 w-255p p-0 m-0 pb-3";
      dayVal = document.createElement("div");
      dayVal.className = "day-div px-0"
      dayVal.innerHTML = `${days[i]}`;
      outerDiv.appendChild(dayVal);
      for (let j = 0; j <= 23; j++) {
        innerDiv = document.createElement("div");
        innerDiv.className = "container d-flex align-items-center justify-content-center time-slot-div px-0";
        innerDiv.innerHTML = `${j} - ${j + 1}`;
        innerDiv.id = `${j}-${j + 1}_${days[i]}`;
        innerDiv.onclick = function () { setTimeRange(`${j}-${j + 1}_${days[i]}`) }
        outerDiv.appendChild(innerDiv);
      }
      timeRange.appendChild(outerDiv);
    }

    //populate price input
    price = document.getElementById("price")
    price.max = 60 * curConversionRatio

  })












  function switchToFinanceLogin() {
    document.getElementById("create-course").setAttribute('style', 'display: none !important');
    document.getElementById("create-course-finance").setAttribute('style', 'display: flex !important');

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

  switchToFinanceLogin()
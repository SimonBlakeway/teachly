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

        ratings = (typeof courseObj.ratings == "undefined") ? 0 : courseObj.ratings;

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
                                                        <div class="d-flex justify-content-center w-100">
                                                            <i class="fa fa-star fs-15p clr-gold mt-5pi" aria-hidden="true"></i>
                                                            <span>${ratings}</span>
                                                        </div>
                                                        <div class="d-flex justify-content-center">${courseJson.ratings.pre}${ratings}${courseJson.ratings.post}</div>
                                                    </div>
                                                </div>
                                                <div class="col w-130p"
                                                    class="d-flex justify-content-center">
                                                    <div class="d-flex justify-content-center w-100">
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
                                                    <button class="btn btn-md btn-outline-secondary text-capitalize mn-w-130p-i h-50p">
                                                    <a href="/learn/book-lesson&id=${courseId}">request lesson</a>
                                                    </button>
                                                </div>
                                                <div class="col d-flex justify-content-center m-1 mn-w-130p-i">
                                                    <button id="${courseId}-request-lesson-button" class="btn btn-md btn-outline-secondary text-capitalize mn-w-130p-i h-50p request-lesson-button">
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
        document.getElementById("course-pagination").appendChild(buttonBox)
    }

    function generateCourseTimeTable(times) {
        currentDay = days[new Date().getDay()]
        dayIndex = new Date().getDay()
        adaptedDays = [days.slice(),]

        timeRange = document.createElement("div")
        for (let i = 0; i <= 6; i++) {
            outerDiv = document.createElement("div");
            outerDiv.className = "row container d-flex align-items-center justify-content-center px-0 w-255p p-0 m-0 pb-3";
            dayVal = document.createElement("div");
            dayVal.className = "day-div px-0"
            dayVal.innerHTML = `${days[i]}`;
            outerDiv.appendChild(dayVal);
            for (let j = 0; j <= 23; j++) {
                classes = "container d-flex align-items-center justify-content-center time-slot-div px-0"
                if (times.includes(`${j}-${j + 1}_${days[i]}`)) { classes = "container d-flex align-items-center justify-content-center time-slot-div px-0 active-time-slot" }
                innerDiv = document.createElement("div");
                innerDiv.className = classes
                innerDiv.innerHTML = `${j} - ${j + 1}`;
                innerDiv.id = `${j}-${j + 1}_${days[i]}`;
                innerDiv.onclick = function () { setTimeRange(`${j}-${j + 1}_${days[i]}`) }
                outerDiv.appendChild(innerDiv);
            }
            timeRange.appendChild(outerDiv);
        }
        return timeRange
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



            document.querySelectorAll('.read-more-button').forEach(el => el.addEventListener('click', event => {
                courseId = e.target.id.split("-")[0]
                readMoreDescToggle(courseId)
            }));


            document.querySelectorAll('.send-message').forEach(el => el.addEventListener('click', event => {
                courseId = e.target.id.split("-")[0]

                createChat(courseId)
                gotoChat(courseId)
            }));

            document.querySelectorAll("request-lesson-button").forEach(el => el.addEventListener('click', event => {
                courseId = e.target.id.split("-")[0]
                requestLesson(courseId)
                text = courseJson.requestCourseLessonNot
                createOnScreenNotification(`${text}`)
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


async function createChat(courseId) {

    res = await axios({
        method: 'post',
        url: '/learn/create-chat',
        data: {
            'courseId': courseId,
            "teacherId": teacherId
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

async function requestLesson() {
    res = await axios({
        method: 'post',
        url: '/learn/request-lesson',
        data: {
            'courseId': courseId,
            "teacherId": teacherId
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

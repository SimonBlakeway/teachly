
async function SearchBarSearch() {

  var input, filter;
  input = document.getElementById("search-bar-search-input");
  filter = input.value.toUpperCase();

  if (filter == "" || filter == " ") { return }

  showSubjects = false;
  subjectDiv = document.getElementById("subject-list")
  subjectList = subjectDiv.children;

  showSpecialities = false;
  specialityDiv = document.getElementById("speciality-list")
  specialityList = specialityDiv.children;

  showCourses = false
  courseDiv = document.getElementById("course-name-list")


  for (i = 1; i < subjectList.length; i++) {
    txtValue = subjectList[i].textContent || subjectList[i].innerHTML;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      subjectList[i].classList.add("display-flexi");
      subjectList[i].classList.remove("display-noni");
      // subjectList[i].setAttribute("style", "display: flex !important;")
      showSubjects = true
    } else {
      subjectList[i].classList.remove("display-flexi");
      subjectList[i].classList.add("display-noni");
      // subjectList[i].setAttribute("style", "display: none !important;")
    }
  }
  if (showSubjects) {
    subjectDiv.classList.add("display-flexi");
    subjectDiv.classList.remove("display-noni");

    document.getElementById("subject-header").classList.add("d-flex");
    document.getElementById("subject-header").classList.remove("display-nonei")
  }
  else {
    subjectDiv.classList.remove("display-flexi");
    subjectDiv.classList.add("display-noni");

    document.getElementById("subject-header").classList.remove("d-flex");
    document.getElementById("subject-header").classList.add("display-nonei")

  }

  for (i = 1; i < specialityList.length; i++) {
    txtValue = specialityList[i].textContent || specialityList[i].innerHTML;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      showSpecialities = true
      specialityList[i].classList.add("display-flexi");
      specialityList[i].classList.remove("display-noni");
      //specialityList[i].setAttribute("style", "display: flex !important;")
    } else {
      specialityList[i].classList.remove("display-flexi");
      specialityList[i].classList.add("display-noni");
      //specialityList[i].setAttribute("style", "display: none !important;")
    }
  }
  if (showSpecialities) {
    specialityDiv.classList.add("display-flexi");
    specialityDiv.classList.remove("display-noni");

    document.getElementById("specialities-header").classList.add("d-flex");
    document.getElementById("specialities-header").classList.remove("display-nonei")
  }
  else {
    specialityDiv.classList.remove("display-flexi");
    specialityDiv.classList.add("display-noni");
    
    document.getElementById("specialities-header").classList.remove("d-flex");
    document.getElementById("specialities-header").classList.add("display-nonei")


  }

  try {
    res = await axios({
      method: 'post',
      url: '/learn/searchTutorCoursesByString',
      data: filter,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
  }


  if (showCourses) {
    courseDiv.classList.add("display-flexi");
    courseDiv.classList.remove("display-noni");


    document.getElementById("courses-header").classList.add("d-flex");
    document.getElementById("courses-header").classList.remove("display-nonei")
  }
  else {
    courseDiv.classList.remove("display-flexi");
    courseDiv.classList.add("display-noni");


    document.getElementById("courses-header").classList.remove("d-flex");
    document.getElementById("courses-header").classList.add("display-nonei")
  }
  window.scrollBy(0, 400);

}

window.addEventListener('load', function () {
  axios.get('/get/validSubject').then(res => {
    if (res.data == "404") { }
    else {
      arr = res.data.sort((a, b) => { return a.localeCompare(b, userLang) })
      for (i = 0; i < arr.length; i++) {
        axios.get(`/get/validSpecialities/${arr[i]}`).then(res => {
          if (res.data == "404") {
          }
          else {
            arr = res.data
            for (let i = 0; i < arr.length; i++) {
              a = document.createElement("a");
              a.href = `/learn/${arr[i]}`
              a.className = "row search-box display-noni";
              div = document.createElement("div");
              div.innerHTML = `${arr[i]}`;
              div.className = "text-align-center"
              a.appendChild(div);
              document.getElementById("speciality-list").appendChild(a);
            }
          }
        })
      }

      for (let i = 0; i < arr.length; i++) {
        a = document.createElement("a");
        a.href = `/learn/${arr[i]}`
        a.className = "row search-box display-noni";
        div = document.createElement("div");
        div.innerHTML = `${arr[i]}`;
        a.appendChild(div);
        document.getElementById("subject-list").appendChild(a);
      }
    }
  })

  input = document.getElementById("search-bar-search-input");
  input.addEventListener("keydown", function (e) {
    if (e.code === "Enter") {
      SearchBarSearch();
    }
  });

  document.getElementById('search-button').addEventListener('click', event => {
    SearchBarSearch()
  })
})

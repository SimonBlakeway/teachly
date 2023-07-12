socket.on("connect", () => {
  console.log("eerer");
});

socket.on("recieve message", (data) => {
  switchSignaler("notification", turnOn = true)
  notOuter = document.getElementById("notifications-list")
  notOuter.innerHTML = '';
  for (let i = 0; i < data.length; i++) {
    box = document.createElement("li")
    box.className = "px-0 mx-0 py-1"
    box.id = `${data[i].notification_id}-notification`
    divClass = ""
    if (data[i].url) { object.onclick = () => { redirectByUrl(data[i].url, data[i].notification_id) } }



    div1 = document.createElement("div")
    div1.className = "d-flex border-top-light mt-1"

    div2 = document.createElement("div")
    div2.className = "w-220p"
    div3 = document.createElement("div")
    div3.innerHTML = `${data[i].text}`
    div4 = document.createElement("div")
    div4.className = "pt-1 fs-6 clr-f2f2f2"
    div4.innerHTML = `${prettyifyDate(data[i].created_at)}`
    div5 = document.createElement("div")
    div5.addEventListener('click', event => {
      event.stopPropagation();
    })
    div6 = document.createElement("div")
    div7 = document.createElement("div")
    div7.addEventListener("click", e => {
      deleteNotification(`${data[i].notification_id}`)
    })

    div2.append(div3, div4)
    div6.append(div7)
    div5.append(div6)

    /*
      box.innerHTML = `
          <div class="d-flex border-top-light mt-1">
            <div class="w-220p">
              <div>${data[i].text}</div>
              <div class="pt-1 fs-6 clr-f2f2f2">${prettyifyDate(data[i].created_at)}</div>
            </div>
            <div o000nclick="event.stopPropagation();">
              <div>
                <div o000nClick="deleteNotification('${data[i].notification_id}')" class="color-white fs-3 ml-10p"><i class="fa fa-times" aria-hidden="true"></i></div>
              </div>
            </div>
          </div>
            `
      */

    box.append(div2, div5)
  }
});

socket.on("disconnect", () => {
  console.log("socket disconected");
});
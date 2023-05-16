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
        box.innerHTML = `
            <div class="d-flex border-top-light mt-1">
              <div style="width: 220px">
                <div>${data[i].text}</div>
                <div class="pt-1 fs-6" style="color: #f2f2f2">${prettyifyDate(data[i].created_at)}</div>
              </div>
              <div onclick="event.stopPropagation();">
                <div>
                  <div onClick="deleteNotification('${data[i].notification_id}')" class="color-white fs-3" style="margin-left: 10px;"><i class="fa fa-times" aria-hidden="true"></i></div>
                </div>
              </div>
            </div>
              `
        notOuter.appendChild(box)
    }
});

socket.on("disconnect", () => {
    console.log("socket disconected");
});
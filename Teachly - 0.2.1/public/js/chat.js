var activeChat = ""
window.addEventListener('load', async function () {
  socket.on("recieve message", (data) => {
    switchSignaler("notification", turnOn = true)
    createMessage(data)
  });
})

function updateChatboxText(messageData) {
  //update room
  document.getElementById(`${messageData.chat_id}-latest-message-created`).innerHTML = prettyifyDate(messageData.created_at)
  document.getElementById(`${messageData.chat_id}-latest-message-created`).setAttribute("data-timestamp", messageData.created_at)
  document.getElementById(`${messageData.chat_id}-latest-message-text`).innerHTML = messageData.text

  //move room to the top
  room = document.getElementById(`${messageData.chat_id}-room`)
  document.getElementById(`${messageData.chat_id}-room`).remove()
  document.getElementById(`chat-rooms`).prepend(room)
}


function createMessage(messageData) {
  li = document.createElement("li")
  floatDirection = ""

  if (userId == messageData.sender_id) {
    floatDirection = "float-left"
  }
  else {
    floatDirection = "float-right"
  }

  li.className = "message-box w-100"
  li.innerHTML = `
              <div class="${floatDirection} light-grey rounded">
                <div class="p-1 px-2">
                  <p class="mb-0">${messageData.text}</p>
                </div>
                <div class="px-3 py-0 my-0 date">
                  <p data-timestamp="${messageData.created_at}" class="date text-muted small mb-0 ${floatDirection}">${prettyifyDate(messageData.created_at)}</p>
                </div>
              </div>`
  return li
}

const scrollToBottom = (id) => {
  element = document.getElementById(id);
  element.scrollTop = 1000 // element.scrollHeight;
}

function sendMessage() {
  textArea = document.getElementById(`${activeChat}-chat-textarea`)
  text = textArea.value
  textArea.value = ""

  mesObj = {
    created_at: Math.floor(Date.now() / 1000),
    text: text,
    chat_id: activeChat,
    sender_id: userId
  }
  socket.emit('send message', mesObj);

  updateChatboxText(mesObj)

  document.getElementById(`${mesObj.chat_id}-messages`).appendChild(createMessage(mesObj))
  scrollToBottom(`${activeChat}-messages`)

}

function changeChat(chatId) {
  console.log("chatId is ", chatId)
  try {
    if (chatId == activeChat) {
      return
      //maybe show no active chat?
    }
    else {
      if (activeChat != "") {
        document.getElementById(`${activeChat}-chat`).classList.toggle("disappear")
        document.getElementById(`${activeChat}-room`).classList.toggle("active-room")
      }
      document.getElementById(`${chatId}-chat`).classList.toggle("disappear")
      document.getElementById(`${chatId}-room`).classList.toggle("active-room")

      document.getElementById(`no-chat-active`).classList.add("disappear")

      activeChat = chatId

      if (smallScreen) {
        document.getElementById(`rooms`).classList.add("disappear");
      }
    }
  }
  catch (err) {
    console.log(err)
  }
}

function exitChat() {
  document.getElementById(`${activeChat}-chat`).classList.toggle("disappear");
  document.getElementById(`rooms`).classList.remove("disappear");
  document.getElementById(`${activeChat}-room`).classList.toggle("active-room")
  activeChat = ""
}


function setupScreenWidthChanges() {
  //this function sets the screen to change on resize,
  // it's here to deal with screens that are too small for both cols to show
  // this would normally be solved with a css conditional but
  // the interactions are too complex for that
  function resize() {
    smallScreen = (window.innerWidth < 666)
    if (smallScreen && activeChat == "") {
      document.getElementById("rooms").classList.remove("disappear")
      document.getElementById(`no-chat-active`).classList.add("disappear")
    }

    else if (smallScreen && activeChat != "") {
      document.getElementById("rooms").classList.add("disappear")
      document.getElementById(`no-chat-active`).classList.add("disappear")
      document.getElementById(`${activeChat}-chat`).classList.remove("disappear")
    }

    else if (!smallScreen && activeChat == "") {
      document.getElementById("rooms").classList.remove("disappear")
      document.getElementById(`no-chat-active`).classList.remove("disappear")
    }

    else if (!smallScreen && activeChat != "") {
      document.getElementById("rooms").classList.remove("disappear")
      document.getElementById(`no-chat-active`).classList.add("disappear")
      document.getElementById(`${activeChat}-chat`).classList.remove("disappear")
    }
  }
  resize()

  window.onresize = resize
}

window.addEventListener('load', async function () {

  function setupActiveChat() {
    let activeChat = ""
    chat = window.location.search.substring(1, window.location.search.length).split("=")
    if (chat[0] != "chat") {
      activeChat = ""
    }
    else if (chat.length != 2) {
      activeChat = ""
    }
    else {

      activeChat = parseInt(chat[1])
    }
    return activeChat
  }
  activeChat = setupActiveChat()

  async function generateChatsAndRooms() {

    function generateRoom(roomData, chatData) {
      //this function exists to simplify the logic present below
      roomClass = "p-2 border-bottom chat-room-side-bar"
      if (activeChat == roomData.chat_id) {
        document.getElementById("no-chat-active").classList.toggle("disappear")
        roomClass = "p-2 border-bottom active-room chat-room-side-bar"
      }
      li = document.createElement('li');
      li.id = `${roomData.chat_id}-room`
      li.className = roomClass
      li.setAttribute("data-chat-id", roomData.chat_id)


      div = document.createElement("div")
      div.href = "#!"
      div.className = "d-flex justify-content-between"
      div.innerHTML = `
            <div class="d-flex flex-row">
              <img src="/get/images/profile/${roomData.id}" alt="avatar" class="rounded-circle d-flex align-self-center me-3 shadow-1-strong h-60p" width="60"></img>
                <div class="pt-1">
                  <p class="fw-bold mb-0">${roomData.name}</p>
                  <p class="small text-muted" id="${roomData.chat_id}-latest-message-text">${chatData.text}</p>
                </div>
              <div class="pt-1">
                <p class="small text-muted mb-1">
                  <span class="date" data-timestamp="${chatData.created_at}" id="${roomData.chat_id}-latest-message-created">${prettyifyDate(chatData.created_at)}</span>
                  </p>
              </div>
            </div>
      `
      div.setAttribute("data-chat-id", roomData.chat_id)
      li.appendChild(div)
      return li
    }

    function generateChat(roomData, chatData) {
      chatClass = "chat-box disappear h-87vh"
      if (activeChat == roomData.chat_id) { chatClass = "chat-box h-87vh active-chat" }

      div = document.createElement('div');
      div.className = chatClass;
      div.id = `${roomData.chat_id}-chat`
      div.innerHTML = `
    <div class="m-0 p-0 chat-profile">
      <div class="p-0 w-100 h-40p d-inline-flex" href="/profile/${roomData.id}">
        <div class="apr-mx-640p p-0 d-flex align-items-center mx-3 h-40p w-50p d-inline-flex fs-18p exit-chat-btn default-cursor">←</div>
        <div class="d-flex align-items-center h-40p">
          <img src="/get/images/profile/${roomData.id}" alt="avatar"
            class="rounded-circle ml-0 shadow-1-strong d-inline-flex" width="35">
        </div>
        <div class="profile-name p-1 overflow-x-hiddeni hide-scroll" id="profile-name-${roomData.id}">${roomData.name}</div>
        <div class="contact-options" id="contact-options-id">
          <div class="vert-ilip">⋮</div>
        </div>
      </div>
        </div>
    <ol id="${roomData.chat_id}-messages" class="list-unstyled m-0 chat p-2 py-2">

    </ol>
      </div >
    <div class="p-2 m-0 send-message-box row">
      <div class="p-0 m-0 mt-0 w-100-80p text-center">
        <textarea class="message-textarea" id="${roomData.chat_id}-chat-textarea" maxlength="1024" rows="2"></textarea>
      </div>
      <div class="m-0 p-0 w-70p ml-10p">
        <button id="send-message-chat-${roomData.chat_id}" type="button" class="btn btn-light send-message-button">Send</button>
      </div>
      `
      return div;

    }

    function getRoomIndex(roomData, chat_id) {
      //there wasn't a good way to get index by built in functions
      for (i = 0; i < roomData.length; i++) {
        if (roomData[i].chat_id == chat_id) {
          return i
        }
      }
      throw new Error("chat room id not found")
    }

    chatRes = axios.get('/profile/old-messages')
    roomRes = axios.get('/profile/rooms')

    Promise.all([chatRes, roomRes]).then((data) => {
      chatRes = data[0].data
      roomRes = data[1].data

      //storing chats in an obj simplifies the logic 
      chatObj = {}
      roomBox = document.createElement("div")
      chatbox = document.createElement("div")

      for (let i = 0; i < chatRes.length; i++) {
        if (!(chatObj[chatRes[i].chat_id])) {
          chatObj[chatRes[i].chat_id] = document.createElement("div")
        }
        chatObj[chatRes[i].chat_id].appendChild(createMessage(chatRes[i]))
      }
      for (let i = 0; i < roomRes.length; i++) {
        let chatInfoMessage = {
          text: "",
          created_at: ""
        }
        if (chatObj[roomRes[i].chat_id]) {
          chatInfo = chatObj[roomRes[i].chat_id]
          chatInfoMessage.text = chatInfo.children[chatInfo.children.length - 1].children[0].children[0].children[0].innerHTML
          chatInfoMessage.created_at = chatInfo.children[chatInfo.children.length - 1].children[0].children[1].children[0].getAttribute("data-timestamp")
        }

        if (typeof roomRes[i] != "undefined") {
          chatbox.appendChild(generateChat(roomRes[i], chatInfoMessage))
          roomBox.appendChild(generateRoom(roomRes[i], chatInfoMessage))
        }
      }
      document.getElementById("chat-rooms").innerHTML = roomBox.innerHTML;
      document.getElementById("chat-boxes").innerHTML = chatbox.innerHTML;


      mesList = Object.keys(chatObj);
      for (let i = 0; i < mesList.length; i++) {
        document.getElementById(`${1222}-messages`).innerHTML = chatObj[mesList[i]].innerHTML
      }


      //load js function into html

      document.querySelectorAll('.exit-chat-btn').forEach(el => el.addEventListener('click', event => {
        exitChat()
      }));

      document.querySelectorAll('.send-message-button').forEach(el => el.addEventListener('click', event => {
        sendMessage()

      }));


      document.querySelectorAll(".chat-room-side-bar").forEach(el => el.addEventListener('click', e => {
        changeChat(el.getAttribute("data-chat-id"))
      }));

    });
  }
  await generateChatsAndRooms()

  setupScreenWidthChanges()


})

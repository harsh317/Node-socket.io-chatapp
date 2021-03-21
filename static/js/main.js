const socket = io();
const chatForm = document.getElementById('chat-form');
console.log(chatForm);

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const room = urlParams.get('room');
socket.emit('JoinRoom', { username: username, room: room });
const feedback = document.getElementById('feedback')
const chatMessages = document.querySelector('.chat-messages')

function getElementfromstring(string) {
    let div = document.createElement('div');
    div.innerHTML = string;
    return div.firstElementChild;
}


document.getElementById('msg').addEventListener('keypress', () => {
    socket.emit('typing', `${username} is typing............`)
})
let typingTimer; //timer identifier
let doneTypingInterval = 3000; //time in ms (5 seconds)
let myInput = document.getElementById('msg');

//on keyup, start the countdown
myInput.addEventListener('keyup', () => {
    clearTimeout(typingTimer);
    if (myInput.value) {
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
});

//user is "finished typing," do something
function doneTyping() {
    console.log('typing finished')
    socket.emit('doneTyping', '')
}

socket.on('message', (data) => {
    console.log(data);
    const messages = document.getElementById('messages');
    string = `<div class="message ">
                    <p class="meta ">${data.username}<span>${data.time}</span></p>
                    <p class="text ">
                        ${data.text}
                    </p>
                </div>`
    let createelement = getElementfromstring(string);
    messages.appendChild(createelement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on('roomUsers', (data) => {
            document.getElementById('users').innerHTML = `
    ${data.allusers.map(user => `<li>${user.username}</li>`).join('')}
    `;
    document.getElementById('room-name').innerHTML = data.room;
})

socket.on('typinguser',(data) => {
    const messages = document.getElementById('displayfeebback');
    messages.innerHTML = `<p>${data}</p>`  
})

socket.on('donetyping', (data)=>{
    console.log('doneTyping')
    document.getElementById('displayfeebback').innerText = data;
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('msg').value;

    // To server
    socket.emit('MessageChat', msg);
    socket.emit('doneTyping', '')
    document.getElementById('msg').value = ''
    document.getElementById('msg').focus();
})
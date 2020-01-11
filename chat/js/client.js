var socket = null
const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const googleSignIn = document.getElementById('google-sign-in')
const signOut = document.getElementById('sign-out')
const nameSignIn = document.getElementById('name-sign-in')
const nameInput = document.getElementById('name-input')
name = null
loggedWith = null
socketUrl = 'http://localhost:3000'

function onNameSignIn(){
    if(nameInput.value != ''){
        loggedWith = 'name'
        signIn(nameInput.value)
        nameInput.value = ''
    }
}

function onGoogleSignIn(googleUser) {
    loggedWith = 'google'
    signIn(googleUser.getBasicProfile().getName())
}

function signIn(nickname){
    name = nickname
    googleSignIn.classList.add('hide')
    nameSignIn.classList.add('hide')
    signOut.classList.remove('hide')
    socket = io(socketUrl)
    connectSocket(nickname)
}

function googleSignOut(){
    auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        closeSocket()
    });
}

function closeSocket() {
    loggedWith = null
    socket.close()
    delete socket
    name = null
    messageContainer.innerHTML = ''
    signOut.classList.add('hide')
    googleSignIn.classList.remove('hide')
    nameSignIn.classList.remove('hide')
}

function logOut(){
    switch(loggedWith){
        case 'google':
            {
                googleSignOut()
                break
            }
        case 'name':
            {
                closeSocket()
                break
            }
    }
}

function connectSocket(){
    if(socket){
        socket.emit('new-user', name)
        
    }
    messageInput.focus()

    socket.on('chat-message', data => {
        if(data.name == name){
            appendMessage(`${data.message}`, true)
        }else{
            appendMessage(` ${data.name}:-${data.message}`)
        }
        
    })
    
    socket.on('chat-logs', logs =>{
        logs.forEach(log => {
            isSelf = name == log.name
            appendMessage((isSelf ? '' : log.name + ':-') + log.message, isSelf)
        })
        appendMessage(`You joined as ${name}`, true)
    })
    
    socket.on('user-connected', user => {
        if(user != name){
            appendMessage(`${user} connected`)
        }  
    })
    
    socket.on('user-disconnected', user => {
        if(user != name){
            appendMessage(`${user} disconnected`)
        }
    })
}



messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    if(message != '' && loggedWith){
        socket.emit('send-chat-message', message)
        messageInput.value = ''
        appendMessage(message, true)
    }
    messageInput.focus()
})

function appendMessage(message, self=false){
    const messageElement = document.createElement('div')
    if(self){
        messageElement.className = 'self alert alert-dark'
    }else{
        messageElement.className = 'alert alert-dark'
    }
    messageElement.innerText = message
    messageContainer.append(messageElement)
    messageContainer.scrollTop = messageContainer.scrollHeight
}
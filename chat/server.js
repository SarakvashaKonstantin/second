const io = require('socket.io')(3000)
const logSize = 10
const users = {}
const logs = []
io.on('connection', socket =>{

    socket.on('new-user', name =>{
        users[socket.id] = name
        socket.broadcast.emit('user-connected', name)
        socket.emit('chat-logs', logs)
    })

    socket.on('disconnect', () =>{
        name = users[socket.id]
        socket.broadcast.emit('user-disconnected', name)
        delete users[socket.id]
    })

    socket.on('send-chat-message', message =>{
        message = {message : message, name : users[socket.id]}
        socket.broadcast.emit('chat-message', message)
        logMessage(message.name , message.message)
    })
})

function logMessage(name, message){
    logs.push({name : name, message : message})
    if(logs.length > logSize){
        logs.shift()
    }
}

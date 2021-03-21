const path = require('path')
const express = require('express');
const http = require('http');
const server = express();
const app = http.createServer(server);
const socketio = require('socket.io');
const io = socketio(app);
const { userJoin, getcurrentuser, getroomusers } = require('./users')
    // Use static File
server.use('/public', express.static(path.join(__dirname, 'static')));
server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
})

// When client connects welcome only that 'particular user'
io.on('connection', (socket) => {

    socket.on('JoinRoom', (data) => {

        const user = userJoin(socket.id, data.username, data.room);
        socket.join(user.room);

        let date = new Date();
        let time = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        console.log('new connection');
        socket.emit('message', { // emit only to that connected particular user
            username: 'Note',
            text: 'Welcome to my chat application',
            time: time
        });

        socket.broadcast.to(user.room).emit('message', { // emit to the users in the chat except that particular user
            username: 'Note',
            text: `${user.username} has joined the chat`,
            time: time
        });

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            allusers: getroomusers(user.room)
        })
    })

    socket.on('typing', (data) => {
        console.log(data)
        user = getcurrentuser(socket.id);
        console.log(user.room)
        socket.broadcast.to(user.room).emit('typinguser', data);
    })

    socket.on('doneTyping', (data) => {
        user = getcurrentuser(socket.id);
        socket.broadcast.to(user.room).emit('donetyping', data);
    })

    // When client disconnects from server
    socket.on('disconnect', () => {
        let date = new Date();
        let time = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const user = getcurrentuser(socket.id);
        io.to(user.room).emit('message', { // Emit to everyone
            username: 'Note',
            text: `${user.username} has Left the chat`,
            time: time
        })


        io.to(user.room).emit('roomUsers', {
            room: user.room,
            allusers: getroomusers(user.room)
        })
    });

    socket.on('MessageChat', (data) => {
        let date = new Date();
        let time = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const user = getcurrentuser(socket.id);
        io.to(user.room).emit('message', {
            username: user.username,
            text: data,
            time: time
        });
    });
});

const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
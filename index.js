const io = require('socket.io')(4000, {
    cors: {
        origin: '*',
    },
});

const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        // console.log("new user ",name);
        socket.broadcast.emit('user-joined', name);

    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', {
            message: message,
            name: users[socket.id]
        });
    });


// .........


socket.on('typing', () => {
    const name = users[socket.id];
    socket.broadcast.emit('typing', name);
});

socket.on('stopped-typing', () => {
    socket.broadcast.emit('stopped-typing');
});

// ..........





    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});


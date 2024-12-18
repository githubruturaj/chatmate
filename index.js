const Fastify = require('fastify');
const path = require('path');
const socketIo = require('socket.io');

// Create a Fastify instance
const fastify = Fastify({
    logger: true
});

// Serve static files (like index.html)
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname),  // Assuming index.html is in the root directory
    prefix: '/',  // Serve static files from root
});

// Route for the root to redirect to the desired page (optional)
fastify.get('/', (request, reply) => {
    reply.redirect('/index.html');  // Redirect to index.html or any specific page
});

// Start Fastify server
fastify.listen(4000, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});

const io = socketIo(fastify.server, {
    cors: {
        origin: '*',
    },
});

const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', {
            message: message,
            name: users[socket.id]
        });
    });

    socket.on('typing', () => {
        const name = users[socket.id];
        socket.broadcast.emit('typing', name);
    });

    socket.on('stopped-typing', () => {
        socket.broadcast.emit('stopped-typing');
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});

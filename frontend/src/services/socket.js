import { io } from 'socket.io-client';

export const initSocket = () => io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') },
});

export const emitMessage = (socket, recipientId, content) => socket.emit('send message', { recipientId, content });

export const onNewMessage = (socket, callback) => socket.on('new message', callback);
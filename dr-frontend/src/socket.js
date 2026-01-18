import io from 'socket.io-client';

// Replace with server IP if running on different machines
const SERVER_URL = "http://localhost:3000";

const socket = io(SERVER_URL);

export default socket;

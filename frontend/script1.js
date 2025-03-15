import { lancelot } from "./lancelot/dist/lancelot-cdn-module.js";
const { SignalServer, ChannelServer, ChannelClient } = lancelot.network;

const SIGNAL_SERVER_HOST = "localhost:8080";
const APP_NAME = "MyApp";

let signalServer = new SignalServer(SIGNAL_SERVER_HOST);
// signalServer.connect();

let channelServer = new ChannelServer(new SignalServer(SIGNAL_SERVER_HOST), {}, { name: "MyRoom", appName: APP_NAME, description: "Hello world" });
let channelClient = new ChannelClient(new SignalServer(SIGNAL_SERVER_HOST), {}, APP_NAME);
channelClient.start();

channelServer.onStateChange = (e) => {
    console.log("server state:", e.state);
}

channelServer.onOrderedMessage = (connection, data) => {
    console.log("server:", "tcp message:", data, ", from:", connection.socketId);
}

channelServer.onUnorderedMessage = (connection, data) => {
    console.log("server:", "udp message:", data, ", from:", connection.socketId);
}

setTimeout(() => channelClient.joinRoom("MyRoom"), 1000);

channelClient.onStateChange = (e) => {
    console.log("client state:", e.state);
    if(e.state == "ready") {
        e.sendUnorderedText("World Hello");
        e.sendOrderedText("Hello world");
    }
}

channelServer.start();

// setTimeout(() => channelServer.stop(), 10000);

signalServer.onConnect = () => {
    document.getElementById("createRoomBtn").addEventListener("click", handleCreateRoom);
    document.getElementById("joinRoomBtn").addEventListener("click", handleJoinRoom);
    document.getElementById("deleteRoomBtn").addEventListener("click", handleDeleteRoom);

    setInterval(getRooms, 1000);

    setTimeout(() => signalServer.disconnect(), 10000);
}

signalServer.onDisconnect = () => {
    console.log("Socket disconnected");
}

function handleCreateRoom() {
    const roomName = document.getElementById("createRoomName").value;
    const roomDescription = document.getElementById("createRoomDescription").value;
    if (roomName == "") {
        console.log("Room name cannot be empty");
        return;
    }
    signalServer.createRoom(roomName, APP_NAME, roomDescription);
}

function handleJoinRoom() {
    const roomName = document.getElementById("joinRoomName").value;
    if (roomName == "") {
        console.log("Room name cannot be empty");
        return;
    }
    signalServer.joinRoom(roomName);
}

function handleDeleteRoom() {
    const roomName = document.getElementById("deleteRoomName").value;
    if (roomName == "") {
        console.log("Room name cannot be empty");
        return;
    }
    signalServer.deleteRoom(roomName);
}

function getRooms() {
    signalServer.getRooms(APP_NAME).then(rooms => {
        document.getElementById("roomList").innerHTML = rooms.map(room => `<li>${room.name}, description: ${room.description}, online: ${room.socketCount}</li>`).join("");
    })
}
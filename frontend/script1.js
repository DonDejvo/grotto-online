import { lancelot } from "./lancelot/dist/lancelot-cdn-module.js";
const { SignalServer, ChannelServer, ChannelClient } = lancelot.network;

const $ = (selector) => {
    return document.querySelector(selector);
}

const handleCreateRoom = () => {
    const room = createRoomNameInp.value;

    startServer(room);

    setTimeout(() => {
        joinServer(room);
    }, 1000);
}

const handleJoinRoom = () => {
    const room = joinRoomNameInp.value;

    joinServer(room);
}

const startServer = (room) => {
    channelServer = new ChannelServer(room,  new SignalServer({ host: "localhost:8080" }));
}

const joinServer = (room) => {
    channelClient = new ChannelClient(room, new SignalServer({ host: "localhost:8080" }));
}

let createRoomNameInp,
createRoomBtn,
joinRoomNameInp,
joinRoomBtn,
statusElem;

let channelServer, channelClient;

createRoomNameInp = $("#create-room-name");
createRoomBtn = $("#create-room-btn");
joinRoomNameInp = $("#join-room-name");
joinRoomBtn = $("#join-room-btn");
statusElem = $("#status");

createRoomBtn.addEventListener("click", handleCreateRoom);
joinRoomBtn.addEventListener("click", handleJoinRoom);
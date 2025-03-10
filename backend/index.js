import { SignalServer } from "./lancelot-signal-server/src/SignalServer.js";

const signalServer = new SignalServer();

signalServer.listen(8080);
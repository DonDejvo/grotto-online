import { SignalServer } from "./lancelot-signal-server/src/SignalServer.js";

const signalServer = new SignalServer();

signalServer.listen(process.env.PORT || 8080);
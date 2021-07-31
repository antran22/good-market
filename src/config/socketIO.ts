import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

interface ISocketIO {
  _io: SocketIOServer | null;

  initializeServer(httpServer: HTTPServer): void;

  getInstance(): SocketIOServer;
}

const socketIO: ISocketIO = {
  _io: null,
  initializeServer(httpServer: HTTPServer) {
    this._io = new SocketIOServer(httpServer, {});
  },
  getInstance(): SocketIOServer {
    if (!this._io) {
      throw new Error("Socket IO not initialized");
    }
    return this._io;
  },
};

export default socketIO;

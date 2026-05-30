import { io } from "socket.io-client";

export const SOCKET_URL = "https://ais-pre-eov36f74tvwrwzzr5kg2pz-787301755010.europe-west2.run.app";
export const STREAM_URL = `${SOCKET_URL}/stream`;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

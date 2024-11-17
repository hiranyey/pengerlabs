
import * as Colyseus from "colyseus.js";
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
let client = new Colyseus.Client(WEBSOCKET_URL);
export { client };

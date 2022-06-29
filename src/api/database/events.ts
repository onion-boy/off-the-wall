import { EventEmitter } from "events";

export const events = new EventEmitter() as EventEmitter & { tick: number };

events.tick = 0;

let next = 0;

events.on("next", () => {
  next++;
  if (next == events.tick) {
    events.emit("ready");
  }
});

import kaplay from "kaplay";
const DEBUG = import.meta.env.VITE_DEBUG === 'true';
const TILE_SIZE = 16;
const kaplayContext = kaplay({
    width: 2 * 22 * TILE_SIZE,
    height: 2 * 12 * TILE_SIZE,
    debug: DEBUG,
    debugKey: "p",
    scale: 2.3,
    background: [128, 232, 237],
    letterbox: true,
    global: false,
    touchToMouse: true,
    buttons: {
        up: {
            keyboard: ["up", "w", "space"],
        },
        left: {
            keyboard: ["left", "a"],
        },
        right: {
            keyboard: ["right", "d"],
        },
        down: {
            keyboard: ["down", "s"],
        },
        death: {
            keyboard: ["shift"],
        },
    },
})

export const k = kaplayContext;
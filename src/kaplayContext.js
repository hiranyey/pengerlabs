import kaplay from "kaplay";
const DEBUG = import.meta.env.VITE_DEBUG=== 'true';
const TILE_SIZE = 16;
const kaplayContext = kaplay({
    width:2*21*TILE_SIZE,
    height:2*12*TILE_SIZE,
    debug: DEBUG,
    debugKey: "p",
    scale:2.4,
    background: [128, 232, 237],
    letterbox: true,
    global: false,
    touchToMouse: true,
    buttons:{
        up:{
            keyboard: ["up", "w"],
        },
        down:{
            keyboard: ["down", "s"],
        },
        left:{
            keyboard: ["left", "a"],
        },
        right:{
            keyboard: ["right", "d"],
        },
        a:{
            keyboard: ["space", "enter"],
        },
    },
})

export const k = kaplayContext;
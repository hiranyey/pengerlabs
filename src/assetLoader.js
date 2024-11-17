
const loadAssets = async (kaplay) => {
    await kaplay.loadMusic("bgm", "music/bg.mp3");
    await kaplay.loadSprite("map", "sprites/map.png");

    await kaplay.loadSprite("penger", "sprites/snowman.png", {
        sliceX: 11,
        sliceY: 1,
        anims: {
            idle: { from: 0, to: 3, loop: true, speed: 4 },
            run: { from: 4, to: 6, loop: true, speed: 8 },
            jump: { from: 8, to: 10, loop: true, speed: 4 },
            dead: { from: 7, to: 7, loop: false, speed: 1 },
        }
    });

    await kaplay.loadSprite("spike", "sprites/spike.png");
    await kaplay.loadSprite("stair", "sprites/stair.png");
    await kaplay.loadSprite("cutter", "sprites/fan.png", {
        sliceX: 8,
        sliceY: 1,
        anims: {
            idle: { from: 0, to: 0 },
            run: { from: 0, to: 7, loop: true, speed: 16 },
        }
    });
    await kaplay.loadSprite("surikenThrower", "sprites/arrow.png", {
        sliceX: 6,
        sliceY: 1,
        anims: {
            idle: { from: 0, to: 0 },
            run: { from: 0, to: 5, loop: false, speed: 5 },
        }
    });
    await kaplay.loadSprite("bomb", "sprites/bomb.png")
    await kaplay.loadSprite("suriken", "sprites/suriken.png", {
        sliceX: 8,
        sliceY: 1,
        anims: {
            run: { from: 0, to: 7, loop: true, speed: 8 },
        }
    });
    await kaplay.loadSprite("hoverTile", "sprites/hoverTile.png");

    await kaplay.loadShaderURL("colorReplaceShader", null, "shaders/colorReplace.glsl");

    await kaplay.loadFont("mainfont", "fonts/penger.ttf");
}

const SCENES = {
    game: "game",
    toolselect: "toolselect",
    error: "error",
    home: "home",
}

const ASSETNAMES = {
    penger: "penger",
    ghost: "ghost",
    map: "map",
    spike: "spike",
    stair: "stair",
    cutter: "cutter",
    surikenThrower: "surikenThrower",
    suriken: "suriken",
    bomb: "bomb",
    hoverTile: "hoverTile",
    mainfont: "mainfont",
    colorReplaceShader: "colorReplaceShader",
}
const TOOLS = [ASSETNAMES.spike, ASSETNAMES.stair, ASSETNAMES.cutter, ASSETNAMES.hoverTile, ASSETNAMES.surikenThrower, ASSETNAMES.bomb];
export { ASSETNAMES, SCENES, TOOLS };
export default loadAssets;
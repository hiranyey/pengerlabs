
const loadAssets = async (kaplay) => {
    await kaplay.loadSprite("map", "sprites/map.png");

    await kaplay.loadSprite("penger", "sprites/snowman.png",{
        sliceX: 11,
        sliceY: 1,
        anims:{
            idle:{from:0,to:3,loop:true,speed:4},
            run:{from:4,to:6,loop:true,speed:8},
            jump:{from:8,to:10,loop:true,speed:4},
            dead:{from:7,to:7,loop:false,speed:1},
        }
    });
    
    await kaplay.loadSprite("spike", "sprites/spike.png");
    await kaplay.loadSprite("stair", "sprites/stair.png");
    await kaplay.loadSprite("arrow", "sprites/arrow.png");
    await kaplay.loadSprite("bow", "sprites/bow.png");

    await kaplay.loadFont("mainfont", "fonts/penger.ttf");
}

const SCENES = {
    game: "game",
    toolselect: "toolselect",
}

const ASSETNAMES = {
    penger: "penger",
    ghost: "ghost",
    map: "map",
    spike: "spike",
    stair: "stair",
    arrow: "arrow",
    bow: "bow",
    mainfont: "mainfont",
}
const TOOLS = [ASSETNAMES.spike, ASSETNAMES.stair, ASSETNAMES.bow];
export { ASSETNAMES,SCENES,TOOLS };
export default loadAssets;
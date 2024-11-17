import { ASSETNAMES, SCENES, TOOLS } from "./assetLoader";
import eventEmitter from './eventEmitter';

const toolSelect = (k, appendObstacle, room) => {
    const getToolArea = (tool) => {
        switch (tool) {
            case ASSETNAMES.spike:
                return {
                    shape: new k.Rect(k.vec2(), 16, 20),
                    offset: k.vec2(0, 6),
                }
            case ASSETNAMES.stair:
                return {
                }
            case ASSETNAMES.cutter:
                return {
                    shape: new k.Rect(k.vec2(), 32, 10),
                    offset: k.vec2(0, 3),
                }
        }
    }

    const getToolRotation = (tool) => {
        switch (tool) {
            case ASSETNAMES.spike:
                return {
                    angle: 0,
                }
            case ASSETNAMES.stair:
                return {
                    angle: 0,
                }
            case ASSETNAMES.cutter:
                return {
                    angle: -90,
                }
            case ASSETNAMES.hoverTile:
                return {
                    angle: 0,
                }
            case ASSETNAMES.surikenThrower:
                return {
                    angle: 90,
                }
            case ASSETNAMES.bomb:
                return {
                    angle: 0,
                }
        }
    }

    const createToolAsset = async (k, tool, i) => {
        if (tool == ASSETNAMES.hoverTile) {
            const hoverTileMap = await fetch("sprites/hoverTile.json").then((res) => res.json());
            const colliders = hoverTileMap.layers[1].objects;
            const firstArea = k.area({
                shape: new k.Rect(k.vec2(), colliders[0].width, colliders[0].height),
                offset: k.vec2(-colliders[0].x, colliders[0].y / 2),
            })
            const secondArea = k.area({
                shape: new k.Rect(k.vec2(), colliders[1].width, colliders[1].height),
                offset: k.vec2(colliders[1].x / 2, -colliders[1].y),
            })
            const first = k.add([
                k.pos(k.width() / 3 + (i - 1) * 80, k.height() / 2),
                firstArea,
                k.body({ isStatic: true }),
                k.scale(1.5),
                k.anchor("center"),
                tool + "area"
            ])
            const second = k.add([
                k.sprite(tool),
                k.pos(k.width() / 3 + (i - 1) * 80, k.height() / 2),
                secondArea,
                k.body({ isStatic: true }),
                k.scale(1.5),
                k.anchor("center"),
                tool,
            ]);
            return [first, second];
        } else {
            return k.add([
                k.sprite(tool),
                k.pos(k.width() / 3 + (i - 1) * 80, k.height() / 2),
                k.area(getToolArea(tool)),
                k.rotate(getToolRotation(tool).angle),
                k.body({ isStatic: true }),
                k.scale(1.5),
                k.anchor("center"),
                tool,
            ]);
        }

    }

    k.scene(SCENES.toolselect, () => {

        k.add([
            k.sprite("map"),
            k.pos(0, 0),
            k.scale(2),
        ])
        const text = k.add([
            k.text("Select tool", {
                font: ASSETNAMES.mainfont,
                size: 32,
            }),
            k.pos(k.width() / 2, k.height() / 3),
            k.color(0, 0, 0),
            k.anchor("center"),
        ])
        const items = [];
        TOOLS.forEach(async (tool, i) => {
            const greybox = k.add([
                k.rect(64, 64),
                k.pos(k.width() / 3 + (i - 1) * 80, k.height() / 2),
                k.outline(2, [0, 0, 0]),
                k.anchor("center"),
                k.area(),
                "greybox",
            ])
            const toolSprite = await createToolAsset(k, tool, i)
            const toolText = k.add([
                k.text(tool, {
                    font: ASSETNAMES.mainfont,
                    size: 8,
                }),
                k.pos(k.width() / 3 + (i - 1) * 80, k.height() / 2 + 50),
                k.color(0, 0, 0),
                k.anchor("center"),
            ])
            k.onHoverUpdate("greybox", (x) => {
                const t = k.time() * 10;
                text.color = k.hsl2rgb((t / 10) % 1, 0.6, 0.7);
                text.scale = k.vec2(1 + 0.1 * Math.sin(t));
                x.color = k.hsl2rgb((t / 10) % 1, 0.6, 0.7);
                x.scale = k.vec2(1.2);
                k.setCursor("pointer");
            });
            k.onHoverEnd("greybox", (x) => {
                text.color = k.rgb(0, 0, 0);
                text.scale = k.vec2(1);
                x.color = k.rgb(255, 255, 255);
                x.scale = k.vec2(1);
                k.setCursor("default");
            });
            items.push(...[greybox, toolSprite, toolText]);
            greybox.onClick(() => {
                greybox.destroy();
                text.scale = k.vec2(1);
                text.color = k.rgb(0, 0, 0);
                text.text = "Click to place " + tool;
                items.forEach((item) => {
                    if (item === toolSprite[0] || item === toolSprite[1]) {
                        return;
                    }
                    if (item === toolSprite) return;
                    if (item.length > 1) {
                        item.forEach((i) => {
                            i.destroy();
                        })
                        return;
                    }
                    item.destroy();
                });
                let count = 0;
                const u = k.onUpdate(() => {
                    count++;
                    if (count % 2 == 0) {
                        room.send("tool", { tool: tool, pos: k.mousePos() });
                    }
                    if (toolSprite.length > 1) {
                        toolSprite[0].pos = k.mousePos();
                        toolSprite[1].pos = k.mousePos();
                    } else {
                        toolSprite.pos = k.mousePos();
                    }
                })
                setTimeout(() => {
                    k.onClick(async () => {
                        room.send("addObstacle", { tool: tool, pos: k.mousePos() });
                        text.destroy();
                        u.cancel();
                        appendObstacle(toolSprite);
                        //k.go(SCENES.game);
                    })
                })
            });
        });
        let floatingObjectsMap = {};
        eventEmitter.on("tool", async (data) => {
            if (floatingObjectsMap[data.sessionId]) {
                if (floatingObjectsMap[data.sessionId].length > 1) {
                    floatingObjectsMap[data.sessionId][0].moveTo(data.newMessage.pos.x, data.newMessage.pos.y, 700);
                    floatingObjectsMap[data.sessionId][1].moveTo(data.newMessage.pos.x, data.newMessage.pos.y, 700);
                } else {
                    floatingObjectsMap[data.sessionId].moveTo(data.newMessage.pos.x, data.newMessage.pos.y, 700);
                }
            } else {
                const toolSprite = await createToolAsset(k, data.newMessage.tool, 0);
                if (toolSprite.length > 1) {
                    toolSprite[0].pos.x = data.newMessage.pos.x;
                    toolSprite[0].pos.y = data.newMessage.pos.y;
                    toolSprite[1].pos.x = data.newMessage.pos.x;
                    toolSprite[1].pos.y = data.newMessage.pos.y;
                } else {
                    toolSprite.pos.x = data.newMessage.pos.x;
                    toolSprite.pos.y = data.newMessage.pos.y;
                }
                floatingObjectsMap[data.sessionId] = toolSprite;
            }
        });
        eventEmitter.on("addObstacle", async (data) => {
            appendObstacle(floatingObjectsMap[data.sessionId]);
        });
    });
}
export default toolSelect;


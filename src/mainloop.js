import { ASSETNAMES, TOOLS } from "./assetLoader.js";
import eventEmitter from "./eventEmitter.js";
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

const randomStartingPoint = (startCollider) => {
    const randomX = Math.floor(Math.random() * startCollider.width * 2) + startCollider.x * 2;
    const randomY = Math.floor(Math.random() * startCollider.height * 2) + startCollider.y * 2;
    return { x: randomX, y: randomY };
}

const gameLoop = (k, appendObstacle, getObstacles, room, players, mySessionId) => {

    const recordScreen = (time) => {
        const recorder = k.record(60);
        setTimeout(async () => {
            recorder.download("recording.mp4");
        }, time);
    }

    const createGhost = (k, player) => {
        room.send("death", { x: player.pos.x - 2, y: player.pos.y - 2 });
        k.shake(20);
    }

    const compareTwoPositions = (pos1, pos2) => {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }


    const createColliders = (map, k) => {
        const colliders = map.layers[4].objects;
        colliders.forEach((collider) => {
            k.add([
                k.rect(collider.width * 2, collider.height * 2),
                k.pos(collider.x * 2, collider.y * 2),
                k.opacity(0),
                k.area(),
                k.body({ isStatic: true }),
            ]);
        });
        const endCollider = map.layers[5].objects[0];
        k.add([
            k.rect(endCollider.width * 2, endCollider.height * 2),
            k.pos(endCollider.x * 2, endCollider.y * 2),
            k.opacity(0),
            k.area(),
            k.body({ isStatic: true }),
            "end",
        ]);

        k.add([
            k.rect(k.width() * 1.5, 2),
            k.pos(-k.width() / 4, k.height() + 32),
            k.opacity(0),
            k.area(),
            k.body({ isStatic: true }),
            "deathPlatform",
        ]);
    }

    const setPlayerPosition = (startCollider, player) => {
        const startingPoint = randomStartingPoint(startCollider);
        player.pos.x = startingPoint.x;
        player.pos.y = startingPoint.y;
        room.send("playerUpdate", { x: player.pos.x, y: player.pos.y, teleport: true });
        player.play("idle");
    }

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
                k.pos(k.width() / 2.5 + (i - 1) * 80, k.height() / 2),
                firstArea,
                k.body({ isStatic: true }),
                k.scale(1.5),
                k.anchor("center"),
                tool + "area",
                "obstacle",
            ])
            const second = k.add([
                k.sprite(tool),
                k.pos(k.width() / 2.5 + (i - 1) * 80, k.height() / 2),
                secondArea,
                k.body({ isStatic: true }),
                k.scale(1.5),
                k.anchor("center"),
                tool,
                "obstacle",
            ]);
            return [first, second];
        } else {
            return k.add([
                k.sprite(tool),
                k.pos(k.width() / 2.5 + (i - 1) * 80, k.height() / 2),
                k.area(getToolArea(tool)),
                k.rotate(getToolRotation(tool).angle),
                k.body({ isStatic: true }),
                k.scale(1.5),
                k.anchor("center"),
                tool,
                "obstacle",
            ]);
        }
    }

    k.scene("game", async () => {
        const map = await fetch("sprites/map.json").then((res) => res.json());
        k.add([
            k.sprite("map"),
            k.pos(0, 0),
            k.scale(2),
        ])
        // Add tool button at top left
        // Circle
        k.add([
            k.circle(16),
            k.pos(32, 32),
            k.color(0, 0, 0),
            k.layer("ui"),
        ]);
        let numberOfTools = 2;
        k.add([
            k.circle(8),
            k.pos(42, 42),
            k.outline(2, [0, 0, 0]),
            k.color(255, 255, 255),
            k.anchor("center"),
            k.layer("ui"),
        ]);
        const numberIcon = k.add([
            k.text(numberOfTools, {
                font: ASSETNAMES.mainfont,
                size: 12,
            }),
            k.pos(39, 38),
            k.color(0, 0, 0),
            k.layer("ui"),
            k.animate()
        ]);
        const updateNumber = (x) => {
            numberOfTools += x;
            numberIcon.animate("scale", [1 ,3, 1], {
                loop: false,
                duration: 1,
            });
            setTimeout(() => {
                numberIcon.animate('scale', [1, 1], {loop: false, duration: 0.4})
            },500)
            numberIcon.text = numberOfTools;
        }
        const addButton = k.add([
            k.sprite(ASSETNAMES.plus),
            k.pos(20.5, 20),
            k.scale(0.1),
            k.area(),
            "addButton",
        ]);
        let menuOpen = false;
        addButton.onClick(() => {
            menuOpen = !menuOpen;
            if (menuOpen && numberOfTools > 0) {
                k.get("me").forEach((player) => {
                    player.unuse("body");
                });
                let items = [];
                TOOLS.forEach(async (tool, i) => {
                    const greybox = k.add([
                        k.rect(64, 64),
                        k.pos(k.width() / 2.5 + (i - 1) * 80, k.height() / 2),
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
                        k.pos(k.width() / 2.5 + (i - 1) * 80, k.height() / 2 + 50),
                        k.color(0, 0, 0),
                        k.anchor("center"),
                    ])
                    k.onHoverUpdate("greybox", (x) => {
                        const t = k.time() * 10;
                        x.color = k.hsl2rgb((t / 10) % 1, 0.6, 0.7);
                        x.scale = k.vec2(1.2);
                        k.setCursor("pointer");
                    });
                    k.onHoverEnd("greybox", (x) => {
                        x.color = k.rgb(255, 255, 255);
                        x.scale = k.vec2(1);
                        k.setCursor("default");
                    });
                    items.push(...[greybox, toolSprite, toolText]);
                    greybox.onClick(() => {
                        greybox.destroy();
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
                        const u = k.onUpdate(() => {
                            if (toolSprite.length > 1) {
                                toolSprite[0].pos = k.mousePos();
                                toolSprite[1].pos = k.mousePos();
                            } else {
                                toolSprite.pos = k.mousePos();
                            }

                        })
                        setTimeout(() => {
                            const x = k.onClick(() => {
                                k.get("me").forEach((player) => {
                                    player.use(k.body());
                                });
                                menuOpen = false;
                                room.send("addObstacle", { tool: tool, pos: k.mousePos() });
                                u.cancel();
                                x.cancel();
                                updateNumber(-1);
                                appendObstacle(toolSprite);
                                if (tool == ASSETNAMES.cutter) {
                                    toolSprite.play("run");
                                }
                            })
                        })

                    });
                });
            }
        })
        eventEmitter.removeAllListeners(["addObstacle"]);
        eventEmitter.on("addObstacle", async (data) => {
            const toolSprite = await createToolAsset(k, data.newMessage.tool, 0);
            appendObstacle(toolSprite);
            if(data.newMessage.tool == ASSETNAMES.cutter) {
                toolSprite.play("run");
            }
            if (toolSprite.length > 1) {
                toolSprite[0].pos.x = data.newMessage.pos.x;
                toolSprite[0].pos.y = data.newMessage.pos.y;
                toolSprite[1].pos.x = data.newMessage.pos.x;
                toolSprite[1].pos.y = data.newMessage.pos.y;
            } else {
                toolSprite.pos.x = data.newMessage.pos.x;
                toolSprite.pos.y = data.newMessage.pos.y;
            }
        });
        k.setGravity(1000);
        createColliders(map, k);
        const startCollider = map.layers[6].objects[0];
        getObstacles().forEach((obstacle) => {
            if (obstacle.length > 1) {
                obstacle.forEach((o) => {
                    k.add(o);
                })
            } else {
                k.add(obstacle);
            }
            if (!Array.isArray(obstacle) && obstacle.is(ASSETNAMES.cutter)) {
                obstacle.play("run");
            }
        });
        let out_r;
        let out_g;
        let out_b;
        players.forEach((player) => {
            if (player.sessionId === mySessionId) {
                out_r = player.red;
                out_g = player.green;
                out_b = player.blue;
            } else {
                k.add([
                    k.sprite(ASSETNAMES.penger),
                    k.pos(0, 0),
                    k.scale(1.5),
                    k.area({
                        shape: new k.Rect(k.vec2(), 15, 16),
                        offset: k.vec2(0, 2),
                        collisionIgnore: ["player"],
                    }),
                    k.anchor("center"),
                    k.body(),
                    k.animate(),
                    k.z(10),
                    k.shader(ASSETNAMES.colorReplaceShader, () => ({
                        in_r: 143 / 255,
                        in_g: 195 / 255,
                        in_b: 216 / 255,
                        out_r: player.red / 255,
                        out_g: player.green / 255,
                        out_b: player.blue / 255,
                    })),
                    "player",
                    player.sessionId,

                ]).play("run");
            }
        });

        const player = k.add([
            k.pos(0, 0),
            k.sprite(ASSETNAMES.penger),
            k.scale(1.5),
            k.area({
                shape: new k.Rect(k.vec2(), 15, 16),
                offset: k.vec2(0, 2),
                collisionIgnore: ["player"],
            }),
            k.anchor("center"),
            k.body(),
            k.animate(),
            k.z(10),
            k.shader(ASSETNAMES.colorReplaceShader, () => ({
                in_r: 143 / 255,
                in_g: 195 / 255,
                in_b: 216 / 255,
                out_r: out_r / 255,
                out_g: out_g / 255,
                out_b: out_b / 255,
            })),
            "player",
            "me",
        ])
        setPlayerPosition(startCollider, player);
        const triangleFollower = k.add([
            k.polygon([k.vec2(-5, -5), k.vec2(0, 0), k.vec2(5, -5)]),
            k.pos(k.width() / 2, k.height() / 2),
            k.color([out_r, out_g, out_b]),
        ]);
        let currentMusic = k.play(ASSETNAMES.run, { volume: 0.5 });
        player.onGround(() => {
            if (k.isKeyDown("right") || k.isKeyDown("left")) {
                if (currentMusic.time() == 0) {
                    currentMusic = k.play(ASSETNAMES.run, { volume: 0.5 });
                }
                player.play("run");
            } else {
                player.play("idle");
            }
        });
        k.onKeyRelease("t", () => {
            recordScreen(5000);
        })
        k.onButtonDown("up", () => {
            if (menuOpen) return;
            if (player.is("body") && player.isGrounded()) {
                k.play(ASSETNAMES.jump);
                player.play("jump");
                player.jump(400);
            }
            if (player.usingStair) {
                player.move(0, -100);
            }
        })
        k.onButtonDown("down", () => {
            if (menuOpen) return;
            if (player.usingStair) {
                player.move(0, 100);
            }
        })
        k.onButtonDown("right", () => {
            if (menuOpen) return;
            if (player.is("body") && player.getCurAnim().name !== "run" && player.isGrounded()) {
                player.play("run");
            }
            if (player.usingStair) {
                return;
            }
            if (currentMusic.time() == 0) {
                currentMusic = k.play(ASSETNAMES.run, { volume: 0.5 });
            }
            player.flipX = true;
            player.move(100, 0);
        })
        k.onButtonDown("left", () => {
            if (menuOpen) return;
            if (player.is("body") && player.getCurAnim().name !== "run" && player.isGrounded()) {
                player.play("run");
            }
            if (player.usingStair) {
                return;
            }
            if (currentMusic.time() == 0) {
                currentMusic = k.play(ASSETNAMES.run, { volume: 0.5 });
            }
            player.flipX = false;
            player.move(-100, 0);
        })

        k.onButtonRelease("death", () => {
            createGhost(k, player);
            k.play(ASSETNAMES.dead);
            updateNumber(1);
            setPlayerPosition(startCollider, player);
        })
        player.onCollide("deathPlatform", () => {
            k.play(ASSETNAMES.dead);
            room.send("death", { x: player.pos.x, y: player.pos.y });
            updateNumber(1);
            setPlayerPosition(startCollider, player);
        })

        k.onCollide("player", ASSETNAMES.spike, (player, spike) => {
            if (spike.pos.y - spike.height > player.pos.y - 15) {
                createGhost(k, player);
                k.play(ASSETNAMES.dead);
                updateNumber(1);
                setPlayerPosition(startCollider, player);
            }
        });
        k.onCollide("player", ASSETNAMES.cutter, async (player, cutter) => {
            player.pos.x = cutter.pos.x - cutter.width / 2
            createGhost(k, player);
            k.play(ASSETNAMES.dead);
            updateNumber(1);
            setPlayerPosition(startCollider, player);
        });
        if (DEBUG) {
            // k.onClick(() => {
            //     player.moveTo(k.mousePos());
            // })
        }

        k.onCollide("player", ASSETNAMES.stair, (player, stair) => {
            if(player.is("me") && !player.is("body")) {
                return;
            }
            player.pos.x = stair.pos.x;
            if (stair.pos.y > player.pos.y) {
                player.pos.y = stair.pos.y - stair.height / 2 + 1;
            } else {
                player.pos.y = stair.pos.y + stair.height / 2 - 1;
            }
            player.unuse("body");
            player.usingStair = stair.id;
        });
        k.onCollide("player", "arrowCollider", (player, arrow) => {
            createGhost(k, player);
            k.play(ASSETNAMES.dead);
            updateNumber(1);
            setPlayerPosition(startCollider, player);
        });

        k.onCollide("player", "end", (player, end) => {
            player.destroy();
            if (player.is("me")) {
                triangleFollower.destroy();
                room.send("end", { x: player.pos.x, y: player.pos.y });
            }
        })
        k.loop(2, () => {
            k.get(ASSETNAMES.surikenThrower).forEach((arrow) => {
                if (getObstacles().includes(arrow)) {
                    arrow.play("run");
                    setTimeout(() => {
                        const suriken = k.add([
                            k.pos(arrow.pos.x, arrow.pos.y),
                            k.sprite(ASSETNAMES.suriken),
                            k.area(),
                            k.scale(0.5),
                            k.anchor("center"),
                            "arrowCollider",
                        ]);
                        suriken.play("run");
                    }, 400);
                }
            })
        });

        k.onUpdate(() => {
            triangleFollower.pos.x = player.pos.x;
            triangleFollower.pos.y = player.pos.y - 20;
            room.send("playerUpdate", { x: player.pos.x, y: player.pos.y });
            if (player.is("body") && player.isGrounded()) {
                if (compareTwoPositions(player.pos, player.prevLocation) && player.getCurAnim().name !== "idle") {
                    player.play("idle");
                }
            }
            player.prevLocation = player.pos;
            const stair = k.get(ASSETNAMES.stair).filter((stair) => stair.id === player.usingStair)[0];
            if (stair && player.usingStair && (player.pos.y < stair.pos.y - stair.height || player.pos.y > stair.pos.y + stair.height)) {
                player.use(k.body());
                player.usingStair = false;
            }
            const arrowCollider = k.get("arrowCollider");
            if (arrowCollider.length > 0) {
                arrowCollider.forEach((arrow) => {
                    arrow.move(-200, 0);
                })
            }

        })
        eventEmitter.removeAllListeners(["death"]);
        eventEmitter.on("death", (data) => {
            const ghost = k.add([
                k.sprite(ASSETNAMES.penger),
                k.pos(data.newMessage.x, data.newMessage.y),
                k.scale(1.1),
                k.area({
                    shape: new k.Rect(k.vec2(), 12, 8),
                    offset: k.vec2(2, 12),
                }),
                k.body(),
            ]);
            ghost.play("dead");
            ghost.onGround(() => {
                ghost.unuse("body");
                ghost.use(k.body({ isStatic: true }));
            })
            ghost.onCollide("deathPlatform", () => {
                ghost.destroy();
            })
        });
        eventEmitter.removeAllListeners(["playerUpdate"]);
        let teleportCounter = 0;
        eventEmitter.on("playerUpdate", (data) => {
            k.get(data.sessionId).forEach(async (player) => {
                if (data.newMessage.teleport) {
                    player.pos.x = data.newMessage.x;
                    player.pos.y = data.newMessage.y;
                } else {
                    player.moveTo(data.newMessage.x, data.newMessage.y, 700);
                    teleportCounter++;
                    if (teleportCounter === 20) {
                        teleportCounter = 0;
                        player.moveTo(data.newMessage.x, data.newMessage.y);
                    }
                }
            })
        });

    });

}
export default gameLoop;


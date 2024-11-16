import { ASSETNAMES, TOOLS } from "./assetLoader.js";

const randomStartingPoint = (startCollider) => {
    const randomX = Math.floor(Math.random() * startCollider.width * 2) + startCollider.x * 2;
    const randomY = Math.floor(Math.random() * startCollider.height * 2) + startCollider.y * 2;
    return { x: randomX, y: randomY };
}

const gameLoop = (k, getObstacles) => {

    const recordScreen = (time) => {
        const recorder = k.record(60);
        setTimeout(async () => {
            recorder.download("recording.mp4");
        }, time);
    }

    const createGhost = (k, player) => {
        const ghost = k.add([
            k.sprite(ASSETNAMES.penger),
            k.pos(player.pos.x - 2, player.pos.y - 2),
            k.scale(1.1),
            k.area({
                shape: new k.Rect(k.vec2(), 12, 8),
                offset: k.vec2(2, 12),
            }),
            k.body(),
        ]);
        ghost.play("dead");
        k.shake(20);
        ghost.onCollide("death", () => {
            ghost.destroy();
        })
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
        player.play("idle");
    }

    k.scene("game", async () => {
        const map = await fetch("sprites/map.json").then((res) => res.json());
        k.add([
            k.sprite("map"),
            k.pos(0, 0),
            k.scale(2),
        ])
        k.setGravity(1000);
        createColliders(map, k);
        const startCollider = map.layers[6].objects[0];
        getObstacles().forEach((obstacle) => {
            if (obstacle.length > 1) {
                obstacle.forEach((o) => {
                    k.add(o);
                })
                return;
            } else {
                k.add(obstacle);
            }
            if (obstacle.is(ASSETNAMES.cutter)) {
                obstacle.play("run");
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
            k.shader(ASSETNAMES.colorReplaceShader, () => ({
                in_r: 143 / 255,
                in_g: 195 / 255,
                in_b: 216 / 255,
                out_r: 128 / 255,
                out_g: 32 / 255,
                out_b: 16 / 255,
            })),
            "player",
        ])
        setPlayerPosition(startCollider, player);
        player.onGround(() => {
            if (k.isKeyDown("right") || k.isKeyDown("left")) {
                player.play("run");
            } else {
                player.play("idle");
            }
        });
        k.onButtonDown("up", () => {
            if (player.is("body") && player.isGrounded()) {
                player.play("jump");
                player.jump(400);
            }
            if (player.usingStair) {
                player.move(0, -100);
            }
        })
        k.onButtonDown("down", () => {
            if (player.usingStair) {
                player.move(0, 100);
            }
        })
        k.onButtonDown("right", () => {
            if (player.is("body") && player.getCurAnim().name !== "run" && player.isGrounded()) {
                player.play("run");
            }
            if (player.usingStair) {
                return;
            }
            player.flipX = true;
            player.move(100, 0);
        })
        k.onButtonDown("left", () => {
            if (player.is("body") && player.getCurAnim().name !== "run" && player.isGrounded()) {
                player.play("run");
            }
            if (player.usingStair) {
                return;
            }
            player.flipX = false;
            player.move(-100, 0);
        })

        k.onButtonRelease("death", () => {
            createGhost(k, player);
            setPlayerPosition(startCollider, player);
        })
        player.onCollide("deathPlatform", () => {
            setPlayerPosition(startCollider, player);
        })

        k.onCollide("player", ASSETNAMES.spike, (player, spike) => {
            if (spike.pos.y - spike.height > player.pos.y - 15) {
                createGhost(k, player);
                setPlayerPosition(startCollider, player);
            }
        });
        k.onCollide("player", ASSETNAMES.cutter, async (player, cutter) => {
            player.pos.x = cutter.pos.x - cutter.width / 2
            createGhost(k, player);
            setPlayerPosition(startCollider, player);
        });

        k.onCollide("player", ASSETNAMES.stair, (player, stair) => {
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
            setPlayerPosition(startCollider, player);
        });

        k.onCollide("player", "end", (player, end) => {
            k.go("toolselect");
        })
        k.loop(2, () => {
            k.get(ASSETNAMES.surikenThrower).forEach((arrow) => {
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
            })
        });

        k.onUpdate(() => {
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

    });



}
export default gameLoop;


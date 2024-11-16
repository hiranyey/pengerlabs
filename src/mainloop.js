import { ASSETNAMES } from "./assetLoader.js";

const randomStartingPoint = (startCollider) => {
    const randomX = Math.floor(Math.random() * startCollider.width * 2) + startCollider.x * 2;
    const randomY = Math.floor(Math.random() * startCollider.height * 2) + startCollider.y * 2;
    return { x: randomX, y: randomY };
}

const gameLoop = (k, getObstacles) => {
    const createGhost = (k, player) => {
        const ghost = k.add([
            k.sprite(ASSETNAMES.penger),
            k.pos(player.pos.x, player.pos.y),
            k.scale(1.1),
            k.area({
                shape: new k.Rect(k.vec2(), 12, 8),
                offset: k.vec2(2, 12),
            }),
            k.body(),
        ]);
        ghost.play("dead");
        ghost.onCollide("death", () => {
            ghost.destroy();
        })
    }

    k.scene("game", async () => {
        const map = await fetch("sprites/map.json").then((res) => res.json());
        k.add([
            k.sprite("map"),
            k.pos(0, 0),
            k.scale(2),
        ])
        k.setGravity(1000);
        const colliders = map.layers[4].objects;
        colliders.forEach((collider) => {
            k.add([
                k.rect(collider.width * 2, collider.height * 2),
                k.pos(collider.x * 2, collider.y * 2),
                k.opacity(0),
                k.area(),
                k.body({ isStatic: true }),
            ])
        })
        const endCollider = map.layers[5].objects[0];
        k.add([
            k.rect(endCollider.width * 2, endCollider.height * 2),
            k.pos(endCollider.x * 2, endCollider.y * 2),
            k.opacity(0),
            k.area(),
            k.body({ isStatic: true }),
            "end",
        ])
        const startCollider = map.layers[6].objects[0];
        k.add([
            k.rect(k.width() * 1.5, 2),
            k.pos(-k.width() / 4, k.height() + 32),
            k.opacity(0),
            k.area(),
            k.body({ isStatic: true }),
            "death",
        ])
        getObstacles().forEach((obstacle) => {
            k.add(obstacle);
        });
        const startingPoint = randomStartingPoint(startCollider);
        const player = k.add([
            k.pos(startingPoint.x, startingPoint.y),
            k.sprite(ASSETNAMES.penger),
            k.scale(1.5),
            k.area({
                shape: new k.Rect(k.vec2(), 15, 16),
                offset: k.vec2(0, 2),
            }),
            k.anchor("center"),
            k.body(),
            k.animate(),
            "player",
        ])
        player.play("idle");
        player.onGround(() => {
            if (k.isKeyDown("right") || k.isKeyDown("left")) {
                player.play("run");
            } else {
                player.play("idle");
            }
        });
        k.onButtonDown("up", () => {
            if (player.isGrounded()) {
                player.play("jump");
                player.jump(400);
            }
        })
        k.onButtonDown("right", () => {
            if (player.getCurAnim().name !== "run" && player.isGrounded()) {
                player.play("run");
            }
            player.flipX = true;
            player.move(100, 0);
        })
        k.onButtonDown("left", () => {
            if (player.getCurAnim().name !== "run" && player.isGrounded()) {
                player.play("run");
            }
            player.flipX = false;
            player.move(-100, 0);
        })

        k.onButtonRelease("death", () => {
            createGhost(k, player);
            const startingPoint = randomStartingPoint(startCollider);
            player.pos.x = startingPoint.x;
            player.pos.y = startingPoint.y;
        })
        player.onCollide("death", () => {
            const startingPoint = randomStartingPoint(startCollider);
            player.pos.x = startingPoint.x;
            player.pos.y = startingPoint.y;
        })
        k.onCollide("player", "spike", (player, spike) => {
            if (spike.pos.y - spike.height > player.pos.y - 15) {
                createGhost(k, player);
                const startingPoint = randomStartingPoint(startCollider);
                player.pos.x = startingPoint.x;
                player.pos.y = startingPoint.y;
            }
        });
        k.onCollide("player", "end", (player, end) => {
            k.go("toolselect", obstacles);
        })

        k.onUpdate(() => {
            if (player.isGrounded()) {
                if (compareTwoPositions(player.pos, player.prevLocation) && player.getCurAnim().name !== "idle") {
                    player.play("idle");
                }
            }
            player.prevLocation = player.pos;
        })
    });

    const compareTwoPositions = (pos1, pos2) => {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }

}
export default gameLoop;
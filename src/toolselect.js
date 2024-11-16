import { ASSETNAMES, SCENES, TOOLS } from "./assetLoader";


const toolSelect = (k, appendObstacle) => {
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
            case ASSETNAMES.bow:
                return {
                }
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
        TOOLS.forEach((tool, i) => {
            const greybox = k.add([
                k.rect(64, 64),
                k.pos(k.width() / 2 + (i - 1) * 80, k.height() / 2),
                k.outline(2, [0, 0, 0]),
                k.anchor("center"),
                k.area(),
                "greybox",
            ])
            const toolSprite = k.add([
                k.sprite(tool),
                k.pos(k.width() / 2 + (i - 1) * 80, k.height() / 2),
                k.area(getToolArea(tool)),
                k.body({ isStatic: true }),
                k.scale(1.5),
                k.anchor("center"),
                tool,
            ])
            const toolText = k.add([
                k.text(tool, {
                    font: ASSETNAMES.mainfont,
                    size: 8,
                }),
                k.pos(k.width() / 2 + (i - 1) * 80, k.height() / 2 + 50),
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
                    if (item === toolSprite) return;
                    item.destroy();
                });
                const u = k.onUpdate(() => {

                    toolSprite.pos = k.mousePos();
                })
                setTimeout(() => {
                    k.onClick(() => {
                        text.destroy();
                        u.cancel();
                        appendObstacle(toolSprite);
                        k.go(SCENES.game);
                    })
                })
            });
        });
    });
}
export default toolSelect;
import { ASSETNAMES, SCENES } from "./assetLoader"


const homePage = (k, room) => {
    k.scene(SCENES.home, () => {
        k.add([
            k.sprite("map"),
            k.pos(0, 0),
            k.scale(2),
        ])
        k.add([
            k.text("Players online: 1", {
                font: ASSETNAMES.mainfont,
                size: 15,
            }),
            k.pos(20, 20),
            k.color(0, 0, 0),
            k.anchor("left"),
            "playercount",
        ]);
        const title = k.add([
            k.text("PengerLabs", {
                font: "mainfont",
                size: 32,
            }),
            k.pos(k.width() / 2, k.height() / 4),
            k.color(0, 0, 0),
            k.anchor("center"),
        ]);

        k.onUpdate(() => {

        });
        const text = k.add([
            k.text("Your self destructive journey to igloo", {
                font: "mainfont",
                size: 16,
            }),
            k.pos(k.width() / 2, k.height() / 3 + 10),
            k.color(0, 0, 0),
            k.anchor("center"),
        ])
        const penger = k.add([
            k.sprite("penger"),
            k.pos(title.width + 50, k.height() / 4 - 20),
            k.scale(4),
            k.anchor("center"),
        ]);
        penger.play("jump");
        const playButton = k.add([
            k.text("Play", {
                font: "mainfont",
                size: 16,
            }),
            k.pos(k.width() / 2, k.height() / 2),
            k.color(0, 0, 0),
            k.anchor("center"),
            k.anchor("center"),
            k.area(),
            "playbutton",
        ]);

        k.onHoverUpdate("playbutton", (x) => {
            const t = k.time() * 10;
            playButton.color = k.hsl2rgb((t / 10) % 1, 0.6, 0.7);
            playButton.scale = k.vec2(2);
            k.setCursor("pointer");
        });
        const hoverEnd = k.onHoverEnd("playbutton", (x) => {
            playButton.color = k.rgb(255, 255, 255);
            playButton.scale = k.vec2(1);
            k.setCursor("default");
        });
        playButton.onClick(() => {
            playButton.waiting = true;
            room.send("startGame");
            penger.play("run");
            playButton.text = "Waiting for players..";
            hoverEnd.cancel();
        });

        playButton.onUpdate(() => {
            if (playButton.waiting) {
                const t = k.time() * 10;
                playButton.color = k.hsl2rgb((t / 10) % 1, 0.6, 0.7);
                playButton.scale = k.vec2(2);
                title.color = playButton.color;
            }
        });


    });
}
export default homePage;
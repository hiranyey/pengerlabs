import { ASSETNAMES, SCENES } from "./assetLoader"
import eventEmitter from "./eventEmitter";


const leaderboard = (k, room) => {
    k.scene(SCENES.leaderboard, () => {
        k.add([
            k.sprite("map"),
            k.pos(0, 0),
            k.scale(2),
        ])
        eventEmitter.removeAllListeners(["sceneChange"]);
        eventEmitter.on("sceneChange", (data) => {
            const leaderBoard = data.state
            k.add([
                k.rect(k.width() / 1.5, k.height() / 1.5),
                k.color(0, 0, 0),
                k.opacity(0.8),
                k.pos(k.width() / 2, k.height() / 2),
                k.anchor("center"),
            ])
            k.add([
                k.text("Leaderboard", {
                    font: ASSETNAMES.mainfont,
                    size: 32,
                }),
                k.pos(k.width() / 2, k.height() / 4),
                k.color(255, 255, 255),
                k.anchor("center"),
            ])
            k.add([
                k.text("Name", {
                    font: ASSETNAMES.mainfont,
                    size: 18,
                }),
                k.pos(k.width() / 5, k.height() / 3),
                k.color(255, 255, 255),
                k.anchor("left"),
            ])
            k.add([
                k.text("Time", {
                    font: ASSETNAMES.mainfont,
                    size: 18,
                }),
                k.pos(k.width() / 2, k.height() / 3),
                k.color(255, 255, 255),
                k.anchor("center"),
            ])
            k.add([
                k.text("Deaths", {
                    font: ASSETNAMES.mainfont,
                    size: 18,
                }),
                k.pos(k.width() / 1.5, k.height() / 3),
                k.color(255, 255, 255),
                k.anchor("center"),
            ])
            const text = k.add([
                k.text("Click anywhere to continue", {
                    font: ASSETNAMES.mainfont,
                    size: 18,
                }),
                k.pos(k.width() / 2, k.height() / 1.5),
                k.color(255, 255, 255),
                k.anchor("center"),
            ])
            const clicker = k.onClick(() => {
                text.text = "Waiting for players..";
                clicker.cancel();
                room.send("startGame");
                eventEmitter.removeAllListeners(["sceneChange"]);
            });
            const sumOfArray = (arr) => {
                return arr.reduce((a, b) => a + b, 0);
            }
            const result = Object.values(leaderBoard).sort((a, b) => {
                return sumOfArray(a.time,b.time);
            });
            if(result.length >0 && result[0].time.length ==3){
                clicker.cancel();
                const isThisMe = result[0].sessionId == room.sessionId ? "(You)" : ""
                text.text = result[0].name + isThisMe + " wins!";
            }
            result.forEach((player, i) => {
                const isThisMe = player.sessionId == room.sessionId ? "(You)" : ""
                k.add([
                    k.text(player.name + isThisMe, {
                        font: ASSETNAMES.mainfont,
                        size: 18,
                    }),
                    k.pos(k.width() / 5, k.height() / 3 + 20 + i * 20),
                    k.color(player.red, player.green, player.blue),
                    k.anchor("left"),
                ])
                k.add([
                    k.text(sumOfArray(player.time).toFixed(1), {
                        font: ASSETNAMES.mainfont,
                        size: 18,
                    }),
                    k.pos(k.width() / 2, k.height() / 3 + 20 + i * 20),
                    k.color(player.red, player.green, player.blue),
                    k.anchor("center"),
                ])
                k.add([
                    k.text(player.death || 0, {
                        font: ASSETNAMES.mainfont,
                        size: 18,
                    }),
                    k.pos(k.width() / 1.5, k.height() / 3 + 20 + i * 20),
                    k.color(player.red, player.green, player.blue),
                    k.anchor("center"),
                ])
            });
        });
    });
}
export default leaderboard;
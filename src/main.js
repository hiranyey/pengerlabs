import { k } from "./kaplayContext"
import loadAssets from "./assetLoader"
import toolselect from "./toolselect"
import gameLoop from "./mainloop"
import { SCENES, ASSETNAMES } from "./assetLoader";
import { client } from "./colyseusSetup";
import eventEmitter from "./eventEmitter";
import homePage from "./homeScreen";

function updatePlayerLists(currentPlayer, serverPlayers) {
    const newPlayers = [];
    const droppedPlayers = [];

    const currentPlayerSet = new Set(currentPlayer.map(player => player.sessionId));

    serverPlayers.forEach(player => {
        if (!currentPlayerSet.has(player.sessionId)) {
            newPlayers.push(player);
        }
    });

    const serverPlayerSet = new Set(serverPlayers.map(player => player.sessionId));

    currentPlayer.forEach(player => {
        if (!serverPlayerSet.has(player.sessionId)) {
            droppedPlayers.push(player);
        }
    });

    return { newPlayers, droppedPlayers };
}

const createPlayerText = (player, k, suffix) => {
    setTimeout(() => {
        const blackBackground = k.add([
            k.rect(150, 16),
            k.pos(k.width() - 100, 10 + currentCount * 20),
            k.color(0, 0, 0),
            k.anchor("center"),
            "playertext",
        ]);
        const newPlayer = k.add([
            k.text(player.name + suffix, {
                font: ASSETNAMES.mainfont,
                size: 10,
            }),
            k.pos(k.width() - 100, 10 + currentCount * 20),
            k.color(player.red, player.green, player.blue),
            k.anchor("center"),
            "playertext",
        ]);
        currentCount++;
        setTimeout(() => {
            newPlayer.destroy();
            blackBackground.destroy();
            currentCount--;
        }, 3000);
    }, 100);
}

let currentCount = 0;
const showPlayers = (players, message, mySessionId) => {
    const { newPlayers, droppedPlayers } = updatePlayerLists(players, Object.values(message));
    newPlayers.forEach(player => {
        players.push(player);
        if (player.sessionId != mySessionId) {
            createPlayerText(player, k, " joined..");
        }
    });
    droppedPlayers.forEach(player => {
        const index = players.findIndex(p => p.sessionId === player.sessionId);
        createPlayerText(player, k, " left..");
        delete players[index];
        players.splice(index, 1);
    });
    setTimeout(() => {
        k.get("playercount").forEach((text) => {
            text.text = "Players online: " + players.length;
        });
    }, 100);
}



loadAssets(k).then(async () => {
    let room;
    let players = [];
    let mySessionId;
    try {
        room = await client.joinOrCreate("my_room");
        mySessionId = room.sessionId;
        room.onMessage("*", (type, message) => {
            if (type == "players") {
                showPlayers(players, message, mySessionId);
            } else {
                const newType = type.type
                const newMessage = type.message;
                const sessionId = type.sender;
                if (newType == "tool") {
                    eventEmitter.emit(newType, { newMessage, sessionId });
                } else if (newType == "addObstacle") {
                    eventEmitter.emit(newType, { newMessage, sessionId });
                } else if (newType == "sceneChange") {
                    k.go(newMessage);
                } else if (newType == "death") {
                    eventEmitter.emit(newType, { newMessage, sessionId });
                } else if (newType == "playerUpdate" && sessionId != mySessionId) {
                    eventEmitter.emit(newType, { newMessage, sessionId });
                } else {
                   // console.log("Unknown message type: " + newType);
                }
            }
        });
    } catch (e) {
        k.scene(SCENES.error, () => {
            k.add([
                k.text("Error connecting to server" + e, {
                    font: ASSETNAMES.mainfont,
                    size: 32,
                }),
                k.pos(k.width() / 2, k.height() / 3),
                k.color(0, 0, 0),
                k.anchor("center"),
            ])
        })
        k.go(SCENES.error);
        return;
    }

    let obstacles = [];
    const appendObstacle = (obstacle) => {
        obstacles.push(obstacle);
    }
    const getObstacles = () => obstacles;
    homePage(k, room);
    let once = true;
    document.onclick = () => {
        if (once) {
            once = false;
            let bgmMusic = k.play(ASSETNAMES.bgm);
            setInterval(() => {
                bgmMusic.stop();
                bgmMusic = k.play(ASSETNAMES.bgm);
            }, 132000);
        }
    }
    toolselect(k, appendObstacle, room);
    gameLoop(k, getObstacles, room, players, mySessionId);
    k.go(SCENES.home);
});
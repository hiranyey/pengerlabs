import { k } from "./kaplayContext"
import  loadAssets  from "./assetLoader"
import  toolselect from "./toolselect"
import  gameLoop from "./mainloop"
import { SCENES } from "./assetLoader";

await loadAssets(k);
let obstacles =[];
const appendObstacle = (obstacle) => obstacles.push(obstacle);
const getObstacles = () => obstacles;
toolselect(k,appendObstacle);
gameLoop(k, getObstacles);
k.go(SCENES.toolselect);
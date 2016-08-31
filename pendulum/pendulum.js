//konstanty
var CONST = {
    //visual
    WIDTH: 800,
    HEIGHT: 300,
    RADIUS: 20,
    PADDING: 10,
    MAX_Y: Math.PI,
    Y_COEF: 100,
    //logic
    AVERAGE_SPEED: 25,
    PENDULUMS: 15,
    SPEED_BASE: 20,
    SPEED_INC: 1,
    PERIOD: 30000,
};
//proměnné
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
canvas.width = ctx.canvas.clientWidth;//CONST.WIDTH;
canvas.height = ctx.canvas.clientHeight;//CONST.HEIGHT;
CONST.WIDTH = canvas.width;
CONST.HEIGHT = canvas.height;
CONST.PENDULUMS = Math.round(CONST.WIDTH / (CONST.RADIUS * 2 + CONST.PADDING * 2)) - 1;
CONST.SPEED_BASE = Math.round(CONST.AVERAGE_SPEED - CONST.PENDULUMS / 2);


var speeds = [];
for (var i = 0; i < CONST.PENDULUMS; i++) {
    speeds[i] = (CONST.SPEED_BASE + i * CONST.SPEED_INC) / CONST.PERIOD;
}

var update = function (delta) { //vrací, zda se má loop zopakovat
    var time = (Date.now() - startTime) % CONST.PERIOD;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    ctx.fillStyle = "white";
    for (var i = 0; i < CONST.PENDULUMS; i++) {
        var y = time * speeds[i] * CONST.MAX_Y * 2;
        y %= CONST.MAX_Y * 2;
        y = Math.sin(y) * CONST.Y_COEF;
        y += CONST.HEIGHT / 2;
        ctx.beginPath();
        ctx.arc((i + 1) * (CONST.RADIUS + CONST.PADDING) * 2, y, CONST.RADIUS, 0, 2 * Math.PI, false);
        ctx.fill();
    }
};


var main = function () {
    var curTime = Date.now();
    var delta = curTime - lastTime;
    update(delta);
    lastTime = curTime;
    requestAnimationFrame(main);
};
var lastTime = Date.now();
var startTime = Date.now();
main();
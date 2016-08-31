var CONST = {
    //visual
    RADIUS: 20,
    PADDING: 10,
    MAX_Y: Math.PI,
    Y_COEF: 100,
    //logic
    AVERAGE_SPEED: 25,
    SPEED_INC: 1,
    PERIOD: 30000,
};

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
canvas.width = ctx.canvas.clientWidth;
canvas.height = ctx.canvas.clientHeight;
//As many pendulums as we can fit, but make it an odd number
CONST.PENDULUMS = Math.round(canvas.width / (CONST.RADIUS * 2 + CONST.PADDING * 2)) - 1;
CONST.SPEED_BASE = Math.round(CONST.AVERAGE_SPEED - CONST.PENDULUMS / 2);

var speeds = [];
for (var i = 0; i < CONST.PENDULUMS; i++) {
    speeds[i] = (CONST.SPEED_BASE + i * CONST.SPEED_INC) / CONST.PERIOD;
}

var startTime = Date.now();

var update = function (delta) {
    var time = (Date.now() - startTime) % CONST.PERIOD;
    ctx.fillStyle = "black";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    for (var i = 0; i < CONST.PENDULUMS; i++) {
        var y = (time * speeds[i] * CONST.MAX_Y * 2) % (CONST.MAX_Y * 2);
        y = Math.sin(y) * CONST.Y_COEF + canvas.height / 2;
        ctx.beginPath();
        ctx.arc((i + 1) * (CONST.RADIUS + CONST.PADDING) * 2, y, CONST.RADIUS, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    requestAnimationFrame(update);
};
update();
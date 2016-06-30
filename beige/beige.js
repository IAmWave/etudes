//Copyright (c) 2014-2016 Václav Volhejn

var canvas = document.getElementById('beigeCanvas');
var ctx = canvas.getContext("2d");

window.addEventListener('resize', function(event) {
    canvas.width = ctx.canvas.clientWidth;
    canvas.height = ctx.canvas.clientHeight;
});

canvas.width = ctx.canvas.clientWidth;
canvas.height = ctx.canvas.clientHeight;

function getPosition(event) {
    return {
        x: event.x - canvas.offsetLeft,
        y: event.y - canvas.offsetTop
    };
}

var CONST = {
    BASE_SIZE: 20,
    RADIUS_INC: 0.1,
    TIME_TO_SIZE_COEF: 0.13,
    COLOR1: "white",
    COLOR2: "#F0F0C0",
    CURVE_EXPONENT: 2.3,
    TRAIL_DELAY: 500, //a new wave is generated every TRAIL_DELAY ms
    MOVEMENT_REDUCTION_COEF: 10, //moving the mouse by 1 pixel reduces the delay by this constant
    TRAIL_DURATION: 900,
    STATIC_DURATION: 1000,
};

var mousePos = {x: 0, y: 0};
var sources = [];
var pressedSource = null;
var trailMode = false;
var lastTrailTime = 0;
var lastEvent = {x: 0, y: 0};

canvas.addEventListener('mousedown', function (event) {
    var newSource = getPosition(event);
    newSource.startTime = Date.now();
    newSource.endTime = Date.now() + CONST.STATIC_DURATION;
    sources.push(newSource);
    pressedSource = newSource;
    trailMode = false;
}, false);

canvas.addEventListener('mouseup', function () {
    pressedSource = null;
    size = CONST.BASE_SIZE;
    trailMode = false;
}, false);

canvas.addEventListener('mousemove', function (event) {
    if (event.x === lastEvent.x && event.y === lastEvent.y) return;

    var distance = Math.hypot(lastEvent.x - event.x, lastEvent.y - event.y);
    mousePos = getPosition(event);
    if (pressedSource !== null){
        trailMode = true;
        lastTrailTime -= CONST.MOVEMENT_REDUCTION_COEF * distance;
    }
    lastEvent = event;
}, false);

var update = function (delta) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var cur;
    for (var i = 0; i < sources.length; i++) {
        if (Date.now() > sources[i].endTime) {
            sources.splice(i, 1);
        }
    }
    if (!trailMode) {
        if (pressedSource !== null) {
            pressedSource.endTime = Date.now() + CONST.STATIC_DURATION;
        }
    } else {
        if (Date.now() > lastTrailTime + CONST.TRAIL_DELAY) {
            lastTrailTime = Date.now();
            var newSource = JSON.parse(JSON.stringify(mousePos));
            newSource.startTime = Date.now();
            newSource.endTime = Date.now() + CONST.TRAIL_DURATION;
            sources.push(newSource);
        }

    }
    for (var i = 0; i < sources.length; i++) {
        cur = sources[i];

        var totalTime = cur.endTime - cur.startTime;
        var curTime = Date.now() - cur.startTime;
        var coef2 = CONST.TIME_TO_SIZE_COEF / Math.pow(totalTime, CONST.CURVE_EXPONENT - 1);

        var size1 = curTime * CONST.TIME_TO_SIZE_COEF;
        var size2 = Math.pow(curTime, CONST.CURVE_EXPONENT) * coef2;

        ctx.beginPath();
        ctx.arc(cur.x, cur.y, size1, 0, 2 * Math.PI, false);
        ctx.fillStyle = CONST.COLOR2;
        ctx.fill();
        if (size2 > 0) {
            ctx.beginPath();
            ctx.arc(cur.x, cur.y, size2, 0, 2 * Math.PI, false);
            ctx.fillStyle = CONST.COLOR1;
            ctx.fill();
        }
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
main();
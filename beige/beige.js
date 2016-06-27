//Copyright (c) 2014-2016 Václav Volhejn

//pomocné metody
function createArray(length) {
    var arr = new Array(length || 0),
            i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--)
            arr[length - 1 - i] = createArray.apply(this, args);
    }

    return arr;
}
function getPosition(event) {
    var x = event.x;
    var y = event.y;

    var canvas = document.getElementById("beigeCanvas");

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    var res = {};
    res.x = x;
    res.y = y;
    return res;
}
//konstanty
var CONST = {
    BASE_SIZE: 20,
    RADIUS_INC: 0.1,
    TIME_TO_SIZE_COEF: 0.13,
    COLOR1: "white",
    COLOR2: "#F0F0C0",
    CURVE_EXPONENT: 2.3,
    TRAIL_DELAY: 500,
    MOVEMENT_REDUCTION_COEF: 10, //kdyz se pohne mys o X pixelu, cas se zkrati o X*k, kde k je toto
    TRAIL_DURATION: 900
};
//promìnné
var canvas = document.getElementById('beigeCanvas');
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;
var mousePos = {x: 0, y: 0};
var sources = [];
var pressedSource = null;
var trailMode = false;
var lastTrailTime = 0; //kdy naposledy vytvarel kolecko
var lastEvent = {x: 0, y: 0};
//mousedown, mouseup, mousemove, mouseout and mouseover
canvas.addEventListener('mousedown', function (event) {
    var newSource = getPosition(event);
    newSource.startTime = Date.now();
    newSource.endTime = Date.now() + 1000;
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
    //console.log("moved!");
    if (event.x === lastEvent.x && event.y === lastEvent.y) {
        return;
    }
    var deltaX = lastEvent.x - event.x;
    var deltaY = lastEvent.y - event.y;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    mousePos = getPosition(event);
    if (pressedSource !== null){
        trailMode = true;
        console.log(distance);
        lastTrailTime -= CONST.MOVEMENT_REDUCTION_COEF * distance;
    }
    //lastTrailTime = Date.now();
    lastEvent = event;
}, false);

var update = function (delta) { //vrací, zda se má loop zopakovat

    //ctx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var cur;
    for (var i = 0; i < sources.length; i++) {
        if (Date.now() > sources[i].endTime) {
            sources.splice(i, 1);
        }
    }
    if (!trailMode) {
        if (pressedSource !== null) {
            pressedSource.endTime = Date.now() + 1000;
        }
    } else {
        //console.log("trail " + (Date.now() - lastTrailTime - CONST.TRAIL_DELAY));
        if (Date.now() > lastTrailTime + CONST.TRAIL_DELAY) {

            lastTrailTime = Date.now();
            var newSource = JSON.parse(JSON.stringify(mousePos));

            /*newSource.x = mousePos.x;
             newSource.y = mousePos.y;*/
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
//Math.max((curTime - totalTime / 2) * CONST.TIME_TO_SIZE_COEF * 2, 0);
        //console.log(delta + ", " + size1);
        ctx.fillStyle = "rgba(" + 100 + "," + 100 + "," + 100 + "," + 1 + ")";//"#FF0000";
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
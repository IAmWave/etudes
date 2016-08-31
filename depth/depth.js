//pomocné metody
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
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

    var canvas = document.getElementById("myCanvas");

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    var res = {};
    res.x = x;
    res.y = y;
    return res;
}
//konstanty
var CONST = {
    WIDTH: 600,
    HEIGHT: 600,
    ROTATION_COEF: 0.02,
    ROTATE: true,
    MIN_A_1: 10,
    MIN_A_2: 15,
    SIZE_COEF: 0.001, //0.7
    MAX_SIZE: 900,
    DISPLAY_FPS: true,
};
function dist(x, y) {
    return Math.sqrt(x * x + y * y);
}

function getHeight(a) {
    return Math.sqrt(0.75 * a * a);
}

//proměnné
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
canvas.width = CONST.WIDTH;
canvas.height = CONST.HEIGHT;

var size = CONST.HEIGHT;

function drawFractal(x, y, a) {
    if (a < CONST.MIN_A_1) {
        //drawTriangle(x, y, a);
        return;
    }
    if (y > dist(CONST.WIDTH, CONST.WIDTH)) {
        return;
    }
    if(a < CONST.MIN_A_2){
        var color = Math.round((a-CONST.MIN_A_1)/(CONST.MIN_A_2-CONST.MIN_A_1)*255);
        ctx.fillStyle = rgbToHex(color, color, color);
    } else{
        ctx.fillStyle = "white";
    }
    var height = getHeight(a);
    drawTriangle(x, y + height / 2, a / 2, true);
    drawFractal(x, y, a / 2);
    drawFractal(x - a / 4, y + height / 2, a / 2);
    drawFractal(x + a / 4, y + height / 2, a / 2);
}

function drawTriangle(x, y, a, up) {
    var height = getHeight(a);

    ctx.beginPath();
    if (!up) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + a / 2, y + height);
        ctx.lineTo(x - a / 2, y + height);
    } else {
        ctx.moveTo(x, y + height);
        ctx.lineTo(x + a / 2, y);
        ctx.lineTo(x - a / 2, y);
    }
    ctx.closePath();
    ctx.fill();
}

var update = function (delta) { //vrací, zda se má loop zopakovat
    size *= 1 + (delta * CONST.SIZE_COEF);
    if (size > CONST.MAX_SIZE) {
        size = size / 2;
    }

    if (CONST.ROTATE) {
        ctx.translate(CONST.WIDTH / 2, CONST.HEIGHT / 2);
        ctx.rotate(delta * CONST.ROTATION_COEF * Math.PI / 180);
        ctx.fillStyle = "white";
        ctx.fillRect(-CONST.WIDTH / 2, -CONST.HEIGHT / 2, CONST.WIDTH * 1.5, CONST.HEIGHT * 1.5);
        ctx.translate(-CONST.WIDTH / 2, -CONST.HEIGHT / 2);
    } else {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = "black";
    drawTriangle(CONST.WIDTH / 2, CONST.HEIGHT / 2, size);
    ctx.fillStyle = "white";
    drawFractal(CONST.WIDTH / 2, CONST.HEIGHT / 2, size);
    //ctx.fillRect(50, 20, 100, 50);

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
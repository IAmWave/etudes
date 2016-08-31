//constants
var CONST = {
    ROTATION_COEF: 0.02,
    MIN_A_1: 10, //triangles of this size are completely faded 
    MIN_A_2: 15, //triangles of this size begin fading
    SIZE_COEF: 0.001,
    MAX_SIZE: 900,
    DISPLAY_FPS: true,
};

//returns the height of the equilateral triangle with side a
function getHeight(a) {
    return 0.866 * a; //0.866 = sqrt(0.75)
}

//variables
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
canvas.width = ctx.canvas.clientWidth;
canvas.height = ctx.canvas.clientHeight;
CONST.WIDTH = canvas.width;
CONST.HEIGHT = canvas.height;
CONST.MAX_SIZE = Math.max(CONST.WIDTH, CONST.HEIGHT) * 1.4;


var size = CONST.HEIGHT;

function drawFractal(x, y, a) {
    if (a < CONST.MIN_A_1) return;
    if (y > Math.hypot(CONST.WIDTH, CONST.WIDTH)) return;

    if(a < CONST.MIN_A_2){
        var color = Math.round((a-CONST.MIN_A_1)/(CONST.MIN_A_2-CONST.MIN_A_1)*255);
        ctx.fillStyle = "rgb("+color+","+color+","+color+")";
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

var update = function (delta) {
    size *= 1 + (delta * CONST.SIZE_COEF);
    if (size > CONST.MAX_SIZE) {
        size = size / 2;
    }

    ctx.translate(CONST.WIDTH / 2, CONST.HEIGHT / 2);
    ctx.rotate(delta * CONST.ROTATION_COEF * Math.PI / 180);
    //ctx.fillStyle = "white";
    ctx.clearRect(-CONST.WIDTH / 2, -CONST.HEIGHT / 2, CONST.WIDTH * 1.5, CONST.HEIGHT * 1.5);
    ctx.translate(-CONST.WIDTH / 2, -CONST.HEIGHT / 2);
    
    ctx.fillStyle = "black";
    drawTriangle(CONST.WIDTH / 2, CONST.HEIGHT / 2, size);
    //The fractal is made by drawing white triangles on a large black one.
    drawFractal(CONST.WIDTH / 2, CONST.HEIGHT / 2, size);
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
var rotate = function (x, rot) {
    return x.map(function (n) {
        return (4 + n + rot) % 4;
    });
};

var flip = function (x) {
    return x.map(function (n) {
        return (4 - n) % 4;
    });
};

var lastTo = function (x, val) {
    x[x.length - 1] = val;
};

var nextSize = function (x) { //must end with 2
    var y = flip(x);
    var res = [];
    res = res.concat(rotate(y, -1));
    lastTo(res, 1);
    res = res.concat(x);
    lastTo(res, 2);
    res = res.concat(x);
    lastTo(res, 3);
    res = res.concat(rotate(y, 1));
    lastTo(res, 2);
    return res;
};

var SIZE = 7,
    TIME_PER_BLOCK = 60,
    PADDING = 2; //relative to width - 1 means no padding


var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
canvas.width = ctx.canvas.clientWidth;
canvas.height = ctx.canvas.clientHeight;

var dd = [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}];
var lastDist = -1;
var pos = {x: 0.5, y: 0.5};
var nextPos = {x: 0.5, y: 0.5};
var path = [2];

var swap = true;

var drawBetween = function(fst, snd) {
    var mn = {x: Math.min(fst.x, snd.x), y: Math.min(fst.y, snd.y)};
    var mx = {x: Math.max(fst.x, snd.x), y: Math.max(fst.y, snd.y)};
    ctx.fillRect(mn.x * PADDING * SIZE, mn.y * PADDING * SIZE,
        mx.x * PADDING * SIZE + SIZE - mn.x * PADDING * SIZE,
        mx.y * PADDING * SIZE + SIZE - mn.y * PADDING * SIZE);
}

var update = function () {
    ctx.fillStyle = "white";
    var dist = Math.floor((Date.now() - startTime) / TIME_PER_BLOCK);
    var part = ((Date.now() - startTime) / TIME_PER_BLOCK) % 1;
    while (dist > lastDist) { //jak spravit bug s alt tabem?
        if (dist >= path.length) {
            path = nextSize(path);
            swap = !swap;
        }
        lastDist++;
        drawBetween(pos, nextPos);
        pos = nextPos;
        nextPos = {
            x: (pos.x + dd[swap?(3-path[lastDist]):path[lastDist]].x),
            y: (pos.y + dd[swap?(3-path[lastDist]):path[lastDist]].y)
        };
        ctx.fillRect(pos.x * PADDING * SIZE, pos.y * PADDING * SIZE, SIZE, SIZE); //kvuli plynulosti
    }

    var x = (1 - part) * pos.x + part * nextPos.x;
    var y = (1 - part) * pos.y + part * nextPos.y;
    drawBetween(pos, {x:x,y:y});
    //ctx.fillRect((x * PADDING) * SIZE, (y * PADDING) * SIZE, SIZE, SIZE);
};
ctx.fillStyle = "#DD2222";
ctx.clearRect(0, 0, canvas.width, canvas.height);

var main = function () {
    update();
    requestAnimationFrame(main);
};
var startTime = Date.now();
main();

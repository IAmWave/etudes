//helper functions
var setLevelFromUrl = function() {
    var index = window.location.href.indexOf('?');
    if (index === -1) return;
    var level = parseInt(window.location.href.slice(index + 1));
    if (isNaN(level)) return;
    if (level < 1) return;
    if(level > 5) alert("What a rebel!");
    if (level > 9) level = 9;

    CONST.STEP_TIME = 1200 / level;
    CONST.POWER = level;
    CONST.SIZE = Math.pow(2, level);
    CONST.RADIUS = CONST.CANVAS_SIZE / CONST.SIZE / 2;
    CONST.PADDING = CONST.RADIUS * 2;
}

var createArray = function(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--)
            arr[length - 1 - i] = createArray.apply(this, args);
    }
    return arr;
}

//constants
var transforms = {};
var CONST = {
    SIZE: 8,
    POWER: 3,
    PADDING: 60,
    RADIUS: 30,
    STEP_TIME: 400,
    CANVAS_SIZE: 480
};
var transformIndex = 0;
var transformCount = 3;

var delta = {
    r: {x: 1},
    l: {x: -1},
    u: {y: -1},
    d: {y: 1}
};

var createTransformedGrid = function(grid) {
    var res = JSON.parse(JSON.stringify(grid));
    for (var i = 0; i < res.length; i++) {        
        var d = delta[transforms[transformIndex][res[i].y][res[i].x]];
        if(d.x) res[i].x += d.x;
        if(d.y) res[i].y += d.y;
    }
    transformIndex = (transformIndex + 1) % transformCount;
    return res;
}

var createGrid = function() {
    var res = [];
    for (var i = 0; i < CONST.SIZE; i++) {
        for (var j = 0; j < CONST.SIZE; j++) {
            res.push({x: i, y: j});
        }
    }
    return res;
}

var generateCircle = function(index, startX, startY, power) { //index = which transform to modify, size = 2^pow
    var size = Math.pow(2, power);
    for (var y = 0; y < size / 2; y++) {
        for (var x = 0; x < size; x++) {
            var toWrite = "r";
            if (x < y) toWrite = "u";
            if (x + y >= size - 1) toWrite = "d";
            transforms[index][startY + y][startX + x] = toWrite;
        }
    }
    for (var y = size / 2; y < size; y++) {
        for (var x = 0; x < size; x++) {
            var toWrite = "l";
            if (x > y) toWrite = "d";
            if (x + y <= size - 1) toWrite = "u";
            transforms[index][startY + y][startX + x] = toWrite;
        }
    }
}

var prepareTransforms = function() {
    transformCount = CONST.POWER;

    for (var i = 0; i < CONST.POWER; i++) {
        transforms[i] = createArray(CONST.SIZE, CONST.SIZE);
        for (var x = 0; x < Math.pow(2, i); x++) {
            for (var y = 0; y < Math.pow(2, i); y++) {
                generateCircle(i, x * Math.pow(2, CONST.POWER - i),
                        y * Math.pow(2, CONST.POWER - i), CONST.POWER - i);
            }
        }
    }
}


var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
canvas.width = CONST.CANVAS_SIZE;
canvas.height = CONST.CANVAS_SIZE;


var fillCircle = function(ctx, x, y, radius) {
    if(radius < 5){ //shh, don't tell anybody
        ctx.fillRect(x-radius,y-radius,2*radius,2*radius);
        return;
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
}

var redraw = function(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var progress = 1 - (finishTime - Date.now()) * 1.0 / CONST.STEP_TIME;
    for (var i = 0; i < positions.length; i++) {
        var pos = {x:0, y:0};
        for(a in pos){
            pos[a] = positions[i][a] * (1 - progress) + newPositions[i][a] * progress;
        }
        var c = Math.round((i / positions.length) * 255);
        ctx.fillStyle = "rgb(" + c + ",255," + (255 - c) + ")";
        fillCircle(ctx, pos.x * CONST.PADDING + CONST.RADIUS,
                pos.y * CONST.PADDING + CONST.RADIUS, CONST.RADIUS);
    }
}

setLevelFromUrl();
prepareTransforms();

var positions,
    newPositions = createGrid(),
    finishTime = 0;

var update = function() {
    if (Date.now() >= finishTime) {
        positions = newPositions;
        newPositions = createTransformedGrid(positions);
        finishTime = Date.now() + CONST.STEP_TIME;
    }
    
    redraw();
    requestAnimationFrame(update);
};


update();
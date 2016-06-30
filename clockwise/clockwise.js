//pomocné
function setLevelFromUrl() {
    var index = window.location.href.indexOf('?');
    if (index === -1) {
        return;
    }
    var level = parseInt(window.location.href.slice(index + 1));
    if (isNaN(level)) {
        return;
    }
    level = Math.floor(level);
    if (level < 1) {
        return;
    }
    if (level > 5) {
        CONST.STEP_TIME = 10;
    }
    if (level > 9) {
        level = 9;
    }
    CONST.STEP_TIME = 1200 / level;
    CONST.POWER = level;
    CONST.WIDTH = Math.pow(2, level);
    CONST.HEIGHT = CONST.WIDTH;
    CONST.RADIUS = 480 / Math.pow(2, level) / 2;
    CONST.PADDING = CONST.RADIUS * 2;
}
function fillCircle(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
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
function interpolatePositionsCircle(x1, y1, x2, y2, progress, log) {
    if (x1 === x2 && y1 === y2) {
        return {x: x1, y: y1};
    }
    var res = {};
    var center = {};
    var radius = 0.5;
    center.x = (x1 + x2) / 2;
    center.y = (y1 + y2) / 2;

    var angle1 = Math.atan2(y1 - center.y, x1 - center.x);
    var angle2 = Math.atan2(y2 - center.y, x2 - center.x);

    var dir = {}; //im done
    dir.x = x2 - x1;
    dir.y = y2 - y1;
    if (dir.x === 1 && dir.y === 0) {
        angle1 = Math.PI;
        angle2 = 0;
    } else if (dir.x === -1 && dir.y === 0) {
        angle1 = 2 * Math.PI;
        angle2 = Math.PI;
    } else if (dir.x === 0 && dir.y === 1) {
        angle1 = Math.PI / 2 * 5;
        angle2 = Math.PI / 2 * 3;
    } else if (dir.x === 0 && dir.y === -1) {
        angle1 = Math.PI / 2 * 3;
        angle2 = Math.PI / 2;
    }
    //angle2 = angle2 % (Math.PI * 2);
    var avgAngle = angle1 * (1 - progress) + angle2 * progress;
    if (log === true) {
        //console.log("center: " + center.x + ", " + center.y + " angle: " + angle1 + " to: " + angle2);
        //console.log(dir.x + ", " + dir.y);
    }
    res.x = center.x + radius * (Math.sin(avgAngle + Math.PI / 2));
    res.y = center.y + radius * (Math.cos(avgAngle + Math.PI / 2));
    return res;
}

function interpolatePositions(x1, y1, x2, y2, progress, log) {
    //return interpolatePositionsCircle(x1,y1,x2,y2,progress,log);
    if (x1 === x2 && y1 === y2) {
        return {x: x1, y: y1};
    }
    var res = {};

    res.x = x1 * (1 - progress) + x2 * progress;
    res.y = y1 * (1 - progress) + y2 * progress;

    return res;
}
//konstanty
var transforms = {};
var CONST = {
    WIDTH: 8,
    HEIGHT: 8,
    POWER: 3,
    PADDING: 60,
    RADIUS: 30,
    STEP_TIME: 400
};
var transformIndex = 0;
var transformCount = 3;
function createTransformedGrid(grid) { //pùvodní grid - pro každé koleèko pozice
    var res = JSON.parse(JSON.stringify(grid)); //kopie
    for (var i = 0; i < res.length; i++) {
        switch (transforms[transformIndex][res[i].y][res[i].x]) {
            case "r":
                res[i].x++;
                break;
            case "l":
                res[i].x--;
                break;
            case "u":
                res[i].y--;
                break;
            case "d":
                res[i].y++;
                break;
        }
    }
    transformIndex++;
    if (transformIndex === transformCount) {
        transformIndex = 0;
    }
    return res;
}

function createGrid() {
    var res = Array(CONST.WIDTH * CONST.HEIGHT);
    var index = 0;
    for (var i = 0; i < CONST.WIDTH; i++) {
        for (var j = 0; j < CONST.WIDTH; j++) {
            res[index] = {};
            res[index].x = i;
            res[index].y = j;
            index++;
        }
    }
    return res;
}

function generateCircle(index, startX, startY, power) { //index = do jakeho transformu, size = 2^pow
    var size = Math.pow(2, power);
    for (var y = 0; y < size / 2; y++) {
        for (var x = 0; x < size; x++) {
            var toWrite = "r";
            if (x < y) {
                toWrite = "u";
            }
            if (x + y >= size - 1) {
                toWrite = "d";
            }
            //console.log("writing to " + index + ", x " + (startX + x) + ", y " + (startY + y));
            transforms[index][startY + y][startX + x] = toWrite;
        }
    }
    for (var y = size / 2; y < size; y++) {
        for (var x = 0; x < size; x++) {
            var toWrite = "l";
            if (x > y) {
                toWrite = "d";
            }
            if (x + y <= size - 1) {
                toWrite = "u";
            }
            transforms[index][startY + y][startX + x] = toWrite;
        }
    }
}

function prepareTransforms() {
    transformCount = CONST.POWER;

    for (var i = 0; i < CONST.POWER; i++) {
        transforms[i] = createArray(Math.pow(2, CONST.POWER), Math.pow(2, CONST.POWER));
        for (var x = 0; x < Math.pow(2, i); x++) {
            for (var y = 0; y < Math.pow(2, i); y++) {
                generateCircle(i, x * Math.pow(2, CONST.POWER - i),
                        y * Math.pow(2, CONST.POWER - i), CONST.POWER - i);
            }
        }
    }
}
setLevelFromUrl();
//promìnné
var positions;
var newPositions = createGrid();
prepareTransforms();
var finishTime = 0;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
ctx.translate(0.5, 0.5); //antialiasing?
canvas.width = 480;
canvas.height = 480;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

var update = function(delta) { //vrací, zda se má loop zopakovat
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (Date.now() >= finishTime) {
        positions = newPositions;
        newPositions = createTransformedGrid(positions);
        finishTime = Date.now() + CONST.STEP_TIME;
    }
    var progress = 1 - (finishTime - Date.now()) * 1.0 / CONST.STEP_TIME;
    //ctx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
    //ctx.fillStyle = "rgba(" + 100 + "," + 100 + "," + 100 + "," + 1 + ")";//"#FF0000";
    for (var i = 0; i < positions.length; i++) {
        var pos = interpolatePositions(positions[i].x, positions[i].y,
                newPositions[i].x, newPositions[i].y, progress, i === 0);
        ctx.fillStyle = "rgba(" + Math.round((i / positions.length) * 255)
                + "," + 255 + "," +
                (255 - Math.round((i / positions.length) * 255)) + "," + 1 + ")";//"#FF0000";

        fillCircle(ctx, pos.x * CONST.PADDING + CONST.RADIUS,
                pos.y * CONST.PADDING + CONST.RADIUS, CONST.RADIUS);
        //fillCircle(ctx, (positions[i].x + 1) * CONST.PADDING, (positions[i].y + 1) * CONST.PADDING, CONST.RADIUS);
        /*ctx.fillStyle = "black";
         ctx.fillText("i: " + i, (pos.x + 1) * CONST.PADDING,
         (pos.y + 1) * CONST.PADDING);*/
    }
};

var main = function() {
    var curTime = Date.now();
    var delta = curTime - lastTime;

    update(delta);
    lastTime = curTime;
    requestAnimationFrame(main);
};
var lastTime = Date.now();
main();
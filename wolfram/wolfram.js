//Copyright (c) 2016 Václav Volhejn
//Visualization of Wolfram's cellular automata. The screen is looped, as if on a torus.
//To enter a different rule, add "?123" to the URL, replacing 123 with the desired rule number.
//Rule 30 is the default, also try 110, 90 or 102.
//The cell colors represent which rule was applied to activate the cell.

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");

window.addEventListener('rewidth', function(event) {
    canvas.width = ctx.canvas.clientWidth;
    canvas.height = ctx.canvas.clientHeight;
});

canvas.width = ctx.canvas.clientWidth;
canvas.height = ctx.canvas.clientHeight;

var TILE_SIZE = 20;
var rule = location.search.substring(1) || 30;
var width = Math.floor(canvas.width / TILE_SIZE);
if (width % 2 == 0) width++; //odd widths produce more interesting results
var width2 = Math.floor(width / 2);
var height = Math.floor(canvas.height / (canvas.width / width)) + 1;
var data = new Array(height * 2);
data[0] = new Array(width);
for (var i = 0; i < data[0].length; i++) data[0][i] = -1;
data[0][width2] = 0;

var calculate = function(firstRow) {
    for (var i = firstRow; i < data.length; i++) {
        data[i] = new Array(width);
        for (var j = 0; j < data[i].length; j++) {
            var a0 = data[i - 1][(j + 1) % width] >= 0;
            var a1 = (data[i - 1][j] >= 0);
            var a2 = (data[i - 1][(j - 1 + width) % width] >= 0);
            var cur = (a2 << 2) + (a1 << 1) + a0;
            if ((rule & (1 << cur)) !== 0) {
                data[i][j] = cur;
            } else {
                data[i][j] = -1;
            }
        }
    }
};
calculate(1);

var bgCanvas, bgCtx;
bgCanvas = document.createElement('canvas');
bgCanvas.width = width;
bgCanvas.height = height * 2;
bgCtx = bgCanvas.getContext("2d");
var styles = ["#F00", "#F20", "#F40", "#F60", "#F80", "#FA0", "#FC0", "#FE0"];

var visualize = function() {
    bgCtx.fillStyle = "black";
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            if (data[i][j] != -1) {
                bgCtx.fillStyle = styles[data[i][j]];
                bgCtx.fillRect(j, i, 1, 1);
            }
        }
    }
};
visualize();

var lastJump = canvas.height;
var updateHeight = (bgCanvas.height / 2) * canvas.width / width;
var update = function(t) {
    scale = canvas.width / width;
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    var deltaY = t / 10 - lastJump;
    ctx.translate(canvas.width / 2, -deltaY);
    ctx.scale(scale, scale)
    ctx.drawImage(bgCanvas, -width / 2, 0);
    ctx.restore();
    requestAnimationFrame(update);
    if (deltaY > updateHeight) {
        for (var i = 0; i < height; i++) {
            data[i] = data[i+height];
        }
        calculate(height);
        visualize();
        lastJump += updateHeight;
    }
}

update(0);
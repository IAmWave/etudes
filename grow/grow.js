"use strict";

//static functions
function degreesToRadians(angle) {
    return Math.PI / 180 * angle;
}

//constants
var CONST = {
    RIGHT_ANGLE: Math.PI / 2,
    GROWTH_COEF: 0.008,
    GROWTH_COEF_DIVISION_BASE: 2, //is added to the depth (the root having maximum depth) and then divides GROWTH_COEF
    MIN_BRANCHING_WIDTH: 10,
    ROOT_HEIGHT_COEF: 1,
    WIDTH_TO_HEIGHT_COEF: 1.7,
    HEIGHT_CATCHUP_COEF: 0.01, //how fast branches grow to their desired "aspect ratio"
    HEIGHT_CATHCUP_FLAT: 0.01, //added in each step
    BASE_WIDTH: 40,
    MIN_ANGLE_DIFF: 50,
    MAX_ANGLE_DIFF: 90,
    MIN_WIDTH_PART: 0.3, //when branching, each branch will be at least (MIN_WIDTH_PART * original height) wide
    ROTATION_COEF: 0.0005,
    DEPTH_INFLUENCE_COEF: 0.05,
    MAX_DEPTH: 14,
    RESET_BUTTON_SIZE: 100,
    DISPLAY_RESET_DEPTH: 9, //the depth at which to show the reset button
};

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
canvas.width = ctx.canvas.clientWidth;
canvas.height = ctx.canvas.clientHeight;
var keepBranching = true;
var maxDepth = 0;
var root;
var showButton = false;

var resetButton = new Image();
resetButton.ready = false;
resetButton.src = 'reset.png';
resetButton.onload = function () {
    resetButton.ready = true;
}

window.addEventListener('resize', function (event) {
    canvas.width = ctx.canvas.clientWidth;
    canvas.height = ctx.canvas.clientHeight;
});
function initRoot() {
    root = Branch(CONST.BASE_WIDTH, CONST.BASE_WIDTH * CONST.ROOT_HEIGHT_COEF, null, (Math.random() - 0.5) / 1000);
    maxDepth = 0;
    keepBranching = true;
}

canvas.addEventListener('mousedown', function (event) {
    if (!showButton) return;
    if (event.x - canvas.offsetLeft < CONST.RESET_BUTTON_SIZE &&
        event.y - canvas.offsetTop < CONST.RESET_BUTTON_SIZE) {
        initRoot();
    }
}, false);

var Branch = function (width, height, father, maxRelativeAngle) {

    return {
        subbranches: [],
        depth: 0,
        angle: 0,
        relativeAngle: 0.01 * maxRelativeAngle,

        getWidth: function () {
            return width;
        },
        getHeight: function () {
            return height;
        },
        getFather: function () {
            return father;
        },
        getRelativeAngle: function () {
            return this.relativeAngle;
        },
        getAngle: function () {
            return this.angle;
        },
        getDepth: function () {
            if (this.subbranches.length > 0) {
                var max = 0;
                var cur;
                for (var i = 0; i < this.subbranches.length; i++) {
                    cur = this.subbranches[i].getDepth();
                    if (cur > max) {
                        max = cur;
                    }
                }
                this.depth = max + 1;
                return max + 1;
            }
            this.depth = 0;
            return 0;
        },
        getAngles: function (curAngle) {
            this.angle = curAngle + this.relativeAngle;
            if (this.subbranches.length > 0) {
                for (var i = 0; i < this.subbranches.length; i++) {
                    this.subbranches[i].getAngles(this.angle);
                }
            }
        },

        modifyAngle: function () {
            if (maxRelativeAngle === 0) {
                this.relativeAngle = 0;
                return;
            }
            var dist = (Math.abs(maxRelativeAngle) - Math.abs(this.relativeAngle)) / Math.abs(maxRelativeAngle);

            this.relativeAngle *= 1 + dist * 0.01;

            if (this.relativeAngle < 0) {
                this.relativeAngle -= 0.001;
            } else if (this.relativeAngle > 0) {
                this.relativeAngle += 0.001;
            }

            if (maxRelativeAngle > 0 && this.relativeAngle > maxRelativeAngle) {
                this.relativeAngle = maxRelativeAngle;
            }
            else if (maxRelativeAngle < 0 && this.relativeAngle < maxRelativeAngle) {
                this.relativeAngle = maxRelativeAngle;
            }
        },
        grow: function () {
            this.modifyAngle();
            if (height / width < CONST.WIDTH_TO_HEIGHT_COEF) {
                height *= 1 + (CONST.WIDTH_TO_HEIGHT_COEF - height / width) * CONST.HEIGHT_CATCHUP_COEF;
                height += CONST.HEIGHT_CATHCUP_FLAT;
            }

            var myCoef = CONST.GROWTH_COEF / (this.depth + CONST.GROWTH_COEF_DIVISION_BASE);
            myCoef /= 1 + (maxDepth * maxDepth) * CONST.DEPTH_INFLUENCE_COEF;

            myCoef += 1;
            width *= myCoef;
            height *= myCoef;

            if (keepBranching && width >= CONST.MIN_BRANCHING_WIDTH && this.subbranches.length === 0) {
                if (Math.random() > 0.9) {
                    var leftWidth = 0.5 + (Math.random() * (0.5 - CONST.MIN_WIDTH_PART));
                    if (this.angle >= 0) {
                        leftWidth = 1 - leftWidth;
                    }
                    var angleDiff = (Math.random() * (CONST.MAX_ANGLE_DIFF - CONST.MIN_ANGLE_DIFF) + CONST.MIN_ANGLE_DIFF);
                    var newAngle1 = angleDiff * (1 - leftWidth);
                    var newAngle2 = -angleDiff * (leftWidth);

                    this.subbranches[0] = Branch(width * leftWidth, height * 0.2,
                            this, newAngle1);
                    this.subbranches[1] = Branch(width * (1 - leftWidth), height * 0.2,
                            this, newAngle2);
                    height *= 0.8;
                }
            }
            if (this.subbranches.length > 0) {
                for (var i = 0; i < this.subbranches.length; i++) {
                    this.subbranches[i].grow();
                }
            }
        },
        draw: function (x, y, right) {
            var rads = degreesToRadians(this.angle);
            var hMove = {
                x: height * Math.sin(rads),
                y: -height * Math.cos(rads)
            };
            var hMove2 = { //antialiasing fix - subbranches are drawn as if this branch was a pixel shorter
                x: (height - 0.5) * Math.sin(rads),
                y: -(height - 0.5) * Math.cos(rads)
            };

            rads += CONST.RIGHT_ANGLE;
            rads *= -1;
            var wMove = {
                x: width * Math.sin(rads),
                y: width * Math.cos(rads)
            };

            if (!right) {
                x -= wMove.x;
                y -= wMove.y;
            }

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + wMove.x, y + wMove.y);
            ctx.lineTo(x + wMove.x + hMove.x,
                    y + wMove.y + hMove.y);
            ctx.lineTo(x + hMove.x, y + hMove.y);
            ctx.closePath();
            ctx.fill();

            var drawSubbranch = function (branch, right) {
                var move = Math.sin(degreesToRadians(branch.getRelativeAngle())) * (branch.getWidth());
                var xMove = -move * Math.sin(degreesToRadians(
                        branch
                        .getFather()
                        .getAngle()));
                var yMove = move * Math.cos(degreesToRadians(branch.getFather().getAngle()));
                if (right) {
                    branch.draw(x + hMove2.x + xMove,
                            y + hMove2.y + yMove, true);
                } else {
                    branch.draw(x + hMove2.x + wMove.x - xMove,
                            y + hMove2.y + wMove.y - yMove, false);
                }
            };

            if (this.subbranches.length > 0) {
                drawSubbranch(this.subbranches[0], true);
                drawSubbranch(this.subbranches[1], false);

            }
        }
    };
};

var update = function () {
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    maxDepth = root.getDepth();
    if (maxDepth > CONST.MAX_DEPTH) {
        keepBranching = false;
    }

    root.grow();
    root.getAngles(0);

    ctx.fillStyle = "black";
    root.draw((canvas.width - root.getWidth()) / 2, canvas.height, 0);
    if (maxDepth > CONST.DISPLAY_RESET_DEPTH) {
        showButton = true;
    }

    if (resetButton.ready && showButton) {
        showButton = true;
        ctx.drawImage(resetButton, 0, 0, CONST.RESET_BUTTON_SIZE, CONST.RESET_BUTTON_SIZE);
    }
    requestAnimationFrame(update);
};

initRoot();
update();
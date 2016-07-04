//statické metody
function degreesToRadians(angle) {
    return Math.PI / 180 * angle;
}

//konstanty
var CONST = {
    RIGHT_ANGLE: Math.PI / 2,
    GROWTH_COEF: 0.008,
    GROWTH_COEF_DIVISION_BASE: 2, //pricte se k hloubce (root ma nejvyssi) a souctem se pak vydeli GROWTH_COEF
    MIN_BRANCHING_WIDTH: 10,
    ROOT_HEIGHT_COEF: 1,
    WIDTH_TO_HEIGHT_COEF: 1.7,
    HEIGHT_CATCHUP_COEF: 0.01, //jak rychle se branche davaji do spravneho pomeru stran
    HEIGHT_CATHCUP_FLAT: 0.01, //flat pridani v kazdem kroku
    BASE_WIDTH: 40,
    MIN_ANGLE_DIFF: 50, //30, 60
    MAX_ANGLE_DIFF: 90,
    MIN_WIDTH_PART: 0.3, //pri vetveni bude kazda vetev zabirat aspon MIN_WIDTH_PART z puvodni sirky
    ROTATION_COEF: 0.0005,
    DEPTH_INFLUENCE_COEF: 0.05,
    MAX_DEPTH: 14,
    RESET_BUTTON_SIZE: 100,
    DISPLAY_RESET_DEPTH: 9, //depth, pri kterem se zobrazi tlacitko reset
};
//promìnné

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");
canvas.width = ctx.canvas.clientWidth;//CONST.WIDTH;
canvas.height = ctx.canvas.clientHeight;//CONST.HEIGHT;
var groundHeight = canvas.height * 1;
var keepBranching = true;
var maxDepth = 0;
//random rozhoduje, zda pri prvnim vetveni bude vetsi cast nalevo, nebo napravo
var root;
var showButton = false;


var resetButton = new Image();
resetButton.ready = false;
resetButton.src = 'reset.png';
resetButton.onload = function () {
    resetButton.ready = true;
}

window.addEventListener('resize', function (event) {
    canvas.width = ctx.canvas.clientWidth;//CONST.WIDTH;
    canvas.height = ctx.canvas.clientHeight;//CONST.HEIGHT;
    groundHeight = canvas.height * 1;
});
function initRoot() {
    root = Branch(CONST.BASE_WIDTH, CONST.BASE_WIDTH * CONST.ROOT_HEIGHT_COEF, null, (Math.random() - 0.5) / 1000);
    maxDepth = 0;
    keepBranching = true;
}

canvas.addEventListener('mousedown', function (event) {
    if (!showButton) {
        return;
    }
    var x = event.x;
    var y = event.y;

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    if (x < CONST.RESET_BUTTON_SIZE && y < CONST.RESET_BUTTON_SIZE) {
        initRoot();
    }
}, false);

var Branch = function (width, height, father, maxRelativeAngle) {

    return {
        subbranches: [],
        depth: 0,
        angle: 0,
        relativeAngle: 0.01 * maxRelativeAngle,
        //<editor-fold desc="gettery" defaultstate=collapsed>
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
        //</editor-fold>

        modifyAngle: function () {
            if (maxRelativeAngle === 0) {
                this.relativeAngle = 0;
                return;
            }
            var dist = (Math.abs(maxRelativeAngle) - Math.abs(this.relativeAngle)) / Math.abs(maxRelativeAngle);
            //console.log(dist);
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
            //if(relativeAngle)
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


                    /*var temp = newAngle2;
                     newAngle2 = newAngle1;
                     newAngle1 = temp;*/

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
            var hMove2 = {//antialiasing fix - vykresleni subbranchu probehne tak, jako by tento branch byl o pixel nizsi
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
            //console.log(x + " " + y);

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

var update = function (delta) { //vrací, zda se má loop zopakovat
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    maxDepth = root.getDepth();
    if (maxDepth > CONST.MAX_DEPTH) {
        keepBranching = false;
    }

    root.grow();
    root.getAngles(0);

    ctx.fillStyle = "black";
    root.draw((canvas.width - root.getWidth()) / 2, groundHeight, 0);
    if (maxDepth > CONST.DISPLAY_RESET_DEPTH) {
        showButton = true;
    }

    if (resetButton.ready && showButton) {
        showButton = true;
        ctx.drawImage(resetButton, 0, 0, CONST.RESET_BUTTON_SIZE, CONST.RESET_BUTTON_SIZE);
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
var startTime = Date.now();
initRoot();
main();
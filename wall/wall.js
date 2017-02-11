var bgColor = 'rgb(100, 170, 240)'
var fgColor = {
  r: 244,
  g: 130,
  b: 80
}

var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')
canvas.width = ctx.canvas.clientWidth
canvas.height = ctx.canvas.clientHeight
canvas.style.backgroundColor = bgColor

var size = 0.06 * canvas.height
var space = size * 2
var velocity = 0.002 * canvas.height
var pull = 0.015
var push = 0.2

var avoid = {x: canvas.width * 2, y: 0}

var avoidAngleWeight = 0
var angleCoef = 3

document.onmousemove = function (e) {
  avoid.x = e.clientX
  avoid.y = e.clientY
}

document.ontouchmove = function (e) {
  avoid.x = e.changedTouches[0].clientX
  avoid.y = e.changedTouches[0].clientY
  e.preventDefault()
}

var randomBrickColor = function () {
  var res = JSON.parse(JSON.stringify(fgColor))
  for (var key in res) {
    res[key] = Math.floor(res[key] * (Math.random() * 0.1 + 0.95))
  }
  return res
}

var Brick = function (x, y) {
  return {
    color: randomBrickColor(),
    x: x,
    y: y,
    target: {
      x: x,
      y: y
    },
    step: function () {
      this.target.x += velocity
      var x2 = this.x
      var y2 = this.y
      var pullCoef = pull

      x2 += -(this.x - this.target.x) * pullCoef
      y2 += -(this.y - this.target.y) * pullCoef

      var pushCoef = push
      var distance = Math.hypot(this.x - avoid.x, this.y - avoid.y) * 700 / canvas.height
      var multiplier = Math.exp(-distance / 70 + Math.E * 1.6)
      pushCoef *= multiplier
      var angle = Math.atan2(this.y - avoid.y, this.x - avoid.x)

      x2 += pushCoef * Math.cos(angle)
      y2 += pushCoef * Math.sin(angle)

      this.x = x2
      this.y = y2
    },

    draw: function () {
      ctx.save()
      ctx.fillStyle = 'rgb(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ')'
      ctx.translate(this.x, this.y)
      var angle = Math.atan2(this.y - this.target.y, this.x - this.target.x) * (1 - avoidAngleWeight) +
                  Math.atan2(this.y - avoid.y, this.x - avoid.x) * avoidAngleWeight

      ctx.rotate(angle * angleCoef)
      ctx.fillRect(-size / 2, -size / 2, size, size)

      ctx.restore()
      // ctx.fillStyle = 'white'
      // ctx.fillRect(this.target.x - 3, this.target.y - 3, 6, 6)
    }
  }
}

var rows = []

var odd = false
for (var y = space - size; y - size < canvas.height; y += space) {
  rows.push({
    y: y,
    bricks: [Brick(canvas.width - odd * space / 2, y)]
  })
  odd = !odd
}

var update = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  rows.forEach(function (row) {
    row.bricks.forEach(function (b) {
      b.step()
      b.draw()
    })
    while (row.bricks[0].target.x > -size) { // add bricks at the beginning
      row.bricks.unshift(Brick(row.bricks[0].target.x - space, row.y))
    }
    if (row.bricks[row.bricks.length - 1].x - size > canvas.width) { // remove bricks at the end
      row.bricks.pop()
    }
  })

  window.requestAnimationFrame(update)
}

window.requestAnimationFrame(update)

'use strict'
/* global _ */
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')
canvas.width = ctx.canvas.clientWidth
canvas.height = ctx.canvas.clientHeight
var size = Math.hypot(canvas.width, canvas.height)
var velocity = size * 0.0002

var lengthToColor = function (len) {
  return 'black'
  /* 
  len = 0.3 + 0.7 * len / size
  len = 255 - _.round(len * 255)
  return 'rgb(' + len + ',' + len + ',' + len + ')'
  */
}

function Particle (time, from, to) {
  this.length = Math.hypot(from.x - to.x, from.y - to.y)
  this.from = from
  this.to = to
  this.startTime = time
  this.endTime = time + this.length / velocity
  this.paint = function (t) {
    var progress = (t - this.startTime) / (this.endTime - this.startTime)
    if (progress > 1) progress = 1
    var mid = {
      x: progress * to.x + (1 - progress) * from.x,
      y: progress * to.y + (1 - progress) * from.y
    }
    ctx.strokeStyle = lengthToColor(this.length)
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(mid.x, mid.y)
    ctx.stroke()
    // ctx.fillStyle = 'red'
    // ctx.fillRect(to.x, to.y, 10, 10)
  }
}

// given vertices, return an array of sides (arrays of length 2 with endpoints)
var toSides = function (v) {
  return _.zip(v, _.concat(_.tail(v), _.head(v)))
}

var area = function (v) {
  return 0.5 * Math.abs(_.sum(_.map(toSides(v), function (e) {
    return e[0].x * e[1].y - e[1].x * e[0].y
  })))
}

// given vertices, returns the length and index of the longest side (if i is returned, the side is between i and i+1)
var longestSide = function (v) {
  var bestI = -1
  var best = -1
  _.each(toSides(v), function (e, i) {
    var cur = Math.hypot(e[0].x - e[1].x, e[0].y - e[1].y)
    if (cur > best) {
      best = cur
      bestI = i
    }
  })
  return {index: bestI, length: best}
}

var median = function (time, shape) {
  var i = longestSide(shape.v).index
  var bias = _.random(0.3, 0.7)
  var med = {
    x: shape.v[i].x * bias + shape.v[(i + 1) % 3].x * (1 - bias),
    y: shape.v[i].y * bias + shape.v[(i + 1) % 3].y * (1 - bias)
  }
  shape.children = [
    [shape.v[(i + 2) % 3], med, shape.v[i]],
    [shape.v[(i + 2) % 3], med, shape.v[(i + 1) % 3]]
  ]
  shape.particles = [new Particle(time, shape.v[(i + 2) % 3], med)]
}

// takes an array of 3 or 4 vertices (with x and y)
function Shape (time, v) {
  this.particles = []
  this.v = v
  this.children = []

  if (v.length === 3) {
    median(time, this)
  } else if (v.length === 4) {

  } else console.error('Incorrect number of vertices: ' + v.length)

  if (area(v) > 500) { // longestSide(v).length > 40
    this.paint = function (time) {
      _.each(this.particles, function (p) {
        p.paint(time)
      })
    }
    this.step = function (time) {
      if (_.every(this.particles, function (p) {
        return time > p.endTime
      })) {
        return _.map(this.children, function (v) {
          return new Shape(time, v)
        })
      } else {
        return this
      }
    }
  } else {
    this.step = function (time) { return [] }
    this.paint = function (time) {}
  }
}

var shapes = [new Shape(0, [{x: 0, y: 0}, {x: 0, y: canvas.height}, {x: canvas.width, y: canvas.height}])]

var update = function (time) { // time elapsed since the beginning
  ctx.lineCap = 'round'
  ctx.lineWidth = 2
  ctx.strokeStyle = lengthToColor(size)

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(canvas.width, canvas.height)
  ctx.stroke()

  shapes.forEach(function (s) {
    s.paint(time)
  })

  shapes = _.flatten(_.map(shapes, function (s) {
    return s.step(time)
  }))

  // add point symmetry
  ctx.save()
  ctx.scale(-1, -1)
  ctx.drawImage(canvas, 0, 0, -canvas.width, -canvas.height)
  ctx.restore()

  if (shapes.length > 0) window.requestAnimationFrame(update)
}

window.requestAnimationFrame(update)

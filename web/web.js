'use strict'
/* global _ */
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')
canvas.width = ctx.canvas.clientWidth
canvas.height = ctx.canvas.clientHeight
var size = Math.hypot(canvas.width, canvas.height)
var velocity = size * 0.0002
var zoom = 1.00007
var minArea = 5000 // canvas.width * canvas.height / 200

var getDistance = function (a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

var copyPoint = function (a) {
  return {x: a.x, y: a.y}
}

var stepPoint = function (a, t) {
  var coef = Math.pow(zoom, t)
  var res = {
    x: (a.x - canvas.width / 2) * coef + canvas.width / 2,
    y: (a.y - canvas.height / 2) * coef + canvas.height / 2
  }
  // fix rounding errors (keep points in the lower half)
  /*if (res.y !== 0 && res.x / res.y > canvas.width / canvas.height) {
    res.y = canvas.height / canvas.width * res.x
  }*/
  return res
}

function Particle (from, to) {
  this.from = copyPoint(from)
  this.to = copyPoint(to)
  this.progress = 0

  this.step = function (t) {
    this.from = stepPoint(this.from, t)
    this.to = stepPoint(this.to, t)
    var length = getDistance(this.from, this.to)
    var s = length * this.progress + velocity * t
    this.progress = Math.min(1, s / length)
  }

  this.paint = function () {
    var mid = {
      x: this.progress * this.to.x + (1 - this.progress) * this.from.x,
      y: this.progress * this.to.y + (1 - this.progress) * this.from.y
    }
    ctx.strokeStyle = 'black'
    ctx.beginPath()
    ctx.moveTo(this.from.x, this.from.y)
    ctx.lineTo(mid.x, mid.y)
    ctx.stroke()
  }
}

// given vertices, return an array of sides (arrays of length 2 with endpoints)
var toSides = function (v) {
  return _.zip(v, _.concat(_.tail(v), _.head(v)))
}

var getArea = function (v) {
  return 0.5 * Math.abs(_.sum(_.map(toSides(v), function (e) {
    return e[0].x * e[1].y - e[1].x * e[0].y
  })))
}

// given vertices, returns the length and index of the longest side (if i is returned, the side is between i and i+1)
var getLongestSide = function (v) {
  var bestI = -1
  var best = -1
  _.each(toSides(v), function (e, i) {
    var cur = getDistance(e[0], e[1])
    if (cur > best) {
      best = cur
      bestI = i
    }
  })
  return {index: bestI, length: best}
}

var median = function (shape) {
  var i = getLongestSide(shape.v).index
  var bias = _.random(0.35, 0.65)
  var med = {
    x: shape.v[i].x * bias + shape.v[(i + 1) % 3].x * (1 - bias),
    y: shape.v[i].y * bias + shape.v[(i + 1) % 3].y * (1 - bias)
  }
  shape.children = [
    [shape.v[(i + 2) % 3], med, shape.v[i]],
    [shape.v[(i + 2) % 3], med, shape.v[(i + 1) % 3]]
  ]
  shape.particles = [new Particle(shape.v[(i + 2) % 3], med)]
}

var inBounds = function (v) {
  return _.minBy(v, 'x').x < canvas.width &&
         _.minBy(v, 'y').y < canvas.height &&
         _.maxBy(v, 'x').x >= 0 &&
         _.maxBy(v, 'y').y >= 0
}

var lineInBounds = function (a, b) {
  if (!inBounds([a, b])) return false // preliminary bounding box check
  return _([{x: 0, y: 0}, // corners
            {x: canvas.width, y: 0},
            {x: canvas.width, y: canvas.height},
            {x: 0, y: canvas.height}])
          .map(function (p) { // on which side of the line does the corner lie?
            return Math.sign((b.y - a.y) * p.x + (a.x - b.x) * p.y + (b.x * a.y - a.x * b.y))
          })
          .some(function (x, i, arr) { // if any two corners are on opposite sides of the line, there is an intersection
            return x !== arr[0]
          })
}

// takes an array of 3 vertices (with x and y)
function Shape (v) {
  this.particles = []
  this.v = v
  this.children = []
  this.duration = 0
  this.sleeping = true

  this.paint = function () {
    if (getArea(this.v) < minArea) return
    _.each(this.particles, function (p) {
      p.paint()
    })
  }
  this.step = function (time) {
    this.v = _.map(this.v, function (a) {
      return stepPoint(a, time)
    })
    if (!inBounds(v)) return []

    if (this.sleeping) {
      if (getArea(this.v) >= minArea) {
        this.sleeping = false
        median(this)
      }
      return this
    } else {
      _.each(this.particles, function (p) {
        p.step(time)
      })
      this.particles = _.filter(this.particles, function (p) {
        return p.progress < 1 || lineInBounds(p.from, p.to)
      })

      if (this.particles.length === 0) return []
      this.duration += time

      var res = []
      if (_.every(this.particles, function (p) {
        return p.progress >= 1
      })) {
        var dur = this.duration
        res = _.map(this.children, function (v) {
          return new Shape(_.map(v, function (pt) {
            return stepPoint(pt, dur)
          }))
        })
        this.children = []
      }
      res.push(this)
      return res
    }
  }
}

var shapes = [new Shape([{x: 0, y: 0}, {x: 0, y: canvas.height}, {x: canvas.width, y: canvas.height}])]

var last = 0
var update = function (time) { // time elapsed since the beginning
  var delta = time - last
  last = time
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.lineCap = 'round'
  ctx.lineWidth = 2
  ctx.strokeStyle = 'black'

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(canvas.width, canvas.height)
  ctx.stroke()

  shapes.forEach(function (s) {
    s.paint()
  })

  shapes = _.flatten(_.map(shapes, function (s) {
    return s.step(delta)
  }))
  // add point symmetry
  ctx.save()
  ctx.scale(-1, -1)
  ctx.drawImage(canvas, 0, 0, -canvas.width, -canvas.height)
  ctx.restore()
  // ctx.fillText('' + shapes.length, 10, 50)
  if (shapes.length > 0) window.requestAnimationFrame(update)
}

window.requestAnimationFrame(update)

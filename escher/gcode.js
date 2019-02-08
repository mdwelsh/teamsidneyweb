// Simple GCode parser.

// Width and height of Etch-a-Sketch in step units.
// You can determine this experimentally (and it depends
// on things like gearing, which steppers are being used,
// etc.)
//
// For larger knobs:
//const WIDTH_STEPS = 900;
//const HEIGHT_STEPS = 700;

// For smaller knobs:
//const WIDTH_STEPS = 720;
//const HEIGHT_STEPS = 500;
//
// Virtual screen:
const WIDTH_STEPS = 900;
const HEIGHT_STEPS = 620;

function atan3(dy, dx) {
 var a = Math.atan2(dy, dx);
 if (a < 0) {
   a = (Math.PI * 2.0) + a;
 }
 return a;
}

// Precision of arcs in centimeters per segment.
const CM_PER_SEGMENT = 0.1;

// Adapted from:
//  https://www.marginallyclever.com/2014/03/how-to-improve-the-2-axis-cnc-gcode-interpreter-to-understand-arcs/
function doArc(posx, posy, x, y, cx, cy, cw) {
  var retval = [];
  var dx = posx - cx;
  var dy = posy - cy;
  var radius = Math.sqrt((dx*dx)+(dy*dy));

  // find the sweep of the arc
  var angle1 = atan3(posy - cy, posx - cx);
  var angle2 = atan3(y - cy, x - cx);
  var sweep = angle2 - angle1;

  if (sweep < 0 && cw) {
    angle2 += 2.0 * Math.PI;
  } else if (sweep > 0 && !cw) {
    angle1 += 2.0 * Math.PI;
  }

  sweep = angle2 - angle1;

  // get length of arc
  var l = Math.abs(sweep) * radius;
  var num_segments = Math.floor(l / CM_PER_SEGMENT);

  for (i = 0; i < num_segments; i++) {
    // interpolate around the arc
    var fraction = (i * 1.0) / (num_segments * 1.0);
    var angle3 = (sweep * fraction) + angle1;

    // find the intermediate position
    var nx = cx + Math.cos(angle3) * radius;
    var ny = cy + Math.sin(angle3) * radius;

    // make a line to that intermediate position
    retval.push({x: nx, y: ny});
  }

  // one last line hit the end
  retval.push({x: x, y: y});
  return retval;
}

function parseGcode(data) {
  var enc = new TextDecoder("utf-8");
  var s = enc.decode(data);

  var waypoints = [];
  var lines = s.split(/\r?\n/);

  lines.forEach(function(line) {
    var re = /^(G0[01]) X([\d\.]+) Y([\d\.]+)/;
    var m = re.exec(line);
    if (m != null) {
      var x = parseFloat(m[2]);
      var y = parseFloat(m[3]);
      waypoints.push({x: x, y: y});
    }

    var re2 = /^(G0[23]) X([-\d\.]+) Y([-\d\.]+) (Z[-\d\.]+)? I([-\d\.]+) J([-\d\.]+)/;
    m = re2.exec(line);
    if (m != null) {
      if (waypoints.length == 0) {
        console.log('Warning! Unable to execute G02/G03 without known previous position.');
        console.log(line);
        return;
      }
      var last = waypoints[waypoints.length-1];
      var x = parseFloat(m[2]);
      var y = parseFloat(m[3]);
      var i = parseFloat(m[5]);
      var j = parseFloat(m[6]);
      var cw = false;
      if (m[1] == 'G03') {
        // Docs say that G02 is clockwise, but maybe my math is wrong
        //(or I'm flipped around in the y-axis) since G03 needs to
        // be CW for this to work.
        cw = true;
      }

      curve = doArc(last.x, last.y, x, y, last.x+i, last.y+j, cw);
      curve.forEach(function(pt) {
        waypoints.push(pt);
      });
    }
  });

  // Remove final (0, 0) added by Inkscape Gcode plugin.
  if (waypoints.length > 0 &&
      waypoints[waypoints.length-1].x == 0 &&
      waypoints[waypoints.length-1].y == 0) {
    waypoints.pop();
  }

  return waypoints;
}

function scaleToBbox(pts, bbox) {
  // Find min and max ranges.
  var minx = pts.reduce(function(prev, curr) {
    return prev.x < curr.x ? prev : curr;
  });
  var maxx = pts.reduce(function(prev, curr) {
    return prev.x > curr.x ? prev : curr;
  });
  var miny = pts.reduce(function(prev, curr) {
    return prev.y < curr.y ? prev : curr;
  });
  var maxy = pts.reduce(function(prev, curr) {
    return prev.y > curr.y ? prev : curr;
  });
  console.log('minx ' + minx.x);
  console.log('maxx ' + maxx.x);
  console.log('miny ' + miny.y);
  console.log('maxy ' + maxy.y);
  var dx = maxx.x - minx.x;
  var dy = maxy.y - miny.y;
  console.log('dx ' + dx + ' dy ' + dy);
  x_y_ratio = bbox.width/bbox.height;
  // Scale longest axis (in proportion to bbox size) to fit.
  var scale;
  if ((dx/x_y_ratio) > dy) {
    scale = bbox.width / dx;
  } else {
    scale = bbox.height / dy;
  }
  console.log('scale ' + scale);

  var ret = [];
  pts.forEach(function(pt) {
    var tx = (pt.x - minx.x) * scale;
    var ty = (pt.y - miny.y) * scale;
    ret.push({x: tx, y: ty});
  });

  return ret;
}

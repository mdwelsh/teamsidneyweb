// Simple GCode parser.

function atan3(dy, dx) {
  var a = Math.atan2(dy, dx);
  if (a < 0) {
    a = (Math.PI * 2.0) + a;
  }
  return a;
}

// Precision of arcs in centimeters per segment.
const CM_PER_SEGMENT = 5;

// Adapted from:
//  https://www.marginallyclever.com/2014/03/how-to-improve-the-2-axis-cnc-gcode-interpreter-to-understand-arcs/
function doArc(posx, posy, x, y, cx, cy, cw) {
  var retval = [];
  var dx = posx - cx;
  var dy = posy - cy;
  var radius = Math.sqrt((dx * dx) + (dy * dy));

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

  //console.log(`doArc: posx ${posx} posy ${posy} x ${x} y ${y} cx ${cx} cy ${cy} cw ${cw}`);
  //console.log(`doArc: dx ${dx} dy ${dy} radius ${radius} angle1 ${angle1} angle2 ${angle2} sweep ${sweep}`);
  //console.log(`doArc: l ${l} num_segments ${num_segments}`);

  for (i = 0; i < num_segments; i++) {
    // interpolate around the arc
    var fraction = (i * 1.0) / (num_segments * 1.0);
    var angle3 = (sweep * fraction) + angle1;

    // find the intermediate position
    var nx = cx + Math.cos(angle3) * radius;
    var ny = cy + Math.sin(angle3) * radius;

    // make a line to that intermediate position
    retval.push({ x: nx, y: ny });
  }

  // one last line hit the end
  retval.push({ x: x, y: y });
  return retval;
}

// Parse the given gCode document, returning a list of (x, y) waypoints.
function parseGcode(data) {
  var waypoints = [];
  var lines = data.split(/\r?\n/);
  var lastpoint = { x: null, y: null };

  lines.forEach(function (line) {
    var re = /^(G0[01]) X([\d\.]+) Y([\d\.]+)/;
    var m = re.exec(line);
    if (m != null) {
      var x = parseFloat(m[2]);
      var y = parseFloat(m[3]);
      var pt = { x: x, y: y };
      if (pt.x != lastpoint.x || pt.y != lastpoint.y) {
        waypoints.push(pt);
        lastpoint = pt;
      }
    }

    var re2 = /^(G0[23]) X([-\d\.]+) Y([-\d\.]+) (Z[-\d\.]+)? I([-\d\.]+) J([-\d\.]+)/;
    m = re2.exec(line);
    if (m != null) {
      if (waypoints.length == 0) {
        console.log('Warning! Unable to execute G02/G03 without known previous position.');
        console.log(line);
        return;
      }
      var last = waypoints[waypoints.length - 1];
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

      curve = doArc(last.x, last.y, x, y, last.x + i, last.y + j, cw);
      curve.forEach(function (pt) {
        if (pt.x != lastpoint.x || pt.y != lastpoint.y) {
          waypoints.push(pt);
          lastpoint = pt;
        }
      });
    }
  });

  // Remove final (0, 0) added by Inkscape Gcode plugin.
  if (waypoints.length > 0 &&
    waypoints[waypoints.length - 1].x == 0 &&
    waypoints[waypoints.length - 1].y == 0) {
    waypoints.pop();
  }

  return waypoints;
}

// Scale the given list of (x, y) points to fit within the given bounding box.
function scaleToBbox(pts, bbox) {
  // Find min and max ranges.
  var minx = pts.reduce(function (prev, curr) {
    return prev.x < curr.x ? prev : curr;
  });
  var maxx = pts.reduce(function (prev, curr) {
    return prev.x > curr.x ? prev : curr;
  });
  var miny = pts.reduce(function (prev, curr) {
    return prev.y < curr.y ? prev : curr;
  });
  var maxy = pts.reduce(function (prev, curr) {
    return prev.y > curr.y ? prev : curr;
  });
  var dx = maxx.x - minx.x;
  var dy = maxy.y - miny.y;
  x_y_ratio = bbox.width / bbox.height;
  // Scale longest axis (in proportion to bbox size) to fit.
  var scale;
  if ((dx / x_y_ratio) > dy) {
    scale = bbox.width / dx;
  } else {
    scale = bbox.height / dy;
  }

  var ret = [];
  pts.forEach(function (pt) {
    var tx = (pt.x - minx.x) * scale;
    var ty = (pt.y - miny.y) * scale;
    ret.push({ x: tx, y: ty });
  });

  return ret;
}

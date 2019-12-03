/* Code to generate gCode from images. */

// Width and height of the raster surface in "pixels".
const RASTER_WIDTH = 300;
const RASTER_HEIGHT = 200;
// Aspect ratio of the raster surface.
const RASTER_RATIO = (RASTER_WIDTH * 1.0) / (RASTER_HEIGHT * 1.0);


// Return the luminance value for the given pixel within the ImageData object.
function getPixelLuminance(imgData, x, y) {
    var pixelOffset = (((imgData.height - (y + 1)) * imgData.width) + x) * 4;
    var red = imgData.data[pixelOffset];
    var green = imgData.data[pixelOffset + 1];
    var blue = imgData.data[pixelOffset + 2];
    var luminance = (0.2126 * (red / 256.0)) + (0.7152 * (green / 256.0)) + (0.0722 * (blue / 256.0));
    return 1.0 - luminance;
}


// Generate gCode for the image at the given URL.
function rasterImage(url, brightness = 50) {
    return new Promise((resolve, reject) => {
        var canvasEl = $('<canvas/>');
        $('#offscreenDebug').empty();           // Debugging only.
        $('#offscreenDebug').append(canvasEl);  // Debugging only.
        var canvas = canvasEl.get(0);
        var ctx = canvas.getContext('2d');
        var img = new Image;
        var scale;
        img.onload = function () {
            console.log(`rasterImage: image is ${img.width}x${img.height}`);

            // Scale the image so that it matches the pixel dimensions
            // of the raster surface.
            if ((img.width / RASTER_WIDTH) > img.height) {
                scale = RASTER_WIDTH / img.width;
            } else {
                scale = RASTER_HEIGHT / img.height;
            }
            console.log(`rasterImage: scale is ${scale}`);

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Debugging only.
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);

            rasterCanvas(canvas, brightness, scale, scale).then((gcode) => {
                resolve(gcode);
            });
        }
        img.src = url;
    });
}


// Take the given canvas and return Gcode for its contents.
function rasterCanvas(canvas, brightness, scaleX, scaleY) {
    return new Promise((resolve, reject) => {
        Filtrr2($(canvas), function () {
            console.log(`rasterCanvas: canvas is ${canvas.width}x${canvas.height}`);
            this.brighten(brightness);
            this.render(function () {
                var gcode = "% Raster generated from file\n";
                var ctx = canvas.getContext('2d');
                var width = Math.min(canvas.width * scaleX, RASTER_WIDTH);
                var height = Math.min(canvas.height * scaleY, RASTER_HEIGHT);
                console.log(`rasterCanvas: width ${width} height ${height}`);
                var imgData = ctx.getImageData(0, 0, width, height);
                console.log(`rasterCanvas: image data is ${imgData.width}x${imgData.height}`);
                for (y = 0; y < height; y += 2) {
                    for (x = 0; x < width; x++) {
                        var offset = getPixelLuminance(imgData, x, y) * 4.0;
                        gcode += "G00 X" + x + " Y" + y + "\n";
                        gcode += "G00 X" + x + " Y" + (y + offset) + "\n";
                        gcode += "G00 X" + x + " Y" + y + "\n";
                    }
                    y += 1;
                    for (x = width - 1; x >= 0; x--) {
                        var offset = getPixelLuminance(imgData, x, y) * 4.0;
                        gcode += "G00 X" + x + " Y" + y + "\n";
                        gcode += "G00 X" + x + " Y" + (y + offset) + "\n";
                        gcode += "G00 X" + x + " Y" + y + "\n";
                    }
                }
                resolve(gcode);
            });
        }, options = { store: false });
        // store: false is important here -- without it, Filtrr2 is trying
        // to be too smart and caches the previous instance.
    });
}
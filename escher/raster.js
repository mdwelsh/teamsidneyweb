/* Code to generate gCode from images. */

// Width and height of the raster surface in "pixels".
const RASTER_WIDTH = 300;
const RASTER_HEIGHT = 200;

function getPixelLuminance(imgData, x, y) {
    var pixelOffset = (((imgData.height - (y + 1)) * imgData.width) + x) * 4;
    var red = imgData.data[pixelOffset];
    var green = imgData.data[pixelOffset + 1];
    var blue = imgData.data[pixelOffset + 2];
    var luminance = (0.2126 * (red / 256.0)) + (0.7152 * (green / 256.0)) + (0.0722 * (blue / 256.0));
    return 1.0 - luminance;
}

function rasterImage(canvas, image, file) {
    Caman(canvas, function () {
        this.brightness(50);
        this.render();
        var ctx2 = this.canvas.getContext('2d');
        var imgData2 = ctx2.getImageData(0, 0, RASTER_WIDTH, RASTER_HEIGHT);
        this.reloadCanvasData();
        console.log("MDW: 0,0 is: " + getPixelLuminance(imgData2, 0, 0));
    });

    var gcode = "% Raster generated from " + file.name + "\n";
    var ctx = canvas.getContext('2d');
    var imgData = ctx.getImageData(0, 0, RASTER_WIDTH, RASTER_HEIGHT);
    console.log("MDW OUTSIDE: 0,0 is: " + getPixelLuminance(imgData, 0, 0));

    for (y = 0; y < RASTER_HEIGHT; y += 2) {
        for (x = 0; x < RASTER_WIDTH; x++) {
            var offset = getPixelLuminance(imgData, x, y) * 4.0;
            gcode += "G00 X" + x + " Y" + y + "\n";
            gcode += "G00 X" + x + " Y" + (y + offset) + "\n";
            gcode += "G00 X" + x + " Y" + y + "\n";
        }
        y += 1;
        for (x = RASTER_WIDTH - 1; x >= 0; x--) {
            var offset = getPixelLuminance(imgData, x, y) * 4.0;
            gcode += "G00 X" + x + " Y" + y + "\n";
            gcode += "G00 X" + x + " Y" + (y + offset) + "\n";
            gcode += "G00 X" + x + " Y" + y + "\n";
        }
    }
    return gcode;
}
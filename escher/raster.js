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
function rasterImage(url, brightness = 50, offsetLeft=0, offsetBottom=0, zoomLevel=1.0) {
    return new Promise((resolve, reject) => {
        var canvasEl = $('<canvas/>');
        var canvas = canvasEl.get(0);

        // The canvas is always the size of the raster surface.
        canvas.width = RASTER_WIDTH;
        canvas.height = RASTER_HEIGHT;

        var ctx = canvas.getContext('2d');
        // This is a little bit of a hack. By making the background of
        // the canvas white, any region selected by the user off of the
        // original image will be drawn with flat lines, but still rastered.
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var img = new Image;
        var scale, destWidth, destHeight, offsetX, offsetY;
        img.onload = function () {
            // Scale is the size at which we need to grow or shrink the
            // image so it will fit on the raster surface.
            if ((img.width / RASTER_WIDTH) > img.height) {
                // Image is wider than it is tall.
                scale = RASTER_WIDTH / img.width;
                destWidth = RASTER_WIDTH * zoomLevel;
                destHeight = img.height * scale * zoomLevel;
                offsetX = 0;
                offsetY = (RASTER_HEIGHT - (scale * img.height)) / 2;


            } else {
                // Image is taller than it is wide.
                scale = RASTER_HEIGHT / img.height;
                destWidth = img.width * scale * zoomLevel;
                destHeight = RASTER_HEIGHT * zoomLevel;
                offsetX = (RASTER_WIDTH - (scale * img.width)) / 2;
                offsetY = 0;
            }

            // Draw the image on the canvas.
            ctx.drawImage(img, 0, 0, img.width, img.height, offsetLeft+offsetX, -offsetBottom+offsetY, destWidth, destHeight);

            rasterCanvas(canvas, brightness).then((gcode) => {
                resolve(gcode);
            });
        }
        // Allow cross-origin fetch of the image URL from Firebase.
        img.setAttribute('crossOrigin', '');
        img.src = url;
    });
}


// Take the given canvas and return Gcode for its contents.
function rasterCanvas(canvas, brightness) {
    return new Promise((resolve, reject) => {
        Filtrr2($(canvas), function () {
            this.brighten(brightness);
            this.render(function () {
                var originX = 0;
                var originY = 0;
                var width = canvas.width;
                var height = canvas.height;

                var gcode = "% Raster generated from file\n";
                var ctx = canvas.getContext('2d');

                // Get the image data back from the canvas in raw pixel form.
                var imgData = ctx.getImageData(originX, originY, width, height);

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
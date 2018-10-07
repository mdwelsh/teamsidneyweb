# Blinky - The Cloud-Controlled LED Light Display

{:.center}
![Blinky GIF](/blinky.gif){:height="300px"}
![Blinky hardware](/blinky-hardware.jpg){:height="300px"}

Blinky is a cloud-controlled, programmable home light display based on
the amazing [Feather HUZZAH32](https://www.adafruit.com/product/3405)
developer board and [DotStar LED strips](https://www.adafruit.com/product/2241),
both from Adafruit.

* [Blinky web interface](http://blinky.site/)
* [Web controller source code on Github](https://github.com/mdwelsh/blinky)
* [Feather firmware source code on Github](https://github.com/mdwelsh/sidney-projects/tree/master/arduino/Blinky)
* [Gerber file for DotStar Feather Wing](https://github.com/mdwelsh/sidney-projects/tree/master/arduino/hw/dotstar-feather-wing)

## Hardware

For this project, you will need:

* A [Feather HUZZAH32](https://www.adafruit.com/product/3405)
* A [DotStar LED strip](https://www.adafruit.com/product/2241)
* Some way to connect the Feather to the DotStar. For this, we built a
  custom PCB, which can be connected to the Feather, and brings out a
  four-pin header which can be connected to the DotStar. This is not
  strictly needed if you are comfortable connecting wires from the
  Feather to the DotStar directly, or want to use a breadboard.
* A power source. We use a USB wall charger capable of delivering 2.4A
  per port, [such as this
  one](https://www.amazon.com/gp/product/B00P936188/ref=oh_aui_detailpage_o06_s00?ie=UTF8&psc=1).
  A regular phone charger will do, as long as it can deliver enough
  current to the Feather and LED strip.

We have found this setup works fine using 3.3V signals from the
Feather to the DotStar (although technically the DotStar requires 5V).

## Software design

This project relies heavily on [Google
Firebase](http://firebase.google.com) to synchronize the Feathers and
the web interface. Indeed, with this setup you do not need to run a web
server of your own -- the Feathers fetch their configuration directly from
the Firebase cloud servers. The web interface can be hosted anywhere
that serves up static web pages -- such as GitHub Pages -- since it
does not store any state on the web server itself, nor does it require
server-side scripting.

The web interface has JavaScript code to write the configuration for
each Feather board to a Firebase database. Each Feather board
periodically reads its configuration from Firebase using the Firebase
REST API, and uses this information to animate a pattern on the LED
strip.

In this setup, write access to the Firebase database is limited to
certain users (which can be configured in the Firebase console), so
only certain authenticated users can change the device configs.
However, read access is global, so that the Feather devices need not
use auth credentials. (It is likely possible to achieve this using
OAuth, but I am being lazy.)

## Firmware

The device firmware is an Arduino sketch
([Blinky.ino](https://github.com/mdwelsh/sidney-projects/tree/master/arduino/Blinky))
that uses the Adadfruit DotStar library as well as the Feather
HUZZAH32 built-in WiFi and HTTP client libraries. 

To run the code on your own devices, you need to configure several
things in the code:
* The SSID and password for the WiFi network the Feathers should
  connect to
* The URL of the Firebase project to use
* The data and clock pins used by the DotStar strips on the Feather
* The number of LEDs on the strip connected to the Feather

After editing these lines in `Blinky.ino` you can program the Feather
and connect the DotStar strip. When the device powers on, it will
sweep through red, green, and blue patterns on the LED strip to test
that the hardware is working. It will then periodically (every 10
seconds) call into Firebase to fetch the config it should be using.
If no config is available, the LED strip will turn off.

The sketch writes a lot of useful debug information to the serial
port, so use the serial monitor if things do not seem to be working.

## Web interface

The web interface uses the Firebase JS API to read and write data to
Firebase. To use this with your own project, you need to edit the code
([found here](https://github.com/mdwelsh/blinky)) to change the name of
the Firebase project and authentication token in the code. You will
first need to set up Firebase (the basic tier is free) and configure
the authorized users for your Firebase project in the Firebase console.

The web interface first presents a login button which triggers the
Firebase authentication flow. Once the user is logged in, it
registers to receive updates from the Firebase database for several
data types:
* `checkin` is a record written by each Feather device using the
  device's WiFi MAC address (which we assume is a good hardware
  identifier) as a key. The checkin record contains the device's
  current IP address on the local network and the timestamp at which
  the checkin was written. (This is accomplished using a bit of
  Firebase magic to cause the current **server** timestamp to be
  written with the database record.)
* `strips` is the configuration for each strip set by the
  administrator. It is also keyed by device MAC address and contains
  several fields, e.g., the current mode, color, brightness, speed,
  and so forth.
* `log` is an informational log of changes made to the strip
  configurations via the web interface, to leave breadcrumbs in case
  spouses, children, or roommates have the habit of modifying the
  device configs under you :-)

Ediing the config for the strip writes a corresponding record to the
`strips` database, which the Feather will periodically poll and
receive.

The local IP address is currently unused, but in the future we may add
the ability to synchronize over the local LAN (e.g., to make immediate
changes to the strip config without waiting for the next polling
interval).


---
title: Our projects
---
Check out some of Team Sidney Enterprises' projects below.

# Mechanical keyboard with laser-cut case

I built this keyboard around the kbdfans.com KBD75 PCB, using Kailh Box White switches. The case is my own design,
laser cut using walnut, maple, and acrylic. It's very clicky.

[![Mechanical keyboard](/images/keyboard.jpg){:height="300px"}](/images/keyboard.jpg)

# Escher - The World's First Cloud-Controlled Etch-a-Sketch

{:.center}
[![Escher](/images/escher.jpg){:height="300px"}](/images/escher.jpg)
[![Escher Web UI](/images/escher-web.png){:height="300px"}](/images/escher-web.png)

Escher is an Arduino-controlled robotic Etch-a-Sketch that uses [Google Firebase](https://firebase.google.com/)
to allow it to be controlled from anywhere in the world, using a web-based UI.

* [Blog post](https://medium.com/@mdwdotla/escher-the-worlds-first-cloud-controlled-etch-a-sketch-f2d5b7f1bd44)
* [Arduino source code](https://github.com/mdwelsh/teamsidney/tree/master/arduino/Escher/Escher)
* [Web UI source code](https://github.com/mdwelsh/teamsidneyweb/tree/master/escher)
* [3D printed part designs](https://www.thingiverse.com/thing:4040686)
* [Power board schematics and Gerber files](https://github.com/mdwelsh/teamsidney/tree/master/arduino/Escher/hardware)

# Theosaber

{:.center}
[![Theosaber](/images/theosaber.jpg){:height="300px"}](/images/theosaber.jpg)
[![Theo and Luke](/images/theosaber-theo.jpg){:height="300px"}](/images/theosaber-theo.jpg)

Theo's Halloween costume for 2019 was to be Luke Skywalker from Return of the Jedi, so naturally, he needed a lightsaber. We designed and built this lightsaber, using a custom 3D printed handle, [Luxeon Rebel LED module](https://www.luxeonstar.com/any-3-rebel-leds-mounted-on-a-20mm-tri-star-sinkpad), and a plexiglass acrylic tube for the blade. 

* [STL files and build instructions](https://www.thingiverse.com/thing:3952536)

# Space Invaders Costume

{:.center}
[![Space Invaders Costume](/images/spaceinvaders-costume.jpg){:height="300px"}](/images/spaceinvaders-costume.jpg)
[![Matt in the Space Invaders Costume](/images/spaceinvaders-mdw.jpg){:height="300px"}](/images/spaceinvaders-mdw.jpg)

For Halloween 2019, Matt wanted to recreate one of his favorite video games of all time -- Space Invaders. This is a
wearable Space Invaders cabinet made out of foamcore board, using custom 3D printed brackets (designed by Sidney!) to connect the panels together. Two [DotStar LED strips](https://www.adafruit.com/product/2241) are attached to the side of the screen, programmed using a variant of [Blinky](blinky) to light up in various patterns. 3D printed Space Invaders figures dangle over the screen. The panels are decorated with vintage Space Invaders graphics printed onto [laser-printable chemical labels](https://www.amazon.com/gp/product/B010Q6CY38/), carefully overlapped onto the foamcore. [Arcade joystick and buttons](https://www.amazon.com/gp/product/B07JFXQSM5) are on the control panel, although they are not functional. The coin slots are torn out of [vintage coin slot keychains](https://www.amazon.com/gp/product/B07BLQ72GB/) with a custom circuit to light them.

# T.I.C.A.L.S.

{:.center}
[![T.I.C.A.L.S.](/images/ticals.jpg){:height="200px"}](/images/ticals.jpg)
[![T.I.C.A.L.S. circuit board](/images/ticals-board.jpg){:height="200px"}](/images/ticals-board.jpg)
[![Sidney at the science fair](/images/ticals-sidney.jpg){:height="200px"}](/images/ticals-sidney.jpg)

T.I.C.A.L.S. (The Interesting and Completely Awesome Laser System) is a security system for Sidney's door based on a laser break-beam sensor and a [NeoTrellis M4 board](https://www.adafruit.com/product/3938) running CircuitPython. Sidney built this for his fourth-grade science fair project. A custom circuit board is used to route power from a USB charger to both the Trellis and the laser diode. A photoresistor mounted on the opposite side of the door detects whether the laser beam has been broken. When this happens, an audible alarm sounds. A security code can be entered on the Trellis keypad to disarm the alarm.

# Blinky

{:.center}
[![Blinky GIF](/images/blinky-house.gif){:width="40%"}](/images/blinky-house.gif)

Blinky is a cloud-controlled, programmable home light display based on
the amazing [Feather HUZZAH32](https://www.adafruit.com/product/3405)
developer board and [DotStar LED strips](https://www.adafruit.com/product/2241),
both from Adafruit.

* [More information, source code, and hardware designs](blinky)

# Infinitube

{:.center}
[![Infinitube GIF](/images/infinitube.gif){:width="40%"}](/images/infinitube.gif)

Infinitube is a web-based "infinite faller" game implemented using
the [Phaser.io](http://phaser.io/) JS framework, with assets sourced
from [Open Game Art](https://opengameart.org/).

* [Play Infinitube online](http://infinitube.rocks/)
* [Source code on Github](https://github.com/mdwelsh/infinitube) 

# Minecraft lamp

{:.center}
[![Minecraft Lamp](/images/minecraft-lamp.jpg){:height="300px"}](/images/minecraft-lamp.jpg)
[![Minecraft Lamp PCB](/images/minecraft-lamp-pcb.jpg){:height="300px"}](/images/minecraft-lamp-pcb.jpg)

This lamp is based on a design from [John Baichtal](https://www.oreilly.com/pub/au/4988),
author of [Minecraft for Makers](http://shop.oreilly.com/product/0636920115298.do). It
is a laser-cut plywood box, spraypainted with laser-cut templates. Inside is an RGB LED,
controlled by a nearby control box containing an Arduino with a custom PCB shield and two
pots: one to control the brightness, and another to control the speed of the color
changing effect.

* [Arduino code on Github](https://github.com/mdwelsh/sidney-projects/tree/master/arduino/PotFader)
* [PCB and case designs](https://github.com/mdwelsh/sidney-projects/tree/master/arduino/hw/minecraft-lamp)

# Laser-cut Acrylic LED lamp

{:.center}
[![Theo Lamp](/images/theo-lamp.jpg){:width="40%"}](/images/theo-lamp.jpg)

This was our quickest project -- one day! It is a laser-cut wood base
containing an [RGB LED
strip](https://www.amazon.com/gp/product/B01I1BVIQ4/ref=oh_aui_search_detailpage?ie=UTF8&psc=1)
with a remote control. A laser-etched acrylic sheet sits atop the base
and is lit from below.

# Raspberry Pi Day/Night Clock

{:.center}
[![Theo clock GIF](/images/theo-clock.gif){:width="40%"}](/images/theo-clock.gif)

This is a clock based on a Raspberry Pi mated with a [Pimoroni Unicorn
HAT HD](https://www.adafruit.com/product/3580) 16x16 RGB LED display.
It shows different images depending on the time of day, to help
Sidney's little brother know when he's allowed to get out of bed in
the morning.

* [Python source code on Github](https://github.com/mdwelsh/sidney-projects/tree/master/pi/theoclock)



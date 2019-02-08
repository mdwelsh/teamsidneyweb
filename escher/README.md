## TODO:

* Add text box to change file name before uploading
* Populate file list from database

## Thinking about approach to device selection:

My ultimate goal is to be able to distribute these kits so that anyone
can build one of these themselves. Ideally they should be able to do
this without having to set up Firebase for themselves.

Would be nice if we could eventually use the same approach for Blinky,
so we can distribute Blinky kits without asking folks to set up their
own Firebase configuration.

Idea:

- Anybody with a Google (or FB, Twitter, etc.) account can register on
  teamsidney.com/escher
- A user's Gcode files belong to them. Only accessible to that user.
- (Sharing Gcode between users on the website would be cool, but let's
  not do that yet.)
- Escher devices need to be associated with a given user ID. How?

One approach:
- Escher device is initially set up with its own WiFi AP:

https://github.com/espressif/arduino-esp32/blob/master/libraries/WiFi/examples/WiFiAccessPoint/WiFiAccessPoint.ino

- For initial configuration, user connects to that AP, goes to a
  well-known URL on the device, and plugs in the "real" WiFi
  SSID/password. This is stored to flash.

- When device reboots, it joins that AP (reading configuration from flash),
  goes onto the Internet, and pulls down latest firmware for Escher.
  Reboots itself into that.

  - This means the Escher binary also needs to read WiFi set up from flash.

- This bootstrapping binary also has support for clearing out the
  config from flash so the user can wipe a device and start over.

- I maintain the latest firmware image and configuration, so all
  devices in the world get a firmware update automatically.

- Is there a way to also plug in a user token of some kind so that the
  Escher device ends up being able to authenticate at the Gmail
  account of the user?

  - If not, we can have the Escher device generate a random token and
    store it to Firebase, and show that token to the user on the local
    WiFi AP during initial setup.

  - After the device has been configured and is on the Internet, the
    user can go to teamsidney.com/escher and plug in that token to
    "claim" the device as their own.

- Device checks in periodically and stores its last checkin time,
  firmware version, status, etc. to Firebase.

  - This would possibly require a dynamic rule to give a certain user
    ID permission to read the part of the database associated with
    device tokens that they own. 

  - Alternately might need a Cloud Function running server-side to
    translate the token into a database write associated with a key
    owned by a given user. Need to think about this.

- To print: Two options.

  1. Store record in Firebase (associated with device token) telling
     it which file to print, URL of file location, etc. Device polls
     this to initiate printing job. Problem: High latency due to
     polling.

  2. Web page directy talks to device using its IP address -- assuming
     they are on the same network. Requires a server on the device to
     listen for incoming connections. Problem: Higher complexity,
     more finicky if the device isn't on the same LAN as the client.

     https://github.com/espressif/arduino-esp32/blob/master/libraries/WiFi/examples/SimpleWiFiServer/SimpleWiFiServer.ino


## Can I use BLE for direct communication to the device?

https://github.com/nkolban/ESP32_BLE_Arduino/blob/b232e7f5f0e87f36afbc2f4e03a2c49c48dd47bc/examples/BLE_server/BLE_server.ino

This creates a BLE server on the ESP32 that I can read via a "Custom
Service" which provides a value of "Hello World says Neil"

What I need to figure out is whether Chrome's Web Bluetooth support
can even access this, and then how to use it.

This doesn't seem to work from Chrome on my phone or my Mac (maybe I
am doing something wrong).

Since the simple WiFi server is easy enough that seems like a better
approach.

## Questions to resolve:

* Can I have the ESP32 devices authenticate to Firebase as an existing
  user?

* How to use the Firestore REST API? https://firebase.google.com/docs/firestore/use-rest-api

* Can the webpage on teamsidney.com issue XHR requests to the local
  device using its IP address? (Does SOP or anything prevent this?)

* How to store configuration data in flash (for bootstrapping)

## Using REST API

https://firebase.google.com/docs/firestore/use-rest-api

This seems pretty straightforward.

First we need the web page to get a Firebase ID token for the user:

firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
  // Send token to your backend via HTTPS
  // ...
}).catch(function(error) {
  // Handle error
});

Then we send this to the Feather which issues a REST request:

curl -v -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImIyZTQ2MGZmM2EzZDQ2ZGZlYzcyNGQ4NDg0ZjczNDc2YzEzZTIwY2YiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vdGVhbS1zaWRuZXkiLCJuYW1lIjoiTWF0dCBXZWxzaCIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLUJpT0NxTFFVNkE4L0FBQUFBQUFBQUFJL0FBQUFBQUFCZm1BL0VyNzFYa1RueWQwL3M5Ni1jL3Bob3RvLmpwZyIsImF1ZCI6InRlYW0tc2lkbmV5IiwiYXV0aF90aW1lIjoxNTQ5NDI2MDgwLCJ1c2VyX2lkIjoiNEVDeTl3eWJGcmgzUEZKbnl3dTBSY2dYcktHMiIsInN1YiI6IjRFQ3k5d3liRnJoM1BGSm55d3UwUmNnWHJLRzIiLCJpYXQiOjE1NDk2NTMwNzksImV4cCI6MTU0OTY1NjY3OSwiZW1haWwiOiJtZHdAbWR3LmxhIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMTYxMjI4MjU5MTU1Mjc4MjE1NDEiXSwiZW1haWwiOlsibWR3QG1kdy5sYSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.fyG3QrFQD-g5fnF_JN52Fv476_0FSpiZtX5AyedwkXS1NmxDDbxC_nI4zmVX5VK63Upc159GzjmX1gDVCaHi2htr9vFc4-5Lr4YOzaR5atyYxnaPoolvpMi25LjOHJ21k19kYGo5Z8aY3YtreCwHtkUQsMHSaiZSEJXj5f4e3NqXehJjpi8E9Izd4hgyWAAr5tsbRKYnfgWAh27st2iUs54B16cZidnRkjIY2MqZqOMMpLrESk82JEnOysLGaymcPHDEKPsjeT2jieF2X2JzlKgnK4FOk2YT4xvHJR6FhLmoKfpSyqis2djZCp8oHViUNPnoGuSa6E4L6K4d-dfTew" 'https://firestore.googleapis.com/v1/projects/team-sidney/databases/(default)/documents/escher/root/gcode'

This returns a JSON-encoded object with an array "documents" containing the contents of all of the documents:

{
  "documents": [
    {
      "name": "projects/team-sidney/databases/(default)/documents/escher/root/gcode/MuAzsWDNVw4rXFNTlBma",
      "fields": {
        "filename": {
          "stringValue": "output_0003.ngc"
        },
        "dateUploaded": {
          "timestampValue": "2019-02-08T03:15:38.404Z"
        },
        "url": {
          "stringValue": "https://firebasestorage.googleapis.com/v0/b/team-sidney.appspot.com/o/output_0003.ngc?alt=media&token=0f0cf178-82c9-40c7-a85b-063407b3014b"
        }
      },
      "createTime": "2019-02-08T03:15:38.484917Z",
      "updateTime": "2019-02-08T03:15:38.484917Z"
    },
    {
      "name": "projects/team-sidney/databases/(default)/documents/escher/root/gcode/bAHkswDXQMVV4prdM6rh",
      "fields": {
        "dateUploaded": {
          "timestampValue": "2019-02-08T00:13:05.044Z"
        },
        "url": {
          "stringValue": "https://firebasestorage.googleapis.com/v0/b/team-sidney.appspot.com/o/theo.gcode?alt=media&token=21ec69ba-27d1-45f4-8167-886eb95907de"
        },
        "filename": {
          "stringValue": "theo.gcode"
        }
      },
      "createTime": "2019-02-08T00:13:05.164324Z",
      "updateTime": "2019-02-08T00:13:05.164324Z"
    },
    {
      "name": "projects/team-sidney/databases/(default)/documents/escher/root/gcode/yG4OEYr4Kc0oSAMQGbXI",
      "fields": {
        "dateUploaded": {
          "timestampValue": "2019-02-08T00:16:07.208Z"
        },
        "url": {
          "stringValue": "https://firebasestorage.googleapis.com/v0/b/team-sidney.appspot.com/o/merry.gcode?alt=media&token=248e2b68-d207-4896-995e-aab6dc6708c8"
        },
        "filename": {
          "stringValue": "merry.gcode"
        }
      },
      "createTime": "2019-02-08T00:16:07.379966Z",
      "updateTime": "2019-02-08T00:16:07.379966Z"
    }
  ]
}





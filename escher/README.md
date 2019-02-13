## TODO:

* Add text box to change file name before uploading
* Write Arduino-side code for etching control
* Add ping method to Arduino code so web page can check status and
  liveness of device.

## Design for device registration

Devices come preinstalled with a binary that:
1. Creates a local WiFi AP
2. Listens on a well-known port for HTTP requests

The user connects to this AP and visits, e.g., http://192.168.1.1/ to
configure the device.

This is a simple web page that allows the user to input several
parameters:

* Give the device a human-readable name
* Possibly configure the type of device this is (e.g., Escher, Blinky, etc.)
* Enter the SSID and password for the local WiFi network to use
* Enter the username and password for a Team Sidney account to use

The device stores these parameters to local flash, reboots, joins the
local WiFi network, and pulls down a new firmware binary and reboots
into it.

Once in the "real" firmware, the device uses the Firebase Auth REST
API to sign into Firebase using the username/password provided by the
user above, and obtain a Firebase Auth ID token.

The device then periodically checks into Firebase, using the ID token
obtained above, writing a record to Firebase with the key

/escher/userID/deviceID

with its name, firmware version, last checkin time, and local
IP address.

Firebase Cloud Firestore rules are configured so that only `userID`
can access records with this prefix.

When the user logs into teamsidney.com/escher with the same username
and password, they can see their own devices on the device list.
The web page can issue an XHR request directly to the device using its
local IP address to control it.

WiFi Access Point example:

https://github.com/espressif/arduino-esp32/blob/master/libraries/WiFi/examples/WiFiAccessPoint/WiFiAccessPoint.ino

Simple HTTP server:

https://github.com/espressif/arduino-esp32/blob/master/libraries/WiFi/examples/SimpleWiFiServer/SimpleWiFiServer.ino

Using Firestore REST API:

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

## How to write to Firestore from REST

Docs:

https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/createDocument

curl -v \
  -H "Content-Type: application/json" \
  --data '{ "fields": { "foo": { "stringValue": "testing 1 2 3" } } }' \
  'https://firestore.googleapis.com/v1/projects/team-sidney/databases/(default)/documents/escher/root/devices'

This works but creates a new doc every time. Let's try updating the
same one.

curl -v \
  -X PATCH \
  -H "Content-Type: application/json" \
  --data '{ "fields": { "foo": { "stringValue": "testing 1 2 4" } } }' \
  'https://firestore.googleapis.com/v1/projects/team-sidney/databases/(default)/documents/escher/root/devices/00:11:22:33:44:55'

This works! Yay.

How to set server timestamp on field when doing a write via REST?

After digging into this, I think the only way to do this is to issue
a "write" REST request which has an "update" for the fields to update,
and a "fieldTransforms" for the server timestamp field.

{
  "writes": [
    {"update":
      {"name": "projects/team-sidney/databases/(default)/documents/escher/root/gcode/enBh9Xu216kuC75mlVD4",
       "fields":{
         "filename": {"stringValue": "output_0002.ngc"},
         "url": {"stringValue": "https://firebasestorage.googleapis.com/v0/b/team-sidney.appspot.com/o/output_0002.ngc?alt=media&token=aaaa9ea3-3905-42ba-8e80-e4fa4e189414"}
       }
     }
    },
    {"transform":
      {"document": "projects/team-sidney/databases/(default)/documents/escher/root/gcode/enBh9Xu216kuC75mlVD4",
       "fieldTransforms": [
         {
          "fieldPath": "dateUploaded",
          "setToServerValue": "REQUEST_TIME"
         }
       ]
      },
      "currentDocument": {"exists":true}
    }
  ]
}

curl -v \
  -X POST \
  -H "Content-Type: application/json" \
  --data @data.json2 \
  'https://firestore.googleapis.com/v1/projects/team-sidney/databases/(default)/documents:write'

curl -v \
  -X PATCH \
  -H "Content-Type: application/json" \
  --data \
  '{"fields":{"mdwtime": {"timestampValue": {"_methodName": "FieldValue.serverTimestamp"}}}}' \
  'https://firestore.googleapis.com/v1/projects/team-sidney/databases/(default)/documents/escher/root/devices/00:11:22:33:44:55'

## Getting ESP32 WebServer to work

This is the flow when sending a short POST:

```
MDW: client connected
MDW: In HC_WAIT_READ
MDW: No data available
MDW: Calling yield
MDW: client connected
MDW: In HC_WAIT_READ
MDW: client is available
MDW: Done with _parseRequest
MDW: Calling _handleRequest
request handler not found
Server: handleNotFound called for /load
Method: POST
Number of args: 1
  arg[0] = data
START
MOVE 323 0
MOVE 224 204
MOVE 0 238
MOVE 163 395
MOVE 126 620
MOVE 327 513
MOVE 528 617
MOVE 488 393
MOVE 650 234
MOVE 425 203
MOVE 323 0
END

MDW: Done with _handleRequest
MDW: Going to HC_WAIT_CLOSE
MDW: client connected
MDW: In HC_WAIT_CLOSE
MDW: Calling yield
MDW: client connected
MDW: In HC_WAIT_CLOSE
MDW: Calling yield
MDW: client connected
MDW: In HC_WAIT_CLOSE
MDW: Calling yield
MDW: client connected
MDW: In HC_WAIT_CLOSE
MDW: Calling yield
MDW: client connected
MDW: In HC_WAIT_CLOSE
MDW: Calling yield
MDW: client connected
MDW: In HC_WAIT_CLOSE
MDW: Calling yield
MDW: client connected
MDW: In HC_WAIT_CLOSE
MDW: Calling yield
MDW: Closing current client
```

Here's what happens with a long POST:

```
New client
MDW: client connected
MDW: In HC_WAIT_READ
MDW: No data available
MDW: Calling yield
MDW: client connected
MDW: In HC_WAIT_READ
MDW: No data available  [this can repeat a lot...]
MDW: Calling yield
MDW: client connected
MDW: In HC_WAIT_READ
MDW: client is available
MDW: Closing current client
```

Basically whenever parseRequest returns false, it gives up on the
client and closes it.

Problem could be that there isn't enough buffer space to read the
whole thing all at once:

New client
MDW: client connected
MDW: In HC_WAIT_READ
MDW: No data available
MDW: I decided keepCurrentClient true and callYield true
MDW: Calling yield
MDW: client connected
MDW: In HC_WAIT_READ
MDW: client is available
MDW: Parsed headers, isForm false, contentLength 259405
MDW: Calling readBytesWithTimeout
MDW: Got 113444 / 259405 bytes   <----- This is always 113444
MDW: parseRequest returned false
MDW: Closing current client

Hmmmm. I think I need to avoid trying to blast the whole payload into
memory, since with only 512KB to work with there's a high probability
I won't be successful anyway. I should probably use the file upload
feature, write the data to flash, and then read it back from flash
while etching.

Stealing code from FSBrowser.ino, using a file upload to SPIFFS works
with large files:

curl -F "file=@tselogo.png" http://192.168.86.35/upload

The question is how to make that work from an XHR request in the
browser.

See this example:

https://github.com/New-Bamboo/example-ajax-upload/blob/master/public/index.html

This is what we get when we use

curl --trace-ascii f -F "file=@hi.txt" http://192.168.86.35/upload

```
== Info:   Trying 192.168.86.35...
== Info: TCP_NODELAY set
== Info: Connected to 192.168.86.35 (192.168.86.35) port 80 (#0)
=> Send header, 213 bytes (0xd5)
0000: POST /upload HTTP/1.1
0017: Host: 192.168.86.35
002c: User-Agent: curl/7.54.0
0045: Accept: */*
0052: Content-Length: 239
0067: Expect: 100-continue
007d: Content-Type: multipart/form-data; boundary=--------------------
00bd: ----6c82e571a4c77666
00d3: 
== Info: Done waiting for 100-continue
=> Send data, 136 bytes (0x88)
0000: --------------------------6c82e571a4c77666
002c: Content-Disposition: form-data; name="file"; filename="hi.txt"
006c: Content-Type: text/plain
0086: 
=> Send data, 55 bytes (0x37)
0000: This is a test file.I am doing it this way.Let's see...
=> Send data, 48 bytes (0x30)
0000: 
0002: --------------------------6c82e571a4c77666--
== Info: Empty reply from server
== Info: Connection #0 to host 192.168.86.35 left intact
```
































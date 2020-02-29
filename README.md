# Talk to Me

This repo contains code needed for the Talk to Me IoT device and mobile app.

cputemp: Raspberry Pi BLE server (fork of [original](https://github.com/Douglas6/cputemp))

- BLE communication with mobile app
- Runs python script on the input received

TalkToMe: React Native mobile app

- BLE communication with Raspberry Pi
- Slack polling

python: Inky display code and backend server

- [my-quotes.py](./python/my-quotes.py): write a message to the Inky display
- [app.py](./python/app.py): Flask app to receive Slack Events API events

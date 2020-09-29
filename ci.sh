#!/bin/sh
pip install -r requirements.txt
python app.py --listen-port 9099 --web-port 8089 --no-web-open-browser

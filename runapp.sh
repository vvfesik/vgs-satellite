#!/bin/sh

if [ "$VIRTUAL_ENV" = "" ]
then
    python -m venv venv
    . ./venv/bin/activate
    pip install -r requirements.txt
fi

python app.py

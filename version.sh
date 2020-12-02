#!/bin/sh

sed -n 's/^[[:blank:]]*"version":[^0-9]*\([0-9]*\.[0-9]*\.[0-9]*\)[^0-9]*/\1/p' package.json

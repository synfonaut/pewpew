#!/bin/bash

DIR="$(dirname "$(readlink -f "$0")")"

node "$DIR/bundle.js"

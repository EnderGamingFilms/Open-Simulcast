#!/bin/bash

docker build -t endergamingfilms/open-simulcast:latest -f ./Dockerfile . --no-cache --progress=auto

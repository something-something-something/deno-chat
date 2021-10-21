#!/bin/bash

openssl req -x509 -nodes -batch -newkey rsa:4096 -days 15 -keyout chat.key -out chat.pem
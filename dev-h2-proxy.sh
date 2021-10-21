#!/bin/bash

nghttpx --conf=/dev/null -b 127.0.0.1,8080 -f 127.0.0.1,8081  ./chat.key ./chat.pem
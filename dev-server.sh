#!/bin/bash
deno run --unstable --allow-read=./client.js --allow-net=0.0.0.0:8080  --watch main.tsx
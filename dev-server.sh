#!/bin/bash
deno run --unstable --allow-read=./client.js,./chat.db,./chat.db-journal --allow-write=./chat.db,./chat.db-journal --allow-net=0.0.0.0:8080  --watch main.tsx
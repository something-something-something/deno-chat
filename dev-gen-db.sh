#!/bin/bash
deno run --unstable --allow-read=./chat.db,./chat.db-journal --allow-write=./chat.db,./chat.db-journal  gen-db.ts
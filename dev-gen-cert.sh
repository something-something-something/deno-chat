#!/bin/bash

deno run --allow-write=./chat.crt,./chat.key --location 'http://example.com' gen-cert.ts
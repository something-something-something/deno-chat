# About 
still work in progress right now just getting some code working.

# Requirements
This just requires deno

# Running in Development

run the folowing: 

## First build the client code

client:

`deno bundle --watch --config deno.json client.tsx client.js`

## then run the surver

server:

`deno run --unstable --allow-read=./ --allow-net=0.0.0.0:8080  --watch main.tsx`


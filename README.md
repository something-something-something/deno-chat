# About 
still work in progress right now but it works. Mostly just trying out Deno and Typescript.
A web based chat server using server sent events. 

# Requirements
This just requires deno 1.15.2 

# Running in Development

run the folowing: 

## Set Up the databases

Set up Database:

`sh dev-gen-db.sh`

or 

`deno run --unstable --allow-read=./chat.db,./chat.db-journal --allow-write=./chat.db,./chat.db-journal  gen-db.ts`

## Next build the client code

client:

`sh dev-build.sh`

or

`deno bundle --watch --config deno.json client.tsx client.js`

## Then run the surver

server:

`sh dev-server.sh`

or 

`deno run --unstable --allow-read=./client.js,./chat.db,./chat.db-journal,./chat.crt,./chat.key --allow-write=./chat.db,./chat.db-journal --allow-net=0.0.0.0:8080,0.0.0.0:8081  --watch main.tsx`

You can log in with the username `blah` and password `myPassword` at http://127.0.0.1/login

## (Optional) Using an http2 proxy
Optionaly if `nghttpx` and `openssl` ar installed one can run 

`dev-gen-cert.sh` 

to generate a security certificate and then run 

`dev-h2-proxy`

to start the proxy


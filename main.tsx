//import { App, MyButton } from "./components.tsx";

//import {React,renderToString} from "./deps.ts";
import { DB, grantOrThrow, Row } from "./deps.ts";

import { EventStream, EventStreamTarget } from './eventStream.ts'
import { hashPassword, verifyHashedPassword, generateApiKey, getApiKeyStatus, isValidAuthRequest } from './securityUtils.ts'

import { ThreadEventData, StandardAPIRequest, MessageAddAPIRequest } from './apiInterfaces.ts';
const desc1 = { name: 'read', path: './client.js' } as const;
const desc2 = { name: 'net', host: '0.0.0.0:8080' } as const;
const desc3 = { name: 'write', path: './chat.db' } as const;
const desc4 = { name: 'read', path: './chat.db' } as const;
const desc5 = { name: 'write', path: './chat.db-journal' } as const;
const desc6 = { name: 'read', path: './chat.db-journal' } as const;
const desc7 = { name: 'read', path: './chat.crt' } as const;
const desc8 = { name: 'read', path: './chat.key' } as const;
const desc9 = { name: 'net', host: '0.0.0.0:8081' } as const;
await grantOrThrow(desc1, desc2, desc3, desc4, desc5, desc6, desc7, desc8, desc9);

const db = new DB('./chat.db', { mode: 'write' });
db.query('PRAGMA foreign_keys=ON');

//get this working
addEventListener('unload', (e) => {

	console.log('closing db');
	db.close();
	console.log('deno exits');
});

addEventListener('load', (e) => {
	console.log('loaded')
})
//Deno.exit();
//console.log(sodium.crypto_pwhash_OPSLIMIT_MODERATE)
//console.log(sodium.crypto_pwhash_MEMLIMIT_MODERATE)




// declare namespace JSX{
// 	interface IntrinsicElements{
// 		[elemName: string]: any;
// 	}
// }
class MessageTarget extends EventTarget {
	constructor() {
		super();
	}
}
let myMessageTarget = new MessageTarget();

let threadTarget = new EventStreamTarget();

let messageTarget = new EventStreamTarget();


const htmlPage = `
<!doctype html>
<html>
	<head>
	<script>
	let evs=new EventSource('/ev');
	evs.onmessage=function(ev){
	
		console.log('hi'); 
		console.log(ev);
	 };
	
	 evs.onopen=(ev)=>{
		console.log('hi'); 
		console.log(ev);
	 };
	</script>
	</head>


	<body></body>
</html>

`;



const htmlTemplate = `
<!doctype html> 
<html>
		<head>
			<script type="module" src="/client.js"></script>
		</head>
		<body>
			<div id="reactContainer"></div>
		</body>
</html>
`;


const server = Deno.listen({
	port: 8080,
});
serve(server);
// try {
// 	const serverTls = Deno.listenTls({
// 		certFile: './chat.crt',
// 		keyFile: './chat.key',
// 		port: 8081,
// 		alpnProtocols: ['h2', "http/1.1"],
// 	});
// 	serve(serverTls);
// }
// catch (e) {
// 	console.log(e)

// }
console.log("hello");
// for await (const conn of server) {

// }
// while (true) {
// 	try {


// 		let conn = await server.accept();

// 		(async () => {


// 			try{


// 			const httpConn = Deno.serveHttp(conn);
// 			while (true) {
// 				//console.log('asdsda')
// 				try {
// 					//console.log('dsaasdsa')
// 					const requestEvent = await httpConn.nextRequest();
// 					if (requestEvent !== null) {
// 						//console.log('the request is being handled')
// 						(async()=>{hanndleRequest(requestEvent)})();
// 					}else{
// 						//console.log('Null');
// 						//conn.close();

// 					}
// 				}
// 				catch (e) {
// 					console.log(e)
// 					break;
// 				}


// 			}
// }catch(e){
// 	console.log(e)
// }
// 			// try{
// 			// 	const httpConn = Deno.serveHttp(conn);
// 			// 	for await (const requestEvent of httpConn){
// 			// 		hanndleRequest(requestEvent);
// 			// 	}
// 			// }
// 			// catch(e){
// 			// 	console.log(e)
// 			// }
// 		})();

// 	}
// 	catch (e) {
// 		console.log(e)
// 		break;
// 	}
// }



async function handle(conn: Deno.Conn) {
	try {
		const httpConn = Deno.serveHttp(conn);
		for await (const requestEvent of httpConn) {
			console.log('new request')
			//console.log(requestEvent)
			if (requestEvent !== null) {
				(async () => { try { await hanndleRequest(requestEvent) } catch (e) { console.log(e) } })();

			}
			else {
				console.log('null')
			}
			console.log('done with req on main');
		}
	}
	catch (e) {
		console.log(e)
	}

}
async function serve(server: Deno.Listener) {
	for await (const conn of server) {
		console.log('new connection');
		try {
			console.log('handling conn');
			(async () => { handle(conn); })();
			console.log('ready for next connection');
		}
		catch (e) {
			console.log(e)
		}

	}
}


async function hanndleRequest(requestEvent: Deno.RequestEvent) {

	console.log("hello");
	const request = requestEvent.request;
	const url = new URL(requestEvent.request.url);
	const path = url.pathname;
	const pathParts = path.split('/').slice(1);
	if (path === "/ev") {
		console.log('event stream')
		let id = 0;
		let notifyer = (controller: ReadableStreamDefaultController) => {
			return (ev: Event) => {
				//console.log(ev);
				if (ev instanceof CustomEvent) {
					//console.log(ev.detail);

					let message = 'event:message\ndata:' + JSON.stringify(ev.detail) + '\nid: ' + id++ + '\n\n';
					controller.enqueue(new TextEncoder().encode(message));
					controller.enqueue(new TextEncoder().encode('\n\n'));
					console.log('event stream write')
				}
			};
		}
		let nf = (ev: Event) => { }
		let int = 0;

		await requestEvent.respondWith(
			new Response(
				new ReadableStream({
					start(controller) {

						int = setInterval(() => {
							controller.enqueue(new TextEncoder().encode(':\n\n'));
							console.log('event stream write')
						}, 10000)
						myMessageTarget.addEventListener("blah", nf = notifyer(controller))


					},
					cancel() {
						try {
							myMessageTarget.removeEventListener('blah', nf)
							clearInterval(int);
						}
						catch (e) {
							console.log(e)
						}
						console.log('event stream close')
					},
				}),


				{
					headers: {
						"Content-Type": "text/event-stream",
						"Connection": "Keep-Alive",
						"Cache-Control": "no-cache"
					}
					, status: 200
				}),
		).catch(() => {

			myMessageTarget.removeEventListener('blah', nf);
			clearInterval(int);
			console.log('event stream close')
		});

	}
	//api routes
	else if (pathParts.length == 2 && pathParts[0] === 'api' && pathParts[1] === 'genkey' && requestEvent.request.method === 'POST') {

		let response = new Response(JSON.stringify({
			status: 'error',
			errors: 'hello'
		}), {
			status: 401,
			headers: {
				"Content-Type": "text/json"
			}
		});
		let isvalidJSON = false;

		interface JSONRESPONSE {
			name: string;
			password: string
		}
		let validJSON: JSONRESPONSE | null = null;

		try {
			validJSON = await request.json()
			isvalidJSON = true;
		}
		catch (e) {
		}
		if (isvalidJSON && validJSON !== null) {
			console.log(validJSON)
			let posibleUsers = db.query('SELECT hashedpass,id,name FROM users WHERE name=?', [validJSON.name]);
			console.log(posibleUsers)
			if (posibleUsers.length > 0 && typeof posibleUsers[0][0] === 'string' && typeof posibleUsers[0][1] === 'number' && verifyHashedPassword(posibleUsers[0][0], validJSON.password)) {
				let key = generateApiKey();
				console.log(key)
				const uuid = crypto.randomUUID();
				db.query('INSERT INTO apikeys (userid,uuid,hashedkey) VALUES(?,?,?)', [posibleUsers[0][1], uuid, hashPassword(key)])
				response = new Response(JSON.stringify({
					status: 'success',
					data: {
						uuid: uuid,
						apikey: key
					}
				}), {
					status: 200,
					headers: {
						"Content-Type": "text/json"
					}
				})

			}

		}
		await requestEvent.respondWith(response)
	}
	else if (pathParts.length == 2 && pathParts[0] === 'api' && pathParts[1] === 'getkeyinfo' && requestEvent.request.method === 'POST') {

		let resp = new Response(JSON.stringify({
			status: 'success',
			errors: [],
			data: {
				valid: false
			}
		}), {
			status: 200,
			headers: {
				"Content-Type": "text/json"
			}
		})

		let jsonReq: boolean | object = await request.json().then((resolve) => {
			return resolve
		}, (reject) => {
			return false;
		});

		interface ValidReq {
			uuid: string;
			apikey: string;
		}
		let isValidReq = (obj: object): obj is ValidReq => {
			let uuidBool = (obj as ValidReq).uuid !== undefined && typeof (obj as ValidReq).uuid === 'string';
			let keyBool = (obj as ValidReq).apikey !== undefined && typeof (obj as ValidReq).apikey === 'string';
			return uuidBool && keyBool;
		}
		if (jsonReq !== false && typeof jsonReq === 'object') {
			if (isValidReq(jsonReq)) {
				let keyStatus = getApiKeyStatus(db, jsonReq.uuid, jsonReq.apikey);
				resp = new Response(JSON.stringify({
					status: 'success',
					errors: [],
					data: keyStatus
				}), {
					status: 200,
					headers: {
						"Content-Type": "text/json"
					}
				})
			}

		}
		console.log('apiket status')
		await requestEvent.respondWith(resp);
	}
	else if (path === '/api/sendmessage' && request.method === 'POST') {
		let authStatus = await isValidAuthRequest(db, request.clone());
		if (authStatus.valid === false) {
			return;
		}
		try {
			let reqJSON = await request.json();
			let reqData: MessageAddAPIRequest = reqJSON;
			let getThread = db.query('SELECT id,title from threads where id=?', [reqData.data.threadid]);
			if (getThread.length === 1 && typeof getThread[0][0] === 'number') {
				let time = Date.now();
				let messageInsert = db.query('INSERT INTO messages (content,authorid,threadid,timestamp) VALUES(?,?,?,?) RETURNING id', [reqData.data.content, authStatus.userid, getThread[0][0], time]);

				messageTarget.sendMessage(getThread[0][0].toString(), {
					threadid: getThread[0][0],
					messageid: messageInsert[0][0],
					content: reqData.data.content,
					userid: authStatus.userid,
					timestamp: time,
				});
				//todo notify thread

				await requestEvent.respondWith(new Response(
					JSON.stringify({
						status: 'success',
						data: {
							messageid: messageInsert[0][0]
						}
					})
					, {
						status: 200,
						headers: {
							"Content-Type": "text/json"
						}
					}))
			}
		}
		catch (e) {

		}




	}

	else if (pathParts.length == 2 && pathParts[0] === 'api' && pathParts[1] === 'createthread' && requestEvent.request.method === 'POST') {
		let authStatus = await isValidAuthRequest(db, request.clone());
		if (authStatus.valid === false) {
			await requestEvent.respondWith(new Response(JSON.stringify({
				status: 'error',
				errors: [],
				data: {
					valid: false
				}
			}), {
				status: 200,
				headers: {
					"Content-Type": "text/json"
				}
			}))

			return;

		}
		try {
			let json = await request.json();

			if ('data' in json && 'title' in json.data && typeof json.data.title === 'string' && 'message' in json.data && typeof json.data.message === 'string' && authStatus.valid === true) {
				let createdThread: Row[] = db.query('INSERT INTO threads (title,starteruserid) VALUES(?,?) RETURNING id', [json.data.title, authStatus.userid]);
				if (typeof createdThread[0][0] === 'number') {
					let createdMessage = db.query('INSERT INTO messages (content,authorid,threadid,timestamp) VALUES(?,?,?,?)', [json.data.message, authStatus.userid, createdThread[0][0], Date.now()]);

					//let threadData = db.query(`SELECT `, [createdThread[0][0]])
					// let dataToSend:ThreadEventData={


					// }
					threadTarget.sendMessage('newThread', {
						threadid: createdThread[0][0],
						title: json.data.title,
						message: json.data.message,
						creator: authStatus.userid
					})
					await requestEvent.respondWith(new Response(JSON.stringify({
						status: 'success',
						errors: [],
						data: {
							threadid: createdThread[0][0]
						}
					}), {
						status: 200,
						headers: {
							"Content-Type": "text/json"
						}
					}));
					return;
				}

			}
		}
		catch (e) {
			console.log(e)
		}
		await requestEvent.respondWith(new Response(JSON.stringify({
			status: 'error',
			errors: [],
			data: {
				valid: false
			}
		}), {
			status: 200,
			headers: {
				"Content-Type": "text/json"
			}
		}))
	}

	else if (path === '/eventstream/threads') {
		let eventStream = new EventStream([{ eventStreamTarget: threadTarget, targetType: 'newThread' }]);
		await requestEvent.respondWith(eventStream.generateResponse()).catch(() => {
			eventStream.stopBrodcast();
		})
	}
	else if (path === '/eventstream/messages') {
		//TODO check if 
		let threadid=url.searchParams.get('threadid');
		if (threadid!==null) {
			let eventStream = new EventStream([{ eventStreamTarget: messageTarget, targetType:threadid }]);
			await requestEvent.respondWith(eventStream.generateResponse()).catch(() => {
				eventStream.stopBrodcast();
			})
		}

	}
	else if (path === '/lis') {
		await requestEvent.respondWith(new Response(htmlPage, {
			headers: {
				"Content-Type": "text/html"
			}
		}))
	}
	else if (path === '/client.js') {
		const clientJS = await Deno.readFile('./client.js')
		await requestEvent.respondWith(new Response(clientJS, {
			headers: {
				"Content-Type": "text/javascript"
			}
		}));
	}
	else if (['/', '/login','/chat'].includes(path)) {
		await requestEvent.respondWith(new Response(htmlTemplate, {
			headers: {
				"Content-Type": "text/html"
			}
		}))
	}
	else {
		await requestEvent.respondWith(
			new Response(
				htmlTemplate,
				{

					headers: {
						"Content-Type": "text/html"
					},
				},
			),
		);
		let ev = new CustomEvent("blah", {
			detail: {
				some: { l: "v" },
				bar: [1, 2, ""],
				url: path
			},
		});
		myMessageTarget.dispatchEvent(ev);
	}
	console.log("goodbye");
}
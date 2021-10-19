//import { App, MyButton } from "./components.tsx";

//import {React,renderToString} from "./deps.ts";
import {DB,grantOrThrow} from "./deps.ts";
import {hashPassword,verifyHashedPassword,generateApiKey} from './securityUtils.ts'
const desc1={name:'read',path:'./client.js'} as const;
const desc2={name:'net',host:'0.0.0.0:8080'} as const;
const desc3 = { name: 'write', path: './chat.db' } as const;
const desc4 = { name: 'read', path: './chat.db' } as const;
const desc5 = { name: 'write', path: './chat.db-journal' } as const;
const desc6 = { name: 'read', path: './chat.db-journal' } as const;

await grantOrThrow(desc1, desc2, desc3, desc4,desc5,desc6);

const db = new DB('./chat.db', { mode: 'write' });
db.query('PRAGMA foreign_keys=ON');

//get this working
window.addEventListener('unload',(e)=>{
	
	console.log('closing db');
	db.close();
	console.log('deno exits');
});

window.addEventListener('load',(e)=>{
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



const htmlTemplate=`
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
console.log("hello");
for await (const conn of server) {
	(async () => {
		const httpConn = Deno.serveHttp(conn);
		for await (const requestEvent of httpConn) {
			console.log("hello");
			const request=requestEvent.request;
			const url = new URL(requestEvent.request.url);
			const path = url.pathname;
			const pathParts=path.split('/').slice(1);
			if (path === "/ev") {
				let id=0;
				let notifyer = (controller: ReadableStreamDefaultController) => {
					return (ev: Event) => {
						//console.log(ev);
						if (ev instanceof CustomEvent) {
							//console.log(ev.detail);

							let message = 'event:message\ndata:' + JSON.stringify(ev.detail) +'\nid: '+id++ +'\n\n';
							controller.enqueue(new TextEncoder().encode(message));
							controller.enqueue(new TextEncoder().encode('\n\n'));
						}
					};
				}
				let nf = (ev: Event) => { }
				let int=0;

				await requestEvent.respondWith(
					new Response(
						new ReadableStream({
							start(controller) {
								
								int=setInterval(()=>{
									controller.enqueue(new TextEncoder().encode(':\n\n'));
								},1000)
								myMessageTarget.addEventListener("blah", nf = notifyer(controller))


							},
							cancel() {
								myMessageTarget.removeEventListener('blah', nf)
								clearInterval(int);
							},
						}),
					
					
					{headers: {
						"Content-Type": "text/event-stream",
								"Connection":"Keep-Alive",
								"Cache-Control":"no-cache"
					}
				,status:200}),
				).catch(()=>{
					myMessageTarget.removeEventListener('blah', nf);
					clearInterval(int);
				});
				
			}
			//api routes
			else if(pathParts.length==2&&pathParts[0]==='api'&&pathParts[1]==='genkey'&&requestEvent.request.method==='POST'){

				let response=new Response(JSON.stringify({
					status:'error',
					errors:'hello'
				}),{
					status:401,
					headers:{
						"Content-Type": "text/json"
					}
				});
				let isvalidJSON=false;

				interface JSONRESPONSE{
					name:string;
					password:string
				}
				let validJSON:JSONRESPONSE|null=null;
				
				try{
					validJSON=await request.json()
					isvalidJSON=true;
				}
				catch(e){
				}
				if(isvalidJSON&&validJSON!==null){
					console.log(validJSON)
					let posibleUsers=db.query('SELECT hashedpass,id,name FROM users WHERE name=?',[validJSON.name]);
					console.log(posibleUsers)
					if(posibleUsers.length>0&& typeof posibleUsers[0][0]==='string'  && typeof posibleUsers[0][1]==='number' &&verifyHashedPassword(posibleUsers[0][0],validJSON.password)){
						let key=generateApiKey();
						console.log(key)
						
						db.query('INSERT INTO apikeys (userid,hashedkey) VALUES(?,?)',[ posibleUsers[0][1], hashPassword(key) ])
						response=new Response(JSON.stringify({
							status:'success',
							data:{
								apikey:key
							}
						}),{
							status:200,
							headers:{
								"Content-Type": "text/json"
							}
						})
						
					}
					
				}
				
				
				
				
				await requestEvent.respondWith(response)
			}
			else if(path==='/lis'){
				await requestEvent.respondWith(new Response(htmlPage	,{headers: {
					"Content-Type": "text/html"
				}}))
			}
			else if(path==='/client.js'){
				const clientJS=await Deno.readFile('./client.js')
				await requestEvent.respondWith(new Response(clientJS,{headers: {
					"Content-Type": "text/javascript"
				}}));
			}
			else if(['/','/login'].includes(path)){
				await requestEvent.respondWith(new Response(htmlTemplate,{headers: {
					"Content-Type": "text/html"
				}}))
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
						url:path
					},
				});
				myMessageTarget.dispatchEvent(ev);
			}
		}
	})();
}
//import { App, MyButton } from "./components.tsx";

//import {React,renderToString} from "./deps.ts";

const desc1={name:'read',path:'./client.js'} as const;
const desc2={name:'net',host:'0.0.0.0:8080'} as const;

await Deno.permissions.request(desc1);
await Deno.permissions.request(desc2);

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
			const url = new URL(requestEvent.request.url);
			const path = url.pathname;
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
			else if(path==='/'){

				
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

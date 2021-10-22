
type EventStreamListnerFunction=(ev:Event)=>any;

export class EventStream {
	public stream:ReadableStream;

	intervalKeepAlive:number=0;
	storedListners:{eventStreamTarget:EventStreamTarget,targetType:string,eventStreamListner:EventStreamListnerFunction}[];

	constructor(targets:{eventStreamTarget:EventStreamTarget,targetType:string}[]){
		let evs=this;
		this.storedListners=[];
		this.stream=new ReadableStream({
			start(controller) {

				evs.intervalKeepAlive = setInterval(() => {
					try{
						controller.enqueue(new TextEncoder().encode(':\n\n'));
					console.log('event stream write')
					}
					catch(e){
						console.log(e)
					}
					
				}, 10000)
				for(let t of targets){

					console.log(t)
					let nf:EventStreamListnerFunction=(ev: Event) => {
						try{
						console.log(ev);
						if (ev instanceof CustomEvent) {
							console.log(ev.detail);
							let message = 'event:message\ndata:' + JSON.stringify(ev.detail) + '\n\n';
							controller.enqueue(new TextEncoder().encode(message));
							controller.enqueue(new TextEncoder().encode('\n\n'));
							console.log('event stream write')
						}
					}
					catch(e){
						console.log(e)
					}
					};
					evs.storedListners.push({
						...t,
						eventStreamListner:nf
					})
					

					t.eventStreamTarget.addEventListener(t.targetType,nf)
				}
				//myMessageTarget.addEventListener("blah", nf = notifyer(controller))


			},
			cancel() {
				evs.stopBrodcast;
			},
		});
	}

	stopBrodcast(){
		try {

			for (let l of this.storedListners){
				l.eventStreamTarget.removeEventListener(l.targetType, l.eventStreamListner);
			}
					
					clearInterval(this.intervalKeepAlive);
				}
				catch (e) {
					console.log(e)
				}
				console.log('event stream close')
	}
	generateResponse(){
		return new Response(this.stream,{
			headers: {
				"Content-Type": "text/event-stream",
				"Connection": "Keep-Alive",
				"Cache-Control": "no-cache"
			}
			, status: 200
		});
	}
}

export class EventStreamTarget extends EventTarget {
	constructor() {
		super();
	}

	sendMessage(targetType:string,detail:object){
		console.log('Message sent')
		let ev = new CustomEvent(targetType, {
			detail
		});
		this.dispatchEvent(ev);
	}
}

/*
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


*/
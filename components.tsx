import { React, renderToString, useState, useEffect } from "./deps.ts"

export function App(props: { children?: JSX.Element }) {
	return (<html>
		<head>

		</head><body>
			hello world
			<p>hi</p>
			<b>blah</b>
			<b>More</b>
			<div>{props.children}</div>
		</body>
	</html>);
}

export function MyButton() {
	const [clickCount, setClickCount] = useState(0);

	return <button onClick={() => {
		setClickCount(clickCount + 1);
	}}>Times clicked!: {clickCount}</button>
}
interface MessageInterface{
	data:string;
	id:string;
}
export function EvDisplay() {
	const initArr:Array<MessageInterface>=[]
	const [messages,setMessages]=useState(initArr);
	useEffect(() => {
		let evs = new EventSource('/ev');
		evs.onmessage = function (ev:MessageEvent) {
			console.log('hi');
			console.log(ev);
			if(ev instanceof MessageEvent){

				//let arr:Array<MessageInterface>=[...messages];
				let obj={data:ev.data,id:ev.lastEventId}
				setMessages([...messages].concat([obj]))
			}
			
		};

		evs.onopen = (ev:Event) => {
			console.log('hi');
			console.log(ev);
		};
		return () => {
			evs.close();
		}
	})
	let mHTML=messages.map((el)=>{
		return <div key={el.id}>{JSON.stringify(el)}</div>
	})

	return <div>{mHTML}</div>
}
import { React, useState, useEffect } from "./client-deps.ts"

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
			console.log('opening');
			console.log(ev);
		};
		evs.onerror=()=>{
			console.log('An error occured')
		}
		return () => {
			evs.close();
		}
	})
	let mHTML=messages.map((el)=>{
		return <div key={el.id}>{JSON.stringify(el)}</div>
	})

	return <div>{mHTML}</div>
}


export function LoginForm(){
	const [name,setName]=useState('');
	const [password,setPassword]=useState('');
	return <form onSubmit={async(ev)=>{
		ev.preventDefault();
		let res=await fetch('/api/genkey',{
			method:'post',
			body:JSON.stringify({
				name:name,
				password:password,
			})
		});
		let rObj=await res.json()
		if(res.status!==200){
			alert('bad login')
		}
		else{
			alert(rObj.data.apikey);
		}
		console.log(rObj);
	}}>
		<label>name<input value={name} onChange={(ev)=>{
			setName(ev.target.value)
		}} type="text"/></label>
		<label>password<input value={password} onChange={(ev)=>{
			setPassword(ev.target.value)
		}} type="password"/></label>
		<input type="submit"/>
	</form>
}
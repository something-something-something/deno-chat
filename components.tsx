import { React, useState, useEffect } from "./client-deps.ts"
import { getAuthInfo, storeAuthInfo, removeAuthInfo } from './clientUtils.ts'
import { MessageAddAPIRequest, MessageEventData, ThreadEventData } from './apiInterfaces.ts'


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
interface MessageInterface {
	data: string;

}
export function EvDisplay() {
	const initObj: Record<string, ThreadEventData> = {}
	const [threads, setThreads] = useState(initObj);
	useEffect(() => {
		let evs = new EventSource('/eventstream/threads');
		evs.onmessage = function (ev: MessageEvent) {
			console.log('hi');
			console.log(ev);
			if (ev instanceof MessageEvent) {

				//let arr:Array<MessageInterface>=[...messages];
				let obj: ThreadEventData = JSON.parse(ev.data);
				setThreads((t) => {
					if (!(obj.id.toString() in t)) {
						let n = { ...t }
						n[obj.id.toString()] = obj
						return n
					}
					else if (t[obj.id.toString()].lastMessage.timestamp < obj.lastMessage.timestamp) {
						let n = { ...t }
						n[obj.id.toString()] = obj
						return n
					}
					else {
						return t;
					}

				});
			}

		};

		evs.onopen = (ev: Event) => {
			console.log('opening');
			console.log(ev);
		};
		evs.onerror = () => {
			console.log('An error occured')
		}
		return () => {
			evs.close();
		}
	}, [])
	let mHTML = Object.keys(threads).map((el) => { return threads[el] }).sort((a, b) => {
		return b.lastMessage.timestamp - a.lastMessage.timestamp;
	}).map((thread) => {
		//let data = JSON.stringify(el)

		//let objData=JSON.parse(el.data);

		return <div key={thread.id}> <a title={thread.firstMessage.content} href={'/chat?threadid=' + thread.id}>{thread.title}</a> {thread.startedBy.name} {(new Date(thread.lastMessage.timestamp)).toLocaleString()}
		</div>
	})



	return <div>{mHTML}</div>
}


export function LoginForm() {
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	return <form onSubmit={async (ev) => {
		ev.preventDefault();
		let res = await fetch('/api/genkey', {
			method: 'post',
			body: JSON.stringify({
				name: name,
				password: password,
			})
		});
		let rObj = await res.json()
		if (res.status !== 200) {
			alert('bad login')
		}
		else {
			console.log(JSON.stringify(rObj))
			storeAuthInfo(rObj.data.apikey, rObj.data.uuid);
			window.location.replace('/');
			//alert(rObj.data.apikey);
		}
		console.log(rObj);
	}}>
		<label>name<input value={name} onChange={(ev) => {
			setName(ev.target.value)
		}} type="text" /></label>
		<label>password<input value={password} onChange={(ev) => {
			setPassword(ev.target.value)
		}} type="password" /></label>
		<input type="submit" />
	</form>
}

export function LogOutButton() {
	return <button onClick={() => {
		removeAuthInfo();
	}}>Log out</button>
}

export function NewThreadForm() {

	const [title, setTitle] = useState('');
	const [message, setMessage] = useState('');
	let submitAction = async (ev: React.FormEvent) => {
		//alert('hi')


		ev.preventDefault();
		let { apikey, uuid } = getAuthInfo();
		await fetch('/api/createthread', {
			method: 'POST',
			body: JSON.stringify({
				apikey,
				uuid,
				data: {
					title: title,
					message: message
				}
			})
		});
	}
	return <form onSubmit={submitAction}>
		<label>Title:<input onChange={(ev) => { setTitle(ev.target.value) }} value={title} /></label>
		<label>Message:<textarea onChange={(ev) => { setMessage(ev.target.value) }} value={message} /></label>
		<input type="submit" />
	</form>
}

export function Chat() {
	const initObj: Record<string, MessageEventData> = {}
	const [messages, setMessages] = useState(initObj);
	let url = new URL(window.location.href);
	let threadid = url.searchParams.get('threadid');
	useEffect(() => {


		let evs = new EventSource('/eventstream/messages?threadid=' + threadid);
		evs.onmessage = function (ev: MessageEvent) {
			console.log('hi');
			console.log(ev);
			if (ev instanceof MessageEvent) {

				//let arr:Array<MessageInterface>=[...messages];
				let obj = JSON.parse(ev.data)
				setMessages((m) => {
					let n = { ...m }
					n[obj.id] = obj
					return n;
				})
			}

		};

		evs.onopen = (ev: Event) => {
			console.log('opening');
			console.log(ev);
		};
		evs.onerror = () => {
			console.log('An error occured')
		}
		return () => {
			evs.close();
		}
	}, []);

	let log = Object.keys(messages).map((el) => {
		return messages[el];
	}).sort((a, b) => {
		return a.timestamp - b.timestamp;
	}).map((message) => {
		return <div key={message.id}>
			<b>{message.user.name}:</b>
			{message.content}</div>
	});
	return <>
		<a href="/">Back to Index</a>
		{threadid !== null ? <>
			{Object.keys(messages).length>0&&<h1>{messages[Object.keys(messages)[0]].threadTitle}</h1>}
			{log}

			<PostMessagesForm threadid={threadid} />
		</> : <div>NOT VALID THREAD</div>
		}

	</>
}

export function PostMessagesForm(props: { threadid: string }) {
	const [message, setMessage] = useState('');

	let sendMessage = async (ev: React.FormEvent) => {
		ev.preventDefault();
		let { apikey, uuid } = getAuthInfo();
		let threadidNum = parseInt(props.threadid);
		if (apikey !== null && uuid !== null && !isNaN(threadidNum)) {
			let reqData: MessageAddAPIRequest = {
				uuid,
				apikey,
				data: {
					threadid: threadidNum,
					content: message
				}
			}
			let res = await fetch('/api/sendmessage', {
				method: 'POST',
				body: JSON.stringify(reqData)
			});
			if (res.status === 200) {
				setMessage('');
			}
		}

	}
	return (<form onSubmit={sendMessage}>
		<label>Message:<textarea onChange={(ev) => { setMessage(ev.target.value) }} value={message} /></label>
		<input type="submit" />
	</form>)
}
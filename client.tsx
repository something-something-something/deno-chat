import { App, MyButton, EvDisplay, LoginForm,LogOutButton ,NewThreadForm,Chat} from './components.tsx'

import { React, useState, ReactDOM } from "./client-deps.ts"





let defaultReact = <div>
	<MyButton />
	<LogOutButton/>
	<EvDisplay />
	<NewThreadForm/>
</div>;
let url = new URL(document.URL);
if (url.pathname === '/login') {
	defaultReact = <>
		<LogOutButton/>
		<br/>
		<LoginForm />
	</>
}
else if (url.pathname === '/chat') {
	defaultReact = <>
		<LogOutButton/>
		<br/>
		<Chat/>
	</>
}
//to do figure out when to load
window.addEventListener('load', async () => {
	let url = new URL(document.URL);
	if (url.pathname !== '/login') {
		if (localStorage.getItem('apikey') !== null && localStorage.getItem('keyuuid') !== null) {
			let resp = await fetch('/api/getkeyinfo', {
				method:'POST',
				body: JSON.stringify({
					apikey: localStorage.getItem('apikey'),
					uuid: localStorage.getItem('keyuuid')
				})
			});
			let json = await resp.json();
			console.log(json);
			if (json.data.valid !== true) {
				window.location.replace('/login');
				return;
			}
		}
		else {
			window.location.replace('/login');
			return;
		}
	}
	ReactDOM.render(
		defaultReact
		, document.getElementById('reactContainer'));
});




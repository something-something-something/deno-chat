import {App,MyButton,EvDisplay,LoginForm} from './components.tsx'

import {React,useState,ReactDOM} from "./client-deps.ts"





let defaultReact=<div>
	<MyButton/>
	<EvDisplay/>
</div>;
let url=new URL(document.URL);
if(url.pathname==='/login'){
	defaultReact=<>
	<LoginForm/>
	</>
}

ReactDOM.render(

defaultReact
,document.getElementById('reactContainer'))



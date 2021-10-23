export interface ThreadEventData{
	id:number;
	firstMessage:MessageEventData;
	lastMessage:MessageEventData
	startedBy:{
		id:number;
		name:string;
	}
	title:string;
}

export interface MessageEventData{
	username:{
		id:number;
		name:string;
	}
	id:number;
	content:string;
	timestamp:number;
	threadid:number;
	threadTitle:string;
}

export interface StandardAPIRequest{
	apikey:string;
	uuid:string;
}

export interface MessageAddAPIRequest extends StandardAPIRequest{
	data:{
		threadid:number;
		content:string;
	}
}
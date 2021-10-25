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
	user:{
		id:number;
		name:string;
	}
	id:number;
	content:string;
	timestamp:number;
	threadid:number;
	threadTitle:string;
}
//TODO: apikey should go in headers
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
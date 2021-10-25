import {__sodium,DB} from './deps.ts'

await __sodium.ready;
const sodium=__sodium;

export function hashPassword(password:string){
	//lowerig for speed 
	//return sodium.crypto_pwhash_str(password,sodium.crypto_pwhash_OPSLIMIT_MODERATE,sodium.crypto_pwhash_MEMLIMIT_MODERATE);

	return sodium.crypto_pwhash_str(password,sodium.crypto_pwhash_OPSLIMIT_MIN,sodium.crypto_pwhash_MEMLIMIT_MIN);
}

export function verifyHashedPassword(hash:string,password:string){
	return sodium.crypto_pwhash_str_verify(hash,password)
}

export function generateApiKey(){
	let buf=new Uint8Array(90);
	buf=crypto.getRandomValues(buf);
	return btoa( String.fromCharCode(...buf));
}

//TODO Move apikeys to headers
//TODO make sure variable:true is okay
export function getApiKeyStatus(db:DB,uuid:string,apikey:string):{valid:true,userid:number}|{valid:false}{
	let result=db.query('SELECT apikeys.uuid,apikeys.hashedKey,users.id FROM apikeys LEFT JOIN users ON users.id=apikeys.userid WHERE apikeys.uuid=?',[uuid]);

	console.log(result)
	if(result.length>0&& typeof result[0][1] ==='string'&&typeof result[0][2] ==='number'){
		if(verifyHashedPassword(result[0][1],apikey)){
			return {valid:true,userid:result[0][2]}
		}
	}
	return {
		valid:false
	}
}

export async function isValidAuthRequest(db:DB,request:Request):Promise<{valid:true,userid:number}|{valid:false}>{
	try{
		let json=await request.json();

		if('uuid' in json && 'apikey' in json){
			return getApiKeyStatus(db,json.uuid,json.apikey)
		}
	}
	catch(e){

	}
	
	
	return {valid:false}
}
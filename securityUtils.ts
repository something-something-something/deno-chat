import {__sodium} from './deps.ts'

await __sodium.ready;
const sodium=__sodium;

export function hashPassword(password:string){
	return sodium.crypto_pwhash_str(password,sodium.crypto_pwhash_OPSLIMIT_MODERATE,sodium.crypto_pwhash_MEMLIMIT_MODERATE);
}

export function verifyHashedPassword(hash:string,password:string){
	return sodium.crypto_pwhash_str_verify(hash,password)
}

export function generateApiKey(){
	let buf=new Uint8Array(90);
	buf=crypto.getRandomValues(buf);
	return btoa( String.fromCharCode(...buf));
}
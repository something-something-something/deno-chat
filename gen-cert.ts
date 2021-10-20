// import { __sodium } from './deps.ts'
import {grantOrThrow} from './deps.ts'
import {pki} from 'https://esm.sh/node-forge'

// await __sodium.ready;
// const sodium = __sodium;
const desc1 = { name: 'write', path: './chat.crt' } as const;
const desc2 = { name: 'write', path: './chat.key' } as const;
grantOrThrow(desc1,desc2);
// let keys: CryptoKeyPair = await crypto.subtle.generateKey({ name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);

// if (keys.publicKey !== undefined&&keys.privateKey!==undefined) {
// 	let pub = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey('spki', keys.publicKey))));
// 	let priv = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey('pkcs8', keys.privateKey))));

// 	console.log({
// 		pub: pub,
// 		priv: priv
// 	});


// 	await Deno.writeTextFile('./chat.crt','-----BEGIN CERTIFICATE-----\n'+pub+'\n-----END CERTIFICATE-----');
// 	await Deno.writeTextFile('./chat.key','-----BEGIN PRIVATE KEY-----\n'+priv+'\n-----END PRIVATE KEY-----');
// }


let keys=pki.rsa.generateKeyPair(2048)
let cert=pki.createCertificate();
cert.publicKey=keys.publicKey;
cert.serialNumber='01';
cert.validity.notBefore=new Date();
cert.validity.notAfter=new Date('2040-10-12');

let attributes=[{
	name:'commonName',value:'localhost',


}]

cert.setSubject(attributes);
cert.setIssuer(attributes);

cert.setExtensions([{

		name:'subjectAltName',
		altNames:[{
			type:6,
			value:'http://localhost/'
		}]
	
}])





cert.sign(keys.privateKey);


await Deno.writeTextFile('./chat.crt',pki.certificateToPem(cert));
await Deno.writeTextFile('./chat.key',pki.privateKeyToPem(keys.privateKey))


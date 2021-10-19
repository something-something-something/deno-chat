import {DB,grantOrThrow,__sodium} from './deps.ts'
await __sodium.ready;
const sodium=__sodium;

//await Deno.permissions.request(desc1);
//await Deno.permissions.request(desc2);

async function setUp() {
	const desc1 = { name: 'read', path: './chat.db' } as const;
	const desc2 = { name: 'write', path: './chat.db' } as const;
	const desc3 = { name: 'read', path: './chat.db-journal' } as const;
	const desc4 = { name: 'write', path: './chat.db-journal' } as const;
	//console.log(sodium.crypto_pwhash_OPSLIMIT_MODERATE)
	//console.log(sodium.crypto_pwhash_MEMLIMIT_MODERATE)
	await grantOrThrow(desc1, desc2, desc3, desc4);
	await Deno.remove('./chat.db');
	const db = new DB('./chat.db', { mode: 'create' });
	db.query('PRAGMA foreign_keys=ON');
	
	db.query(`
		CREATE TABLE users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT,
			hashedpass TEXT
		)
	`);

	db.query(`
		CREATE TABLE apikeys (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			userid INTEGER NOT NULL ,
			hashedkey TEXT,
			FOREIGN KEY(userid) REFERENCES user (id) ON UPDATE CASCADE ON DELETE CASCADE
		)
	`);

	db.query(`
		CREATE TABLE threads (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			starteruserid INTEGER NOT NULL ,
			title TEXT,
			FOREIGN KEY(starteruserid) REFERENCES user (id) ON UPDATE CASCADE
		)
	`);

	db.query(`
		CREATE TABLE messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			authorid INTEGER NOT NULL,
			threadid INTEGER NOT NULL,
			content TEXT,
			FOREIGN KEY(authorid) REFERENCES user (id) ON UPDATE CASCADE,
			FOREIGN KEY(threadid) REFERENCES user (id) ON UPDATE CASCADE
		)
	`);

	db.query(`INSERT INTO users (name,hashedpass) VALUES (?,?)`,['blah',hashPassword('myPassword')]);
	db.close();

	console.log('done');
}

function hashPassword(password:String){
	return sodium.crypto_pwhash_str(password,sodium.crypto_pwhash_OPSLIMIT_MODERATE,sodium.crypto_pwhash_MEMLIMIT_MODERATE);
}

await setUp();
Deno.exit();

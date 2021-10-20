import {DB,grantOrThrow} from './deps.ts'
import {hashPassword} from './securityUtils.ts'
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

	try{
		await Deno.remove('./chat.db');
	}
	catch(er){
		console.log(er)
	}

	const db = new DB('./chat.db', { mode: 'create' });
	db.query('PRAGMA foreign_keys=ON');
	
	db.query(`
		CREATE TABLE users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE,
			hashedpass TEXT
		)
	`);

	db.query(`
		CREATE TABLE apikeys (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			uuid TEXT UNIQUE,
			userid INTEGER NOT NULL ,
			hashedkey TEXT,
			FOREIGN KEY(userid) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
		)
	`);

	db.query(`
		CREATE TABLE threads (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			starteruserid INTEGER NOT NULL ,
			title TEXT,
			FOREIGN KEY(starteruserid) REFERENCES users (id) ON UPDATE CASCADE
		)
	`);

	db.query(`
		CREATE TABLE messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			timestamp INTEGER NOT NULL,
			authorid INTEGER NOT NULL,
			threadid INTEGER NOT NULL,
			content TEXT,
			FOREIGN KEY(authorid) REFERENCES users (id) ON UPDATE CASCADE,
			FOREIGN KEY(threadid) REFERENCES users (id) ON UPDATE CASCADE
		)
	`);

	db.query(`INSERT INTO users (name,hashedpass) VALUES (?,?)`,['blah',hashPassword('myPassword')]);
	db.close();

	console.log('done');
}



await setUp();
Deno.exit();

export function storeAuthInfo(key: string, uuid: string) {
	localStorage.setItem('apikey', key);
	localStorage.setItem('keyuuid', uuid);
}

export function getAuthInfo() {
	return {
		apikey: localStorage.getItem('apikey'),
		uuid: localStorage.getItem('keyuuid')
	}
}

export function removeAuthInfo() {

	localStorage.removeItem('apikey')
	localStorage.removeItem('keyuuid')

}
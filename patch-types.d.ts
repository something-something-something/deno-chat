//patch issue as typscript is missing type for https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
interface Crypto{
	randomUUID():string;
}
const STORAGE_KEY = 'urist-zaliv:cookieConsent';

export function hasCookieConsent(): boolean {
	if (typeof localStorage === 'undefined') return false;
	try {
		return Boolean(localStorage.getItem(STORAGE_KEY));
	} catch {
		return false;
	}
}

export function setCookieConsent(): void {
	try {
		localStorage.setItem(STORAGE_KEY, new Date().toISOString());
	} catch {
		/* ignore quota / private mode */
	}
}

/** Safe JSON-LD payload for injection into HTML. */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

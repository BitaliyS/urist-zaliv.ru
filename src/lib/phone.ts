/** Russian mobile: 11 digits starting with 7. */
export function digitsOnly(value: string): string {
	return value.replace(/\D/g, '');
}

export function formatRuPhone(value: string): string {
	let digits = digitsOnly(value);
	if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
	if (!digits.startsWith('7')) digits = `7${digits}`;
	digits = digits.slice(0, 11);

	const local = digits.slice(1);
	let formatted = '+7';
	if (!local.length) return formatted;

	formatted += ` (${local.slice(0, Math.min(3, local.length))}`;
	if (local.length >= 3) formatted += ')';
	if (local.length > 3) formatted += ` ${local.slice(3, Math.min(6, local.length))}`;
	if (local.length > 6) formatted += `-${local.slice(6, Math.min(8, local.length))}`;
	if (local.length > 8) formatted += `-${local.slice(8, Math.min(10, local.length))}`;
	return formatted;
}

/** True for +7XXXXXXXXXX (11 digits). */
export function isValidRuPhone(value: string): boolean {
	const digits = digitsOnly(value);
	return digits.length === 11 && digits.startsWith('7');
}

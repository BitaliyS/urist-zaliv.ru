declare global {
	namespace App {
		interface Error {
			message: string;
		}
	}

	interface Window {
		ym?: (counterId: number, method: string, ...args: unknown[]) => void;
	}
}

export {};

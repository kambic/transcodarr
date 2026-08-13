class RateLimiter {
    throttle(fn: Function, wait: number) {
        let time = Date.now();

        return function(...args: any) {
            if ((time + wait - Date.now()) < 0) {
                fn(...args);
                time = Date.now();
            }
        }
    }

    debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
        let timer: ReturnType<typeof setTimeout>;

        return function (this: any, ...args: Parameters<T>) {
            clearTimeout(timer); // Discard previous calls
            timer = setTimeout(() => fn.apply(this, args), delay); // Execute only the last call
        } as T;
    }
}

export default RateLimiter;

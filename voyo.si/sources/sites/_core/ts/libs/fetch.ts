// fetch() is inside another Promise so that we can stop (reject) it
// if it takes too long to retrieve data from api or gql.
//
// After we switch all clients (including setupboxes) to chrome 66+
// rework this code below to use AbortController.
function fetchWithTimeout(url: string, options: {method?:string, headers?: any, body?: any, timeout?: number, keepalive?: boolean}|undefined = undefined): Promise<any> {

    return new Promise<any>((resolve, reject) => {
        // Set a timeout to reject the promise if the request takes too long
        const timer = setTimeout(() => {
            (window as any).Sentry?.setContext("fetchData", { url, options });

            reject(new Error('Fetch request timed out: ' + url));
        }, options?.timeout || 4000);

        fetch(url, options)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                clearTimeout(timer);
                resolve(response);
            })
            .catch((error) => {
                clearTimeout(timer);
                console.error('Fetch error:', error);
                reject(error);
            });
    });

}

export {fetchWithTimeout};
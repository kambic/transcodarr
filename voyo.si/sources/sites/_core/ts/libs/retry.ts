export default async function retryOnce<T>(promiseFactory: () => Promise<T>): Promise<T> {
    try {
        return await promiseFactory();
    } catch (error) {
        console.log('First attempt failed, retrying once in 1 second...', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await promiseFactory();
    }
}
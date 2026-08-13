import GqlData from "../gql_data";

const ispLoginCheck = (jobHash: string): GqlData => {
    return {
        query: `query IspLoginCheck ($jobHash: String!) {
            ispLoginCheck(jobHash: $jobHash) {
                status
                payload {
                    token
                    nickname
                    email
                    avatar
                    isSubscribed
                    subscriptionUntil
                    status
                }
            }
        }`,
        variables: { jobHash }
    }
};

const ispLoginJob = (provider: string, a1Token: string): GqlData => {
    return {
        query: `query IspLogin ($provider: String! $a1Token: String) {
            ispLogin(provider: $provider a1Token: $a1Token) {
                jobHash maxRetries retryDelay
            }
        }`,
        variables: { provider, a1Token }
    }
};

const ispLogin = (username: string, password: string, provider: string): GqlData => {
    return {
        query: `query IspLogin ($username: String! $password: String! $provider: String!) {
            ispLogin(username: $username password: $password provider: $provider) {
                jobHash maxRetries retryDelay
            }
        }`,
        variables: { username, password, provider }
    }
};

export { ispLoginCheck, ispLoginJob, ispLogin }
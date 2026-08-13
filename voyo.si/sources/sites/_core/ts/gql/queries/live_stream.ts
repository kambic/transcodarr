import GqlData from "../gql_data";

const liveStreamQuery = (id: number): GqlData => {
    return {
        query: `query liveStream($id: Int!)
            {
                liveStream (id: $id) {
                    id title url
                }
            }`,
        variables: { id }
    }
};

const liveStreamReminder = (streamId: number): GqlData => {
    return {
        query: `mutation streamReminder($id: Int!)
            {
                streamReminder (id: $id) {
                    message
                }
            }`,
        variables: { id: streamId }
    }
};

export { liveStreamQuery, liveStreamReminder }
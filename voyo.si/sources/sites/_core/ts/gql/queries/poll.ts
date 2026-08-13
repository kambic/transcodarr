import GqlData from "../gql_data";

const pollVoteQuery = (pollId: number, answerId: number, gender: string): GqlData => {
    return {
        query: `mutation pollVote($pollId: Int! $answerId: Int! $gender: String)
            {
                pollVote(pollId: $pollId answerId: $answerId gender: $gender) {
                    id
                }
            }`,
        variables: { pollId, answerId, gender }
    }
};

export { pollVoteQuery }
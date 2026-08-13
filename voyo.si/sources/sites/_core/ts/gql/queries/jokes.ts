import GqlData from "../gql_data";

const jokeVoteUpQuery = (jokeId: number): GqlData => {
    return {
        query: `mutation jokeVote($id: Int!)
            {
                jokeVote(id: $id direction: UP) {
                    id count:upCount
                }
            }`,
        variables: { id: jokeId }
    }
};

const jokeVoteDownQuery = (jokeId: number): GqlData => {
    return {
        query: `mutation jokeVote($id: Int!)
            {
                jokeVote(id: $id direction: DOWN) {
                    id count:downCount
                }
            }`,
        variables: { id: jokeId }
    }
};

export { jokeVoteUpQuery, jokeVoteDownQuery }
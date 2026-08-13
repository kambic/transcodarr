import GqlData from "../gql_data";

const commentVoteUpQuery = (articleId: number, commentId: string): GqlData => {
    return {
        query: `mutation commentVote($articleId: Int! $commentId: String!)
            {
                commentVote(itemType: ARTICLE itemId: $articleId commentId: $commentId direction: UP) {
                    id
                }
            }`,
        variables: { articleId, commentId }
    }
};

const commentVoteDownQuery = (articleId: number, commentId: string): GqlData => {
    return {
        query: `mutation commentVote($articleId: Int! $commentId: String!)
            {
                commentVote(itemType: ARTICLE itemId: $articleId commentId: $commentId direction: DOWN) {
                    id
                }
            }`,
        variables: { articleId, commentId }
    }
};

const commentAddQuery= (articleId: number, body: string, replyTo: string): GqlData => {
    return {
        query: `mutation commentAdd($articleId: Int! $replyTo: String $body: String!)
            {
                commentAdd(itemType: ARTICLE itemId: $articleId replyTo: $replyTo body: $body) {
                    id
                }
            }`,
        variables: { articleId, replyTo, body }
    }
};

export { commentVoteUpQuery, commentVoteDownQuery, commentAddQuery }
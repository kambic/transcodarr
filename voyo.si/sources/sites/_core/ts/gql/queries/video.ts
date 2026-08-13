import GqlData from "../gql_data";

const videoQuery = (id: number): GqlData => {
    return {
        query: `query video($id: Int!)
            {
                video (id: $id) {
                    id title url
                    meta {rootCategoryId categoryId}
                }
            }`,
        variables: { id }
    }
};

export { videoQuery }
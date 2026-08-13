import GqlData from "../gql_data";

const voyoCategoryQuery = (id: number): GqlData => {
    return {
        query: `query voyoCategory($id: Int!)
            {
                voyoCategory (id: $id) {
                    id title url
                    meta {rootCategoryId}
                }
            }`,
        variables: { id }
    }
};

export { voyoCategoryQuery }
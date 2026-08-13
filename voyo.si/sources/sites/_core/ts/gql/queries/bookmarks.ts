import GqlData from "../gql_data";

const recipeBookmarkDelete = (groupId: string, itemId: string): GqlData => {
    return {
        query: `mutation recipeBookmarkDelete($groupId: String! $itemId: String!)
          {
            recipeBookmarkDelete(groupId: $groupId, itemId: $itemId) {
              __typename
            }
          }`,
        variables: { groupId, itemId }
    }
};

const recipeBookmarkGroupDelete = (groupId: string): GqlData => {
  return {
      query: `mutation recipeBookmarkGroupDelete($groupId: String!)
        {
          recipeBookmarkGroupDelete(groupId: $groupId) {
            __typename
          }
        }`,
      variables: { groupId }
  }
};

const recipeBookmarkGroupAddRename = (groupId: string, name: string): GqlData => {
  return {
      query: `mutation recipeBookmarkGroupAdd($groupId: String! $name: String!)
        {
          recipeBookmarkGroupAdd(groupId: $groupId, name: $name) {
            __typename
          }
        }`,
      variables: { groupId, name }
  }
};

const recipeBookmarkAddToGroup = (groupId: string, itemId: string): GqlData => {
  return {
      query: `mutation recipeBookmarkGroupAdd($groupId: String! $itemId: String!)
        {
          recipeBookmarkGroupAdd(groupId: $groupId, itemId: $itemId) {
            __typename
          }
        }`,
      variables: { groupId, itemId }
  }
};

const voyoBookmarks = () : GqlData => {
  return {
    query: `query voyoBookmarks 
      {
        voyoBookmark {
          groups {
            id name
            items {
              entityId categoryId
              data { percent duration }
            }
          }
        }
      }`,
    variables: {}
  }
};

const voyoBookmarkDelete = (groupId: string, itemId: string): GqlData => {
  return {
      query: `mutation voyoBookmarkDelete($groupId: String! $itemId: String!)
        {
          voyoBookmarkDelete(groupId: $groupId, itemId: $itemId) {
            __typename
          }
        }`,
      variables: { groupId, itemId }
  }
};

const voyoBookmarkAdd = (groupId: string, itemId: string, percent = 0, duration = 0): GqlData => {
  return {
      query: `mutation voyoBookmarkAdd($groupId: String! $itemId: String! $percent: Int, $duration: Int)
        {
          voyoBookmarkAdd(groupId: $groupId, itemId: $itemId, returnAllBookmarks: false, percent: $percent, duration: $duration) {
            __typename
          }
        }`,
      variables: { groupId, itemId, percent, duration }
  }
};

export {
  recipeBookmarkDelete,
  recipeBookmarkGroupDelete,
  recipeBookmarkGroupAddRename,
  recipeBookmarkAddToGroup,
  voyoBookmarks,
  voyoBookmarkDelete,
  voyoBookmarkAdd
}
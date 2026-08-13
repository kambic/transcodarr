import GqlData from "../gql_data";

const geoQuery = (): GqlData => {
    return {
        query: `
            {
                geo {
                    ip
                    countryCode
                    countryName
                }
            }`,
        variables: {}
    };
};

export {
    geoQuery
};

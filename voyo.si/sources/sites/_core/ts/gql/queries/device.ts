import GqlData from "../gql_data";

const tvGetCode = (deviceName: string, deviceFamily: string): GqlData => {
    return {
        query: `mutation tvGetCode($deviceName: String!, $deviceFamily: String!)
            {
                tvGetCode(deviceName: $deviceName, deviceFamily: $deviceFamily, codeLength: 5) {
                    code canSkipDummyVisitorScreen
                }
            }`,
        variables: { deviceName, deviceFamily }
    }
};

export { tvGetCode }
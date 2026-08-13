import GqlData from "../gql_data";

const videoUrlV2Query = (id: number, siteId: number, isSafari: boolean): GqlData => {
    return {
        query: `query VideoUrlV2($id: Int!, $siteId: Int ${isSafari ? ', $isSafari: Boolean' : ''})
            {
                videoUrlV2 (
                    id: $id
                    siteId: $siteId
                    ${isSafari ? 'isSafari: $isSafari' : ''}
                ) {
                    url info infoCode license
                }
            }`,
        variables: { id, siteId, ...(isSafari && { isSafari }) }
    }
}

const epgHlsUrlQuery = (channel: string, chunkStart: number, chunkEnd: number): GqlData => {
    return {
        query: `query EpgHlsUrl($channel: String! $chunkStart: Int! $chunkEnd: Int!)
            {
                epgHlsUrl (
                    channel: $channel
                    chunkStart: $chunkStart
                    chunkEnd: $chunkEnd
                ) {
                    url breaks { from to }
                }
            }`,
        variables: { channel, chunkStart, chunkEnd }
    }
};

const epgHlsUrlV2Query = (channel: string, chunkStart: number, chunkEnd: number, isSafari: boolean): GqlData => {
    return {
        query: `query EpgHlsUrlV2($channel: String! $chunkStart: Int! $chunkEnd: Int! ${isSafari ? ', $isSafari: Boolean' : ''})
            {
                epgHlsUrlV2 (
                    channel: $channel
                    chunkStart: $chunkStart
                    chunkEnd: $chunkEnd
                    ${isSafari ? 'isSafari: $isSafari' : ''}
                ) {
                    url breaks { from to } license
                }
            }`,
        variables: { channel, chunkStart, chunkEnd, ...(isSafari && { isSafari }) }
    }
}

export { videoUrlV2Query, epgHlsUrlQuery, epgHlsUrlV2Query };
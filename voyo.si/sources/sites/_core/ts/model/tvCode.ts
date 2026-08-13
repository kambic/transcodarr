class TvCodeModel {
    code: string;
    canSkipDummyVisitorScreen: number;

    constructor(data: any) {
        this.code = data?.code || '';
        this.canSkipDummyVisitorScreen = data?.canSkipDummyVisitorScreen || 0;
    }
}

export default TvCodeModel;
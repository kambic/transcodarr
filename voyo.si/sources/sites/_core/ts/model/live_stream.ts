class LiveStreamModel {
    id: number;
    title: string;
    url: string;

    constructor(data: any) {
        Object.assign(this, data);
    }
}

export default LiveStreamModel;

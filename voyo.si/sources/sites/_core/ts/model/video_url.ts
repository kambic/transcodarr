class VideoUrlModel {
    url: string;
    info: string;
    infoCode: number;
    license: string;

    constructor(data: any) {
        this.url = data['url'] || '';
        this.info = data['info'] || '';
        this.infoCode = +(data['infoCode'] || 0);
        this.license = data['license'] || '';
    }
}

export default VideoUrlModel;

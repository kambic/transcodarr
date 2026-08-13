class VideoSourceModel {
    src: string;
    type: string;
    keySystems: object;

    constructor(data: any) {
        this.src = data['src'] || '';
        this.type = data['type'] || 'application/x-mpegURL';
        this.keySystems = data['keySystems'] || {};
    }
}

export default VideoSourceModel;

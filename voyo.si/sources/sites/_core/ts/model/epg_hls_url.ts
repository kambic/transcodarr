import VideoBreakModel from "./video_break";

class EpgHlsUrlModel {
    url: string;
    breaks: Array<VideoBreakModel>;
    license: string;

    constructor(data: any) {
        this.url = data?.url || '';
        this.breaks = (data?.breaks || []).map((b:any) => new VideoBreakModel(b));
        this.license = data?.license || '';
    }
}

export default EpgHlsUrlModel;

class VideoModel {
    id: number;
    title: string;
    url: string;

    meta: {
        rootCategoryId: number;
        categoryId: number|null;
    };

    constructor(data: any) {
        Object.assign(this, data);
    }
}

export default VideoModel;

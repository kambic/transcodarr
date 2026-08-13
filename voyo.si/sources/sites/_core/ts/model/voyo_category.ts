class VoyoCategoryModel {
    id: number;
    title: string;
    url: string;

    meta: {
        rootCategoryId: number;
    };

    constructor(data: any) {
        Object.assign(this, data);
    }
}

export default VoyoCategoryModel;

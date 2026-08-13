class IspLoginJobModel {
	jobHash: string;
	maxRetries: number;
	retryDelay: number;

    constructor(data: any) {
        Object.assign(this, data);
    }
}

export default IspLoginJobModel;
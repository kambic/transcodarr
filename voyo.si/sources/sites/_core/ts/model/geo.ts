class GeoModel {
    ip: string;
    countryCode: string;
    countryName: string;

    constructor(data: any) {
        this.ip = data?.ip || '';
        this.countryCode = data?.countryCode || '';
        this.countryName = data?.countryName || '';
    }
}

export default GeoModel;

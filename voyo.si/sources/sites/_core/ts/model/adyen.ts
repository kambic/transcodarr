class AdyenModel {
    id: string;
    sessionData: string;
    clientKey: string;
    checkoutId: number;

    paymentInfo: {
        itemName: string;
        category: string;
        price: number;
        discount: number;
    };

    constructor(data: any) {
        Object.assign(this, data);
    }
}

export default AdyenModel;
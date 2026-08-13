class CookieModel {
    cookiesAccept: string;
    vendors: Array<string>;

    constructor(cookiesAccept: string, vendors: Array<string> = []) {
        this.cookiesAccept = cookiesAccept;
        this.vendors = vendors;
    }
    
    isVendorAllowed(vendor: string): boolean {
        return this.vendors.includes(vendor);
    }

    isImportantAllowed(): boolean {
        return this.cookiesAccept.includes('important');
    }

    isThirdAllowed(): boolean {
        return this.cookiesAccept.includes('third');
    }
}

export default CookieModel;

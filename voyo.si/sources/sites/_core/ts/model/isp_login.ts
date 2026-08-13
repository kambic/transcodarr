import UserModel from "./user";

class IspLoginCheckModel {
    status: string;
    payload: UserModel | null;

    constructor(data: any) {
        Object.assign(this, data);
        this.payload = data?.payload ? new UserModel(data.payload) : null;
    }
}

export default IspLoginCheckModel;
class UserModel {
    id: number;
    email: string;
    avatar: string;
    nickname: string;
    deviceId: number;
    profileId: number;
    profileType: string;
    token: string;
    isSubscribed: boolean;
    status: number;

    constructor(data: any) {
        this.id = data['id'] || 0;
        this.email = data['email'] || '';
        this.avatar = data['avatar'] || '';
        this.nickname = data['nickname'] || '';
        this.deviceId = data['deviceId'] || 0;
        this.profileId = data['profileId'] || 0;
        this.profileType = data['profileType'] || '';
        this.isSubscribed = data['isSubscribed'] || false;
        this.token = data['token'] || '';
        this.status = data['status'] || 0;
    }

    get hash(): string {
        if (!this.id) {
            return '';
        }
        return '#' + this.id + '#' + this.profileId + '#' + this.profileType + '#';
    }
}

export default UserModel;

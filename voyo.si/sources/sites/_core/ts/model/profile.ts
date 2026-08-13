class ProfileModel {
    profileId: number;
    visitorId: number;
    name: string;
    type: string;
    avatar: string;
    url: string;

    constructor(data: any) {
        this.profileId = data?.profileId || 0;
        this.visitorId = data?.visitorId || 0;
        this.name = data?.name || '';
        this.type = data?.type || '';
        this.avatar = data?.avatar || '';
        this.url = data?.url || '';

    }
}

export default ProfileModel;
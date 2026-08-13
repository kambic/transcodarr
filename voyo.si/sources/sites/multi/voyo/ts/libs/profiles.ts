import GQL from "@core/gql/gql";
import Html from "@core/libs/html";
import ProfileModel from "@core/model/profile";
import LocalStorage from "./local_storage";
import VoyoStbAppOptions from "../app/options";

class Profiles {
    private profiles: Array<ProfileModel> = [];

    constructor(
        protected gql: GQL,
        protected html: Html,
        protected localStorage: LocalStorage,
        protected options: VoyoStbAppOptions
    ) { }

    init(): Promise<Array<ProfileModel>> {
        return this.voyoProfiles();
    }

    voyoProfiles(fromCache = true): Promise<Array<ProfileModel>> {
        if (fromCache) {
            if (this.profiles?.length) {
                return Promise.resolve(this.profiles);
            }

            const profiles = this.loadFromLocalStorage();
            if (profiles?.length) {
                this.profiles = profiles;
                return Promise.resolve(profiles);
            }
        }

        return this.gql.voyoProfiles()
            .then(profiles => this.profilesToCache(profiles));
    }

    profilesToCache(profiles: Array<ProfileModel>): Array<ProfileModel> {
        this.profiles = profiles;
        this.saveToLocalStorage();

        return profiles;
    }

    redirectToProfileUrl(profileId: number): void {
        const profile = this.profiles.find(p => p.profileId === profileId);

        if (!profile) {
            return;
        }

        document.location.href = profile.url;
    }

    profileOfType(profileType: string): ProfileModel | undefined {
        return this.profiles.find(p => p.type === profileType);
    }

    rootCategoryToProfileType(rootCategoryId: number): string {
        switch (rootCategoryId) {
            case 1091:
                return '5ka';
            case 5:
                return 'kids';
            default:
                return 'normal';
        }
    }

    profileTypeUrl(profileType: string): string {
        switch (profileType) {
            case '5ka':
                return this.options.routes.profile_5ka;
            case 'kids':
                return this.options.routes.profile_kids;
            default:
                return '';
        }
    }

    // Checks if user is in correct profile. For example: We
    // don't allow watching kids content from "normal" profile.
    isInCorrectProfile(userProfileId: number, requiredProfile: string): boolean {
        // exit as ok, if no profile is required
        if (!requiredProfile) {
            return true;
        }

        const profile = this.profiles.find(p => p.profileId === userProfileId);

        if (!profile) {
            return false;
        }

        return requiredProfile === profile.type;
    }

    private saveToLocalStorage(): void {
        this.localStorage.set('voyoProfiles', this.profiles, 60);
    }

    private loadFromLocalStorage(): ProfileModel[] | null {
        const objs = this.localStorage.get<ProfileModel[]>('voyoProfiles');
        return objs ? objs.map(o => new ProfileModel(o)) : null;
    }
}

export default Profiles;
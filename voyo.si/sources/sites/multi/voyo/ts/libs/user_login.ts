import VoyoStbAppOptions from '../app/options';
import GQL from '@core/gql/gql';
import Cookies from '@core/libs/cookies';
import Events from '@core/libs/events';
import Html from '@core/libs/html';
import User from '@core/libs/user';
import Profiles from './profiles';
import UserModel from '@core/model/user';
import LocalStorage from './local_storage';

class UserWithLogin extends User {

    constructor(
        protected events: Events,
        protected cookies: Cookies,
        protected gql: GQL,
        protected html: Html,
        protected profiles: Profiles,
        protected localStorage: LocalStorage,
        protected options: VoyoStbAppOptions
    ) {
        super(events, cookies, gql, html, options);
    }
    
    loginUser(email: string, password: string): Promise<UserModel | null> {
        if (!email || !password) {
            return Promise.reject(null);
        }

        return this.gql.loginUser(email, password, this.options.siteId)
            .then(user => this.userLoaded(user));
    }

    loginWithDevice(deviceName: string, deviceFamily: string): Promise<UserModel | null> {
        if (!deviceName) {
            return Promise.resolve(null);
        }

        return this.gql.loginWithDevice(deviceName, deviceFamily, this.options.siteId)
            .then(user => this.userLoaded(user));
    }

    registerUser(email: string, password: string, companyName: string, companyVat: string, phoneNumber: string, telTerms: boolean, profilingTerms: boolean): Promise<UserModel | null> {
        return this.gql.registerUser(email, password, "", "U", this.options.siteId, true, companyName, companyVat, phoneNumber, telTerms, profilingTerms)
            .then(user => {
                return this.userLoaded(user);
            })
    }

    newPassword(password: string, token: string): Promise<any> {
        if (!password || !token) {
            return Promise.reject();
        }
        return this.gql.newPassword(password, token)
            .then(user => this.userLoaded(user));
    }

    userLoaded(user: UserModel | null): UserModel | null {
        super.userLoaded(user);

        if (!user) {
            this.deleteCookiesAndStorage();
        }

        return user;
    }

    logoutUser(): Promise<any> {
        const promise = this.gql.logoutUser();
        this.deleteCookiesAndStorage();

        return promise;
    }

    private deleteCookiesAndStorage(): void {
        this.cookies.delete('sso_jwt');
        this.localStorage.remove('voyoBookmarks');
        this.localStorage.remove('voyoProfiles');
    }

    loginToProfile(profileId: number): Promise<UserModel> {
        if (!profileId) {
            return Promise.reject(null);
        }

        return this.gql.loginProfile(profileId)
            .then(user => this.userLoaded(user))
            // reload voyo profiles when user logins into given profile
            // so that we have a clean and up-to-date list of profiles in local storage
            .then(user => {
                if (!user) {
                    throw new Error("no user");
                }

                return this.profiles.voyoProfiles(false)
                    .then(() => user);
            })
            .catch(err => {
                this.profiles.profilesToCache([]);
                throw err;
            });
    }

    saveProfile(profileId: number, name: string, profileType: string, avatar: string): Promise<any | null> {
        if (!name || !avatar) {
            return Promise.resolve(null);
        }

        if (profileId) {
            return this.gql.updateProfile(profileId, name, avatar);
        }

        return this.gql.newProfile(name, profileType, avatar);
    }

    deleteProfile(profileId: number, profileType: string): Promise<UserModel> {
        if (!profileId) {
            return Promise.reject(null);
        }

        return this.gql.deleteProfile(profileId)
            .then(profileData => {
                this.profiles.profilesToCache(profileData);

                const newProfile = this.profiles.profileOfType(profileType);
                return this.loginToProfile(newProfile?.profileId || 0);
            });
    }

    /**
     * Links current device (browser) to user, so that we'll know how
     * many devices user has (MAX 5). go-users-api updates db and returns
     * a new token with deviceId set to new device.
     *
     * We don't need token with deviceId for videos that are not
     * drm protected.
     *
     * If user already has token with deviceId set, we can just pass it
     * back, no need to do linkDeviceToUser(). If token is wrong or if
     * device was removed from user, videoUrl() GQL will return error.
     */
    linkDeviceToUser(drmProtected: boolean|undefined): Promise<UserModel|null> {
        if (!drmProtected) {
            return Promise.resolve(this.user);
        }

        if (this.user?.deviceId) {
            return Promise.resolve(this.user);
        }

        return this.gql.linkDeviceToUser(this.options.device.family, this.options.device.name, this.options.device.model)
            .then(user => this.userLoaded(user));
    }

    // Redirects to login if the user is not authenticated. Returns true when logged in.
    // Use as onclick="loginGuard(event)" on any element that requires login, or call
    // without an event to guard JS flows.
    loginGuard(event?: Event): boolean {
        if (this.user) {
            return true;
        }

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        document.location.href = this.options.routes.login;
        return false;
    }
}

export default UserWithLogin;

import UserModel from '../model/user';
import GeoModel from '../model/geo';
import VideoUrlModel from '../model/video_url';
import BookmarkGroupsModel, { Bookmark } from '../model/bookmarks';
import ProfileModel from '../model/profile';
import GqlError from '../model/gql_error';
import TvCodeModel from '../model/tvCode';
import GqlData from './gql_data';
import PagehitData from './pagehit_data';
import { loginInfoQuery, loginInfoGqlc, registerUser, registerEmailOnlyQuery, loginUserQuery, loginProfileQuery, logoutUserQuery, linkDeviceToUser, loginWithDeviceQuery, newPassword, sendVoyoLoginToken, userMetaQuery } from './queries/user';
import { epgHlsUrlQuery, epgHlsUrlV2Query, videoUrlV2Query } from './queries/video_url';
import { commentVoteUpQuery, commentVoteDownQuery, commentAddQuery } from './queries/comments';
import { jokeVoteUpQuery, jokeVoteDownQuery } from './queries/jokes';
import { pollVoteQuery } from './queries/poll';
import { recipeBookmarkAddToGroup, recipeBookmarkDelete, recipeBookmarkGroupAddRename, recipeBookmarkGroupDelete, voyoBookmarks, voyoBookmarkDelete, voyoBookmarkAdd } from './queries/bookmarks';
import { voyoCategoryQuery } from './queries/category';
import { videoQuery } from './queries/video';
import { liveStreamQuery, liveStreamReminder } from './queries/live_stream';
import { userProfiles, deleteProfile, updateProfile, addProfile } from './queries/profiles';
import { tvGetCode } from './queries/device';
import AppOptions from '../app/options';
import {fetchWithTimeout} from '../libs/fetch';
import EpgHlsUrlModel from '../model/epg_hls_url';
import VoyoCategoryModel from '../model/voyo_category';
import VideoModel from '../model/video';
import LiveStreamModel from '../model/live_stream';
import IspLoginCheckModel from '../model/isp_login';
import { ispLoginCheck, ispLoginJob, ispLogin } from './queries/isp_login';
import retryOnce from '../libs/retry';
import IspLoginJobModel from '../model/isp_login_job';
import { mailingSubscriptionsQuery, settingsUpdateSubscription, saveAccountEmail, saveAccountPassword, saveAccountCredentials, saveAccountTerms, saveCompany, saveSupervisionSettings, unlinkDevice, requestSupervisionPinCode, connectTV, forgottenPassword, sendConfirmationEmail, voyoPaymentPeriod, stopVoyoSubscription, resumeVoyoSubscription } from './queries/settings';
import { isSafary } from '../libs/util';
import { geoQuery } from './queries/geo';
import { accessCode, adyenStart, adyenCheck, adyenDirectPayment, billingCodeExists, paypal, billingCode } from './queries/billing';
import AdyenModel from '@core/model/adyen';

class GQL {
    public authToken: string = '';
    public deviceId: string = '';

    constructor(private options: AppOptions) { }

    // gqlc is cached on cdn for 5 seconds. set useGqlc = false if that is too long
    // for your use case.
    loginInfo = async (token: string, siteId: number, useGqlc = true): Promise<UserModel> => {
        if (useGqlc) {
            const url = loginInfoGqlc(token, siteId);

            return retryOnce(() =>
                this.fetchGQL(null, { method: 'GET', url, headers:{Authorization: token} })
            )
            .then(loginInfo => new UserModel(loginInfo));
        }

        const gqlData = loginInfoQuery(token, siteId);
        return this.fetchGQL(gqlData)
            .then(loginInfo => new UserModel(loginInfo));
    }

    loginUser = async (email: string, password: string, siteId: number): Promise<UserModel> => {
        const gqlData = loginUserQuery(email, password, siteId);
        return this.fetchGQL(gqlData)
            .then(login => new UserModel(login));
    }

    loginWithDevice = async (deviceName: string, deviceFamily: string, siteId: number): Promise<UserModel> => {
        const gqlData = loginWithDeviceQuery(deviceName, deviceFamily, siteId);
        return this.fetchGQL(gqlData)
            .then(loginDevice => new UserModel(loginDevice));
    }

    logoutUser = async (): Promise<boolean> => {
        const gqlData = logoutUserQuery();
        return this.fetchGQL(gqlData)
            .then(logout => logout ? true : false);
    }

    loginProfile = async (profileId: number): Promise<UserModel> => {
        const gqlData = loginProfileQuery(profileId);
        return this.fetchGQL(gqlData)
            .then(loginProfile => new UserModel(loginProfile));
    }

    geo = async (): Promise<GeoModel> => {
        const gqlData = geoQuery();
        return this.fetchGQL(gqlData)
            .then(geo => new GeoModel(geo));
    }

    newProfile = async (name: string, profileType: string, avatar: string): Promise<Array<ProfileModel>> => {
        const gqlData = addProfile(name, profileType, avatar);
        return this.fetchGQL(gqlData)
            .then(userProfiles => {
                if (!userProfiles) {
                    return [];
                }
                return userProfiles.profiles.map((p: any) => new ProfileModel(p));
            });
    }

    updateProfile = async (profileId: number, name: string, avatar: string): Promise<Array<ProfileModel>> => {
        const gqlData = updateProfile(profileId, name, avatar);
        return this.fetchGQL(gqlData)
            .then(userProfiles => {
                if (!userProfiles) {
                    return [];
                }
                return userProfiles.profiles.map((p: any) => new ProfileModel(p));
            });
    }

    deleteProfile = async (profileId: number): Promise<Array<ProfileModel>> => {
        const gqlData = deleteProfile(profileId);
        return this.fetchGQL(gqlData)
            .then(userProfiles => {
                if (!userProfiles) {
                    return [];
                }
                return userProfiles.profiles.map((p: any) => new ProfileModel(p));
            });
    }

    registerUser = async (email: string, password: string, nickname: string, gender: string, siteId: number, withLogin: boolean, companyName: string, companyVat: string, tel: string, telTermsAgreed: boolean, profilingTermsAgreed: boolean): Promise<UserModel> => {
        const gqlData = registerUser(email, password, nickname, gender, siteId, withLogin, companyName, companyVat, tel, telTermsAgreed, profilingTermsAgreed);
        return this.fetchGQL(gqlData)
            .then(register => new UserModel(register));
    }

    newPassword = async (password: string, token: string): Promise<UserModel> => {
        const gqlData = newPassword(password, token);
        return this.fetchGQL(gqlData)
            .then(newPassword => new UserModel(newPassword));
    }

    registerEmailOnly = async (email: string, siteId: number, mailingId: number, sendUnsubscribeEmail: boolean): Promise<any> => {
        const gqlData = registerEmailOnlyQuery(email, siteId, mailingId, sendUnsubscribeEmail);
        return this.fetchGQL(gqlData);
    }

    mailingSubscriptions = async (siteId: number, type: string = 'mail'): Promise<any> => {
        const gqlData = mailingSubscriptionsQuery(siteId, type);
        return this.fetchGQL(gqlData);
    }

    sendVoyoLoginToken = async (email: string, emailDesign: string): Promise<any> => {
        const gqlData = sendVoyoLoginToken(email, emailDesign);
        return this.fetchGQL(gqlData);
    }

    settingsUpdateSubscription = async (siteId: number, mailingId: number, subscribe: boolean, sendUnsubscribeEmail: boolean = true): Promise<any> => {
        const gqlData = settingsUpdateSubscription(siteId, mailingId, subscribe, sendUnsubscribeEmail);
        return this.fetchGQL(gqlData);
    }

    saveAccountEmail = async (email: string, password: string): Promise<any> => {
        const gqlData = saveAccountEmail(email, password);
        return this.fetchGQL(gqlData);
    }

    saveAccountPassword = async (password: string, newPassword: string): Promise<any> => {
        const gqlData = saveAccountPassword(password, newPassword);
        return this.fetchGQL(gqlData);
    }

    saveAccountCredentials = async (email: string, newPassword: string, password: string = ''): Promise<any> => {
        const gqlData = saveAccountCredentials(email, newPassword, password);
        return this.fetchGQL(gqlData);
    }

    saveCompany = async (companyName: string, companyVat: string): Promise<any> => {
        const gqlData = saveCompany(companyName, companyVat);
        return this.fetchGQL(gqlData);
    }

    saveAccountTerms = async (telTermsAgreed: boolean, profilingTermsAgreed: boolean): Promise<any> => {
        const gqlData = saveAccountTerms(telTermsAgreed, profilingTermsAgreed);
        return this.fetchGQL(gqlData);
    }
    
    unlinkDevice = async (id: number): Promise<any> => {
        const gqlData = unlinkDevice(id);
        return this.fetchGQL(gqlData);
    }

    connectTV = async (code: string): Promise<any> => {
        const gqlData = connectTV(code);
        return this.fetchGQL(gqlData);
    }
        
    requestSupervisionPinCode = async (): Promise<any> => {
        const gqlData = requestSupervisionPinCode();
        return this.fetchGQL(gqlData);
    }

    saveSupervisionSettings = async (restriction: string, pin: string): Promise<any> => {
        const gqlData = saveSupervisionSettings(restriction, pin);
        return this.fetchGQL(gqlData);
    }

    voyoPaymentPeriod = async (subscriptionId: number, period: string): Promise<{processed: boolean}> => {
        const gqlData = voyoPaymentPeriod(subscriptionId, period);
        return this.fetchGQL(gqlData);
    }

    stopVoyoSubscription = async (subscriptionId: number): Promise<{
        voyoSubscriptions: Array<any>,
        voyoPendingSubscriptions: Array<any>,
        token: string
    }> => {
        const gqlData = stopVoyoSubscription(subscriptionId);
        return this.fetchGQL(gqlData);
    }

    resumeVoyoSubscription = async (subscriptionId: number): Promise<{voyoSubscriptions: Array<any>, token: string}> => {
        const gqlData = resumeVoyoSubscription(subscriptionId);
        return this.fetchGQL(gqlData);
    }

    sendConfirmationEmail = async (siteId: number): Promise<any> => {
        const gqlData = sendConfirmationEmail(siteId);
        return this.fetchGQL(gqlData);
    }

    forgottenPassword = async (email: string, siteId: number): Promise<any> => {
        const gqlData = forgottenPassword(email, siteId);
        return this.fetchGQL(gqlData);
    }

    billingCode = async (giftCode?: string): Promise<any> => {
        const gqlData = billingCode(giftCode);
        return this.fetchGQL(gqlData);
    }

    accessCode = async (code: string): Promise<any> => {
        const gqlData = accessCode(code);
        return this.fetchGQL(gqlData);
    }

    billingCodeExists = async (code: string): Promise<any> => {
        const gqlData = billingCodeExists(code);
        return this.fetchGQL(gqlData);
    }

    adyenStart = async (accessCode: string, paymentType: string, promotionId: number, flags: string): Promise<AdyenModel> => {
        const gqlData = adyenStart(accessCode, paymentType, promotionId, flags);
        return this.fetchGQL(gqlData)
            .then(adyenStart => new AdyenModel(adyenStart));
    }

    adyenCheck = async (id?: number, subscriptionId?: number): Promise<any> => {
        const gqlData = adyenCheck(id, subscriptionId);
        return this.fetchGQL(gqlData);
    }

    adyenDirectPayment = async (id?: number, subscriptionId?: number): Promise<any> => {
        const gqlData = adyenDirectPayment(id, subscriptionId);
        return this.fetchGQL(gqlData);
    }

    paypal = async (id: string): Promise<any> => {
        const gqlData = paypal(id);
        return this.fetchGQL(gqlData);
    }

    voyoBookmarks = async (): Promise<BookmarkGroupsModel> => {
        const gqlData = voyoBookmarks();
        return this.fetchGQL(gqlData)
            .then(voyoBookmark => new BookmarkGroupsModel(voyoBookmark));
    }

    voyoBookmarkRemove = async (groupId: string, itemId: string): Promise<boolean> => {
        const gqlData = voyoBookmarkDelete(groupId, itemId);
        return this.fetchGQL(gqlData)
            .then(voyoBookmarkDelete => voyoBookmarkDelete ? true : false)
            .catch(() => false); // Mainly there's a call to remove item from stayedAt and it has already been removed.
    }

    voyoBookmarkAdd = async (groupId: string, bookmark: Bookmark): Promise<boolean> => {
        const gqlData = voyoBookmarkAdd(groupId, bookmark.entityId.toString(), bookmark.percent, bookmark.duration);
        return this.fetchGQL(gqlData, {timeout: 4000})
            .then(voyoBookmarkAdd => voyoBookmarkAdd ? true : false)
            .catch(() => false); // voyoBookmarkAdd timeouts a lot, so we make it quiet here
    }

    voyoProfiles = async (): Promise<Array<ProfileModel>> => {
        const gqlData = userProfiles();
        return this.fetchGQL(gqlData)
            .then(userProfiles => {
                if (!userProfiles) {
                    return [];
                }
                return userProfiles.profiles.map((p: any) => new ProfileModel(p));
            });
    }

    tvGetCode = async (deviceName: string, deviceFamily: string): Promise<TvCodeModel> => {
        const gqlData = tvGetCode(deviceName, deviceFamily);
        return this.fetchGQL(gqlData)
            .then(tvGetCode => {
                return new TvCodeModel(tvGetCode);
            });
    }

    ispLoginCheck = async (jobHash: string): Promise<IspLoginCheckModel> => {
        const gqlData = ispLoginCheck(jobHash);
        return this.fetchGQL(gqlData)
            .then(ispLoginCheck => new IspLoginCheckModel(ispLoginCheck));
    }

    ispLoginJob = async (provider: string, a1Token: string): Promise<IspLoginJobModel> => {
        const gqlData = ispLoginJob(provider, a1Token);
        return this.fetchGQL(gqlData)
            .then(ispLogin => new IspLoginJobModel(ispLogin));
    }

    ispLogin = async (username: string, password: string, provider: string): Promise<IspLoginJobModel> => {
        const gqlData = ispLogin(username, password, provider);
        return this.fetchGQL(gqlData)
            .then(ispLogin => new IspLoginJobModel(ispLogin));
    }

    videoUrlV2 = async (id: number): Promise<VideoUrlModel> => {
        const gqlData = videoUrlV2Query(id, this.options.siteId, isSafary());

        return this.fetchGQL(gqlData)
            .then(videoUrl => new VideoUrlModel(videoUrl));
    }

    linkDeviceToUser = async (family: string, name: string, model: string): Promise<UserModel> => {
        const gqlData = linkDeviceToUser(family, name, model);
        return this.fetchGQL(gqlData)
            .catch(err => {
                if (err instanceof GqlError && err.code === '404.300') {
                    throw new Error('too_many_devices');
                }
            })
            .then(linkDeviceToUser => new UserModel(linkDeviceToUser));
    }

    epgHlsUrl = async (channel: string, chunkStart: number, chunkEnd: number): Promise<EpgHlsUrlModel> => {
        const gqlData = epgHlsUrlQuery(channel, chunkStart, chunkEnd);

        return this.fetchGQL(gqlData)
            .then(epgHlsUrl => new EpgHlsUrlModel(epgHlsUrl));
    }

    epgHlsUrlV2 = async (channel: string, chunkStart: number, chunkEnd: number): Promise<EpgHlsUrlModel> => {
        const gqlData = epgHlsUrlV2Query(channel, chunkStart, chunkEnd, isSafary());

        return this.fetchGQL(gqlData)
            .then(epgHlsUrl => new EpgHlsUrlModel(epgHlsUrl));
    }

    commentVoteUp = async (articleId: number, commentId: string): Promise<any> => {
        const gqlData = commentVoteUpQuery(articleId, commentId);
        return this.fetchGQL(gqlData);
    }

    commentVoteDown = async (articleId: number, commentId: string): Promise<any> => {
        const gqlData = commentVoteDownQuery(articleId, commentId);
        return this.fetchGQL(gqlData);
    }

    commentAdd = async (articleId: number, text: string, replyTo: string): Promise<any> => {
        const gqlData = commentAddQuery(articleId, text, replyTo);
        return this.fetchGQL(gqlData);
    }

    jokeVoteUp = async (jokeId: number): Promise<any> => {
        const gqlData = jokeVoteUpQuery(jokeId);
        return this.fetchGQL(gqlData);
    }

    jokeVoteDown = async (jokeId: number): Promise<any> => {
        const gqlData = jokeVoteDownQuery(jokeId);
        return this.fetchGQL(gqlData);
    }

    pollVote = async (pollId: number, answerId: number, gender: string): Promise<any> => {
        const gqlData = pollVoteQuery(pollId, answerId, gender);
        return this.fetchGQL(gqlData);
    }

    recipeBookmarkDelete = async (groupId: string, itemId: string, ): Promise<any> => {
        const gqlData = recipeBookmarkDelete(groupId, itemId)
        return this.fetchGQL(gqlData);
    }

    recipeBookmarkGroupDelete = async (groupId: string): Promise<any> => {
        const gqlData = recipeBookmarkGroupDelete(groupId)
        return this.fetchGQL(gqlData);
    }

    recipeBookmarkGroupAddRename = async (groupId: string, name: string): Promise<any> => {
        const gqlData = recipeBookmarkGroupAddRename(groupId, name)
        return this.fetchGQL(gqlData);
    }

    recipeBookmarkAddToGroup = async (groupId: string, itemId: string): Promise<any> => {
        const gqlData = recipeBookmarkAddToGroup(groupId, itemId)
        return this.fetchGQL(gqlData);
    }

    voyoCategory = async (voyoCategoryId: number): Promise<VoyoCategoryModel> => {
        const gqlData = voyoCategoryQuery(voyoCategoryId);
        return this.fetchGQL(gqlData)
            .then(voyoCategory => new VoyoCategoryModel(voyoCategory));

    }

    video = async (mediaId: number): Promise<VideoModel> => {
        const gqlData = videoQuery(mediaId);
        return this.fetchGQL(gqlData)
            .then(video => new VideoModel(video));
    }

    liveStream = async (liveStreamId: number): Promise<LiveStreamModel> => {
        const gqlData = liveStreamQuery(liveStreamId);
        return this.fetchGQL(gqlData)
            .then(liveStream => new LiveStreamModel(liveStream));
    }

    liveStreamReminder = async (streamId: number): Promise<any> => {
        const gqlData = liveStreamReminder(streamId);
        return this.fetchGQL(gqlData).catch(() => {});
    }

    userMeta = async (key: string, value: string): Promise<any> => {
        const gqlData = userMetaQuery(key, value);
        return this.fetchGQL(gqlData);
    }

    pageHit = async (data: PagehitData): Promise<any> => {
        const url = this.options.eventsUrl + '/pagehitandevent';
        return this.fetchGQL(data, { url, skipCleanup: true });
    }

    private fetchGQL(data: GqlData | PagehitData | null, options: any = {}): Promise<any> {
        const method = options.method || 'POST';
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': this.authToken || options.headers?.Authorization || '',
            'Device-Id': this.deviceId,
            'Onl-Location': document.location.href,
        };
        const headers = Object.assign(defaultHeaders)
        const body = (method === 'POST') ? JSON.stringify(data) : null;
        const keepalive = options.keepalive || false;

        const gqlUrl = method === 'POST' ? this.options.graphQL : this.options.graphQLCDN;
        let url = options.url || gqlUrl;
        if (!url.startsWith('http')) {
            url = gqlUrl + url;
        }

        const timeout = options.timeout || 2000;

        return fetchWithTimeout(url, {method,headers,body,timeout,keepalive})
                .then(async (response) => {
                    if (!response.ok) {
                        const text = await response.text();
                        throw new Error('GQL:' + text);
                    }
                    return response.json();
                })
                .then((payload) => {
                    // If this was not a call to GQL than there's no need to
                    // clean it up.
                    if (options.skipCleanup) {
                        return payload;
                    }

                    // We need the first (and only) element from inside data
                    const values = Object.keys(payload.data || {}).map(key => payload.data[key]);
                    const gqlData = values.length ? values[0] : null;

                    // Throw error if we got errors and no valid data
                    if (!gqlData && payload.errors) {
                        (window as any).Sentry?.setContext("gqlError", {url, method,headers,body,timeout,keepalive});

                        throw new GqlError(payload.errors);
                    }

                    return gqlData;
                })
                .catch((error) => {
                    console.warn('Fetch error:', error);
                    throw error; // Re-throw to keep it as a rejection
                });
    }
}

export default GQL;

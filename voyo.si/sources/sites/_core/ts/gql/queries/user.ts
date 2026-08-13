import GqlData from "../gql_data";

const loginInfoGqlc = (token: string, siteId: number): string => {
    return '?query=onl_all_full_loginInfo(siteId:' + siteId + ')&rnd=' + token.substring(token.length-12);
};

const loginInfoQuery = (token: string, siteId: number): GqlData => {
    return {
        query: `query loginInfo($token: String! $siteId: Int!)
            {
                loginInfo(token: $token, siteId: $siteId)
                {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
        variables: { token, siteId }
    }
};

const loginUserQuery = (email: string, password: string, siteId: number): GqlData => {
    return {
        query: `query loginUser($email: String! $siteId: Int! $password: String!)
            {
                login(email: $email, siteId: $siteId, password: $password)
                {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
        variables: { email, siteId, password }
    }
};

const loginWithDeviceQuery = (deviceName: string, deviceFamily: string, siteId: number): GqlData => {
    return {
        query: `query LoginDevice($deviceName: String!, $deviceFamily: String!, $siteId: Int)
            {
                loginDevice(deviceName: $deviceName, deviceFamily: $deviceFamily, siteId: $siteId)
                {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
        variables: { deviceName, deviceFamily, siteId }
    }
};

const logoutUserQuery = (): GqlData => {
    return {
        query: `query logoutJwt
            {
                logoutJwt
                {
                    status
                }
            }`,
        variables: {}
    }
}

const loginProfileQuery = (profileId: number): GqlData => {
    return {
        query: `query loginProfile($profileId: Int!)
            {
                loginProfile(profileId: $profileId)
                {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
        variables: { profileId }
    }
};

const registerUser= (email: string, password: string, nickname: string, gender: string, siteId: number, withLogin: boolean, companyName: string, companyVat: string, tel: string, telTermsAgreed: boolean, profilingTermsAgreed: boolean): GqlData => {
    return {
        query: `mutation register($email: String! $password: String! $nickname: String! $gender: String! $siteId: Int! $withLogin: Boolean $company_name: String $company_vat: String $tel: String $telTermsAgreed: Boolean! $profilingTermsAgreed: Boolean!)
            {
                register(
                    email: $email
                    password: $password
                    nickname: $nickname
                    gender: $gender
                    withLogin: $withLogin
                    siteId: $siteId
                    company_name: $company_name
                    company_vat: $company_vat
                    tel: $tel
                    telTermsAgreed: $telTermsAgreed
                    profilingTermsAgreed: $profilingTermsAgreed
                ) {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
        variables: { email, password, nickname, gender, siteId, withLogin, company_name: companyName, company_vat: companyVat, tel, telTermsAgreed, profilingTermsAgreed }
    }
};

const registerEmailOnlyQuery = (email: string, siteId: number, mailingId: number, sendUnsubscribeEmail: boolean): GqlData => {
    return {
        query: `mutation registerEmailOnly($email: String! $siteId: Int! $mailingId: Int! $sendUnsubscribeEmail: Boolean!)
            {
                registerEmailOnly(email: $email, siteId: $siteId, mailingId: $mailingId, sendUnsubscribeEmail: $sendUnsubscribeEmail)
                {
                    email
                }
            }`,
        variables: { email, siteId, mailingId, sendUnsubscribeEmail }
    }
};

const linkDeviceToUser = (deviceFamily: string, deviceName: string, deviceModel: string): GqlData => {
    return {
        query: `query LinkDeviceToUser($deviceFamily: String! $deviceName: String! $deviceModel: String!)
            {
                linkDeviceToUser(
                        deviceFamily: $deviceFamily
                        deviceName: $deviceName
                        deviceModel: $deviceModel
                ) {
                    id token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
        variables: {deviceFamily,  deviceName, deviceModel }
    }
};

const newPassword = (password: string, token: string): GqlData => {
    return {
        query: `mutation newPassword($password: String!, $token: String!)
            {
                newPassword(password: $password, token: $token) {
                    token email avatar nickname
                    deviceId profileId status subscriptionUntil
                    profileType isSubscribed
                }
            }`,
        variables: { password, token }
    };
};

const sendVoyoLoginToken = (email: string, emailDesign: string): GqlData => {
    return {
        query: `mutation sendVoyoLoginToken($email: String! $emailDesign: String!)
            {
                sendVoyoLoginToken(email: $email, emailDesign: $emailDesign)
                {
                    status
                }
            }`,
        variables: { email, emailDesign }
    }
}

const userMetaQuery = (key: string, value: string): GqlData => {
    return {
        query: `mutation userMeta($key: String! $value: String!)
            {
                userMeta(key: $key value: $value) {
                    id
                }
            }`,
        variables: { key, value }
    }
};

export {
    loginInfoQuery,
    loginInfoGqlc,
    registerUser,
    registerEmailOnlyQuery,
    loginUserQuery,
    loginWithDeviceQuery,
    logoutUserQuery,
    loginProfileQuery,
    linkDeviceToUser,
    newPassword,
    sendVoyoLoginToken,
    userMetaQuery,
}


import GqlData from "../gql_data";

const mailingSubscriptionsQuery = (siteid: number, type: string = 'mail'): GqlData => {
    return {
        query: `query mailingSubscriptions($siteId: Int! $subscriptionsType: String!)
            {
                mailingSubscriptions(siteId: $siteId, subscriptionsType: $subscriptionsType)
                {
                    subscriptions {
                        id
                        subscribed
                        checkAgainAfter
                        allowMailingPopup
                    }
                }
            }`,
        variables: { siteId: siteid, subscriptionsType: type }
    }
};

const settingsUpdateSubscription = (siteid: number, mailingId: number, subscribed: boolean, sendUnsubscribeEmail: boolean = true): GqlData => {
    return {
        query: `mutation settingsSubscription($siteId: Int! $mailingId: Int! $subscribed: Boolean! $sendUnsubscribeEmail: Boolean!)
            {
                settingsSubscription(siteId: $siteId, mailingId: $mailingId, subscribed: $subscribed, sendUnsubscribeEmail: $sendUnsubscribeEmail)
                {
                    subscriptions {
                        id
                        subscribed
                    }
                }
            }`,
        variables: { siteId: siteid, mailingId, subscribed, sendUnsubscribeEmail }
    }
};

const saveAccountEmail = (email: string, password: string): GqlData => {
    return {
        query: `mutation settingsAccount($email: String!, $password: String!)
            {
                settingsAccount(email: $email, password: $password) {
                    token
                    account {
                        email
                    }
                }
            }`,
        variables: { email, password }
    }
};

const saveAccountPassword = (password: string, newPassword: string): GqlData => {
    return {
        query: `mutation settingsAccount($password: String!, $newPassword: String!)
            {
                settingsAccount(password: $password, newPassword: $newPassword) {
                    token
                }
            }`,
        variables: { password, newPassword }
    }
};

const saveAccountCredentials = (email: string, newPassword: string, password: string): GqlData => {
    return {
        query: `mutation settingsAccount($email: String!, $newPassword: String!, $password: String!)
            {
                settingsAccount(email: $email, newPassword: $newPassword, password: $password) {
                    token
                    account {
                        email
                        emailConfirmed
                    }
                }
            }`,
        variables: { email, newPassword, password }
    }
};

const saveCompany = (name: string, vat: string): GqlData => {
    return {
        query: `mutation settingsCompany($name: String!, $vat: String!)
            {
                settingsCompany(name: $name, vat: $vat) {
                    token
                    company {
                        name
                        vat
                    }
                }
            }`,
        variables: { name, vat }
    }
};

const saveAccountTerms = (telTermsAgreed: boolean, profilingTermsAgreed: boolean): GqlData => {
    return {
        query: `mutation settingsAccountTerms($telTermsAgreed: Boolean!, $profilingTermsAgreed: Boolean!)
            {
                settingsAccountTerms(telTermsAgreed: $telTermsAgreed, profilingTermsAgreed: $profilingTermsAgreed) {
                    token
                }
            }`,
        variables: { telTermsAgreed, profilingTermsAgreed }
    }
};

const unlinkDevice = (id: number): GqlData => {
    return {
        query: `query unlinkDevice($id: Int!)
            {
                unlinkDevice(id: $id) {
                    token
                }
            }`,
        variables: { id }
    }
};

const connectTV = (code: string): GqlData => {
    return {
        query: `mutation tv($code: String!)
            {
                tv(code: $code) {
                    message
                }
            }`,
        variables: { code }
    }
}

const requestSupervisionPinCode = (): GqlData => {
    return {
        query: `mutation settingsSupervisionSendPin {
            settingsSupervisionSendPin {
                status
            }
        }`,
        variables: {}
    };
};

const saveSupervisionSettings = (restriction: string, pin: string): GqlData => {
    return {
        query: `mutation settingsSupervision($restriction: String!, $pin: String!) {
            settingsSupervision(restriction: $restriction, pin: $pin) {
                token
                supervision {
                    restriction
                    userHasPin
                    parentalCtr {
                        age
                        description
                        image
                        enable
                    }
                }
            }
        }`,
        variables: { restriction, pin }
    };
}

const voyoPaymentPeriod = (subscriptionId: number, period: string): GqlData => {
    return {
        query: `mutation voyoPaymentPeriod($subscriptionId: Int!, $period: String!) {
            voyoPaymentPeriod(subscriptionId: $subscriptionId, period: $period) {
                processed
            }
        }`,
        variables: { subscriptionId, period }
    };
};

const stopVoyoSubscription = (subscriptionId: number): GqlData => {
    return {
        query: `mutation settingsStopVoyoSubscription($subscriptionId: Int!) {
            settingsStopVoyoSubscription(id: $subscriptionId) {
                voyoSubscriptions {
                    id
                    type
                    timeStart
                    timeEnd
                    productId
                    canResume
                    paymentPeriod
                    payments {
                        next
                        prev
                    }
                    creditCardInfo {
                        cardType
                        expiryDate
                        summary
                        holderName
                    }
                }
                voyoPendingSubscriptions {
                    id
                    type
                    timeStart
                    timeEnd
                    productId
                    canResume
                    paymentPeriod
                    payments {
                        next
                        prev
                        canUserTriggerPayment
                        attempts
                        lastPaymentError
                    }
                    creditCardInfo {
                        cardType
                        expiryDate
                        summary
                        holderName
                    }
                }
                token
            }
        }`,
        variables: { subscriptionId }
    };
};

const resumeVoyoSubscription = (subscriptionId: number): GqlData => {
    return {
        query: `mutation settingsResumeVoyoSubscription($subscriptionId: Int!) {
            settingsResumeVoyoSubscription(id: $subscriptionId) {
                voyoSubscriptions {
                    id
                    timeEnd
                    canResume
                    paymentPeriod
                    payments {
                        next
                        prev
                    }
                }
                token
            }
        }`,
        variables: { subscriptionId }
    };
};

const sendConfirmationEmail = (siteId: number): GqlData => {
    return {
        query: `mutation sendConfirmationEmail($siteId: Int!) {
            sendConfirmationEmail(siteId: $siteId) {
                status
            }
        }`,
        variables: { siteId }
    };
}

const forgottenPassword = (email: string, siteId: number): GqlData => {
    return {
        query: `query forgottenPassword($email: String!, $siteId: Int!)
            {
                forgottenPassword(email: $email, siteId: $siteId) {
                    status
                }
            }`,
        variables: { email, siteId }
    };
};

export {
    mailingSubscriptionsQuery,
    settingsUpdateSubscription,
    saveAccountEmail,
    saveAccountPassword,
    saveAccountCredentials,
    saveAccountTerms,
    saveCompany,
    unlinkDevice,
    connectTV,
    requestSupervisionPinCode,
    saveSupervisionSettings,
    voyoPaymentPeriod,
    stopVoyoSubscription,
    resumeVoyoSubscription,
    forgottenPassword,
    sendConfirmationEmail
}

import GqlData from "../gql_data";

const billingCode = (giftCode?: string): GqlData => {
    return {
        query: `query billingCode${giftCode ? '($giftCode: String)' : ''} {
            billingCode${giftCode ? '(giftCode: $giftCode)' : ''} {
                code activatedBy
            }
        }`,
        variables: giftCode ? { giftCode } : {}
    }
}

const accessCode = (code: string): GqlData => {
    return {
        query: `mutation code($code: String!)
            {
                code(code: $code) {
                    message code activatedBy
                    paymentInfo {
                        itemId itemName category price
                        discount quantity coupon
                    }
                }
            }`,
        variables: { code }
    }
}

const billingCodeExists = (code: string): GqlData => {
    return {
        query: `query billingCodeInfo($code: String!) {
            billingCodeInfo(code: $code) {
                exists isRecurring description reason
                code activatedBy status terms imageSrc
            }
        }`,
        variables: { code }
    }
}

const adyenStart = (accessCode: string, paymentType: string, promotionId: number, flags: string): GqlData => {
    return {
        query: `query adyenStart($accessCode: String!, $paymentType: String!, $promotionId: Int, $flags: String) {
            adyenStart(accessCode: $accessCode, paymentType: $paymentType, promotionId: $promotionId, flags: $flags) {
                id sessionData clientKey checkoutId amount 
                paymentInfo {
                    itemName category price discount quantity coupon
                }
            }
        }`,
        variables: { accessCode, paymentType, promotionId, flags }

    }
}

const adyenCheck = (id?: number, subscriptionId?: number): GqlData => {
    return {
        query: `query adyenCheck(${id ? '$id: Int,' : ''} ${subscriptionId ? '$subscriptionId: Int' : ''}) {
            adyenCheck(${id ? 'id: $id,' : ''} ${subscriptionId ? 'subscriptionId: $subscriptionId' : ''}) {
                status
                accessCode
                error {
                    code original description
                }  
            }
        }`,
        variables: { id, subscriptionId }
    }
}

const adyenDirectPayment = (id?: number, subscriptionId?: number): GqlData => {
    return {
        query: `query adyenDirectPayment(${id ? '$id: Int,' : ''} ${subscriptionId ? '$subscriptionId: Int' : ''}) {
            adyenDirectPayment(${id ? 'id: $id,' : ''} ${subscriptionId ? 'subscriptionId: $subscriptionId' : ''}) {
                status
                error {
                    code
                    original
                    description
                }
            }         
        }`,
        variables: { id, subscriptionId }
    }
}

const paypal = (id: string): GqlData => {
    return {
        query: `query paypal($id: String!) {
            paypal(id: $id) {
                status
            }
        }`,
        variables: { id }
    }
}

export { accessCode, billingCode, billingCodeExists, adyenStart, adyenCheck, adyenDirectPayment, paypal };

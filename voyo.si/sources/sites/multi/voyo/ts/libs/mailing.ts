import Html from "@core/libs/html";
import VoyoStbAppOptions from "../app/options";
import LocalStorage from "./local_storage";
import UserWithLogin from "./user_login";
import GQL from '@core/gql/gql';

class Mailing {
    private nextPopupAttemptAfter: number = 0;
    
    constructor(
        protected html: Html,
        protected user: UserWithLogin,
        protected options: VoyoStbAppOptions,
        protected gql: GQL,
        protected localStorage: LocalStorage,
    ) {
        this.nextPopupAttemptAfter = this.getNextMailingPopupAttemptAfter();
    }

    // TODO
    /* maybeShowMailingSubscriptionPopup(): void {
        if (!this.options.enableMailingPopup) {
            return;
        }

        // Check subscription status via GQL
        this.getMailingSubscription()
            .then((subscription) => {
                // if GQL sends that popup is not allowed
                if (!subscription.allowMailingPopup) {
                    return false;
                }

                // Already subscribed, no need to show popup, just mark the time checked. Do the same if mailingPopup is not allowed.
                if (subscription.subscribed) {
                    this.setNextMailingPopupAttemptAfter(subscription.checkAgainAfter);
                    return;
                }
    
                const currFocus = this.html.q('.nav_focused');
    
                if (!window.dialogShow) {
                    return;
                }
    
                window.dialogShow('dialog_mailing', '{{ T "base.dialogs.mailing.title" }}', '{{ T "base.dialogs.mailing.text" }}', 'mailing')
                    .then((answer: any) => {
    
                        if (answer === 'yes') {
                            // Call gql to subscribe user to mailing list.
                            this.updateMailingSubscription(subscription.id, true);
                        }

                        // In both cases (yes or no) update last check timestamp in localstorage
                        this.setNextMailingPopupAttemptAfter(subscription.checkAgainAfter);
                    });
            })
    } */

    getMailingSubscription(): Promise<any> {
        return this.gql.mailingSubscriptions(this.options.siteId, 'mail')
            .then((res) => {
                const subscription = res.subscriptions?.[0];
                if (!subscription) {
                    return Promise.reject('Subscription not found');
                }
                return subscription;
            });
    }

    updateMailingSubscription(mailingId: number, subscribe: boolean): Promise<any> {
        return this.gql.settingsUpdateSubscription(this.options.siteId, mailingId, subscribe);
    }

    getNextMailingPopupAttemptAfter(): number {
        let nextPopupAttemptAfter = this.localStorage.get<number>('mailingNextPopupAttemptAfter') || 0;

        if (!nextPopupAttemptAfter) {
            // We first had mailingLastPopupAttemptAt stored. This part calculates next attempt time
            // based on this deprecated mailingLastPopupAttemptAt. So that users who had just seen
            // popup don't get another popup when we release this code.
            // This if can be removed after may 2026 - mailingLastPopupAttemptAt will not be relevant
            const lastPopupAttemptAt = this.localStorage.get<number>('mailingLastPopupAttemptAt') || 0;
            if (lastPopupAttemptAt) {
                nextPopupAttemptAfter = lastPopupAttemptAt + 14 * 86400 * 1000;
                this.localStorage.remove('mailingLastPopupAttemptAt');
                this.localStorage.set<number>('mailingNextPopupAttemptAfter', nextPopupAttemptAfter);
            }
        }

        return nextPopupAttemptAfter;
    }

    /**
     * @param checkAgainAfter in seconds, how long we need to wait before we can show popup again.
     */
    setNextMailingPopupAttemptAfter(checkAgainAfter: number, timestamp: number | null = null ): void {
        if (timestamp === null) {
            timestamp = Date.now();
        }

        const nextCheckAfter = timestamp + checkAgainAfter * 1000;

        // Mark the time when we showed mailing subscription popup to user, so that we don't show it to him again for some time (eg: 1 month).
        this.localStorage.set<number>('mailingNextPopupAttemptAfter', nextCheckAfter);
    }

    canShowPopup(): boolean {
        // nextPopupAttemptAfter is timestamp of when we're allowed to showed mailing popup again.
        // It is calculated as: now + subscription.checkAgainAfter value
        if (this.nextPopupAttemptAfter && Date.now() < this.nextPopupAttemptAfter) {
            return false;
        }

        return true;
    }
}

export default Mailing;

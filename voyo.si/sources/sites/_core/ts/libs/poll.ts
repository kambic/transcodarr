import GQL from "../gql/gql";
import Html from "./html";
import Cookies from "./cookies";

class Poll {

    constructor(
        private html: Html,
        private gql: GQL,
        private cookies: Cookies,
    ) { }

    vote(pollId: number, gender: string): void {
        const e = this.html.q('#poll_' + pollId + ' input:checked') as HTMLInputElement;

        if (!e) {
            return;
        }

        this.gql.pollVote(pollId, +e.id, gender)
            .then(r => this.afterVote(pollId))
            .catch(err => this.onVoteError(err, pollId));
    }

    checkIfVoted(pollId: number): void {
        const votedPolls = this.cookies.get('votedPolls') || '';
        const votedPollIds = votedPolls.split(',');

        if (votedPollIds.includes(pollId.toString())) {
            this.afterVote(pollId);
        }
    }

    showResults(pollId: number, gender: string): void {
        this.html.hide('#poll_' + pollId + ' .poll-answers');
        this.html.removeClass('#poll_' + pollId + ' .poll-answers-btn-all', 'active');
        this.html.removeClass('#poll_' + pollId + ' .poll-answers-btn-male', 'active');
        this.html.removeClass('#poll_' + pollId + ' .poll-answers-btn-female', 'active');

        this.html.show('#poll_' + pollId + ' .poll-answers-' + gender);
        this.html.addClass('#poll_' + pollId + ' .poll-answers-btn-' + gender, 'active');
    }

    private afterVote(pollId: number): void {
        const votedPolls = this.cookies.get('votedPolls') || '';
        const votedPollIds = votedPolls.split(',');

        if (!votedPollIds.includes(pollId.toString())) {
            votedPollIds.push(pollId.toString());
            this.cookies.setIfImportantAllowed('votedPolls', votedPollIds.join(','));
        }

        this.html.hide('#poll_' + pollId + ' .poll-questions');
        this.html.show('#poll_' + pollId + ' .poll-answers-container');
    }

    private onVoteError(err: Error, pollId: number): void {
        const selector = '#poll_' + pollId + ' .poll-error';
        const selectorText = selector + ' .error-message';

        this.html.writeHTML(selectorText, err.message);
        this.html.show(selector, 'flex');

        setTimeout(() => {
            this.html.writeHTML(selectorText, '');
            this.html.hide(selector);
        }, 4000);
    }
}

export default Poll;
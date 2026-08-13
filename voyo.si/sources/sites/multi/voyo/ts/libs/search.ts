import Html from "@core/libs/html";
import VoyoAppOptions from "../app/options";

class Search {
    constructor(
        protected html: Html,
        private options: VoyoAppOptions
    ) {
    }

    performSearch( query: string, tag: string): Promise<void> {
        // Get base url from current url. We cannot use options.routes.search because we
        // need to have oto or 5ka in url also
        const url = window.location.href.split('?')[0];

        return this.html
            .fetchText(url + '?q=' + encodeURIComponent(query) + '&tag=' + encodeURIComponent(tag))
            .then((data) => {
                const browserUrl = new URL(window.location.href);
                if (query) {
                    browserUrl.searchParams.set('q', query);
                }
                if (tag) {
                    browserUrl.searchParams.set('tag', tag);
                }
                history.replaceState({}, '', browserUrl.toString());

                let extracted = this.html.extractHTML(data, '#searchResultsLibrary');
                this.html.writeHTML('#searchResultsLibrary', extracted);

                extracted = this.html.extractHTML(data, '#searchResultsTimeshift');
                this.html.writeHTML('#searchResultsTimeshift', extracted);

                extracted = this.html.extractHTML(data, '#searchTypes');

                const libraryResultsCount = this.html.extractData(extracted, '#searchTypesLibrary .results-count', 'total');
                this.html.setData('#searchTypesLibrary .results-count', 'total', libraryResultsCount);

                const timeshiftResults = this.html.q('#searchTypesTimeshift .results-count');
                if (timeshiftResults) {
                    const timeshiftResultsCount = this.html.extractData(extracted, '#searchTypesTimeshift .results-count', 'total');
                    this.html.setData(timeshiftResults, 'total', timeshiftResultsCount);
                }
            })
            .catch((err) => {
                console.error('Search failed:', err);
                throw err;
            });
    }
}

export default Search;

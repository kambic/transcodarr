import VoyoAppOptions from "../app/options";
import GQL from "@core/gql/gql";
import {BookmarkGroupsModel, Bookmark} from "@core/model/bookmarks";
import LocalStorage from "./local_storage";

class Bookmarks {
    private bookmarks: BookmarkGroupsModel | null = null;

    constructor(
        protected gql: GQL,
        protected localStorage: LocalStorage,
        protected options: VoyoAppOptions
    ) {
    }

    /**
     * Loads bookmarks in this order: localStorage cache, then the bookmarks
     * box (if the page has one and it's load promise is passed in), then GQL. If
     * none returns bookmarks, we set empty bookmarks so that started-bookmarks
     * event can fire.
     */
    async loadBookmarks(bookmarksBoxPromise: Promise<BookmarkGroupsModel | null>): Promise<BookmarkGroupsModel> {
        // Local storage
        let bookmarks = this.loadFromLocalStorage();
        if (bookmarks) {
            return bookmarks;
        }

        // Bookmarks box (if set)
        bookmarks = await bookmarksBoxPromise;
        if (bookmarks) {
            return bookmarks;
        }

        // GQL
        bookmarks = await this.fetch().catch(() => null);
        if (bookmarks) {
            return bookmarks;
        }

        // Set empty Bookmarks groups if we don't get anything from localstorage or gql
        return new BookmarkGroupsModel({
            groups: [
                { id: 'GRP_DEFAULT', items: [] },
                { id: 'stayedAt', items: [] },
            ],
        });
    }

    set(bookmarks: BookmarkGroupsModel): void {
        this.bookmarks = bookmarks;
        this.saveToLocalStorage();
    }

    get(): BookmarkGroupsModel|null {
        return this.bookmarks;
    }

    fetch(): Promise<BookmarkGroupsModel> {
        return this.gql.voyoBookmarks();
    }

    clear(): void {
        this.bookmarks = null;
        this.saveToLocalStorage();
    }

    isBookmarked(groupId: string, entityId: string | number): Bookmark | false {
        if (!this.bookmarks) {
            return false;
        }
        return this.bookmarks
            .groupItems(groupId)
            .find(b => b.entityId.toString() === entityId.toString()) || false;
    }

    voyoBookmarkRemove(groupId: string, entityId: string): Promise<any> {
        this.bookmarks?.remove(groupId, entityId.toString());
        this.saveToLocalStorage();

        return this.gql.voyoBookmarkRemove(groupId, entityId.toString());
    }

    voyoBookmarkAdd(groupId: string, bookmark: Bookmark):  Promise<any> {
        this.bookmarks?.add(groupId, bookmark);
        this.saveToLocalStorage();

        return this.gql.voyoBookmarkAdd(groupId, bookmark);
    }

    /**
     * VoyoCategoryStartWith is used to load the correct episode of a category based on the user's bookmarks.
     * It adds some extra logic on top of the bookmarks to determine the correct episode to load based on how much of the episode the user has watched.
     */
    voyoCategoryStartWith(voyokey: string): Promise<{startingEpisodeId: number, percent: number}> {
        const bookmarks = this.get();
        if (!bookmarks) {
            return Promise.resolve({startingEpisodeId: 0, percent: 0});
        }

        const bookmark: Bookmark | undefined = bookmarks.groupItems('stayedAt')
                .find((bookmark: Bookmark) => {
                    if (bookmark.voyokey === voyokey) {
                        return true;
                    }
                    return false;
                });

        // If bookmark is undefined, it means user has not yet watched any episode of the category with the given voyokey.
        // Route /play/category/{id}/episodes/{episodeId} uses episodeId = 0 to load the correct first episode.
        if (!bookmark) {
            return Promise.resolve({startingEpisodeId: 0, percent: 0});
        }

        // If user has watched the episode more than 90%, we consider it watched and inject the next episode.
        // go-bookmarks-api does the same, but this way we skip an extra API call that would refresh our bookmarks since we rely on caching them in local storage.
        // This also catches the edge case when the user has finished the latest episode that has no nextEpisode - in that case nextEntityId is 0 
        if (bookmark.percent >= 90 && bookmark.nextEntityId !== undefined) {
            return Promise.resolve({startingEpisodeId: +bookmark.nextEntityId, percent: 0});
        }

        // Otherwise, we return the episode where the user left off with the corresponding percent.
        return Promise.resolve({startingEpisodeId: +bookmark.entityId, percent: bookmark.percent});
    }

    /**
     * Save the current playback position as a bookmark in session storage to be consumed later
     * We do it like this so we can save the bookmark consistently after the user stops playback
     * even if they navigate away from the current page.
     */
    voyoBookmarkSaveCurrent(bookmark: Bookmark): void {
        this.saveCurrentToSessionStorage(bookmark);
    }

    voyoBookmarkConsumeCurrent(): Promise<any> {
        const bookmark = this.consumeCurrentFromSessionStorage();

        if (!bookmark) {
            return Promise.resolve(null);
        }

        return this.voyoBookmarkAdd('stayedAt', bookmark);
    }

    private saveToLocalStorage(): void {
        this.localStorage.set('voyoBookmarks', this.bookmarks, 60);
    }

    private loadFromLocalStorage(): BookmarkGroupsModel | null {
        const obj = this.localStorage.get<BookmarkGroupsModel>('voyoBookmarks');
        return obj ? new BookmarkGroupsModel(obj) : null;
    }

    private saveCurrentToSessionStorage(bookmark: Bookmark): void {
        sessionStorage.setItem('voyoBookmark', JSON.stringify(bookmark));
    }

    private consumeCurrentFromSessionStorage(): Bookmark | null {
        const str = sessionStorage.getItem('voyoBookmark');
        sessionStorage.removeItem('voyoBookmark');

        if (!str) {
            return null;
        }

        try {
            return JSON.parse(str) as Bookmark;
        } catch {
            console.log('Bad data in session storage', 'voyoBookmark', str);
            return null;
        }
    }

    get hasStayedAt(): boolean {
        return !!this.bookmarks && this.bookmarks.groupItems('stayedAt').length > 0;
    }

    get hasMyVoyo(): boolean {
        return !!this.bookmarks && this.bookmarks.groupItems('GRP_DEFAULT').length > 0;
    }
}

export default Bookmarks;
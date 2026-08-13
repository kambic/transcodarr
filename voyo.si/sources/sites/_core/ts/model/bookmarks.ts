export class BookmarkGroupsModel {
    groups: Array<VoyoBookmarkGroup>;

    constructor(data: any) {
        this.groups = data?.groups?.map((groupData: any) => new VoyoBookmarkGroup(groupData));
    }

    groupItems(groupId: string) {
        const group = this.groups?.find(g => g.id === groupId);
        return group ? group.items : [];
    }

    remove(groupId: string, voyokey: string): void {
        const group = this.groups?.find(g => g.id === groupId);
        if (!group) {
            return;
        }

        group.items = group.items.filter(b => b.entityId.toString() !== voyokey.toString());
    }

    add(groupId: string, bookmark: Bookmark): void {
        const group = this.groups?.find(g => g.id === groupId);
        if (!group) {
            return;
        }

        group.append(bookmark);
    }
}

class VoyoBookmarkGroup {
    id: string;
    items: Array<Bookmark>;

    constructor(data: any) {
        this.id = data['id'];
        this.items = data['items'].map((b:any) => new Bookmark(b));
    }

    append(bookmark: Bookmark): void {
        let index = this.items.findIndex(b => b.entityId === bookmark.entityId);

        if (index === -1 && bookmark.voyokey) {
            index = this.items.findIndex(b => b.voyokey === bookmark.voyokey);
        }

        if (index !== -1) {
            this.items[index] = bookmark;
            return;
        }

        this.items.push(bookmark);
    }
}

export class Bookmark {
    entityId: number;
    percent: number;
    duration: number;
    voyokey: string;
    nextEntityId?: number;

    constructor(data: any) {
        this.voyokey = data?.categoryId || data?.voyokey || '';
        this.entityId = data?.entityId || null;
        this.percent = data?.data?.percent || data?.percent || 0;
        this.duration = data?.data?.duration || data?.duration || 0;

        // NextEntityId is used for categories - it tells us which episode is next after the one currently bookmarked.
        // It is not sent to GQL and is only used locally to determine which episode to load in a category details page or player.
        if (data?.nextEntityId !== undefined) {
            this.nextEntityId = data.nextEntityId;
        }

        if (!this.voyokey && this.entityId) {
            this.voyokey = this.entityId.toString();
        }
        if (!this.entityId && this.voyokey) {
            this.entityId = +this.voyokey.replace('CAT_', '');
        }
    }

    get percent10(): number {
        return Math.ceil(this.percent / 10) * 10;
    }
}

export default BookmarkGroupsModel;
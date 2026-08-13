export {};

import ProfileModel from "@core/model/profile";

let debouncedSendEvent: Function|null = null;
let profileMenuHideTimeout: number = 0;

document.addEventListener('started', (event) => {
    debouncedSendEvent = app.rateLimiter.debounce(() => app.events.sendEvent('search', {}), 300);
});

document.addEventListener('started-user', (event) => {
    showUserProfiles();
});

function showUserProfiles(): void {
    app.profiles.voyoProfiles()
        .then(profiles => {
            if (!profiles || !profiles.length) {
                return;
            }
            renderProfiles(profiles);
            showCurrentProfile(profiles);
        });
}

function toggleSettingsPopup(): void {
    if (!window.app) {
        return;
    }

    if (app.html.hasClass('.popup_settings', 'active')) {
        hideSettingsPopup(0);
    } else {
        showSettingsPopup();
    }
}

// Adds 'active' class to settings popup when user clicks on profile icon in top menu
function showSettingsPopup(): void {
    if (!window.app) {
        return;
    }

    window.clearTimeout(profileMenuHideTimeout);
    app.html.addClass('.popup_settings', 'active');
}

// Removes 'active' class when user leaves settings popup div
function hideSettingsPopup(timeout = 1000): void {
    if (!window.app) {
        return;
    }

    window.clearTimeout(profileMenuHideTimeout);

    profileMenuHideTimeout = window.setTimeout(() => {
        app.html.removeClass('.popup_settings', 'active');
    }, timeout);
}

function loginToProfile(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const el = (event.target as HTMLElement).closest('[data-profile_id]');
    if (!el) {
        return;
    }

    const profileId = app.html.getData(el as HTMLElement, 'profile_id');

    app.user.loginToProfile(+profileId)
        .then(() => app.bookmarks.clear())
        .then(() => {
            if (app.user.user?.profileId) {
                app.profiles.redirectToProfileUrl(app.user.user.profileId);
            }
        });
}

function showCurrentProfile(profiles: Array<ProfileModel>): void {
    const currentProfileId = app.user.user ? app.user.user.profileId : 0;
    const profile = profiles.find(p => p.profileId === currentProfileId);

    if (!profile) {
        return;
    }

    const avatarImg = app.html.q('#current_profile_avatar') as HTMLImageElement;
    if (avatarImg) {
        avatarImg.src = profile.avatar;
    }
}

function renderProfiles(profiles: Array<ProfileModel>): void {
    const placeholder = app.html.q('#profiles');
    if (!placeholder) {
        return;
    }

    const template = placeholder.innerHTML;

    const html = profiles.map(() => template).join('');
    placeholder.innerHTML = html;

    const menuElts = app.html.qAll('.menu_link-profile', placeholder);
    const currentProfileId = app.user.user ? app.user.user.profileId : 0;

    for (let i=0; i<profiles.length; i++) {
        app.html.inject(menuElts[i], profiles[i]);
        app.html.setData(menuElts[i], 'profile_id', profiles[i].profileId);

        if (profiles[i].profileId === currentProfileId) {
            app.html.addClass(menuElts[i], 'menu_link-profile-active');
        }
    }

    app.html.removeClass(placeholder, 'hidden');
    app.events.startEvents(placeholder);
}

function logout(event: Event): void {
    app.user.logoutUser()
        .then(success => {
            document.location.href = '/';
        });
}

document.addEventListener('click', (event) => {
    const wrapper = (event.target as HTMLElement)
        .closest('.menu-mobile--hamburger')
        ?.closest('.menu-mobile--wrapper');

    if (!wrapper) return;

    event.preventDefault();

    wrapper.classList.toggle('menu-mobile--open');
});

function redirectIfNotOnSearchPage(query = ''): boolean { 
    const onSearchPage = document.location.href.includes(config.routes.search);

    if (onSearchPage) {
        return false;
    }

    // Not app.html.getData(): inline onclick can fire before app exists.
    const urlPrefix = document.body.dataset.urlPrefix || '';
    document.location.href = `${urlPrefix}${config.routes.search}${query ? '?q=' + encodeURIComponent(query) : ''}`;

    return true;
}

function onSearchInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value.trim();

    // Move user to /search if he's anywhere else
    if (redirectIfNotOnSearchPage(query)) {
        return;
    }
    if (!window.app || !debouncedSendEvent) {
        return;
    }

    // Load search results
    debouncedSendEvent();
}

function goToProfileEdit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    document.location.href = config.routes.settings_profiles;
}

window.showSettingsPopup = showSettingsPopup;
window.hideSettingsPopup = hideSettingsPopup;
window.toggleSettingsPopup = toggleSettingsPopup;
window.loginToProfile = loginToProfile;
window.goToProfileEdit = goToProfileEdit;
window.logout = logout;
window.onSearchInputChange = onSearchInputChange;
window.redirectToSearchPage = redirectIfNotOnSearchPage;

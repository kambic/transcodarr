"use strict";

(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", {
    value,
    configurable: true
  });
  var debouncedSendEvent = null;
  var profileMenuHideTimeout = 0;
  document.addEventListener("started", event => {
    debouncedSendEvent = app.rateLimiter.debounce(() => app.events.sendEvent("search", {}), 300);
  });
  document.addEventListener("started-user", event => {
    showUserProfiles();
  });
  function showUserProfiles() {
    app.profiles.voyoProfiles().then(profiles => {
      if (!profiles || !profiles.length) {
        return;
      }
      renderProfiles(profiles);
      showCurrentProfile(profiles);
    });
  }
  __name(showUserProfiles, "showUserProfiles");
  function toggleSettingsPopup() {
    if (!window.app) {
      return;
    }
    if (app.html.hasClass(".popup_settings", "active")) {
      hideSettingsPopup(0);
    } else {
      showSettingsPopup();
    }
  }
  __name(toggleSettingsPopup, "toggleSettingsPopup");
  function showSettingsPopup() {
    if (!window.app) {
      return;
    }
    window.clearTimeout(profileMenuHideTimeout);
    app.html.addClass(".popup_settings", "active");
  }
  __name(showSettingsPopup, "showSettingsPopup");
  function hideSettingsPopup() {
    var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1e3;
    if (!window.app) {
      return;
    }
    window.clearTimeout(profileMenuHideTimeout);
    profileMenuHideTimeout = window.setTimeout(() => {
      app.html.removeClass(".popup_settings", "active");
    }, timeout);
  }
  __name(hideSettingsPopup, "hideSettingsPopup");
  function loginToProfile(event) {
    event.preventDefault();
    event.stopPropagation();
    var el = event.target.closest("[data-profile_id]");
    if (!el) {
      return;
    }
    var profileId = app.html.getData(el, "profile_id");
    app.user.loginToProfile(+profileId).then(() => app.bookmarks.clear()).then(() => {
      var _a;
      if ((_a = app.user.user) == null ? void 0 : _a.profileId) {
        app.profiles.redirectToProfileUrl(app.user.user.profileId);
      }
    });
  }
  __name(loginToProfile, "loginToProfile");
  function showCurrentProfile(profiles) {
    var currentProfileId = app.user.user ? app.user.user.profileId : 0;
    var profile = profiles.find(p => p.profileId === currentProfileId);
    if (!profile) {
      return;
    }
    var avatarImg = app.html.q("#current_profile_avatar");
    if (avatarImg) {
      avatarImg.src = profile.avatar;
    }
  }
  __name(showCurrentProfile, "showCurrentProfile");
  function renderProfiles(profiles) {
    var placeholder = app.html.q("#profiles");
    if (!placeholder) {
      return;
    }
    var template = placeholder.innerHTML;
    var html = profiles.map(() => template).join("");
    placeholder.innerHTML = html;
    var menuElts = app.html.qAll(".menu_link-profile", placeholder);
    var currentProfileId = app.user.user ? app.user.user.profileId : 0;
    for (var i = 0; i < profiles.length; i++) {
      app.html.inject(menuElts[i], profiles[i]);
      app.html.setData(menuElts[i], "profile_id", profiles[i].profileId);
      if (profiles[i].profileId === currentProfileId) {
        app.html.addClass(menuElts[i], "menu_link-profile-active");
      }
    }
    app.html.removeClass(placeholder, "hidden");
    app.events.startEvents(placeholder);
  }
  __name(renderProfiles, "renderProfiles");
  function logout(event) {
    app.user.logoutUser().then(success => {
      document.location.href = "/";
    });
  }
  __name(logout, "logout");
  document.addEventListener("click", event => {
    var _a;
    var wrapper = (_a = event.target.closest(".menu-mobile--hamburger")) == null ? void 0 : _a.closest(".menu-mobile--wrapper");
    if (!wrapper) return;
    event.preventDefault();
    wrapper.classList.toggle("menu-mobile--open");
  });
  function redirectIfNotOnSearchPage() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var onSearchPage = document.location.href.includes(config.routes.search);
    if (onSearchPage) {
      return false;
    }
    var urlPrefix = document.body.dataset.urlPrefix || "";
    document.location.href = "".concat(urlPrefix).concat(config.routes.search).concat(query ? "?q=" + encodeURIComponent(query) : "");
    return true;
  }
  __name(redirectIfNotOnSearchPage, "redirectIfNotOnSearchPage");
  function onSearchInputChange(event) {
    var input = event.target;
    var query = input.value.trim();
    if (redirectIfNotOnSearchPage(query)) {
      return;
    }
    if (!window.app || !debouncedSendEvent) {
      return;
    }
    debouncedSendEvent();
  }
  __name(onSearchInputChange, "onSearchInputChange");
  function goToProfileEdit(event) {
    event.preventDefault();
    event.stopPropagation();
    document.location.href = config.routes.settings_profiles;
  }
  __name(goToProfileEdit, "goToProfileEdit");
  window.showSettingsPopup = showSettingsPopup;
  window.hideSettingsPopup = hideSettingsPopup;
  window.toggleSettingsPopup = toggleSettingsPopup;
  window.loginToProfile = loginToProfile;
  window.goToProfileEdit = goToProfileEdit;
  window.logout = logout;
  window.onSearchInputChange = onSearchInputChange;
  window.redirectToSearchPage = redirectIfNotOnSearchPage;
})();
//# sourceMappingURL=menu_top-S7DWBWGO.js.map
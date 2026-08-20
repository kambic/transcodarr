/*
 * Client-side behaviour for the explorer.
 *
 * The server owns all state that matters (tree, selection targets, clipboard,
 * operation log). This file only handles the things that would feel wrong with
 * a round trip: selection highlighting, shift-ranges, drag and drop, the
 * context menu, and keyboard shortcuts. Everything that mutates data ends up in
 * an HTMX request against one of the /op/ endpoints.
 */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const csrf = () =>
    document.body.getAttribute("hx-headers")
      ? JSON.parse(document.body.getAttribute("hx-headers"))["X-CSRFToken"]
      : "";

  let anchor = null;
  let dragging = null;

  // Endpoint URLs are rendered by Django into #op-urls, which lives inside the
  // workspace partial and therefore refreshes along with the location.
  const ops = () => $("#op-urls").dataset;

  /* ---------------------------------------------------------------- */
  /*  Selection                                                       */
  /* ---------------------------------------------------------------- */
  const checks = () => $$(".row-check");
  const checked = () => checks().filter((c) => c.checked);

  function syncSelection() {
    checks().forEach((c) => {
      const item = c.closest("[data-id]");
      if (item) item.classList.toggle("is-selected", c.checked);
    });

    const n = checked().length;
    const bar = $("#batchbar");
    if (bar) {
      bar.classList.toggle("hidden", n === 0);
      bar.classList.toggle("flex", n > 0);
      const label = $("#batch-count");
      if (label) {
        const folders = checked().filter(
          (c) => c.closest("[data-id]").dataset.kind === "folder"
        ).length;
        const files = n - folders;
        const parts = [];
        if (files) parts.push(`${files} file${files > 1 ? "s" : ""}`);
        if (folders) parts.push(`${folders} folder${folders > 1 ? "s" : ""}`);
        label.textContent = parts.join(" + ") + " selected";
      }
      const rename = $("#batch-rename");
      if (rename) rename.disabled = n !== 1;
    }

    const all = $("#select-all");
    if (all) {
      all.checked = n > 0 && n === checks().length;
      all.indeterminate = n > 0 && n < checks().length;
    }
  }

  function selectOnly(id) {
    checks().forEach((c) => (c.checked = c.value === id));
    anchor = id;
    syncSelection();
  }

  function selectRange(id) {
    const all = checks();
    const from = all.findIndex((c) => c.value === anchor);
    const to = all.findIndex((c) => c.value === id);
    if (from === -1 || to === -1) return selectOnly(id);
    const [lo, hi] = from < to ? [from, to] : [to, from];
    all.forEach((c, i) => (c.checked = i >= lo && i <= hi));
    syncSelection();
  }

  document.addEventListener("click", (e) => {
    if (e.target.id === "select-all") {
      const on = e.target.checked;
      checks().forEach((c) => (c.checked = on));
      return syncSelection();
    }
    if (e.target.classList.contains("row-check")) {
      anchor = e.target.value;
      return syncSelection();
    }
    if (e.target.id === "clear-selection") {
      checks().forEach((c) => (c.checked = false));
      return syncSelection();
    }

    const item = e.target.closest("[data-id]");
    if (item && !e.target.closest("button, a, input")) {
      const id = item.dataset.id;
      if (e.shiftKey && anchor) selectRange(id);
      else if (e.metaKey || e.ctrlKey) {
        const box = item.querySelector(".row-check");
        box.checked = !box.checked;
        anchor = id;
        syncSelection();
      } else selectOnly(id);
      return;
    }

    if (e.target.closest("#listing") && !item) {
      checks().forEach((c) => (c.checked = false));
      syncSelection();
    }
  });

  document.addEventListener("dblclick", (e) => {
    const item = e.target.closest("[data-id]");
    if (!item || e.target.closest("input")) return;
    openItem(item);
  });

  function openItem(item) {
    if (item.dataset.open) {
      htmx.ajax("GET", item.dataset.open, { target: "#workspace", swap: "innerHTML" });
    } else if (item.dataset.details) {
      htmx.ajax("GET", item.dataset.details, { target: "#modal-host", swap: "innerHTML" });
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Posting operations outside of declarative HTMX                  */
  /* ---------------------------------------------------------------- */
  async function postOperation(url, entries) {
    const body = new FormData();
    Object.entries(entries).forEach(([key, value]) => {
      (Array.isArray(value) ? value : [value]).forEach((v) => body.append(key, v));
    });
    const response = await fetch(url, {
      method: "POST",
      headers: { "X-CSRFToken": csrf(), "HX-Request": "true" },
      body,
    });
    const html = await response.text();
    htmx.swap("#workspace", html, { swapStyle: "innerHTML" });
  }

  /* ---------------------------------------------------------------- */
  /*  Drag and drop                                                   */
  /* ---------------------------------------------------------------- */
  document.addEventListener("dragstart", (e) => {
    const item = e.target.closest("[data-id]");
    if (!item) return;
    const id = item.dataset.id;
    if (!checked().some((c) => c.value === id)) selectOnly(id);
    dragging = checked().map((c) => c.value);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dragging.join(","));
    item.classList.add("dragging");
  });

  document.addEventListener("dragend", () => {
    dragging = null;
    $$(".dragging, .drop-target").forEach((el) =>
      el.classList.remove("dragging", "drop-target")
    );
  });

  document.addEventListener("dragover", (e) => {
    const target = e.target.closest("[data-drop]");
    if (!target || !dragging || dragging.includes(target.dataset.drop)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    $$(".drop-target").forEach((el) => el.classList.remove("drop-target"));
    target.classList.add("drop-target");
  });

  document.addEventListener("drop", (e) => {
    const target = e.target.closest("[data-drop]");
    if (!target || !dragging) return;
    e.preventDefault();
    target.classList.remove("drop-target");
    postOperation(ops().moveUrl, {
      ids: dragging,
      destination: target.dataset.drop,
    });
    dragging = null;
  });

  /* ---------------------------------------------------------------- */
  /*  Context menu                                                    */
  /* ---------------------------------------------------------------- */
  document.addEventListener("contextmenu", (e) => {
    if (!e.target.closest("#listing")) return;
    e.preventDefault();
    const item = e.target.closest("[data-id]");
    if (item && !checked().some((c) => c.value === item.dataset.id)) {
      selectOnly(item.dataset.id);
    }
    showMenu(e.clientX, e.clientY, item);
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".row-menu")) {
      const item = e.target.closest("[data-id]");
      selectOnly(item.dataset.id);
      const box = e.target.getBoundingClientRect();
      showMenu(box.left - 170, box.bottom + 4, item);
      return;
    }
    if (!e.target.closest("#ctxmenu")) $("#ctxmenu").classList.add("hidden");
  });

  function showMenu(x, y, item) {
    const menu = $("#ctxmenu");
    const urls = ops();
    const ids = checked().map((c) => c.value);
    const single = ids.length === 1;
    const trash = urls.special === "trash";
    const entries = [];

    if (item && !trash) {
      entries.push(["Open", () => openItem(item), single]);
      entries.push([
        "Details",
        () => openItem(item),
        single && !!item.dataset.details,
      ]);
      entries.push(["divider"]);
      entries.push(["Rename", () => openModal("rename", ids), single]);
      entries.push(["Star", () => postOperation(urls.starUrl, { ids, starred: "1" }), true]);
      entries.push(["Remove star", () => postOperation(urls.starUrl, { ids, starred: "0" }), true]);
      entries.push(["divider"]);
      entries.push(["Copy", () => postOperation(urls.clipboardUrl, { ids, mode: "copy" }), true]);
      entries.push(["Cut", () => postOperation(urls.clipboardUrl, { ids, mode: "cut" }), true]);
      entries.push(["Move to…", () => openModal("move", ids), true]);
      entries.push(["divider"]);
      entries.push(["Move to Trash", () => postOperation(urls.trashUrl, { ids }), true, "text-error"]);
    } else if (item && trash) {
      entries.push(["Restore", () => postOperation(urls.restoreUrl, { ids }), true]);
      entries.push(["Delete forever", () => openModal("purge", ids), true, "text-error"]);
    } else {
      entries.push(["New folder", () => openModal("new-folder", []), !trash]);
      entries.push(["Add files", () => $("#file-input").click(), !trash]);
      entries.push(["Paste", () => postOperation(urls.pasteUrl, {}), !trash]);
      entries.push(["divider"]);
      entries.push([
        "Select all",
        () => {
          checks().forEach((c) => (c.checked = true));
          syncSelection();
        },
        true,
      ]);
    }

    menu.innerHTML = entries
      .map(([label, , enabled, cls]) =>
        label === "divider"
          ? '<li class="border-t border-base-300 my-1"></li>'
          : `<li class="${enabled ? "" : "disabled"}"><a class="text-sm ${cls || ""}">${label}</a></li>`
      )
      .join("");
    menu.classList.remove("hidden");
    const box = menu.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(x, innerWidth - box.width - 8)) + "px";
    menu.style.top = Math.max(8, Math.min(y, innerHeight - box.height - 8)) + "px";
    $$("li", menu).forEach((li, i) => {
      const entry = entries[i];
      if (!entry || entry[0] === "divider" || !entry[2]) return;
      li.querySelector("a").onclick = () => {
        menu.classList.add("hidden");
        entry[1]();
      };
    });
  }

  function openModal(name, ids) {
    const query = ids.map((id) => `ids=${id}`).join("&");
    const url = ops().modalUrl.replace("__name__", name) + (query ? "?" + query : "");
    htmx.ajax("GET", url, {
      target: "#modal-host",
      swap: "innerHTML",
    });
  }

  /* ---------------------------------------------------------------- */
  /*  Modals, toasts, uploads, theme                                  */
  /* ---------------------------------------------------------------- */
  document.addEventListener("click", (e) => {
    if (e.target.closest(".modal-cancel, .modal-backdrop")) closeModal();
    const theme = e.target.closest("[data-theme-set]");
    if (theme) {
      document.documentElement.dataset.theme = theme.dataset.themeSet;
      document.activeElement.blur();
    }
    if (e.target.closest("#upload-button")) $("#file-input").click();
    if (e.target.closest("#activity-toggle")) $("#activity-panel").classList.toggle("translate-x-full");
    if (e.target.closest("#activity-close")) $("#activity-panel").classList.add("translate-x-full");
    if (e.target.closest("#nav-back")) history.back();
    if (e.target.closest("#nav-fwd")) history.forward();
  });

  function closeModal() {
    $("#modal-host").innerHTML = "";
  }

  document.body.addEventListener("htmx:afterSwap", (e) => {
    if (e.target.id === "modal-host") {
      const field = $("[data-select-stem]", e.target) || $("input[autofocus]", e.target);
      if (field) {
        field.focus();
        const dot = field.value.lastIndexOf(".");
        field.setSelectionRange(0, dot > 0 ? dot : field.value.length);
      }
    }
    syncSelection();
  });

  document.body.addEventListener("htmx:beforeSwap", (e) => {
    // Any successful request fired from inside a modal closes it.
    const source = e.detail.requestConfig && e.detail.requestConfig.elt;
    const fromModal = source && source.closest && source.closest("#modal-host");
    if (e.detail.target.id === "workspace" || (fromModal && e.detail.xhr.status < 400)) {
      closeModal();
    }
  });

  document.body.addEventListener("htmx:afterSwap", (e) => {
    // Conversions are worth seeing, so surface the drawer when one starts.
    if (e.target.id === "transcode-jobs" && e.target.querySelector("progress")) {
      $("#activity-panel").classList.remove("translate-x-full");
    }
  });

  document.body.addEventListener("htmx:xhr:progress", (e) => {
    const bar = $("#upload-progress");
    if (!bar || !e.detail.lengthComputable) return;
    bar.classList.remove("hidden");
    bar.value = (e.detail.loaded / e.detail.total) * 100;
    if (e.detail.loaded === e.detail.total) setTimeout(() => bar.classList.add("hidden"), 400);
  });

  new MutationObserver(() => {
    $$("#toasts .auto-dismiss").forEach((el) => {
      if (el.dataset.timed) return;
      el.dataset.timed = "1";
      setTimeout(() => el.remove(), 6000);
    });
  }).observe(document.getElementById("toasts") || document.body, { childList: true });

  /* ---------------------------------------------------------------- */
  /*  Keyboard                                                        */
  /* ---------------------------------------------------------------- */
  document.addEventListener("keydown", (e) => {
    if (/input|textarea|select/i.test(e.target.tagName)) {
      if (e.key === "Escape") e.target.blur();
      return;
    }
    if ($("#modal-host").innerHTML.trim()) {
      if (e.key === "Escape") closeModal();
      return;
    }
    const urls = ops();
    const ids = checked().map((c) => c.value);
    const mod = e.ctrlKey || e.metaKey;

    if (mod && e.key.toLowerCase() === "a") {
      e.preventDefault();
      checks().forEach((c) => (c.checked = true));
      syncSelection();
    } else if (mod && e.key.toLowerCase() === "c" && ids.length) {
      postOperation(urls.clipboardUrl, { ids, mode: "copy" });
    } else if (mod && e.key.toLowerCase() === "x" && ids.length) {
      postOperation(urls.clipboardUrl, { ids, mode: "cut" });
    } else if (mod && e.key.toLowerCase() === "v") {
      postOperation(urls.pasteUrl, {});
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (!ids.length) return;
      e.preventDefault();
      urls.special === "trash" ? openModal("purge", ids) : postOperation(urls.trashUrl, { ids });
    } else if (e.key === "F2" && ids.length === 1) {
      openModal("rename", ids);
    } else if (e.key === "Enter" && ids.length === 1) {
      openItem($(`[data-id="${ids[0]}"]`));
    } else if (e.key === "Escape") {
      checks().forEach((c) => (c.checked = false));
      syncSelection();
      $("#ctxmenu").classList.add("hidden");
    } else if (e.key === "/") {
      e.preventDefault();
      $("#search").focus();
    }
  });

  document.body.addEventListener("htmx:afterSettle", syncSelection);
  document.addEventListener("DOMContentLoaded", syncSelection);
  syncSelection();
})();

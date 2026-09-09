var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// node_modules/flowbite/lib/esm/dom/events.js
var Events = function() {
  function Events2(eventType, eventFunctions) {
    if (eventFunctions === undefined) {
      eventFunctions = [];
    }
    this._eventType = eventType;
    this._eventFunctions = eventFunctions;
  }
  Events2.prototype.init = function() {
    var _this = this;
    this._eventFunctions.forEach(function(eventFunction) {
      if (typeof window !== "undefined") {
        window.addEventListener(_this._eventType, eventFunction);
      }
    });
  };
  return Events2;
}();
var events_default = Events;

// node_modules/flowbite/lib/esm/dom/instances.js
var Instances = function() {
  function Instances2() {
    this._instances = {
      Accordion: {},
      Carousel: {},
      Collapse: {},
      Dial: {},
      Dismiss: {},
      Drawer: {},
      Dropdown: {},
      Modal: {},
      Popover: {},
      Tabs: {},
      Tooltip: {},
      InputCounter: {},
      CopyClipboard: {},
      Datepicker: {}
    };
  }
  Instances2.prototype.addInstance = function(component, instance, id, override) {
    if (override === undefined) {
      override = false;
    }
    if (!this._instances[component]) {
      console.warn("Flowbite: Component ".concat(component, " does not exist."));
      return false;
    }
    if (this._instances[component][id] && !override) {
      console.warn("Flowbite: Instance with ID ".concat(id, " already exists."));
      return;
    }
    if (override && this._instances[component][id]) {
      this._instances[component][id].destroyAndRemoveInstance();
    }
    this._instances[component][id ? id : this._generateRandomId()] = instance;
  };
  Instances2.prototype.getAllInstances = function() {
    return this._instances;
  };
  Instances2.prototype.getInstances = function(component) {
    if (!this._instances[component]) {
      console.warn("Flowbite: Component ".concat(component, " does not exist."));
      return false;
    }
    return this._instances[component];
  };
  Instances2.prototype.getInstance = function(component, id) {
    if (!this._componentAndInstanceCheck(component, id)) {
      return;
    }
    if (!this._instances[component][id]) {
      console.warn("Flowbite: Instance with ID ".concat(id, " does not exist."));
      return;
    }
    return this._instances[component][id];
  };
  Instances2.prototype.destroyAndRemoveInstance = function(component, id) {
    if (!this._componentAndInstanceCheck(component, id)) {
      return;
    }
    this.destroyInstanceObject(component, id);
    this.removeInstance(component, id);
  };
  Instances2.prototype.removeInstance = function(component, id) {
    if (!this._componentAndInstanceCheck(component, id)) {
      return;
    }
    delete this._instances[component][id];
  };
  Instances2.prototype.destroyInstanceObject = function(component, id) {
    if (!this._componentAndInstanceCheck(component, id)) {
      return;
    }
    this._instances[component][id].destroy();
  };
  Instances2.prototype.instanceExists = function(component, id) {
    if (!this._instances[component]) {
      return false;
    }
    if (!this._instances[component][id]) {
      return false;
    }
    return true;
  };
  Instances2.prototype._generateRandomId = function() {
    return Math.random().toString(36).substr(2, 9);
  };
  Instances2.prototype._componentAndInstanceCheck = function(component, id) {
    if (!this._instances[component]) {
      console.warn("Flowbite: Component ".concat(component, " does not exist."));
      return false;
    }
    if (!this._instances[component][id]) {
      console.warn("Flowbite: Instance with ID ".concat(id, " does not exist."));
      return false;
    }
    return true;
  };
  return Instances2;
}();
var instances = new Instances;
var instances_default = instances;
if (typeof window !== "undefined") {
  window.FlowbiteInstances = instances;
}

// node_modules/flowbite/lib/esm/components/accordion/index.js
var __assign = function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var Default = {
  alwaysOpen: false,
  activeClasses: "bg-neutral-secondary-medium text-heading",
  inactiveClasses: "bg-neutral-primary text-body",
  onOpen: function() {},
  onClose: function() {},
  onToggle: function() {}
};
var DefaultInstanceOptions = {
  id: null,
  override: true
};
var Accordion = function() {
  function Accordion2(accordionEl, items, options, instanceOptions) {
    if (accordionEl === undefined) {
      accordionEl = null;
    }
    if (items === undefined) {
      items = [];
    }
    if (options === undefined) {
      options = Default;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : accordionEl.id;
    this._accordionEl = accordionEl;
    this._items = items;
    this._options = __assign(__assign({}, Default), options);
    this._initialized = false;
    this.init();
    instances_default.addInstance("Accordion", this, this._instanceId, instanceOptions.override);
  }
  Accordion2.prototype.init = function() {
    var _this = this;
    if (this._items.length && !this._initialized) {
      this._items.forEach(function(item) {
        if (item.active) {
          _this.open(item.id);
        }
        var clickHandler = function() {
          _this.toggle(item.id);
        };
        item.triggerEl.addEventListener("click", clickHandler);
        item.clickHandler = clickHandler;
      });
      this._initialized = true;
    }
  };
  Accordion2.prototype.destroy = function() {
    if (this._items.length && this._initialized) {
      this._items.forEach(function(item) {
        item.triggerEl.removeEventListener("click", item.clickHandler);
        delete item.clickHandler;
      });
      this._initialized = false;
    }
  };
  Accordion2.prototype.removeInstance = function() {
    instances_default.removeInstance("Accordion", this._instanceId);
  };
  Accordion2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Accordion2.prototype.getItem = function(id) {
    return this._items.filter(function(item) {
      return item.id === id;
    })[0];
  };
  Accordion2.prototype.open = function(id) {
    var _a, _b;
    var _this = this;
    var item = this.getItem(id);
    if (!this._options.alwaysOpen) {
      this._items.map(function(i) {
        var _a2, _b2;
        if (i !== item) {
          (_a2 = i.triggerEl.classList).remove.apply(_a2, _this._options.activeClasses.split(" "));
          (_b2 = i.triggerEl.classList).add.apply(_b2, _this._options.inactiveClasses.split(" "));
          i.targetEl.classList.add("hidden");
          i.triggerEl.setAttribute("aria-expanded", "false");
          i.active = false;
          if (i.iconEl) {
            i.iconEl.classList.add("rotate-180");
          }
        }
      });
    }
    (_a = item.triggerEl.classList).add.apply(_a, this._options.activeClasses.split(" "));
    (_b = item.triggerEl.classList).remove.apply(_b, this._options.inactiveClasses.split(" "));
    item.triggerEl.setAttribute("aria-expanded", "true");
    item.targetEl.classList.remove("hidden");
    item.active = true;
    if (item.iconEl) {
      item.iconEl.classList.remove("rotate-180");
    }
    this._options.onOpen(this, item);
  };
  Accordion2.prototype.toggle = function(id) {
    var item = this.getItem(id);
    if (item.active) {
      this.close(id);
    } else {
      this.open(id);
    }
    this._options.onToggle(this, item);
  };
  Accordion2.prototype.close = function(id) {
    var _a, _b;
    var item = this.getItem(id);
    (_a = item.triggerEl.classList).remove.apply(_a, this._options.activeClasses.split(" "));
    (_b = item.triggerEl.classList).add.apply(_b, this._options.inactiveClasses.split(" "));
    item.targetEl.classList.add("hidden");
    item.triggerEl.setAttribute("aria-expanded", "false");
    item.active = false;
    if (item.iconEl) {
      item.iconEl.classList.add("rotate-180");
    }
    this._options.onClose(this, item);
  };
  Accordion2.prototype.updateOnOpen = function(callback) {
    this._options.onOpen = callback;
  };
  Accordion2.prototype.updateOnClose = function(callback) {
    this._options.onClose = callback;
  };
  Accordion2.prototype.updateOnToggle = function(callback) {
    this._options.onToggle = callback;
  };
  return Accordion2;
}();
function initAccordions() {
  document.querySelectorAll("[data-accordion]").forEach(function($accordionEl) {
    var alwaysOpen = $accordionEl.getAttribute("data-accordion");
    var activeClasses = $accordionEl.getAttribute("data-active-classes");
    var inactiveClasses = $accordionEl.getAttribute("data-inactive-classes");
    var items = [];
    $accordionEl.querySelectorAll("[data-accordion-target]").forEach(function($triggerEl) {
      if ($triggerEl.closest("[data-accordion]") === $accordionEl) {
        var item = {
          id: $triggerEl.getAttribute("data-accordion-target"),
          triggerEl: $triggerEl,
          targetEl: document.querySelector($triggerEl.getAttribute("data-accordion-target")),
          iconEl: $triggerEl.querySelector("[data-accordion-icon]"),
          active: $triggerEl.getAttribute("aria-expanded") === "true" ? true : false
        };
        items.push(item);
      }
    });
    new Accordion($accordionEl, items, {
      alwaysOpen: alwaysOpen === "open" ? true : false,
      activeClasses: activeClasses ? activeClasses : Default.activeClasses,
      inactiveClasses: inactiveClasses ? inactiveClasses : Default.inactiveClasses
    });
  });
}
if (typeof window !== "undefined") {
  window.Accordion = Accordion;
  window.initAccordions = initAccordions;
}

// node_modules/flowbite/lib/esm/components/collapse/index.js
var __assign2 = function() {
  __assign2 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign2.apply(this, arguments);
};
var Default2 = {
  onCollapse: function() {},
  onExpand: function() {},
  onToggle: function() {}
};
var DefaultInstanceOptions2 = {
  id: null,
  override: true
};
var Collapse = function() {
  function Collapse2(targetEl, triggerEl, options, instanceOptions) {
    if (targetEl === undefined) {
      targetEl = null;
    }
    if (triggerEl === undefined) {
      triggerEl = null;
    }
    if (options === undefined) {
      options = Default2;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions2;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
    this._targetEl = targetEl;
    this._triggerEl = triggerEl;
    this._options = __assign2(__assign2({}, Default2), options);
    this._visible = false;
    this._initialized = false;
    this.init();
    instances_default.addInstance("Collapse", this, this._instanceId, instanceOptions.override);
  }
  Collapse2.prototype.init = function() {
    var _this = this;
    if (this._triggerEl && this._targetEl && !this._initialized) {
      if (this._triggerEl.hasAttribute("aria-expanded")) {
        this._visible = this._triggerEl.getAttribute("aria-expanded") === "true";
      } else {
        this._visible = !this._targetEl.classList.contains("hidden");
      }
      this._clickHandler = function() {
        _this.toggle();
      };
      this._triggerEl.addEventListener("click", this._clickHandler);
      this._initialized = true;
    }
  };
  Collapse2.prototype.destroy = function() {
    if (this._triggerEl && this._initialized) {
      this._triggerEl.removeEventListener("click", this._clickHandler);
      this._initialized = false;
    }
  };
  Collapse2.prototype.removeInstance = function() {
    instances_default.removeInstance("Collapse", this._instanceId);
  };
  Collapse2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Collapse2.prototype.collapse = function() {
    this._targetEl.classList.add("hidden");
    if (this._triggerEl) {
      this._triggerEl.setAttribute("aria-expanded", "false");
    }
    this._visible = false;
    this._options.onCollapse(this);
  };
  Collapse2.prototype.expand = function() {
    this._targetEl.classList.remove("hidden");
    if (this._triggerEl) {
      this._triggerEl.setAttribute("aria-expanded", "true");
    }
    this._visible = true;
    this._options.onExpand(this);
  };
  Collapse2.prototype.toggle = function() {
    if (this._visible) {
      this.collapse();
    } else {
      this.expand();
    }
    this._options.onToggle(this);
  };
  Collapse2.prototype.updateOnCollapse = function(callback) {
    this._options.onCollapse = callback;
  };
  Collapse2.prototype.updateOnExpand = function(callback) {
    this._options.onExpand = callback;
  };
  Collapse2.prototype.updateOnToggle = function(callback) {
    this._options.onToggle = callback;
  };
  return Collapse2;
}();
function initCollapses() {
  document.querySelectorAll("[data-collapse-toggle]").forEach(function($triggerEl) {
    var targetId = $triggerEl.getAttribute("data-collapse-toggle");
    var $targetEl = document.getElementById(targetId);
    if ($targetEl) {
      if (!instances_default.instanceExists("Collapse", $targetEl.getAttribute("id"))) {
        new Collapse($targetEl, $triggerEl);
      } else {
        new Collapse($targetEl, $triggerEl, {}, {
          id: $targetEl.getAttribute("id") + "_" + instances_default._generateRandomId()
        });
      }
    } else {
      console.error('The target element with id "'.concat(targetId, '" does not exist. Please check the data-collapse-toggle attribute.'));
    }
  });
}
if (typeof window !== "undefined") {
  window.Collapse = Collapse;
  window.initCollapses = initCollapses;
}

// node_modules/flowbite/lib/esm/components/carousel/index.js
var __assign3 = function() {
  __assign3 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign3.apply(this, arguments);
};
var Default3 = {
  defaultPosition: 0,
  indicators: {
    items: [],
    activeClasses: "bg-white dark:bg-gray-800",
    inactiveClasses: "bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
  },
  interval: 3000,
  onNext: function() {},
  onPrev: function() {},
  onChange: function() {}
};
var DefaultInstanceOptions3 = {
  id: null,
  override: true
};
var Carousel = function() {
  function Carousel2(carouselEl, items, options, instanceOptions) {
    if (carouselEl === undefined) {
      carouselEl = null;
    }
    if (items === undefined) {
      items = [];
    }
    if (options === undefined) {
      options = Default3;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions3;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : carouselEl.id;
    this._carouselEl = carouselEl;
    this._items = items;
    this._options = __assign3(__assign3(__assign3({}, Default3), options), { indicators: __assign3(__assign3({}, Default3.indicators), options.indicators) });
    this._activeItem = this.getItem(this._options.defaultPosition);
    this._indicators = this._options.indicators.items;
    this._intervalDuration = this._options.interval;
    this._intervalInstance = null;
    this._initialized = false;
    this.init();
    instances_default.addInstance("Carousel", this, this._instanceId, instanceOptions.override);
  }
  Carousel2.prototype.init = function() {
    var _this = this;
    if (this._items.length && !this._initialized) {
      this._items.map(function(item) {
        item.el.classList.add("absolute", "inset-0", "transition-transform", "transform");
      });
      if (this.getActiveItem()) {
        this.slideTo(this.getActiveItem().position);
      } else {
        this.slideTo(0);
      }
      this._indicators.map(function(indicator, position) {
        indicator.el.addEventListener("click", function() {
          _this.slideTo(position);
        });
      });
      this._initialized = true;
    }
  };
  Carousel2.prototype.destroy = function() {
    if (this._initialized) {
      this._initialized = false;
    }
  };
  Carousel2.prototype.removeInstance = function() {
    instances_default.removeInstance("Carousel", this._instanceId);
  };
  Carousel2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Carousel2.prototype.getItem = function(position) {
    return this._items[position];
  };
  Carousel2.prototype.slideTo = function(position) {
    var nextItem = this._items[position];
    var rotationItems = {
      left: nextItem.position === 0 ? this._items[this._items.length - 1] : this._items[nextItem.position - 1],
      middle: nextItem,
      right: nextItem.position === this._items.length - 1 ? this._items[0] : this._items[nextItem.position + 1]
    };
    this._rotate(rotationItems);
    this._setActiveItem(nextItem);
    if (this._intervalInstance) {
      this.pause();
      this.cycle();
    }
    this._options.onChange(this);
  };
  Carousel2.prototype.next = function() {
    var activeItem = this.getActiveItem();
    var nextItem = null;
    if (activeItem.position === this._items.length - 1) {
      nextItem = this._items[0];
    } else {
      nextItem = this._items[activeItem.position + 1];
    }
    this.slideTo(nextItem.position);
    this._options.onNext(this);
  };
  Carousel2.prototype.prev = function() {
    var activeItem = this.getActiveItem();
    var prevItem = null;
    if (activeItem.position === 0) {
      prevItem = this._items[this._items.length - 1];
    } else {
      prevItem = this._items[activeItem.position - 1];
    }
    this.slideTo(prevItem.position);
    this._options.onPrev(this);
  };
  Carousel2.prototype._rotate = function(rotationItems) {
    this._items.map(function(item) {
      item.el.classList.add("hidden");
    });
    if (this._items.length === 1) {
      rotationItems.middle.el.classList.remove("-translate-x-full", "translate-x-full", "translate-x-0", "hidden", "z-10");
      rotationItems.middle.el.classList.add("translate-x-0", "z-20");
      return;
    }
    rotationItems.left.el.classList.remove("-translate-x-full", "translate-x-full", "translate-x-0", "hidden", "z-20");
    rotationItems.left.el.classList.add("-translate-x-full", "z-10");
    rotationItems.middle.el.classList.remove("-translate-x-full", "translate-x-full", "translate-x-0", "hidden", "z-10");
    rotationItems.middle.el.classList.add("translate-x-0", "z-30");
    rotationItems.right.el.classList.remove("-translate-x-full", "translate-x-full", "translate-x-0", "hidden", "z-30");
    rotationItems.right.el.classList.add("translate-x-full", "z-20");
  };
  Carousel2.prototype.cycle = function() {
    var _this = this;
    if (typeof window !== "undefined") {
      this._intervalInstance = window.setInterval(function() {
        _this.next();
      }, this._intervalDuration);
    }
  };
  Carousel2.prototype.pause = function() {
    clearInterval(this._intervalInstance);
  };
  Carousel2.prototype.getActiveItem = function() {
    return this._activeItem;
  };
  Carousel2.prototype._setActiveItem = function(item) {
    var _a, _b;
    var _this = this;
    this._activeItem = item;
    var position = item.position;
    if (this._indicators.length) {
      this._indicators.map(function(indicator) {
        var _a2, _b2;
        indicator.el.setAttribute("aria-current", "false");
        (_a2 = indicator.el.classList).remove.apply(_a2, _this._options.indicators.activeClasses.split(" "));
        (_b2 = indicator.el.classList).add.apply(_b2, _this._options.indicators.inactiveClasses.split(" "));
      });
      (_a = this._indicators[position].el.classList).add.apply(_a, this._options.indicators.activeClasses.split(" "));
      (_b = this._indicators[position].el.classList).remove.apply(_b, this._options.indicators.inactiveClasses.split(" "));
      this._indicators[position].el.setAttribute("aria-current", "true");
    }
  };
  Carousel2.prototype.updateOnNext = function(callback) {
    this._options.onNext = callback;
  };
  Carousel2.prototype.updateOnPrev = function(callback) {
    this._options.onPrev = callback;
  };
  Carousel2.prototype.updateOnChange = function(callback) {
    this._options.onChange = callback;
  };
  return Carousel2;
}();
function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach(function($carouselEl) {
    var interval = $carouselEl.getAttribute("data-carousel-interval");
    var slide = $carouselEl.getAttribute("data-carousel") === "slide" ? true : false;
    var items = [];
    var defaultPosition = 0;
    if ($carouselEl.querySelectorAll("[data-carousel-item]").length) {
      Array.from($carouselEl.querySelectorAll("[data-carousel-item]")).map(function($carouselItemEl, position) {
        items.push({
          position,
          el: $carouselItemEl
        });
        if ($carouselItemEl.getAttribute("data-carousel-item") === "active") {
          defaultPosition = position;
        }
      });
    }
    var indicators = [];
    if ($carouselEl.querySelectorAll("[data-carousel-slide-to]").length) {
      Array.from($carouselEl.querySelectorAll("[data-carousel-slide-to]")).map(function($indicatorEl) {
        indicators.push({
          position: parseInt($indicatorEl.getAttribute("data-carousel-slide-to")),
          el: $indicatorEl
        });
      });
    }
    var carousel = new Carousel($carouselEl, items, {
      defaultPosition,
      indicators: {
        items: indicators
      },
      interval: interval ? interval : Default3.interval
    });
    if (slide) {
      carousel.cycle();
    }
    var carouselNextEl = $carouselEl.querySelector("[data-carousel-next]");
    var carouselPrevEl = $carouselEl.querySelector("[data-carousel-prev]");
    if (carouselNextEl) {
      carouselNextEl.addEventListener("click", function() {
        carousel.next();
      });
    }
    if (carouselPrevEl) {
      carouselPrevEl.addEventListener("click", function() {
        carousel.prev();
      });
    }
  });
}
if (typeof window !== "undefined") {
  window.Carousel = Carousel;
  window.initCarousels = initCarousels;
}

// node_modules/flowbite/lib/esm/components/dismiss/index.js
var __assign4 = function() {
  __assign4 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign4.apply(this, arguments);
};
var Default4 = {
  transition: "transition-opacity",
  duration: 300,
  timing: "ease-out",
  onHide: function() {}
};
var DefaultInstanceOptions4 = {
  id: null,
  override: true
};
var Dismiss = function() {
  function Dismiss2(targetEl, triggerEl, options, instanceOptions) {
    if (targetEl === undefined) {
      targetEl = null;
    }
    if (triggerEl === undefined) {
      triggerEl = null;
    }
    if (options === undefined) {
      options = Default4;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions4;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
    this._targetEl = targetEl;
    this._triggerEl = triggerEl;
    this._options = __assign4(__assign4({}, Default4), options);
    this._initialized = false;
    this.init();
    instances_default.addInstance("Dismiss", this, this._instanceId, instanceOptions.override);
  }
  Dismiss2.prototype.init = function() {
    var _this = this;
    if (this._triggerEl && this._targetEl && !this._initialized) {
      this._clickHandler = function() {
        _this.hide();
      };
      this._triggerEl.addEventListener("click", this._clickHandler);
      this._initialized = true;
    }
  };
  Dismiss2.prototype.destroy = function() {
    if (this._triggerEl && this._initialized) {
      this._triggerEl.removeEventListener("click", this._clickHandler);
      this._initialized = false;
    }
  };
  Dismiss2.prototype.removeInstance = function() {
    instances_default.removeInstance("Dismiss", this._instanceId);
  };
  Dismiss2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Dismiss2.prototype.hide = function() {
    var _this = this;
    this._targetEl.classList.add(this._options.transition, "duration-".concat(this._options.duration), this._options.timing, "opacity-0");
    setTimeout(function() {
      _this._targetEl.classList.add("hidden");
    }, this._options.duration);
    this._options.onHide(this, this._targetEl);
  };
  Dismiss2.prototype.updateOnHide = function(callback) {
    this._options.onHide = callback;
  };
  return Dismiss2;
}();
function initDismisses() {
  document.querySelectorAll("[data-dismiss-target]").forEach(function($triggerEl) {
    var targetId = $triggerEl.getAttribute("data-dismiss-target");
    var $dismissEl = document.querySelector(targetId);
    if ($dismissEl) {
      new Dismiss($dismissEl, $triggerEl);
    } else {
      console.error('The dismiss element with id "'.concat(targetId, '" does not exist. Please check the data-dismiss-target attribute.'));
    }
  });
}
if (typeof window !== "undefined") {
  window.Dismiss = Dismiss;
  window.initDismisses = initDismisses;
}

// node_modules/@popperjs/core/lib/enums.js
var top = "top";
var bottom = "bottom";
var right = "right";
var left = "left";
var auto = "auto";
var basePlacements = [top, bottom, right, left];
var start = "start";
var end = "end";
var clippingParents = "clippingParents";
var viewport = "viewport";
var popper = "popper";
var reference = "reference";
var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
  return acc.concat([placement + "-" + start, placement + "-" + end]);
}, []);
var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
  return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
}, []);
var beforeRead = "beforeRead";
var read = "read";
var afterRead = "afterRead";
var beforeMain = "beforeMain";
var main = "main";
var afterMain = "afterMain";
var beforeWrite = "beforeWrite";
var write = "write";
var afterWrite = "afterWrite";
var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];
// node_modules/@popperjs/core/lib/dom-utils/getNodeName.js
function getNodeName(element) {
  return element ? (element.nodeName || "").toLowerCase() : null;
}

// node_modules/@popperjs/core/lib/dom-utils/getWindow.js
function getWindow2(node) {
  if (node == null) {
    return window;
  }
  if (node.toString() !== "[object Window]") {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }
  return node;
}

// node_modules/@popperjs/core/lib/dom-utils/instanceOf.js
function isElement(node) {
  var OwnElement = getWindow2(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}
function isHTMLElement(node) {
  var OwnElement = getWindow2(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}
function isShadowRoot(node) {
  if (typeof ShadowRoot === "undefined") {
    return false;
  }
  var OwnElement = getWindow2(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

// node_modules/@popperjs/core/lib/modifiers/applyStyles.js
function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function(name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element = state.elements[name];
    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    }
    Object.assign(element.style, style);
    Object.keys(attributes).forEach(function(name2) {
      var value = attributes[name2];
      if (value === false) {
        element.removeAttribute(name2);
      } else {
        element.setAttribute(name2, value === true ? "" : value);
      }
    });
  });
}
function effect(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: "0",
      top: "0",
      margin: "0"
    },
    arrow: {
      position: "absolute"
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;
  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }
  return function() {
    Object.keys(state.elements).forEach(function(name) {
      var element = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
      var style = styleProperties.reduce(function(style2, property) {
        style2[property] = "";
        return style2;
      }, {});
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function(attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
}
var applyStyles_default = {
  name: "applyStyles",
  enabled: true,
  phase: "write",
  fn: applyStyles,
  effect,
  requires: ["computeStyles"]
};

// node_modules/@popperjs/core/lib/utils/getBasePlacement.js
function getBasePlacement(placement) {
  return placement.split("-")[0];
}

// node_modules/@popperjs/core/lib/utils/math.js
var max = Math.max;
var min = Math.min;
var round = Math.round;

// node_modules/@popperjs/core/lib/utils/userAgent.js
function getUAString() {
  var uaData = navigator.userAgentData;
  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
    return uaData.brands.map(function(item) {
      return item.brand + "/" + item.version;
    }).join(" ");
  }
  return navigator.userAgent;
}

// node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js
function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}

// node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js
function getBoundingClientRect(element, includeScale, isFixedStrategy) {
  if (includeScale === undefined) {
    includeScale = false;
  }
  if (isFixedStrategy === undefined) {
    isFixedStrategy = false;
  }
  var clientRect = element.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;
  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
  }
  var _ref = isElement(element) ? getWindow2(element) : window, visualViewport = _ref.visualViewport;
  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  var width = clientRect.width / scaleX;
  var height = clientRect.height / scaleY;
  return {
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    x,
    y
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getLayoutRect.js
function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element);
  var width = element.offsetWidth;
  var height = element.offsetHeight;
  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }
  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }
  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width,
    height
  };
}

// node_modules/@popperjs/core/lib/dom-utils/contains.js
function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode();
  if (parent.contains(child)) {
    return true;
  } else if (rootNode && isShadowRoot(rootNode)) {
    var next = child;
    do {
      if (next && parent.isSameNode(next)) {
        return true;
      }
      next = next.parentNode || next.host;
    } while (next);
  }
  return false;
}

// node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js
function getComputedStyle2(element) {
  return getWindow2(element).getComputedStyle(element);
}

// node_modules/@popperjs/core/lib/dom-utils/isTableElement.js
function isTableElement(element) {
  return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
}

// node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
function getDocumentElement(element) {
  return ((isElement(element) ? element.ownerDocument : element.document) || window.document).documentElement;
}

// node_modules/@popperjs/core/lib/dom-utils/getParentNode.js
function getParentNode(element) {
  if (getNodeName(element) === "html") {
    return element;
  }
  return element.assignedSlot || element.parentNode || (isShadowRoot(element) ? element.host : null) || getDocumentElement(element);
}

// node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || getComputedStyle2(element).position === "fixed") {
    return null;
  }
  return element.offsetParent;
}
function getContainingBlock(element) {
  var isFirefox = /firefox/i.test(getUAString());
  var isIE = /Trident/i.test(getUAString());
  if (isIE && isHTMLElement(element)) {
    var elementCss = getComputedStyle2(element);
    if (elementCss.position === "fixed") {
      return null;
    }
  }
  var currentNode = getParentNode(element);
  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }
  while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle2(currentNode);
    if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }
  return null;
}
function getOffsetParent(element) {
  var window2 = getWindow2(element);
  var offsetParent = getTrueOffsetParent(element);
  while (offsetParent && isTableElement(offsetParent) && getComputedStyle2(offsetParent).position === "static") {
    offsetParent = getTrueOffsetParent(offsetParent);
  }
  if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle2(offsetParent).position === "static")) {
    return window2;
  }
  return offsetParent || getContainingBlock(element) || window2;
}

// node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js
function getMainAxisFromPlacement(placement) {
  return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
}

// node_modules/@popperjs/core/lib/utils/within.js
function within(min2, value, max2) {
  return max(min2, min(value, max2));
}
function withinMaxClamp(min2, value, max2) {
  var v = within(min2, value, max2);
  return v > max2 ? max2 : v;
}

// node_modules/@popperjs/core/lib/utils/getFreshSideObject.js
function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}

// node_modules/@popperjs/core/lib/utils/mergePaddingObject.js
function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}

// node_modules/@popperjs/core/lib/utils/expandToHashMap.js
function expandToHashMap(value, keys) {
  return keys.reduce(function(hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}

// node_modules/@popperjs/core/lib/modifiers/arrow.js
var toPaddingObject = function toPaddingObject2(padding, state) {
  padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
};
function arrow(_ref) {
  var _state$modifiersData$;
  var { state, name, options } = _ref;
  var arrowElement = state.elements.arrow;
  var popperOffsets = state.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement(state.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? "height" : "width";
  if (!arrowElement || !popperOffsets) {
    return;
  }
  var paddingObject = toPaddingObject(options.padding, state);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === "y" ? top : left;
  var maxProp = axis === "y" ? bottom : right;
  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
  var startDiff = popperOffsets[axis] - state.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2;
  var min2 = paddingObject[minProp];
  var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset = within(min2, center, max2);
  var axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
}
function effect2(_ref2) {
  var { state, options } = _ref2;
  var _options$element = options.element, arrowElement = _options$element === undefined ? "[data-popper-arrow]" : _options$element;
  if (arrowElement == null) {
    return;
  }
  if (typeof arrowElement === "string") {
    arrowElement = state.elements.popper.querySelector(arrowElement);
    if (!arrowElement) {
      return;
    }
  }
  if (!contains(state.elements.popper, arrowElement)) {
    return;
  }
  state.elements.arrow = arrowElement;
}
var arrow_default = {
  name: "arrow",
  enabled: true,
  phase: "main",
  fn: arrow,
  effect: effect2,
  requires: ["popperOffsets"],
  requiresIfExists: ["preventOverflow"]
};

// node_modules/@popperjs/core/lib/utils/getVariation.js
function getVariation(placement) {
  return placement.split("-")[1];
}

// node_modules/@popperjs/core/lib/modifiers/computeStyles.js
var unsetSides = {
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto"
};
function roundOffsetsByDPR(_ref, win) {
  var { x, y } = _ref;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}
function mapToStyles(_ref2) {
  var _Object$assign2;
  var { popper: popper2, popperRect, placement, variation, offsets, position, gpuAcceleration, adaptive, roundOffsets, isFixed } = _ref2;
  var _offsets$x = offsets.x, x = _offsets$x === undefined ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === undefined ? 0 : _offsets$y;
  var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
    x,
    y
  }) : {
    x,
    y
  };
  x = _ref3.x;
  y = _ref3.y;
  var hasX = offsets.hasOwnProperty("x");
  var hasY = offsets.hasOwnProperty("y");
  var sideX = left;
  var sideY = top;
  var win = window;
  if (adaptive) {
    var offsetParent = getOffsetParent(popper2);
    var heightProp = "clientHeight";
    var widthProp = "clientWidth";
    if (offsetParent === getWindow2(popper2)) {
      offsetParent = getDocumentElement(popper2);
      if (getComputedStyle2(offsetParent).position !== "static" && position === "absolute") {
        heightProp = "scrollHeight";
        widthProp = "scrollWidth";
      }
    }
    offsetParent = offsetParent;
    if (placement === top || (placement === left || placement === right) && variation === end) {
      sideY = bottom;
      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : offsetParent[heightProp];
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }
    if (placement === left || (placement === top || placement === bottom) && variation === end) {
      sideX = right;
      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : offsetParent[widthProp];
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }
  var commonStyles = Object.assign({
    position
  }, adaptive && unsetSides);
  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x,
    y
  }, getWindow2(popper2)) : {
    x,
    y
  };
  x = _ref4.x;
  y = _ref4.y;
  if (gpuAcceleration) {
    var _Object$assign;
    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }
  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
}
function computeStyles(_ref5) {
  var { state, options } = _ref5;
  var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === undefined ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === undefined ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === undefined ? true : _options$roundOffsets;
  var commonStyles = {
    placement: getBasePlacement(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration,
    isFixed: state.options.strategy === "fixed"
  };
  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive,
      roundOffsets
    })));
  }
  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: "absolute",
      adaptive: false,
      roundOffsets
    })));
  }
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    "data-popper-placement": state.placement
  });
}
var computeStyles_default = {
  name: "computeStyles",
  enabled: true,
  phase: "beforeWrite",
  fn: computeStyles,
  data: {}
};

// node_modules/@popperjs/core/lib/modifiers/eventListeners.js
var passive = {
  passive: true
};
function effect3(_ref) {
  var { state, instance, options } = _ref;
  var _options$scroll = options.scroll, scroll = _options$scroll === undefined ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === undefined ? true : _options$resize;
  var window2 = getWindow2(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
  if (scroll) {
    scrollParents.forEach(function(scrollParent) {
      scrollParent.addEventListener("scroll", instance.update, passive);
    });
  }
  if (resize) {
    window2.addEventListener("resize", instance.update, passive);
  }
  return function() {
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.removeEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.removeEventListener("resize", instance.update, passive);
    }
  };
}
var eventListeners_default = {
  name: "eventListeners",
  enabled: true,
  phase: "write",
  fn: function fn() {},
  effect: effect3,
  data: {}
};

// node_modules/@popperjs/core/lib/utils/getOppositePlacement.js
var hash = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function(matched) {
    return hash[matched];
  });
}

// node_modules/@popperjs/core/lib/utils/getOppositeVariationPlacement.js
var hash2 = {
  start: "end",
  end: "start"
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function(matched) {
    return hash2[matched];
  });
}

// node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js
function getWindowScroll(node) {
  var win = getWindow2(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft,
    scrollTop
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js
function getWindowScrollBarX(element) {
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}

// node_modules/@popperjs/core/lib/dom-utils/getViewportRect.js
function getViewportRect(element, strategy) {
  var win = getWindow2(element);
  var html = getDocumentElement(element);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
  var x = 0;
  var y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    var layoutViewport = isLayoutViewport();
    if (layoutViewport || !layoutViewport && strategy === "fixed") {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x: x + getWindowScrollBarX(element),
    y
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getDocumentRect.js
function getDocumentRect(element) {
  var _element$ownerDocumen;
  var html = getDocumentElement(element);
  var winScroll = getWindowScroll(element);
  var body = (_element$ownerDocumen = element.ownerDocument) == null ? undefined : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  var y = -winScroll.scrollTop;
  if (getComputedStyle2(body || html).direction === "rtl") {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}

// node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js
function isScrollParent(element) {
  var _getComputedStyle = getComputedStyle2(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}

// node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js
function getScrollParent(node) {
  if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
    return node.ownerDocument.body;
  }
  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }
  return getScrollParent(getParentNode(node));
}

// node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js
function listScrollParents(element, list) {
  var _element$ownerDocumen;
  if (list === undefined) {
    list = [];
  }
  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? undefined : _element$ownerDocumen.body);
  var win = getWindow2(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : updatedList.concat(listScrollParents(getParentNode(target)));
}

// node_modules/@popperjs/core/lib/utils/rectToClientRect.js
function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}

// node_modules/@popperjs/core/lib/dom-utils/getClippingRect.js
function getInnerBoundingClientRect(element, strategy) {
  var rect = getBoundingClientRect(element, false, strategy === "fixed");
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}
function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
}
function getClippingParents(element) {
  var clippingParents2 = listScrollParents(getParentNode(element));
  var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle2(element).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
  if (!isElement(clipperElement)) {
    return [];
  }
  return clippingParents2.filter(function(clippingParent) {
    return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
  });
}
function getClippingRect(element, boundary, rootBoundary, strategy) {
  var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
  var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents2[0];
  var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}

// node_modules/@popperjs/core/lib/utils/computeOffsets.js
function computeOffsets(_ref) {
  var { reference: reference2, element, placement } = _ref;
  var basePlacement = placement ? getBasePlacement(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference2.x + reference2.width / 2 - element.width / 2;
  var commonY = reference2.y + reference2.height / 2 - element.height / 2;
  var offsets;
  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference2.y - element.height
      };
      break;
    case bottom:
      offsets = {
        x: commonX,
        y: reference2.y + reference2.height
      };
      break;
    case right:
      offsets = {
        x: reference2.x + reference2.width,
        y: commonY
      };
      break;
    case left:
      offsets = {
        x: reference2.x - element.width,
        y: commonY
      };
      break;
    default:
      offsets = {
        x: reference2.x,
        y: reference2.y
      };
  }
  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
  if (mainAxis != null) {
    var len = mainAxis === "y" ? "height" : "width";
    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
        break;
      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
        break;
      default:
    }
  }
  return offsets;
}

// node_modules/@popperjs/core/lib/utils/detectOverflow.js
function detectOverflow(state, options) {
  if (options === undefined) {
    options = {};
  }
  var _options = options, _options$placement = _options.placement, placement = _options$placement === undefined ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === undefined ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === undefined ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === undefined ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === undefined ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === undefined ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === undefined ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var popperRect = state.rects.popper;
  var element = state.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  var referenceClientRect = getBoundingClientRect(state.elements.reference);
  var popperOffsets = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: "absolute",
    placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state.modifiersData.offset;
  if (elementContext === popper && offsetData) {
    var offset = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function(key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
      overflowOffsets[key] += offset[axis] * multiply;
    });
  }
  return overflowOffsets;
}

// node_modules/@popperjs/core/lib/utils/computeAutoPlacement.js
function computeAutoPlacement(state, options) {
  if (options === undefined) {
    options = {};
  }
  var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === undefined ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements2 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
    return getVariation(placement2) === variation;
  }) : basePlacements;
  var allowedPlacements = placements2.filter(function(placement2) {
    return allowedAutoPlacements.indexOf(placement2) >= 0;
  });
  if (allowedPlacements.length === 0) {
    allowedPlacements = placements2;
  }
  var overflows = allowedPlacements.reduce(function(acc, placement2) {
    acc[placement2] = detectOverflow(state, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding
    })[getBasePlacement(placement2)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function(a, b) {
    return overflows[a] - overflows[b];
  });
}

// node_modules/@popperjs/core/lib/modifiers/flip.js
function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement(placement) === auto) {
    return [];
  }
  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}
function flip(_ref) {
  var { state, options, name } = _ref;
  if (state.modifiersData[name]._skip) {
    return;
  }
  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === undefined ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === undefined ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === undefined ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
  var preferredPlacement = state.options.placement;
  var basePlacement = getBasePlacement(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
    return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
      placement: placement2,
      boundary,
      rootBoundary,
      padding,
      flipVariations,
      allowedAutoPlacements
    }) : placement2);
  }, []);
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var checksMap = new Map;
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements2[0];
  for (var i = 0;i < placements2.length; i++) {
    var placement = placements2[i];
    var _basePlacement = getBasePlacement(placement);
    var isStartVariation = getVariation(placement) === start;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? "width" : "height";
    var overflow = detectOverflow(state, {
      placement,
      boundary,
      rootBoundary,
      altBoundary,
      padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }
    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];
    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }
    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }
    if (checks.every(function(check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }
    checksMap.set(placement, checks);
  }
  if (makeFallbackChecks) {
    var numberOfChecks = flipVariations ? 3 : 1;
    var _loop = function _loop2(_i2) {
      var fittingPlacement = placements2.find(function(placement2) {
        var checks2 = checksMap.get(placement2);
        if (checks2) {
          return checks2.slice(0, _i2).every(function(check) {
            return check;
          });
        }
      });
      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };
    for (var _i = numberOfChecks;_i > 0; _i--) {
      var _ret = _loop(_i);
      if (_ret === "break")
        break;
    }
  }
  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
}
var flip_default = {
  name: "flip",
  enabled: true,
  phase: "main",
  fn: flip,
  requiresIfExists: ["offset"],
  data: {
    _skip: false
  }
};

// node_modules/@popperjs/core/lib/modifiers/hide.js
function getSideOffsets(overflow, rect, preventedOffsets) {
  if (preventedOffsets === undefined) {
    preventedOffsets = {
      x: 0,
      y: 0
    };
  }
  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x
  };
}
function isAnySideFullyClipped(overflow) {
  return [top, right, bottom, left].some(function(side) {
    return overflow[side] >= 0;
  });
}
function hide(_ref) {
  var { state, name } = _ref;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var preventedOffsets = state.modifiersData.preventOverflow;
  var referenceOverflow = detectOverflow(state, {
    elementContext: "reference"
  });
  var popperAltOverflow = detectOverflow(state, {
    altBoundary: true
  });
  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets,
    popperEscapeOffsets,
    isReferenceHidden,
    hasPopperEscaped
  };
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    "data-popper-reference-hidden": isReferenceHidden,
    "data-popper-escaped": hasPopperEscaped
  });
}
var hide_default = {
  name: "hide",
  enabled: true,
  phase: "main",
  requiresIfExists: ["preventOverflow"],
  fn: hide
};

// node_modules/@popperjs/core/lib/modifiers/offset.js
function distanceAndSkiddingToXY(placement, rects, offset) {
  var basePlacement = getBasePlacement(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
  var _ref = typeof offset === "function" ? offset(Object.assign({}, rects, {
    placement
  })) : offset, skidding = _ref[0], distance = _ref[1];
  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}
function offset(_ref2) {
  var { state, options, name } = _ref2;
  var _options$offset = options.offset, offset2 = _options$offset === undefined ? [0, 0] : _options$offset;
  var data = placements.reduce(function(acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
    return acc;
  }, {});
  var _data$state$placement = data[state.placement], x = _data$state$placement.x, y = _data$state$placement.y;
  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }
  state.modifiersData[name] = data;
}
var offset_default = {
  name: "offset",
  enabled: true,
  phase: "main",
  requires: ["popperOffsets"],
  fn: offset
};

// node_modules/@popperjs/core/lib/modifiers/popperOffsets.js
function popperOffsets(_ref) {
  var { state, name } = _ref;
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: "absolute",
    placement: state.placement
  });
}
var popperOffsets_default = {
  name: "popperOffsets",
  enabled: true,
  phase: "read",
  fn: popperOffsets,
  data: {}
};

// node_modules/@popperjs/core/lib/utils/getAltAxis.js
function getAltAxis(axis) {
  return axis === "x" ? "y" : "x";
}

// node_modules/@popperjs/core/lib/modifiers/preventOverflow.js
function preventOverflow(_ref) {
  var { state, options, name } = _ref;
  var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === undefined ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === undefined ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === undefined ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === undefined ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state, {
    boundary,
    rootBoundary,
    padding,
    altBoundary
  });
  var basePlacement = getBasePlacement(state.placement);
  var variation = getVariation(state.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets2 = state.modifiersData.popperOffsets;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  var data = {
    x: 0,
    y: 0
  };
  if (!popperOffsets2) {
    return;
  }
  if (checkMainAxis) {
    var _offsetModifierState$;
    var mainSide = mainAxis === "y" ? top : left;
    var altSide = mainAxis === "y" ? bottom : right;
    var len = mainAxis === "y" ? "height" : "width";
    var offset2 = popperOffsets2[mainAxis];
    var min2 = offset2 + overflow[mainSide];
    var max2 = offset2 - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
    var arrowElement = state.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide];
    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? undefined : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = offset2 + maxOffset - offsetModifierValue;
    var preventedOffset = within(tether ? min(min2, tetherMin) : min2, offset2, tether ? max(max2, tetherMax) : max2);
    popperOffsets2[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset2;
  }
  if (checkAltAxis) {
    var _offsetModifierState$2;
    var _mainSide = mainAxis === "x" ? top : left;
    var _altSide = mainAxis === "x" ? bottom : right;
    var _offset = popperOffsets2[altAxis];
    var _len = altAxis === "y" ? "height" : "width";
    var _min = _offset + overflow[_mainSide];
    var _max = _offset - overflow[_altSide];
    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? undefined : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
    popperOffsets2[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }
  state.modifiersData[name] = data;
}
var preventOverflow_default = {
  name: "preventOverflow",
  enabled: true,
  phase: "main",
  fn: preventOverflow,
  requiresIfExists: ["offset"]
};
// node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js
function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js
function getNodeScroll(node) {
  if (node === getWindow2(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}

// node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js
function isElementScaled(element) {
  var rect = element.getBoundingClientRect();
  var scaleX = round(rect.width) / element.offsetWidth || 1;
  var scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
}
function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === undefined) {
    isFixed = false;
  }
  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

// node_modules/@popperjs/core/lib/utils/orderModifiers.js
function order(modifiers) {
  var map = new Map;
  var visited = new Set;
  var result = [];
  modifiers.forEach(function(modifier) {
    map.set(modifier.name, modifier);
  });
  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function(dep) {
      if (!visited.has(dep)) {
        var depModifier = map.get(dep);
        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }
  modifiers.forEach(function(modifier) {
    if (!visited.has(modifier.name)) {
      sort(modifier);
    }
  });
  return result;
}
function orderModifiers(modifiers) {
  var orderedModifiers = order(modifiers);
  return modifierPhases.reduce(function(acc, phase) {
    return acc.concat(orderedModifiers.filter(function(modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}

// node_modules/@popperjs/core/lib/utils/debounce.js
function debounce(fn2) {
  var pending;
  return function() {
    if (!pending) {
      pending = new Promise(function(resolve) {
        Promise.resolve().then(function() {
          pending = undefined;
          resolve(fn2());
        });
      });
    }
    return pending;
  };
}

// node_modules/@popperjs/core/lib/utils/mergeByName.js
function mergeByName(modifiers) {
  var merged = modifiers.reduce(function(merged2, current) {
    var existing = merged2[current.name];
    merged2[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged2;
  }, {});
  return Object.keys(merged).map(function(key) {
    return merged[key];
  });
}

// node_modules/@popperjs/core/lib/createPopper.js
var DEFAULT_OPTIONS = {
  placement: "bottom",
  modifiers: [],
  strategy: "absolute"
};
function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0;_key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return !args.some(function(element) {
    return !(element && typeof element.getBoundingClientRect === "function");
  });
}
function popperGenerator(generatorOptions) {
  if (generatorOptions === undefined) {
    generatorOptions = {};
  }
  var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers = _generatorOptions$def === undefined ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions = _generatorOptions$def2 === undefined ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper(reference2, popper2, options) {
    if (options === undefined) {
      options = defaultOptions;
    }
    var state = {
      placement: "bottom",
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference: reference2,
        popper: popper2
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state,
      setOptions: function setOptions(setOptionsAction) {
        var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options2);
        state.scrollParents = {
          reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
          popper: listScrollParents(popper2)
        };
        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers)));
        state.orderedModifiers = orderedModifiers.filter(function(m) {
          return m.enabled;
        });
        runModifierEffects();
        return instance.update();
      },
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }
        var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
        if (!areValidElements(reference3, popper3)) {
          return;
        }
        state.rects = {
          reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
          popper: getLayoutRect(popper3)
        };
        state.reset = false;
        state.placement = state.options.placement;
        state.orderedModifiers.forEach(function(modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });
        for (var index = 0;index < state.orderedModifiers.length; index++) {
          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }
          var _state$orderedModifie = state.orderedModifiers[index], fn2 = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === undefined ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
          if (typeof fn2 === "function") {
            state = fn2({
              state,
              options: _options,
              name,
              instance
            }) || state;
          }
        }
      },
      update: debounce(function() {
        return new Promise(function(resolve) {
          instance.forceUpdate();
          resolve(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };
    if (!areValidElements(reference2, popper2)) {
      return instance;
    }
    instance.setOptions(options).then(function(state2) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state2);
      }
    });
    function runModifierEffects() {
      state.orderedModifiers.forEach(function(_ref) {
        var { name, options: _ref$options } = _ref, options2 = _ref$options === undefined ? {} : _ref$options, effect4 = _ref.effect;
        if (typeof effect4 === "function") {
          var cleanupFn = effect4({
            state,
            name,
            instance,
            options: options2
          });
          var noopFn = function noopFn2() {};
          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }
    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function(fn2) {
        return fn2();
      });
      effectCleanupFns = [];
    }
    return instance;
  };
}

// node_modules/@popperjs/core/lib/popper.js
var defaultModifiers = [eventListeners_default, popperOffsets_default, computeStyles_default, applyStyles_default, offset_default, flip_default, preventOverflow_default, arrow_default, hide_default];
var createPopper = /* @__PURE__ */ popperGenerator({
  defaultModifiers
});
// node_modules/flowbite/lib/esm/components/dropdown/index.js
var __assign5 = function() {
  __assign5 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign5.apply(this, arguments);
};
var __spreadArray = function(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar;i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
};
var Default5 = {
  placement: "bottom",
  triggerType: "click",
  offsetSkidding: 0,
  offsetDistance: 10,
  delay: 300,
  ignoreClickOutsideClass: false,
  onShow: function() {},
  onHide: function() {},
  onToggle: function() {}
};
var DefaultInstanceOptions5 = {
  id: null,
  override: true
};
var Dropdown = function() {
  function Dropdown2(targetElement, triggerElement, options, instanceOptions) {
    if (targetElement === undefined) {
      targetElement = null;
    }
    if (triggerElement === undefined) {
      triggerElement = null;
    }
    if (options === undefined) {
      options = Default5;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions5;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : targetElement.id;
    this._targetEl = targetElement;
    this._triggerEl = triggerElement;
    this._options = __assign5(__assign5({}, Default5), options);
    this._popperInstance = null;
    this._visible = false;
    this._initialized = false;
    this.init();
    instances_default.addInstance("Dropdown", this, this._instanceId, instanceOptions.override);
  }
  Dropdown2.prototype.init = function() {
    if (this._triggerEl && this._targetEl && !this._initialized) {
      this._popperInstance = this._createPopperInstance();
      this._setupEventListeners();
      this._initialized = true;
    }
  };
  Dropdown2.prototype.destroy = function() {
    var _this = this;
    var triggerEvents = this._getTriggerEvents();
    if (this._options.triggerType === "click") {
      triggerEvents.showEvents.forEach(function(ev) {
        _this._triggerEl.removeEventListener(ev, _this._clickHandler);
      });
    }
    if (this._options.triggerType === "hover") {
      triggerEvents.showEvents.forEach(function(ev) {
        _this._triggerEl.removeEventListener(ev, _this._hoverShowTriggerElHandler);
        _this._targetEl.removeEventListener(ev, _this._hoverShowTargetElHandler);
      });
      triggerEvents.hideEvents.forEach(function(ev) {
        _this._triggerEl.removeEventListener(ev, _this._hoverHideHandler);
        _this._targetEl.removeEventListener(ev, _this._hoverHideHandler);
      });
    }
    this._popperInstance.destroy();
    this._initialized = false;
  };
  Dropdown2.prototype.removeInstance = function() {
    instances_default.removeInstance("Dropdown", this._instanceId);
  };
  Dropdown2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Dropdown2.prototype._setupEventListeners = function() {
    var _this = this;
    var triggerEvents = this._getTriggerEvents();
    this._clickHandler = function() {
      _this.toggle();
    };
    if (this._options.triggerType === "click") {
      triggerEvents.showEvents.forEach(function(ev) {
        _this._triggerEl.addEventListener(ev, _this._clickHandler);
      });
    }
    this._hoverShowTriggerElHandler = function(ev) {
      if (ev.type === "click") {
        _this.toggle();
      } else {
        setTimeout(function() {
          _this.show();
        }, _this._options.delay);
      }
    };
    this._hoverShowTargetElHandler = function() {
      _this.show();
    };
    this._hoverHideHandler = function() {
      setTimeout(function() {
        if (!_this._targetEl.matches(":hover")) {
          _this.hide();
        }
      }, _this._options.delay);
    };
    if (this._options.triggerType === "hover") {
      triggerEvents.showEvents.forEach(function(ev) {
        _this._triggerEl.addEventListener(ev, _this._hoverShowTriggerElHandler);
        _this._targetEl.addEventListener(ev, _this._hoverShowTargetElHandler);
      });
      triggerEvents.hideEvents.forEach(function(ev) {
        _this._triggerEl.addEventListener(ev, _this._hoverHideHandler);
        _this._targetEl.addEventListener(ev, _this._hoverHideHandler);
      });
    }
  };
  Dropdown2.prototype._createPopperInstance = function() {
    return createPopper(this._triggerEl, this._targetEl, {
      placement: this._options.placement,
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [
              this._options.offsetSkidding,
              this._options.offsetDistance
            ]
          }
        }
      ]
    });
  };
  Dropdown2.prototype._setupClickOutsideListener = function() {
    var _this = this;
    this._clickOutsideEventListener = function(ev) {
      _this._handleClickOutside(ev, _this._targetEl);
    };
    document.body.addEventListener("click", this._clickOutsideEventListener, true);
  };
  Dropdown2.prototype._removeClickOutsideListener = function() {
    document.body.removeEventListener("click", this._clickOutsideEventListener, true);
  };
  Dropdown2.prototype._handleClickOutside = function(ev, targetEl) {
    var clickedEl = ev.target;
    var ignoreClickOutsideClass = this._options.ignoreClickOutsideClass;
    var isIgnored = false;
    if (ignoreClickOutsideClass) {
      var ignoredClickOutsideEls = document.querySelectorAll(".".concat(ignoreClickOutsideClass));
      ignoredClickOutsideEls.forEach(function(el) {
        if (el.contains(clickedEl)) {
          isIgnored = true;
          return;
        }
      });
    }
    if (clickedEl !== targetEl && !targetEl.contains(clickedEl) && !this._triggerEl.contains(clickedEl) && !isIgnored && this.isVisible()) {
      this.hide();
    }
  };
  Dropdown2.prototype._getTriggerEvents = function() {
    switch (this._options.triggerType) {
      case "hover":
        return {
          showEvents: ["mouseenter", "click"],
          hideEvents: ["mouseleave"]
        };
      case "click":
        return {
          showEvents: ["click"],
          hideEvents: []
        };
      case "none":
        return {
          showEvents: [],
          hideEvents: []
        };
      default:
        return {
          showEvents: ["click"],
          hideEvents: []
        };
    }
  };
  Dropdown2.prototype.toggle = function() {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
    this._options.onToggle(this);
  };
  Dropdown2.prototype.isVisible = function() {
    return this._visible;
  };
  Dropdown2.prototype.show = function() {
    this._targetEl.classList.remove("hidden");
    this._targetEl.classList.add("block");
    this._targetEl.removeAttribute("aria-hidden");
    this._popperInstance.setOptions(function(options) {
      return __assign5(__assign5({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
        { name: "eventListeners", enabled: true }
      ], false) });
    });
    this._setupClickOutsideListener();
    this._popperInstance.update();
    this._visible = true;
    this._options.onShow(this);
  };
  Dropdown2.prototype.hide = function() {
    this._targetEl.classList.remove("block");
    this._targetEl.classList.add("hidden");
    this._targetEl.setAttribute("aria-hidden", "true");
    this._popperInstance.setOptions(function(options) {
      return __assign5(__assign5({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
        { name: "eventListeners", enabled: false }
      ], false) });
    });
    this._visible = false;
    this._removeClickOutsideListener();
    this._options.onHide(this);
  };
  Dropdown2.prototype.updateOnShow = function(callback) {
    this._options.onShow = callback;
  };
  Dropdown2.prototype.updateOnHide = function(callback) {
    this._options.onHide = callback;
  };
  Dropdown2.prototype.updateOnToggle = function(callback) {
    this._options.onToggle = callback;
  };
  return Dropdown2;
}();
function initDropdowns() {
  document.querySelectorAll("[data-dropdown-toggle]").forEach(function($triggerEl) {
    var dropdownId = $triggerEl.getAttribute("data-dropdown-toggle");
    var $dropdownEl = document.getElementById(dropdownId);
    if ($dropdownEl) {
      var placement = $triggerEl.getAttribute("data-dropdown-placement");
      var offsetSkidding = $triggerEl.getAttribute("data-dropdown-offset-skidding");
      var offsetDistance = $triggerEl.getAttribute("data-dropdown-offset-distance");
      var triggerType = $triggerEl.getAttribute("data-dropdown-trigger");
      var delay = $triggerEl.getAttribute("data-dropdown-delay");
      var ignoreClickOutsideClass = $triggerEl.getAttribute("data-dropdown-ignore-click-outside-class");
      new Dropdown($dropdownEl, $triggerEl, {
        placement: placement ? placement : Default5.placement,
        triggerType: triggerType ? triggerType : Default5.triggerType,
        offsetSkidding: offsetSkidding ? parseInt(offsetSkidding) : Default5.offsetSkidding,
        offsetDistance: offsetDistance ? parseInt(offsetDistance) : Default5.offsetDistance,
        delay: delay ? parseInt(delay) : Default5.delay,
        ignoreClickOutsideClass: ignoreClickOutsideClass ? ignoreClickOutsideClass : Default5.ignoreClickOutsideClass
      });
    } else {
      console.error('The dropdown element with id "'.concat(dropdownId, '" does not exist. Please check the data-dropdown-toggle attribute.'));
    }
  });
}
if (typeof window !== "undefined") {
  window.Dropdown = Dropdown;
  window.initDropdowns = initDropdowns;
}

// node_modules/flowbite/lib/esm/components/modal/index.js
var __assign6 = function() {
  __assign6 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign6.apply(this, arguments);
};
var Default6 = {
  placement: "center",
  backdropClasses: "bg-dark-backdrop/70 fixed inset-0 z-40",
  backdrop: "dynamic",
  closable: true,
  onHide: function() {},
  onShow: function() {},
  onToggle: function() {}
};
var DefaultInstanceOptions6 = {
  id: null,
  override: true
};
var Modal = function() {
  function Modal2(targetEl, options, instanceOptions) {
    if (targetEl === undefined) {
      targetEl = null;
    }
    if (options === undefined) {
      options = Default6;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions6;
    }
    this._eventListenerInstances = [];
    this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
    this._targetEl = targetEl;
    this._options = __assign6(__assign6({}, Default6), options);
    this._isHidden = true;
    this._backdropEl = null;
    this._initialized = false;
    this.init();
    instances_default.addInstance("Modal", this, this._instanceId, instanceOptions.override);
  }
  Modal2.prototype.init = function() {
    var _this = this;
    if (this._targetEl && !this._initialized) {
      this._getPlacementClasses().map(function(c) {
        _this._targetEl.classList.add(c);
      });
      this._initialized = true;
    }
  };
  Modal2.prototype.destroy = function() {
    if (this._initialized) {
      this.removeAllEventListenerInstances();
      this._destroyBackdropEl();
      this._initialized = false;
    }
  };
  Modal2.prototype.removeInstance = function() {
    instances_default.removeInstance("Modal", this._instanceId);
  };
  Modal2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Modal2.prototype._createBackdrop = function() {
    var _a;
    if (this._isHidden) {
      var backdropEl = document.createElement("div");
      (_a = backdropEl.classList).add.apply(_a, this._options.backdropClasses.split(" "));
      document.querySelector("body").append(backdropEl);
      this._backdropEl = backdropEl;
    }
  };
  Modal2.prototype._destroyBackdropEl = function() {
    if (!this._isHidden && this._backdropEl) {
      this._backdropEl.remove();
      this._backdropEl = null;
    }
  };
  Modal2.prototype._setupModalCloseEventListeners = function() {
    var _this = this;
    if (this._options.backdrop === "dynamic") {
      this._clickOutsideEventListener = function(ev) {
        _this._handleOutsideClick(ev.target);
      };
      this._targetEl.addEventListener("click", this._clickOutsideEventListener, true);
    }
    this._keydownEventListener = function(ev) {
      if (ev.key === "Escape") {
        _this.hide();
      }
    };
    document.body.addEventListener("keydown", this._keydownEventListener, true);
  };
  Modal2.prototype._removeModalCloseEventListeners = function() {
    if (this._options.backdrop === "dynamic") {
      this._targetEl.removeEventListener("click", this._clickOutsideEventListener, true);
    }
    document.body.removeEventListener("keydown", this._keydownEventListener, true);
  };
  Modal2.prototype._handleOutsideClick = function(target) {
    if (target === this._targetEl || target === this._backdropEl && this.isVisible()) {
      this.hide();
    }
  };
  Modal2.prototype._getPlacementClasses = function() {
    switch (this._options.placement) {
      case "top-left":
        return ["justify-start", "items-start"];
      case "top-center":
        return ["justify-center", "items-start"];
      case "top-right":
        return ["justify-end", "items-start"];
      case "center-left":
        return ["justify-start", "items-center"];
      case "center":
        return ["justify-center", "items-center"];
      case "center-right":
        return ["justify-end", "items-center"];
      case "bottom-left":
        return ["justify-start", "items-end"];
      case "bottom-center":
        return ["justify-center", "items-end"];
      case "bottom-right":
        return ["justify-end", "items-end"];
      default:
        return ["justify-center", "items-center"];
    }
  };
  Modal2.prototype.toggle = function() {
    if (this._isHidden) {
      this.show();
    } else {
      this.hide();
    }
    this._options.onToggle(this);
  };
  Modal2.prototype.show = function() {
    if (this.isHidden()) {
      this._targetEl.classList.add("flex");
      this._targetEl.classList.remove("hidden");
      this._targetEl.setAttribute("aria-modal", "true");
      this._targetEl.setAttribute("role", "dialog");
      this._targetEl.removeAttribute("aria-hidden");
      this._createBackdrop();
      this._isHidden = false;
      if (this._options.closable) {
        this._setupModalCloseEventListeners();
      }
      document.body.classList.add("overflow-hidden");
      this._options.onShow(this);
    }
  };
  Modal2.prototype.hide = function() {
    if (this.isVisible()) {
      this._targetEl.classList.add("hidden");
      this._targetEl.classList.remove("flex");
      this._targetEl.setAttribute("aria-hidden", "true");
      this._targetEl.removeAttribute("aria-modal");
      this._targetEl.removeAttribute("role");
      this._destroyBackdropEl();
      this._isHidden = true;
      document.body.classList.remove("overflow-hidden");
      if (this._options.closable) {
        this._removeModalCloseEventListeners();
      }
      this._options.onHide(this);
    }
  };
  Modal2.prototype.isVisible = function() {
    return !this._isHidden;
  };
  Modal2.prototype.isHidden = function() {
    return this._isHidden;
  };
  Modal2.prototype.addEventListenerInstance = function(element, type, handler) {
    this._eventListenerInstances.push({
      element,
      type,
      handler
    });
  };
  Modal2.prototype.removeAllEventListenerInstances = function() {
    this._eventListenerInstances.map(function(eventListenerInstance) {
      eventListenerInstance.element.removeEventListener(eventListenerInstance.type, eventListenerInstance.handler);
    });
    this._eventListenerInstances = [];
  };
  Modal2.prototype.getAllEventListenerInstances = function() {
    return this._eventListenerInstances;
  };
  Modal2.prototype.updateOnShow = function(callback) {
    this._options.onShow = callback;
  };
  Modal2.prototype.updateOnHide = function(callback) {
    this._options.onHide = callback;
  };
  Modal2.prototype.updateOnToggle = function(callback) {
    this._options.onToggle = callback;
  };
  return Modal2;
}();
function initModals() {
  document.querySelectorAll("[data-modal-target]").forEach(function($triggerEl) {
    var modalId = $triggerEl.getAttribute("data-modal-target");
    var $modalEl = document.getElementById(modalId);
    if ($modalEl) {
      var placement = $modalEl.getAttribute("data-modal-placement");
      var backdrop = $modalEl.getAttribute("data-modal-backdrop");
      new Modal($modalEl, {
        placement: placement ? placement : Default6.placement,
        backdrop: backdrop ? backdrop : Default6.backdrop
      });
    } else {
      console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-target attribute points to the correct modal id?."));
    }
  });
  document.querySelectorAll("[data-modal-toggle]").forEach(function($triggerEl) {
    var modalId = $triggerEl.getAttribute("data-modal-toggle");
    var $modalEl = document.getElementById(modalId);
    if ($modalEl) {
      var modal_1 = instances_default.getInstance("Modal", modalId);
      if (modal_1) {
        var toggleModal = function() {
          modal_1.toggle();
        };
        $triggerEl.addEventListener("click", toggleModal);
        modal_1.addEventListenerInstance($triggerEl, "click", toggleModal);
      } else {
        console.error("Modal with id ".concat(modalId, " has not been initialized. Please initialize it using the data-modal-target attribute."));
      }
    } else {
      console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-toggle attribute points to the correct modal id?"));
    }
  });
  document.querySelectorAll("[data-modal-show]").forEach(function($triggerEl) {
    var modalId = $triggerEl.getAttribute("data-modal-show");
    var $modalEl = document.getElementById(modalId);
    if ($modalEl) {
      var modal_2 = instances_default.getInstance("Modal", modalId);
      if (modal_2) {
        var showModal = function() {
          modal_2.show();
        };
        $triggerEl.addEventListener("click", showModal);
        modal_2.addEventListenerInstance($triggerEl, "click", showModal);
      } else {
        console.error("Modal with id ".concat(modalId, " has not been initialized. Please initialize it using the data-modal-target attribute."));
      }
    } else {
      console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-show attribute points to the correct modal id?"));
    }
  });
  document.querySelectorAll("[data-modal-hide]").forEach(function($triggerEl) {
    var modalId = $triggerEl.getAttribute("data-modal-hide");
    var $modalEl = document.getElementById(modalId);
    if ($modalEl) {
      var modal_3 = instances_default.getInstance("Modal", modalId);
      if (modal_3) {
        var hideModal = function() {
          modal_3.hide();
        };
        $triggerEl.addEventListener("click", hideModal);
        modal_3.addEventListenerInstance($triggerEl, "click", hideModal);
      } else {
        console.error("Modal with id ".concat(modalId, " has not been initialized. Please initialize it using the data-modal-target attribute."));
      }
    } else {
      console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-hide attribute points to the correct modal id?"));
    }
  });
}
if (typeof window !== "undefined") {
  window.Modal = Modal;
  window.initModals = initModals;
}

// node_modules/flowbite/lib/esm/components/drawer/index.js
var __assign7 = function() {
  __assign7 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign7.apply(this, arguments);
};
var Default7 = {
  placement: "left",
  bodyScrolling: false,
  backdrop: true,
  edge: false,
  edgeOffset: "bottom-[60px]",
  backdropClasses: "bg-dark-backdrop/70 fixed inset-0 z-30",
  onShow: function() {},
  onHide: function() {},
  onToggle: function() {}
};
var DefaultInstanceOptions7 = {
  id: null,
  override: true
};
var Drawer = function() {
  function Drawer2(targetEl, options, instanceOptions) {
    if (targetEl === undefined) {
      targetEl = null;
    }
    if (options === undefined) {
      options = Default7;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions7;
    }
    this._eventListenerInstances = [];
    this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
    this._targetEl = targetEl;
    this._options = __assign7(__assign7({}, Default7), options);
    this._visible = false;
    this._initialized = false;
    this.init();
    instances_default.addInstance("Drawer", this, this._instanceId, instanceOptions.override);
  }
  Drawer2.prototype.init = function() {
    var _this = this;
    if (this._targetEl && !this._initialized) {
      this._targetEl.setAttribute("aria-hidden", "true");
      this._targetEl.classList.add("transition-transform");
      this._getPlacementClasses(this._options.placement).base.map(function(c) {
        _this._targetEl.classList.add(c);
      });
      this._handleEscapeKey = function(event) {
        if (event.key === "Escape") {
          if (_this.isVisible()) {
            _this.hide();
          }
        }
      };
      document.addEventListener("keydown", this._handleEscapeKey);
      this._initialized = true;
    }
  };
  Drawer2.prototype.destroy = function() {
    if (this._initialized) {
      this.removeAllEventListenerInstances();
      this._destroyBackdropEl();
      document.removeEventListener("keydown", this._handleEscapeKey);
      this._initialized = false;
    }
  };
  Drawer2.prototype.removeInstance = function() {
    instances_default.removeInstance("Drawer", this._instanceId);
  };
  Drawer2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Drawer2.prototype.hide = function() {
    var _this = this;
    if (this._options.edge) {
      this._getPlacementClasses(this._options.placement + "-edge").active.map(function(c) {
        _this._targetEl.classList.remove(c);
      });
      this._getPlacementClasses(this._options.placement + "-edge").inactive.map(function(c) {
        _this._targetEl.classList.add(c);
      });
    } else {
      this._getPlacementClasses(this._options.placement).active.map(function(c) {
        _this._targetEl.classList.remove(c);
      });
      this._getPlacementClasses(this._options.placement).inactive.map(function(c) {
        _this._targetEl.classList.add(c);
      });
    }
    this._targetEl.setAttribute("aria-hidden", "true");
    this._targetEl.removeAttribute("aria-modal");
    this._targetEl.removeAttribute("role");
    if (!this._options.bodyScrolling) {
      document.body.classList.remove("overflow-hidden");
    }
    if (this._options.backdrop) {
      this._destroyBackdropEl();
    }
    this._visible = false;
    this._options.onHide(this);
  };
  Drawer2.prototype.show = function() {
    var _this = this;
    if (this._options.edge) {
      this._getPlacementClasses(this._options.placement + "-edge").active.map(function(c) {
        _this._targetEl.classList.add(c);
      });
      this._getPlacementClasses(this._options.placement + "-edge").inactive.map(function(c) {
        _this._targetEl.classList.remove(c);
      });
    } else {
      this._getPlacementClasses(this._options.placement).active.map(function(c) {
        _this._targetEl.classList.add(c);
      });
      this._getPlacementClasses(this._options.placement).inactive.map(function(c) {
        _this._targetEl.classList.remove(c);
      });
    }
    this._targetEl.setAttribute("aria-modal", "true");
    this._targetEl.setAttribute("role", "dialog");
    this._targetEl.removeAttribute("aria-hidden");
    if (!this._options.bodyScrolling) {
      document.body.classList.add("overflow-hidden");
    }
    if (this._options.backdrop) {
      this._createBackdrop();
    }
    this._visible = true;
    this._options.onShow(this);
  };
  Drawer2.prototype.toggle = function() {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  };
  Drawer2.prototype._createBackdrop = function() {
    var _a;
    var _this = this;
    if (!this._visible) {
      var backdropEl = document.createElement("div");
      backdropEl.setAttribute("drawer-backdrop", "");
      (_a = backdropEl.classList).add.apply(_a, this._options.backdropClasses.split(" "));
      document.querySelector("body").append(backdropEl);
      backdropEl.addEventListener("click", function() {
        _this.hide();
      });
    }
  };
  Drawer2.prototype._destroyBackdropEl = function() {
    if (this._visible && document.querySelector("[drawer-backdrop]") !== null) {
      document.querySelector("[drawer-backdrop]").remove();
    }
  };
  Drawer2.prototype._getPlacementClasses = function(placement) {
    switch (placement) {
      case "top":
        return {
          base: ["top-0", "left-0", "right-0"],
          active: ["transform-none"],
          inactive: ["-translate-y-full"]
        };
      case "right":
        return {
          base: ["right-0", "top-0"],
          active: ["transform-none"],
          inactive: ["translate-x-full"]
        };
      case "bottom":
        return {
          base: ["bottom-0", "left-0", "right-0"],
          active: ["transform-none"],
          inactive: ["translate-y-full"]
        };
      case "left":
        return {
          base: ["left-0", "top-0"],
          active: ["transform-none"],
          inactive: ["-translate-x-full"]
        };
      case "bottom-edge":
        return {
          base: ["left-0", "top-0"],
          active: ["transform-none"],
          inactive: ["translate-y-full", this._options.edgeOffset]
        };
      default:
        return {
          base: ["left-0", "top-0"],
          active: ["transform-none"],
          inactive: ["-translate-x-full"]
        };
    }
  };
  Drawer2.prototype.isHidden = function() {
    return !this._visible;
  };
  Drawer2.prototype.isVisible = function() {
    return this._visible;
  };
  Drawer2.prototype.addEventListenerInstance = function(element, type, handler) {
    this._eventListenerInstances.push({
      element,
      type,
      handler
    });
  };
  Drawer2.prototype.removeAllEventListenerInstances = function() {
    this._eventListenerInstances.map(function(eventListenerInstance) {
      eventListenerInstance.element.removeEventListener(eventListenerInstance.type, eventListenerInstance.handler);
    });
    this._eventListenerInstances = [];
  };
  Drawer2.prototype.getAllEventListenerInstances = function() {
    return this._eventListenerInstances;
  };
  Drawer2.prototype.updateOnShow = function(callback) {
    this._options.onShow = callback;
  };
  Drawer2.prototype.updateOnHide = function(callback) {
    this._options.onHide = callback;
  };
  Drawer2.prototype.updateOnToggle = function(callback) {
    this._options.onToggle = callback;
  };
  return Drawer2;
}();
function initDrawers() {
  document.querySelectorAll("[data-drawer-target]").forEach(function($triggerEl) {
    var drawerId = $triggerEl.getAttribute("data-drawer-target");
    var $drawerEl = document.getElementById(drawerId);
    if ($drawerEl) {
      var placement = $triggerEl.getAttribute("data-drawer-placement");
      var bodyScrolling = $triggerEl.getAttribute("data-drawer-body-scrolling");
      var backdrop = $triggerEl.getAttribute("data-drawer-backdrop");
      var edge = $triggerEl.getAttribute("data-drawer-edge");
      var edgeOffset = $triggerEl.getAttribute("data-drawer-edge-offset");
      new Drawer($drawerEl, {
        placement: placement ? placement : Default7.placement,
        bodyScrolling: bodyScrolling ? bodyScrolling === "true" ? true : false : Default7.bodyScrolling,
        backdrop: backdrop ? backdrop === "true" ? true : false : Default7.backdrop,
        edge: edge ? edge === "true" ? true : false : Default7.edge,
        edgeOffset: edgeOffset ? edgeOffset : Default7.edgeOffset
      });
    } else {
      console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
    }
  });
  document.querySelectorAll("[data-drawer-toggle]").forEach(function($triggerEl) {
    var drawerId = $triggerEl.getAttribute("data-drawer-toggle");
    var $drawerEl = document.getElementById(drawerId);
    if ($drawerEl) {
      var drawer_1 = instances_default.getInstance("Drawer", drawerId);
      if (drawer_1) {
        var toggleDrawer = function() {
          drawer_1.toggle();
        };
        $triggerEl.addEventListener("click", toggleDrawer);
        drawer_1.addEventListenerInstance($triggerEl, "click", toggleDrawer);
      } else {
        console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
      }
    } else {
      console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
    }
  });
  document.querySelectorAll("[data-drawer-dismiss], [data-drawer-hide]").forEach(function($triggerEl) {
    var drawerId = $triggerEl.getAttribute("data-drawer-dismiss") ? $triggerEl.getAttribute("data-drawer-dismiss") : $triggerEl.getAttribute("data-drawer-hide");
    var $drawerEl = document.getElementById(drawerId);
    if ($drawerEl) {
      var drawer_2 = instances_default.getInstance("Drawer", drawerId);
      if (drawer_2) {
        var hideDrawer = function() {
          drawer_2.hide();
        };
        $triggerEl.addEventListener("click", hideDrawer);
        drawer_2.addEventListenerInstance($triggerEl, "click", hideDrawer);
      } else {
        console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
      }
    } else {
      console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id"));
    }
  });
  document.querySelectorAll("[data-drawer-show]").forEach(function($triggerEl) {
    var drawerId = $triggerEl.getAttribute("data-drawer-show");
    var $drawerEl = document.getElementById(drawerId);
    if ($drawerEl) {
      var drawer_3 = instances_default.getInstance("Drawer", drawerId);
      if (drawer_3) {
        var showDrawer = function() {
          drawer_3.show();
        };
        $triggerEl.addEventListener("click", showDrawer);
        drawer_3.addEventListenerInstance($triggerEl, "click", showDrawer);
      } else {
        console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
      }
    } else {
      console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
    }
  });
}
if (typeof window !== "undefined") {
  window.Drawer = Drawer;
  window.initDrawers = initDrawers;
}

// node_modules/flowbite/lib/esm/components/tabs/index.js
var __assign8 = function() {
  __assign8 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign8.apply(this, arguments);
};
var Default8 = {
  defaultTabId: null,
  activeClasses: "text-fg-brand hover:text-fg-brand border-brand",
  inactiveClasses: "border-transparent text-body hover:text-heading border-soft hover:border-default",
  onShow: function() {}
};
var DefaultInstanceOptions8 = {
  id: null,
  override: true
};
var Tabs = function() {
  function Tabs2(tabsEl, items, options, instanceOptions) {
    if (tabsEl === undefined) {
      tabsEl = null;
    }
    if (items === undefined) {
      items = [];
    }
    if (options === undefined) {
      options = Default8;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions8;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : tabsEl.id;
    this._tabsEl = tabsEl;
    this._items = items;
    this._activeTab = options ? this.getTab(options.defaultTabId) : null;
    this._options = __assign8(__assign8({}, Default8), options);
    this._initialized = false;
    this.init();
    instances_default.addInstance("Tabs", this, this._instanceId, instanceOptions.override);
  }
  Tabs2.prototype.init = function() {
    var _this = this;
    if (this._items.length && !this._initialized) {
      if (!this._activeTab) {
        this.setActiveTab(this._items[0]);
      }
      this.show(this._activeTab.id, true);
      this._items.map(function(tab) {
        tab.triggerEl.addEventListener("click", function(event) {
          event.preventDefault();
          _this.show(tab.id);
        });
      });
    }
  };
  Tabs2.prototype.destroy = function() {
    if (this._initialized) {
      this._initialized = false;
    }
  };
  Tabs2.prototype.removeInstance = function() {
    this.destroy();
    instances_default.removeInstance("Tabs", this._instanceId);
  };
  Tabs2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Tabs2.prototype.getActiveTab = function() {
    return this._activeTab;
  };
  Tabs2.prototype.setActiveTab = function(tab) {
    this._activeTab = tab;
  };
  Tabs2.prototype.getTab = function(id) {
    return this._items.filter(function(t) {
      return t.id === id;
    })[0];
  };
  Tabs2.prototype.show = function(id, forceShow) {
    var _a, _b;
    var _this = this;
    if (forceShow === undefined) {
      forceShow = false;
    }
    var tab = this.getTab(id);
    if (tab === this._activeTab && !forceShow) {
      return;
    }
    this._items.map(function(t) {
      var _a2, _b2;
      if (t !== tab) {
        (_a2 = t.triggerEl.classList).remove.apply(_a2, _this._options.activeClasses.split(" "));
        (_b2 = t.triggerEl.classList).add.apply(_b2, _this._options.inactiveClasses.split(" "));
        t.targetEl.classList.add("hidden");
        t.triggerEl.setAttribute("aria-selected", "false");
      }
    });
    (_a = tab.triggerEl.classList).add.apply(_a, this._options.activeClasses.split(" "));
    (_b = tab.triggerEl.classList).remove.apply(_b, this._options.inactiveClasses.split(" "));
    tab.triggerEl.setAttribute("aria-selected", "true");
    tab.targetEl.classList.remove("hidden");
    this.setActiveTab(tab);
    this._options.onShow(this, tab);
  };
  Tabs2.prototype.updateOnShow = function(callback) {
    this._options.onShow = callback;
  };
  return Tabs2;
}();
function initTabs() {
  document.querySelectorAll("[data-tabs-toggle]").forEach(function($parentEl) {
    var tabItems = [];
    var activeClasses = $parentEl.getAttribute("data-tabs-active-classes");
    var inactiveClasses = $parentEl.getAttribute("data-tabs-inactive-classes");
    var defaultTabId = null;
    $parentEl.querySelectorAll('[role="tab"]').forEach(function($triggerEl) {
      var isActive = $triggerEl.getAttribute("aria-selected") === "true";
      var tab = {
        id: $triggerEl.getAttribute("data-tabs-target"),
        triggerEl: $triggerEl,
        targetEl: document.querySelector($triggerEl.getAttribute("data-tabs-target"))
      };
      tabItems.push(tab);
      if (isActive) {
        defaultTabId = tab.id;
      }
    });
    new Tabs($parentEl, tabItems, {
      defaultTabId,
      activeClasses: activeClasses ? activeClasses : Default8.activeClasses,
      inactiveClasses: inactiveClasses ? inactiveClasses : Default8.inactiveClasses
    });
  });
}
if (typeof window !== "undefined") {
  window.Tabs = Tabs;
  window.initTabs = initTabs;
}

// node_modules/flowbite/lib/esm/components/tooltip/index.js
var __assign9 = function() {
  __assign9 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign9.apply(this, arguments);
};
var __spreadArray2 = function(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar;i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
};
var Default9 = {
  placement: "top",
  triggerType: "hover",
  onShow: function() {},
  onHide: function() {},
  onToggle: function() {}
};
var DefaultInstanceOptions9 = {
  id: null,
  override: true
};
var Tooltip = function() {
  function Tooltip2(targetEl, triggerEl, options, instanceOptions) {
    if (targetEl === undefined) {
      targetEl = null;
    }
    if (triggerEl === undefined) {
      triggerEl = null;
    }
    if (options === undefined) {
      options = Default9;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions9;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
    this._targetEl = targetEl;
    this._triggerEl = triggerEl;
    this._options = __assign9(__assign9({}, Default9), options);
    this._popperInstance = null;
    this._visible = false;
    this._initialized = false;
    this.init();
    instances_default.addInstance("Tooltip", this, this._instanceId, instanceOptions.override);
  }
  Tooltip2.prototype.init = function() {
    if (this._triggerEl && this._targetEl && !this._initialized) {
      this._setupEventListeners();
      this._popperInstance = this._createPopperInstance();
      this._initialized = true;
    }
  };
  Tooltip2.prototype.destroy = function() {
    var _this = this;
    if (this._initialized) {
      var triggerEvents = this._getTriggerEvents();
      triggerEvents.showEvents.forEach(function(ev) {
        _this._triggerEl.removeEventListener(ev, _this._showHandler);
      });
      triggerEvents.hideEvents.forEach(function(ev) {
        _this._triggerEl.removeEventListener(ev, _this._hideHandler);
      });
      this._removeKeydownListener();
      this._removeClickOutsideListener();
      if (this._popperInstance) {
        this._popperInstance.destroy();
      }
      this._initialized = false;
    }
  };
  Tooltip2.prototype.removeInstance = function() {
    instances_default.removeInstance("Tooltip", this._instanceId);
  };
  Tooltip2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Tooltip2.prototype._setupEventListeners = function() {
    var _this = this;
    var triggerEvents = this._getTriggerEvents();
    this._showHandler = function() {
      _this.show();
    };
    this._hideHandler = function() {
      _this.hide();
    };
    triggerEvents.showEvents.forEach(function(ev) {
      _this._triggerEl.addEventListener(ev, _this._showHandler);
    });
    triggerEvents.hideEvents.forEach(function(ev) {
      _this._triggerEl.addEventListener(ev, _this._hideHandler);
    });
  };
  Tooltip2.prototype._createPopperInstance = function() {
    return createPopper(this._triggerEl, this._targetEl, {
      placement: this._options.placement,
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 8]
          }
        }
      ]
    });
  };
  Tooltip2.prototype._getTriggerEvents = function() {
    switch (this._options.triggerType) {
      case "hover":
        return {
          showEvents: ["mouseenter", "focus"],
          hideEvents: ["mouseleave", "blur"]
        };
      case "click":
        return {
          showEvents: ["click", "focus"],
          hideEvents: ["focusout", "blur"]
        };
      case "none":
        return {
          showEvents: [],
          hideEvents: []
        };
      default:
        return {
          showEvents: ["mouseenter", "focus"],
          hideEvents: ["mouseleave", "blur"]
        };
    }
  };
  Tooltip2.prototype._setupKeydownListener = function() {
    var _this = this;
    this._keydownEventListener = function(ev) {
      if (ev.key === "Escape") {
        _this.hide();
      }
    };
    document.body.addEventListener("keydown", this._keydownEventListener, true);
  };
  Tooltip2.prototype._removeKeydownListener = function() {
    document.body.removeEventListener("keydown", this._keydownEventListener, true);
  };
  Tooltip2.prototype._setupClickOutsideListener = function() {
    var _this = this;
    this._clickOutsideEventListener = function(ev) {
      _this._handleClickOutside(ev, _this._targetEl);
    };
    document.body.addEventListener("click", this._clickOutsideEventListener, true);
  };
  Tooltip2.prototype._removeClickOutsideListener = function() {
    document.body.removeEventListener("click", this._clickOutsideEventListener, true);
  };
  Tooltip2.prototype._handleClickOutside = function(ev, targetEl) {
    var clickedEl = ev.target;
    if (clickedEl !== targetEl && !targetEl.contains(clickedEl) && !this._triggerEl.contains(clickedEl) && this.isVisible()) {
      this.hide();
    }
  };
  Tooltip2.prototype.isVisible = function() {
    return this._visible;
  };
  Tooltip2.prototype.toggle = function() {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  };
  Tooltip2.prototype.show = function() {
    this._targetEl.classList.remove("opacity-0", "invisible");
    this._targetEl.classList.add("opacity-100", "visible");
    this._popperInstance.setOptions(function(options) {
      return __assign9(__assign9({}, options), { modifiers: __spreadArray2(__spreadArray2([], options.modifiers, true), [
        { name: "eventListeners", enabled: true }
      ], false) });
    });
    this._setupClickOutsideListener();
    this._setupKeydownListener();
    this._popperInstance.update();
    this._visible = true;
    this._options.onShow(this);
  };
  Tooltip2.prototype.hide = function() {
    this._targetEl.classList.remove("opacity-100", "visible");
    this._targetEl.classList.add("opacity-0", "invisible");
    this._popperInstance.setOptions(function(options) {
      return __assign9(__assign9({}, options), { modifiers: __spreadArray2(__spreadArray2([], options.modifiers, true), [
        { name: "eventListeners", enabled: false }
      ], false) });
    });
    this._removeClickOutsideListener();
    this._removeKeydownListener();
    this._visible = false;
    this._options.onHide(this);
  };
  Tooltip2.prototype.updateOnShow = function(callback) {
    this._options.onShow = callback;
  };
  Tooltip2.prototype.updateOnHide = function(callback) {
    this._options.onHide = callback;
  };
  Tooltip2.prototype.updateOnToggle = function(callback) {
    this._options.onToggle = callback;
  };
  return Tooltip2;
}();
function initTooltips() {
  document.querySelectorAll("[data-tooltip-target]").forEach(function($triggerEl) {
    var tooltipId = $triggerEl.getAttribute("data-tooltip-target");
    var $tooltipEl = document.getElementById(tooltipId);
    if ($tooltipEl) {
      var triggerType = $triggerEl.getAttribute("data-tooltip-trigger");
      var placement = $triggerEl.getAttribute("data-tooltip-placement");
      new Tooltip($tooltipEl, $triggerEl, {
        placement: placement ? placement : Default9.placement,
        triggerType: triggerType ? triggerType : Default9.triggerType
      });
    } else {
      console.error('The tooltip element with id "'.concat(tooltipId, '" does not exist. Please check the data-tooltip-target attribute.'));
    }
  });
}
if (typeof window !== "undefined") {
  window.Tooltip = Tooltip;
  window.initTooltips = initTooltips;
}

// node_modules/flowbite/lib/esm/components/popover/index.js
var __assign10 = function() {
  __assign10 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign10.apply(this, arguments);
};
var __spreadArray3 = function(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar;i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
};
var Default10 = {
  placement: "top",
  offset: 10,
  triggerType: "hover",
  onShow: function() {},
  onHide: function() {},
  onToggle: function() {}
};
var DefaultInstanceOptions10 = {
  id: null,
  override: true
};
var Popover = function() {
  function Popover2(targetEl, triggerEl, options, instanceOptions) {
    if (targetEl === undefined) {
      targetEl = null;
    }
    if (triggerEl === undefined) {
      triggerEl = null;
    }
    if (options === undefined) {
      options = Default10;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions10;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
    this._targetEl = targetEl;
    this._triggerEl = triggerEl;
    this._options = __assign10(__assign10({}, Default10), options);
    this._popperInstance = null;
    this._visible = false;
    this._initialized = false;
    this.init();
    instances_default.addInstance("Popover", this, instanceOptions.id ? instanceOptions.id : this._targetEl.id, instanceOptions.override);
  }
  Popover2.prototype.init = function() {
    if (this._triggerEl && this._targetEl && !this._initialized) {
      this._setupEventListeners();
      this._popperInstance = this._createPopperInstance();
      this._initialized = true;
    }
  };
  Popover2.prototype.destroy = function() {
    var _this = this;
    if (this._initialized) {
      var triggerEvents = this._getTriggerEvents();
      triggerEvents.showEvents.forEach(function(ev) {
        _this._triggerEl.removeEventListener(ev, _this._showHandler);
        _this._targetEl.removeEventListener(ev, _this._showHandler);
      });
      triggerEvents.hideEvents.forEach(function(ev) {
        _this._triggerEl.removeEventListener(ev, _this._hideHandler);
        _this._targetEl.removeEventListener(ev, _this._hideHandler);
      });
      this._removeKeydownListener();
      this._removeClickOutsideListener();
      if (this._popperInstance) {
        this._popperInstance.destroy();
      }
      this._initialized = false;
    }
  };
  Popover2.prototype.removeInstance = function() {
    instances_default.removeInstance("Popover", this._instanceId);
  };
  Popover2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Popover2.prototype._setupEventListeners = function() {
    var _this = this;
    var triggerEvents = this._getTriggerEvents();
    this._showHandler = function() {
      _this.show();
    };
    this._hideHandler = function() {
      setTimeout(function() {
        if (!_this._targetEl.matches(":hover")) {
          _this.hide();
        }
      }, 100);
    };
    triggerEvents.showEvents.forEach(function(ev) {
      _this._triggerEl.addEventListener(ev, _this._showHandler);
      _this._targetEl.addEventListener(ev, _this._showHandler);
    });
    triggerEvents.hideEvents.forEach(function(ev) {
      _this._triggerEl.addEventListener(ev, _this._hideHandler);
      _this._targetEl.addEventListener(ev, _this._hideHandler);
    });
  };
  Popover2.prototype._createPopperInstance = function() {
    return createPopper(this._triggerEl, this._targetEl, {
      placement: this._options.placement,
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, this._options.offset]
          }
        }
      ]
    });
  };
  Popover2.prototype._getTriggerEvents = function() {
    switch (this._options.triggerType) {
      case "hover":
        return {
          showEvents: ["mouseenter", "focus"],
          hideEvents: ["mouseleave", "blur"]
        };
      case "click":
        return {
          showEvents: ["click", "focus"],
          hideEvents: ["focusout", "blur"]
        };
      case "none":
        return {
          showEvents: [],
          hideEvents: []
        };
      default:
        return {
          showEvents: ["mouseenter", "focus"],
          hideEvents: ["mouseleave", "blur"]
        };
    }
  };
  Popover2.prototype._setupKeydownListener = function() {
    var _this = this;
    this._keydownEventListener = function(ev) {
      if (ev.key === "Escape") {
        _this.hide();
      }
    };
    document.body.addEventListener("keydown", this._keydownEventListener, true);
  };
  Popover2.prototype._removeKeydownListener = function() {
    document.body.removeEventListener("keydown", this._keydownEventListener, true);
  };
  Popover2.prototype._setupClickOutsideListener = function() {
    var _this = this;
    this._clickOutsideEventListener = function(ev) {
      _this._handleClickOutside(ev, _this._targetEl);
    };
    document.body.addEventListener("click", this._clickOutsideEventListener, true);
  };
  Popover2.prototype._removeClickOutsideListener = function() {
    document.body.removeEventListener("click", this._clickOutsideEventListener, true);
  };
  Popover2.prototype._handleClickOutside = function(ev, targetEl) {
    var clickedEl = ev.target;
    if (clickedEl !== targetEl && !targetEl.contains(clickedEl) && !this._triggerEl.contains(clickedEl) && this.isVisible()) {
      this.hide();
    }
  };
  Popover2.prototype.isVisible = function() {
    return this._visible;
  };
  Popover2.prototype.toggle = function() {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
    this._options.onToggle(this);
  };
  Popover2.prototype.show = function() {
    this._targetEl.classList.remove("opacity-0", "invisible");
    this._targetEl.classList.add("opacity-100", "visible");
    this._popperInstance.setOptions(function(options) {
      return __assign10(__assign10({}, options), { modifiers: __spreadArray3(__spreadArray3([], options.modifiers, true), [
        { name: "eventListeners", enabled: true }
      ], false) });
    });
    this._setupClickOutsideListener();
    this._setupKeydownListener();
    this._popperInstance.update();
    this._visible = true;
    this._options.onShow(this);
  };
  Popover2.prototype.hide = function() {
    this._targetEl.classList.remove("opacity-100", "visible");
    this._targetEl.classList.add("opacity-0", "invisible");
    this._popperInstance.setOptions(function(options) {
      return __assign10(__assign10({}, options), { modifiers: __spreadArray3(__spreadArray3([], options.modifiers, true), [
        { name: "eventListeners", enabled: false }
      ], false) });
    });
    this._removeClickOutsideListener();
    this._removeKeydownListener();
    this._visible = false;
    this._options.onHide(this);
  };
  Popover2.prototype.updateOnShow = function(callback) {
    this._options.onShow = callback;
  };
  Popover2.prototype.updateOnHide = function(callback) {
    this._options.onHide = callback;
  };
  Popover2.prototype.updateOnToggle = function(callback) {
    this._options.onToggle = callback;
  };
  return Popover2;
}();
function initPopovers() {
  document.querySelectorAll("[data-popover-target]").forEach(function($triggerEl) {
    var popoverID = $triggerEl.getAttribute("data-popover-target");
    var $popoverEl = document.getElementById(popoverID);
    if ($popoverEl) {
      var triggerType = $triggerEl.getAttribute("data-popover-trigger");
      var placement = $triggerEl.getAttribute("data-popover-placement");
      var offset2 = $triggerEl.getAttribute("data-popover-offset");
      new Popover($popoverEl, $triggerEl, {
        placement: placement ? placement : Default10.placement,
        offset: offset2 ? parseInt(offset2) : Default10.offset,
        triggerType: triggerType ? triggerType : Default10.triggerType
      });
    } else {
      console.error('The popover element with id "'.concat(popoverID, '" does not exist. Please check the data-popover-target attribute.'));
    }
  });
}
if (typeof window !== "undefined") {
  window.Popover = Popover;
  window.initPopovers = initPopovers;
}

// node_modules/flowbite/lib/esm/components/dial/index.js
var __assign11 = function() {
  __assign11 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign11.apply(this, arguments);
};
var Default11 = {
  triggerType: "hover",
  onShow: function() {},
  onHide: function() {},
  onToggle: function() {}
};
var DefaultInstanceOptions11 = {
  id: null,
  override: true
};
var Dial = function() {
  function Dial2(parentEl, triggerEl, targetEl, options, instanceOptions) {
    if (parentEl === undefined) {
      parentEl = null;
    }
    if (triggerEl === undefined) {
      triggerEl = null;
    }
    if (targetEl === undefined) {
      targetEl = null;
    }
    if (options === undefined) {
      options = Default11;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions11;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
    this._parentEl = parentEl;
    this._triggerEl = triggerEl;
    this._targetEl = targetEl;
    this._options = __assign11(__assign11({}, Default11), options);
    this._visible = false;
    this._initialized = false;
    this.init();
    instances_default.addInstance("Dial", this, this._instanceId, instanceOptions.override);
  }
  Dial2.prototype.init = function() {
    var _this = this;
    if (this._triggerEl && this._targetEl && !this._initialized) {
      var triggerEventTypes = this._getTriggerEventTypes(this._options.triggerType);
      this._showEventHandler = function() {
        _this.show();
      };
      triggerEventTypes.showEvents.forEach(function(ev) {
        _this._triggerEl.addEventListener(ev, _this._showEventHandler);
        _this._targetEl.addEventListener(ev, _this._showEventHandler);
      });
      this._hideEventHandler = function() {
        if (!_this._parentEl.matches(":hover")) {
          _this.hide();
        }
      };
      triggerEventTypes.hideEvents.forEach(function(ev) {
        _this._parentEl.addEventListener(ev, _this._hideEventHandler);
      });
      this._initialized = true;
    }
  };
  Dial2.prototype.destroy = function() {
    var _this = this;
    if (this._initialized) {
      var triggerEventTypes = this._getTriggerEventTypes(this._options.triggerType);
      triggerEventTypes.showEvents.forEach(function(ev) {
        _this._triggerEl.removeEventListener(ev, _this._showEventHandler);
        _this._targetEl.removeEventListener(ev, _this._showEventHandler);
      });
      triggerEventTypes.hideEvents.forEach(function(ev) {
        _this._parentEl.removeEventListener(ev, _this._hideEventHandler);
      });
      this._initialized = false;
    }
  };
  Dial2.prototype.removeInstance = function() {
    instances_default.removeInstance("Dial", this._instanceId);
  };
  Dial2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Dial2.prototype.hide = function() {
    this._targetEl.classList.add("hidden");
    if (this._triggerEl) {
      this._triggerEl.setAttribute("aria-expanded", "false");
    }
    this._visible = false;
    this._options.onHide(this);
  };
  Dial2.prototype.show = function() {
    this._targetEl.classList.remove("hidden");
    if (this._triggerEl) {
      this._triggerEl.setAttribute("aria-expanded", "true");
    }
    this._visible = true;
    this._options.onShow(this);
  };
  Dial2.prototype.toggle = function() {
    if (this._visible) {
      this.hide();
    } else {
      this.show();
    }
  };
  Dial2.prototype.isHidden = function() {
    return !this._visible;
  };
  Dial2.prototype.isVisible = function() {
    return this._visible;
  };
  Dial2.prototype._getTriggerEventTypes = function(triggerType) {
    switch (triggerType) {
      case "hover":
        return {
          showEvents: ["mouseenter", "focus"],
          hideEvents: ["mouseleave", "blur"]
        };
      case "click":
        return {
          showEvents: ["click", "focus"],
          hideEvents: ["focusout", "blur"]
        };
      case "none":
        return {
          showEvents: [],
          hideEvents: []
        };
      default:
        return {
          showEvents: ["mouseenter", "focus"],
          hideEvents: ["mouseleave", "blur"]
        };
    }
  };
  Dial2.prototype.updateOnShow = function(callback) {
    this._options.onShow = callback;
  };
  Dial2.prototype.updateOnHide = function(callback) {
    this._options.onHide = callback;
  };
  Dial2.prototype.updateOnToggle = function(callback) {
    this._options.onToggle = callback;
  };
  return Dial2;
}();
function initDials() {
  document.querySelectorAll("[data-dial-init]").forEach(function($parentEl) {
    var $triggerEl = $parentEl.querySelector("[data-dial-toggle]");
    if ($triggerEl) {
      var dialId = $triggerEl.getAttribute("data-dial-toggle");
      var $dialEl = document.getElementById(dialId);
      if ($dialEl) {
        var triggerType = $triggerEl.getAttribute("data-dial-trigger");
        new Dial($parentEl, $triggerEl, $dialEl, {
          triggerType: triggerType ? triggerType : Default11.triggerType
        });
      } else {
        console.error("Dial with id ".concat(dialId, " does not exist. Are you sure that the data-dial-toggle attribute points to the correct modal id?"));
      }
    } else {
      console.error("Dial with id ".concat($parentEl.id, " does not have a trigger element. Are you sure that the data-dial-toggle attribute exists?"));
    }
  });
}
if (typeof window !== "undefined") {
  window.Dial = Dial;
  window.initDials = initDials;
}

// node_modules/flowbite/lib/esm/components/input-counter/index.js
var __assign12 = function() {
  __assign12 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign12.apply(this, arguments);
};
var Default12 = {
  minValue: null,
  maxValue: null,
  onIncrement: function() {},
  onDecrement: function() {}
};
var DefaultInstanceOptions12 = {
  id: null,
  override: true
};
var InputCounter = function() {
  function InputCounter2(targetEl, incrementEl, decrementEl, options, instanceOptions) {
    if (targetEl === undefined) {
      targetEl = null;
    }
    if (incrementEl === undefined) {
      incrementEl = null;
    }
    if (decrementEl === undefined) {
      decrementEl = null;
    }
    if (options === undefined) {
      options = Default12;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions12;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
    this._targetEl = targetEl;
    this._incrementEl = incrementEl;
    this._decrementEl = decrementEl;
    this._options = __assign12(__assign12({}, Default12), options);
    this._initialized = false;
    this.init();
    instances_default.addInstance("InputCounter", this, this._instanceId, instanceOptions.override);
  }
  InputCounter2.prototype.init = function() {
    var _this = this;
    if (this._targetEl && !this._initialized) {
      this._inputHandler = function(event) {
        {
          var target = event.target;
          if (!/^\d*$/.test(target.value)) {
            target.value = target.value.replace(/[^\d]/g, "");
          }
          if (_this._options.maxValue !== null && parseInt(target.value) > _this._options.maxValue) {
            target.value = _this._options.maxValue.toString();
          }
          if (_this._options.minValue !== null && parseInt(target.value) < _this._options.minValue) {
            target.value = _this._options.minValue.toString();
          }
        }
      };
      this._incrementClickHandler = function() {
        _this.increment();
      };
      this._decrementClickHandler = function() {
        _this.decrement();
      };
      this._targetEl.addEventListener("input", this._inputHandler);
      if (this._incrementEl) {
        this._incrementEl.addEventListener("click", this._incrementClickHandler);
      }
      if (this._decrementEl) {
        this._decrementEl.addEventListener("click", this._decrementClickHandler);
      }
      this._initialized = true;
    }
  };
  InputCounter2.prototype.destroy = function() {
    if (this._targetEl && this._initialized) {
      this._targetEl.removeEventListener("input", this._inputHandler);
      if (this._incrementEl) {
        this._incrementEl.removeEventListener("click", this._incrementClickHandler);
      }
      if (this._decrementEl) {
        this._decrementEl.removeEventListener("click", this._decrementClickHandler);
      }
      this._initialized = false;
    }
  };
  InputCounter2.prototype.removeInstance = function() {
    instances_default.removeInstance("InputCounter", this._instanceId);
  };
  InputCounter2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  InputCounter2.prototype.getCurrentValue = function() {
    return parseInt(this._targetEl.value) || 0;
  };
  InputCounter2.prototype.increment = function() {
    if (this._options.maxValue !== null && this.getCurrentValue() >= this._options.maxValue) {
      return;
    }
    this._targetEl.value = (this.getCurrentValue() + 1).toString();
    this._options.onIncrement(this);
  };
  InputCounter2.prototype.decrement = function() {
    if (this._options.minValue !== null && this.getCurrentValue() <= this._options.minValue) {
      return;
    }
    this._targetEl.value = (this.getCurrentValue() - 1).toString();
    this._options.onDecrement(this);
  };
  InputCounter2.prototype.updateOnIncrement = function(callback) {
    this._options.onIncrement = callback;
  };
  InputCounter2.prototype.updateOnDecrement = function(callback) {
    this._options.onDecrement = callback;
  };
  return InputCounter2;
}();
function initInputCounters() {
  document.querySelectorAll("[data-input-counter]").forEach(function($targetEl) {
    var targetId = $targetEl.id;
    var $incrementEl = document.querySelector('[data-input-counter-increment="' + targetId + '"]');
    var $decrementEl = document.querySelector('[data-input-counter-decrement="' + targetId + '"]');
    var minValue = $targetEl.getAttribute("data-input-counter-min");
    var maxValue = $targetEl.getAttribute("data-input-counter-max");
    if ($targetEl) {
      if (!instances_default.instanceExists("InputCounter", $targetEl.getAttribute("id"))) {
        new InputCounter($targetEl, $incrementEl ? $incrementEl : null, $decrementEl ? $decrementEl : null, {
          minValue: minValue ? parseInt(minValue) : null,
          maxValue: maxValue ? parseInt(maxValue) : null
        });
      }
    } else {
      console.error('The target element with id "'.concat(targetId, '" does not exist. Please check the data-input-counter attribute.'));
    }
  });
}
if (typeof window !== "undefined") {
  window.InputCounter = InputCounter;
  window.initInputCounters = initInputCounters;
}

// node_modules/flowbite/lib/esm/components/clipboard/index.js
var __assign13 = function() {
  __assign13 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign13.apply(this, arguments);
};
var Default13 = {
  htmlEntities: false,
  contentType: "input",
  onCopy: function() {}
};
var DefaultInstanceOptions13 = {
  id: null,
  override: true
};
var CopyClipboard = function() {
  function CopyClipboard2(triggerEl, targetEl, options, instanceOptions) {
    if (triggerEl === undefined) {
      triggerEl = null;
    }
    if (targetEl === undefined) {
      targetEl = null;
    }
    if (options === undefined) {
      options = Default13;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions13;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : targetEl.id;
    this._triggerEl = triggerEl;
    this._targetEl = targetEl;
    this._options = __assign13(__assign13({}, Default13), options);
    this._initialized = false;
    this.init();
    instances_default.addInstance("CopyClipboard", this, this._instanceId, instanceOptions.override);
  }
  CopyClipboard2.prototype.init = function() {
    var _this = this;
    if (this._targetEl && this._triggerEl && !this._initialized) {
      this._triggerElClickHandler = function() {
        _this.copy();
      };
      if (this._triggerEl) {
        this._triggerEl.addEventListener("click", this._triggerElClickHandler);
      }
      this._initialized = true;
    }
  };
  CopyClipboard2.prototype.destroy = function() {
    if (this._triggerEl && this._targetEl && this._initialized) {
      if (this._triggerEl) {
        this._triggerEl.removeEventListener("click", this._triggerElClickHandler);
      }
      this._initialized = false;
    }
  };
  CopyClipboard2.prototype.removeInstance = function() {
    instances_default.removeInstance("CopyClipboard", this._instanceId);
  };
  CopyClipboard2.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  CopyClipboard2.prototype.getTargetValue = function() {
    if (this._options.contentType === "input") {
      return this._targetEl.value;
    }
    if (this._options.contentType === "innerHTML") {
      return this._targetEl.innerHTML;
    }
    if (this._options.contentType === "textContent") {
      return this._targetEl.textContent.replace(/\s+/g, " ").trim();
    }
  };
  CopyClipboard2.prototype.copy = function() {
    var textToCopy = this.getTargetValue();
    if (this._options.htmlEntities) {
      textToCopy = this.decodeHTML(textToCopy);
    }
    var tempTextArea = document.createElement("textarea");
    tempTextArea.value = textToCopy;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);
    this._options.onCopy(this);
    return textToCopy;
  };
  CopyClipboard2.prototype.decodeHTML = function(html) {
    var textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    return textarea.textContent;
  };
  CopyClipboard2.prototype.updateOnCopyCallback = function(callback) {
    this._options.onCopy = callback;
  };
  return CopyClipboard2;
}();
function initCopyClipboards() {
  document.querySelectorAll("[data-copy-to-clipboard-target]").forEach(function($triggerEl) {
    var targetId = $triggerEl.getAttribute("data-copy-to-clipboard-target");
    var $targetEl = document.getElementById(targetId);
    var contentType = $triggerEl.getAttribute("data-copy-to-clipboard-content-type");
    var htmlEntities = $triggerEl.getAttribute("data-copy-to-clipboard-html-entities");
    if ($targetEl) {
      if (!instances_default.instanceExists("CopyClipboard", $targetEl.getAttribute("id"))) {
        new CopyClipboard($triggerEl, $targetEl, {
          htmlEntities: htmlEntities && htmlEntities === "true" ? true : Default13.htmlEntities,
          contentType: contentType ? contentType : Default13.contentType
        });
      }
    } else {
      console.error('The target element with id "'.concat(targetId, '" does not exist. Please check the data-copy-to-clipboard-target attribute.'));
    }
  });
}
if (typeof window !== "undefined") {
  window.CopyClipboard = CopyClipboard;
  window.initClipboards = initCopyClipboards;
}

// node_modules/flowbite-datepicker/dist/main.esm.js
function _arrayLikeToArray(r, a) {
  (a == null || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a);e < a; e++)
    n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r))
    return r;
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r))
    return _arrayLikeToArray(r);
}
function _assertThisInitialized(e) {
  if (e === undefined)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
function _callSuper(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _classCallCheck(a, n) {
  if (!(a instanceof n))
    throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0;t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _get() {
  return _get = typeof Reflect != "undefined" && Reflect.get ? Reflect.get.bind() : function(e, t, r) {
    var p = _superPropBase(e, t);
    if (p) {
      var n = Object.getOwnPropertyDescriptor(p, t);
      return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value;
    }
  }, _get.apply(null, arguments);
}
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t2) {
    return t2.__proto__ || Object.getPrototypeOf(t2);
  }, _getPrototypeOf(t);
}
function _inherits(t, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: true,
      configurable: true
    }
  }), Object.defineProperty(t, "prototype", {
    writable: false
  }), e && _setPrototypeOf(t, e);
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
  } catch (t2) {}
  return (_isNativeReflectConstruct = function() {
    return !!t;
  })();
}
function _iterableToArray(r) {
  if (typeof Symbol != "undefined" && r[Symbol.iterator] != null || r["@@iterator"] != null)
    return Array.from(r);
}
function _iterableToArrayLimit(r, l) {
  var t = r == null ? null : typeof Symbol != "undefined" && r[Symbol.iterator] || r["@@iterator"];
  if (t != null) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, l === 0) {
        if (Object(t) !== t)
          return;
        f = false;
      } else
        for (;!(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true)
          ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && t.return != null && (u = t.return(), Object(u) !== u))
          return;
      } finally {
        if (o)
          throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _nonIterableSpread() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _possibleConstructorReturn(t, e) {
  if (e && (typeof e == "object" || typeof e == "function"))
    return e;
  if (e !== undefined)
    throw new TypeError("Derived constructors may only return object or undefined");
  return _assertThisInitialized(t);
}
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
    return t2.__proto__ = e2, t2;
  }, _setPrototypeOf(t, e);
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _superPropBase(t, o) {
  for (;!{}.hasOwnProperty.call(t, o) && (t = _getPrototypeOf(t)) !== null; )
    ;
  return t;
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _toPrimitive(t, r) {
  if (typeof t != "object" || !t)
    return t;
  var e = t[Symbol.toPrimitive];
  if (e !== undefined) {
    var i = e.call(t, r || "default");
    if (typeof i != "object")
      return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return typeof i == "symbol" ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && typeof Symbol == "function" && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if (typeof r == "string")
      return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return t === "Object" && r.constructor && (t = r.constructor.name), t === "Map" || t === "Set" ? Array.from(r) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : undefined;
  }
}
function hasProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
function lastItemOf(arr) {
  return arr[arr.length - 1];
}
function pushUnique(arr) {
  for (var _len = arguments.length, items = new Array(_len > 1 ? _len - 1 : 0), _key = 1;_key < _len; _key++) {
    items[_key - 1] = arguments[_key];
  }
  items.forEach(function(item) {
    if (arr.includes(item)) {
      return;
    }
    arr.push(item);
  });
  return arr;
}
function stringToArray(str2, separator) {
  return str2 ? str2.split(separator) : [];
}
function isInRange(testVal, min2, max2) {
  var minOK = min2 === undefined || testVal >= min2;
  var maxOK = max2 === undefined || testVal <= max2;
  return minOK && maxOK;
}
function limitToRange(val, min2, max2) {
  if (val < min2) {
    return min2;
  }
  if (val > max2) {
    return max2;
  }
  return val;
}
function createTagRepeat(tagName, repeat) {
  var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var html = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
  var openTagSrc = Object.keys(attributes).reduce(function(src, attr) {
    var val = attributes[attr];
    if (typeof val === "function") {
      val = val(index);
    }
    return "".concat(src, " ").concat(attr, '="').concat(val, '"');
  }, tagName);
  html += "<".concat(openTagSrc, "></").concat(tagName, ">");
  var next = index + 1;
  return next < repeat ? createTagRepeat(tagName, repeat, attributes, next, html) : html;
}
function optimizeTemplateHTML(html) {
  return html.replace(/>\s+/g, ">").replace(/\s+</, "<");
}
function stripTime(timeValue) {
  return new Date(timeValue).setHours(0, 0, 0, 0);
}
function today() {
  return new Date().setHours(0, 0, 0, 0);
}
function dateValue() {
  switch (arguments.length) {
    case 0:
      return today();
    case 1:
      return stripTime(arguments.length <= 0 ? undefined : arguments[0]);
  }
  var newDate = new Date(0);
  newDate.setFullYear.apply(newDate, arguments);
  return newDate.setHours(0, 0, 0, 0);
}
function addDays(date, amount) {
  var newDate = new Date(date);
  return newDate.setDate(newDate.getDate() + amount);
}
function addWeeks(date, amount) {
  return addDays(date, amount * 7);
}
function addMonths(date, amount) {
  var newDate = new Date(date);
  var monthsToSet = newDate.getMonth() + amount;
  var expectedMonth = monthsToSet % 12;
  if (expectedMonth < 0) {
    expectedMonth += 12;
  }
  var time = newDate.setMonth(monthsToSet);
  return newDate.getMonth() !== expectedMonth ? newDate.setDate(0) : time;
}
function addYears(date, amount) {
  var newDate = new Date(date);
  var expectedMonth = newDate.getMonth();
  var time = newDate.setFullYear(newDate.getFullYear() + amount);
  return expectedMonth === 1 && newDate.getMonth() === 2 ? newDate.setDate(0) : time;
}
function dayDiff(day, from) {
  return (day - from + 7) % 7;
}
function dayOfTheWeekOf(baseDate, dayOfWeek) {
  var weekStart = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var baseDay = new Date(baseDate).getDay();
  return addDays(baseDate, dayDiff(dayOfWeek, weekStart) - dayDiff(baseDay, weekStart));
}
function getWeek(date) {
  var thuOfTheWeek = dayOfTheWeekOf(date, 4, 1);
  var firstThu = dayOfTheWeekOf(new Date(thuOfTheWeek).setMonth(0, 4), 4, 1);
  return Math.round((thuOfTheWeek - firstThu) / 604800000) + 1;
}
function startOfYearPeriod(date, years) {
  var year = new Date(date).getFullYear();
  return Math.floor(year / years) * years;
}
var reFormatTokens = /dd?|DD?|mm?|MM?|yy?(?:yy)?/;
var reNonDateParts = /[\s!-/:-@[-`{-~年月日]+/;
var knownFormats = {};
var parseFns = {
  y: function y(date, year) {
    return new Date(date).setFullYear(parseInt(year, 10));
  },
  m: function m(date, month, locale) {
    var newDate = new Date(date);
    var monthIndex = parseInt(month, 10) - 1;
    if (isNaN(monthIndex)) {
      if (!month) {
        return NaN;
      }
      var monthName = month.toLowerCase();
      var compareNames = function compareNames2(name) {
        return name.toLowerCase().startsWith(monthName);
      };
      monthIndex = locale.monthsShort.findIndex(compareNames);
      if (monthIndex < 0) {
        monthIndex = locale.months.findIndex(compareNames);
      }
      if (monthIndex < 0) {
        return NaN;
      }
    }
    newDate.setMonth(monthIndex);
    return newDate.getMonth() !== normalizeMonth(monthIndex) ? newDate.setDate(0) : newDate.getTime();
  },
  d: function d(date, day) {
    return new Date(date).setDate(parseInt(day, 10));
  }
};
var formatFns = {
  d: function d2(date) {
    return date.getDate();
  },
  dd: function dd(date) {
    return padZero(date.getDate(), 2);
  },
  D: function D(date, locale) {
    return locale.daysShort[date.getDay()];
  },
  DD: function DD(date, locale) {
    return locale.days[date.getDay()];
  },
  m: function m2(date) {
    return date.getMonth() + 1;
  },
  mm: function mm(date) {
    return padZero(date.getMonth() + 1, 2);
  },
  M: function M(date, locale) {
    return locale.monthsShort[date.getMonth()];
  },
  MM: function MM(date, locale) {
    return locale.months[date.getMonth()];
  },
  y: function y2(date) {
    return date.getFullYear();
  },
  yy: function yy(date) {
    return padZero(date.getFullYear(), 2).slice(-2);
  },
  yyyy: function yyyy(date) {
    return padZero(date.getFullYear(), 4);
  }
};
function normalizeMonth(monthIndex) {
  return monthIndex > -1 ? monthIndex % 12 : normalizeMonth(monthIndex + 12);
}
function padZero(num, length) {
  return num.toString().padStart(length, "0");
}
function parseFormatString(format) {
  if (typeof format !== "string") {
    throw new Error("Invalid date format.");
  }
  if (format in knownFormats) {
    return knownFormats[format];
  }
  var separators = format.split(reFormatTokens);
  var parts = format.match(new RegExp(reFormatTokens, "g"));
  if (separators.length === 0 || !parts) {
    throw new Error("Invalid date format.");
  }
  var partFormatters = parts.map(function(token) {
    return formatFns[token];
  });
  var partParserKeys = Object.keys(parseFns).reduce(function(keys, key) {
    var token = parts.find(function(part) {
      return part[0] !== "D" && part[0].toLowerCase() === key;
    });
    if (token) {
      keys.push(key);
    }
    return keys;
  }, []);
  return knownFormats[format] = {
    parser: function parser(dateStr, locale) {
      var dateParts = dateStr.split(reNonDateParts).reduce(function(dtParts, part, index) {
        if (part.length > 0 && parts[index]) {
          var token = parts[index][0];
          if (token === "M") {
            dtParts.m = part;
          } else if (token !== "D") {
            dtParts[token] = part;
          }
        }
        return dtParts;
      }, {});
      return partParserKeys.reduce(function(origDate, key) {
        var newDate = parseFns[key](origDate, dateParts[key], locale);
        return isNaN(newDate) ? origDate : newDate;
      }, today());
    },
    formatter: function formatter(date, locale) {
      var dateStr = partFormatters.reduce(function(str2, fn2, index) {
        return str2 += "".concat(separators[index]).concat(fn2(date, locale));
      }, "");
      return dateStr += lastItemOf(separators);
    }
  };
}
function parseDate(dateStr, format, locale) {
  if (dateStr instanceof Date || typeof dateStr === "number") {
    var date = stripTime(dateStr);
    return isNaN(date) ? undefined : date;
  }
  if (!dateStr) {
    return;
  }
  if (dateStr === "today") {
    return today();
  }
  if (format && format.toValue) {
    var _date = format.toValue(dateStr, format, locale);
    return isNaN(_date) ? undefined : stripTime(_date);
  }
  return parseFormatString(format).parser(dateStr, locale);
}
function formatDate(date, format, locale) {
  if (isNaN(date) || !date && date !== 0) {
    return "";
  }
  var dateObj = typeof date === "number" ? new Date(date) : date;
  if (format.toDisplay) {
    return format.toDisplay(dateObj, format, locale);
  }
  return parseFormatString(format).formatter(dateObj, locale);
}
var listenerRegistry = new WeakMap;
var _EventTarget$prototyp = EventTarget.prototype;
var addEventListener2 = _EventTarget$prototyp.addEventListener;
var removeEventListener = _EventTarget$prototyp.removeEventListener;
function registerListeners(keyObj, listeners) {
  var registered = listenerRegistry.get(keyObj);
  if (!registered) {
    registered = [];
    listenerRegistry.set(keyObj, registered);
  }
  listeners.forEach(function(listener) {
    addEventListener2.call.apply(addEventListener2, _toConsumableArray(listener));
    registered.push(listener);
  });
}
function unregisterListeners(keyObj) {
  var listeners = listenerRegistry.get(keyObj);
  if (!listeners) {
    return;
  }
  listeners.forEach(function(listener) {
    removeEventListener.call.apply(removeEventListener, _toConsumableArray(listener));
  });
  listenerRegistry["delete"](keyObj);
}
if (!Event.prototype.composedPath) {
  getComposedPath = function getComposedPath2(node) {
    var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    path.push(node);
    var parent;
    if (node.parentNode) {
      parent = node.parentNode;
    } else if (node.host) {
      parent = node.host;
    } else if (node.defaultView) {
      parent = node.defaultView;
    }
    return parent ? getComposedPath2(parent, path) : path;
  };
  Event.prototype.composedPath = function() {
    return getComposedPath(this.target);
  };
}
var getComposedPath;
function findFromPath(path, criteria, currentTarget) {
  var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var el = path[index];
  if (criteria(el)) {
    return el;
  } else if (el === currentTarget || !el.parentElement) {
    return;
  }
  return findFromPath(path, criteria, currentTarget, index + 1);
}
function findElementInEventPath(ev, selector) {
  var criteria = typeof selector === "function" ? selector : function(el) {
    return el.matches(selector);
  };
  return findFromPath(ev.composedPath(), criteria, ev.currentTarget);
}
var locales = {
  en: {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    today: "Today",
    clear: "Clear",
    titleFormat: "MM y"
  }
};
var defaultOptions = {
  autohide: false,
  beforeShowDay: null,
  beforeShowDecade: null,
  beforeShowMonth: null,
  beforeShowYear: null,
  calendarWeeks: false,
  clearBtn: false,
  dateDelimiter: ",",
  datesDisabled: [],
  daysOfWeekDisabled: [],
  daysOfWeekHighlighted: [],
  defaultViewDate: undefined,
  disableTouchKeyboard: false,
  format: "mm/dd/yyyy",
  language: "en",
  maxDate: null,
  maxNumberOfDates: 1,
  maxView: 3,
  minDate: null,
  nextArrow: '<svg class="w-4 h-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/></svg>',
  orientation: "auto",
  pickLevel: 0,
  prevArrow: '<svg class="w-4 h-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4"/></svg>',
  showDaysOfWeek: true,
  showOnClick: true,
  showOnFocus: true,
  startView: 0,
  title: "",
  todayBtn: false,
  todayBtnMode: 0,
  todayHighlight: false,
  updateOnBlur: true,
  weekStart: 0
};
var range = null;
function parseHTML2(html) {
  if (range == null) {
    range = document.createRange();
  }
  return range.createContextualFragment(html);
}
function hideElement(el) {
  if (el.style.display === "none") {
    return;
  }
  if (el.style.display) {
    el.dataset.styleDisplay = el.style.display;
  }
  el.style.display = "none";
}
function showElement(el) {
  if (el.style.display !== "none") {
    return;
  }
  if (el.dataset.styleDisplay) {
    el.style.display = el.dataset.styleDisplay;
    delete el.dataset.styleDisplay;
  } else {
    el.style.display = "";
  }
}
function emptyChildNodes(el) {
  if (el.firstChild) {
    el.removeChild(el.firstChild);
    emptyChildNodes(el);
  }
}
function replaceChildNodes(el, newChildNodes) {
  emptyChildNodes(el);
  if (newChildNodes instanceof DocumentFragment) {
    el.appendChild(newChildNodes);
  } else if (typeof newChildNodes === "string") {
    el.appendChild(parseHTML2(newChildNodes));
  } else if (typeof newChildNodes.forEach === "function") {
    newChildNodes.forEach(function(node) {
      el.appendChild(node);
    });
  }
}
var defaultLang = defaultOptions.language;
var defaultFormat = defaultOptions.format;
var defaultWeekStart = defaultOptions.weekStart;
function sanitizeDOW(dow, day) {
  return dow.length < 6 && day >= 0 && day < 7 ? pushUnique(dow, day) : dow;
}
function calcEndOfWeek(startOfWeek) {
  return (startOfWeek + 6) % 7;
}
function validateDate(value, format, locale, origValue) {
  var date = parseDate(value, format, locale);
  return date !== undefined ? date : origValue;
}
function validateViewId(value, origValue) {
  var max2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
  var viewId = parseInt(value, 10);
  return viewId >= 0 && viewId <= max2 ? viewId : origValue;
}
function processOptions(options, datepicker) {
  var inOpts = Object.assign({}, options);
  var config = {};
  var locales2 = datepicker.constructor.locales;
  var _ref = datepicker.config || {}, format = _ref.format, language = _ref.language, locale = _ref.locale, maxDate = _ref.maxDate, maxView = _ref.maxView, minDate = _ref.minDate, pickLevel = _ref.pickLevel, startView = _ref.startView, weekStart = _ref.weekStart;
  if (inOpts.language) {
    var lang;
    if (inOpts.language !== language) {
      if (locales2[inOpts.language]) {
        lang = inOpts.language;
      } else {
        lang = inOpts.language.split("-")[0];
        if (locales2[lang] === undefined) {
          lang = false;
        }
      }
    }
    delete inOpts.language;
    if (lang) {
      language = config.language = lang;
      var origLocale = locale || locales2[defaultLang];
      locale = Object.assign({
        format: defaultFormat,
        weekStart: defaultWeekStart
      }, locales2[defaultLang]);
      if (language !== defaultLang) {
        Object.assign(locale, locales2[language]);
      }
      config.locale = locale;
      if (format === origLocale.format) {
        format = config.format = locale.format;
      }
      if (weekStart === origLocale.weekStart) {
        weekStart = config.weekStart = locale.weekStart;
        config.weekEnd = calcEndOfWeek(locale.weekStart);
      }
    }
  }
  if (inOpts.format) {
    var hasToDisplay = typeof inOpts.format.toDisplay === "function";
    var hasToValue = typeof inOpts.format.toValue === "function";
    var validFormatString = reFormatTokens.test(inOpts.format);
    if (hasToDisplay && hasToValue || validFormatString) {
      format = config.format = inOpts.format;
    }
    delete inOpts.format;
  }
  var minDt = minDate;
  var maxDt = maxDate;
  if (inOpts.minDate !== undefined) {
    minDt = inOpts.minDate === null ? dateValue(0, 0, 1) : validateDate(inOpts.minDate, format, locale, minDt);
    delete inOpts.minDate;
  }
  if (inOpts.maxDate !== undefined) {
    maxDt = inOpts.maxDate === null ? undefined : validateDate(inOpts.maxDate, format, locale, maxDt);
    delete inOpts.maxDate;
  }
  if (maxDt < minDt) {
    minDate = config.minDate = maxDt;
    maxDate = config.maxDate = minDt;
  } else {
    if (minDate !== minDt) {
      minDate = config.minDate = minDt;
    }
    if (maxDate !== maxDt) {
      maxDate = config.maxDate = maxDt;
    }
  }
  if (inOpts.datesDisabled) {
    config.datesDisabled = inOpts.datesDisabled.reduce(function(dates, dt) {
      var date = parseDate(dt, format, locale);
      return date !== undefined ? pushUnique(dates, date) : dates;
    }, []);
    delete inOpts.datesDisabled;
  }
  if (inOpts.defaultViewDate !== undefined) {
    var viewDate = parseDate(inOpts.defaultViewDate, format, locale);
    if (viewDate !== undefined) {
      config.defaultViewDate = viewDate;
    }
    delete inOpts.defaultViewDate;
  }
  if (inOpts.weekStart !== undefined) {
    var wkStart = Number(inOpts.weekStart) % 7;
    if (!isNaN(wkStart)) {
      weekStart = config.weekStart = wkStart;
      config.weekEnd = calcEndOfWeek(wkStart);
    }
    delete inOpts.weekStart;
  }
  if (inOpts.daysOfWeekDisabled) {
    config.daysOfWeekDisabled = inOpts.daysOfWeekDisabled.reduce(sanitizeDOW, []);
    delete inOpts.daysOfWeekDisabled;
  }
  if (inOpts.daysOfWeekHighlighted) {
    config.daysOfWeekHighlighted = inOpts.daysOfWeekHighlighted.reduce(sanitizeDOW, []);
    delete inOpts.daysOfWeekHighlighted;
  }
  if (inOpts.maxNumberOfDates !== undefined) {
    var maxNumberOfDates = parseInt(inOpts.maxNumberOfDates, 10);
    if (maxNumberOfDates >= 0) {
      config.maxNumberOfDates = maxNumberOfDates;
      config.multidate = maxNumberOfDates !== 1;
    }
    delete inOpts.maxNumberOfDates;
  }
  if (inOpts.dateDelimiter) {
    config.dateDelimiter = String(inOpts.dateDelimiter);
    delete inOpts.dateDelimiter;
  }
  var newPickLevel = pickLevel;
  if (inOpts.pickLevel !== undefined) {
    newPickLevel = validateViewId(inOpts.pickLevel, 2);
    delete inOpts.pickLevel;
  }
  if (newPickLevel !== pickLevel) {
    pickLevel = config.pickLevel = newPickLevel;
  }
  var newMaxView = maxView;
  if (inOpts.maxView !== undefined) {
    newMaxView = validateViewId(inOpts.maxView, maxView);
    delete inOpts.maxView;
  }
  newMaxView = pickLevel > newMaxView ? pickLevel : newMaxView;
  if (newMaxView !== maxView) {
    maxView = config.maxView = newMaxView;
  }
  var newStartView = startView;
  if (inOpts.startView !== undefined) {
    newStartView = validateViewId(inOpts.startView, newStartView);
    delete inOpts.startView;
  }
  if (newStartView < pickLevel) {
    newStartView = pickLevel;
  } else if (newStartView > maxView) {
    newStartView = maxView;
  }
  if (newStartView !== startView) {
    config.startView = newStartView;
  }
  if (inOpts.prevArrow) {
    var prevArrow = parseHTML2(inOpts.prevArrow);
    if (prevArrow.childNodes.length > 0) {
      config.prevArrow = prevArrow.childNodes;
    }
    delete inOpts.prevArrow;
  }
  if (inOpts.nextArrow) {
    var nextArrow = parseHTML2(inOpts.nextArrow);
    if (nextArrow.childNodes.length > 0) {
      config.nextArrow = nextArrow.childNodes;
    }
    delete inOpts.nextArrow;
  }
  if (inOpts.disableTouchKeyboard !== undefined) {
    config.disableTouchKeyboard = "ontouchstart" in document && !!inOpts.disableTouchKeyboard;
    delete inOpts.disableTouchKeyboard;
  }
  if (inOpts.orientation) {
    var orientation = inOpts.orientation.toLowerCase().split(/\s+/g);
    config.orientation = {
      x: orientation.find(function(x) {
        return x === "left" || x === "right";
      }) || "auto",
      y: orientation.find(function(y3) {
        return y3 === "top" || y3 === "bottom";
      }) || "auto"
    };
    delete inOpts.orientation;
  }
  if (inOpts.todayBtnMode !== undefined) {
    switch (inOpts.todayBtnMode) {
      case 0:
      case 1:
        config.todayBtnMode = inOpts.todayBtnMode;
    }
    delete inOpts.todayBtnMode;
  }
  Object.keys(inOpts).forEach(function(key) {
    if (inOpts[key] !== undefined && hasProperty(defaultOptions, key)) {
      config[key] = inOpts[key];
    }
  });
  return config;
}
var pickerTemplate = optimizeTemplateHTML(`<div class="datepicker hidden">
  <div class="datepicker-picker inline-block rounded-base bg-neutral-primary-medium border border-default-medium p-4">
    <div class="datepicker-header">
      <div class="datepicker-title bg-neutral-primary-medium text-heading px-2 py-3 text-center font-medium"></div>
      <div class="datepicker-controls flex justify-between mb-2">
        <button type="button" class="bg-neutral-primary-medium rounded-base text-body hover:bg-neutral-tertiary-medium hover:text-heading text-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-tertiary prev-btn"></button>
        <button type="button" class="text-sm rounded-base text-heading bg-neutral-primary-medium font-medium py-2.5 px-5 hover:bg-neutral-tertiary-medium focus:outline-none focus:ring-2 focus:ring-neutral-tertiary view-switch"></button>
        <button type="button" class="bg-neutral-primary-medium rounded-base text-body hover:bg-neutral-tertiary-medium hover:text-heading text-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-tertiary next-btn"></button>
      </div>
    </div>
    <div class="datepicker-main p-1"></div>
    <div class="datepicker-footer">
      <div class="datepicker-controls flex space-x-2 rtl:space-x-reverse mt-2">
        <button type="button" class="%buttonClass% today-btn text-white bg-brand hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium font-medium rounded-base text-sm px-5 py-2 text-center w-1/2"></button>
        <button type="button" class="%buttonClass% clear-btn text-body bg-neutral-secondary-medium border border-default-medium hover:bg-neutral-tertiary-medium focus:ring-4 focus:ring-neutral-tertiary font-medium rounded-base text-sm px-5 py-2 text-center w-1/2"></button>
      </div>
    </div>
  </div>
</div>`);
var daysTemplate = optimizeTemplateHTML(`<div class="days">
  <div class="days-of-week grid grid-cols-7 mb-1">`.concat(createTagRepeat("span", 7, {
  class: "dow block flex-1 leading-9 border-0 rounded-base cursor-default text-center text-body font-medium text-sm"
}), `</div>
  <div class="datepicker-grid w-64 grid grid-cols-7">`).concat(createTagRepeat("span", 42, {
  class: "block flex-1 leading-9 border-0 rounded-base cursor-default text-center text-body font-medium text-sm h-6 leading-6 text-sm font-medium text-fg-disabled"
}), `</div>
</div>`));
var calendarWeeksTemplate = optimizeTemplateHTML(`<div class="calendar-weeks">
  <div class="days-of-week flex"><span class="dow h-6 leading-6 text-sm font-medium text-fg-disabled"></span></div>
  <div class="weeks">`.concat(createTagRepeat("span", 6, {
  class: "week block flex-1 leading-9 border-0 rounded-base cursor-default text-center text-body font-medium text-sm"
}), `</div>
</div>`));
var View = /* @__PURE__ */ function() {
  function View2(picker, config) {
    _classCallCheck(this, View2);
    Object.assign(this, config, {
      picker,
      element: parseHTML2('<div class="datepicker-view flex"></div>').firstChild,
      selected: []
    });
    this.init(this.picker.datepicker.config);
  }
  return _createClass(View2, [{
    key: "init",
    value: function init(options) {
      if (options.pickLevel !== undefined) {
        this.isMinView = this.id === options.pickLevel;
      }
      this.setOptions(options);
      this.updateFocus();
      this.updateSelection();
    }
  }, {
    key: "performBeforeHook",
    value: function performBeforeHook(el, current, timeValue) {
      var result = this.beforeShow(new Date(timeValue));
      switch (_typeof(result)) {
        case "boolean":
          result = {
            enabled: result
          };
          break;
        case "string":
          result = {
            classes: result
          };
      }
      if (result) {
        if (result.enabled === false) {
          el.classList.add("disabled");
          pushUnique(this.disabled, current);
        }
        if (result.classes) {
          var _el$classList;
          var extraClasses = result.classes.split(/\s+/);
          (_el$classList = el.classList).add.apply(_el$classList, _toConsumableArray(extraClasses));
          if (extraClasses.includes("disabled")) {
            pushUnique(this.disabled, current);
          }
        }
        if (result.content) {
          replaceChildNodes(el, result.content);
        }
      }
    }
  }]);
}();
var DaysView = /* @__PURE__ */ function(_View) {
  function DaysView2(picker) {
    _classCallCheck(this, DaysView2);
    return _callSuper(this, DaysView2, [picker, {
      id: 0,
      name: "days",
      cellClass: "day"
    }]);
  }
  _inherits(DaysView2, _View);
  return _createClass(DaysView2, [{
    key: "init",
    value: function init(options) {
      var onConstruction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (onConstruction) {
        var inner = parseHTML2(daysTemplate).firstChild;
        this.dow = inner.firstChild;
        this.grid = inner.lastChild;
        this.element.appendChild(inner);
      }
      _get(_getPrototypeOf(DaysView2.prototype), "init", this).call(this, options);
    }
  }, {
    key: "setOptions",
    value: function setOptions(options) {
      var _this = this;
      var updateDOW;
      if (hasProperty(options, "minDate")) {
        this.minDate = options.minDate;
      }
      if (hasProperty(options, "maxDate")) {
        this.maxDate = options.maxDate;
      }
      if (options.datesDisabled) {
        this.datesDisabled = options.datesDisabled;
      }
      if (options.daysOfWeekDisabled) {
        this.daysOfWeekDisabled = options.daysOfWeekDisabled;
        updateDOW = true;
      }
      if (options.daysOfWeekHighlighted) {
        this.daysOfWeekHighlighted = options.daysOfWeekHighlighted;
      }
      if (options.todayHighlight !== undefined) {
        this.todayHighlight = options.todayHighlight;
      }
      if (options.weekStart !== undefined) {
        this.weekStart = options.weekStart;
        this.weekEnd = options.weekEnd;
        updateDOW = true;
      }
      if (options.locale) {
        var locale = this.locale = options.locale;
        this.dayNames = locale.daysMin;
        this.switchLabelFormat = locale.titleFormat;
        updateDOW = true;
      }
      if (options.beforeShowDay !== undefined) {
        this.beforeShow = typeof options.beforeShowDay === "function" ? options.beforeShowDay : undefined;
      }
      if (options.calendarWeeks !== undefined) {
        if (options.calendarWeeks && !this.calendarWeeks) {
          var weeksElem = parseHTML2(calendarWeeksTemplate).firstChild;
          this.calendarWeeks = {
            element: weeksElem,
            dow: weeksElem.firstChild,
            weeks: weeksElem.lastChild
          };
          this.element.insertBefore(weeksElem, this.element.firstChild);
        } else if (this.calendarWeeks && !options.calendarWeeks) {
          this.element.removeChild(this.calendarWeeks.element);
          this.calendarWeeks = null;
        }
      }
      if (options.showDaysOfWeek !== undefined) {
        if (options.showDaysOfWeek) {
          showElement(this.dow);
          if (this.calendarWeeks) {
            showElement(this.calendarWeeks.dow);
          }
        } else {
          hideElement(this.dow);
          if (this.calendarWeeks) {
            hideElement(this.calendarWeeks.dow);
          }
        }
      }
      if (updateDOW) {
        Array.from(this.dow.children).forEach(function(el, index) {
          var dow = (_this.weekStart + index) % 7;
          el.textContent = _this.dayNames[dow];
          el.className = _this.daysOfWeekDisabled.includes(dow) ? "dow disabled text-center h-6 leading-6 text-sm font-medium text-fg-disabled cursor-not-allowed" : "dow text-center h-6 leading-6 text-sm font-medium text-body";
        });
      }
    }
  }, {
    key: "updateFocus",
    value: function updateFocus() {
      var viewDate = new Date(this.picker.viewDate);
      var viewYear = viewDate.getFullYear();
      var viewMonth = viewDate.getMonth();
      var firstOfMonth = dateValue(viewYear, viewMonth, 1);
      var start2 = dayOfTheWeekOf(firstOfMonth, this.weekStart, this.weekStart);
      this.first = firstOfMonth;
      this.last = dateValue(viewYear, viewMonth + 1, 0);
      this.start = start2;
      this.focused = this.picker.viewDate;
    }
  }, {
    key: "updateSelection",
    value: function updateSelection() {
      var _this$picker$datepick = this.picker.datepicker, dates = _this$picker$datepick.dates, rangepicker = _this$picker$datepick.rangepicker;
      this.selected = dates;
      if (rangepicker) {
        this.range = rangepicker.dates;
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;
      this.today = this.todayHighlight ? today() : undefined;
      this.disabled = _toConsumableArray(this.datesDisabled);
      var switchLabel = formatDate(this.focused, this.switchLabelFormat, this.locale);
      this.picker.setViewSwitchLabel(switchLabel);
      this.picker.setPrevBtnDisabled(this.first <= this.minDate);
      this.picker.setNextBtnDisabled(this.last >= this.maxDate);
      if (this.calendarWeeks) {
        var startOfWeek = dayOfTheWeekOf(this.first, 1, 1);
        Array.from(this.calendarWeeks.weeks.children).forEach(function(el, index) {
          el.textContent = getWeek(addWeeks(startOfWeek, index));
        });
      }
      Array.from(this.grid.children).forEach(function(el, index) {
        var classList = el.classList;
        var current = addDays(_this2.start, index);
        var date = new Date(current);
        var day = date.getDay();
        el.className = "datepicker-cell hover:bg-neutral-tertiary-medium block flex-1 leading-9 border-0 rounded-base cursor-pointer text-center text-body font-medium text-sm ".concat(_this2.cellClass);
        el.dataset.date = current;
        el.textContent = date.getDate();
        if (current < _this2.first) {
          classList.add("prev", "text-fg-disabled");
        } else if (current > _this2.last) {
          classList.add("next", "text-fg-disabled");
        }
        if (_this2.today === current) {
          classList.add("today", "bg-gray-100", "dark:bg-gray-600");
        }
        if (current < _this2.minDate || current > _this2.maxDate || _this2.disabled.includes(current)) {
          classList.add("disabled", "cursor-not-allowed", "text-fg-disabled");
          classList.remove("hover:bg-neutral-tertiary-medium", "text-body", "cursor-pointer");
        }
        if (_this2.daysOfWeekDisabled.includes(day)) {
          classList.add("disabled", "cursor-not-allowed", "text-fg-disabled");
          classList.remove("hover:bg-neutral-tertiary-medium", "text-body", "cursor-pointer");
          pushUnique(_this2.disabled, current);
        }
        if (_this2.daysOfWeekHighlighted.includes(day)) {
          classList.add("highlighted");
        }
        if (_this2.range) {
          var _this2$range = _slicedToArray(_this2.range, 2), rangeStart = _this2$range[0], rangeEnd = _this2$range[1];
          if (current > rangeStart && current < rangeEnd) {
            classList.add("range", "bg-neutral-tertiary-medium");
            classList.remove("rounded-base", "rounded-s-base", "rounded-e-base");
          }
          if (current === rangeStart) {
            classList.add("range-start", "bg-brand", "rounded-s-base");
            classList.remove("rounded-base", "rounded-e-base");
          }
          if (current === rangeEnd) {
            classList.add("range-end", "bg-neutral-tertiary-medium", "rounded-e-base");
            classList.remove("rounded-base", "rounded-s-base");
          }
        }
        if (_this2.selected.includes(current)) {
          classList.add("selected", "bg-brand", "text-white");
          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "bg-neutral-tertiary-medium");
        }
        if (current === _this2.focused) {
          classList.add("focused");
        }
        if (_this2.beforeShow) {
          _this2.performBeforeHook(el, current, current);
        }
      });
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var _this3 = this;
      var _ref = this.range || [], _ref2 = _slicedToArray(_ref, 2), rangeStart = _ref2[0], rangeEnd = _ref2[1];
      this.grid.querySelectorAll(".range, .range-start, .range-end, .selected, .focused").forEach(function(el) {
        el.classList.remove("range", "range-start", "range-end", "selected", "bg-brand", "text-white", "focused");
        el.classList.add("text-body", "rounded-base");
      });
      Array.from(this.grid.children).forEach(function(el) {
        var current = Number(el.dataset.date);
        var classList = el.classList;
        classList.remove("bg-neutral-tertiary-medium", "rounded-s-base", "rounded-e-base");
        if (current > rangeStart && current < rangeEnd) {
          classList.add("range", "bg-neutral-tertiary-medium");
          classList.remove("rounded-base");
        }
        if (current === rangeStart) {
          classList.add("range-start", "bg-brand", "text-white", "rounded-s-base");
          classList.remove("rounded-base");
        }
        if (current === rangeEnd) {
          classList.add("range-end", "bg-neutral-tertiary-medium", "rounded-e-base");
          classList.remove("rounded-base");
        }
        if (_this3.selected.includes(current)) {
          classList.add("selected", "bg-brand", "text-white");
          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "bg-neutral-tertiary-medium");
        }
        if (current === _this3.focused) {
          classList.add("focused");
        }
      });
    }
  }, {
    key: "refreshFocus",
    value: function refreshFocus() {
      var index = Math.round((this.focused - this.start) / 86400000);
      this.grid.querySelectorAll(".focused").forEach(function(el) {
        el.classList.remove("focused");
      });
      this.grid.children[index].classList.add("focused");
    }
  }]);
}(View);
function computeMonthRange(range2, thisYear) {
  if (!range2 || !range2[0] || !range2[1]) {
    return;
  }
  var _range = _slicedToArray(range2, 2), _range$ = _slicedToArray(_range[0], 2), startY = _range$[0], startM = _range$[1], _range$2 = _slicedToArray(_range[1], 2), endY = _range$2[0], endM = _range$2[1];
  if (startY > thisYear || endY < thisYear) {
    return;
  }
  return [startY === thisYear ? startM : -1, endY === thisYear ? endM : 12];
}
var MonthsView = /* @__PURE__ */ function(_View) {
  function MonthsView2(picker) {
    _classCallCheck(this, MonthsView2);
    return _callSuper(this, MonthsView2, [picker, {
      id: 1,
      name: "months",
      cellClass: "month"
    }]);
  }
  _inherits(MonthsView2, _View);
  return _createClass(MonthsView2, [{
    key: "init",
    value: function init(options) {
      var onConstruction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (onConstruction) {
        this.grid = this.element;
        this.element.classList.add("months", "datepicker-grid", "w-64", "grid", "grid-cols-4");
        this.grid.appendChild(parseHTML2(createTagRepeat("span", 12, {
          "data-month": function dataMonth(ix) {
            return ix;
          }
        })));
      }
      _get(_getPrototypeOf(MonthsView2.prototype), "init", this).call(this, options);
    }
  }, {
    key: "setOptions",
    value: function setOptions(options) {
      if (options.locale) {
        this.monthNames = options.locale.monthsShort;
      }
      if (hasProperty(options, "minDate")) {
        if (options.minDate === undefined) {
          this.minYear = this.minMonth = this.minDate = undefined;
        } else {
          var minDateObj = new Date(options.minDate);
          this.minYear = minDateObj.getFullYear();
          this.minMonth = minDateObj.getMonth();
          this.minDate = minDateObj.setDate(1);
        }
      }
      if (hasProperty(options, "maxDate")) {
        if (options.maxDate === undefined) {
          this.maxYear = this.maxMonth = this.maxDate = undefined;
        } else {
          var maxDateObj = new Date(options.maxDate);
          this.maxYear = maxDateObj.getFullYear();
          this.maxMonth = maxDateObj.getMonth();
          this.maxDate = dateValue(this.maxYear, this.maxMonth + 1, 0);
        }
      }
      if (options.beforeShowMonth !== undefined) {
        this.beforeShow = typeof options.beforeShowMonth === "function" ? options.beforeShowMonth : undefined;
      }
    }
  }, {
    key: "updateFocus",
    value: function updateFocus() {
      var viewDate = new Date(this.picker.viewDate);
      this.year = viewDate.getFullYear();
      this.focused = viewDate.getMonth();
    }
  }, {
    key: "updateSelection",
    value: function updateSelection() {
      var _this$picker$datepick = this.picker.datepicker, dates = _this$picker$datepick.dates, rangepicker = _this$picker$datepick.rangepicker;
      this.selected = dates.reduce(function(selected, timeValue) {
        var date = new Date(timeValue);
        var year = date.getFullYear();
        var month = date.getMonth();
        if (selected[year] === undefined) {
          selected[year] = [month];
        } else {
          pushUnique(selected[year], month);
        }
        return selected;
      }, {});
      if (rangepicker && rangepicker.dates) {
        this.range = rangepicker.dates.map(function(timeValue) {
          var date = new Date(timeValue);
          return isNaN(date) ? undefined : [date.getFullYear(), date.getMonth()];
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;
      this.disabled = [];
      this.picker.setViewSwitchLabel(this.year);
      this.picker.setPrevBtnDisabled(this.year <= this.minYear);
      this.picker.setNextBtnDisabled(this.year >= this.maxYear);
      var selected = this.selected[this.year] || [];
      var yrOutOfRange = this.year < this.minYear || this.year > this.maxYear;
      var isMinYear = this.year === this.minYear;
      var isMaxYear = this.year === this.maxYear;
      var range2 = computeMonthRange(this.range, this.year);
      Array.from(this.grid.children).forEach(function(el, index) {
        var classList = el.classList;
        var date = dateValue(_this.year, index, 1);
        el.className = "datepicker-cell hover:bg-neutral-tertiary-medium block flex-1 leading-9 border-0 rounded-base cursor-pointer text-center text-body font-medium text-sm ".concat(_this.cellClass);
        if (_this.isMinView) {
          el.dataset.date = date;
        }
        el.textContent = _this.monthNames[index];
        if (yrOutOfRange || isMinYear && index < _this.minMonth || isMaxYear && index > _this.maxMonth) {
          classList.add("disabled");
        }
        if (range2) {
          var _range2 = _slicedToArray(range2, 2), rangeStart = _range2[0], rangeEnd = _range2[1];
          if (index > rangeStart && index < rangeEnd) {
            classList.add("range");
          }
          if (index === rangeStart) {
            classList.add("range-start");
          }
          if (index === rangeEnd) {
            classList.add("range-end");
          }
        }
        if (selected.includes(index)) {
          classList.add("selected", "bg-brand", "text-white", "dark:text-white");
          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "dark:text-white");
        }
        if (index === _this.focused) {
          classList.add("focused");
        }
        if (_this.beforeShow) {
          _this.performBeforeHook(el, index, date);
        }
      });
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var _this2 = this;
      var selected = this.selected[this.year] || [];
      var _ref = computeMonthRange(this.range, this.year) || [], _ref2 = _slicedToArray(_ref, 2), rangeStart = _ref2[0], rangeEnd = _ref2[1];
      this.grid.querySelectorAll(".range, .range-start, .range-end, .selected, .focused").forEach(function(el) {
        el.classList.remove("range", "range-start", "range-end", "selected", "bg-brand", "dark:text-white", "text-white", "focused");
        el.classList.add("text-body", "hover:bg-neutral-tertiary-medium", "dark:text-white");
      });
      Array.from(this.grid.children).forEach(function(el, index) {
        var classList = el.classList;
        if (index > rangeStart && index < rangeEnd) {
          classList.add("range");
        }
        if (index === rangeStart) {
          classList.add("range-start");
        }
        if (index === rangeEnd) {
          classList.add("range-end");
        }
        if (selected.includes(index)) {
          classList.add("selected", "bg-brand", "text-white", "dark:text-white");
          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "dark:text-white");
        }
        if (index === _this2.focused) {
          classList.add("focused");
        }
      });
    }
  }, {
    key: "refreshFocus",
    value: function refreshFocus() {
      this.grid.querySelectorAll(".focused").forEach(function(el) {
        el.classList.remove("focused");
      });
      this.grid.children[this.focused].classList.add("focused");
    }
  }]);
}(View);
function toTitleCase(word) {
  return _toConsumableArray(word).reduce(function(str2, ch, ix) {
    return str2 += ix ? ch : ch.toUpperCase();
  }, "");
}
var YearsView = /* @__PURE__ */ function(_View) {
  function YearsView2(picker, config) {
    _classCallCheck(this, YearsView2);
    return _callSuper(this, YearsView2, [picker, config]);
  }
  _inherits(YearsView2, _View);
  return _createClass(YearsView2, [{
    key: "init",
    value: function init(options) {
      var onConstruction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (onConstruction) {
        this.navStep = this.step * 10;
        this.beforeShowOption = "beforeShow".concat(toTitleCase(this.cellClass));
        this.grid = this.element;
        this.element.classList.add(this.name, "datepicker-grid", "w-64", "grid", "grid-cols-4");
        this.grid.appendChild(parseHTML2(createTagRepeat("span", 12)));
      }
      _get(_getPrototypeOf(YearsView2.prototype), "init", this).call(this, options);
    }
  }, {
    key: "setOptions",
    value: function setOptions(options) {
      if (hasProperty(options, "minDate")) {
        if (options.minDate === undefined) {
          this.minYear = this.minDate = undefined;
        } else {
          this.minYear = startOfYearPeriod(options.minDate, this.step);
          this.minDate = dateValue(this.minYear, 0, 1);
        }
      }
      if (hasProperty(options, "maxDate")) {
        if (options.maxDate === undefined) {
          this.maxYear = this.maxDate = undefined;
        } else {
          this.maxYear = startOfYearPeriod(options.maxDate, this.step);
          this.maxDate = dateValue(this.maxYear, 11, 31);
        }
      }
      if (options[this.beforeShowOption] !== undefined) {
        var beforeShow = options[this.beforeShowOption];
        this.beforeShow = typeof beforeShow === "function" ? beforeShow : undefined;
      }
    }
  }, {
    key: "updateFocus",
    value: function updateFocus() {
      var viewDate = new Date(this.picker.viewDate);
      var first = startOfYearPeriod(viewDate, this.navStep);
      var last = first + 9 * this.step;
      this.first = first;
      this.last = last;
      this.start = first - this.step;
      this.focused = startOfYearPeriod(viewDate, this.step);
    }
  }, {
    key: "updateSelection",
    value: function updateSelection() {
      var _this = this;
      var _this$picker$datepick = this.picker.datepicker, dates = _this$picker$datepick.dates, rangepicker = _this$picker$datepick.rangepicker;
      this.selected = dates.reduce(function(years, timeValue) {
        return pushUnique(years, startOfYearPeriod(timeValue, _this.step));
      }, []);
      if (rangepicker && rangepicker.dates) {
        this.range = rangepicker.dates.map(function(timeValue) {
          if (timeValue !== undefined) {
            return startOfYearPeriod(timeValue, _this.step);
          }
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;
      this.disabled = [];
      this.picker.setViewSwitchLabel("".concat(this.first, "-").concat(this.last));
      this.picker.setPrevBtnDisabled(this.first <= this.minYear);
      this.picker.setNextBtnDisabled(this.last >= this.maxYear);
      Array.from(this.grid.children).forEach(function(el, index) {
        var classList = el.classList;
        var current = _this2.start + index * _this2.step;
        var date = dateValue(current, 0, 1);
        el.className = "datepicker-cell hover:bg-neutral-tertiary-medium block flex-1 leading-9 border-0 rounded-base cursor-pointer text-center text-body font-medium text-sm ".concat(_this2.cellClass);
        if (_this2.isMinView) {
          el.dataset.date = date;
        }
        el.textContent = el.dataset.year = current;
        if (index === 0) {
          classList.add("prev");
        } else if (index === 11) {
          classList.add("next");
        }
        if (current < _this2.minYear || current > _this2.maxYear) {
          classList.add("disabled");
        }
        if (_this2.range) {
          var _this2$range = _slicedToArray(_this2.range, 2), rangeStart = _this2$range[0], rangeEnd = _this2$range[1];
          if (current > rangeStart && current < rangeEnd) {
            classList.add("range");
          }
          if (current === rangeStart) {
            classList.add("range-start");
          }
          if (current === rangeEnd) {
            classList.add("range-end");
          }
        }
        if (_this2.selected.includes(current)) {
          classList.add("selected", "bg-brand", "text-white", "dark:text-white");
          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "dark:text-white");
        }
        if (current === _this2.focused) {
          classList.add("focused");
        }
        if (_this2.beforeShow) {
          _this2.performBeforeHook(el, current, date);
        }
      });
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var _this3 = this;
      var _ref = this.range || [], _ref2 = _slicedToArray(_ref, 2), rangeStart = _ref2[0], rangeEnd = _ref2[1];
      this.grid.querySelectorAll(".range, .range-start, .range-end, .selected, .focused").forEach(function(el) {
        el.classList.remove("range", "range-start", "range-end", "selected", "bg-brand", "text-white", "dark:text-white", "focused");
      });
      Array.from(this.grid.children).forEach(function(el) {
        var current = Number(el.textContent);
        var classList = el.classList;
        if (current > rangeStart && current < rangeEnd) {
          classList.add("range");
        }
        if (current === rangeStart) {
          classList.add("range-start");
        }
        if (current === rangeEnd) {
          classList.add("range-end");
        }
        if (_this3.selected.includes(current)) {
          classList.add("selected", "bg-brand", "text-white", "hover:text-heading");
          classList.remove("text-body", "hover:bg-neutral-tertiary-medium", "hover:text-heading");
        }
        if (current === _this3.focused) {
          classList.add("focused");
        }
      });
    }
  }, {
    key: "refreshFocus",
    value: function refreshFocus() {
      var index = Math.round((this.focused - this.start) / this.step);
      this.grid.querySelectorAll(".focused").forEach(function(el) {
        el.classList.remove("focused");
      });
      this.grid.children[index].classList.add("focused");
    }
  }]);
}(View);
function triggerDatepickerEvent(datepicker, type) {
  var detail = {
    date: datepicker.getDate(),
    viewDate: new Date(datepicker.picker.viewDate),
    viewId: datepicker.picker.currentView.id,
    datepicker
  };
  datepicker.element.dispatchEvent(new CustomEvent(type, {
    detail
  }));
}
function goToPrevOrNext(datepicker, direction) {
  var _datepicker$config = datepicker.config, minDate = _datepicker$config.minDate, maxDate = _datepicker$config.maxDate;
  var _datepicker$picker = datepicker.picker, currentView = _datepicker$picker.currentView, viewDate = _datepicker$picker.viewDate;
  var newViewDate;
  switch (currentView.id) {
    case 0:
      newViewDate = addMonths(viewDate, direction);
      break;
    case 1:
      newViewDate = addYears(viewDate, direction);
      break;
    default:
      newViewDate = addYears(viewDate, direction * currentView.navStep);
  }
  newViewDate = limitToRange(newViewDate, minDate, maxDate);
  datepicker.picker.changeFocus(newViewDate).render();
}
function switchView(datepicker) {
  var viewId = datepicker.picker.currentView.id;
  if (viewId === datepicker.config.maxView) {
    return;
  }
  datepicker.picker.changeView(viewId + 1).render();
}
function unfocus(datepicker) {
  if (datepicker.config.updateOnBlur) {
    datepicker.update({
      autohide: true
    });
  } else {
    datepicker.refresh("input");
    datepicker.hide();
  }
}
function goToSelectedMonthOrYear(datepicker, selection) {
  var picker = datepicker.picker;
  var viewDate = new Date(picker.viewDate);
  var viewId = picker.currentView.id;
  var newDate = viewId === 1 ? addMonths(viewDate, selection - viewDate.getMonth()) : addYears(viewDate, selection - viewDate.getFullYear());
  picker.changeFocus(newDate).changeView(viewId - 1).render();
}
function onClickTodayBtn(datepicker) {
  var picker = datepicker.picker;
  var currentDate = today();
  if (datepicker.config.todayBtnMode === 1) {
    if (datepicker.config.autohide) {
      datepicker.setDate(currentDate);
      return;
    }
    datepicker.setDate(currentDate, {
      render: false
    });
    picker.update();
  }
  if (picker.viewDate !== currentDate) {
    picker.changeFocus(currentDate);
  }
  picker.changeView(0).render();
}
function onClickClearBtn(datepicker) {
  datepicker.setDate({
    clear: true
  });
}
function onClickViewSwitch(datepicker) {
  switchView(datepicker);
}
function onClickPrevBtn(datepicker) {
  goToPrevOrNext(datepicker, -1);
}
function onClickNextBtn(datepicker) {
  goToPrevOrNext(datepicker, 1);
}
function onClickView(datepicker, ev) {
  var target = findElementInEventPath(ev, ".datepicker-cell");
  if (!target || target.classList.contains("disabled")) {
    return;
  }
  var _datepicker$picker$cu = datepicker.picker.currentView, id = _datepicker$picker$cu.id, isMinView = _datepicker$picker$cu.isMinView;
  if (isMinView) {
    datepicker.setDate(Number(target.dataset.date));
  } else if (id === 1) {
    goToSelectedMonthOrYear(datepicker, Number(target.dataset.month));
  } else {
    goToSelectedMonthOrYear(datepicker, Number(target.dataset.year));
  }
}
function onClickPicker(datepicker) {
  if (!datepicker.inline && !datepicker.config.disableTouchKeyboard) {
    datepicker.inputField.focus();
  }
}
function processPickerOptions(picker, options) {
  if (options.title !== undefined) {
    if (options.title) {
      picker.controls.title.textContent = options.title;
      showElement(picker.controls.title);
    } else {
      picker.controls.title.textContent = "";
      hideElement(picker.controls.title);
    }
  }
  if (options.prevArrow) {
    var prevBtn = picker.controls.prevBtn;
    emptyChildNodes(prevBtn);
    options.prevArrow.forEach(function(node) {
      prevBtn.appendChild(node.cloneNode(true));
    });
  }
  if (options.nextArrow) {
    var nextBtn = picker.controls.nextBtn;
    emptyChildNodes(nextBtn);
    options.nextArrow.forEach(function(node) {
      nextBtn.appendChild(node.cloneNode(true));
    });
  }
  if (options.locale) {
    picker.controls.todayBtn.textContent = options.locale.today;
    picker.controls.clearBtn.textContent = options.locale.clear;
  }
  if (options.todayBtn !== undefined) {
    if (options.todayBtn) {
      showElement(picker.controls.todayBtn);
    } else {
      hideElement(picker.controls.todayBtn);
    }
  }
  if (hasProperty(options, "minDate") || hasProperty(options, "maxDate")) {
    var _picker$datepicker$co = picker.datepicker.config, minDate = _picker$datepicker$co.minDate, maxDate = _picker$datepicker$co.maxDate;
    picker.controls.todayBtn.disabled = !isInRange(today(), minDate, maxDate);
  }
  if (options.clearBtn !== undefined) {
    if (options.clearBtn) {
      showElement(picker.controls.clearBtn);
    } else {
      hideElement(picker.controls.clearBtn);
    }
  }
}
function computeResetViewDate(datepicker) {
  var { dates, config } = datepicker;
  var viewDate = dates.length > 0 ? lastItemOf(dates) : config.defaultViewDate;
  return limitToRange(viewDate, config.minDate, config.maxDate);
}
function setViewDate(picker, newDate) {
  var oldViewDate = new Date(picker.viewDate);
  var newViewDate = new Date(newDate);
  var _picker$currentView = picker.currentView, id = _picker$currentView.id, year = _picker$currentView.year, first = _picker$currentView.first, last = _picker$currentView.last;
  var viewYear = newViewDate.getFullYear();
  picker.viewDate = newDate;
  if (viewYear !== oldViewDate.getFullYear()) {
    triggerDatepickerEvent(picker.datepicker, "changeYear");
  }
  if (newViewDate.getMonth() !== oldViewDate.getMonth()) {
    triggerDatepickerEvent(picker.datepicker, "changeMonth");
  }
  switch (id) {
    case 0:
      return newDate < first || newDate > last;
    case 1:
      return viewYear !== year;
    default:
      return viewYear < first || viewYear > last;
  }
}
function getTextDirection(el) {
  return window.getComputedStyle(el).direction;
}
var Picker = /* @__PURE__ */ function() {
  function Picker2(datepicker) {
    _classCallCheck(this, Picker2);
    this.datepicker = datepicker;
    var template = pickerTemplate.replace(/%buttonClass%/g, datepicker.config.buttonClass);
    var element = this.element = parseHTML2(template).firstChild;
    var _element$firstChild$c = _slicedToArray(element.firstChild.children, 3), header = _element$firstChild$c[0], main2 = _element$firstChild$c[1], footer = _element$firstChild$c[2];
    var title = header.firstElementChild;
    var _header$lastElementCh = _slicedToArray(header.lastElementChild.children, 3), prevBtn = _header$lastElementCh[0], viewSwitch = _header$lastElementCh[1], nextBtn = _header$lastElementCh[2];
    var _footer$firstChild$ch = _slicedToArray(footer.firstChild.children, 2), todayBtn = _footer$firstChild$ch[0], clearBtn = _footer$firstChild$ch[1];
    var controls = {
      title,
      prevBtn,
      viewSwitch,
      nextBtn,
      todayBtn,
      clearBtn
    };
    this.main = main2;
    this.controls = controls;
    var elementClass = datepicker.inline ? "inline" : "dropdown";
    element.classList.add("datepicker-".concat(elementClass));
    elementClass === "dropdown" && element.classList.add("dropdown", "absolute", "top-0", "left-0", "z-50", "pt-2");
    processPickerOptions(this, datepicker.config);
    this.viewDate = computeResetViewDate(datepicker);
    registerListeners(datepicker, [[element, "click", onClickPicker.bind(null, datepicker), {
      capture: true
    }], [main2, "click", onClickView.bind(null, datepicker)], [controls.viewSwitch, "click", onClickViewSwitch.bind(null, datepicker)], [controls.prevBtn, "click", onClickPrevBtn.bind(null, datepicker)], [controls.nextBtn, "click", onClickNextBtn.bind(null, datepicker)], [controls.todayBtn, "click", onClickTodayBtn.bind(null, datepicker)], [controls.clearBtn, "click", onClickClearBtn.bind(null, datepicker)]]);
    this.views = [new DaysView(this), new MonthsView(this), new YearsView(this, {
      id: 2,
      name: "years",
      cellClass: "year",
      step: 1
    }), new YearsView(this, {
      id: 3,
      name: "decades",
      cellClass: "decade",
      step: 10
    })];
    this.currentView = this.views[datepicker.config.startView];
    this.currentView.render();
    this.main.appendChild(this.currentView.element);
    datepicker.config.container.appendChild(this.element);
  }
  return _createClass(Picker2, [{
    key: "setOptions",
    value: function setOptions(options) {
      processPickerOptions(this, options);
      this.views.forEach(function(view) {
        view.init(options, false);
      });
      this.currentView.render();
    }
  }, {
    key: "detach",
    value: function detach() {
      this.datepicker.config.container.removeChild(this.element);
    }
  }, {
    key: "show",
    value: function show() {
      if (this.active) {
        return;
      }
      this.element.classList.add("active", "block");
      this.element.classList.remove("hidden");
      this.active = true;
      var datepicker = this.datepicker;
      if (!datepicker.inline) {
        var inputDirection = getTextDirection(datepicker.inputField);
        if (inputDirection !== getTextDirection(datepicker.config.container)) {
          this.element.dir = inputDirection;
        } else if (this.element.dir) {
          this.element.removeAttribute("dir");
        }
        this.place();
        if (datepicker.config.disableTouchKeyboard) {
          datepicker.inputField.blur();
        }
      }
      triggerDatepickerEvent(datepicker, "show");
    }
  }, {
    key: "hide",
    value: function hide2() {
      if (!this.active) {
        return;
      }
      this.datepicker.exitEditMode();
      this.element.classList.remove("active", "block");
      this.element.classList.add("active", "block", "hidden");
      this.active = false;
      triggerDatepickerEvent(this.datepicker, "hide");
    }
  }, {
    key: "place",
    value: function place() {
      var _this$element = this.element, classList = _this$element.classList, style = _this$element.style;
      var _this$datepicker = this.datepicker, config = _this$datepicker.config, inputField = _this$datepicker.inputField;
      var container = config.container;
      var _this$element$getBoun = this.element.getBoundingClientRect(), calendarWidth = _this$element$getBoun.width, calendarHeight = _this$element$getBoun.height;
      var _container$getBoundin = container.getBoundingClientRect(), containerLeft = _container$getBoundin.left, containerTop = _container$getBoundin.top, containerWidth = _container$getBoundin.width;
      var _inputField$getBoundi = inputField.getBoundingClientRect(), inputLeft = _inputField$getBoundi.left, inputTop = _inputField$getBoundi.top, inputWidth = _inputField$getBoundi.width, inputHeight = _inputField$getBoundi.height;
      var _config$orientation = config.orientation, orientX = _config$orientation.x, orientY = _config$orientation.y;
      var scrollTop;
      var left2;
      var top2;
      if (container === document.body) {
        scrollTop = window.scrollY;
        left2 = inputLeft + window.scrollX;
        top2 = inputTop + scrollTop;
      } else {
        scrollTop = container.scrollTop;
        left2 = inputLeft - containerLeft;
        top2 = inputTop - containerTop + scrollTop;
      }
      if (orientX === "auto") {
        if (left2 < 0) {
          orientX = "left";
          left2 = 10;
        } else if (left2 + calendarWidth > containerWidth) {
          orientX = "right";
        } else {
          orientX = getTextDirection(inputField) === "rtl" ? "right" : "left";
        }
      }
      if (orientX === "right") {
        left2 -= calendarWidth - inputWidth;
      }
      if (orientY === "auto") {
        orientY = top2 - calendarHeight < scrollTop ? "bottom" : "top";
      }
      if (orientY === "top") {
        top2 -= calendarHeight;
      } else {
        top2 += inputHeight;
      }
      classList.remove("datepicker-orient-top", "datepicker-orient-bottom", "datepicker-orient-right", "datepicker-orient-left");
      classList.add("datepicker-orient-".concat(orientY), "datepicker-orient-".concat(orientX));
      style.top = top2 ? "".concat(top2, "px") : top2;
      style.left = left2 ? "".concat(left2, "px") : left2;
    }
  }, {
    key: "setViewSwitchLabel",
    value: function setViewSwitchLabel(labelText) {
      this.controls.viewSwitch.textContent = labelText;
    }
  }, {
    key: "setPrevBtnDisabled",
    value: function setPrevBtnDisabled(disabled) {
      this.controls.prevBtn.disabled = disabled;
    }
  }, {
    key: "setNextBtnDisabled",
    value: function setNextBtnDisabled(disabled) {
      this.controls.nextBtn.disabled = disabled;
    }
  }, {
    key: "changeView",
    value: function changeView(viewId) {
      var oldView = this.currentView;
      var newView = this.views[viewId];
      if (newView.id !== oldView.id) {
        this.currentView = newView;
        this._renderMethod = "render";
        triggerDatepickerEvent(this.datepicker, "changeView");
        this.main.replaceChild(newView.element, oldView.element);
      }
      return this;
    }
  }, {
    key: "changeFocus",
    value: function changeFocus(newViewDate) {
      this._renderMethod = setViewDate(this, newViewDate) ? "render" : "refreshFocus";
      this.views.forEach(function(view) {
        view.updateFocus();
      });
      return this;
    }
  }, {
    key: "update",
    value: function update() {
      var newViewDate = computeResetViewDate(this.datepicker);
      this._renderMethod = setViewDate(this, newViewDate) ? "render" : "refresh";
      this.views.forEach(function(view) {
        view.updateFocus();
        view.updateSelection();
      });
      return this;
    }
  }, {
    key: "render",
    value: function render() {
      var quickRender = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var renderMethod = quickRender && this._renderMethod || "render";
      delete this._renderMethod;
      this.currentView[renderMethod]();
    }
  }]);
}();
function findNextAvailableOne(date, addFn, increase, testFn, min2, max2) {
  if (!isInRange(date, min2, max2)) {
    return;
  }
  if (testFn(date)) {
    var newDate = addFn(date, increase);
    return findNextAvailableOne(newDate, addFn, increase, testFn, min2, max2);
  }
  return date;
}
function moveByArrowKey(datepicker, ev, direction, vertical) {
  var picker = datepicker.picker;
  var currentView = picker.currentView;
  var step = currentView.step || 1;
  var viewDate = picker.viewDate;
  var addFn;
  var testFn;
  switch (currentView.id) {
    case 0:
      if (vertical) {
        viewDate = addDays(viewDate, direction * 7);
      } else if (ev.ctrlKey || ev.metaKey) {
        viewDate = addYears(viewDate, direction);
      } else {
        viewDate = addDays(viewDate, direction);
      }
      addFn = addDays;
      testFn = function testFn2(date) {
        return currentView.disabled.includes(date);
      };
      break;
    case 1:
      viewDate = addMonths(viewDate, vertical ? direction * 4 : direction);
      addFn = addMonths;
      testFn = function testFn2(date) {
        var dt = new Date(date);
        var { year, disabled } = currentView;
        return dt.getFullYear() === year && disabled.includes(dt.getMonth());
      };
      break;
    default:
      viewDate = addYears(viewDate, direction * (vertical ? 4 : 1) * step);
      addFn = addYears;
      testFn = function testFn2(date) {
        return currentView.disabled.includes(startOfYearPeriod(date, step));
      };
  }
  viewDate = findNextAvailableOne(viewDate, addFn, direction < 0 ? -step : step, testFn, currentView.minDate, currentView.maxDate);
  if (viewDate !== undefined) {
    picker.changeFocus(viewDate).render();
  }
}
function onKeydown(datepicker, ev) {
  if (ev.key === "Tab") {
    unfocus(datepicker);
    return;
  }
  var picker = datepicker.picker;
  var _picker$currentView = picker.currentView, id = _picker$currentView.id, isMinView = _picker$currentView.isMinView;
  if (!picker.active) {
    switch (ev.key) {
      case "ArrowDown":
      case "Escape":
        picker.show();
        break;
      case "Enter":
        datepicker.update();
        break;
      default:
        return;
    }
  } else if (datepicker.editMode) {
    switch (ev.key) {
      case "Escape":
        picker.hide();
        break;
      case "Enter":
        datepicker.exitEditMode({
          update: true,
          autohide: datepicker.config.autohide
        });
        break;
      default:
        return;
    }
  } else {
    switch (ev.key) {
      case "Escape":
        picker.hide();
        break;
      case "ArrowLeft":
        if (ev.ctrlKey || ev.metaKey) {
          goToPrevOrNext(datepicker, -1);
        } else if (ev.shiftKey) {
          datepicker.enterEditMode();
          return;
        } else {
          moveByArrowKey(datepicker, ev, -1, false);
        }
        break;
      case "ArrowRight":
        if (ev.ctrlKey || ev.metaKey) {
          goToPrevOrNext(datepicker, 1);
        } else if (ev.shiftKey) {
          datepicker.enterEditMode();
          return;
        } else {
          moveByArrowKey(datepicker, ev, 1, false);
        }
        break;
      case "ArrowUp":
        if (ev.ctrlKey || ev.metaKey) {
          switchView(datepicker);
        } else if (ev.shiftKey) {
          datepicker.enterEditMode();
          return;
        } else {
          moveByArrowKey(datepicker, ev, -1, true);
        }
        break;
      case "ArrowDown":
        if (ev.shiftKey && !ev.ctrlKey && !ev.metaKey) {
          datepicker.enterEditMode();
          return;
        }
        moveByArrowKey(datepicker, ev, 1, true);
        break;
      case "Enter":
        if (isMinView) {
          datepicker.setDate(picker.viewDate);
        } else {
          picker.changeView(id - 1).render();
        }
        break;
      case "Backspace":
      case "Delete":
        datepicker.enterEditMode();
        return;
      default:
        if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey) {
          datepicker.enterEditMode();
        }
        return;
    }
  }
  ev.preventDefault();
  ev.stopPropagation();
}
function onFocus(datepicker) {
  if (datepicker.config.showOnFocus && !datepicker._showing) {
    datepicker.show();
  }
}
function onMousedown(datepicker, ev) {
  var el = ev.target;
  if (datepicker.picker.active || datepicker.config.showOnClick) {
    el._active = el === document.activeElement;
    el._clicking = setTimeout(function() {
      delete el._active;
      delete el._clicking;
    }, 2000);
  }
}
function onClickInput(datepicker, ev) {
  var el = ev.target;
  if (!el._clicking) {
    return;
  }
  clearTimeout(el._clicking);
  delete el._clicking;
  if (el._active) {
    datepicker.enterEditMode();
  }
  delete el._active;
  if (datepicker.config.showOnClick) {
    datepicker.show();
  }
}
function onPaste(datepicker, ev) {
  if (ev.clipboardData.types.includes("text/plain")) {
    datepicker.enterEditMode();
  }
}
function onClickOutside(datepicker, ev) {
  var element = datepicker.element;
  if (element !== document.activeElement) {
    return;
  }
  var pickerElem = datepicker.picker.element;
  if (findElementInEventPath(ev, function(el) {
    return el === element || el === pickerElem;
  })) {
    return;
  }
  unfocus(datepicker);
}
function stringifyDates(dates, config) {
  return dates.map(function(dt) {
    return formatDate(dt, config.format, config.locale);
  }).join(config.dateDelimiter);
}
function processInputDates(datepicker, inputDates) {
  var clear = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var { config, dates: origDates, rangepicker } = datepicker;
  if (inputDates.length === 0) {
    return clear ? [] : undefined;
  }
  var rangeEnd = rangepicker && datepicker === rangepicker.datepickers[1];
  var newDates = inputDates.reduce(function(dates, dt) {
    var date = parseDate(dt, config.format, config.locale);
    if (date === undefined) {
      return dates;
    }
    if (config.pickLevel > 0) {
      var _dt = new Date(date);
      if (config.pickLevel === 1) {
        date = rangeEnd ? _dt.setMonth(_dt.getMonth() + 1, 0) : _dt.setDate(1);
      } else {
        date = rangeEnd ? _dt.setFullYear(_dt.getFullYear() + 1, 0, 0) : _dt.setMonth(0, 1);
      }
    }
    if (isInRange(date, config.minDate, config.maxDate) && !dates.includes(date) && !config.datesDisabled.includes(date) && !config.daysOfWeekDisabled.includes(new Date(date).getDay())) {
      dates.push(date);
    }
    return dates;
  }, []);
  if (newDates.length === 0) {
    return;
  }
  if (config.multidate && !clear) {
    newDates = newDates.reduce(function(dates, date) {
      if (!origDates.includes(date)) {
        dates.push(date);
      }
      return dates;
    }, origDates.filter(function(date) {
      return !newDates.includes(date);
    }));
  }
  return config.maxNumberOfDates && newDates.length > config.maxNumberOfDates ? newDates.slice(config.maxNumberOfDates * -1) : newDates;
}
function refreshUI(datepicker) {
  var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;
  var quickRender = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var { config, picker, inputField } = datepicker;
  if (mode & 2) {
    var newView = picker.active ? config.pickLevel : config.startView;
    picker.update().changeView(newView).render(quickRender);
  }
  if (mode & 1 && inputField) {
    inputField.value = stringifyDates(datepicker.dates, config);
  }
}
function _setDate(datepicker, inputDates, options) {
  var { clear, render, autohide } = options;
  if (render === undefined) {
    render = true;
  }
  if (!render) {
    autohide = false;
  } else if (autohide === undefined) {
    autohide = datepicker.config.autohide;
  }
  var newDates = processInputDates(datepicker, inputDates, clear);
  if (!newDates) {
    return;
  }
  if (newDates.toString() !== datepicker.dates.toString()) {
    datepicker.dates = newDates;
    refreshUI(datepicker, render ? 3 : 1);
    triggerDatepickerEvent(datepicker, "changeDate");
  } else {
    refreshUI(datepicker, 1);
  }
  if (autohide) {
    datepicker.hide();
  }
}
var Datepicker = /* @__PURE__ */ function() {
  function Datepicker2(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var rangepicker = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
    _classCallCheck(this, Datepicker2);
    element.datepicker = this;
    this.element = element;
    var config = this.config = Object.assign({
      buttonClass: options.buttonClass && String(options.buttonClass) || "button",
      container: document.body,
      defaultViewDate: today(),
      maxDate: undefined,
      minDate: undefined
    }, processOptions(defaultOptions, this));
    this._options = options;
    Object.assign(config, processOptions(options, this));
    var inline = this.inline = element.tagName !== "INPUT";
    var inputField;
    var initialDates;
    if (inline) {
      config.container = element;
      initialDates = stringToArray(element.dataset.date, config.dateDelimiter);
      delete element.dataset.date;
    } else {
      var container = options.container ? document.querySelector(options.container) : null;
      if (container) {
        config.container = container;
      }
      inputField = this.inputField = element;
      inputField.classList.add("datepicker-input");
      initialDates = stringToArray(inputField.value, config.dateDelimiter);
    }
    if (rangepicker) {
      var index = rangepicker.inputs.indexOf(inputField);
      var datepickers = rangepicker.datepickers;
      if (index < 0 || index > 1 || !Array.isArray(datepickers)) {
        throw Error("Invalid rangepicker object.");
      }
      datepickers[index] = this;
      Object.defineProperty(this, "rangepicker", {
        get: function get() {
          return rangepicker;
        }
      });
    }
    this.dates = [];
    var inputDateValues = processInputDates(this, initialDates);
    if (inputDateValues && inputDateValues.length > 0) {
      this.dates = inputDateValues;
    }
    if (inputField) {
      inputField.value = stringifyDates(this.dates, config);
    }
    var picker = this.picker = new Picker(this);
    if (inline) {
      this.show();
    } else {
      var onMousedownDocument = onClickOutside.bind(null, this);
      var listeners = [[inputField, "keydown", onKeydown.bind(null, this)], [inputField, "focus", onFocus.bind(null, this)], [inputField, "mousedown", onMousedown.bind(null, this)], [inputField, "click", onClickInput.bind(null, this)], [inputField, "paste", onPaste.bind(null, this)], [document, "mousedown", onMousedownDocument], [document, "touchstart", onMousedownDocument], [window, "resize", picker.place.bind(picker)]];
      registerListeners(this, listeners);
    }
  }
  return _createClass(Datepicker2, [{
    key: "active",
    get: function get() {
      return !!(this.picker && this.picker.active);
    }
  }, {
    key: "pickerElement",
    get: function get() {
      return this.picker ? this.picker.element : undefined;
    }
  }, {
    key: "setOptions",
    value: function setOptions(options) {
      var picker = this.picker;
      var newOptions = processOptions(options, this);
      Object.assign(this._options, options);
      Object.assign(this.config, newOptions);
      picker.setOptions(newOptions);
      refreshUI(this, 3);
    }
  }, {
    key: "show",
    value: function show() {
      if (this.inputField) {
        if (this.inputField.disabled) {
          return;
        }
        if (this.inputField !== document.activeElement) {
          this._showing = true;
          this.inputField.focus();
          delete this._showing;
        }
      }
      this.picker.show();
    }
  }, {
    key: "hide",
    value: function hide2() {
      if (this.inline) {
        return;
      }
      this.picker.hide();
      this.picker.update().changeView(this.config.startView).render();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.hide();
      unregisterListeners(this);
      this.picker.detach();
      if (!this.inline) {
        this.inputField.classList.remove("datepicker-input");
      }
      delete this.element.datepicker;
      return this;
    }
  }, {
    key: "getDate",
    value: function getDate() {
      var _this = this;
      var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var callback = format ? function(date) {
        return formatDate(date, format, _this.config.locale);
      } : function(date) {
        return new Date(date);
      };
      if (this.config.multidate) {
        return this.dates.map(callback);
      }
      if (this.dates.length > 0) {
        return callback(this.dates[0]);
      }
    }
  }, {
    key: "setDate",
    value: function setDate() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0;_key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var dates = [].concat(args);
      var opts = {};
      var lastArg = lastItemOf(args);
      if (_typeof(lastArg) === "object" && !Array.isArray(lastArg) && !(lastArg instanceof Date) && lastArg) {
        Object.assign(opts, dates.pop());
      }
      var inputDates = Array.isArray(dates[0]) ? dates[0] : dates;
      _setDate(this, inputDates, opts);
    }
  }, {
    key: "update",
    value: function update() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (this.inline) {
        return;
      }
      var opts = {
        clear: true,
        autohide: !!(options && options.autohide)
      };
      var inputDates = stringToArray(this.inputField.value, this.config.dateDelimiter);
      _setDate(this, inputDates, opts);
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var forceRender = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (target && typeof target !== "string") {
        forceRender = target;
        target = undefined;
      }
      var mode;
      if (target === "picker") {
        mode = 2;
      } else if (target === "input") {
        mode = 1;
      } else {
        mode = 3;
      }
      refreshUI(this, mode, !forceRender);
    }
  }, {
    key: "enterEditMode",
    value: function enterEditMode() {
      if (this.inline || !this.picker.active || this.editMode) {
        return;
      }
      this.editMode = true;
      this.inputField.classList.add("in-edit", "border-brand");
    }
  }, {
    key: "exitEditMode",
    value: function exitEditMode() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      if (this.inline || !this.editMode) {
        return;
      }
      var opts = Object.assign({
        update: false
      }, options);
      delete this.editMode;
      this.inputField.classList.remove("in-edit", "border-brand");
      if (opts.update) {
        this.update(opts);
      }
    }
  }], [{
    key: "formatDate",
    value: function formatDate$1(date, format, lang) {
      return formatDate(date, format, lang && locales[lang] || locales.en);
    }
  }, {
    key: "parseDate",
    value: function parseDate$1(dateStr, format, lang) {
      return parseDate(dateStr, format, lang && locales[lang] || locales.en);
    }
  }, {
    key: "locales",
    get: function get() {
      return locales;
    }
  }]);
}();
function filterOptions(options) {
  var newOpts = Object.assign({}, options);
  delete newOpts.inputs;
  delete newOpts.allowOneSidedRange;
  delete newOpts.maxNumberOfDates;
  return newOpts;
}
function setupDatepicker(rangepicker, changeDateListener, el, options) {
  registerListeners(rangepicker, [[el, "changeDate", changeDateListener]]);
  new Datepicker(el, options, rangepicker);
}
function onChangeDate(rangepicker, ev) {
  if (rangepicker._updating) {
    return;
  }
  rangepicker._updating = true;
  var target = ev.target;
  if (target.datepicker === undefined) {
    return;
  }
  var datepickers = rangepicker.datepickers;
  var setDateOptions = {
    render: false
  };
  var changedSide = rangepicker.inputs.indexOf(target);
  var otherSide = changedSide === 0 ? 1 : 0;
  var changedDate = datepickers[changedSide].dates[0];
  var otherDate = datepickers[otherSide].dates[0];
  if (changedDate !== undefined && otherDate !== undefined) {
    if (changedSide === 0 && changedDate > otherDate) {
      datepickers[0].setDate(otherDate, setDateOptions);
      datepickers[1].setDate(changedDate, setDateOptions);
    } else if (changedSide === 1 && changedDate < otherDate) {
      datepickers[0].setDate(changedDate, setDateOptions);
      datepickers[1].setDate(otherDate, setDateOptions);
    }
  } else if (!rangepicker.allowOneSidedRange) {
    if (changedDate !== undefined || otherDate !== undefined) {
      setDateOptions.clear = true;
      datepickers[otherSide].setDate(datepickers[changedSide].dates, setDateOptions);
    }
  }
  datepickers[0].picker.update().render();
  datepickers[1].picker.update().render();
  delete rangepicker._updating;
}
var DateRangePicker = /* @__PURE__ */ function() {
  function DateRangePicker2(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, DateRangePicker2);
    var inputs = Array.isArray(options.inputs) ? options.inputs : Array.from(element.querySelectorAll("input"));
    if (inputs.length < 2) {
      return;
    }
    element.rangepicker = this;
    this.element = element;
    this.inputs = inputs.slice(0, 2);
    this.allowOneSidedRange = !!options.allowOneSidedRange;
    var changeDateListener = onChangeDate.bind(null, this);
    var cleanOptions = filterOptions(options);
    var datepickers = [];
    Object.defineProperty(this, "datepickers", {
      get: function get() {
        return datepickers;
      }
    });
    setupDatepicker(this, changeDateListener, this.inputs[0], cleanOptions);
    setupDatepicker(this, changeDateListener, this.inputs[1], cleanOptions);
    Object.freeze(datepickers);
    if (datepickers[0].dates.length > 0) {
      onChangeDate(this, {
        target: this.inputs[0]
      });
    } else if (datepickers[1].dates.length > 0) {
      onChangeDate(this, {
        target: this.inputs[1]
      });
    }
  }
  return _createClass(DateRangePicker2, [{
    key: "dates",
    get: function get() {
      return this.datepickers.length === 2 ? [this.datepickers[0].dates[0], this.datepickers[1].dates[0]] : undefined;
    }
  }, {
    key: "setOptions",
    value: function setOptions(options) {
      this.allowOneSidedRange = !!options.allowOneSidedRange;
      var cleanOptions = filterOptions(options);
      this.datepickers[0].setOptions(cleanOptions);
      this.datepickers[1].setOptions(cleanOptions);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.datepickers[0].destroy();
      this.datepickers[1].destroy();
      unregisterListeners(this);
      delete this.element.rangepicker;
    }
  }, {
    key: "getDates",
    value: function getDates() {
      var _this = this;
      var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
      var callback = format ? function(date) {
        return formatDate(date, format, _this.datepickers[0].config.locale);
      } : function(date) {
        return new Date(date);
      };
      return this.dates.map(function(date) {
        return date === undefined ? date : callback(date);
      });
    }
  }, {
    key: "setDates",
    value: function setDates(rangeStart, rangeEnd) {
      var _this$datepickers = _slicedToArray(this.datepickers, 2), datepicker0 = _this$datepickers[0], datepicker1 = _this$datepickers[1];
      var origDates = this.dates;
      this._updating = true;
      datepicker0.setDate(rangeStart);
      datepicker1.setDate(rangeEnd);
      delete this._updating;
      if (datepicker1.dates[0] !== origDates[1]) {
        onChangeDate(this, {
          target: this.inputs[1]
        });
      } else if (datepicker0.dates[0] !== origDates[0]) {
        onChangeDate(this, {
          target: this.inputs[0]
        });
      }
    }
  }]);
}();

// node_modules/flowbite/lib/esm/components/datepicker/index.js
var __assign14 = function() {
  __assign14 = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length;i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign14.apply(this, arguments);
};
var Default14 = {
  defaultDatepickerId: null,
  autohide: false,
  format: "mm/dd/yyyy",
  maxDate: null,
  minDate: null,
  orientation: "bottom",
  buttons: false,
  autoSelectToday: 0,
  title: null,
  language: "en",
  rangePicker: false,
  onShow: function() {},
  onHide: function() {}
};
var DefaultInstanceOptions14 = {
  id: null,
  override: true
};
var Datepicker2 = function() {
  function Datepicker3(datepickerEl, options, instanceOptions) {
    if (datepickerEl === undefined) {
      datepickerEl = null;
    }
    if (options === undefined) {
      options = Default14;
    }
    if (instanceOptions === undefined) {
      instanceOptions = DefaultInstanceOptions14;
    }
    this._instanceId = instanceOptions.id ? instanceOptions.id : datepickerEl.id;
    this._datepickerEl = datepickerEl;
    this._datepickerInstance = null;
    this._options = __assign14(__assign14({}, Default14), options);
    this._initialized = false;
    this.init();
    instances_default.addInstance("Datepicker", this, this._instanceId, instanceOptions.override);
  }
  Datepicker3.prototype.init = function() {
    if (this._datepickerEl && !this._initialized) {
      if (this._options.rangePicker) {
        this._datepickerInstance = new DateRangePicker(this._datepickerEl, this._getDatepickerOptions(this._options));
      } else {
        this._datepickerInstance = new Datepicker(this._datepickerEl, this._getDatepickerOptions(this._options));
      }
      this._initialized = true;
    }
  };
  Datepicker3.prototype.destroy = function() {
    if (this._initialized) {
      this._initialized = false;
      this._datepickerInstance.destroy();
    }
  };
  Datepicker3.prototype.removeInstance = function() {
    this.destroy();
    instances_default.removeInstance("Datepicker", this._instanceId);
  };
  Datepicker3.prototype.destroyAndRemoveInstance = function() {
    this.destroy();
    this.removeInstance();
  };
  Datepicker3.prototype.getDatepickerInstance = function() {
    return this._datepickerInstance;
  };
  Datepicker3.prototype.getDate = function() {
    if (this._options.rangePicker && this._datepickerInstance instanceof DateRangePicker) {
      return this._datepickerInstance.getDates();
    }
    if (!this._options.rangePicker && this._datepickerInstance instanceof Datepicker) {
      return this._datepickerInstance.getDate();
    }
  };
  Datepicker3.prototype.setDate = function(date) {
    if (this._options.rangePicker && this._datepickerInstance instanceof DateRangePicker) {
      return this._datepickerInstance.setDates(date);
    }
    if (!this._options.rangePicker && this._datepickerInstance instanceof Datepicker) {
      return this._datepickerInstance.setDate(date);
    }
  };
  Datepicker3.prototype.show = function() {
    this._datepickerInstance.show();
    this._options.onShow(this);
  };
  Datepicker3.prototype.hide = function() {
    this._datepickerInstance.hide();
    this._options.onHide(this);
  };
  Datepicker3.prototype._getDatepickerOptions = function(options) {
    var datepickerOptions = {};
    if (options.buttons) {
      datepickerOptions.todayBtn = true;
      datepickerOptions.clearBtn = true;
      if (options.autoSelectToday) {
        datepickerOptions.todayBtnMode = 1;
      }
    }
    if (options.autohide) {
      datepickerOptions.autohide = true;
    }
    if (options.format) {
      datepickerOptions.format = options.format;
    }
    if (options.maxDate) {
      datepickerOptions.maxDate = options.maxDate;
    }
    if (options.minDate) {
      datepickerOptions.minDate = options.minDate;
    }
    if (options.orientation) {
      datepickerOptions.orientation = options.orientation;
    }
    if (options.title) {
      datepickerOptions.title = options.title;
    }
    if (options.language) {
      datepickerOptions.language = options.language;
    }
    return datepickerOptions;
  };
  Datepicker3.prototype.updateOnShow = function(callback) {
    this._options.onShow = callback;
  };
  Datepicker3.prototype.updateOnHide = function(callback) {
    this._options.onHide = callback;
  };
  return Datepicker3;
}();
function initDatepickers() {
  document.querySelectorAll("[datepicker], [inline-datepicker], [date-rangepicker]").forEach(function($datepickerEl) {
    if ($datepickerEl) {
      var buttons = $datepickerEl.hasAttribute("datepicker-buttons");
      var autoselectToday = $datepickerEl.hasAttribute("datepicker-autoselect-today");
      var autohide = $datepickerEl.hasAttribute("datepicker-autohide");
      var format = $datepickerEl.getAttribute("datepicker-format");
      var maxDate = $datepickerEl.getAttribute("datepicker-max-date");
      var minDate = $datepickerEl.getAttribute("datepicker-min-date");
      var orientation_1 = $datepickerEl.getAttribute("datepicker-orientation");
      var title = $datepickerEl.getAttribute("datepicker-title");
      var language = $datepickerEl.getAttribute("datepicker-language");
      var rangePicker = $datepickerEl.hasAttribute("date-rangepicker");
      new Datepicker2($datepickerEl, {
        buttons: buttons ? buttons : Default14.buttons,
        autoSelectToday: autoselectToday ? autoselectToday : Default14.autoSelectToday,
        autohide: autohide ? autohide : Default14.autohide,
        format: format ? format : Default14.format,
        maxDate: maxDate ? maxDate : Default14.maxDate,
        minDate: minDate ? minDate : Default14.minDate,
        orientation: orientation_1 ? orientation_1 : Default14.orientation,
        title: title ? title : Default14.title,
        language: language ? language : Default14.language,
        rangePicker: rangePicker ? rangePicker : Default14.rangePicker
      });
    } else {
      console.error("The datepicker element does not exist. Please check the datepicker attribute.");
    }
  });
}
if (typeof window !== "undefined") {
  window.Datepicker = Datepicker2;
  window.initDatepickers = initDatepickers;
}

// node_modules/flowbite/lib/esm/components/index.js
function initFlowbite() {
  initAccordions();
  initCollapses();
  initCarousels();
  initDismisses();
  initDropdowns();
  initModals();
  initDrawers();
  initTabs();
  initTooltips();
  initPopovers();
  initDials();
  initInputCounters();
  initCopyClipboards();
  initDatepickers();
}
if (typeof window !== "undefined") {
  window.initFlowbite = initFlowbite;
}

// node_modules/flowbite/lib/esm/index.js
var events = new events_default("load", [
  initAccordions,
  initCollapses,
  initCarousels,
  initDismisses,
  initDropdowns,
  initModals,
  initDrawers,
  initTabs,
  initTooltips,
  initPopovers,
  initDials,
  initInputCounters,
  initCopyClipboards,
  initDatepickers
]);
events.init();

// node_modules/htmx.org/dist/htmx.esm.js
var htmx2 = function() {
  const htmx = {
    onLoad: null,
    process: null,
    on: null,
    off: null,
    trigger: null,
    ajax: null,
    find: null,
    findAll: null,
    closest: null,
    values: function(elt, type) {
      const inputValues = getInputValues(elt, type || "post");
      return inputValues.values;
    },
    remove: null,
    addClass: null,
    removeClass: null,
    toggleClass: null,
    takeClass: null,
    swap: null,
    defineExtension: null,
    removeExtension: null,
    logAll: null,
    logNone: null,
    logger: null,
    config: {
      historyEnabled: true,
      historyCacheSize: 10,
      refreshOnHistoryMiss: false,
      defaultSwapStyle: "innerHTML",
      defaultSwapDelay: 0,
      defaultSettleDelay: 20,
      includeIndicatorStyles: true,
      indicatorClass: "htmx-indicator",
      requestClass: "htmx-request",
      addedClass: "htmx-added",
      settlingClass: "htmx-settling",
      swappingClass: "htmx-swapping",
      allowEval: true,
      allowScriptTags: true,
      inlineScriptNonce: "",
      inlineStyleNonce: "",
      attributesToSettle: ["class", "style", "width", "height"],
      withCredentials: false,
      timeout: 0,
      wsReconnectDelay: "full-jitter",
      wsBinaryType: "blob",
      disableSelector: "[hx-disable], [data-hx-disable]",
      scrollBehavior: "instant",
      defaultFocusScroll: false,
      getCacheBusterParam: false,
      globalViewTransitions: false,
      methodsThatUseUrlParams: ["get", "delete"],
      selfRequestsOnly: true,
      ignoreTitle: false,
      scrollIntoViewOnBoost: true,
      triggerSpecsCache: null,
      disableInheritance: false,
      responseHandling: [
        { code: "204", swap: false },
        { code: "[23]..", swap: true },
        { code: "[45]..", swap: false, error: true }
      ],
      allowNestedOobSwaps: true,
      historyRestoreAsHxRequest: true,
      reportValidityOfForms: false
    },
    parseInterval: null,
    location,
    _: null,
    version: "2.0.10"
  };
  htmx.onLoad = onLoadHelper;
  htmx.process = processNode;
  htmx.on = addEventListenerImpl;
  htmx.off = removeEventListenerImpl;
  htmx.trigger = triggerEvent;
  htmx.ajax = ajaxHelper;
  htmx.find = find;
  htmx.findAll = findAll;
  htmx.closest = closest;
  htmx.remove = removeElement;
  htmx.addClass = addClassToElement;
  htmx.removeClass = removeClassFromElement;
  htmx.toggleClass = toggleClassOnElement;
  htmx.takeClass = takeClassForElement;
  htmx.swap = swap;
  htmx.defineExtension = defineExtension;
  htmx.removeExtension = removeExtension;
  htmx.logAll = logAll;
  htmx.logNone = logNone;
  htmx.parseInterval = parseInterval;
  htmx._ = internalEval;
  const internalAPI = {
    addTriggerHandler,
    bodyContains,
    canAccessLocalStorage,
    findThisElement,
    filterValues,
    swap,
    hasAttribute,
    getAttributeValue,
    getClosestAttributeValue,
    getClosestMatch,
    getExpressionVars,
    getHeaders,
    getInputValues,
    getInternalData,
    getSwapSpecification,
    getTriggerSpecs,
    getTarget,
    makeFragment,
    mergeObjects,
    makeSettleInfo,
    oobSwap,
    querySelectorExt,
    settleImmediately,
    shouldCancel,
    triggerEvent,
    triggerErrorEvent,
    withExtensions
  };
  const VERBS = ["get", "post", "put", "delete", "patch"];
  const VERB_SELECTOR = VERBS.map(function(verb) {
    return "[hx-" + verb + "], [data-hx-" + verb + "]";
  }).join(", ");
  function parseInterval(str2) {
    if (str2 == undefined) {
      return;
    }
    let interval = NaN;
    if (str2.slice(-2) == "ms") {
      interval = parseFloat(str2.slice(0, -2));
    } else if (str2.slice(-1) == "s") {
      interval = parseFloat(str2.slice(0, -1)) * 1000;
    } else if (str2.slice(-1) == "m") {
      interval = parseFloat(str2.slice(0, -1)) * 1000 * 60;
    } else {
      interval = parseFloat(str2);
    }
    return isNaN(interval) ? undefined : interval;
  }
  function getRawAttribute(elt, name) {
    return elt instanceof Element && elt.getAttribute(name);
  }
  function hasAttribute(elt, qualifiedName) {
    return !!elt.hasAttribute && (elt.hasAttribute(qualifiedName) || elt.hasAttribute("data-" + qualifiedName));
  }
  function getAttributeValue(elt, qualifiedName) {
    return getRawAttribute(elt, qualifiedName) || getRawAttribute(elt, "data-" + qualifiedName);
  }
  function parentElt(elt) {
    const parent = elt.parentElement;
    if (!parent && elt.parentNode instanceof ShadowRoot)
      return elt.parentNode;
    return parent;
  }
  function getDocument() {
    return document;
  }
  function getRootNode(elt, global) {
    return elt.getRootNode ? elt.getRootNode({ composed: global }) : getDocument();
  }
  function getClosestMatch(elt, condition) {
    while (elt && !condition(elt)) {
      elt = parentElt(elt);
    }
    return elt || null;
  }
  function getAttributeValueWithDisinheritance(initialElement, ancestor, attributeName) {
    const attributeValue = getAttributeValue(ancestor, attributeName);
    const disinherit = getAttributeValue(ancestor, "hx-disinherit");
    var inherit = getAttributeValue(ancestor, "hx-inherit");
    if (initialElement !== ancestor) {
      if (htmx.config.disableInheritance) {
        if (inherit && (inherit === "*" || inherit.split(" ").indexOf(attributeName) >= 0)) {
          return attributeValue;
        } else {
          return null;
        }
      }
      if (disinherit && (disinherit === "*" || disinherit.split(" ").indexOf(attributeName) >= 0)) {
        return "unset";
      }
    }
    return attributeValue;
  }
  function getClosestAttributeValue(elt, attributeName) {
    let closestAttr = null;
    getClosestMatch(elt, function(e) {
      return !!(closestAttr = getAttributeValueWithDisinheritance(elt, asElement(e), attributeName));
    });
    if (closestAttr !== "unset") {
      return closestAttr;
    }
  }
  function matches(elt, selector) {
    return elt instanceof Element && elt.matches(selector);
  }
  function getStartTag(str2) {
    const tagMatcher = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;
    const match = tagMatcher.exec(str2);
    if (match) {
      return match[1].toLowerCase();
    } else {
      return "";
    }
  }
  function parseHTML(resp) {
    if ("parseHTMLUnsafe" in Document) {
      return Document.parseHTMLUnsafe(resp);
    }
    const parser = new DOMParser;
    return parser.parseFromString(resp, "text/html");
  }
  function takeChildrenFor(fragment, elt) {
    while (elt.childNodes.length > 0) {
      fragment.append(elt.childNodes[0]);
    }
  }
  function duplicateScript(script) {
    const newScript = getDocument().createElement("script");
    forEach(script.attributes, function(attr) {
      newScript.setAttribute(attr.name, attr.value);
    });
    newScript.textContent = script.textContent;
    newScript.async = false;
    if (htmx.config.inlineScriptNonce) {
      newScript.nonce = htmx.config.inlineScriptNonce;
    }
    return newScript;
  }
  function isJavaScriptScriptNode(script) {
    return script.matches("script") && (script.type === "text/javascript" || script.type === "module" || script.type === "");
  }
  function normalizeScriptTags(fragment) {
    Array.from(fragment.querySelectorAll("script")).forEach((script) => {
      if (isJavaScriptScriptNode(script)) {
        const newScript = duplicateScript(script);
        const parent = script.parentNode;
        try {
          parent.insertBefore(newScript, script);
        } catch (e) {
          logError(e);
        } finally {
          script.remove();
        }
      }
    });
  }
  function makeFragment(response) {
    const responseWithNoHead = response.replace(/<head(\s[^>]*)?>[\s\S]*?<\/head>/i, "");
    const startTag = getStartTag(responseWithNoHead);
    let fragment;
    if (startTag === "html") {
      fragment = new DocumentFragment;
      const doc = parseHTML(response);
      takeChildrenFor(fragment, doc.body);
      fragment.title = doc.title;
    } else if (startTag === "body") {
      fragment = new DocumentFragment;
      const doc = parseHTML(responseWithNoHead);
      takeChildrenFor(fragment, doc.body);
      fragment.title = doc.title;
    } else {
      const doc = parseHTML('<body><template class="internal-htmx-wrapper">' + responseWithNoHead + "</template></body>");
      fragment = doc.querySelector("template").content;
      fragment.title = doc.title;
      var titleElement = fragment.querySelector("title");
      if (titleElement && titleElement.parentNode === fragment) {
        titleElement.remove();
        fragment.title = titleElement.innerText;
      }
    }
    if (fragment) {
      if (htmx.config.allowScriptTags) {
        normalizeScriptTags(fragment);
      } else {
        fragment.querySelectorAll("script").forEach((script) => script.remove());
      }
    }
    return fragment;
  }
  function maybeCall(func) {
    if (func) {
      func();
    }
  }
  function isType(o, type) {
    return Object.prototype.toString.call(o) === "[object " + type + "]";
  }
  function isFunction(o) {
    return typeof o === "function";
  }
  function isRawObject(o) {
    return isType(o, "Object");
  }
  function getInternalData(elt) {
    const dataProp = "htmx-internal-data";
    let data = elt[dataProp];
    if (!data) {
      data = elt[dataProp] = {};
    }
    return data;
  }
  function toArray(arr) {
    const returnArr = [];
    if (arr) {
      for (let i = 0;i < arr.length; i++) {
        returnArr.push(arr[i]);
      }
    }
    return returnArr;
  }
  function forEach(arr, func) {
    if (arr) {
      for (let i = 0;i < arr.length; i++) {
        func(arr[i]);
      }
    }
  }
  function isScrolledIntoView(el) {
    const rect = el.getBoundingClientRect();
    const elemTop = rect.top;
    const elemBottom = rect.bottom;
    return elemTop < window.innerHeight && elemBottom >= 0;
  }
  function bodyContains(elt) {
    return elt.getRootNode({ composed: true }) === document;
  }
  function splitOnWhitespace(trigger) {
    return trigger.trim().split(/\s+/);
  }
  function mergeObjects(obj1, obj2) {
    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        obj1[key] = obj2[key];
      }
    }
    return obj1;
  }
  function parseJSON(jString) {
    try {
      return JSON.parse(jString);
    } catch (error2) {
      logError(error2);
      return null;
    }
  }
  function canAccessLocalStorage() {
    const test = "htmx:sessionStorageTest";
    try {
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  function normalizePath(path) {
    try {
      const url = new URL(path, window.location.href);
      path = url.pathname + url.search;
    } catch (e) {}
    if (path != "/") {
      path = path.replace(/\/+$/, "");
    }
    return path;
  }
  function internalEval(str) {
    return maybeEval(getDocument().body, function() {
      return eval(str);
    });
  }
  function onLoadHelper(callback) {
    const value = htmx.on("htmx:load", function(evt) {
      callback(evt.detail.elt);
    });
    return value;
  }
  function logAll() {
    htmx.logger = function(elt, event, data) {
      if (console) {
        console.log(event, elt, data);
      }
    };
  }
  function logNone() {
    htmx.logger = null;
  }
  function find(eltOrSelector, selector) {
    if (typeof eltOrSelector !== "string") {
      return eltOrSelector.querySelector(selector);
    } else {
      return find(getDocument(), eltOrSelector);
    }
  }
  function findAll(eltOrSelector, selector) {
    if (typeof eltOrSelector !== "string") {
      return eltOrSelector.querySelectorAll(selector);
    } else {
      return findAll(getDocument(), eltOrSelector);
    }
  }
  function getWindow() {
    return window;
  }
  function removeElement(elt, delay) {
    elt = resolveTarget(elt);
    if (delay) {
      getWindow().setTimeout(function() {
        removeElement(elt);
        elt = null;
      }, delay);
    } else {
      parentElt(elt).removeChild(elt);
    }
  }
  function asElement(elt) {
    return elt instanceof Element ? elt : null;
  }
  function asHtmlElement(elt) {
    return elt instanceof HTMLElement ? elt : null;
  }
  function asString(value) {
    return typeof value === "string" ? value : null;
  }
  function asParentNode(elt) {
    return elt instanceof Element || elt instanceof Document || elt instanceof DocumentFragment ? elt : null;
  }
  function addClassToElement(elt, clazz, delay) {
    elt = asElement(resolveTarget(elt));
    if (!elt) {
      return;
    }
    if (delay) {
      getWindow().setTimeout(function() {
        addClassToElement(elt, clazz);
        elt = null;
      }, delay);
    } else {
      elt.classList && elt.classList.add(clazz);
    }
  }
  function removeClassFromElement(node, clazz, delay) {
    let elt = asElement(resolveTarget(node));
    if (!elt) {
      return;
    }
    if (delay) {
      getWindow().setTimeout(function() {
        removeClassFromElement(elt, clazz);
        elt = null;
      }, delay);
    } else {
      if (elt.classList) {
        elt.classList.remove(clazz);
        if (elt.classList.length === 0) {
          elt.removeAttribute("class");
        }
      }
    }
  }
  function toggleClassOnElement(elt, clazz) {
    elt = resolveTarget(elt);
    elt.classList.toggle(clazz);
  }
  function takeClassForElement(elt, clazz) {
    elt = resolveTarget(elt);
    forEach(elt.parentElement.children, function(child) {
      removeClassFromElement(child, clazz);
    });
    addClassToElement(asElement(elt), clazz);
  }
  function closest(elt, selector) {
    elt = asElement(resolveTarget(elt));
    if (elt) {
      return elt.closest(selector);
    }
    return null;
  }
  function startsWith(str2, prefix) {
    return str2.substring(0, prefix.length) === prefix;
  }
  function endsWith(str2, suffix) {
    return str2.substring(str2.length - suffix.length) === suffix;
  }
  function normalizeSelector(selector) {
    const trimmedSelector = selector.trim();
    if (startsWith(trimmedSelector, "<") && endsWith(trimmedSelector, "/>")) {
      return trimmedSelector.substring(1, trimmedSelector.length - 2);
    } else {
      return trimmedSelector;
    }
  }
  function querySelectorAllExt(elt, selector, global) {
    if (selector.indexOf("global ") === 0) {
      return querySelectorAllExt(elt, selector.slice(7), true);
    }
    elt = resolveTarget(elt);
    const parts = [];
    {
      let chevronsCount = 0;
      let offset2 = 0;
      for (let i = 0;i < selector.length; i++) {
        const char = selector[i];
        if (char === "," && chevronsCount === 0) {
          parts.push(selector.substring(offset2, i));
          offset2 = i + 1;
          continue;
        }
        if (char === "<") {
          chevronsCount++;
        } else if (char === "/" && i < selector.length - 1 && selector[i + 1] === ">") {
          chevronsCount--;
        }
      }
      if (offset2 < selector.length) {
        parts.push(selector.substring(offset2));
      }
    }
    const result = [];
    const unprocessedParts = [];
    while (parts.length > 0) {
      const selector2 = normalizeSelector(parts.shift());
      let item;
      if (selector2.indexOf("closest ") === 0) {
        item = closest(asElement(elt), normalizeSelector(selector2.slice(8)));
      } else if (selector2.indexOf("find ") === 0) {
        item = find(asParentNode(elt), normalizeSelector(selector2.slice(5)));
      } else if (selector2 === "next" || selector2 === "nextElementSibling") {
        item = asElement(elt).nextElementSibling;
      } else if (selector2.indexOf("next ") === 0) {
        item = scanForwardQuery(elt, normalizeSelector(selector2.slice(5)), !!global);
      } else if (selector2 === "previous" || selector2 === "previousElementSibling") {
        item = asElement(elt).previousElementSibling;
      } else if (selector2.indexOf("previous ") === 0) {
        item = scanBackwardsQuery(elt, normalizeSelector(selector2.slice(9)), !!global);
      } else if (selector2 === "document") {
        item = document;
      } else if (selector2 === "window") {
        item = window;
      } else if (selector2 === "body") {
        item = document.body;
      } else if (selector2 === "root") {
        item = getRootNode(elt, !!global);
      } else if (selector2 === "host") {
        item = elt.getRootNode().host;
      } else {
        unprocessedParts.push(selector2);
      }
      if (item) {
        result.push(item);
      }
    }
    if (unprocessedParts.length > 0) {
      const standardSelector = unprocessedParts.join(",");
      const rootNode = asParentNode(getRootNode(elt, !!global));
      result.push(...toArray(rootNode.querySelectorAll(standardSelector)));
    }
    return result;
  }
  var scanForwardQuery = function(start2, match, global) {
    const results = asParentNode(getRootNode(start2, global)).querySelectorAll(match);
    for (let i = 0;i < results.length; i++) {
      const elt = results[i];
      if (elt.compareDocumentPosition(start2) === Node.DOCUMENT_POSITION_PRECEDING) {
        return elt;
      }
    }
  };
  var scanBackwardsQuery = function(start2, match, global) {
    const results = asParentNode(getRootNode(start2, global)).querySelectorAll(match);
    for (let i = results.length - 1;i >= 0; i--) {
      const elt = results[i];
      if (elt.compareDocumentPosition(start2) === Node.DOCUMENT_POSITION_FOLLOWING) {
        return elt;
      }
    }
  };
  function querySelectorExt(eltOrSelector, selector) {
    if (typeof eltOrSelector !== "string") {
      return querySelectorAllExt(eltOrSelector, selector)[0];
    } else {
      return querySelectorAllExt(getDocument().body, eltOrSelector)[0];
    }
  }
  function resolveTarget(eltOrSelector, context) {
    if (typeof eltOrSelector === "string") {
      return find(asParentNode(context) || document, eltOrSelector);
    } else {
      return eltOrSelector;
    }
  }
  function processEventArgs(arg1, arg2, arg3, arg4) {
    if (isFunction(arg2)) {
      return {
        target: getDocument().body,
        event: asString(arg1),
        listener: arg2,
        options: arg3
      };
    } else {
      return {
        target: resolveTarget(arg1),
        event: asString(arg2),
        listener: arg3,
        options: arg4
      };
    }
  }
  function addEventListenerImpl(arg1, arg2, arg3, arg4) {
    ready(function() {
      const eventArgs = processEventArgs(arg1, arg2, arg3, arg4);
      eventArgs.target.addEventListener(eventArgs.event, eventArgs.listener, eventArgs.options);
    });
    const b = isFunction(arg2);
    return b ? arg2 : arg3;
  }
  function removeEventListenerImpl(arg1, arg2, arg3) {
    ready(function() {
      const eventArgs = processEventArgs(arg1, arg2, arg3);
      eventArgs.target.removeEventListener(eventArgs.event, eventArgs.listener);
    });
    return isFunction(arg2) ? arg2 : arg3;
  }
  const DUMMY_ELT = getDocument().createElement("output");
  function findAttributeTargets(elt, attrName) {
    const attrTarget = getClosestAttributeValue(elt, attrName);
    if (attrTarget) {
      if (attrTarget === "this") {
        return [findThisElement(elt, attrName)];
      } else {
        const result = querySelectorAllExt(elt, attrTarget);
        const shouldInherit = /(^|,)(\s*)inherit(\s*)($|,)/.test(attrTarget);
        if (shouldInherit) {
          const eltToInheritFrom = asElement(getClosestMatch(elt, function(parent) {
            return parent !== elt && hasAttribute(asElement(parent), attrName);
          }));
          if (eltToInheritFrom) {
            result.push(...findAttributeTargets(eltToInheritFrom, attrName));
          }
        }
        if (result.length === 0) {
          logError('The selector "' + attrTarget + '" on ' + attrName + " returned no matches!");
          return [DUMMY_ELT];
        } else {
          return result;
        }
      }
    }
  }
  function findThisElement(elt, attribute) {
    return asElement(getClosestMatch(elt, function(elt2) {
      return getAttributeValue(asElement(elt2), attribute) != null;
    }));
  }
  function getTarget(elt) {
    const targetStr = getClosestAttributeValue(elt, "hx-target");
    if (targetStr) {
      if (targetStr === "this") {
        return findThisElement(elt, "hx-target");
      } else {
        return querySelectorExt(elt, targetStr);
      }
    } else {
      const data = getInternalData(elt);
      if (data.boosted) {
        return getDocument().body;
      } else {
        return elt;
      }
    }
  }
  function shouldSettleAttribute(name) {
    return htmx.config.attributesToSettle.includes(name);
  }
  function cloneAttributes(mergeTo, mergeFrom) {
    forEach(Array.from(mergeTo.attributes), function(attr) {
      if (!mergeFrom.hasAttribute(attr.name) && shouldSettleAttribute(attr.name)) {
        mergeTo.removeAttribute(attr.name);
      }
    });
    forEach(mergeFrom.attributes, function(attr) {
      if (shouldSettleAttribute(attr.name)) {
        mergeTo.setAttribute(attr.name, attr.value);
      }
    });
  }
  function isInlineSwap(swapStyle, target) {
    const extensions2 = getExtensions(target);
    for (let i = 0;i < extensions2.length; i++) {
      const extension = extensions2[i];
      try {
        if (extension.isInlineSwap(swapStyle)) {
          return true;
        }
      } catch (e) {
        logError(e);
      }
    }
    return swapStyle === "outerHTML";
  }
  function oobSwap(oobValue, oobElement, settleInfo, rootNode) {
    rootNode = rootNode || getDocument();
    let selector = "#" + CSS.escape(getRawAttribute(oobElement, "id"));
    let swapStyle = "outerHTML";
    if (oobValue === "true") {} else if (oobValue.indexOf(":") > 0) {
      swapStyle = oobValue.substring(0, oobValue.indexOf(":"));
      selector = oobValue.substring(oobValue.indexOf(":") + 1);
    } else {
      swapStyle = oobValue;
    }
    oobElement.removeAttribute("hx-swap-oob");
    oobElement.removeAttribute("data-hx-swap-oob");
    const targets = querySelectorAllExt(rootNode, selector, false);
    if (targets.length) {
      forEach(targets, function(target) {
        let fragment;
        const oobElementClone = oobElement.cloneNode(true);
        fragment = getDocument().createDocumentFragment();
        fragment.appendChild(oobElementClone);
        if (!isInlineSwap(swapStyle, target)) {
          fragment = asParentNode(oobElementClone);
        }
        const beforeSwapDetails = { shouldSwap: true, target, fragment };
        if (!triggerEvent(target, "htmx:oobBeforeSwap", beforeSwapDetails))
          return;
        target = beforeSwapDetails.target;
        if (beforeSwapDetails.shouldSwap) {
          handlePreservedElements(fragment);
          swapWithStyle(swapStyle, target, target, fragment, settleInfo);
          restorePreservedElements();
        }
        forEach(settleInfo.elts, function(elt) {
          triggerEvent(elt, "htmx:oobAfterSwap", beforeSwapDetails);
        });
      });
      oobElement.parentNode.removeChild(oobElement);
    } else {
      oobElement.parentNode.removeChild(oobElement);
      triggerErrorEvent(getDocument().body, "htmx:oobErrorNoTarget", { content: oobElement, target: selector });
    }
    return oobValue;
  }
  function restorePreservedElements() {
    const pantry = find("#--htmx-preserve-pantry--");
    if (pantry) {
      for (const preservedElt of [...pantry.children]) {
        const existingElement = find("#" + preservedElt.id);
        existingElement.parentNode.moveBefore(preservedElt, existingElement);
        existingElement.remove();
      }
      pantry.remove();
    }
  }
  function handlePreservedElements(fragment) {
    forEach(findAll(fragment, "[hx-preserve], [data-hx-preserve]"), function(preservedElt) {
      const id = getAttributeValue(preservedElt, "id");
      const existingElement = getDocument().getElementById(id);
      if (existingElement != null) {
        if (preservedElt.moveBefore) {
          let pantry = find("#--htmx-preserve-pantry--");
          if (pantry == null) {
            getDocument().body.insertAdjacentHTML("afterend", "<div id='--htmx-preserve-pantry--'></div>");
            pantry = find("#--htmx-preserve-pantry--");
          }
          pantry.moveBefore(existingElement, null);
        } else {
          preservedElt.parentNode.replaceChild(existingElement, preservedElt);
        }
      }
    });
  }
  function handleAttributes(parentNode, fragment, settleInfo) {
    forEach(fragment.querySelectorAll("[id]"), function(newNode) {
      const id = getRawAttribute(newNode, "id");
      if (id && id.length > 0) {
        const parentElt2 = asParentNode(parentNode);
        const oldNode = parentElt2 && parentElt2.querySelector(CSS.escape(newNode.tagName) + "#" + CSS.escape(id));
        if (oldNode && oldNode !== parentElt2) {
          const newAttributes = newNode.cloneNode();
          cloneAttributes(newNode, oldNode);
          settleInfo.tasks.push(function() {
            cloneAttributes(newNode, newAttributes);
          });
        }
      }
    });
  }
  function makeAjaxLoadTask(child) {
    return function() {
      removeClassFromElement(child, htmx.config.addedClass);
      processNode(asElement(child));
      processFocus(asParentNode(child));
      triggerEvent(child, "htmx:load");
    };
  }
  function processFocus(child) {
    const autofocus = "[autofocus]";
    const autoFocusedElt = asHtmlElement(matches(child, autofocus) ? child : child.querySelector(autofocus));
    if (autoFocusedElt != null) {
      autoFocusedElt.focus();
    }
  }
  function insertNodesBefore(parentNode, insertBefore, fragment, settleInfo) {
    handleAttributes(parentNode, fragment, settleInfo);
    while (fragment.childNodes.length > 0) {
      const child = fragment.firstChild;
      addClassToElement(asElement(child), htmx.config.addedClass);
      parentNode.insertBefore(child, insertBefore);
      if (child.nodeType !== Node.TEXT_NODE && child.nodeType !== Node.COMMENT_NODE) {
        settleInfo.tasks.push(makeAjaxLoadTask(child));
      }
    }
  }
  function stringHash(string, hash3) {
    let char = 0;
    while (char < string.length) {
      hash3 = (hash3 << 5) - hash3 + string.charCodeAt(char++) | 0;
    }
    return hash3;
  }
  function attributeHash(elt) {
    let hash3 = 0;
    for (let i = 0;i < elt.attributes.length; i++) {
      const attribute = elt.attributes[i];
      if (attribute.value) {
        hash3 = stringHash(attribute.name, hash3);
        hash3 = stringHash(attribute.value, hash3);
      }
    }
    return hash3;
  }
  function deInitOnHandlers(elt) {
    const internalData = getInternalData(elt);
    if (internalData.onHandlers) {
      for (let i = 0;i < internalData.onHandlers.length; i++) {
        const handlerInfo = internalData.onHandlers[i];
        removeEventListenerImpl(elt, handlerInfo.event, handlerInfo.listener);
      }
      delete internalData.onHandlers;
    }
  }
  function deInitNode(element) {
    const internalData = getInternalData(element);
    if (internalData.timeout) {
      clearTimeout(internalData.timeout);
    }
    if (internalData.listenerInfos) {
      forEach(internalData.listenerInfos, function(info) {
        if (info.on) {
          removeEventListenerImpl(info.on, info.trigger, info.listener);
        }
      });
    }
    deInitOnHandlers(element);
    forEach(Object.keys(internalData), function(key) {
      if (key !== "firstInitCompleted")
        delete internalData[key];
    });
  }
  function cleanUpElement(element) {
    triggerEvent(element, "htmx:beforeCleanupElement");
    deInitNode(element);
    forEach(element.children, function(child) {
      cleanUpElement(child);
    });
  }
  function swapOuterHTML(target, fragment, settleInfo) {
    if (target.tagName === "BODY") {
      return swapInnerHTML(target, fragment, settleInfo);
    }
    let newElt;
    const eltBeforeNewContent = target.previousSibling;
    const parentNode = parentElt(target);
    if (!parentNode) {
      return;
    }
    insertNodesBefore(parentNode, target, fragment, settleInfo);
    if (eltBeforeNewContent == null) {
      newElt = parentNode.firstChild;
    } else {
      newElt = eltBeforeNewContent.nextSibling;
    }
    settleInfo.elts = settleInfo.elts.filter(function(e) {
      return e !== target;
    });
    while (newElt && newElt !== target) {
      if (newElt instanceof Element) {
        settleInfo.elts.push(newElt);
      }
      newElt = newElt.nextSibling;
    }
    cleanUpElement(target);
    target.remove();
  }
  function swapAfterBegin(target, fragment, settleInfo) {
    return insertNodesBefore(target, target.firstChild, fragment, settleInfo);
  }
  function swapBeforeBegin(target, fragment, settleInfo) {
    return insertNodesBefore(parentElt(target), target, fragment, settleInfo);
  }
  function swapBeforeEnd(target, fragment, settleInfo) {
    return insertNodesBefore(target, null, fragment, settleInfo);
  }
  function swapAfterEnd(target, fragment, settleInfo) {
    return insertNodesBefore(parentElt(target), target.nextSibling, fragment, settleInfo);
  }
  function swapDelete(target) {
    cleanUpElement(target);
    const parent = parentElt(target);
    if (parent) {
      return parent.removeChild(target);
    }
  }
  function swapInnerHTML(target, fragment, settleInfo) {
    const firstChild = target.firstChild;
    insertNodesBefore(target, firstChild, fragment, settleInfo);
    if (firstChild) {
      while (firstChild.nextSibling) {
        cleanUpElement(firstChild.nextSibling);
        target.removeChild(firstChild.nextSibling);
      }
      cleanUpElement(firstChild);
      target.removeChild(firstChild);
    }
  }
  function swapWithStyle(swapStyle, elt, target, fragment, settleInfo) {
    switch (swapStyle) {
      case "none":
        return;
      case "outerHTML":
        swapOuterHTML(target, fragment, settleInfo);
        return;
      case "afterbegin":
        swapAfterBegin(target, fragment, settleInfo);
        return;
      case "beforebegin":
        swapBeforeBegin(target, fragment, settleInfo);
        return;
      case "beforeend":
        swapBeforeEnd(target, fragment, settleInfo);
        return;
      case "afterend":
        swapAfterEnd(target, fragment, settleInfo);
        return;
      case "delete":
        swapDelete(target);
        return;
      default:
        var extensions2 = getExtensions(elt);
        for (let i = 0;i < extensions2.length; i++) {
          const ext = extensions2[i];
          try {
            const newElements = ext.handleSwap(swapStyle, target, fragment, settleInfo);
            if (newElements) {
              if (Array.isArray(newElements)) {
                for (let j = 0;j < newElements.length; j++) {
                  const child = newElements[j];
                  if (child.nodeType !== Node.TEXT_NODE && child.nodeType !== Node.COMMENT_NODE) {
                    settleInfo.tasks.push(makeAjaxLoadTask(child));
                  }
                }
              }
              return;
            }
          } catch (e) {
            logError(e);
          }
        }
        if (swapStyle === "innerHTML") {
          swapInnerHTML(target, fragment, settleInfo);
        } else {
          swapWithStyle(htmx.config.defaultSwapStyle, elt, target, fragment, settleInfo);
        }
    }
  }
  function findAndSwapOobElements(fragment, settleInfo, rootNode) {
    var oobElts = findAll(fragment, "[hx-swap-oob], [data-hx-swap-oob]");
    forEach(oobElts, function(oobElement) {
      if (htmx.config.allowNestedOobSwaps || oobElement.parentElement === null) {
        const oobValue = getAttributeValue(oobElement, "hx-swap-oob");
        if (oobValue != null) {
          oobSwap(oobValue, oobElement, settleInfo, rootNode);
        }
      } else {
        oobElement.removeAttribute("hx-swap-oob");
        oobElement.removeAttribute("data-hx-swap-oob");
      }
    });
    return oobElts.length > 0;
  }
  function swap(target, content, swapSpec, swapOptions) {
    if (!swapOptions) {
      swapOptions = {};
    }
    let settleResolve = null;
    let settleReject = null;
    let doSwap = function() {
      maybeCall(swapOptions.beforeSwapCallback);
      target = resolveTarget(target);
      const rootNode = swapOptions.contextElement ? getRootNode(swapOptions.contextElement, false) : getDocument();
      const activeElt = document.activeElement;
      let selectionInfo = {};
      selectionInfo = {
        elt: activeElt,
        start: activeElt ? activeElt.selectionStart : null,
        end: activeElt ? activeElt.selectionEnd : null
      };
      const settleInfo = makeSettleInfo(target);
      if (swapSpec.swapStyle === "textContent") {
        target.textContent = content;
      } else {
        let fragment = makeFragment(content);
        settleInfo.title = swapOptions.title || fragment.title;
        if (swapOptions.historyRequest) {
          fragment = fragment.querySelector("[hx-history-elt],[data-hx-history-elt]") || fragment;
        }
        if (swapOptions.selectOOB) {
          const oobSelectValues = swapOptions.selectOOB.split(",");
          for (let i = 0;i < oobSelectValues.length; i++) {
            const oobSelectValue = oobSelectValues[i].split(":", 2);
            let id = oobSelectValue[0].trim();
            if (id.indexOf("#") === 0) {
              id = id.substring(1);
            }
            const oobValue = oobSelectValue[1] || "true";
            const oobElement = fragment.querySelector("#" + id);
            if (oobElement) {
              oobSwap(oobValue, oobElement, settleInfo, rootNode);
            }
          }
        }
        findAndSwapOobElements(fragment, settleInfo, rootNode);
        forEach(findAll(fragment, "template"), function(template) {
          if (template.content && findAndSwapOobElements(template.content, settleInfo, rootNode)) {
            template.remove();
          }
        });
        if (swapOptions.select) {
          const newFragment = getDocument().createDocumentFragment();
          forEach(fragment.querySelectorAll(swapOptions.select), function(node) {
            newFragment.appendChild(node);
          });
          fragment = newFragment;
        }
        handlePreservedElements(fragment);
        swapWithStyle(swapSpec.swapStyle, swapOptions.contextElement, target, fragment, settleInfo);
        restorePreservedElements();
      }
      if (selectionInfo.elt && !bodyContains(selectionInfo.elt) && getRawAttribute(selectionInfo.elt, "id")) {
        const newActiveElt = document.getElementById(getRawAttribute(selectionInfo.elt, "id"));
        const focusOptions = { preventScroll: swapSpec.focusScroll !== undefined ? !swapSpec.focusScroll : !htmx.config.defaultFocusScroll };
        if (newActiveElt) {
          if (selectionInfo.start && newActiveElt.setSelectionRange) {
            try {
              newActiveElt.setSelectionRange(selectionInfo.start, selectionInfo.end);
            } catch (e) {}
          }
          newActiveElt.focus(focusOptions);
        }
      }
      removeClassFromElement(target, htmx.config.swappingClass);
      forEach(settleInfo.elts, function(elt2) {
        if (elt2.classList) {
          addClassToElement(elt2, htmx.config.settlingClass);
        }
        triggerEvent(elt2, "htmx:afterSwap", swapOptions.eventInfo);
      });
      maybeCall(swapOptions.afterSwapCallback);
      if (!swapSpec.ignoreTitle) {
        handleTitle(settleInfo.title);
      }
      const doSettle = function() {
        forEach(settleInfo.tasks, function(task) {
          task.call();
        });
        forEach(settleInfo.elts, function(elt2) {
          if (elt2.classList) {
            removeClassFromElement(elt2, htmx.config.settlingClass);
          }
          triggerEvent(elt2, "htmx:afterSettle", swapOptions.eventInfo);
        });
        if (swapOptions.anchor) {
          const anchorTarget = asElement(resolveTarget("#" + swapOptions.anchor));
          if (anchorTarget) {
            anchorTarget.scrollIntoView({ block: "start", behavior: "auto" });
          }
        }
        updateScrollState(settleInfo.elts, swapSpec);
        maybeCall(swapOptions.afterSettleCallback);
        maybeCall(settleResolve);
      };
      if (swapSpec.settleDelay > 0) {
        getWindow().setTimeout(doSettle, swapSpec.settleDelay);
      } else {
        doSettle();
      }
    };
    let shouldTransition = htmx.config.globalViewTransitions;
    if (swapSpec.hasOwnProperty("transition")) {
      shouldTransition = swapSpec.transition;
    }
    const elt = swapOptions.contextElement || getDocument();
    if (shouldTransition && triggerEvent(elt, "htmx:beforeTransition", swapOptions.eventInfo) && typeof Promise !== "undefined" && document.startViewTransition) {
      const settlePromise = new Promise(function(_resolve, _reject) {
        settleResolve = _resolve;
        settleReject = _reject;
      });
      const innerDoSwap = doSwap;
      doSwap = function() {
        document.startViewTransition(function() {
          innerDoSwap();
          return settlePromise;
        });
      };
    }
    try {
      if (swapSpec?.swapDelay && swapSpec.swapDelay > 0) {
        getWindow().setTimeout(doSwap, swapSpec.swapDelay);
      } else {
        doSwap();
      }
    } catch (e) {
      triggerErrorEvent(elt, "htmx:swapError", swapOptions.eventInfo);
      maybeCall(settleReject);
      throw e;
    }
  }
  function handleTriggerHeader(xhr, header, elt) {
    const triggerBody = xhr.getResponseHeader(header);
    if (triggerBody.indexOf("{") === 0) {
      const triggers = parseJSON(triggerBody);
      for (const eventName in triggers) {
        if (triggers.hasOwnProperty(eventName)) {
          let detail = triggers[eventName];
          if (isRawObject(detail)) {
            elt = detail.target !== undefined ? detail.target : elt;
          } else {
            detail = { value: detail };
          }
          triggerEvent(elt, eventName, detail);
        }
      }
    } else {
      const eventNames = triggerBody.split(",");
      for (let i = 0;i < eventNames.length; i++) {
        triggerEvent(elt, eventNames[i].trim(), []);
      }
    }
  }
  const WHITESPACE = /\s/;
  const WHITESPACE_OR_COMMA = /[\s,]/;
  const SYMBOL_START = /[_$a-zA-Z]/;
  const SYMBOL_CONT = /[_$a-zA-Z0-9]/;
  const STRINGISH_START = ['"', "'", "/"];
  const NOT_WHITESPACE = /[^\s]/;
  const COMBINED_SELECTOR_START = /[{(]/;
  const COMBINED_SELECTOR_END = /[})]/;
  function tokenizeString(str2) {
    const tokens = [];
    let position = 0;
    while (position < str2.length) {
      if (SYMBOL_START.exec(str2.charAt(position))) {
        var startPosition = position;
        while (SYMBOL_CONT.exec(str2.charAt(position + 1))) {
          position++;
        }
        tokens.push(str2.substring(startPosition, position + 1));
      } else if (STRINGISH_START.indexOf(str2.charAt(position)) !== -1) {
        const startChar = str2.charAt(position);
        var startPosition = position;
        position++;
        while (position < str2.length && str2.charAt(position) !== startChar) {
          if (str2.charAt(position) === "\\") {
            position++;
          }
          position++;
        }
        tokens.push(str2.substring(startPosition, position + 1));
      } else {
        const symbol = str2.charAt(position);
        tokens.push(symbol);
      }
      position++;
    }
    return tokens;
  }
  function isPossibleRelativeReference(token, last, paramName) {
    return SYMBOL_START.exec(token.charAt(0)) && token !== "true" && token !== "false" && token !== "this" && token !== paramName && last !== ".";
  }
  function maybeGenerateConditional(elt, tokens, paramName) {
    if (tokens[0] === "[") {
      tokens.shift();
      let bracketCount = 1;
      let conditionalSource = " return (function(" + paramName + "){ return (";
      let last = null;
      while (tokens.length > 0) {
        const token = tokens[0];
        if (token === "]") {
          bracketCount--;
          if (bracketCount === 0) {
            if (last === null) {
              conditionalSource = conditionalSource + "true";
            }
            tokens.shift();
            conditionalSource += ")})";
            try {
              const conditionFunction = maybeEval(elt, function() {
                return Function(conditionalSource)();
              }, function() {
                return true;
              });
              conditionFunction.source = conditionalSource;
              return conditionFunction;
            } catch (e) {
              triggerErrorEvent(getDocument().body, "htmx:syntax:error", { error: e, source: conditionalSource });
              return null;
            }
          }
        } else if (token === "[") {
          bracketCount++;
        }
        if (isPossibleRelativeReference(token, last, paramName)) {
          conditionalSource += "((" + paramName + "." + token + ") ? (" + paramName + "." + token + ") : (window." + token + "))";
        } else {
          conditionalSource = conditionalSource + token;
        }
        last = tokens.shift();
      }
    }
  }
  function consumeUntil(tokens, match) {
    let result = "";
    while (tokens.length > 0 && !match.test(tokens[0])) {
      result += tokens.shift();
    }
    return result;
  }
  function consumeCSSSelector(tokens) {
    let result;
    if (tokens.length > 0 && COMBINED_SELECTOR_START.test(tokens[0])) {
      tokens.shift();
      result = consumeUntil(tokens, COMBINED_SELECTOR_END).trim();
      tokens.shift();
    } else {
      result = consumeUntil(tokens, WHITESPACE_OR_COMMA);
    }
    return result;
  }
  const INPUT_SELECTOR = "input, textarea, select";
  function parseAndCacheTrigger(elt, explicitTrigger, cache) {
    const triggerSpecs = [];
    const tokens = tokenizeString(explicitTrigger);
    do {
      consumeUntil(tokens, NOT_WHITESPACE);
      const initialLength = tokens.length;
      const trigger = consumeUntil(tokens, /[,\[\s]/);
      if (trigger !== "") {
        if (trigger === "every") {
          const every = { trigger: "every" };
          consumeUntil(tokens, NOT_WHITESPACE);
          every.pollInterval = parseInterval(consumeUntil(tokens, /[,\[\s]/));
          consumeUntil(tokens, NOT_WHITESPACE);
          var eventFilter = maybeGenerateConditional(elt, tokens, "event");
          if (eventFilter) {
            every.eventFilter = eventFilter;
          }
          triggerSpecs.push(every);
        } else {
          const triggerSpec = { trigger };
          var eventFilter = maybeGenerateConditional(elt, tokens, "event");
          if (eventFilter) {
            triggerSpec.eventFilter = eventFilter;
          }
          consumeUntil(tokens, NOT_WHITESPACE);
          while (tokens.length > 0 && tokens[0] !== ",") {
            const token = tokens.shift();
            if (token === "changed") {
              triggerSpec.changed = true;
            } else if (token === "once") {
              triggerSpec.once = true;
            } else if (token === "consume") {
              triggerSpec.consume = true;
            } else if (token === "delay" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec.delay = parseInterval(consumeUntil(tokens, WHITESPACE_OR_COMMA));
            } else if (token === "from" && tokens[0] === ":") {
              tokens.shift();
              if (COMBINED_SELECTOR_START.test(tokens[0])) {
                var from_arg = consumeCSSSelector(tokens);
              } else {
                var from_arg = consumeUntil(tokens, WHITESPACE_OR_COMMA);
                if (from_arg === "closest" || from_arg === "find" || from_arg === "next" || from_arg === "previous") {
                  tokens.shift();
                  const selector = consumeCSSSelector(tokens);
                  if (selector.length > 0) {
                    from_arg += " " + selector;
                  }
                }
              }
              triggerSpec.from = from_arg;
            } else if (token === "target" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec.target = consumeCSSSelector(tokens);
            } else if (token === "throttle" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec.throttle = parseInterval(consumeUntil(tokens, WHITESPACE_OR_COMMA));
            } else if (token === "queue" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec.queue = consumeUntil(tokens, WHITESPACE_OR_COMMA);
            } else if (token === "root" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec[token] = consumeCSSSelector(tokens);
            } else if (token === "threshold" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec[token] = consumeUntil(tokens, WHITESPACE_OR_COMMA);
            } else {
              triggerErrorEvent(elt, "htmx:syntax:error", { token: tokens.shift() });
            }
            consumeUntil(tokens, NOT_WHITESPACE);
          }
          triggerSpecs.push(triggerSpec);
        }
      }
      if (tokens.length === initialLength) {
        triggerErrorEvent(elt, "htmx:syntax:error", { token: tokens.shift() });
      }
      consumeUntil(tokens, NOT_WHITESPACE);
    } while (tokens[0] === "," && tokens.shift());
    if (cache) {
      cache[explicitTrigger] = triggerSpecs;
    }
    return triggerSpecs;
  }
  function getTriggerSpecs(elt) {
    const explicitTrigger = getAttributeValue(elt, "hx-trigger");
    let triggerSpecs = [];
    if (explicitTrigger) {
      const cache = htmx.config.triggerSpecsCache;
      triggerSpecs = cache && cache[explicitTrigger] || parseAndCacheTrigger(elt, explicitTrigger, cache);
    }
    if (triggerSpecs.length > 0) {
      return triggerSpecs;
    } else if (matches(elt, "form")) {
      return [{ trigger: "submit" }];
    } else if (matches(elt, 'input[type="button"], input[type="submit"]')) {
      return [{ trigger: "click" }];
    } else if (matches(elt, INPUT_SELECTOR)) {
      return [{ trigger: "change" }];
    } else {
      return [{ trigger: "click" }];
    }
  }
  function cancelPolling(elt) {
    getInternalData(elt).cancelled = true;
  }
  function processPolling(elt, handler, spec) {
    const nodeData = getInternalData(elt);
    nodeData.timeout = getWindow().setTimeout(function() {
      if (bodyContains(elt) && nodeData.cancelled !== true) {
        if (!maybeFilterEvent(spec, elt, makeEvent("hx:poll:trigger", {
          triggerSpec: spec,
          target: elt
        }))) {
          handler(elt);
        }
        processPolling(elt, handler, spec);
      }
    }, spec.pollInterval);
  }
  function isLocalLink(elt) {
    return location.hostname === elt.hostname && getRawAttribute(elt, "href") && getRawAttribute(elt, "href").indexOf("#") !== 0;
  }
  function eltIsDisabled(elt) {
    return closest(elt, htmx.config.disableSelector);
  }
  function boostElement(elt, nodeData, triggerSpecs) {
    if (elt instanceof HTMLAnchorElement && isLocalLink(elt) && (elt.target === "" || elt.target === "_self") || elt.tagName === "FORM" && String(getRawAttribute(elt, "method")).toLowerCase() !== "dialog") {
      nodeData.boosted = true;
      let verb, path;
      if (elt.tagName === "A") {
        verb = "get";
        path = getRawAttribute(elt, "href");
      } else {
        const rawAttribute = getRawAttribute(elt, "method");
        verb = rawAttribute ? rawAttribute.toLowerCase() : "get";
        path = getRawAttribute(elt, "action");
        if (path == null || path === "") {
          path = location.href;
        }
        if (verb === "get" && path.includes("?")) {
          path = path.replace(/\?[^#]+/, "");
        }
      }
      triggerSpecs.forEach(function(triggerSpec) {
        addEventListener(elt, function(node, evt) {
          const elt2 = asElement(node);
          if (eltIsDisabled(elt2)) {
            cleanUpElement(elt2);
            return;
          }
          issueAjaxRequest(verb, path, elt2, evt);
        }, nodeData, triggerSpec, true);
      });
    }
  }
  function shouldCancel(evt, elt) {
    if (evt.type === "submit" && elt.tagName === "FORM") {
      return true;
    } else if (evt.type === "click") {
      const btn = elt.closest('input[type="submit"], button');
      if (btn && btn.form && btn.type === "submit") {
        return true;
      }
      const link = elt.closest("a");
      const samePageAnchor = /^#.+/;
      if (link && link.href && !samePageAnchor.test(link.getAttribute("href"))) {
        return true;
      }
    }
    return false;
  }
  function ignoreBoostedAnchorCtrlClick(elt, evt) {
    return getInternalData(elt).boosted && elt instanceof HTMLAnchorElement && evt.type === "click" && (evt.ctrlKey || evt.metaKey);
  }
  function maybeFilterEvent(triggerSpec, elt, evt) {
    const eventFilter = triggerSpec.eventFilter;
    if (eventFilter) {
      try {
        return eventFilter.call(elt, evt) !== true;
      } catch (e) {
        const source = eventFilter.source;
        triggerErrorEvent(getDocument().body, "htmx:eventFilter:error", { error: e, source });
        return true;
      }
    }
    return false;
  }
  function addEventListener(elt, handler, nodeData, triggerSpec, explicitCancel) {
    const elementData = getInternalData(elt);
    let eltsToListenOn;
    if (triggerSpec.from) {
      eltsToListenOn = querySelectorAllExt(elt, triggerSpec.from);
    } else {
      eltsToListenOn = [elt];
    }
    if (triggerSpec.changed) {
      if (!("lastValue" in elementData)) {
        elementData.lastValue = new WeakMap;
      }
      eltsToListenOn.forEach(function(eltToListenOn) {
        if (!elementData.lastValue.has(triggerSpec)) {
          elementData.lastValue.set(triggerSpec, new WeakMap);
        }
        elementData.lastValue.get(triggerSpec).set(eltToListenOn, eltToListenOn.value);
      });
    }
    forEach(eltsToListenOn, function(eltToListenOn) {
      const eventListener = function(evt) {
        if (!bodyContains(elt)) {
          eltToListenOn.removeEventListener(triggerSpec.trigger, eventListener);
          return;
        }
        if (ignoreBoostedAnchorCtrlClick(elt, evt)) {
          return;
        }
        if (explicitCancel || shouldCancel(evt, eltToListenOn)) {
          evt.preventDefault();
        }
        if (maybeFilterEvent(triggerSpec, elt, evt)) {
          return;
        }
        const eventData = getInternalData(evt);
        eventData.triggerSpec = triggerSpec;
        if (eventData.handledFor == null) {
          eventData.handledFor = [];
        }
        if (eventData.handledFor.indexOf(elt) < 0) {
          eventData.handledFor.push(elt);
          if (triggerSpec.consume) {
            evt.stopPropagation();
          }
          if (triggerSpec.target && evt.target) {
            if (!matches(asElement(evt.target), triggerSpec.target)) {
              return;
            }
          }
          if (triggerSpec.once) {
            if (elementData.triggeredOnce) {
              return;
            } else {
              elementData.triggeredOnce = true;
            }
          }
          if (triggerSpec.changed) {
            const node = evt.target;
            const value = node.value;
            const lastValue = elementData.lastValue.get(triggerSpec);
            if (lastValue.has(node) && lastValue.get(node) === value) {
              return;
            }
            lastValue.set(node, value);
          }
          if (elementData.delayed) {
            clearTimeout(elementData.delayed);
          }
          if (elementData.throttle) {
            return;
          }
          if (triggerSpec.throttle > 0) {
            if (!elementData.throttle) {
              triggerEvent(elt, "htmx:trigger");
              handler(elt, evt);
              elementData.throttle = getWindow().setTimeout(function() {
                elementData.throttle = null;
              }, triggerSpec.throttle);
            }
          } else if (triggerSpec.delay > 0) {
            elementData.delayed = getWindow().setTimeout(function() {
              triggerEvent(elt, "htmx:trigger");
              handler(elt, evt);
            }, triggerSpec.delay);
          } else {
            triggerEvent(elt, "htmx:trigger");
            handler(elt, evt);
          }
        }
      };
      if (nodeData.listenerInfos == null) {
        nodeData.listenerInfos = [];
      }
      nodeData.listenerInfos.push({
        trigger: triggerSpec.trigger,
        listener: eventListener,
        on: eltToListenOn
      });
      eltToListenOn.addEventListener(triggerSpec.trigger, eventListener);
    });
  }
  let windowIsScrolling = false;
  let scrollHandler = null;
  function initScrollHandler() {
    if (!scrollHandler) {
      scrollHandler = function() {
        windowIsScrolling = true;
      };
      window.addEventListener("scroll", scrollHandler);
      window.addEventListener("resize", scrollHandler);
      setInterval(function() {
        if (windowIsScrolling) {
          windowIsScrolling = false;
          forEach(getDocument().querySelectorAll("[hx-trigger*='revealed'],[data-hx-trigger*='revealed']"), function(elt) {
            maybeReveal(elt);
          });
        }
      }, 200);
    }
  }
  function maybeReveal(elt) {
    if (!hasAttribute(elt, "data-hx-revealed") && isScrolledIntoView(elt)) {
      elt.setAttribute("data-hx-revealed", "true");
      const nodeData = getInternalData(elt);
      if (nodeData.initHash) {
        triggerEvent(elt, "revealed");
      } else {
        elt.addEventListener("htmx:afterProcessNode", function() {
          triggerEvent(elt, "revealed");
        }, { once: true });
      }
    }
  }
  function loadImmediately(elt, handler, nodeData, delay) {
    const load = function() {
      if (!nodeData.loaded) {
        nodeData.loaded = true;
        triggerEvent(elt, "htmx:trigger");
        handler(elt);
      }
    };
    if (delay > 0) {
      getWindow().setTimeout(load, delay);
    } else {
      load();
    }
  }
  function processVerbs(elt, nodeData, triggerSpecs) {
    let explicitAction = false;
    forEach(VERBS, function(verb) {
      if (hasAttribute(elt, "hx-" + verb)) {
        const path = getAttributeValue(elt, "hx-" + verb);
        explicitAction = true;
        nodeData.path = path;
        nodeData.verb = verb;
        triggerSpecs.forEach(function(triggerSpec) {
          addTriggerHandler(elt, triggerSpec, nodeData, function(node, evt) {
            const elt2 = asElement(node);
            if (eltIsDisabled(elt2)) {
              cleanUpElement(elt2);
              return;
            }
            issueAjaxRequest(verb, path, elt2, evt);
          });
        });
      }
    });
    return explicitAction;
  }
  function addTriggerHandler(elt, triggerSpec, nodeData, handler) {
    if (triggerSpec.trigger === "revealed") {
      initScrollHandler();
      addEventListener(elt, handler, nodeData, triggerSpec);
      maybeReveal(asElement(elt));
    } else if (triggerSpec.trigger === "intersect") {
      const observerOptions = {};
      if (triggerSpec.root) {
        observerOptions.root = querySelectorExt(elt, triggerSpec.root);
      }
      if (triggerSpec.threshold) {
        observerOptions.threshold = parseFloat(triggerSpec.threshold);
      }
      const observer = new IntersectionObserver(function(entries) {
        for (let i = 0;i < entries.length; i++) {
          const entry = entries[i];
          if (entry.isIntersecting) {
            triggerEvent(elt, "intersect");
            break;
          }
        }
      }, observerOptions);
      observer.observe(asElement(elt));
      addEventListener(asElement(elt), handler, nodeData, triggerSpec);
    } else if (!nodeData.firstInitCompleted && triggerSpec.trigger === "load") {
      if (!maybeFilterEvent(triggerSpec, elt, makeEvent("load", { elt }))) {
        loadImmediately(asElement(elt), handler, nodeData, triggerSpec.delay);
      }
    } else if (triggerSpec.pollInterval > 0) {
      nodeData.polling = true;
      processPolling(asElement(elt), handler, triggerSpec);
    } else {
      addEventListener(elt, handler, nodeData, triggerSpec);
    }
  }
  function shouldProcessHxOn(node) {
    const elt = asElement(node);
    if (!elt) {
      return false;
    }
    const attributes = elt.attributes;
    for (let j = 0;j < attributes.length; j++) {
      const attrName = attributes[j].name;
      if (startsWith(attrName, "hx-on:") || startsWith(attrName, "data-hx-on:") || startsWith(attrName, "hx-on-") || startsWith(attrName, "data-hx-on-")) {
        return true;
      }
    }
    return false;
  }
  const HX_ON_QUERY = new XPathEvaluator().createExpression('.//*[@*[ starts-with(name(), "hx-on:") or starts-with(name(), "data-hx-on:") or' + ' starts-with(name(), "hx-on-") or starts-with(name(), "data-hx-on-") ]]');
  function processHXOnRoot(elt, elements) {
    if (shouldProcessHxOn(elt)) {
      elements.push(asElement(elt));
    }
    const iter = HX_ON_QUERY.evaluate(elt);
    let node = null;
    while (node = iter.iterateNext())
      elements.push(asElement(node));
  }
  function findHxOnWildcardElements(elt) {
    const elements = [];
    if (elt instanceof DocumentFragment) {
      for (const child of elt.childNodes) {
        processHXOnRoot(child, elements);
      }
    } else {
      processHXOnRoot(elt, elements);
    }
    return elements;
  }
  function findElementsToProcess(elt) {
    if (elt.querySelectorAll) {
      const boostedSelector = ", [hx-boost] a, [data-hx-boost] a, a[hx-boost], a[data-hx-boost]";
      const extensionSelectors = [];
      for (const e in extensions) {
        const extension = extensions[e];
        if (extension.getSelectors) {
          var selectors = extension.getSelectors();
          if (selectors) {
            extensionSelectors.push(selectors);
          }
        }
      }
      const results = elt.querySelectorAll(VERB_SELECTOR + boostedSelector + ", form, [type='submit']," + " [hx-ext], [data-hx-ext], [hx-trigger], [data-hx-trigger]" + extensionSelectors.flat().map((s) => ", " + s).join(""));
      return results;
    } else {
      return [];
    }
  }
  function maybeSetLastButtonClicked(evt) {
    const elt = getTargetButton(evt.target);
    const internalData = getRelatedFormData(evt);
    if (internalData) {
      internalData.lastButtonClicked = elt;
    }
  }
  function maybeUnsetLastButtonClicked(evt) {
    const internalData = getRelatedFormData(evt);
    if (internalData) {
      internalData.lastButtonClicked = null;
    }
  }
  function getTargetButton(target) {
    return closest(asElement(target), "button, input[type='submit']");
  }
  function getRelatedForm(elt) {
    return elt.form || closest(elt, "form");
  }
  function getRelatedFormData(evt) {
    const elt = getTargetButton(evt.target);
    if (!elt) {
      return;
    }
    const form = getRelatedForm(elt);
    if (!form) {
      return;
    }
    return getInternalData(form);
  }
  function initButtonTracking(elt) {
    elt.addEventListener("click", maybeSetLastButtonClicked);
    elt.addEventListener("focusin", maybeSetLastButtonClicked);
    elt.addEventListener("focusout", maybeUnsetLastButtonClicked);
  }
  function addHxOnEventHandler(elt, eventName, code) {
    const nodeData = getInternalData(elt);
    if (!Array.isArray(nodeData.onHandlers)) {
      nodeData.onHandlers = [];
    }
    let func;
    const listener = function(e) {
      maybeEval(elt, function() {
        if (eltIsDisabled(elt)) {
          return;
        }
        if (!func) {
          func = new Function("event", code);
        }
        func.call(elt, e);
      });
    };
    elt.addEventListener(eventName, listener);
    nodeData.onHandlers.push({ event: eventName, listener });
  }
  function processHxOnWildcard(elt) {
    deInitOnHandlers(elt);
    for (let i = 0;i < elt.attributes.length; i++) {
      const name = elt.attributes[i].name;
      const value = elt.attributes[i].value;
      if (startsWith(name, "hx-on") || startsWith(name, "data-hx-on")) {
        const afterOnPosition = name.indexOf("-on") + 3;
        const nextChar = name.slice(afterOnPosition, afterOnPosition + 1);
        if (nextChar === "-" || nextChar === ":") {
          let eventName = name.slice(afterOnPosition + 1);
          if (startsWith(eventName, ":")) {
            eventName = "htmx" + eventName;
          } else if (startsWith(eventName, "-")) {
            eventName = "htmx:" + eventName.slice(1);
          } else if (startsWith(eventName, "htmx-")) {
            eventName = "htmx:" + eventName.slice(5);
          }
          addHxOnEventHandler(elt, eventName, value);
        }
      }
    }
  }
  function initNode(elt) {
    triggerEvent(elt, "htmx:beforeProcessNode");
    const nodeData = getInternalData(elt);
    const triggerSpecs = getTriggerSpecs(elt);
    const hasExplicitHttpAction = processVerbs(elt, nodeData, triggerSpecs);
    if (!hasExplicitHttpAction) {
      if (getClosestAttributeValue(elt, "hx-boost") === "true") {
        boostElement(elt, nodeData, triggerSpecs);
      } else if (hasAttribute(elt, "hx-trigger")) {
        triggerSpecs.forEach(function(triggerSpec) {
          addTriggerHandler(elt, triggerSpec, nodeData, function() {});
        });
      }
    }
    if (elt.tagName === "FORM" || getRawAttribute(elt, "type") === "submit" && hasAttribute(elt, "form")) {
      initButtonTracking(elt);
    }
    nodeData.firstInitCompleted = true;
    triggerEvent(elt, "htmx:afterProcessNode");
  }
  function maybeDeInitAndHash(elt) {
    if (!(elt instanceof Element)) {
      return false;
    }
    const nodeData = getInternalData(elt);
    const hash3 = attributeHash(elt);
    if (nodeData.initHash !== hash3) {
      deInitNode(elt);
      nodeData.initHash = hash3;
      return true;
    }
    return false;
  }
  function processNode(elt) {
    elt = resolveTarget(elt);
    if (eltIsDisabled(elt)) {
      cleanUpElement(elt);
      return;
    }
    const elementsToInit = [];
    if (maybeDeInitAndHash(elt)) {
      elementsToInit.push(elt);
    }
    forEach(findElementsToProcess(elt), function(child) {
      if (eltIsDisabled(child)) {
        cleanUpElement(child);
        return;
      }
      if (maybeDeInitAndHash(child)) {
        elementsToInit.push(child);
      }
    });
    forEach(findHxOnWildcardElements(elt), processHxOnWildcard);
    forEach(elementsToInit, initNode);
  }
  function kebabEventName(str2) {
    return str2.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }
  function makeEvent(eventName, detail) {
    return new CustomEvent(eventName, { bubbles: true, cancelable: true, composed: true, detail });
  }
  function triggerErrorEvent(elt, eventName, detail) {
    triggerEvent(elt, eventName, mergeObjects({ error: eventName }, detail));
  }
  function ignoreEventForLogging(eventName) {
    return eventName === "htmx:afterProcessNode";
  }
  function withExtensions(elt, toDo, extensionsToIgnore) {
    forEach(getExtensions(elt, [], extensionsToIgnore), function(extension) {
      try {
        toDo(extension);
      } catch (e) {
        logError(e);
      }
    });
  }
  function logError(msg) {
    console.error(msg);
  }
  function triggerEvent(elt, eventName, detail) {
    elt = resolveTarget(elt);
    if (detail == null) {
      detail = {};
    }
    detail.elt = elt;
    const event = makeEvent(eventName, detail);
    if (htmx.logger && !ignoreEventForLogging(eventName)) {
      htmx.logger(elt, eventName, detail);
    }
    if (detail.error) {
      logError(detail.error + (detail.target ? ", " + detail.target : ""));
      triggerEvent(elt, "htmx:error", { errorInfo: detail });
    }
    let eventResult = elt.dispatchEvent(event);
    const kebabName = kebabEventName(eventName);
    if (eventResult && kebabName !== eventName) {
      const kebabedEvent = makeEvent(kebabName, event.detail);
      eventResult = eventResult && elt.dispatchEvent(kebabedEvent);
    }
    withExtensions(asElement(elt), function(extension) {
      eventResult = eventResult && (extension.onEvent(eventName, event) !== false && !event.defaultPrevented);
    });
    return eventResult;
  }
  let currentPathForHistory;
  function setCurrentPathForHistory(path) {
    currentPathForHistory = path;
    if (canAccessLocalStorage()) {
      sessionStorage.setItem("htmx-current-path-for-history", path);
    }
  }
  setCurrentPathForHistory(location.pathname + location.search);
  function getHistoryElement() {
    const historyElt = getDocument().querySelector("[hx-history-elt],[data-hx-history-elt]");
    return historyElt || getDocument().body;
  }
  function saveToHistoryCache(url, rootElt) {
    if (!canAccessLocalStorage()) {
      return;
    }
    const innerHTML = cleanInnerHtmlForHistory(rootElt);
    const title = getDocument().title;
    const scroll = window.scrollY;
    if (htmx.config.historyCacheSize <= 0) {
      sessionStorage.removeItem("htmx-history-cache");
      return;
    }
    url = normalizePath(url);
    const historyCache = parseJSON(sessionStorage.getItem("htmx-history-cache")) || [];
    for (let i = 0;i < historyCache.length; i++) {
      if (historyCache[i].url === url) {
        historyCache.splice(i, 1);
        break;
      }
    }
    const newHistoryItem = { url, content: innerHTML, title, scroll };
    triggerEvent(getDocument().body, "htmx:historyItemCreated", { item: newHistoryItem, cache: historyCache });
    historyCache.push(newHistoryItem);
    while (historyCache.length > htmx.config.historyCacheSize) {
      historyCache.shift();
    }
    while (historyCache.length > 0) {
      try {
        sessionStorage.setItem("htmx-history-cache", JSON.stringify(historyCache));
        break;
      } catch (e) {
        triggerErrorEvent(getDocument().body, "htmx:historyCacheError", { cause: e, cache: historyCache });
        historyCache.shift();
      }
    }
  }
  function getCachedHistory(url) {
    if (!canAccessLocalStorage()) {
      return null;
    }
    url = normalizePath(url);
    const historyCache = parseJSON(sessionStorage.getItem("htmx-history-cache")) || [];
    for (let i = 0;i < historyCache.length; i++) {
      if (historyCache[i].url === url) {
        return historyCache[i];
      }
    }
    return null;
  }
  function cleanInnerHtmlForHistory(elt) {
    const className = htmx.config.requestClass;
    const clone = elt.cloneNode(true);
    forEach(findAll(clone, "." + className), function(child) {
      removeClassFromElement(child, className);
    });
    forEach(findAll(clone, "[data-disabled-by-htmx]"), function(child) {
      child.removeAttribute("disabled");
    });
    return clone.innerHTML;
  }
  function saveCurrentPageToHistory() {
    const elt = getHistoryElement();
    let path = currentPathForHistory;
    if (canAccessLocalStorage()) {
      path = sessionStorage.getItem("htmx-current-path-for-history");
    }
    path = path || location.pathname + location.search;
    const disableHistoryCache = getDocument().querySelector('[hx-history="false" i],[data-hx-history="false" i]');
    if (!disableHistoryCache) {
      triggerEvent(getDocument().body, "htmx:beforeHistorySave", { path, historyElt: elt });
      saveToHistoryCache(path, elt);
    }
    if (htmx.config.historyEnabled)
      history.replaceState({ htmx: true }, getDocument().title, location.href);
  }
  function pushUrlIntoHistory(path) {
    if (htmx.config.getCacheBusterParam) {
      path = path.replace(/org\.htmx\.cache-buster=[^&]*&?/, "");
      if (endsWith(path, "&") || endsWith(path, "?")) {
        path = path.slice(0, -1);
      }
    }
    if (htmx.config.historyEnabled) {
      history.pushState({ htmx: true }, "", path);
    }
    setCurrentPathForHistory(path);
  }
  function replaceUrlInHistory(path) {
    if (htmx.config.historyEnabled)
      history.replaceState({ htmx: true }, "", path);
    setCurrentPathForHistory(path);
  }
  function settleImmediately(tasks) {
    forEach(tasks, function(task) {
      task.call(undefined);
    });
  }
  function loadHistoryFromServer(path) {
    const request = new XMLHttpRequest;
    const swapSpec = { swapStyle: "innerHTML", swapDelay: 0, settleDelay: 0 };
    const details = { path, xhr: request, historyElt: getHistoryElement(), swapSpec };
    request.open("GET", path, true);
    if (htmx.config.historyRestoreAsHxRequest) {
      request.setRequestHeader("HX-Request", "true");
    }
    request.setRequestHeader("HX-History-Restore-Request", "true");
    request.setRequestHeader("HX-Current-URL", location.href);
    request.onload = function() {
      if (this.status >= 200 && this.status < 400) {
        details.response = this.response;
        triggerEvent(getDocument().body, "htmx:historyCacheMissLoad", details);
        swap(details.historyElt, details.response, swapSpec, {
          contextElement: details.historyElt,
          historyRequest: true
        });
        setCurrentPathForHistory(details.path);
        triggerEvent(getDocument().body, "htmx:historyRestore", { path, cacheMiss: true, serverResponse: details.response });
      } else {
        triggerErrorEvent(getDocument().body, "htmx:historyCacheMissLoadError", details);
      }
    };
    if (triggerEvent(getDocument().body, "htmx:historyCacheMiss", details)) {
      request.send();
    }
  }
  function restoreHistory(path) {
    saveCurrentPageToHistory();
    path = path || location.pathname + location.search;
    const cached = getCachedHistory(path);
    if (cached) {
      const swapSpec = { swapStyle: "innerHTML", swapDelay: 0, settleDelay: 0, scroll: cached.scroll };
      const details = { path, item: cached, historyElt: getHistoryElement(), swapSpec };
      if (triggerEvent(getDocument().body, "htmx:historyCacheHit", details)) {
        swap(details.historyElt, cached.content, swapSpec, {
          contextElement: details.historyElt,
          title: cached.title
        });
        setCurrentPathForHistory(details.path);
        triggerEvent(getDocument().body, "htmx:historyRestore", details);
      }
    } else {
      if (htmx.config.refreshOnHistoryMiss) {
        htmx.location.reload(true);
      } else {
        loadHistoryFromServer(path);
      }
    }
  }
  function addRequestIndicatorClasses(elt) {
    let indicators = findAttributeTargets(elt, "hx-indicator");
    if (indicators == null) {
      indicators = [elt];
    }
    forEach(indicators, function(ic) {
      const internalData = getInternalData(ic);
      internalData.requestCount = (internalData.requestCount || 0) + 1;
      addClassToElement(ic, htmx.config.requestClass);
    });
    return indicators;
  }
  function disableElements(elt) {
    let disabledElts = findAttributeTargets(elt, "hx-disabled-elt");
    if (disabledElts == null) {
      disabledElts = [];
    }
    forEach(disabledElts, function(disabledElement) {
      const internalData = getInternalData(disabledElement);
      internalData.requestCount = (internalData.requestCount || 0) + 1;
      if (!disabledElement.hasAttribute("disabled")) {
        disabledElement.setAttribute("disabled", "");
        disabledElement.setAttribute("data-disabled-by-htmx", "");
      }
    });
    return disabledElts;
  }
  function removeRequestIndicators(indicators, disabled) {
    forEach(indicators.concat(disabled), function(ele) {
      const internalData = getInternalData(ele);
      internalData.requestCount = (internalData.requestCount || 1) - 1;
    });
    forEach(indicators, function(ic) {
      const internalData = getInternalData(ic);
      if (internalData.requestCount === 0) {
        removeClassFromElement(ic, htmx.config.requestClass);
      }
    });
    forEach(disabled, function(disabledElement) {
      const internalData = getInternalData(disabledElement);
      if (internalData.requestCount === 0 && disabledElement.hasAttribute("data-disabled-by-htmx")) {
        disabledElement.removeAttribute("disabled");
        disabledElement.removeAttribute("data-disabled-by-htmx");
      }
    });
  }
  function haveSeenNode(processed, elt) {
    for (let i = 0;i < processed.length; i++) {
      const node = processed[i];
      if (node.isSameNode(elt)) {
        return true;
      }
    }
    return false;
  }
  function shouldInclude(element) {
    const elt = element;
    if (elt.name === "" || elt.name == null || elt.disabled || closest(elt, "fieldset[disabled]")) {
      return false;
    }
    if (elt.type === "button" || elt.type === "submit" || elt.tagName === "image" || elt.tagName === "reset" || elt.tagName === "file") {
      return false;
    }
    if (elt.type === "checkbox" || elt.type === "radio") {
      return elt.checked;
    }
    return true;
  }
  function addValueToFormData(name, value, formData) {
    if (name != null && value != null) {
      if (Array.isArray(value)) {
        value.forEach(function(v) {
          formData.append(name, v);
        });
      } else {
        formData.append(name, value);
      }
    }
  }
  function removeValueFromFormData(name, value, formData) {
    if (name != null && value != null) {
      let values = formData.getAll(name);
      if (Array.isArray(value)) {
        values = values.filter((v) => value.indexOf(v) < 0);
      } else {
        values = values.filter((v) => v !== value);
      }
      formData.delete(name);
      forEach(values, (v) => formData.append(name, v));
    }
  }
  function getValueFromInput(elt) {
    if (elt instanceof HTMLSelectElement && elt.multiple) {
      return toArray(elt.querySelectorAll("option:checked")).map(function(e) {
        return e.value;
      });
    }
    if (elt instanceof HTMLInputElement && elt.files) {
      return toArray(elt.files);
    }
    return elt.value;
  }
  function processInputValue(processed, formData, errors, elt, validate) {
    if (elt == null || haveSeenNode(processed, elt)) {
      return;
    } else {
      processed.push(elt);
    }
    if (shouldInclude(elt)) {
      const name = getRawAttribute(elt, "name");
      addValueToFormData(name, getValueFromInput(elt), formData);
      if (validate) {
        validateElement(elt, errors);
      }
    }
    if (elt instanceof HTMLFormElement) {
      forEach(elt.elements, function(input) {
        if (processed.indexOf(input) >= 0) {
          removeValueFromFormData(input.name, getValueFromInput(input), formData);
        } else {
          processed.push(input);
        }
        if (validate) {
          validateElement(input, errors);
        }
      });
      new FormData(elt).forEach(function(value, name) {
        if (value instanceof File && value.name === "") {
          return;
        }
        addValueToFormData(name, value, formData);
      });
    }
  }
  function validateElement(elt, errors) {
    const element = elt;
    if (element.willValidate) {
      triggerEvent(element, "htmx:validation:validate");
      if (!element.checkValidity()) {
        if (triggerEvent(element, "htmx:validation:failed", {
          message: element.validationMessage,
          validity: element.validity
        }) && !errors.length && htmx.config.reportValidityOfForms) {
          element.reportValidity();
        }
        errors.push({ elt: element, message: element.validationMessage, validity: element.validity });
      }
    }
  }
  function overrideFormData(receiver, donor) {
    for (const key of donor.keys()) {
      receiver.delete(key);
    }
    donor.forEach(function(value, key) {
      receiver.append(key, value);
    });
    return receiver;
  }
  function getInputValues(elt, verb) {
    const processed = [];
    const formData = new FormData;
    const priorityFormData = new FormData;
    const errors = [];
    const internalData = getInternalData(elt);
    if (internalData.lastButtonClicked && !bodyContains(internalData.lastButtonClicked)) {
      internalData.lastButtonClicked = null;
    }
    let validate = elt instanceof HTMLFormElement && elt.noValidate !== true || getAttributeValue(elt, "hx-validate") === "true";
    if (internalData.lastButtonClicked) {
      validate = validate && internalData.lastButtonClicked.formNoValidate !== true;
    }
    if (verb !== "get") {
      processInputValue(processed, priorityFormData, errors, getRelatedForm(elt), validate);
    }
    processInputValue(processed, formData, errors, elt, validate);
    if (internalData.lastButtonClicked || elt.tagName === "BUTTON" || elt.tagName === "INPUT" && getRawAttribute(elt, "type") === "submit") {
      const button = internalData.lastButtonClicked || elt;
      const name = getRawAttribute(button, "name");
      addValueToFormData(name, button.value, priorityFormData);
    }
    const includes = findAttributeTargets(elt, "hx-include");
    forEach(includes, function(node) {
      processInputValue(processed, formData, errors, asElement(node), validate);
      if (!matches(node, "form")) {
        forEach(asParentNode(node).querySelectorAll(INPUT_SELECTOR), function(descendant) {
          processInputValue(processed, formData, errors, descendant, validate);
        });
      }
    });
    overrideFormData(formData, priorityFormData);
    return { errors, formData, values: formDataProxy(formData) };
  }
  function appendParam(returnStr, name, realValue) {
    if (returnStr !== "") {
      returnStr += "&";
    }
    if (String(realValue) === "[object Object]") {
      realValue = JSON.stringify(realValue);
    }
    const s = encodeURIComponent(realValue);
    returnStr += encodeURIComponent(name) + "=" + s;
    return returnStr;
  }
  function urlEncode(values) {
    values = formDataFromObject(values);
    let returnStr = "";
    values.forEach(function(value, key) {
      returnStr = appendParam(returnStr, key, value);
    });
    return returnStr;
  }
  function getHeaders(elt, target, prompt2) {
    const headers = {
      "HX-Request": "true",
      "HX-Trigger": getRawAttribute(elt, "id"),
      "HX-Trigger-Name": getRawAttribute(elt, "name"),
      "HX-Target": getAttributeValue(target, "id"),
      "HX-Current-URL": location.href
    };
    getValuesForElement(elt, "hx-headers", false, headers);
    if (prompt2 !== undefined) {
      headers["HX-Prompt"] = prompt2;
    }
    if (getInternalData(elt).boosted) {
      headers["HX-Boosted"] = "true";
    }
    return headers;
  }
  function filterValues(inputValues, elt) {
    const paramsValue = getClosestAttributeValue(elt, "hx-params");
    if (paramsValue) {
      if (paramsValue === "none") {
        return new FormData;
      } else if (paramsValue === "*") {
        return inputValues;
      } else if (paramsValue.indexOf("not ") === 0) {
        forEach(paramsValue.slice(4).split(","), function(name) {
          name = name.trim();
          inputValues.delete(name);
        });
        return inputValues;
      } else {
        const newValues = new FormData;
        forEach(paramsValue.split(","), function(name) {
          name = name.trim();
          if (inputValues.has(name)) {
            inputValues.getAll(name).forEach(function(value) {
              newValues.append(name, value);
            });
          }
        });
        return newValues;
      }
    } else {
      return inputValues;
    }
  }
  function isAnchorLink(elt) {
    return !!getRawAttribute(elt, "href") && getRawAttribute(elt, "href").indexOf("#") >= 0;
  }
  function getSwapSpecification(elt, swapInfoOverride) {
    const swapInfo = swapInfoOverride || getClosestAttributeValue(elt, "hx-swap");
    const swapSpec = {
      swapStyle: getInternalData(elt).boosted ? "innerHTML" : htmx.config.defaultSwapStyle,
      swapDelay: htmx.config.defaultSwapDelay,
      settleDelay: htmx.config.defaultSettleDelay
    };
    if (htmx.config.scrollIntoViewOnBoost && getInternalData(elt).boosted && !isAnchorLink(elt)) {
      swapSpec.show = "top";
    }
    if (swapInfo) {
      const split = splitOnWhitespace(swapInfo);
      if (split.length > 0) {
        for (let i = 0;i < split.length; i++) {
          const value = split[i];
          if (value.indexOf("swap:") === 0) {
            swapSpec.swapDelay = parseInterval(value.slice(5));
          } else if (value.indexOf("settle:") === 0) {
            swapSpec.settleDelay = parseInterval(value.slice(7));
          } else if (value.indexOf("transition:") === 0) {
            swapSpec.transition = value.slice(11) === "true";
          } else if (value.indexOf("ignoreTitle:") === 0) {
            swapSpec.ignoreTitle = value.slice(12) === "true";
          } else if (value.indexOf("scroll:") === 0) {
            const scrollSpec = value.slice(7);
            var splitSpec = scrollSpec.split(":");
            const scrollVal = splitSpec.pop();
            var selectorVal = splitSpec.length > 0 ? splitSpec.join(":") : null;
            swapSpec.scroll = scrollVal;
            swapSpec.scrollTarget = selectorVal;
          } else if (value.indexOf("show:") === 0) {
            const showSpec = value.slice(5);
            var splitSpec = showSpec.split(":");
            const showVal = splitSpec.pop();
            var selectorVal = splitSpec.length > 0 ? splitSpec.join(":") : null;
            swapSpec.show = showVal;
            swapSpec.showTarget = selectorVal;
          } else if (value.indexOf("focus-scroll:") === 0) {
            const focusScrollVal = value.slice("focus-scroll:".length);
            swapSpec.focusScroll = focusScrollVal == "true";
          } else if (i == 0) {
            swapSpec.swapStyle = value;
          } else {
            logError("Unknown modifier in hx-swap: " + value);
          }
        }
      }
    }
    return swapSpec;
  }
  function usesFormData(elt) {
    return getClosestAttributeValue(elt, "hx-encoding") === "multipart/form-data" || matches(elt, "form") && getRawAttribute(elt, "enctype") === "multipart/form-data";
  }
  function encodeParamsForBody(xhr, elt, filteredParameters) {
    let encodedParameters = null;
    withExtensions(elt, function(extension) {
      if (encodedParameters == null) {
        encodedParameters = extension.encodeParameters(xhr, filteredParameters, elt);
      }
    });
    if (encodedParameters != null) {
      return encodedParameters;
    } else {
      if (usesFormData(elt)) {
        return overrideFormData(new FormData, formDataFromObject(filteredParameters));
      } else {
        return urlEncode(filteredParameters);
      }
    }
  }
  function makeSettleInfo(target) {
    return { tasks: [], elts: [target] };
  }
  function updateScrollState(content, swapSpec) {
    const first = content[0];
    const last = content[content.length - 1];
    if (swapSpec.scroll) {
      var target = null;
      if (swapSpec.scrollTarget) {
        target = asElement(querySelectorExt(first, swapSpec.scrollTarget));
      }
      if (swapSpec.scroll === "top" && (first || target)) {
        target = target || first;
        target.scrollTop = 0;
      }
      if (swapSpec.scroll === "bottom" && (last || target)) {
        target = target || last;
        target.scrollTop = target.scrollHeight;
      }
      if (typeof swapSpec.scroll === "number") {
        getWindow().setTimeout(function() {
          window.scrollTo(0, swapSpec.scroll);
        }, 0);
      }
    }
    if (swapSpec.show) {
      var target = null;
      if (swapSpec.showTarget) {
        let targetStr = swapSpec.showTarget;
        if (swapSpec.showTarget === "window") {
          targetStr = "body";
        }
        target = asElement(querySelectorExt(first, targetStr));
      }
      if (swapSpec.show === "top" && (first || target)) {
        target = target || first;
        target.scrollIntoView({ block: "start", behavior: htmx.config.scrollBehavior });
      }
      if (swapSpec.show === "bottom" && (last || target)) {
        target = target || last;
        target.scrollIntoView({ block: "end", behavior: htmx.config.scrollBehavior });
      }
    }
  }
  function getValuesForElement(elt, attr, evalAsDefault, values, event) {
    if (values == null) {
      values = {};
    }
    if (elt == null) {
      return values;
    }
    const attributeValue = getAttributeValue(elt, attr);
    if (attributeValue) {
      let str2 = attributeValue.trim();
      let evaluateValue = evalAsDefault;
      if (str2 === "unset") {
        return null;
      }
      if (str2.indexOf("javascript:") === 0) {
        str2 = str2.slice(11);
        evaluateValue = true;
      } else if (str2.indexOf("js:") === 0) {
        str2 = str2.slice(3);
        evaluateValue = true;
      }
      if (str2.indexOf("{") !== 0) {
        str2 = "{" + str2 + "}";
      }
      let varsValues;
      if (evaluateValue) {
        varsValues = maybeEval(elt, function() {
          if (event) {
            return Function("event", "return (" + str2 + ")").call(elt, event);
          } else {
            return Function("return (" + str2 + ")").call(elt);
          }
        }, {});
      } else {
        varsValues = parseJSON(str2);
      }
      for (const key in varsValues) {
        if (varsValues.hasOwnProperty(key)) {
          if (values[key] == null) {
            values[key] = varsValues[key];
          }
        }
      }
    }
    return getValuesForElement(asElement(parentElt(elt)), attr, evalAsDefault, values, event);
  }
  function maybeEval(elt, toEval, defaultVal) {
    if (htmx.config.allowEval) {
      return toEval();
    } else {
      triggerErrorEvent(elt, "htmx:evalDisallowedError");
      return defaultVal;
    }
  }
  function getHXVarsForElement(elt, event, expressionVars) {
    return getValuesForElement(elt, "hx-vars", true, expressionVars, event);
  }
  function getHXValsForElement(elt, event, expressionVars) {
    return getValuesForElement(elt, "hx-vals", false, expressionVars, event);
  }
  function getExpressionVars(elt, event) {
    return mergeObjects(getHXVarsForElement(elt, event), getHXValsForElement(elt, event));
  }
  function safelySetHeaderValue(xhr, header, headerValue) {
    if (headerValue !== null) {
      try {
        xhr.setRequestHeader(header, headerValue);
      } catch (e) {
        xhr.setRequestHeader(header, encodeURIComponent(headerValue));
        xhr.setRequestHeader(header + "-URI-AutoEncoded", "true");
      }
    }
  }
  function getPathFromResponse(xhr) {
    if (xhr.responseURL) {
      try {
        const url = new URL(xhr.responseURL);
        return url.pathname + url.search;
      } catch (e) {
        triggerErrorEvent(getDocument().body, "htmx:badResponseUrl", { url: xhr.responseURL });
      }
    }
  }
  function hasHeader(xhr, regexp) {
    return regexp.test(xhr.getAllResponseHeaders());
  }
  function ajaxHelper(verb, path, context) {
    verb = verb.toLowerCase();
    if (context) {
      if (context instanceof Element || typeof context === "string") {
        return issueAjaxRequest(verb, path, null, null, {
          targetOverride: resolveTarget(context) || DUMMY_ELT,
          returnPromise: true
        });
      } else {
        let resolvedTarget = resolveTarget(context.target);
        if (context.target && !resolvedTarget || context.source && !resolvedTarget && !resolveTarget(context.source)) {
          resolvedTarget = DUMMY_ELT;
        }
        return issueAjaxRequest(verb, path, resolveTarget(context.source), context.event, {
          handler: context.handler,
          headers: context.headers,
          values: context.values,
          targetOverride: resolvedTarget,
          swapOverride: context.swap,
          select: context.select,
          returnPromise: true,
          push: context.push,
          replace: context.replace,
          selectOOB: context.selectOOB
        });
      }
    } else {
      return issueAjaxRequest(verb, path, null, null, {
        returnPromise: true
      });
    }
  }
  function hierarchyForElt(elt) {
    const arr = [];
    while (elt) {
      arr.push(elt);
      elt = elt.parentElement;
    }
    return arr;
  }
  function verifyPath(elt, path, requestConfig) {
    const url = new URL(path, location.protocol !== "about:" ? location.href : window.origin);
    const origin = location.protocol !== "about:" ? location.origin : window.origin;
    const sameHost = origin === url.origin;
    if (htmx.config.selfRequestsOnly) {
      if (!sameHost) {
        return false;
      }
    }
    return triggerEvent(elt, "htmx:validateUrl", mergeObjects({ url, sameHost }, requestConfig));
  }
  function formDataFromObject(obj) {
    if (obj instanceof FormData)
      return obj;
    const formData = new FormData;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && typeof obj[key].forEach === "function") {
          obj[key].forEach(function(v) {
            formData.append(key, v);
          });
        } else if (typeof obj[key] === "object" && !(obj[key] instanceof Blob)) {
          formData.append(key, JSON.stringify(obj[key]));
        } else {
          formData.append(key, obj[key]);
        }
      }
    }
    return formData;
  }
  function formDataArrayProxy(formData, name, array) {
    return new Proxy(array, {
      get: function(target, key) {
        if (typeof key === "number")
          return target[key];
        if (key === "length")
          return target.length;
        if (key === "push") {
          return function(value) {
            target.push(value);
            formData.append(name, value);
          };
        }
        if (typeof target[key] === "function") {
          return function() {
            target[key].apply(target, arguments);
            formData.delete(name);
            target.forEach(function(v) {
              formData.append(name, v);
            });
          };
        }
        if (target[key] && target[key].length === 1) {
          return target[key][0];
        } else {
          return target[key];
        }
      },
      set: function(target, index, value) {
        target[index] = value;
        formData.delete(name);
        target.forEach(function(v) {
          formData.append(name, v);
        });
        return true;
      }
    });
  }
  function formDataProxy(formData) {
    return new Proxy(formData, {
      get: function(target, name) {
        if (typeof name === "symbol") {
          const result = Reflect.get(target, name);
          if (typeof result === "function") {
            return function() {
              return result.apply(formData, arguments);
            };
          } else {
            return result;
          }
        }
        if (name === "toJSON") {
          return () => Object.fromEntries(formData);
        }
        if (name in target) {
          if (typeof target[name] === "function") {
            return function() {
              return formData[name].apply(formData, arguments);
            };
          }
        }
        const array = formData.getAll(name);
        if (array.length === 0) {
          return;
        } else if (array.length === 1) {
          return array[0];
        } else {
          return formDataArrayProxy(target, name, array);
        }
      },
      set: function(target, name, value) {
        if (typeof name !== "string") {
          return false;
        }
        target.delete(name);
        if (value && typeof value.forEach === "function") {
          value.forEach(function(v) {
            target.append(name, v);
          });
        } else if (typeof value === "object" && !(value instanceof Blob)) {
          target.append(name, JSON.stringify(value));
        } else {
          target.append(name, value);
        }
        return true;
      },
      deleteProperty: function(target, name) {
        if (typeof name === "string") {
          target.delete(name);
        }
        return true;
      },
      ownKeys: function(target) {
        return Reflect.ownKeys(Object.fromEntries(target));
      },
      getOwnPropertyDescriptor: function(target, prop) {
        return Reflect.getOwnPropertyDescriptor(Object.fromEntries(target), prop);
      }
    });
  }
  function issueAjaxRequest(verb, path, elt, event, etc, confirmed) {
    let resolve = null;
    let reject = null;
    etc = etc != null ? etc : {};
    if (etc.returnPromise && typeof Promise !== "undefined") {
      var promise = new Promise(function(_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
      });
    }
    if (elt == null) {
      elt = getDocument().body;
    }
    const responseHandler = etc.handler || handleAjaxResponse;
    const select = etc.select || null;
    if (!bodyContains(elt)) {
      maybeCall(resolve);
      return promise;
    }
    const target = etc.targetOverride || asElement(getTarget(elt));
    if (target == null || target == DUMMY_ELT) {
      triggerErrorEvent(elt, "htmx:targetError", { target: getClosestAttributeValue(elt, "hx-target") });
      maybeCall(reject);
      return promise;
    }
    let eltData = getInternalData(elt);
    const submitter = eltData.lastButtonClicked;
    if (submitter) {
      const buttonPath = getRawAttribute(submitter, "formaction");
      if (buttonPath != null) {
        path = buttonPath;
      }
      const buttonVerb = getRawAttribute(submitter, "formmethod");
      if (buttonVerb != null) {
        if (VERBS.includes(buttonVerb.toLowerCase())) {
          verb = buttonVerb;
        } else {
          maybeCall(resolve);
          return promise;
        }
      }
    }
    const confirmQuestion = getClosestAttributeValue(elt, "hx-confirm");
    if (confirmed === undefined) {
      const issueRequest = function(skipConfirmation) {
        return issueAjaxRequest(verb, path, elt, event, etc, !!skipConfirmation);
      };
      const confirmDetails = { target, elt, path, verb, triggeringEvent: event, etc, issueRequest, question: confirmQuestion };
      if (triggerEvent(elt, "htmx:confirm", confirmDetails) === false) {
        maybeCall(resolve);
        return promise;
      }
    }
    let syncElt = elt;
    let syncStrategy = getClosestAttributeValue(elt, "hx-sync");
    let queueStrategy = null;
    let abortable = false;
    if (syncStrategy) {
      const syncStrings = syncStrategy.split(":");
      const selector = syncStrings[0].trim();
      if (selector === "this") {
        syncElt = findThisElement(elt, "hx-sync");
      } else {
        syncElt = asElement(querySelectorExt(elt, selector));
      }
      syncStrategy = (syncStrings[1] || "drop").trim();
      eltData = getInternalData(syncElt);
      if (syncStrategy === "drop" && eltData.xhr && eltData.abortable !== true) {
        maybeCall(resolve);
        return promise;
      } else if (syncStrategy === "abort") {
        if (eltData.xhr) {
          maybeCall(resolve);
          return promise;
        } else {
          abortable = true;
        }
      } else if (syncStrategy === "replace") {
        triggerEvent(syncElt, "htmx:abort");
      } else if (syncStrategy.indexOf("queue") === 0) {
        const queueStrArray = syncStrategy.split(" ");
        queueStrategy = (queueStrArray[1] || "last").trim();
      }
    }
    if (eltData.xhr) {
      if (eltData.abortable) {
        triggerEvent(syncElt, "htmx:abort");
      } else {
        if (queueStrategy == null) {
          if (event) {
            const eventData = getInternalData(event);
            if (eventData && eventData.triggerSpec && eventData.triggerSpec.queue) {
              queueStrategy = eventData.triggerSpec.queue;
            }
          }
          if (queueStrategy == null) {
            queueStrategy = "last";
          }
        }
        if (eltData.queuedRequests == null) {
          eltData.queuedRequests = [];
        }
        if (queueStrategy === "first" && eltData.queuedRequests.length === 0) {
          eltData.queuedRequests.push(function() {
            issueAjaxRequest(verb, path, elt, event, etc);
          });
        } else if (queueStrategy === "all") {
          eltData.queuedRequests.push(function() {
            issueAjaxRequest(verb, path, elt, event, etc);
          });
        } else if (queueStrategy === "last") {
          eltData.queuedRequests = [];
          eltData.queuedRequests.push(function() {
            issueAjaxRequest(verb, path, elt, event, etc);
          });
        }
        maybeCall(resolve);
        return promise;
      }
    }
    const xhr = new XMLHttpRequest;
    eltData.xhr = xhr;
    eltData.abortable = abortable;
    const endRequestLock = function() {
      eltData.xhr = null;
      eltData.abortable = false;
      if (eltData.queuedRequests != null && eltData.queuedRequests.length > 0) {
        const queuedRequest = eltData.queuedRequests.shift();
        queuedRequest();
      }
    };
    const promptQuestion = getClosestAttributeValue(elt, "hx-prompt");
    if (promptQuestion) {
      var promptResponse = prompt(promptQuestion);
      if (promptResponse === null || !triggerEvent(elt, "htmx:prompt", { prompt: promptResponse, target })) {
        maybeCall(resolve);
        endRequestLock();
        return promise;
      }
    }
    if (confirmQuestion && !confirmed) {
      if (!confirm(confirmQuestion)) {
        maybeCall(resolve);
        endRequestLock();
        return promise;
      }
    }
    let headers = getHeaders(elt, target, promptResponse);
    if (verb !== "get" && !usesFormData(elt)) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    if (etc.headers) {
      headers = mergeObjects(headers, etc.headers);
    }
    const results = getInputValues(elt, verb);
    let errors = results.errors;
    const rawFormData = results.formData;
    if (etc.values) {
      overrideFormData(rawFormData, formDataFromObject(etc.values));
    }
    const expressionVars = formDataFromObject(getExpressionVars(elt, event));
    const allFormData = overrideFormData(rawFormData, expressionVars);
    let filteredFormData = filterValues(allFormData, elt);
    if (htmx.config.getCacheBusterParam && verb === "get") {
      filteredFormData.set("org.htmx.cache-buster", getRawAttribute(target, "id") || "true");
    }
    if (path == null || path === "") {
      path = location.href;
    }
    const requestAttrValues = getValuesForElement(elt, "hx-request");
    const eltIsBoosted = getInternalData(elt).boosted;
    let useUrlParams = htmx.config.methodsThatUseUrlParams.indexOf(verb) >= 0;
    const requestConfig = {
      boosted: eltIsBoosted,
      useUrlParams,
      formData: filteredFormData,
      parameters: formDataProxy(filteredFormData),
      unfilteredFormData: allFormData,
      unfilteredParameters: formDataProxy(allFormData),
      headers,
      elt,
      target,
      verb,
      errors,
      withCredentials: etc.credentials || requestAttrValues.credentials || htmx.config.withCredentials,
      timeout: etc.timeout || requestAttrValues.timeout || htmx.config.timeout,
      path,
      triggeringEvent: event
    };
    if (!triggerEvent(elt, "htmx:configRequest", requestConfig)) {
      maybeCall(resolve);
      endRequestLock();
      return promise;
    }
    path = requestConfig.path;
    verb = requestConfig.verb;
    headers = requestConfig.headers;
    filteredFormData = formDataFromObject(requestConfig.parameters);
    errors = requestConfig.errors;
    useUrlParams = requestConfig.useUrlParams;
    if (errors && errors.length > 0) {
      triggerEvent(elt, "htmx:validation:halted", requestConfig);
      maybeCall(resolve);
      endRequestLock();
      return promise;
    }
    const splitPath = path.split("#");
    const pathNoAnchor = splitPath[0];
    const anchor = splitPath[1];
    let finalPath = path;
    if (useUrlParams) {
      finalPath = pathNoAnchor;
      const hasValues = !filteredFormData.keys().next().done;
      if (hasValues) {
        if (finalPath.indexOf("?") < 0) {
          finalPath += "?";
        } else {
          finalPath += "&";
        }
        finalPath += urlEncode(filteredFormData);
        if (anchor) {
          finalPath += "#" + anchor;
        }
      }
    }
    if (!verifyPath(elt, finalPath, requestConfig)) {
      triggerErrorEvent(elt, "htmx:invalidPath", requestConfig);
      maybeCall(reject);
      endRequestLock();
      return promise;
    }
    xhr.open(verb.toUpperCase(), finalPath, true);
    xhr.overrideMimeType("text/html");
    xhr.withCredentials = requestConfig.withCredentials;
    xhr.timeout = requestConfig.timeout;
    if (requestAttrValues.noHeaders) {} else {
      for (const header in headers) {
        if (headers.hasOwnProperty(header)) {
          const headerValue = headers[header];
          safelySetHeaderValue(xhr, header, headerValue);
        }
      }
    }
    const responseInfo = {
      xhr,
      target,
      requestConfig,
      etc,
      boosted: eltIsBoosted,
      select,
      pathInfo: {
        requestPath: path,
        finalRequestPath: finalPath,
        responsePath: null,
        anchor
      }
    };
    xhr.onload = function() {
      try {
        const hierarchy = hierarchyForElt(elt);
        responseInfo.pathInfo.responsePath = getPathFromResponse(xhr);
        responseHandler(elt, responseInfo);
        if (responseInfo.keepIndicators !== true) {
          removeRequestIndicators(indicators, disableElts);
        }
        triggerEvent(elt, "htmx:afterRequest", responseInfo);
        triggerEvent(elt, "htmx:afterOnLoad", responseInfo);
        if (!bodyContains(elt)) {
          let secondaryTriggerElt = null;
          while (hierarchy.length > 0 && secondaryTriggerElt == null) {
            const parentEltInHierarchy = hierarchy.shift();
            if (bodyContains(parentEltInHierarchy)) {
              secondaryTriggerElt = parentEltInHierarchy;
            }
          }
          if (secondaryTriggerElt) {
            triggerEvent(secondaryTriggerElt, "htmx:afterRequest", responseInfo);
            triggerEvent(secondaryTriggerElt, "htmx:afterOnLoad", responseInfo);
          }
        }
        maybeCall(resolve);
      } catch (e) {
        triggerErrorEvent(elt, "htmx:onLoadError", mergeObjects({ error: e }, responseInfo));
        throw e;
      } finally {
        endRequestLock();
      }
    };
    xhr.onerror = function() {
      removeRequestIndicators(indicators, disableElts);
      triggerErrorEvent(elt, "htmx:afterRequest", responseInfo);
      triggerErrorEvent(elt, "htmx:sendError", responseInfo);
      maybeCall(reject);
      endRequestLock();
    };
    xhr.onabort = function() {
      removeRequestIndicators(indicators, disableElts);
      triggerErrorEvent(elt, "htmx:afterRequest", responseInfo);
      triggerErrorEvent(elt, "htmx:sendAbort", responseInfo);
      maybeCall(reject);
      endRequestLock();
    };
    xhr.ontimeout = function() {
      removeRequestIndicators(indicators, disableElts);
      triggerErrorEvent(elt, "htmx:afterRequest", responseInfo);
      triggerErrorEvent(elt, "htmx:timeout", responseInfo);
      maybeCall(reject);
      endRequestLock();
    };
    if (!triggerEvent(elt, "htmx:beforeRequest", responseInfo)) {
      maybeCall(resolve);
      endRequestLock();
      return promise;
    }
    var indicators = addRequestIndicatorClasses(elt);
    var disableElts = disableElements(elt);
    forEach(["loadstart", "loadend", "progress", "abort"], function(eventName) {
      forEach([xhr, xhr.upload], function(target2) {
        target2.addEventListener(eventName, function(event2) {
          triggerEvent(elt, "htmx:xhr:" + eventName, {
            lengthComputable: event2.lengthComputable,
            loaded: event2.loaded,
            total: event2.total
          });
        });
      });
    });
    triggerEvent(elt, "htmx:beforeSend", responseInfo);
    const params = useUrlParams ? null : encodeParamsForBody(xhr, elt, filteredFormData);
    xhr.send(params);
    return promise;
  }
  function determineHistoryUpdates(elt, responseInfo) {
    const xhr = responseInfo.xhr;
    let pathFromHeaders = null;
    let typeFromHeaders = null;
    if (hasHeader(xhr, /HX-Push:/i)) {
      pathFromHeaders = xhr.getResponseHeader("HX-Push");
      typeFromHeaders = "push";
    } else if (hasHeader(xhr, /HX-Push-Url:/i)) {
      pathFromHeaders = xhr.getResponseHeader("HX-Push-Url");
      typeFromHeaders = "push";
    } else if (hasHeader(xhr, /HX-Replace-Url:/i)) {
      pathFromHeaders = xhr.getResponseHeader("HX-Replace-Url");
      typeFromHeaders = "replace";
    }
    if (pathFromHeaders) {
      if (pathFromHeaders === "false") {
        return {};
      } else {
        return {
          type: typeFromHeaders,
          path: pathFromHeaders
        };
      }
    }
    const requestPath = responseInfo.pathInfo.finalRequestPath;
    const responsePath = responseInfo.pathInfo.responsePath;
    let pushUrl = responseInfo.etc.push || getClosestAttributeValue(elt, "hx-push-url");
    let replaceUrl = responseInfo.etc.replace || getClosestAttributeValue(elt, "hx-replace-url");
    if (pushUrl === "false")
      pushUrl = null;
    if (replaceUrl === "false")
      replaceUrl = null;
    const elementIsBoosted = getInternalData(elt).boosted;
    let saveType = null;
    let path = null;
    if (pushUrl) {
      saveType = "push";
      path = pushUrl;
    } else if (replaceUrl) {
      saveType = "replace";
      path = replaceUrl;
    } else if (elementIsBoosted) {
      saveType = "push";
      path = responsePath || requestPath;
    }
    if (path) {
      if (path === "true") {
        path = responsePath || requestPath;
      }
      if (responseInfo.pathInfo.anchor && path.indexOf("#") === -1) {
        path = path + "#" + responseInfo.pathInfo.anchor;
      }
      return {
        type: saveType,
        path
      };
    } else {
      return {};
    }
  }
  function codeMatches(responseHandlingConfig, status) {
    var regExp = new RegExp(responseHandlingConfig.code);
    return regExp.test(status.toString(10));
  }
  function resolveResponseHandling(xhr) {
    for (var i = 0;i < htmx.config.responseHandling.length; i++) {
      var responseHandlingElement = htmx.config.responseHandling[i];
      if (codeMatches(responseHandlingElement, xhr.status)) {
        return responseHandlingElement;
      }
    }
    return {
      swap: false
    };
  }
  function handleTitle(title) {
    if (title) {
      const titleElt = find("title");
      if (titleElt) {
        titleElt.textContent = title;
      } else {
        window.document.title = title;
      }
    }
  }
  function resolveRetarget(elt, target) {
    if (target === "this") {
      return elt;
    }
    const resolvedTarget = asElement(querySelectorExt(elt, target));
    if (resolvedTarget == null) {
      triggerErrorEvent(elt, "htmx:targetError", { target });
      throw new Error(`Invalid re-target ${target}`);
    }
    return resolvedTarget;
  }
  function handleAjaxResponse(elt, responseInfo) {
    const xhr = responseInfo.xhr;
    let target = responseInfo.target;
    const etc = responseInfo.etc;
    const responseInfoSelect = responseInfo.select;
    if (!triggerEvent(elt, "htmx:beforeOnLoad", responseInfo))
      return;
    if (hasHeader(xhr, /HX-Trigger:/i)) {
      handleTriggerHeader(xhr, "HX-Trigger", elt);
    }
    if (hasHeader(xhr, /HX-Location:/i)) {
      let redirectPath = xhr.getResponseHeader("HX-Location");
      var redirectSwapSpec = {};
      if (redirectPath.indexOf("{") === 0) {
        redirectSwapSpec = parseJSON(redirectPath);
        redirectPath = redirectSwapSpec.path;
        delete redirectSwapSpec.path;
      }
      redirectSwapSpec.push = redirectSwapSpec.push ?? "true";
      ajaxHelper("get", redirectPath, redirectSwapSpec);
      return;
    }
    const shouldRefresh = hasHeader(xhr, /HX-Refresh:/i) && xhr.getResponseHeader("HX-Refresh") === "true";
    if (hasHeader(xhr, /HX-Redirect:/i)) {
      responseInfo.keepIndicators = true;
      htmx.location.href = xhr.getResponseHeader("HX-Redirect");
      shouldRefresh && htmx.location.reload();
      return;
    }
    if (shouldRefresh) {
      responseInfo.keepIndicators = true;
      htmx.location.reload();
      return;
    }
    const historyUpdate = determineHistoryUpdates(elt, responseInfo);
    const responseHandling = resolveResponseHandling(xhr);
    const shouldSwap = responseHandling.swap;
    let isError = !!responseHandling.error;
    let ignoreTitle = htmx.config.ignoreTitle || responseHandling.ignoreTitle;
    let selectOverride = responseHandling.select;
    if (responseHandling.target) {
      responseInfo.target = resolveRetarget(elt, responseHandling.target);
    }
    var swapOverride = etc.swapOverride;
    if (swapOverride == null && responseHandling.swapOverride) {
      swapOverride = responseHandling.swapOverride;
    }
    if (hasHeader(xhr, /HX-Retarget:/i)) {
      responseInfo.target = resolveRetarget(elt, xhr.getResponseHeader("HX-Retarget"));
    }
    if (hasHeader(xhr, /HX-Reswap:/i)) {
      swapOverride = xhr.getResponseHeader("HX-Reswap");
    }
    var serverResponse = xhr.response;
    var beforeSwapDetails = mergeObjects({
      shouldSwap,
      serverResponse,
      isError,
      ignoreTitle,
      selectOverride,
      swapOverride
    }, responseInfo);
    if (responseHandling.event && !triggerEvent(target, responseHandling.event, beforeSwapDetails))
      return;
    if (!triggerEvent(target, "htmx:beforeSwap", beforeSwapDetails))
      return;
    target = beforeSwapDetails.target;
    serverResponse = beforeSwapDetails.serverResponse;
    isError = beforeSwapDetails.isError;
    ignoreTitle = beforeSwapDetails.ignoreTitle;
    selectOverride = beforeSwapDetails.selectOverride;
    swapOverride = beforeSwapDetails.swapOverride;
    responseInfo.target = target;
    responseInfo.failed = isError;
    responseInfo.successful = !isError;
    if (beforeSwapDetails.shouldSwap) {
      if (xhr.status === 286) {
        cancelPolling(elt);
      }
      withExtensions(elt, function(extension) {
        serverResponse = extension.transformResponse(serverResponse, xhr, elt);
      });
      if (historyUpdate.type) {
        saveCurrentPageToHistory();
      }
      var swapSpec = getSwapSpecification(elt, swapOverride);
      if (!swapSpec.hasOwnProperty("ignoreTitle")) {
        swapSpec.ignoreTitle = ignoreTitle;
      }
      addClassToElement(target, htmx.config.swappingClass);
      if (responseInfoSelect) {
        selectOverride = responseInfoSelect;
      }
      if (hasHeader(xhr, /HX-Reselect:/i)) {
        selectOverride = xhr.getResponseHeader("HX-Reselect");
      }
      const selectOOB = etc.selectOOB || getClosestAttributeValue(elt, "hx-select-oob");
      const select = getClosestAttributeValue(elt, "hx-select");
      swap(target, serverResponse, swapSpec, {
        select: selectOverride === "unset" ? null : selectOverride || select,
        selectOOB,
        eventInfo: responseInfo,
        anchor: responseInfo.pathInfo.anchor,
        contextElement: elt,
        afterSwapCallback: function() {
          if (hasHeader(xhr, /HX-Trigger-After-Swap:/i)) {
            let finalElt = elt;
            if (!bodyContains(elt)) {
              finalElt = getDocument().body;
            }
            handleTriggerHeader(xhr, "HX-Trigger-After-Swap", finalElt);
          }
        },
        afterSettleCallback: function() {
          if (hasHeader(xhr, /HX-Trigger-After-Settle:/i)) {
            let finalElt = elt;
            if (!bodyContains(elt)) {
              finalElt = getDocument().body;
            }
            handleTriggerHeader(xhr, "HX-Trigger-After-Settle", finalElt);
          }
        },
        beforeSwapCallback: function() {
          if (historyUpdate.type) {
            triggerEvent(getDocument().body, "htmx:beforeHistoryUpdate", mergeObjects({ history: historyUpdate }, responseInfo));
            if (historyUpdate.type === "push") {
              pushUrlIntoHistory(historyUpdate.path);
              triggerEvent(getDocument().body, "htmx:pushedIntoHistory", { path: historyUpdate.path });
            } else {
              replaceUrlInHistory(historyUpdate.path);
              triggerEvent(getDocument().body, "htmx:replacedInHistory", { path: historyUpdate.path });
            }
          }
        }
      });
    }
    if (isError) {
      triggerErrorEvent(elt, "htmx:responseError", mergeObjects({ error: "Response Status Error Code " + xhr.status + " from " + responseInfo.pathInfo.requestPath }, responseInfo));
    }
  }
  const extensions = {};
  function extensionBase() {
    return {
      init: function(api) {
        return null;
      },
      getSelectors: function() {
        return null;
      },
      onEvent: function(name, evt) {
        return true;
      },
      transformResponse: function(text, xhr, elt) {
        return text;
      },
      isInlineSwap: function(swapStyle) {
        return false;
      },
      handleSwap: function(swapStyle, target, fragment, settleInfo) {
        return false;
      },
      encodeParameters: function(xhr, parameters, elt) {
        return null;
      }
    };
  }
  function defineExtension(name, extension) {
    if (extension.init) {
      extension.init(internalAPI);
    }
    extensions[name] = mergeObjects(extensionBase(), extension);
  }
  function removeExtension(name) {
    delete extensions[name];
  }
  function getExtensions(elt, extensionsToReturn, extensionsToIgnore) {
    if (extensionsToReturn == undefined) {
      extensionsToReturn = [];
    }
    if (elt == undefined) {
      return extensionsToReturn;
    }
    if (extensionsToIgnore == undefined) {
      extensionsToIgnore = [];
    }
    const extensionsForElement = getAttributeValue(elt, "hx-ext");
    if (extensionsForElement) {
      forEach(extensionsForElement.split(","), function(extensionName) {
        extensionName = extensionName.replace(/ /g, "");
        if (extensionName.slice(0, 7) == "ignore:") {
          extensionsToIgnore.push(extensionName.slice(7));
          return;
        }
        if (extensionsToIgnore.indexOf(extensionName) < 0) {
          const extension = extensions[extensionName];
          if (extension && extensionsToReturn.indexOf(extension) < 0) {
            extensionsToReturn.push(extension);
          }
        }
      });
    }
    return getExtensions(asElement(parentElt(elt)), extensionsToReturn, extensionsToIgnore);
  }
  var isReady = false;
  getDocument().addEventListener("DOMContentLoaded", function() {
    isReady = true;
  });
  function ready(fn2) {
    if (isReady || getDocument().readyState === "complete") {
      fn2();
    } else {
      getDocument().addEventListener("DOMContentLoaded", fn2);
    }
  }
  function insertIndicatorStyles() {
    if (htmx.config.includeIndicatorStyles !== false) {
      const nonceAttribute = htmx.config.inlineStyleNonce ? ` nonce="${htmx.config.inlineStyleNonce}"` : "";
      const indicator = htmx.config.indicatorClass;
      const request = htmx.config.requestClass;
      getDocument().head.insertAdjacentHTML("beforeend", `<style${nonceAttribute}>` + `.${indicator}{opacity:0;visibility: hidden} ` + `.${request} .${indicator}, .${request}.${indicator}{opacity:1;visibility: visible;transition: opacity 200ms ease-in}` + "</style>");
    }
  }
  function getMetaConfig() {
    const element = getDocument().querySelector('meta[name="htmx-config"]');
    if (element) {
      return parseJSON(element.content);
    } else {
      return null;
    }
  }
  function mergeMetaConfig() {
    const metaConfig = getMetaConfig();
    if (metaConfig) {
      htmx.config = mergeObjects(htmx.config, metaConfig);
    }
  }
  ready(function() {
    mergeMetaConfig();
    insertIndicatorStyles();
    let body = getDocument().body;
    processNode(body);
    const restoredElts = getDocument().querySelectorAll("[hx-trigger='restored'],[data-hx-trigger='restored']");
    body.addEventListener("htmx:abort", function(evt) {
      const target = evt.detail.elt || evt.target;
      const internalData = getInternalData(target);
      if (internalData && internalData.xhr) {
        internalData.xhr.abort();
      }
    });
    const originalPopstate = window.onpopstate ? window.onpopstate.bind(window) : null;
    window.onpopstate = function(event) {
      if (event.state && event.state.htmx) {
        restoreHistory();
        forEach(restoredElts, function(elt) {
          triggerEvent(elt, "htmx:restored", {
            document: getDocument(),
            triggerEvent
          });
        });
      } else {
        if (originalPopstate) {
          originalPopstate(event);
        }
      }
    };
    getWindow().setTimeout(function() {
      triggerEvent(body, "htmx:load", {});
      body = null;
    }, 0);
  });
  return htmx;
}();
var htmx_esm_default = htmx2;

// node_modules/alpinejs/dist/module.esm.js
var flushPending = false;
var flushing = false;
var queue = [];
var lastFlushedIndex = -1;
var queueNeedsSort = false;
var transactionActive = false;
function scheduler(callback) {
  queueJob(callback);
}
function startTransaction() {
  transactionActive = true;
}
function commitTransaction() {
  transactionActive = false;
  queueFlush();
}
function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
    if (job._x_schedulerPriority !== undefined)
      queueNeedsSort = true;
  }
  queueFlush();
}
function dequeueJob(job) {
  let index = queue.indexOf(job);
  if (index !== -1 && index > lastFlushedIndex)
    queue.splice(index, 1);
}
function queueFlush() {
  if (!flushing && !flushPending) {
    if (transactionActive)
      return;
    flushPending = true;
    queueMicrotask(flushJobs);
  }
}
function flushJobs() {
  flushPending = false;
  flushing = true;
  for (let i = 0;i < queue.length; i++) {
    if (queueNeedsSort)
      sortPendingJobs(i);
    queue[i]();
    lastFlushedIndex = i;
  }
  queue.length = 0;
  lastFlushedIndex = -1;
  queueNeedsSort = false;
  flushing = false;
}
function sortPendingJobs(start2) {
  let depths = /* @__PURE__ */ new Map;
  let sorted = queue.slice(start2).sort((a, b) => compareJobs(a, b, depths));
  for (let i = 0;i < sorted.length; i++) {
    queue[start2 + i] = sorted[i];
  }
  queueNeedsSort = false;
}
function compareJobs(a, b, depths) {
  if (!isStructural(a))
    return isStructural(b) ? 1 : 0;
  if (!isStructural(b))
    return -1;
  let depthDifference = getElementDepth(a._x_schedulerPriority.el, depths) - getElementDepth(b._x_schedulerPriority.el, depths);
  return depthDifference || a._x_schedulerPriority.order - b._x_schedulerPriority.order;
}
function isStructural(job) {
  return job._x_schedulerPriority !== undefined;
}
function getElementDepth(el, depths) {
  if (depths.has(el))
    return depths.get(el);
  let depth = 0;
  let owner = el;
  while (el) {
    depth++;
    if (el._x_teleportBack) {
      el = el._x_teleportBack;
    } else if (typeof ShadowRoot === "function" && el.parentNode instanceof ShadowRoot) {
      el = el.parentNode.host;
    } else {
      el = el.parentElement;
    }
  }
  depths.set(owner, depth);
  return depth;
}
var reactive;
var effect4;
var release;
var raw;
var nextStructuralEffectOrder = 0;
var shouldSchedule = true;
function disableEffectScheduling(callback) {
  shouldSchedule = false;
  callback();
  shouldSchedule = true;
}
function setReactivityEngine(engine) {
  reactive = engine.reactive;
  release = engine.release;
  effect4 = (callback) => engine.effect(callback, { scheduler: (task) => {
    if (shouldSchedule) {
      scheduler(task);
    } else {
      task();
    }
  } });
  raw = engine.raw;
}
function overrideEffect(override) {
  effect4 = override;
}
function elementBoundEffect(el) {
  let cleanup = () => {};
  let wrappedEffect = (callback, options) => {
    let priority = options?.priority === "structural" ? nextStructuralEffectOrder++ : undefined;
    let effectReference = effect4(callback);
    if (priority !== undefined && effectReference !== undefined) {
      effectReference._x_schedulerPriority = { el, order: priority };
    }
    if (!el._x_effects) {
      el._x_effects = /* @__PURE__ */ new Set;
      el._x_runEffects = () => {
        el._x_effects.forEach((i) => i());
      };
    }
    el._x_effects.add(effectReference);
    cleanup = () => {
      if (effectReference === undefined)
        return;
      el._x_effects.delete(effectReference);
      release(effectReference);
    };
    return effectReference;
  };
  return [wrappedEffect, () => {
    cleanup();
  }];
}
function watch(getter, callback) {
  let firstTime = true;
  let oldValue;
  let oldValueJSON;
  let effectReference = effect4(() => {
    let value = getter();
    let newJSON = JSON.stringify(value);
    if (!firstTime) {
      if (typeof value === "object" || value !== oldValue) {
        let previousValue = typeof oldValue === "object" ? JSON.parse(oldValueJSON) : oldValue;
        queueMicrotask(() => {
          callback(value, previousValue);
        });
      }
    }
    oldValue = value;
    oldValueJSON = newJSON;
    firstTime = false;
  });
  return () => release(effectReference);
}
async function transaction(callback) {
  startTransaction();
  try {
    await callback();
    await Promise.resolve();
  } finally {
    commitTransaction();
  }
}
var onAttributeAddeds = [];
var onElRemoveds = [];
var onElAddeds = [];
function onElAdded(callback) {
  onElAddeds.push(callback);
}
function onElRemoved(el, callback) {
  if (typeof callback === "function") {
    if (!el._x_cleanups)
      el._x_cleanups = [];
    el._x_cleanups.push(callback);
  } else {
    callback = el;
    onElRemoveds.push(callback);
  }
}
function onAttributesAdded(callback) {
  onAttributeAddeds.push(callback);
}
function onAttributeRemoved(el, name, callback) {
  if (!el._x_attributeCleanups)
    el._x_attributeCleanups = {};
  if (!el._x_attributeCleanups[name])
    el._x_attributeCleanups[name] = [];
  el._x_attributeCleanups[name].push(callback);
}
function cleanupAttributes(el, names) {
  if (!el._x_attributeCleanups)
    return;
  Object.entries(el._x_attributeCleanups).forEach(([name, value]) => {
    if (names === undefined || names.includes(name)) {
      value.forEach((i) => i());
      delete el._x_attributeCleanups[name];
    }
  });
}
function cleanupElement(el) {
  el._x_effects?.forEach(dequeueJob);
  while (el._x_cleanups?.length)
    el._x_cleanups.pop()();
}
var observer = new MutationObserver(onMutate);
var currentlyObserving = false;
function startObservingMutations() {
  observer.observe(document, { subtree: true, childList: true, attributes: true, attributeOldValue: true });
  currentlyObserving = true;
}
function stopObservingMutations() {
  flushObserver();
  observer.disconnect();
  currentlyObserving = false;
}
var queuedMutations = [];
function flushObserver() {
  let records = observer.takeRecords();
  queuedMutations.push(() => records.length > 0 && onMutate(records));
  let queueLengthWhenTriggered = queuedMutations.length;
  queueMicrotask(() => {
    if (queuedMutations.length === queueLengthWhenTriggered) {
      while (queuedMutations.length > 0)
        queuedMutations.shift()();
    }
  });
}
function flushPendingMutations() {
  while (queuedMutations.length > 0)
    queuedMutations.shift()();
  let records = observer.takeRecords();
  if (records.length > 0)
    onMutate(records);
}
function mutateDom(callback) {
  if (!currentlyObserving)
    return callback();
  stopObservingMutations();
  let result = callback();
  startObservingMutations();
  return result;
}
var isCollecting = false;
var deferredMutations = [];
function deferMutations() {
  isCollecting = true;
}
function flushAndStopDeferringMutations() {
  isCollecting = false;
  onMutate(deferredMutations);
  deferredMutations = [];
}
function onMutate(mutations) {
  if (isCollecting) {
    deferredMutations = deferredMutations.concat(mutations);
    return;
  }
  let addedNodes = [];
  let removedNodes = /* @__PURE__ */ new Set;
  let addedAttributes = /* @__PURE__ */ new Map;
  let removedAttributes = /* @__PURE__ */ new Map;
  for (let i = 0;i < mutations.length; i++) {
    if (mutations[i].target._x_ignoreMutationObserver)
      continue;
    if (mutations[i].type === "childList") {
      mutations[i].removedNodes.forEach((node) => {
        if (node.nodeType !== 1)
          return;
        if (!node._x_marker)
          return;
        removedNodes.add(node);
      });
      mutations[i].addedNodes.forEach((node) => {
        if (node.nodeType !== 1)
          return;
        if (removedNodes.has(node)) {
          removedNodes.delete(node);
          return;
        }
        if (node._x_marker)
          return;
        addedNodes.push(node);
      });
    }
    if (mutations[i].type === "attributes") {
      let el = mutations[i].target;
      let name = mutations[i].attributeName;
      let oldValue = mutations[i].oldValue;
      let add = () => {
        if (!addedAttributes.has(el))
          addedAttributes.set(el, []);
        addedAttributes.get(el).push({ name, value: el.getAttribute(name) });
      };
      let remove2 = () => {
        if (!removedAttributes.has(el))
          removedAttributes.set(el, []);
        removedAttributes.get(el).push(name);
      };
      if (el.hasAttribute(name) && oldValue === null) {
        add();
      } else if (el.hasAttribute(name)) {
        remove2();
        add();
      } else {
        remove2();
      }
    }
  }
  removedAttributes.forEach((attrs, el) => {
    cleanupAttributes(el, attrs);
  });
  addedAttributes.forEach((attrs, el) => {
    onAttributeAddeds.forEach((i) => i(el, attrs));
  });
  for (let node of removedNodes) {
    if (addedNodes.some((i) => i.contains(node)))
      continue;
    onElRemoveds.forEach((i) => i(node));
  }
  for (let node of addedNodes) {
    if (!node.isConnected)
      continue;
    onElAddeds.forEach((i) => i(node));
  }
  addedNodes = null;
  removedNodes = null;
  addedAttributes = null;
  removedAttributes = null;
}
function scope(node) {
  return mergeProxies(closestDataStack(node));
}
function addScopeToNode(node, data2, referenceNode) {
  node._x_dataStack = [data2, ...closestDataStack(referenceNode || node)];
  return () => {
    node._x_dataStack = node._x_dataStack.filter((i) => i !== data2);
  };
}
function closestDataStack(node) {
  if (node._x_dataStack)
    return node._x_dataStack;
  if (typeof ShadowRoot === "function" && node instanceof ShadowRoot) {
    return closestDataStack(node.host);
  }
  if (!node.parentNode) {
    return [];
  }
  return closestDataStack(node.parentNode);
}
function mergeProxies(objects) {
  return new Proxy({ objects }, mergeProxyTrap);
}
function keyInPrototypeChain(obj, key) {
  if (obj === null || obj === Object.prototype)
    return null;
  if (Object.prototype.hasOwnProperty.call(obj, key))
    return obj;
  return keyInPrototypeChain(Object.getPrototypeOf(obj), key);
}
var mergeProxyTrap = {
  ownKeys({ objects }) {
    return Array.from(new Set(objects.flatMap((i) => Object.keys(i))));
  },
  has({ objects }, name) {
    if (name == Symbol.unscopables)
      return false;
    return objects.some((obj) => Object.prototype.hasOwnProperty.call(obj, name) || Reflect.has(obj, name));
  },
  get({ objects }, name, thisProxy) {
    if (name == "toJSON")
      return collapseProxies;
    return Reflect.get(objects.find((obj) => Reflect.has(obj, name)) || {}, name, thisProxy);
  },
  set({ objects }, name, value, thisProxy) {
    let target;
    for (const obj of objects) {
      target = keyInPrototypeChain(obj, name);
      if (target)
        break;
    }
    if (!target)
      target = objects[objects.length - 1];
    const descriptor = Object.getOwnPropertyDescriptor(target, name);
    if (descriptor?.set && descriptor?.get)
      return descriptor.set.call(thisProxy, value) || true;
    return Reflect.set(target, name, value);
  }
};
function collapseProxies() {
  let keys = Reflect.ownKeys(this);
  return keys.reduce((acc, key) => {
    acc[key] = Reflect.get(this, key);
    return acc;
  }, {});
}
function initInterceptors(data2, cleanup = () => {}) {
  let isObject3 = (val) => typeof val === "object" && !Array.isArray(val) && val !== null;
  let recurse = (obj, basePath = "") => {
    Object.entries(Object.getOwnPropertyDescriptors(obj)).forEach(([key, { value, enumerable }]) => {
      if (enumerable === false || value === undefined)
        return;
      if (typeof value === "object" && value !== null && value.__v_skip)
        return;
      let path = basePath === "" ? key : `${basePath}.${key}`;
      if (typeof value === "object" && value !== null && value._x_interceptor) {
        obj[key] = value.initialize(data2, path, key, cleanup);
      } else {
        if (isObject3(value) && value !== obj && !(value instanceof Element)) {
          recurse(value, path);
        }
      }
    });
  };
  return recurse(data2);
}
function interceptor(callback, mutateObj = () => {}) {
  let obj = {
    initialValue: undefined,
    _x_interceptor: true,
    initialize(data2, path, key, cleanup) {
      return callback(this.initialValue, () => get(data2, path), (value) => set(data2, path, value), path, key, cleanup);
    }
  };
  mutateObj(obj);
  return (initialValue) => {
    if (typeof initialValue === "object" && initialValue !== null && initialValue._x_interceptor) {
      let initialize = obj.initialize.bind(obj);
      obj.initialize = (data2, path, key, cleanup) => {
        let innerValue = initialValue.initialize(data2, path, key, cleanup);
        obj.initialValue = innerValue;
        return initialize(data2, path, key, cleanup);
      };
    } else {
      obj.initialValue = initialValue;
    }
    return obj;
  };
}
function get(obj, path) {
  return path.split(".").reduce((carry, segment) => carry[segment], obj);
}
function set(obj, path, value) {
  if (typeof path === "string")
    path = path.split(".");
  if (path.length === 1)
    obj[path[0]] = value;
  else if (path.length === 0)
    throw error;
  else {
    if (obj[path[0]])
      return set(obj[path[0]], path.slice(1), value);
    else {
      obj[path[0]] = {};
      return set(obj[path[0]], path.slice(1), value);
    }
  }
}
var magics = {};
function magic(name, callback) {
  magics[name] = callback;
}
function injectMagics(obj, el) {
  let memoizedUtilities = getUtilities(el);
  Object.entries(magics).forEach(([name, callback]) => {
    Object.defineProperty(obj, `$${name}`, {
      get() {
        return callback(el, memoizedUtilities);
      },
      enumerable: false
    });
  });
  return obj;
}
function getUtilities(el) {
  let [utilities, cleanup] = getElementBoundUtilities(el);
  let utils = { interceptor, ...utilities };
  onElRemoved(el, cleanup);
  return utils;
}
function tryCatch(el, expression, callback, ...args) {
  try {
    return callback(...args);
  } catch (e) {
    handleError(e, el, expression);
  }
}
function handleError(...args) {
  return errorHandler(...args);
}
var errorHandler = normalErrorHandler;
function setErrorHandler(handler4) {
  errorHandler = handler4;
}
function normalErrorHandler(error2, el, expression = undefined) {
  error2 = Object.assign(error2 ?? { message: "No error message given." }, { el, expression });
  console.warn(`Alpine Expression Error: ${error2.message}

${expression ? 'Expression: "' + expression + `"

` : ""}`, el);
  setTimeout(() => {
    throw error2;
  }, 0);
}
var shouldAutoEvaluateFunctions = true;
function dontAutoEvaluateFunctions(callback) {
  let cache = shouldAutoEvaluateFunctions;
  shouldAutoEvaluateFunctions = false;
  let result = callback();
  shouldAutoEvaluateFunctions = cache;
  return result;
}
function evaluate(el, expression, extras = {}) {
  let result;
  evaluateLater(el, expression)((value) => result = value, extras);
  return result;
}
function evaluateLater(...args) {
  return theEvaluatorFunction(...args);
}
var theEvaluatorFunction = () => {};
function setEvaluator(newEvaluator) {
  theEvaluatorFunction = newEvaluator;
}
var theRawEvaluatorFunction;
function setRawEvaluator(newEvaluator) {
  theRawEvaluatorFunction = newEvaluator;
}
function normalEvaluator(el, expression) {
  let overriddenMagics = {};
  injectMagics(overriddenMagics, el);
  let dataStack = [overriddenMagics, ...closestDataStack(el)];
  let evaluator = typeof expression === "function" ? generateEvaluatorFromFunction(dataStack, expression) : generateEvaluatorFromString(dataStack, expression, el);
  return tryCatch.bind(null, el, expression, evaluator);
}
function generateEvaluatorFromFunction(dataStack, func) {
  return (receiver = () => {}, { scope: scope2 = {}, params = [], context } = {}) => {
    if (!shouldAutoEvaluateFunctions) {
      runIfTypeOfFunction(receiver, func, mergeProxies([scope2, ...dataStack]), params);
      return;
    }
    let result = func.apply(mergeProxies([scope2, ...dataStack]), params);
    runIfTypeOfFunction(receiver, result);
  };
}
var evaluatorMemo = {};
function generateFunctionFromString(expression, el) {
  if (evaluatorMemo[expression]) {
    return evaluatorMemo[expression];
  }
  let AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
  let rightSideSafeExpression = /^[\n\s]*if.*\(.*\)/.test(expression.trim()) || /^(let|const)\s/.test(expression.trim()) ? `(async()=>{ ${expression} })()` : expression;
  const safeAsyncFunction = () => {
    try {
      let func2 = new AsyncFunction(["__self", "scope"], `with (scope) { __self.result = ${rightSideSafeExpression} }; __self.finished = true; return __self.result;`);
      Object.defineProperty(func2, "name", {
        value: `[Alpine] ${expression}`
      });
      return func2;
    } catch (error2) {
      handleError(error2, el, expression);
      return Promise.resolve();
    }
  };
  let func = safeAsyncFunction();
  evaluatorMemo[expression] = func;
  return func;
}
function generateEvaluatorFromString(dataStack, expression, el) {
  let func = generateFunctionFromString(expression, el);
  return (receiver = () => {}, { scope: scope2 = {}, params = [], context } = {}) => {
    func.result = undefined;
    func.finished = false;
    let completeScope = mergeProxies([scope2, ...dataStack]);
    if (typeof func === "function") {
      let promise = func.call(context, func, completeScope).catch((error2) => handleError(error2, el, expression));
      if (func.finished) {
        runIfTypeOfFunction(receiver, func.result, completeScope, params, el);
        func.result = undefined;
      } else {
        promise.then((result) => {
          runIfTypeOfFunction(receiver, result, completeScope, params, el);
        }).catch((error2) => handleError(error2, el, expression)).finally(() => func.result = undefined);
      }
    }
  };
}
function runIfTypeOfFunction(receiver, value, scope2, params, el) {
  if (shouldAutoEvaluateFunctions && typeof value === "function") {
    let result = value.apply(scope2, params);
    if (result instanceof Promise) {
      result.then((i) => runIfTypeOfFunction(receiver, i, scope2, params)).catch((error2) => handleError(error2, el, value));
    } else {
      receiver(result);
    }
  } else if (typeof value === "object" && value instanceof Promise) {
    value.then((i) => receiver(i));
  } else {
    receiver(value);
  }
}
function evaluateRaw(...args) {
  return theRawEvaluatorFunction(...args);
}
function normalRawEvaluator(el, expression, extras = {}) {
  let overriddenMagics = {};
  injectMagics(overriddenMagics, el);
  let dataStack = [overriddenMagics, ...closestDataStack(el)];
  let scope2 = mergeProxies([extras.scope ?? {}, ...dataStack]);
  let params = extras.params ?? [];
  if (expression.includes("await")) {
    let AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
    let rightSideSafeExpression = /^[\n\s]*if.*\(.*\)/.test(expression.trim()) || /^(let|const)\s/.test(expression.trim()) ? `(async()=>{ ${expression} })()` : expression;
    let func = new AsyncFunction(["scope"], `with (scope) { let __result = ${rightSideSafeExpression}; return __result }`);
    let result = func.call(extras.context, scope2);
    return result;
  } else {
    let rightSideSafeExpression = /^[\n\s]*if.*\(.*\)/.test(expression.trim()) || /^(let|const)\s/.test(expression.trim()) ? `(()=>{ ${expression} })()` : expression;
    let func = new Function(["scope"], `with (scope) { let __result = ${rightSideSafeExpression}; return __result }`);
    let result = func.call(extras.context, scope2);
    if (typeof result === "function" && shouldAutoEvaluateFunctions) {
      return result.apply(scope2, params);
    }
    return result;
  }
}
var prefixAsString = "x-";
function prefix(subject = "") {
  return prefixAsString + subject;
}
function setPrefix(newPrefix) {
  prefixAsString = newPrefix;
}
var directiveHandlers = {};
function directive(name, callback) {
  directiveHandlers[name] = callback;
  return {
    before(directive2) {
      if (!directiveHandlers[directive2]) {
        console.warn(String.raw`Cannot find directive \`${directive2}\`. \`${name}\` will use the default order of execution`);
        return;
      }
      const pos = directiveOrder.indexOf(directive2);
      directiveOrder.splice(pos >= 0 ? pos : directiveOrder.indexOf("DEFAULT"), 0, name);
    }
  };
}
function directiveExists(name) {
  return Object.keys(directiveHandlers).includes(name);
}
function directives(el, attributes, originalAttributeOverride) {
  attributes = Array.from(attributes);
  if (el._x_virtualDirectives) {
    let vAttributes = Object.entries(el._x_virtualDirectives).map(([name, value]) => ({ name, value }));
    let staticAttributes = attributesOnly(vAttributes);
    vAttributes = vAttributes.map((attribute) => {
      if (staticAttributes.find((attr) => attr.name === attribute.name)) {
        return {
          name: `x-bind:${attribute.name}`,
          value: `"${attribute.value}"`
        };
      }
      return attribute;
    });
    attributes = attributes.concat(vAttributes);
  }
  let transformedAttributeMap = {};
  let directives2 = attributes.map(toTransformedAttributes((newName, oldName) => transformedAttributeMap[newName] = oldName)).filter(outNonAlpineAttributes).map(toParsedDirectives(transformedAttributeMap, originalAttributeOverride)).sort(byPriority);
  return directives2.map((directive2) => {
    return getDirectiveHandler(el, directive2);
  });
}
function attributesOnly(attributes) {
  return Array.from(attributes).map(toTransformedAttributes()).filter((attr) => !outNonAlpineAttributes(attr));
}
var isDeferringHandlers = false;
var directiveHandlerStacks = /* @__PURE__ */ new Map;
var currentHandlerStackKey = Symbol();
function deferHandlingDirectives(callback) {
  isDeferringHandlers = true;
  let key = Symbol();
  currentHandlerStackKey = key;
  directiveHandlerStacks.set(key, []);
  let flushHandlers = () => {
    while (directiveHandlerStacks.get(key).length)
      directiveHandlerStacks.get(key).shift()();
    directiveHandlerStacks.delete(key);
  };
  let stopDeferring = () => {
    isDeferringHandlers = false;
    flushHandlers();
  };
  callback(flushHandlers);
  stopDeferring();
}
function getElementBoundUtilities(el) {
  let cleanups = [];
  let cleanup = (callback) => cleanups.push(callback);
  let [effect32, cleanupEffect2] = elementBoundEffect(el);
  cleanups.push(cleanupEffect2);
  let utilities = {
    Alpine: alpine_default,
    effect: effect32,
    cleanup,
    evaluateLater: evaluateLater.bind(evaluateLater, el),
    evaluate: evaluate.bind(evaluate, el)
  };
  let doCleanup = () => cleanups.forEach((i) => i());
  return [utilities, doCleanup];
}
function getDirectiveHandler(el, directive2) {
  let noop = () => {};
  let handler4 = directiveHandlers[directive2.type] || noop;
  let [utilities, cleanup] = getElementBoundUtilities(el);
  onAttributeRemoved(el, directive2.original, cleanup);
  let fullHandler = () => {
    if (el._x_ignore || el._x_ignoreSelf)
      return;
    handler4.inline && handler4.inline(el, directive2, utilities);
    handler4 = handler4.bind(handler4, el, directive2, utilities);
    isDeferringHandlers ? directiveHandlerStacks.get(currentHandlerStackKey).push(handler4) : handler4();
  };
  fullHandler.runCleanups = cleanup;
  return fullHandler;
}
var startingWith = (subject, replacement) => ({ name, value }) => {
  if (name.startsWith(subject))
    name = name.replace(subject, replacement);
  return { name, value };
};
var into = (i) => i;
function toTransformedAttributes(callback = () => {}) {
  return ({ name, value }) => {
    let { name: newName, value: newValue } = attributeTransformers.reduce((carry, transform) => {
      return transform(carry);
    }, { name, value });
    if (newName !== name)
      callback(newName, name);
    return { name: newName, value: newValue };
  };
}
var attributeTransformers = [];
function mapAttributes(callback) {
  attributeTransformers.push(callback);
}
function outNonAlpineAttributes({ name }) {
  return alpineAttributeRegex().test(name);
}
var alpineAttributeRegex = () => new RegExp(`^${prefixAsString}([^:^.]+)\\b`);
function toParsedDirectives(transformedAttributeMap, originalAttributeOverride) {
  return ({ name, value }) => {
    if (name === value)
      value = "";
    let typeMatch = name.match(alpineAttributeRegex());
    let valueMatch = name.match(/:([a-zA-Z0-9\-_:]+)/);
    let modifiers3 = name.match(/\.[^.\]]+(?=[^\]]*$)/g) || [];
    let original = originalAttributeOverride || transformedAttributeMap[name] || name;
    return {
      type: typeMatch ? typeMatch[1] : null,
      value: valueMatch ? valueMatch[1] : null,
      modifiers: modifiers3.map((i) => i.replace(".", "")),
      expression: value,
      original
    };
  };
}
var DEFAULT = "DEFAULT";
var directiveOrder = [
  "ignore",
  "ref",
  "id",
  "data",
  "anchor",
  "bind",
  "init",
  "for",
  "model",
  "modelable",
  "transition",
  "show",
  "if",
  DEFAULT,
  "teleport"
];
function byPriority(a, b) {
  let typeA = directiveOrder.indexOf(a.type) === -1 ? DEFAULT : a.type;
  let typeB = directiveOrder.indexOf(b.type) === -1 ? DEFAULT : b.type;
  return directiveOrder.indexOf(typeA) - directiveOrder.indexOf(typeB);
}
function walk(el, callback) {
  if (typeof ShadowRoot === "function" && el instanceof ShadowRoot) {
    Array.from(el.children).forEach((el2) => walk(el2, callback));
    return;
  }
  let skip = false;
  callback(el, () => skip = true);
  if (skip)
    return;
  let node = el.firstElementChild;
  while (node) {
    walk(node, callback, false);
    node = node.nextElementSibling;
  }
}
var isCloning = false;
function skipDuringClone(callback, fallback = () => {}) {
  return (...args) => isCloning ? fallback(...args) : callback(...args);
}
function onlyDuringClone(callback) {
  return (...args) => isCloning && callback(...args);
}
var interceptors = [];
function interceptClone(callback) {
  interceptors.push(callback);
}
function cloneNode(from, to) {
  interceptors.forEach((i) => i(from, to));
  isCloning = true;
  dontRegisterReactiveSideEffects(() => {
    initTree(to, (el, callback) => {
      callback(el, () => {});
    });
  });
  isCloning = false;
}
var isCloningLegacy = false;
function clone(oldEl, newEl) {
  if (!newEl._x_dataStack)
    newEl._x_dataStack = oldEl._x_dataStack;
  isCloning = true;
  isCloningLegacy = true;
  dontRegisterReactiveSideEffects(() => {
    cloneTree(newEl);
  });
  isCloning = false;
  isCloningLegacy = false;
}
function cloneTree(el) {
  let hasRunThroughFirstEl = false;
  let shallowWalker = (el2, callback) => {
    walk(el2, (el3, skip) => {
      if (hasRunThroughFirstEl && isRoot(el3))
        return skip();
      hasRunThroughFirstEl = true;
      callback(el3, skip);
    });
  };
  initTree(el, shallowWalker);
}
function dontRegisterReactiveSideEffects(callback) {
  let cache = effect4;
  overrideEffect((callback2, el) => {
    let storedEffect = cache(callback2);
    release(storedEffect);
    return () => {};
  });
  callback();
  overrideEffect(cache);
}
var activeDefers = 0;
function deferInit(el, promise) {
  let record = el._x_deferInit;
  if (!record) {
    record = el._x_deferInit = {
      pending: 0,
      ownsIgnore: !el._x_ignore,
      queuedAttributes: /* @__PURE__ */ new Map
    };
    if (record.ownsIgnore)
      el._x_ignore = true;
    activeDefers++;
  }
  record.pending++;
  Promise.resolve(promise).catch((error2) => {
    try {
      handleError(error2, el);
    } catch (error3) {
      setTimeout(() => {
        throw error3;
      }, 0);
    }
  }).then(() => settle(el, record));
}
function settle(el, record) {
  record.pending--;
  if (record.pending > 0)
    return;
  flushPendingMutations();
  if (record.pending > 0)
    return;
  if (el._x_deferInit !== record)
    return;
  delete el._x_deferInit;
  if (record.ownsIgnore)
    delete el._x_ignore;
  activeDefers--;
  if (!el.isConnected)
    return;
  replayQueuedAttributes(record);
  initTree(el);
}
function queueAttributesForDeferredTree(el, attrs) {
  if (activeDefers === 0)
    return false;
  let root = findClosest(el, (i) => i._x_deferInit);
  if (!root)
    return false;
  queueInto(root._x_deferInit, el, attrs.map(({ name }) => name));
  return true;
}
function queueInto(record, el, names) {
  let entry = record.queuedAttributes.get(el);
  if (!entry || entry.marker !== el._x_marker) {
    entry = { marker: el._x_marker, names: /* @__PURE__ */ new Set };
    record.queuedAttributes.set(el, entry);
  }
  names.forEach((name) => entry.names.add(name));
}
function replayQueuedAttributes(record) {
  record.queuedAttributes.forEach((entry, el) => {
    if (!el.isConnected)
      return;
    if (!el._x_marker)
      return;
    if (el._x_marker !== entry.marker)
      return;
    let suspendedAncestor = findClosest(el, (i) => i._x_deferInit);
    if (suspendedAncestor) {
      queueInto(suspendedAncestor._x_deferInit, el, Array.from(entry.names));
      return;
    }
    let attrs = Array.from(entry.names).filter((name) => el.hasAttribute(name)).map((name) => ({ name, value: el.getAttribute(name) }));
    if (attrs.length === 0)
      return;
    directives(el, attrs).forEach((handle) => handle());
  });
}
interceptClone((from, to) => {
  if (activeDefers === 0)
    return;
  if (!from || from.nodeType !== 1 || !to || to.nodeType !== 1)
    return;
  if (findClosest(from, (i) => i._x_deferInit))
    to._x_ignore = true;
});
function dispatch(el, name, detail = {}, options = {}) {
  return el.dispatchEvent(new CustomEvent(name, {
    detail,
    bubbles: true,
    composed: true,
    cancelable: true,
    ...options
  }));
}
function warn(message, ...args) {
  console.warn(`Alpine Warning: ${message}`, ...args);
}
var started = false;
function start2() {
  if (started)
    warn("Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems.");
  started = true;
  if (!document.body)
    warn("Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?");
  dispatch(document, "alpine:init");
  dispatch(document, "alpine:initializing");
  startObservingMutations();
  onElAdded((el) => initTree(el, walk));
  onElRemoved((el) => destroyTree(el));
  onAttributesAdded((el, attrs) => {
    if (queueAttributesForDeferredTree(el, attrs))
      return;
    directives(el, attrs).forEach((handle) => handle());
  });
  let outNestedComponents = (el) => !closestRoot(el.parentElement, true);
  Array.from(document.querySelectorAll(allSelectors().join(","))).filter(outNestedComponents).forEach((el) => {
    initTree(el);
  });
  dispatch(document, "alpine:initialized");
  setTimeout(() => {
    warnAboutMissingPlugins();
  });
}
var rootSelectorCallbacks = [];
var initSelectorCallbacks = [];
function rootSelectors() {
  return rootSelectorCallbacks.map((fn2) => fn2());
}
function allSelectors() {
  return rootSelectorCallbacks.concat(initSelectorCallbacks).map((fn2) => fn2());
}
function addRootSelector(selectorCallback) {
  rootSelectorCallbacks.push(selectorCallback);
}
function addInitSelector(selectorCallback) {
  initSelectorCallbacks.push(selectorCallback);
}
function closestRoot(el, includeInitSelectors = false) {
  return findClosest(el, (element) => {
    const selectors = includeInitSelectors ? allSelectors() : rootSelectors();
    if (selectors.some((selector) => element.matches(selector)))
      return true;
  });
}
function findClosest(el, callback) {
  if (!el)
    return;
  if (callback(el))
    return el;
  if (el._x_teleportBack)
    return findClosest(el._x_teleportBack, callback);
  if (el.parentNode instanceof ShadowRoot) {
    return findClosest(el.parentNode.host, callback);
  }
  if (!el.parentElement)
    return;
  return findClosest(el.parentElement, callback);
}
function isRoot(el) {
  return rootSelectors().some((selector) => el.matches(selector));
}
var initInterceptors2 = [];
function interceptInit(callback) {
  initInterceptors2.push(callback);
}
var markerDispenser = 1;
function initTree(el, walker = walk, intercept = () => {}) {
  if (findClosest(el, (i) => i._x_ignore))
    return;
  deferHandlingDirectives(() => {
    walker(el, (el2, skip) => {
      if (el2._x_marker)
        return;
      intercept(el2, skip);
      initInterceptors2.forEach((i) => i(el2, skip));
      directives(el2, el2.attributes).forEach((handle) => handle());
      if (!el2._x_ignore)
        el2._x_marker = markerDispenser++;
      el2._x_ignore && skip();
    });
  });
}
function destroyTree(root, walker = walk) {
  walker(root, (el) => {
    cleanupElement(el);
    cleanupAttributes(el);
    delete el._x_marker;
  });
}
function warnAboutMissingPlugins() {
  let pluginDirectives = [
    ["ui", "dialog", ["[x-dialog], [x-popover]"]],
    ["anchor", "anchor", ["[x-anchor]"]],
    ["sort", "sort", ["[x-sort]"]]
  ];
  pluginDirectives.forEach(([plugin2, directive2, selectors]) => {
    if (directiveExists(directive2))
      return;
    selectors.some((selector) => {
      if (document.querySelector(selector)) {
        warn(`found "${selector}", but missing ${plugin2} plugin`);
        return true;
      }
    });
  });
}
var tickStack = [];
var isHolding = false;
function nextTick(callback = () => {}) {
  queueMicrotask(() => {
    isHolding || setTimeout(() => {
      releaseNextTicks();
    });
  });
  return new Promise((res) => {
    tickStack.push(() => {
      callback();
      res();
    });
  });
}
function releaseNextTicks() {
  isHolding = false;
  while (tickStack.length)
    tickStack.shift()();
}
function holdNextTicks() {
  isHolding = true;
}
function setClasses(el, value) {
  if (Array.isArray(value)) {
    return setClassesFromString(el, value.join(" "));
  } else if (typeof value === "object" && value !== null) {
    return setClassesFromObject(el, value);
  } else if (typeof value === "function") {
    return setClasses(el, value());
  }
  return setClassesFromString(el, value);
}
function splitClasses(classString) {
  return classString.split(/\s/).filter(Boolean);
}
function setClassesFromString(el, classString) {
  let missingClasses = (classString2) => splitClasses(classString2).filter((i) => !el.classList.contains(i)).filter(Boolean);
  let addClassesAndReturnUndo = (classes) => {
    el.classList.add(...classes);
    return () => {
      el.classList.remove(...classes);
    };
  };
  classString = classString === true ? classString = "" : classString || "";
  return addClassesAndReturnUndo(missingClasses(classString));
}
function setClassesFromObject(el, classObject) {
  let forAdd = Object.entries(classObject).flatMap(([classString, bool]) => bool ? splitClasses(classString) : false).filter(Boolean);
  let forRemove = Object.entries(classObject).flatMap(([classString, bool]) => !bool ? splitClasses(classString) : false).filter(Boolean);
  let added = [];
  let removed = [];
  forRemove.forEach((i) => {
    if (el.classList.contains(i)) {
      el.classList.remove(i);
      removed.push(i);
    }
  });
  forAdd.forEach((i) => {
    if (!el.classList.contains(i)) {
      el.classList.add(i);
      added.push(i);
    }
  });
  return () => {
    removed.forEach((i) => el.classList.add(i));
    added.forEach((i) => el.classList.remove(i));
  };
}
function setStyles(el, value) {
  if (typeof value === "object" && value !== null) {
    return setStylesFromObject(el, value);
  }
  return setStylesFromString(el, value);
}
function setStylesFromObject(el, value) {
  let previousStyles = {};
  Object.entries(value).forEach(([key, value2]) => {
    previousStyles[key] = el.style[key];
    if (!key.startsWith("--")) {
      key = kebabCase(key);
    }
    el.style.setProperty(key, value2);
  });
  setTimeout(() => {
    if (el.style.length === 0) {
      el.removeAttribute("style");
    }
  });
  return () => {
    setStyles(el, previousStyles);
  };
}
function setStylesFromString(el, value) {
  let cache = el.getAttribute("style", value);
  el.setAttribute("style", value);
  return () => {
    el.setAttribute("style", cache || "");
  };
}
function kebabCase(subject) {
  return subject.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function once(callback, fallback = () => {}) {
  let called = false;
  return function() {
    if (!called) {
      called = true;
      callback.apply(this, arguments);
    } else {
      fallback.apply(this, arguments);
    }
  };
}
directive("transition", (el, { value, modifiers: modifiers3, expression }, { evaluate: evaluate2 }) => {
  if (typeof expression === "function")
    expression = evaluate2(expression);
  if (expression === false)
    return;
  if (!expression || typeof expression === "boolean") {
    registerTransitionsFromHelper(el, modifiers3, value);
  } else {
    registerTransitionsFromClassString(el, expression, value);
  }
});
function registerTransitionsFromClassString(el, classString, stage) {
  registerTransitionObject(el, setClasses, "");
  let directiveStorageMap = {
    enter: (classes) => {
      el._x_transition.enter.during = classes;
    },
    "enter-start": (classes) => {
      el._x_transition.enter.start = classes;
    },
    "enter-end": (classes) => {
      el._x_transition.enter.end = classes;
    },
    leave: (classes) => {
      el._x_transition.leave.during = classes;
    },
    "leave-start": (classes) => {
      el._x_transition.leave.start = classes;
    },
    "leave-end": (classes) => {
      el._x_transition.leave.end = classes;
    }
  };
  directiveStorageMap[stage](classString);
}
function registerTransitionsFromHelper(el, modifiers3, stage) {
  registerTransitionObject(el, setStyles);
  let doesntSpecify = !modifiers3.includes("in") && !modifiers3.includes("out") && !stage;
  let transitioningIn = doesntSpecify || modifiers3.includes("in") || ["enter"].includes(stage);
  let transitioningOut = doesntSpecify || modifiers3.includes("out") || ["leave"].includes(stage);
  if (modifiers3.includes("in") && !doesntSpecify) {
    modifiers3 = modifiers3.filter((i, index) => index < modifiers3.indexOf("out"));
  }
  if (modifiers3.includes("out") && !doesntSpecify) {
    modifiers3 = modifiers3.filter((i, index) => index > modifiers3.indexOf("out"));
  }
  let wantsAll = !modifiers3.includes("opacity") && !modifiers3.includes("scale");
  let wantsOpacity = wantsAll || modifiers3.includes("opacity");
  let wantsScale = wantsAll || modifiers3.includes("scale");
  let opacityValue = wantsOpacity ? 0 : 1;
  let scaleValue = wantsScale ? modifierValue(modifiers3, "scale", 95) / 100 : 1;
  let delay = modifierValue(modifiers3, "delay", 0) / 1000;
  let origin = modifierValue(modifiers3, "origin", "center");
  let property = "opacity, transform";
  let durationIn = modifierValue(modifiers3, "duration", 150) / 1000;
  let durationOut = modifierValue(modifiers3, "duration", 75) / 1000;
  let easing = `cubic-bezier(0.4, 0.0, 0.2, 1)`;
  if (transitioningIn) {
    el._x_transition.enter.during = {
      transformOrigin: origin,
      transitionDelay: `${delay}s`,
      transitionProperty: property,
      transitionDuration: `${durationIn}s`,
      transitionTimingFunction: easing
    };
    el._x_transition.enter.start = {
      opacity: opacityValue,
      transform: `scale(${scaleValue})`
    };
    el._x_transition.enter.end = {
      opacity: 1,
      transform: `scale(1)`
    };
  }
  if (transitioningOut) {
    el._x_transition.leave.during = {
      transformOrigin: origin,
      transitionDelay: `${delay}s`,
      transitionProperty: property,
      transitionDuration: `${durationOut}s`,
      transitionTimingFunction: easing
    };
    el._x_transition.leave.start = {
      opacity: 1,
      transform: `scale(1)`
    };
    el._x_transition.leave.end = {
      opacity: opacityValue,
      transform: `scale(${scaleValue})`
    };
  }
}
function registerTransitionObject(el, setFunction, defaultValue = {}) {
  if (!el._x_transition)
    el._x_transition = {
      enter: { during: defaultValue, start: defaultValue, end: defaultValue },
      leave: { during: defaultValue, start: defaultValue, end: defaultValue },
      in(before = () => {}, after = () => {}) {
        transition(el, setFunction, {
          during: this.enter.during,
          start: this.enter.start,
          end: this.enter.end
        }, before, after);
      },
      out(before = () => {}, after = () => {}) {
        transition(el, setFunction, {
          during: this.leave.during,
          start: this.leave.start,
          end: this.leave.end
        }, before, after);
      }
    };
}
window.Element.prototype._x_toggleAndCascadeWithTransitions = function(el, value, show, hide2) {
  const nextTick2 = document.visibilityState === "visible" ? requestAnimationFrame : setTimeout;
  let clickAwayCompatibleShow = () => nextTick2(show);
  if (value) {
    if (el._x_transition && (el._x_transition.enter || el._x_transition.leave)) {
      el._x_transition.enter && (Object.entries(el._x_transition.enter.during).length || Object.entries(el._x_transition.enter.start).length || Object.entries(el._x_transition.enter.end).length) ? el._x_transition.in(show) : clickAwayCompatibleShow();
    } else {
      el._x_transition ? el._x_transition.in(show) : clickAwayCompatibleShow();
    }
    return;
  }
  el._x_hidePromise = el._x_transition ? new Promise((resolve, reject) => {
    el._x_transition.out(() => {}, () => resolve(hide2));
    el._x_transitioning && el._x_transitioning.beforeCancel(() => reject({ isFromCancelledTransition: true }));
  }) : Promise.resolve(hide2);
  queueMicrotask(() => {
    let closest2 = closestHide(el);
    if (closest2) {
      if (!closest2._x_hideChildren)
        closest2._x_hideChildren = [];
      closest2._x_hideChildren.push(el);
    } else {
      nextTick2(() => {
        let hideAfterChildren = (el2) => {
          let carry = Promise.all([
            el2._x_hidePromise,
            ...(el2._x_hideChildren || []).map(hideAfterChildren)
          ]).then(([i]) => i?.());
          delete el2._x_hidePromise;
          delete el2._x_hideChildren;
          return carry;
        };
        hideAfterChildren(el).catch((e) => {
          if (!e.isFromCancelledTransition)
            throw e;
        });
      });
    }
  });
};
function closestHide(el) {
  let parent = el.parentNode;
  if (!parent)
    return;
  return parent._x_hidePromise ? parent : closestHide(parent);
}
function transition(el, setFunction, { during, start: start22, end: end2 } = {}, before = () => {}, after = () => {}) {
  if (el._x_transitioning)
    el._x_transitioning.cancel();
  if (Object.keys(during).length === 0 && Object.keys(start22).length === 0 && Object.keys(end2).length === 0) {
    before();
    after();
    return;
  }
  let undoStart, undoDuring, undoEnd;
  performTransition(el, {
    start() {
      undoStart = setFunction(el, start22);
    },
    during() {
      undoDuring = setFunction(el, during);
    },
    before,
    end() {
      undoStart();
      undoEnd = setFunction(el, end2);
    },
    after,
    cleanup() {
      undoDuring();
      undoEnd();
    }
  });
}
function performTransition(el, stages) {
  let interrupted, reachedBefore, reachedEnd;
  let finish = once(() => {
    mutateDom(() => {
      interrupted = true;
      if (!reachedBefore)
        stages.before();
      if (!reachedEnd) {
        stages.end();
        releaseNextTicks();
      }
      stages.after();
      if (el.isConnected)
        stages.cleanup();
      delete el._x_transitioning;
    });
  });
  el._x_transitioning = {
    beforeCancels: [],
    beforeCancel(callback) {
      this.beforeCancels.push(callback);
    },
    cancel: once(function() {
      while (this.beforeCancels.length) {
        this.beforeCancels.shift()();
      }
      finish();
    }),
    finish
  };
  mutateDom(() => {
    stages.start();
    stages.during();
  });
  holdNextTicks();
  requestAnimationFrame(() => {
    if (interrupted)
      return;
    let duration = Number(getComputedStyle(el).transitionDuration.replace(/,.*/, "").replace("s", "")) * 1000;
    let delay = Number(getComputedStyle(el).transitionDelay.replace(/,.*/, "").replace("s", "")) * 1000;
    if (duration === 0)
      duration = Number(getComputedStyle(el).animationDuration.replace("s", "")) * 1000;
    mutateDom(() => {
      stages.before();
    });
    reachedBefore = true;
    requestAnimationFrame(() => {
      if (interrupted)
        return;
      mutateDom(() => {
        stages.end();
      });
      releaseNextTicks();
      setTimeout(el._x_transitioning.finish, duration + delay);
      reachedEnd = true;
    });
  });
}
function modifierValue(modifiers3, key, fallback) {
  if (modifiers3.indexOf(key) === -1)
    return fallback;
  const rawValue = modifiers3[modifiers3.indexOf(key) + 1];
  if (!rawValue)
    return fallback;
  if (key === "scale") {
    if (isNaN(rawValue))
      return fallback;
  }
  if (key === "duration" || key === "delay") {
    let match = rawValue.match(/([0-9]+)ms/);
    if (match)
      return match[1];
  }
  if (key === "origin") {
    if (["top", "right", "left", "center", "bottom"].includes(modifiers3[modifiers3.indexOf(key) + 2])) {
      return [rawValue, modifiers3[modifiers3.indexOf(key) + 2]].join(" ");
    }
  }
  return rawValue;
}
function bind(el, name, value, modifiers3 = []) {
  if (!el._x_bindings)
    el._x_bindings = reactive({});
  el._x_bindings[name] = value;
  name = modifiers3.includes("camel") ? camelCase(name) : name;
  switch (name) {
    case "value":
      bindInputValue(el, value);
      break;
    case "style":
      bindStyles(el, value);
      break;
    case "class":
      bindClasses(el, value);
      break;
    case "selected":
    case "checked":
      bindAttributeAndProperty(el, name, value);
      break;
    default:
      bindAttribute(el, name, value);
      break;
  }
}
function bindInputValue(el, value) {
  if (isRadio(el)) {
    if (el.attributes.value === undefined) {
      el.value = value;
    }
  } else if (isCheckbox(el)) {
    if (Number.isInteger(value)) {
      el.value = value;
    } else if (!Array.isArray(value) && typeof value !== "boolean" && ![null, undefined].includes(value)) {
      el.value = String(value);
    } else {
      if (Array.isArray(value)) {
        el.checked = value.some((val) => checkedAttrLooseCompare(val, el.value));
      } else {
        el.checked = !!value;
      }
    }
  } else if (el.tagName === "SELECT") {
    updateSelect(el, value);
  } else if (el.tagName === "OPTION") {
    bindAttribute(el, "value", value);
  } else {
    if (el.value === value && (typeof value !== "object" || value === null))
      return;
    el.value = value === undefined ? "" : value;
  }
}
function bindClasses(el, value) {
  if (el._x_undoAddedClasses)
    el._x_undoAddedClasses();
  el._x_undoAddedClasses = setClasses(el, value);
}
function bindStyles(el, value) {
  if (el._x_undoAddedStyles)
    el._x_undoAddedStyles();
  el._x_undoAddedStyles = setStyles(el, value);
}
function bindAttributeAndProperty(el, name, value) {
  bindAttribute(el, name, value);
  setPropertyIfChanged(el, name, value);
}
function bindAttribute(el, name, value) {
  if ([null, undefined, false].includes(value) && attributeShouldntBePreservedIfFalsy(name)) {
    el.removeAttribute(name);
  } else {
    if (isBooleanAttr(name))
      value = name;
    if (isObjectAttr(value))
      value = JSON.stringify(value);
    setIfChanged(el, name, value);
  }
}
function setIfChanged(el, attrName, value) {
  if (el.getAttribute(attrName) != value) {
    el.setAttribute(attrName, value);
  }
}
function setPropertyIfChanged(el, propName, value) {
  if (el[propName] !== value) {
    el[propName] = value;
  }
}
function updateSelect(el, value) {
  const arrayWrappedValue = [].concat(value).map((value2) => {
    return value2 + "";
  });
  Array.from(el.options).forEach((option) => {
    option.selected = arrayWrappedValue.includes(option.value);
  });
}
function camelCase(subject) {
  return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
}
function checkedAttrLooseCompare(valueA, valueB) {
  return valueA == valueB;
}
function safeParseBoolean(rawValue) {
  if ([1, "1", "true", "on", "yes", true].includes(rawValue)) {
    return true;
  }
  if ([0, "0", "false", "off", "no", false].includes(rawValue)) {
    return false;
  }
  return rawValue ? Boolean(rawValue) : null;
}
var booleanAttributes = /* @__PURE__ */ new Set([
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected",
  "shadowrootclonable",
  "shadowrootdelegatesfocus",
  "shadowrootserializable"
]);
function isBooleanAttr(attrName) {
  return booleanAttributes.has(attrName);
}
function attributeShouldntBePreservedIfFalsy(name) {
  return !["aria-pressed", "aria-checked", "aria-expanded", "aria-selected"].includes(name);
}
function isObjectAttr(value) {
  return typeof value === "object" && value !== null;
}
function getBinding(el, name, fallback) {
  if (el._x_bindings && el._x_bindings[name] !== undefined)
    return el._x_bindings[name];
  return getAttributeBinding(el, name, fallback);
}
function extractProp(el, name, fallback, extract = true) {
  if (el._x_bindings && el._x_bindings[name] !== undefined)
    return el._x_bindings[name];
  if (el._x_inlineBindings && el._x_inlineBindings[name] !== undefined) {
    let binding = el._x_inlineBindings[name];
    binding.extract = extract;
    return dontAutoEvaluateFunctions(() => {
      return evaluate(el, binding.expression);
    });
  }
  return getAttributeBinding(el, name, fallback);
}
function getAttributeBinding(el, name, fallback) {
  let attr = el.getAttribute(name);
  if (attr === null)
    return typeof fallback === "function" ? fallback() : fallback;
  if (attr === "")
    return true;
  if (isBooleanAttr(name)) {
    return !![name, "true"].includes(attr);
  }
  return attr;
}
function isCheckbox(el) {
  return el.type === "checkbox" || el.localName === "ui-checkbox" || el.localName === "ui-switch";
}
function isRadio(el) {
  return el.type === "radio" || el.localName === "ui-radio";
}
function debounce2(func, wait) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
function throttle(func, limit) {
  let inThrottle;
  return function() {
    let context = this, args = arguments;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
function entangle({ get: outerGet, set: outerSet }, { get: innerGet, set: innerSet }) {
  let firstRun = true;
  let outerHash;
  let innerHash;
  let reference2 = effect4(() => {
    let outer = outerGet();
    let inner = innerGet();
    if (firstRun) {
      innerSet(cloneIfObject(outer));
      firstRun = false;
    } else {
      let outerHashLatest = JSON.stringify(outer);
      let innerHashLatest = JSON.stringify(inner);
      if (outerHashLatest !== outerHash) {
        innerSet(cloneIfObject(outer));
      } else if (outerHashLatest !== innerHashLatest) {
        outerSet(cloneIfObject(inner));
      }
    }
    outerHash = JSON.stringify(outerGet());
    innerHash = JSON.stringify(innerGet());
  });
  return () => {
    release(reference2);
  };
}
function cloneIfObject(value) {
  return typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
}
function plugin(callback) {
  let callbacks = Array.isArray(callback) ? callback : [callback];
  callbacks.forEach((i) => i(alpine_default));
}
var stores = {};
var isReactive = false;
function store(name, value) {
  if (!isReactive) {
    stores = reactive(stores);
    isReactive = true;
  }
  if (value === undefined) {
    return stores[name];
  }
  stores[name] = value;
  if (typeof value === "object" && value !== null && value._x_interceptor) {
    stores[name] = value.initialize(stores, name, name, () => {});
  } else {
    initInterceptors(stores[name]);
  }
  if (typeof value === "object" && value !== null && value.hasOwnProperty("init") && typeof value.init === "function") {
    stores[name].init();
  }
}
function getStores() {
  return stores;
}
var binds = {};
function bind2(name, bindings) {
  let getBindings = typeof bindings !== "function" ? () => bindings : bindings;
  if (name instanceof Element) {
    return applyBindingsObject(name, getBindings());
  } else {
    binds[name] = getBindings;
  }
  return () => {};
}
function injectBindingProviders(obj) {
  Object.entries(binds).forEach(([name, callback]) => {
    Object.defineProperty(obj, name, {
      get() {
        return (...args) => {
          return callback(...args);
        };
      }
    });
  });
  return obj;
}
function applyBindingsObject(el, obj, original) {
  let cleanupRunners = [];
  while (cleanupRunners.length)
    cleanupRunners.pop()();
  let attributes = Object.entries(obj).map(([name, value]) => ({ name, value }));
  let staticAttributes = attributesOnly(attributes);
  attributes = attributes.map((attribute) => {
    if (staticAttributes.find((attr) => attr.name === attribute.name)) {
      return {
        name: `x-bind:${attribute.name}`,
        value: `"${attribute.value}"`
      };
    }
    return attribute;
  });
  directives(el, attributes, original).map((handle) => {
    cleanupRunners.push(handle.runCleanups);
    handle();
  });
  return () => {
    while (cleanupRunners.length)
      cleanupRunners.pop()();
  };
}
var datas = {};
function data(name, callback) {
  datas[name] = callback;
}
function injectDataProviders(obj, context) {
  Object.entries(datas).forEach(([name, callback]) => {
    Object.defineProperty(obj, name, {
      get() {
        return (...args) => {
          return callback.bind(context)(...args);
        };
      },
      enumerable: false
    });
  });
  return obj;
}
var Alpine = {
  get reactive() {
    return reactive;
  },
  get release() {
    return release;
  },
  get effect() {
    return effect4;
  },
  get raw() {
    return raw;
  },
  get transaction() {
    return transaction;
  },
  version: "3.17.2",
  flushAndStopDeferringMutations,
  dontAutoEvaluateFunctions,
  disableEffectScheduling,
  startObservingMutations,
  stopObservingMutations,
  setReactivityEngine,
  onAttributeRemoved,
  onAttributesAdded,
  closestDataStack,
  skipDuringClone,
  onlyDuringClone,
  addRootSelector,
  addInitSelector,
  setErrorHandler,
  interceptClone,
  addScopeToNode,
  deferMutations,
  mapAttributes,
  evaluateLater,
  interceptInit,
  initInterceptors,
  injectMagics,
  setEvaluator,
  setRawEvaluator,
  mergeProxies,
  extractProp,
  findClosest,
  onElRemoved,
  closestRoot,
  destroyTree,
  interceptor,
  transition,
  setStyles,
  mutateDom,
  deferInit,
  directive,
  entangle,
  throttle,
  debounce: debounce2,
  evaluate,
  evaluateRaw,
  initTree,
  nextTick,
  prefixed: prefix,
  prefix: setPrefix,
  plugin,
  magic,
  store,
  start: start2,
  clone,
  cloneNode,
  bound: getBinding,
  $data: scope,
  watch,
  walk,
  data,
  bind: bind2
};
var alpine_default = Alpine;
function makeMap(str2) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str2.split(","))
    map[key] = 1;
  return (val) => (val in map);
}
var EMPTY_OBJ = Object.freeze({});
var EMPTY_ARR = Object.freeze([]);
var extend = Object.assign;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var hasOwn = (val, key) => hasOwnProperty.call(val, key);
var isArray = Array.isArray;
var isMap = (val) => toTypeString(val) === "[object Map]";
var isString = (val) => typeof val === "string";
var isSymbol = (val) => typeof val === "symbol";
var isObject = (val) => val !== null && typeof val === "object";
var objectToString = Object.prototype.toString;
var toTypeString = (value) => objectToString.call(value);
var toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
var cacheStringFunction = (fn2) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str2) => {
    const hit = cache[str2];
    return hit || (cache[str2] = fn2(str2));
  };
};
var camelizeRE = /-\w/g;
var camelize = cacheStringFunction((str2) => {
  return str2.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
});
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cacheStringFunction((str2) => str2.replace(hyphenateRE, "-$1").toLowerCase());
var capitalize = cacheStringFunction((str2) => {
  return str2.charAt(0).toUpperCase() + str2.slice(1);
});
var toHandlerKey = cacheStringFunction((str2) => {
  const s = str2 ? `on${capitalize(str2)}` : ``;
  return s;
});
var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
var isBooleanAttr2 = /* @__PURE__ */ makeMap(specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,inert,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`);
function warn2(msg, ...args) {
  console.warn(`[Vue warn] ${msg}`, ...args);
}
var activeEffectScope;
var activeSub;
var pausedQueueEffects = /* @__PURE__ */ new WeakSet;
var ReactiveEffect = class {
  constructor(fn2) {
    this.fn = fn2;
    this.deps = undefined;
    this.depsTail = undefined;
    this.flags = 1 | 4;
    this.next = undefined;
    this.cleanup = undefined;
    this.scheduler = undefined;
    if (activeEffectScope) {
      if (activeEffectScope.active) {
        activeEffectScope.effects.push(this);
      } else {
        this.flags &= -2;
      }
    }
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    if (this.flags & 64) {
      this.flags &= -65;
      if (pausedQueueEffects.has(this)) {
        pausedQueueEffects.delete(this);
        this.trigger();
      }
    }
  }
  notify() {
    if (this.flags & 2 && !(this.flags & 32)) {
      return;
    }
    if (!(this.flags & 8)) {
      batch(this);
    }
  }
  run() {
    if (!(this.flags & 1)) {
      return this.fn();
    }
    this.flags |= 2;
    cleanupEffect(this);
    prepareDeps(this);
    const prevEffect = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = this;
    shouldTrack = true;
    try {
      return this.fn();
    } finally {
      if (activeSub !== this) {
        warn2("Active effect was not restored correctly - this is likely a Vue internal bug.");
      }
      cleanupDeps(this);
      activeSub = prevEffect;
      shouldTrack = prevShouldTrack;
      this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let link = this.deps;link; link = link.nextDep) {
        removeSub(link);
      }
      this.deps = this.depsTail = undefined;
      cleanupEffect(this);
      this.onStop && this.onStop();
      this.flags &= -2;
    }
  }
  trigger() {
    if (this.flags & 64) {
      pausedQueueEffects.add(this);
    } else if (this.scheduler) {
      this.scheduler();
    } else {
      this.runIfDirty();
    }
  }
  runIfDirty() {
    if (isDirty(this)) {
      this.run();
    }
  }
  get dirty() {
    return isDirty(this);
  }
};
var batchDepth = 0;
var batchedSub;
var batchedComputed;
function batch(sub, isComputed = false) {
  sub.flags |= 8;
  if (isComputed) {
    sub.next = batchedComputed;
    batchedComputed = sub;
    return;
  }
  sub.next = batchedSub;
  batchedSub = sub;
}
function startBatch() {
  batchDepth++;
}
function endBatch() {
  if (--batchDepth > 0) {
    return;
  }
  if (batchedComputed) {
    let e = batchedComputed;
    batchedComputed = undefined;
    while (e) {
      const next = e.next;
      e.next = undefined;
      e.flags &= -9;
      e = next;
    }
  }
  let error2;
  while (batchedSub) {
    let e = batchedSub;
    batchedSub = undefined;
    while (e) {
      const next = e.next;
      e.next = undefined;
      e.flags &= -9;
      if (e.flags & 1) {
        try {
          e.trigger();
        } catch (err) {
          if (!error2)
            error2 = err;
        }
      }
      e = next;
    }
  }
  if (error2)
    throw error2;
}
function prepareDeps(sub) {
  for (let link = sub.deps;link; link = link.nextDep) {
    link.version = -1;
    link.prevActiveLink = link.dep.activeLink;
    link.dep.activeLink = link;
  }
}
function cleanupDeps(sub) {
  let head;
  let tail = sub.depsTail;
  let link = tail;
  while (link) {
    const prev = link.prevDep;
    if (link.version === -1) {
      if (link === tail)
        tail = prev;
      removeSub(link);
      removeDep(link);
    } else {
      head = link;
    }
    link.dep.activeLink = link.prevActiveLink;
    link.prevActiveLink = undefined;
    link = prev;
  }
  sub.deps = head;
  sub.depsTail = tail;
}
function isDirty(sub) {
  for (let link = sub.deps;link; link = link.nextDep) {
    if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) {
      return true;
    }
  }
  if (sub._dirty) {
    return true;
  }
  return false;
}
function refreshComputed(computed) {
  if (computed.flags & 4 && !(computed.flags & 16)) {
    return;
  }
  computed.flags &= -17;
  if (computed.globalVersion === globalVersion) {
    return;
  }
  computed.globalVersion = globalVersion;
  if (!computed.isSSR && computed.flags & 128 && (!computed.deps && !computed._dirty || !isDirty(computed))) {
    return;
  }
  computed.flags |= 2;
  const dep = computed.dep;
  const prevSub = activeSub;
  const prevShouldTrack = shouldTrack;
  activeSub = computed;
  shouldTrack = true;
  try {
    prepareDeps(computed);
    const value = computed.fn(computed._value);
    if (dep.version === 0 || hasChanged(value, computed._value)) {
      computed.flags |= 128;
      computed._value = value;
      dep.version++;
    }
  } catch (err) {
    dep.version++;
    throw err;
  } finally {
    activeSub = prevSub;
    shouldTrack = prevShouldTrack;
    cleanupDeps(computed);
    computed.flags &= -3;
  }
}
function removeSub(link, soft = false) {
  const { dep, prevSub, nextSub } = link;
  if (prevSub) {
    prevSub.nextSub = nextSub;
    link.prevSub = undefined;
  }
  if (nextSub) {
    nextSub.prevSub = prevSub;
    link.nextSub = undefined;
  }
  if (dep.subsHead === link) {
    dep.subsHead = nextSub;
  }
  if (dep.subs === link) {
    dep.subs = prevSub;
    if (!prevSub && dep.computed) {
      dep.computed.flags &= -5;
      for (let l = dep.computed.deps;l; l = l.nextDep) {
        removeSub(l, true);
      }
    }
  }
  if (!soft && !--dep.sc && dep.map) {
    dep.map.delete(dep.key);
  }
}
function removeDep(link) {
  const { prevDep, nextDep } = link;
  if (prevDep) {
    prevDep.nextDep = nextDep;
    link.prevDep = undefined;
  }
  if (nextDep) {
    nextDep.prevDep = prevDep;
    link.nextDep = undefined;
  }
}
function effect22(fn2, options) {
  if (fn2.effect instanceof ReactiveEffect) {
    fn2 = fn2.effect.fn;
  }
  const e = new ReactiveEffect(fn2);
  if (options) {
    extend(e, options);
  }
  try {
    e.run();
  } catch (err) {
    e.stop();
    throw err;
  }
  const runner = e.run.bind(e);
  runner.effect = e;
  return runner;
}
function stop(runner) {
  runner.effect.stop();
}
var shouldTrack = true;
var trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === undefined ? true : last;
}
function cleanupEffect(e) {
  const { cleanup } = e;
  e.cleanup = undefined;
  if (cleanup) {
    const prevSub = activeSub;
    activeSub = undefined;
    try {
      cleanup();
    } finally {
      activeSub = prevSub;
    }
  }
}
var globalVersion = 0;
var Link = class {
  constructor(sub, dep) {
    this.sub = sub;
    this.dep = dep;
    this.version = dep.version;
    this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = undefined;
  }
};
var Dep = class {
  constructor(computed) {
    this.computed = computed;
    this.version = 0;
    this.activeLink = undefined;
    this.subs = undefined;
    this.map = undefined;
    this.key = undefined;
    this.sc = 0;
    this.__v_skip = true;
    if (true) {
      this.subsHead = undefined;
    }
  }
  track(debugInfo) {
    if (!activeSub || !shouldTrack || activeSub === this.computed) {
      return;
    }
    let link = this.activeLink;
    if (link === undefined || link.sub !== activeSub) {
      link = this.activeLink = new Link(activeSub, this);
      if (!activeSub.deps) {
        activeSub.deps = activeSub.depsTail = link;
      } else {
        link.prevDep = activeSub.depsTail;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
      }
      addSub(link);
    } else if (link.version === -1) {
      link.version = this.version;
      if (link.nextDep) {
        const next = link.nextDep;
        next.prevDep = link.prevDep;
        if (link.prevDep) {
          link.prevDep.nextDep = next;
        }
        link.prevDep = activeSub.depsTail;
        link.nextDep = undefined;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
        if (activeSub.deps === link) {
          activeSub.deps = next;
        }
      }
    }
    if (activeSub.onTrack) {
      activeSub.onTrack(extend({
        effect: activeSub
      }, debugInfo));
    }
    return link;
  }
  trigger(debugInfo) {
    this.version++;
    globalVersion++;
    this.notify(debugInfo);
  }
  notify(debugInfo) {
    startBatch();
    try {
      if (true) {
        for (let head = this.subsHead;head; head = head.nextSub) {
          if (head.sub.onTrigger && !(head.sub.flags & 8)) {
            head.sub.onTrigger(extend({
              effect: head.sub
            }, debugInfo));
          }
        }
      }
      for (let link = this.subs;link; link = link.prevSub) {
        if (link.sub.notify()) {
          link.sub.dep.notify();
        }
      }
    } finally {
      endBatch();
    }
  }
};
function addSub(link) {
  link.dep.sc++;
  if (link.sub.flags & 4) {
    const computed = link.dep.computed;
    if (computed && !link.dep.subs) {
      computed.flags |= 4 | 16;
      for (let l = computed.deps;l; l = l.nextDep) {
        addSub(l);
      }
    }
    const currentTail = link.dep.subs;
    if (currentTail !== link) {
      link.prevSub = currentTail;
      if (currentTail)
        currentTail.nextSub = link;
    }
    if (link.dep.subsHead === undefined) {
      link.dep.subsHead = link;
    }
    link.dep.subs = link;
  }
}
var targetMap = /* @__PURE__ */ new WeakMap;
var ITERATE_KEY = /* @__PURE__ */ Symbol("Object iterate");
var MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol("Map keys iterate");
var ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol("Array iterate");
function track(target, type, key) {
  if (shouldTrack && activeSub) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map);
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Dep);
      dep.map = depsMap;
      dep.key = key;
    }
    if (true) {
      dep.track({
        target,
        type,
        key
      });
    }
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    globalVersion++;
    return;
  }
  const run = (dep) => {
    if (dep) {
      if (true) {
        dep.trigger({
          target,
          type,
          key,
          newValue,
          oldValue,
          oldTarget
        });
      }
    }
  };
  startBatch();
  if (type === "clear") {
    depsMap.forEach(run);
  } else {
    const targetIsArray = isArray(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
          run(dep);
        }
      });
    } else {
      if (key !== undefined || depsMap.has(undefined)) {
        run(depsMap.get(key));
      }
      if (isArrayIndex) {
        run(depsMap.get(ARRAY_ITERATE_KEY));
      }
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isArrayIndex) {
            run(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            run(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
  }
  endBatch();
}
function reactiveReadArray(array) {
  const raw2 = toRaw(array);
  if (raw2 === array)
    return raw2;
  track(raw2, "iterate", ARRAY_ITERATE_KEY);
  return isShallow(array) ? raw2 : raw2.map(toReactive);
}
function shallowReadArray(arr) {
  track(arr = toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
function toWrapped(target, item) {
  if (isReadonly(target)) {
    return isReactive2(target) ? toReadonly(toReactive(item)) : toReadonly(item);
  }
  return toReactive(item);
}
var arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
  },
  concat(...args) {
    return reactiveReadArray(this).concat(...args.map((x) => isArray(x) ? reactiveReadArray(x) : x));
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toWrapped(this, value[1]);
      return value;
    });
  },
  every(fn2, thisArg) {
    return apply(this, "every", fn2, thisArg, undefined, arguments);
  },
  filter(fn2, thisArg) {
    return apply(this, "filter", fn2, thisArg, (v) => v.map((item) => toWrapped(this, item)), arguments);
  },
  find(fn2, thisArg) {
    return apply(this, "find", fn2, thisArg, (item) => toWrapped(this, item), arguments);
  },
  findIndex(fn2, thisArg) {
    return apply(this, "findIndex", fn2, thisArg, undefined, arguments);
  },
  findLast(fn2, thisArg) {
    return apply(this, "findLast", fn2, thisArg, (item) => toWrapped(this, item), arguments);
  },
  findLastIndex(fn2, thisArg) {
    return apply(this, "findLastIndex", fn2, thisArg, undefined, arguments);
  },
  forEach(fn2, thisArg) {
    return apply(this, "forEach", fn2, thisArg, undefined, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn2, thisArg) {
    return apply(this, "map", fn2, thisArg, undefined, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn2, ...args) {
    return reduce(this, "reduce", fn2, args);
  },
  reduceRight(fn2, ...args) {
    return reduce(this, "reduceRight", fn2, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  some(fn2, thisArg) {
    return apply(this, "some", fn2, thisArg, undefined, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", (item) => toWrapped(this, item));
  }
};
function iterator(self2, method, wrapValue) {
  const arr = shallowReadArray(self2);
  const iter = arr[method]();
  if (arr !== self2 && !isShallow(self2)) {
    iter._next = iter.next;
    iter.next = () => {
      const result = iter._next();
      if (!result.done) {
        result.value = wrapValue(result.value);
      }
      return result;
    };
  }
  return iter;
}
var arrayProto = Array.prototype;
function apply(self2, method, fn2, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !isShallow(self2);
  const methodFn = arr[method];
  if (methodFn !== arrayProto[method]) {
    const result2 = methodFn.apply(self2, args);
    return needsWrap ? toReactive(result2) : result2;
  }
  let wrappedFn = fn2;
  if (arr !== self2) {
    if (needsWrap) {
      wrappedFn = function(item, index) {
        return fn2.call(this, toWrapped(self2, item), index, self2);
      };
    } else if (fn2.length > 2) {
      wrappedFn = function(item, index) {
        return fn2.call(this, item, index, self2);
      };
    }
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self2, method, fn2, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !isShallow(self2);
  let wrappedFn = fn2;
  let wrapInitialAccumulator = false;
  if (arr !== self2) {
    if (needsWrap) {
      wrapInitialAccumulator = args.length === 0;
      wrappedFn = function(acc, item, index) {
        if (wrapInitialAccumulator) {
          wrapInitialAccumulator = false;
          acc = toWrapped(self2, acc);
        }
        return fn2.call(this, acc, toWrapped(self2, item), index, self2);
      };
    } else if (fn2.length > 3) {
      wrappedFn = function(acc, item, index) {
        return fn2.call(this, acc, item, index, self2);
      };
    }
  }
  const result = arr[method](wrappedFn, ...args);
  return wrapInitialAccumulator ? toWrapped(self2, result) : result;
}
function searchProxy(self2, method, args) {
  const arr = toRaw(self2);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && isProxy(args[0])) {
    args[0] = toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
function noTracking(self2, method, args = []) {
  pauseTracking();
  startBatch();
  const res = toRaw(self2)[method].apply(self2, args);
  endBatch();
  resetTracking();
  return res;
}
var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
var builtInSymbols = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol));
function hasOwnProperty2(key) {
  if (!isSymbol(key))
    key = String(key);
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
var BaseReactiveHandler = class {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip")
      return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2) {
      let fn2;
      if (targetIsArray && (fn2 = arrayInstrumentations[key])) {
        return fn2;
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty2;
      }
    }
    const res = Reflect.get(target, key, isRef(target) ? target : receiver);
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef(res)) {
      const value = targetIsArray && isIntegerKey(key) ? res : res.value;
      return isReadonly2 && isObject(value) ? readonly(value) : value;
    }
    if (isObject(res)) {
      return isReadonly2 ? readonly(res) : reactive2(res);
    }
    return res;
  }
};
var MutableReactiveHandler = class extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArrayWithIntegerKey && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          if (true) {
            warn2(`Set operation on key "${String(key)}" failed: target is readonly.`, target[key]);
          }
          return true;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(target, key, value, isRef(target) ? target : receiver);
    if (target === toRaw(receiver) && result) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value, oldValue);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, undefined, oldValue);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
    return Reflect.ownKeys(target);
  }
};
var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    if (true) {
      warn2(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
    }
    return true;
  }
  deleteProperty(target, key) {
    if (true) {
      warn2(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
    }
    return true;
  }
};
var mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler;
var readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler;
var toShallow = (value) => value;
var getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
    return extend(Object.create(innerIterator), {
      next() {
        const { value, done } = innerIterator.next();
        return done ? { value, done } : {
          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
          done
        };
      }
    });
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    if (true) {
      const key = args[0] ? `on key "${args[0]}" ` : ``;
      warn2(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
    }
    return type === "delete" ? false : type === "clear" ? undefined : this;
  };
}
function createInstrumentations(readonly2, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "get", key);
        }
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
      } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
      } else if (target !== rawTarget) {
        target.get(key);
      }
    },
    get size() {
      const target = this["__v_raw"];
      !readonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
      return target.size;
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "has", key);
        }
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = toRaw(target);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend(instrumentations, readonly2 ? {
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear")
  } : {
    add(value) {
      const target = toRaw(this);
      const proto = getProto(target);
      const rawValue = toRaw(value);
      const valueToAdd = !shallow && !isShallow(value) && !isReadonly(value) ? rawValue : value;
      const hadKey = proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue);
      if (!hadKey) {
        target.add(valueToAdd);
        trigger(target, "add", valueToAdd, valueToAdd);
      }
      return this;
    },
    set(key, value) {
      if (!shallow && !isShallow(value) && !isReadonly(value)) {
        value = toRaw(value);
      }
      const target = toRaw(this);
      const { has, get: get2 } = getProto(target);
      let hadKey = has.call(target, key);
      if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
      } else if (true) {
        checkIdentityKeys(target, has, key);
      }
      const oldValue = get2.call(target, key);
      target.set(key, value);
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value, oldValue);
      }
      return this;
    },
    delete(key) {
      const target = toRaw(this);
      const { has, get: get2 } = getProto(target);
      let hadKey = has.call(target, key);
      if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
      } else if (true) {
        checkIdentityKeys(target, has, key);
      }
      const oldValue = get2 ? get2.call(target, key) : undefined;
      const result = target.delete(key);
      if (hadKey) {
        trigger(target, "delete", key, undefined, oldValue);
      }
      return result;
    },
    clear() {
      const target = toRaw(this);
      const hadItems = target.size !== 0;
      const oldTarget = isMap(target) ? new Map(target) : new Set(target);
      const result = target.clear();
      if (hadItems) {
        trigger(target, "clear", undefined, undefined, oldTarget);
      }
      return result;
    }
  });
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly2, shallow);
  });
  return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
  };
}
var mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
var readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
function checkIdentityKeys(target, has, key) {
  const rawKey = toRaw(key);
  if (rawKey !== key && has.call(target, rawKey)) {
    const type = toRawType(target);
    warn2(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
  }
}
var reactiveMap = /* @__PURE__ */ new WeakMap;
var shallowReactiveMap = /* @__PURE__ */ new WeakMap;
var readonlyMap = /* @__PURE__ */ new WeakMap;
var shallowReadonlyMap = /* @__PURE__ */ new WeakMap;
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function reactive2(target) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return target;
  }
  return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    if (true) {
      warn2(`value cannot be made ${isReadonly2 ? "readonly" : "reactive"}: ${String(target)}`);
    }
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  if (target["__v_skip"] || !Object.isExtensible(target)) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = targetTypeMap(toRawType(target));
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}
function isReactive2(value) {
  if (/* @__PURE__ */ isReadonly(value)) {
    return /* @__PURE__ */ isReactive2(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
function toRaw(observed) {
  const raw2 = observed && observed["__v_raw"];
  return raw2 ? /* @__PURE__ */ toRaw(raw2) : observed;
}
var toReactive = (value) => isObject(value) ? /* @__PURE__ */ reactive2(value) : value;
var toReadonly = (value) => isObject(value) ? /* @__PURE__ */ readonly(value) : value;
function isRef(r) {
  return r ? r["__v_isRef"] === true : false;
}
magic("nextTick", () => nextTick);
magic("dispatch", (el) => dispatch.bind(dispatch, el));
magic("watch", (el, { evaluateLater: evaluateLater2, cleanup }) => (key, callback) => {
  let evaluate2 = evaluateLater2(key);
  let getter = () => {
    let value;
    evaluate2((i) => value = i);
    return value;
  };
  let unwatch = watch(getter, callback);
  cleanup(unwatch);
});
magic("store", getStores);
magic("data", (el) => scope(el));
magic("root", (el) => closestRoot(el));
magic("refs", (el) => {
  if (el._x_refs_proxy)
    return el._x_refs_proxy;
  el._x_refs_proxy = mergeProxies(getArrayOfRefObject(el));
  return el._x_refs_proxy;
});
function getArrayOfRefObject(el) {
  let refObjects = [];
  findClosest(el, (i) => {
    if (i._x_refs)
      refObjects.push(i._x_refs);
  });
  return refObjects;
}
var globalIdMemo = {};
function findAndIncrementId(name) {
  if (!globalIdMemo[name])
    globalIdMemo[name] = 0;
  return ++globalIdMemo[name];
}
function closestIdRoot(el, name) {
  return findClosest(el, (element) => {
    if (element._x_ids && element._x_ids[name])
      return true;
  });
}
function setIdRoot(el, name) {
  if (!el._x_ids)
    el._x_ids = {};
  if (!el._x_ids[name])
    el._x_ids[name] = findAndIncrementId(name);
}
magic("id", (el, { cleanup }) => (name, key = null) => {
  let cacheKey = `${name}${key ? `-${key}` : ""}`;
  return cacheIdByNameOnElement(el, cacheKey, cleanup, () => {
    let root = closestIdRoot(el, name);
    let id = root ? root._x_ids[name] : findAndIncrementId(name);
    return key ? `${name}-${id}-${key}` : `${name}-${id}`;
  });
});
interceptClone((from, to) => {
  if (from._x_id) {
    to._x_id = from._x_id;
  }
});
function cacheIdByNameOnElement(el, cacheKey, cleanup, callback) {
  if (!el._x_id)
    el._x_id = {};
  if (el._x_id[cacheKey])
    return el._x_id[cacheKey];
  let output = callback();
  el._x_id[cacheKey] = output;
  cleanup(() => {
    delete el._x_id[cacheKey];
  });
  return output;
}
magic("el", (el) => el);
warnMissingPluginMagic("Focus", "focus", "focus");
warnMissingPluginMagic("Persist", "persist", "persist");
function warnMissingPluginMagic(name, magicName, slug) {
  magic(magicName, (el) => warn(`You can't use [$${magicName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el));
}
directive("modelable", (el, { expression }, { effect: effect32, evaluateLater: evaluateLater2, cleanup }) => {
  let func = evaluateLater2(expression);
  let innerGet = () => {
    let result;
    func((i) => result = i);
    return result;
  };
  let evaluateInnerSet = evaluateLater2(`${expression} = __placeholder`);
  let innerSet = (val) => evaluateInnerSet(() => {}, { scope: { __placeholder: val } });
  let initialValue = innerGet();
  innerSet(initialValue);
  queueMicrotask(() => {
    if (!el._x_model)
      return;
    el._x_removeModelListeners["default"]();
    let outerGet = el._x_model.get;
    let outerSet = el._x_model.setWithModifiers;
    let releaseEntanglement = entangle({
      get() {
        return outerGet();
      },
      set(value) {
        outerSet(value);
      }
    }, {
      get() {
        return innerGet();
      },
      set(value) {
        innerSet(value);
      }
    });
    cleanup(releaseEntanglement);
  });
});
directive("teleport", (el, { modifiers: modifiers3, expression }, { cleanup }) => {
  if (el.tagName.toLowerCase() !== "template")
    warn("x-teleport can only be used on a <template> tag", el);
  let target = getTarget2(expression);
  let clone2 = el.content.cloneNode(true).firstElementChild;
  el._x_teleport = clone2;
  clone2._x_teleportBack = el;
  el.setAttribute("data-teleport-template", true);
  clone2.setAttribute("data-teleport-target", true);
  if (el._x_forwardEvents) {
    el._x_forwardEvents.forEach((eventName) => {
      clone2.addEventListener(eventName, (e) => {
        e.stopPropagation();
        el.dispatchEvent(new e.constructor(e.type, e));
      });
    });
  }
  addScopeToNode(clone2, {}, el);
  let placeInDom = (clone3, target2, modifiers22) => {
    if (modifiers22.includes("prepend")) {
      target2.parentNode.insertBefore(clone3, target2);
    } else if (modifiers22.includes("append")) {
      target2.parentNode.insertBefore(clone3, target2.nextSibling);
    } else {
      target2.appendChild(clone3);
    }
  };
  mutateDom(() => {
    skipDuringClone(() => {
      placeInDom(clone2, target, modifiers3);
      initTree(clone2);
    })();
  });
  el._x_teleportPutBack = () => {
    let target2 = getTarget2(expression);
    mutateDom(() => {
      placeInDom(el._x_teleport, target2, modifiers3);
    });
  };
  cleanup(() => mutateDom(() => {
    clone2.remove();
    destroyTree(clone2);
  }));
});
var teleportContainerDuringClone = document.createElement("div");
function getTarget2(expression) {
  let target = skipDuringClone(() => {
    return document.querySelector(expression);
  }, () => {
    return teleportContainerDuringClone;
  })();
  if (!target)
    warn(`Cannot find x-teleport element for selector: "${expression}"`);
  return target;
}
var handler = () => {};
handler.inline = (el, { modifiers: modifiers3 }, { cleanup }) => {
  modifiers3.includes("self") ? el._x_ignoreSelf = true : el._x_ignore = true;
  cleanup(() => {
    modifiers3.includes("self") ? delete el._x_ignoreSelf : delete el._x_ignore;
  });
};
directive("ignore", handler);
directive("effect", skipDuringClone((el, { expression }, { effect: effect32 }) => {
  effect32(evaluateLater(el, expression));
}));
function on(el, event, modifiers3, callback) {
  let listenerTarget = el;
  let handler4 = (e) => callback(e);
  let options = {};
  let wrapHandler = (callback2, wrapper) => (e) => wrapper(callback2, e);
  if (modifiers3.includes("dot"))
    event = dotSyntax(event);
  if (modifiers3.includes("camel"))
    event = camelCase2(event);
  if (modifiers3.includes("capture"))
    options.capture = true;
  if (modifiers3.includes("window"))
    listenerTarget = window;
  if (modifiers3.includes("document"))
    listenerTarget = document;
  if (modifiers3.includes("passive")) {
    options.passive = modifiers3[modifiers3.indexOf("passive") + 1] !== "false";
  }
  handler4 = addDebounceOrThrottle(modifiers3, handler4);
  if (modifiers3.includes("prevent"))
    handler4 = wrapHandler(handler4, (next, e) => {
      e.preventDefault();
      next(e);
    });
  if (modifiers3.includes("stop"))
    handler4 = wrapHandler(handler4, (next, e) => {
      e.stopPropagation();
      next(e);
    });
  if (modifiers3.includes("once")) {
    handler4 = wrapHandler(handler4, (next, e) => {
      next(e);
      listenerTarget.removeEventListener(event, handler4, options);
    });
  }
  if (modifiers3.includes("away") || modifiers3.includes("outside")) {
    listenerTarget = document;
    handler4 = wrapHandler(handler4, (next, e) => {
      if (el.contains(e.target))
        return;
      if (e.target.isConnected === false)
        return;
      if (el.offsetWidth < 1 && el.offsetHeight < 1)
        return;
      if (el._x_isShown === false)
        return;
      next(e);
    });
  }
  if (modifiers3.includes("self"))
    handler4 = wrapHandler(handler4, (next, e) => {
      e.target === el && next(e);
    });
  if (event === "submit") {
    handler4 = wrapHandler(handler4, (next, e) => {
      if (e.target._x_pendingModelUpdates) {
        e.target._x_pendingModelUpdates.forEach((fn2) => fn2());
      }
      next(e);
    });
  }
  if (isKeyEvent(event) || isClickEvent(event)) {
    handler4 = wrapHandler(handler4, (next, e) => {
      if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers3)) {
        return;
      }
      next(e);
    });
  }
  listenerTarget.addEventListener(event, handler4, options);
  return () => {
    listenerTarget.removeEventListener(event, handler4, options);
  };
}
function addDebounceOrThrottle(modifiers3, handler4) {
  if (modifiers3.includes("debounce")) {
    let nextModifier = modifiers3[modifiers3.indexOf("debounce") + 1] || "invalid-wait";
    let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
    handler4 = debounce2(handler4, wait);
  }
  if (modifiers3.includes("throttle")) {
    let nextModifier = modifiers3[modifiers3.indexOf("throttle") + 1] || "invalid-wait";
    let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
    handler4 = throttle(handler4, wait);
  }
  return handler4;
}
function dotSyntax(subject) {
  return subject.replace(/-/g, ".");
}
function camelCase2(subject) {
  return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
}
function isNumeric(subject) {
  return !Array.isArray(subject) && !isNaN(subject);
}
function kebabCase2(subject) {
  if ([" ", "_"].includes(subject))
    return subject;
  return subject.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]/, "-").toLowerCase();
}
function isKeyEvent(event) {
  return ["keydown", "keyup"].includes(event);
}
function isClickEvent(event) {
  return ["contextmenu", "click", "mouse"].some((i) => event.includes(i));
}
function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers3) {
  let keyModifiers = modifiers3.filter((i) => {
    return !["window", "document", "prevent", "stop", "once", "capture", "self", "away", "outside", "passive", "preserve-scroll", "blur", "change", "lazy"].includes(i);
  });
  if (keyModifiers.includes("debounce")) {
    let debounceIndex = keyModifiers.indexOf("debounce");
    keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
  }
  if (keyModifiers.includes("throttle")) {
    let debounceIndex = keyModifiers.indexOf("throttle");
    keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
  }
  if (keyModifiers.length === 0)
    return false;
  if (keyModifiers.length === 1 && keyToModifiers(e.key).includes(keyModifiers[0]))
    return false;
  const systemKeyModifiers = ["ctrl", "shift", "alt", "meta", "cmd", "super"];
  const selectedSystemKeyModifiers = systemKeyModifiers.filter((modifier) => keyModifiers.includes(modifier));
  keyModifiers = keyModifiers.filter((i) => !selectedSystemKeyModifiers.includes(i));
  if (selectedSystemKeyModifiers.length > 0) {
    const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter((modifier) => {
      if (modifier === "cmd" || modifier === "super")
        modifier = "meta";
      return e[`${modifier}Key`];
    });
    if (activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length) {
      if (isClickEvent(e.type))
        return false;
      if (keyToModifiers(e.key).includes(keyModifiers[0]))
        return false;
    }
  }
  return true;
}
function keyToModifiers(key) {
  if (!key)
    return [];
  key = kebabCase2(key);
  let modifierToKeyMap = {
    ctrl: "control",
    slash: "/",
    space: " ",
    spacebar: " ",
    cmd: "meta",
    esc: "escape",
    up: "arrow-up",
    down: "arrow-down",
    left: "arrow-left",
    right: "arrow-right",
    period: ".",
    comma: ",",
    equal: "=",
    minus: "-",
    underscore: "_"
  };
  modifierToKeyMap[key] = key;
  return Object.keys(modifierToKeyMap).map((modifier) => {
    if (modifierToKeyMap[modifier] === key)
      return modifier;
  }).filter((modifier) => modifier);
}
directive("model", (el, { modifiers: modifiers3, expression }, { effect: effect32, cleanup }) => {
  let scopeTarget = el;
  if (modifiers3.includes("parent")) {
    scopeTarget = findClosest(el, (element) => element !== el);
  }
  let evaluateGet = evaluateLater(scopeTarget, expression);
  let evaluateSet;
  if (typeof expression === "string") {
    evaluateSet = evaluateLater(scopeTarget, `${expression} = __placeholder`);
  } else if (typeof expression === "function" && typeof expression() === "string") {
    evaluateSet = evaluateLater(scopeTarget, `${expression()} = __placeholder`);
  } else {
    evaluateSet = () => {};
  }
  let getValue = () => {
    let result;
    evaluateGet((value) => result = value);
    return isGetterSetter(result) ? result.get() : result;
  };
  let setValue = (value) => {
    let result;
    evaluateGet((value2) => result = value2);
    if (isGetterSetter(result)) {
      result.set(value);
    } else {
      evaluateSet(() => {}, {
        scope: { __placeholder: value }
      });
    }
  };
  if (typeof expression === "string" && el.type === "radio") {
    mutateDom(() => {
      if (!el.hasAttribute("name"))
        el.setAttribute("name", expression);
    });
  }
  let hasChangeModifier = modifiers3.includes("change") || modifiers3.includes("lazy");
  let hasBlurModifier = modifiers3.includes("blur");
  let hasEnterModifier = modifiers3.includes("enter");
  let hasExplicitEventModifiers = hasChangeModifier || hasBlurModifier || hasEnterModifier;
  let removeListener;
  if (isCloning) {
    removeListener = () => {};
  } else if (hasExplicitEventModifiers) {
    let listeners = [];
    let syncValue = (e) => setValue(getInputValue(el, modifiers3, e, getValue()));
    if (hasChangeModifier) {
      listeners.push(on(el, "change", modifiers3, syncValue));
    }
    if (hasBlurModifier) {
      listeners.push(on(el, "blur", modifiers3, syncValue));
      if (el.form) {
        let form = el.form;
        let syncCallback = () => syncValue({ target: el });
        if (!form._x_pendingModelUpdates)
          form._x_pendingModelUpdates = [];
        form._x_pendingModelUpdates.push(syncCallback);
        cleanup(() => {
          if (form._x_pendingModelUpdates) {
            form._x_pendingModelUpdates.splice(form._x_pendingModelUpdates.indexOf(syncCallback), 1);
          }
        });
      }
    }
    if (hasEnterModifier) {
      listeners.push(on(el, "keydown", modifiers3, (e) => {
        if (e.key === "Enter")
          syncValue(e);
      }));
    }
    removeListener = () => listeners.forEach((remove2) => remove2());
  } else {
    let event = el.tagName.toLowerCase() === "select" || ["checkbox", "radio"].includes(el.type) ? "change" : "input";
    removeListener = on(el, event, modifiers3, (e) => {
      setValue(getInputValue(el, modifiers3, e, getValue()));
    });
  }
  if (modifiers3.includes("fill")) {
    if ([undefined, null, ""].includes(getValue()) || isCheckbox(el) && Array.isArray(getValue()) || el.tagName.toLowerCase() === "select" && el.multiple) {
      setValue(getInputValue(el, modifiers3, { target: el }, getValue()));
    }
  }
  if (!el._x_removeModelListeners)
    el._x_removeModelListeners = {};
  el._x_removeModelListeners["default"] = removeListener;
  cleanup(() => el._x_removeModelListeners["default"]());
  if (el.form) {
    let removeResetListener = on(el.form, "reset", [], (e) => {
      nextTick(() => el._x_model && el._x_model.set(getInputValue(el, modifiers3, { target: el }, getValue())));
    });
    cleanup(() => removeResetListener());
  }
  el._x_model = {
    get() {
      return getValue();
    },
    set(value) {
      setValue(value);
    },
    setWithModifiers: addDebounceOrThrottle(modifiers3, setValue)
  };
  el._x_forceModelUpdate = (value) => {
    if (value === undefined && typeof expression === "string" && expression.match(/\./))
      value = "";
    mutateDom(() => {
      if (isCheckbox(el)) {
        if (Array.isArray(value)) {
          el.checked = value.some((val) => val == el.value);
        } else {
          el.checked = !!value;
        }
      } else if (isRadio(el)) {
        if (typeof value === "boolean") {
          el.checked = safeParseBoolean(el.value) === value;
        } else {
          el.checked = el.value == value;
        }
      } else {
        bind(el, "value", value);
      }
    });
  };
  if (el.tagName === "SELECT") {
    let observer2 = new MutationObserver(() => {
      el._x_forceModelUpdate(getValue());
    });
    observer2.observe(el, { childList: true });
    cleanup(() => observer2.disconnect());
  }
  effect32(() => {
    let value = getValue();
    if (modifiers3.includes("unintrusive") && document.activeElement.isSameNode(el))
      return;
    el._x_forceModelUpdate(value);
  });
});
function getInputValue(el, modifiers3, event, currentValue) {
  return mutateDom(() => {
    if (event instanceof CustomEvent && event.detail !== undefined)
      return event.detail !== null && event.detail !== undefined ? event.detail : event.target.value;
    else if (isCheckbox(el)) {
      if (Array.isArray(currentValue)) {
        let newValue = null;
        if (modifiers3.includes("number")) {
          newValue = safeParseNumber(event.target.value);
        } else if (modifiers3.includes("boolean")) {
          newValue = safeParseBoolean(event.target.value);
        } else {
          newValue = event.target.value;
        }
        return event.target.checked ? currentValue.includes(newValue) ? currentValue : currentValue.concat([newValue]) : currentValue.filter((el2) => !checkedAttrLooseCompare2(el2, newValue));
      } else {
        return event.target.checked;
      }
    } else if (el.tagName.toLowerCase() === "select" && el.multiple) {
      if (modifiers3.includes("number")) {
        return Array.from(event.target.selectedOptions).map((option) => {
          let rawValue = option.value || option.text;
          return safeParseNumber(rawValue);
        });
      } else if (modifiers3.includes("boolean")) {
        return Array.from(event.target.selectedOptions).map((option) => {
          let rawValue = option.value || option.text;
          return safeParseBoolean(rawValue);
        });
      }
      return Array.from(event.target.selectedOptions).map((option) => {
        return option.value || option.text;
      });
    } else {
      let newValue;
      if (isRadio(el)) {
        if (event.target.checked) {
          newValue = event.target.value;
        } else {
          newValue = currentValue;
        }
      } else {
        newValue = event.target.value;
      }
      if (modifiers3.includes("number")) {
        return safeParseNumber(newValue);
      } else if (modifiers3.includes("boolean")) {
        return safeParseBoolean(newValue);
      } else if (modifiers3.includes("trim")) {
        return newValue.trim();
      } else {
        return newValue;
      }
    }
  });
}
function safeParseNumber(rawValue) {
  let number = rawValue ? parseFloat(rawValue) : null;
  return isNumeric2(number) ? number : rawValue;
}
function checkedAttrLooseCompare2(valueA, valueB) {
  return valueA == valueB;
}
function isNumeric2(subject) {
  return !Array.isArray(subject) && !isNaN(subject);
}
function isGetterSetter(value) {
  return value !== null && typeof value === "object" && typeof value.get === "function" && typeof value.set === "function";
}
directive("cloak", (el) => queueMicrotask(() => mutateDom(() => el.removeAttribute(prefix("cloak")))));
addInitSelector(() => `[${prefix("init")}]`);
directive("init", skipDuringClone((el, { expression }, { evaluate: evaluate2 }) => {
  if (typeof expression === "string") {
    return !!expression.trim() && evaluate2(expression, {}, false);
  }
  return evaluate2(expression, {}, false);
}));
directive("text", (el, { expression }, { effect: effect32, evaluateLater: evaluateLater2 }) => {
  let evaluate2 = evaluateLater2(expression);
  effect32(() => {
    evaluate2((value) => {
      mutateDom(() => {
        el.textContent = value;
      });
    });
  });
});
directive("html", (el, { expression }, { effect: effect32, evaluateLater: evaluateLater2 }) => {
  let evaluate2 = evaluateLater2(expression);
  effect32(() => {
    evaluate2((value) => {
      mutateDom(() => {
        Array.from(el.children).forEach((child) => destroyTree(child));
        el.innerHTML = value ?? "";
        el._x_ignoreSelf = true;
        initTree(el);
        delete el._x_ignoreSelf;
      });
    });
  }, { priority: "structural" });
});
mapAttributes(startingWith(":", into(prefix("bind:"))));
var handler2 = (el, { value, modifiers: modifiers3, expression, original }, { effect: effect32, cleanup }) => {
  if (!value) {
    let bindingProviders = {};
    injectBindingProviders(bindingProviders);
    let getBindings = evaluateLater(el, expression);
    getBindings((bindings) => {
      applyBindingsObject(el, bindings, original);
    }, { scope: bindingProviders });
    return;
  }
  if (value === "key")
    return storeKeyForXFor(el, expression);
  if (el._x_inlineBindings && el._x_inlineBindings[value] && el._x_inlineBindings[value].extract) {
    return;
  }
  let evaluate2 = evaluateLater(el, expression);
  effect32(() => evaluate2((result) => {
    if (result === undefined && typeof expression === "string" && expression.match(/\./)) {
      result = "";
    }
    mutateDom(() => bind(el, value, result, modifiers3));
  }));
  cleanup(() => {
    el._x_undoAddedClasses && el._x_undoAddedClasses();
    el._x_undoAddedStyles && el._x_undoAddedStyles();
  });
};
handler2.inline = (el, { value, modifiers: modifiers3, expression }) => {
  if (!value)
    return;
  if (!el._x_inlineBindings)
    el._x_inlineBindings = {};
  el._x_inlineBindings[value] = { expression, extract: false };
};
directive("bind", handler2);
function storeKeyForXFor(el, expression) {
  el._x_keyExpression = expression;
}
addRootSelector(() => `[${prefix("data")}]`);
var dataForReconciliation = Symbol();
directive("data", (el, { expression }, { cleanup }) => {
  if (shouldSkipRegisteringDataDuringClone(el))
    return;
  let dataToReconcile = el[dataForReconciliation];
  if (dataToReconcile?.expression === expression)
    return;
  expression = expression === "" ? "{}" : expression;
  let magicContext = {};
  injectMagics(magicContext, el);
  let dataProviderContext = {};
  injectDataProviders(dataProviderContext, magicContext);
  let data2 = evaluate(el, expression, { scope: dataProviderContext });
  if (data2 === undefined || data2 === true)
    data2 = {};
  injectMagics(data2, el);
  let reactiveData;
  if (dataToReconcile?.reactiveData) {
    reactiveData = dataToReconcile.reactiveData;
    reconcileData(reactiveData, data2);
    let initialized = { expression };
    el[dataForReconciliation] = initialized;
    queueMicrotask(() => {
      if (el[dataForReconciliation] === initialized) {
        delete el[dataForReconciliation];
      }
    });
  } else {
    reactiveData = reactive(data2);
  }
  initInterceptors(reactiveData, cleanup);
  let undo = addScopeToNode(el, reactiveData);
  reactiveData["init"] && evaluate(el, reactiveData["init"]);
  cleanup(() => {
    reactiveData["destroy"] && evaluate(el, reactiveData["destroy"]);
    undo();
    let removed = { reactiveData };
    el[dataForReconciliation] = removed;
    queueMicrotask(() => {
      if (el[dataForReconciliation] === removed) {
        delete el[dataForReconciliation];
      }
    });
  });
});
function reconcileData(target, source) {
  Object.keys(source).forEach((key) => {
    let descriptor = Object.getOwnPropertyDescriptor(source, key);
    let existingDescriptor = Object.getOwnPropertyDescriptor(target, key);
    if (descriptor.get || descriptor.set || existingDescriptor?.get || existingDescriptor?.set) {
      if (existingDescriptor)
        delete target[key];
      if (!existingDescriptor)
        target[key] = undefined;
      descriptor.get || descriptor.set ? Object.defineProperty(target, key, descriptor) : target[key] = source[key];
    } else {
      target[key] = source[key];
    }
  });
  Object.keys(target).filter((key) => !Object.prototype.hasOwnProperty.call(source, key)).forEach((key) => delete target[key]);
}
interceptClone((from, to) => {
  if (from._x_dataStack) {
    to._x_dataStack = from._x_dataStack;
    to.setAttribute("data-has-alpine-state", true);
  }
});
function shouldSkipRegisteringDataDuringClone(el) {
  if (!isCloning)
    return false;
  if (isCloningLegacy)
    return true;
  return el.hasAttribute("data-has-alpine-state");
}
directive("show", (el, { modifiers: modifiers3, expression }, { effect: effect32 }) => {
  let evaluate2 = evaluateLater(el, expression);
  if (!el._x_doHide)
    el._x_doHide = () => {
      mutateDom(() => {
        el.style.setProperty("display", "none", modifiers3.includes("important") ? "important" : undefined);
      });
    };
  if (!el._x_doShow)
    el._x_doShow = () => {
      mutateDom(() => {
        if (el.style.length === 1 && el.style.display === "none") {
          el.removeAttribute("style");
        } else {
          el.style.removeProperty("display");
        }
      });
    };
  let hide2 = () => {
    el._x_doHide();
    el._x_isShown = false;
  };
  let show = () => {
    el._x_doShow();
    el._x_isShown = true;
  };
  let clickAwayCompatibleShow = () => setTimeout(show);
  let toggle = once((value) => value ? show() : hide2(), (value) => {
    if (typeof el._x_toggleAndCascadeWithTransitions === "function") {
      el._x_toggleAndCascadeWithTransitions(el, value, show, hide2);
    } else {
      value ? clickAwayCompatibleShow() : hide2();
    }
  });
  let oldValue;
  let firstTime = true;
  effect32(() => evaluate2((value) => {
    if (!firstTime && value === oldValue)
      return;
    if (modifiers3.includes("immediate"))
      value ? clickAwayCompatibleShow() : hide2();
    toggle(value);
    oldValue = value;
    firstTime = false;
  }));
});
directive("for", skipDuringClone((el, { expression }, { effect: effect32, cleanup }) => {
  let iteratorNames = parseForExpression(expression);
  let evaluateItems = evaluateLater(el, iteratorNames.items);
  let evaluateKey = evaluateLater(el, el._x_keyExpression || "index");
  el._x_lookup = /* @__PURE__ */ new Map;
  effect32(() => loop(el, iteratorNames, evaluateItems, evaluateKey), { priority: "structural" });
  cleanup(() => {
    el._x_lookup.forEach((el2) => mutateDom(() => {
      destroyTree(el2);
      el2.remove();
    }));
    delete el._x_lookup;
    delete el._x_lastRenderedEl;
  });
}));
function refreshScope(scope2) {
  return (newScope) => {
    Object.entries(newScope).forEach(([key, value]) => {
      scope2[key] = value;
    });
  };
}
function loop(templateEl, iteratorNames, evaluateItems, evaluateKey) {
  evaluateItems((items) => {
    if (isNumeric3(items))
      items = Array.from({ length: items }, (_, i) => i + 1);
    if (items === undefined || items === null)
      items = [];
    if (items instanceof Set)
      items = Array.from(items);
    if (items instanceof Map)
      items = Array.from(items);
    let oldLookup = templateEl._x_lookup;
    let lookup = /* @__PURE__ */ new Map;
    templateEl._x_lookup = lookup;
    let hasStringKeys = isObject2(items);
    let scopeEntries = Object.entries(items).map(([index, item]) => {
      if (!hasStringKeys)
        index = parseInt(index);
      let scope2 = getIterationScopeVariables(iteratorNames, item, index, items);
      let key;
      evaluateKey((innerKey) => {
        if (typeof innerKey === "object")
          warn("x-for key cannot be an object, it must be a string or an integer", templateEl);
        if (oldLookup.has(innerKey)) {
          lookup.set(innerKey, oldLookup.get(innerKey));
          oldLookup.delete(innerKey);
        }
        key = innerKey;
      }, { scope: { index, ...scope2 } });
      return [key, scope2];
    });
    mutateDom(() => {
      oldLookup.forEach((el) => {
        destroyTree(el);
        el.remove();
      });
      let added = /* @__PURE__ */ new Set;
      let prev = templateEl;
      scopeEntries.forEach(([key, scope2]) => {
        if (lookup.has(key)) {
          let el = lookup.get(key);
          el._x_refreshXForScope(scope2);
          if (prev.nextElementSibling !== el) {
            if (prev.nextElementSibling)
              el.replaceWith(prev.nextElementSibling);
            prev.after(el);
          }
          prev = el;
          if (el._x_currentIfEl) {
            if (el.nextElementSibling !== el._x_currentIfEl)
              prev.after(el._x_currentIfEl);
            prev = el._x_currentIfEl;
          }
          return;
        }
        if (templateEl.content.children.length > 1)
          warn("x-for templates require a single root element, additional elements will be ignored.", templateEl);
        let clone2 = document.importNode(templateEl.content, true).firstElementChild;
        let reactiveScope = reactive(scope2);
        addScopeToNode(clone2, reactiveScope, templateEl);
        clone2._x_refreshXForScope = refreshScope(reactiveScope);
        lookup.set(key, clone2);
        added.add(clone2);
        prev.after(clone2);
        prev = clone2;
      });
      added.forEach((clone2) => initTree(clone2));
      if (prev !== templateEl) {
        templateEl._x_lastRenderedEl = prev;
      } else {
        delete templateEl._x_lastRenderedEl;
      }
    });
  });
}
function parseForExpression(expression) {
  let forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
  let stripParensRE = /^\s*\(|\)\s*$/g;
  let forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
  let inMatch = expression.match(forAliasRE);
  if (!inMatch)
    return;
  let res = {};
  res.items = inMatch[2].trim();
  let item = inMatch[1].replace(stripParensRE, "").trim();
  let iteratorMatch = item.match(forIteratorRE);
  if (iteratorMatch) {
    res.item = item.replace(forIteratorRE, "").trim();
    res.index = iteratorMatch[1].trim();
    if (iteratorMatch[2]) {
      res.collection = iteratorMatch[2].trim();
    }
  } else {
    res.item = item;
  }
  return res;
}
function getIterationScopeVariables(iteratorNames, item, index, items) {
  let scopeVariables = {};
  if (/^\[.*\]$/.test(iteratorNames.item) && Array.isArray(item)) {
    let names = iteratorNames.item.replace("[", "").replace("]", "").split(",").map((i) => i.trim());
    names.forEach((name, i) => {
      scopeVariables[name] = item[i];
    });
  } else if (/^\{.*\}$/.test(iteratorNames.item) && !Array.isArray(item) && typeof item === "object") {
    let names = iteratorNames.item.replace("{", "").replace("}", "").split(",").map((i) => i.trim());
    names.forEach((name) => {
      scopeVariables[name] = item[name];
    });
  } else {
    scopeVariables[iteratorNames.item] = item;
  }
  if (iteratorNames.index)
    scopeVariables[iteratorNames.index] = index;
  if (iteratorNames.collection)
    scopeVariables[iteratorNames.collection] = items;
  return scopeVariables;
}
function isNumeric3(subject) {
  return typeof subject !== "object" && !isNaN(subject);
}
function isObject2(subject) {
  return typeof subject === "object" && !Array.isArray(subject);
}
function handler3() {}
handler3.inline = (el, { expression }, { cleanup }) => {
  let root = closestRoot(el);
  if (!root)
    return;
  if (!root._x_refs)
    root._x_refs = {};
  root._x_refs[expression] = el;
  cleanup(() => delete root._x_refs[expression]);
};
directive("ref", handler3);
directive("if", skipDuringClone((el, { expression }, { effect: effect32, cleanup }) => {
  if (el.tagName.toLowerCase() !== "template")
    warn("x-if can only be used on a <template> tag", el);
  let evaluate2 = evaluateLater(el, expression);
  let show = () => {
    if (el._x_currentIfEl)
      return el._x_currentIfEl;
    let clone2 = el.content.cloneNode(true).firstElementChild;
    addScopeToNode(clone2, {}, el);
    mutateDom(() => {
      el.after(clone2);
      initTree(clone2);
    });
    el._x_currentIfEl = clone2;
    el._x_lastRenderedEl = clone2;
    el._x_undoIf = () => {
      mutateDom(() => {
        destroyTree(clone2);
        clone2.remove();
      });
      delete el._x_currentIfEl;
      delete el._x_lastRenderedEl;
    };
    return clone2;
  };
  let hide2 = () => {
    if (!el._x_undoIf)
      return;
    el._x_undoIf();
    delete el._x_undoIf;
  };
  effect32(() => evaluate2((value) => {
    value ? show() : hide2();
  }), { priority: "structural" });
  cleanup(() => el._x_undoIf && el._x_undoIf());
}));
directive("id", (el, { expression }, { evaluate: evaluate2 }) => {
  let names = evaluate2(expression);
  names.forEach((name) => setIdRoot(el, name));
});
interceptClone((from, to) => {
  if (from._x_ids) {
    to._x_ids = from._x_ids;
  }
});
mapAttributes(startingWith("@", into(prefix("on:"))));
directive("on", skipDuringClone((el, { value, modifiers: modifiers3, expression }, { cleanup }) => {
  let evaluate2 = expression ? evaluateLater(el, expression) : () => {};
  if (el.tagName.toLowerCase() === "template") {
    if (!el._x_forwardEvents)
      el._x_forwardEvents = [];
    if (!el._x_forwardEvents.includes(value))
      el._x_forwardEvents.push(value);
  }
  let removeListener = on(el, value, modifiers3, (e) => {
    evaluate2(() => {}, { scope: { $event: e }, params: [e] });
  });
  cleanup(() => removeListener());
}));
warnMissingPluginDirective("Collapse", "collapse", "collapse");
warnMissingPluginDirective("Intersect", "intersect", "intersect");
warnMissingPluginDirective("Focus", "trap", "focus");
warnMissingPluginDirective("Mask", "mask", "mask");
function warnMissingPluginDirective(name, directiveName, slug) {
  directive(directiveName, (el) => warn(`You can't use [x-${directiveName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el));
}
alpine_default.setEvaluator(normalEvaluator);
alpine_default.setRawEvaluator(normalRawEvaluator);
alpine_default.setReactivityEngine({
  reactive: reactive2,
  effect: (callback, options = {}) => {
    let runner;
    runner = effect22(callback, {
      scheduler: () => {
        if (!runner)
          return;
        options.scheduler ? options.scheduler(runner) : runner();
      }
    });
    return runner;
  },
  release: stop,
  raw: toRaw
});
var src_default = alpine_default;
var module_default = src_default;
/*! Bundled license information:

@vue/shared/dist/shared.esm-bundler.js:
  (**
  * @vue/shared v3.5.41
  * (c) 2018-present Yuxi (Evan) You and Vue contributors
  * @license MIT
  **)

@vue/reactivity/dist/reactivity.esm-bundler.js:
  (**
  * @vue/reactivity v3.5.41
  * (c) 2018-present Yuxi (Evan) You and Vue contributors
  * @license MIT
  **)
*/

// static/src/main.js
window.htmx = htmx_esm_default;
window.Alpine = module_default;
module_default.start();

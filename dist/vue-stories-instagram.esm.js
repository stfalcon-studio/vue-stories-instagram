//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script = {
  name: "Stories",
  props: {
    stories: {
      type: Array,
      required: true,
    },
    duration: {
      type: Number,
      default: 3000,
    },
    currentIndex: {
      type: Number,
      default: 0,
    },
    showInnerContent: {
      type: Boolean,
      default: false,
    },
    showOuterContent: {
      type: Boolean,
      default: false,
    },
  },
  data: function () { return ({
    indexSelected: 0,
    difference: 0,
    key: 0,
    percent: 0,
    timer: 0,
    progress: 0,
    interval: 0,
    isPaused: false,
    newDur: 0,
    pausePer: 0,
    mobile: false,
  }); },
  computed: {
    isAllStoriesEnd: function isAllStoriesEnd() {
      return (
        this.indexSelected >= this.stories.length - 1 &&
        this.isCurrentAllImagesEnd
      );
    },
    isCurrentAllImagesEnd: function isCurrentAllImagesEnd() {
      return this.key >= this.stories[this.indexSelected].images.length - 1;
    },
  },
  mounted: function mounted() {
    if (process.client) {
      this.mobile = this.isMobile();
    }
  },
  methods: {
    isMobile: function isMobile() {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        return true;
      } else {
        return false;
      }
    },
    getSrc: function getSrc(story, index) {
      var viewedIndex = this.getLastViewedIndex(story);
      return index === this.indexSelected
        ? {
            url: story.images[this.key].url,
            type: story.images[this.key].type,
          }
        : {
            url: story.images[viewedIndex].url,
            type: story.images[viewedIndex].type,
          };
    },
    getNotViewedIndex: function getNotViewedIndex(story) {
      return story.images.findIndex(function (item) { return !item.viewed; });
    },
    getLastViewedIndex: function getLastViewedIndex(story) {
      var keyIndex = this.getNotViewedIndex(story);
      var index = story.images.length - 1;
      return keyIndex === -1 ? index : keyIndex;
    },
    selectSlide: function selectSlide(index) {
      this.isPaused = false;
      this.difference += this.indexSelected - index;
      this.stopVideo(this.stories[this.indexSelected].images[this.key].url);
      this.indexSelected = index;
      this.key = this.getLastViewedIndex(this.stories[this.indexSelected]);
      this.reset();
    },
    onAllStoriesEnd: function onAllStoriesEnd() {
      this.difference = 0;
      this.indexSelected = 0;
      this.key = 0;
      this.$emit("allStoriesEnd");
    },
    onCurrentAllImagesEnd: function onCurrentAllImagesEnd(index) {
      this.difference += index - (index + 1);
      this.stopVideo(this.stories[this.indexSelected].images[this.key].url);
      this.stories[index].images[this.key].viewed = true;
      this.indexSelected++;
      this.key = this.getLastViewedIndex(this.stories[this.indexSelected]);
      this.$emit("сurrentAllImagesEnd", index);
    },
    onCurrentImageEnd: function onCurrentImageEnd(index) {
      this.stories[index].images[this.key].viewed = true;
      this.$emit("сurrentImageEnd", this.key);
      this.key++;
    },
    next: function next(index) {
      var this$1 = this;

      this.isPaused = false;
      if (this.isAllStoriesEnd) {
        this.onAllStoriesEnd();
      } else if (this.isCurrentAllImagesEnd) {
        setTimeout(function () {
          this$1.onCurrentAllImagesEnd(index);
        });
      } else {
        this.stories[this.indexSelected].images[this.key].viewed = true;
        this.key++;
      }
      this.reset();
    },
    prev: function prev(index) {
      var this$1 = this;

      this.isPaused = false;
      if (this.indexSelected <= 0 && this.key <= 0) {
        this.key = 0;
      } else if (this.key <= 0) {
        // Without delay
        setTimeout(function () {
          this$1.difference += index - (index - 1);
          this$1.indexSelected--;
          this$1.key = this$1.getLastViewedIndex(this$1.stories[this$1.indexSelected]);
        });
      } else {
        this.key--;
        this.stories[this.indexSelected].images[this.key].viewed = false;
      }
      this.reset();
    },
    autoPlay: function autoPlay() {
      if (this.isAllStoriesEnd) {
        this.onAllStoriesEnd();
      } else if (this.isCurrentAllImagesEnd) {
        this.onCurrentAllImagesEnd(this.indexSelected);
      } else {
        this.onCurrentImageEnd(this.indexSelected);
      }
      this.reset();
    },
    play: function play() {
      var this$1 = this;

      this.timer = new Date().getTime();
      this.progress = setInterval(function () {
        // forward
        var time = new Date().getTime();
        if (this$1.newDur > 0) {
          this$1.percent =
            this$1.pausePer +
            Math.floor((100 * (time - this$1.timer)) / this$1.duration);
        } else {
          this$1.percent = Math.floor(
            (100 * (time - this$1.timer)) / this$1.duration
          );
        }
      }, this.duration / 100);
      if (this.newDur > 0) {
        this.interval = setInterval(this.autoPlay, this.newDur);
      } else {
        this.interval = setInterval(this.autoPlay, this.duration);
      }
    },
    reset: function reset() {
      this.percent = 0;
      clearInterval(this.interval);
      clearInterval(this.progress);
      this.newDur = 0;
      this.play();
    },
    pauseStory: function pauseStory(event) {
      if (event) {
        this.toggleVideo("pause", event);
      }
      this.isPaused = true;
      this.pausePer = this.percent;
      clearInterval(this.progress);
      clearInterval(this.interval);
      this.newDur = this.duration - (this.pausePer * this.duration) / 100;
    },
    playStory: function playStory(event) {
      if (event) {
        this.toggleVideo("play", event);
      }
      this.isPaused = false;
      this.play();
    },
    toggleVideo: function toggleVideo(type, event) {
      var video = document.getElementById(event.target.id);
      if (video) {
        video[type]();
      }
    },
    stopVideo: function stopVideo(id) {
      var video = document.getElementById(id);
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    },
    calculateTransform: function calculateTransform(index) {
      if (
        this.indexSelected - index === -1 ||
        this.indexSelected - index === 1
      ) {
        return 315 * (index + this.difference);
      }
      if (index > this.indexSelected) {
        return (315 + 315 * (index + this.difference)) * 0.5;
      } else {
        return Math.abs((315 - 315 * (index + this.difference)) * 0.5) * -1;
      }
    },
    closeStories: function closeStories() {
      this.$emit("closeStories");
    },
  },
  mounted: function mounted() {
    this.play();
    this.selectSlide(this.currentIndex);
  },
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    var options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

var isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return function (id, style) { return addStyle(id, style); };
}
var HEAD;
var styles = {};
function addStyle(id, css) {
    var group = isOldIE ? css.media || 'default' : id;
    var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                { style.element.setAttribute('media', css.media); }
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            var index = style.ids.size - 1;
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index])
                { style.element.removeChild(nodes[index]); }
            if (nodes.length)
                { style.element.insertBefore(textNode, nodes[index]); }
            else
                { style.element.appendChild(textNode); }
        }
    }
}

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function () {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "stories-wrapper", attrs: { id: "storiesTemplateID" } },
    [
      _c("div", { staticClass: "close", on: { click: _vm.closeStories } }),
      _vm._v(" "),
      _c(
        "div",
        {
          staticClass: "stories",
          on: {
            click: function ($event) {
              if ($event.target !== $event.currentTarget) {
                return null
              }
              return _vm.closeStories.apply(null, arguments)
            },
          },
        },
        _vm._l(_vm.stories, function (story, index) {
          return _c(
            "div",
            {
              key: index,
              staticClass: "story",
              style:
                index === _vm.indexSelected
                  ? "transform: translate(0px)"
                  : "transform: translate(" +
                    _vm.calculateTransform(index) +
                    "px) scale(0.3);cursor:pointer;",
              on: {
                click: function ($event) {
                  index !== _vm.indexSelected ? _vm.selectSlide(index) : "";
                },
              },
            },
            [
              _c(
                "div",
                {
                  staticClass: "story__source",
                  on: {
                    touchstart: function ($event) {
                      !_vm.isPaused
                        ? _vm.pauseStory($event)
                        : _vm.playStory($event);
                    },
                    touchend: function ($event) {
                      _vm.isPaused
                        ? _vm.playStory($event)
                        : _vm.pauseStory($event);
                    },
                    click: function ($event) {
                      _vm.isPaused
                        ? _vm.playStory($event)
                        : _vm.pauseStory($event);
                    },
                  },
                },
                [
                  _vm.getSrc(story, index).type === "video"
                    ? _c("video", {
                        attrs: {
                          id: _vm.getSrc(story, index).url,
                          src: _vm.getSrc(story, index).url,
                          autoplay: "",
                        },
                      })
                    : _c("img", {
                        staticClass: "img-style",
                        attrs: { src: _vm.getSrc(story, index).url, alt: "" },
                      }),
                  _vm._v(" "),
                  index === _vm.indexSelected
                    ? _c("div", { staticClass: "story__header" }, [
                        _c(
                          "div",
                          { staticClass: "time" },
                          _vm._l(story.images.length, function (elm, index) {
                            return _c(
                              "div",
                              { key: index, staticClass: "time__item" },
                              [
                                _c("div", {
                                  staticClass: "time__fill",
                                  style:
                                    index === _vm.key
                                      ? "width: " + _vm.percent + "%"
                                      : _vm.key > index
                                      ? "width:100%"
                                      : "width:0%",
                                }) ]
                            )
                          }),
                          0
                        ),
                        _vm._v(" "),
                        _c("div", { staticClass: "story__top" }, [
                          _c("div", { staticClass: "user" }, [
                            _c("div", { staticClass: "user__image" }, [
                              _c("img", {
                                attrs: { src: story.picture, alt: "" },
                              }) ]),
                            _vm._v(" "),
                            _c("div", { staticClass: "user__name" }, [
                              _vm._v(
                                "\n                " +
                                  _vm._s(story.username) +
                                  "\n              "
                              ) ]) ]),
                          _vm._v(" "),
                          _c("div", { staticClass: "story__time" }, [
                            _vm._v(_vm._s(story.time)) ]) ]) ])
                    : _vm._e(),
                  _vm._v(" "),
                  _c(
                    "div",
                    { staticClass: "story__body" },
                    [
                      index !== _vm.indexSelected
                        ? _c("div", { staticClass: "user" }, [
                            _c(
                              "div",
                              {
                                staticClass: "user__image",
                                style:
                                  _vm.getNotViewedIndex(story) === -1
                                    ? "background: #FFFFFF"
                                    : "",
                              },
                              [
                                _c("img", {
                                  attrs: { src: story.picture, alt: "" },
                                }) ]
                            ),
                            _vm._v(" "),
                            _c("div", { staticClass: "user__name" }, [
                              _vm._v(
                                "\n              " +
                                  _vm._s(story.username) +
                                  "\n            "
                              ) ]) ])
                        : _vm._e(),
                      _vm._v(" "),
                      _vm.showInnerContent && index === _vm.indexSelected
                        ? _vm._t("innerContent", null, { story: story })
                        : _vm._e() ],
                    2
                  ) ]
              ),
              _vm._v(" "),
              index === _vm.indexSelected
                ? _c("div", {
                    staticClass: "story__icon story__icon--prev",
                    on: {
                      click: function ($event) {
                        return _vm.prev(index)
                      },
                    },
                  })
                : _vm._e(),
              _vm._v(" "),
              index === _vm.indexSelected
                ? _c("div", {
                    staticClass: "story__icon story__icon--next",
                    on: {
                      click: function ($event) {
                        return _vm.next(index)
                      },
                    },
                  })
                : _vm._e(),
              _vm._v(" "),
              _vm.showOuterContent && index === _vm.indexSelected
                ? _vm._t("outerContent", null, { story: story })
                : _vm._e() ],
            2
          )
        }),
        0
      ) ]
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-af707b42_0", { source: "@charset \"UTF-8\";\n*[data-v-af707b42] {\n  box-sizing: border-box;\n}\n.stories-wrapper[data-v-af707b42] {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  background: rgba(16, 16, 16, 0.98);\n  font-family: sans-serif;\n}\n.stories[data-v-af707b42] {\n  height: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.story[data-v-af707b42] {\n  position: absolute;\n  transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1);\n}\n@media screen and (max-width: 768px) {\n.story[data-v-af707b42] {\n    width: 100%;\n    height: 100%;\n    display: flex;\n    flex-direction: column;\n}\n}\n.story__source[data-v-af707b42] {\n  position: relative;\n  border-radius: 16px;\n  background: #000000;\n  width: 414px;\n  height: 751px;\n  background-size: contain;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n}\n@media screen and (max-width: 768px) {\n.story__source[data-v-af707b42] {\n    width: 100%;\n    height: auto;\n    flex: 1 1 auto;\n}\n}\n.story__source img[data-v-af707b42],\n.story__source video[data-v-af707b42] {\n  width: 100%;\n  height: auto;\n  display: block;\n  pointer-events: none;\n}\n.story__header[data-v-af707b42] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  padding: 8px 11px;\n}\n.story__time[data-v-af707b42] {\n  font-size: 16px;\n  line-height: 20px;\n  color: #ffffff;\n}\n.story__top[data-v-af707b42] {\n  display: flex;\n  align-items: center;\n}\n.story__body[data-v-af707b42] {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n}\n.story__body .user[data-v-af707b42] {\n  position: absolute;\n  bottom: 30px;\n  left: 50%;\n  transform: translateX(-50%);\n}\n@media screen and (max-width: 768px) {\n.story__body .user[data-v-af707b42] {\n    display: none;\n}\n}\n.story__body .user__name[data-v-af707b42] {\n  display: none;\n}\n.story__body .user__image[data-v-af707b42] {\n  width: 140px;\n  height: 140px;\n  background: linear-gradient(180deg, #4c7cf6 0%, #6200c3 100%);\n  margin: 0;\n  padding: 5px;\n}\n.story__body .user__image img[data-v-af707b42] {\n  border: 5px solid #ffffff;\n  border-radius: 100%;\n}\n.story__icon[data-v-af707b42] {\n  width: 24px;\n  height: 24px;\n  background: rgba(255, 255, 255, 0.8);\n  border-radius: 50px;\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  cursor: pointer;\n}\n@media screen and (max-width: 768px) {\n.story__icon[data-v-af707b42] {\n    top: 0;\n    bottom: 0;\n    transform: none;\n    width: 100px;\n    height: auto;\n    background: none;\n}\n}\n.story__icon[data-v-af707b42]:before {\n  content: \"\";\n  position: absolute;\n  top: 8px;\n  left: 9px;\n  border: solid #323232;\n  border-width: 0 2px 2px 0;\n  display: inline-block;\n  padding: 3px;\n  transform: rotate(135deg);\n  border-radius: 1px;\n}\n@media screen and (max-width: 768px) {\n.story__icon[data-v-af707b42]:before {\n    content: none;\n}\n}\n.story__icon--prev[data-v-af707b42] {\n  left: -35px;\n}\n@media screen and (max-width: 768px) {\n.story__icon--prev[data-v-af707b42] {\n    left: 0;\n}\n}\n.story__icon--next[data-v-af707b42] {\n  right: -35px;\n  transform: translateY(-50%) rotate(180deg);\n}\n@media screen and (max-width: 768px) {\n.story__icon--next[data-v-af707b42] {\n    right: 0;\n    transform: none;\n}\n}\n.user[data-v-af707b42] {\n  display: flex;\n  align-items: center;\n}\n.user__image[data-v-af707b42] {\n  width: 32px;\n  height: 32px;\n  border-radius: 100px;\n  overflow: hidden;\n  margin-right: 8px;\n}\n.user__image img[data-v-af707b42] {\n  width: 100%;\n  height: 100%;\n  display: block;\n  object-fit: cover;\n}\n.user__name[data-v-af707b42] {\n  font-weight: 600;\n  font-size: 16px;\n  line-height: 18px;\n  color: #ffffff;\n  margin-right: 5px;\n}\n.time[data-v-af707b42] {\n  display: flex;\n  margin-bottom: 10px;\n}\n.time__item[data-v-af707b42] {\n  position: relative;\n  width: 100%;\n  height: 2px;\n  margin-right: 4px;\n  background: rgba(255, 255, 255, 0.5);\n  border-radius: 4px;\n}\n.time__item[data-v-af707b42]:last-child {\n  margin-right: 0;\n}\n.time__fill[data-v-af707b42] {\n  position: absolute;\n  width: 100%;\n  background: #ffffff;\n  height: 2px;\n}\n.close[data-v-af707b42] {\n  position: absolute;\n  width: 50px;\n  height: 50px;\n  top: 20px;\n  right: 20px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n}\n.close[data-v-af707b42]:after {\n  content: \"×\";\n  color: #ffffff;\n  font-weight: 100;\n  font-size: 35px;\n}\n@media screen and (min-width: 768px) {\n.img-style[data-v-af707b42] {\n    max-height: 640px;\n}\n}\n@media screen and (max-width: 768px) {\n.img-style[data-v-af707b42] {\n    max-height: 640px;\n}\n}\n\n/*# sourceMappingURL=Stories.vue.map */", map: {"version":3,"sources":["Stories.vue","/Users/mehmet/Desktop/a/vue-stories-instagram/src/components/Stories.vue"],"names":[],"mappings":"AAAA,gBAAgB;ACwVhB;EACA,sBAAA;ADtVA;ACyVA;EACA,eAAA;EACA,MAAA;EACA,QAAA;EACA,SAAA;EACA,OAAA;EACA,kCAAA;EACA,uBAAA;ADtVA;ACgWA;EACA,YAAA;EACA,aAAA;EACA,uBAAA;EACA,mBAAA;AD7VA;ACgWA;EACA,kBAAA;EACA,qDAAA;AD7VA;AC+VA;AAJA;IAKA,WAAA;IACA,YAAA;IACA,aAAA;IACA,sBAAA;AD5VE;AACF;AC8VA;EACA,kBAAA;EACA,mBAAA;EACA,mBAAA;EACA,YAAA;EACA,aAAA;EACA,wBAAA;EACA,aAAA;EACA,sBAAA;EACA,uBAAA;AD5VA;AC8VA;AAXA;IAYA,WAAA;IACA,YAAA;IACA,cAAA;AD3VE;AACF;AC6VA;;EAEA,WAAA;EACA,YAAA;EACA,cAAA;EACA,oBAAA;AD3VA;AC+VA;EACA,kBAAA;EACA,MAAA;EACA,OAAA;EACA,QAAA;EACA,iBAAA;AD7VA;ACgWA;EACA,eAAA;EACA,iBAAA;EACA,cAAA;AD9VA;ACiWA;EACA,aAAA;EACA,mBAAA;AD/VA;ACkWA;EACA,kBAAA;EACA,SAAA;EACA,OAAA;EACA,QAAA;ADhWA;ACkWA;EACA,kBAAA;EACA,YAAA;EACA,SAAA;EACA,2BAAA;ADhWA;ACkWA;AANA;IAOA,aAAA;AD/VE;AACF;ACkWA;EACA,aAAA;ADhWA;ACmWA;EACA,YAAA;EACA,aAAA;EACA,6DAAA;EACA,SAAA;EACA,YAAA;ADjWA;ACmWA;EACA,yBAAA;EACA,mBAAA;ADjWA;ACsWA;EACA,WAAA;EACA,YAAA;EACA,oCAAA;EACA,mBAAA;EACA,kBAAA;EACA,QAAA;EACA,2BAAA;EACA,eAAA;ADpWA;ACsWA;AAVA;IAWA,MAAA;IACA,SAAA;IACA,eAAA;IACA,YAAA;IACA,YAAA;IACA,gBAAA;ADnWE;AACF;ACqWA;EACA,WAAA;EACA,kBAAA;EACA,QAAA;EACA,SAAA;EACA,qBAAA;EACA,yBAAA;EACA,qBAAA;EACA,YAAA;EACA,yBAAA;EACA,kBAAA;ADnWA;ACqWA;AAZA;IAaA,aAAA;ADlWE;AACF;ACqWA;EACA,WAAA;ADnWA;ACqWA;AAHA;IAIA,OAAA;ADlWE;AACF;ACqWA;EACA,YAAA;EACA,0CAAA;ADnWA;ACqWA;AAJA;IAKA,QAAA;IACA,eAAA;ADlWE;AACF;ACuWA;EACA,aAAA;EACA,mBAAA;ADpWA;ACsWA;EACA,WAAA;EACA,YAAA;EACA,oBAAA;EACA,gBAAA;EACA,iBAAA;ADpWA;ACsWA;EACA,WAAA;EACA,YAAA;EACA,cAAA;EACA,iBAAA;ADpWA;ACwWA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,cAAA;EACA,iBAAA;ADtWA;AC0WA;EACA,aAAA;EACA,mBAAA;ADvWA;ACyWA;EACA,kBAAA;EACA,WAAA;EACA,WAAA;EACA,iBAAA;EACA,oCAAA;EACA,kBAAA;ADvWA;ACyWA;EACA,eAAA;ADvWA;AC2WA;EACA,kBAAA;EACA,WAAA;EACA,mBAAA;EACA,WAAA;ADzWA;AC6WA;EACA,kBAAA;EACA,WAAA;EACA,YAAA;EACA,SAAA;EACA,WAAA;EACA,aAAA;EACA,mBAAA;EACA,uBAAA;EACA,eAAA;AD1WA;AC4WA;EACA,YAAA;EACA,cAAA;EACA,gBAAA;EACA,eAAA;AD1WA;AC6WA;AACA;IACA,iBAAA;AD1WE;AACF;AC4WA;AACA;IACA,iBAAA;AD1WE;AACF;;AAEA,sCAAsC","file":"Stories.vue","sourcesContent":["@charset \"UTF-8\";\n* {\n  box-sizing: border-box;\n}\n\n.stories-wrapper {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  background: rgba(16, 16, 16, 0.98);\n  font-family: sans-serif;\n}\n\n.stories {\n  height: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.story {\n  position: absolute;\n  transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1);\n}\n@media screen and (max-width: 768px) {\n  .story {\n    width: 100%;\n    height: 100%;\n    display: flex;\n    flex-direction: column;\n  }\n}\n.story__source {\n  position: relative;\n  border-radius: 16px;\n  background: #000000;\n  width: 414px;\n  height: 751px;\n  background-size: contain;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n}\n@media screen and (max-width: 768px) {\n  .story__source {\n    width: 100%;\n    height: auto;\n    flex: 1 1 auto;\n  }\n}\n.story__source img,\n.story__source video {\n  width: 100%;\n  height: auto;\n  display: block;\n  pointer-events: none;\n}\n.story__header {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  padding: 8px 11px;\n}\n.story__time {\n  font-size: 16px;\n  line-height: 20px;\n  color: #ffffff;\n}\n.story__top {\n  display: flex;\n  align-items: center;\n}\n.story__body {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n}\n.story__body .user {\n  position: absolute;\n  bottom: 30px;\n  left: 50%;\n  transform: translateX(-50%);\n}\n@media screen and (max-width: 768px) {\n  .story__body .user {\n    display: none;\n  }\n}\n.story__body .user__name {\n  display: none;\n}\n.story__body .user__image {\n  width: 140px;\n  height: 140px;\n  background: linear-gradient(180deg, #4c7cf6 0%, #6200c3 100%);\n  margin: 0;\n  padding: 5px;\n}\n.story__body .user__image img {\n  border: 5px solid #ffffff;\n  border-radius: 100%;\n}\n.story__icon {\n  width: 24px;\n  height: 24px;\n  background: rgba(255, 255, 255, 0.8);\n  border-radius: 50px;\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  cursor: pointer;\n}\n@media screen and (max-width: 768px) {\n  .story__icon {\n    top: 0;\n    bottom: 0;\n    transform: none;\n    width: 100px;\n    height: auto;\n    background: none;\n  }\n}\n.story__icon:before {\n  content: \"\";\n  position: absolute;\n  top: 8px;\n  left: 9px;\n  border: solid #323232;\n  border-width: 0 2px 2px 0;\n  display: inline-block;\n  padding: 3px;\n  transform: rotate(135deg);\n  border-radius: 1px;\n}\n@media screen and (max-width: 768px) {\n  .story__icon:before {\n    content: none;\n  }\n}\n.story__icon--prev {\n  left: -35px;\n}\n@media screen and (max-width: 768px) {\n  .story__icon--prev {\n    left: 0;\n  }\n}\n.story__icon--next {\n  right: -35px;\n  transform: translateY(-50%) rotate(180deg);\n}\n@media screen and (max-width: 768px) {\n  .story__icon--next {\n    right: 0;\n    transform: none;\n  }\n}\n\n.user {\n  display: flex;\n  align-items: center;\n}\n.user__image {\n  width: 32px;\n  height: 32px;\n  border-radius: 100px;\n  overflow: hidden;\n  margin-right: 8px;\n}\n.user__image img {\n  width: 100%;\n  height: 100%;\n  display: block;\n  object-fit: cover;\n}\n.user__name {\n  font-weight: 600;\n  font-size: 16px;\n  line-height: 18px;\n  color: #ffffff;\n  margin-right: 5px;\n}\n\n.time {\n  display: flex;\n  margin-bottom: 10px;\n}\n.time__item {\n  position: relative;\n  width: 100%;\n  height: 2px;\n  margin-right: 4px;\n  background: rgba(255, 255, 255, 0.5);\n  border-radius: 4px;\n}\n.time__item:last-child {\n  margin-right: 0;\n}\n.time__fill {\n  position: absolute;\n  width: 100%;\n  background: #ffffff;\n  height: 2px;\n}\n\n.close {\n  position: absolute;\n  width: 50px;\n  height: 50px;\n  top: 20px;\n  right: 20px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n}\n.close:after {\n  content: \"×\";\n  color: #ffffff;\n  font-weight: 100;\n  font-size: 35px;\n}\n\n@media screen and (min-width: 768px) {\n  .img-style {\n    max-height: 640px;\n  }\n}\n@media screen and (max-width: 768px) {\n  .img-style {\n    max-height: 640px;\n  }\n}\n\n/*# sourceMappingURL=Stories.vue.map */","<template>\n  <div class=\"stories-wrapper\" id=\"storiesTemplateID\">\n    <div @click=\"closeStories\" class=\"close\"></div>\n    <div class=\"stories\" @click.self=\"closeStories\">\n      <div\n        v-for=\"(story, index) in stories\"\n        :key=\"index\"\n        class=\"story\"\n        :style=\"\n          index === indexSelected\n            ? `transform: translate(0px)`\n            : `transform: translate(${calculateTransform(\n                index\n              )}px) scale(0.3);cursor:pointer;`\n        \"\n        @click=\"index !== indexSelected ? selectSlide(index) : ''\"\n      >\n        <div\n          class=\"story__source\"\n          @touchstart=\"!isPaused ? pauseStory($event) : playStory($event)\"\n          @touchend=\"isPaused ? playStory($event) : pauseStory($event)\"\n          @click=\"isPaused ? playStory($event) : pauseStory($event)\"\n        >\n          <video\n            :id=\"getSrc(story, index).url\"\n            v-if=\"getSrc(story, index).type === 'video'\"\n            :src=\"getSrc(story, index).url\"\n            autoplay\n          ></video>\n          <img\n            v-else\n            :src=\"getSrc(story, index).url\"\n            alt=\"\"\n            class=\"img-style\"\n          />\n          <div class=\"story__header\" v-if=\"index === indexSelected\">\n            <div class=\"time\">\n              <div\n                class=\"time__item\"\n                v-for=\"(elm, index) in story.images.length\"\n                :key=\"index\"\n              >\n                <div\n                  class=\"time__fill\"\n                  :style=\"\n                    index === key\n                      ? `width: ${percent}%`\n                      : key > index\n                      ? `width:100%`\n                      : `width:0%`\n                  \"\n                ></div>\n              </div>\n            </div>\n            <div class=\"story__top\">\n              <div class=\"user\">\n                <div class=\"user__image\">\n                  <img :src=\"story.picture\" alt=\"\" />\n                </div>\n                <div class=\"user__name\">\n                  {{ story.username }}\n                </div>\n              </div>\n              <div class=\"story__time\">{{ story.time }}</div>\n            </div>\n          </div>\n          <div class=\"story__body\">\n            <div class=\"user\" v-if=\"index !== indexSelected\">\n              <div\n                class=\"user__image\"\n                :style=\"\n                  getNotViewedIndex(story) === -1 ? `background: #FFFFFF` : ''\n                \"\n              >\n                <img :src=\"story.picture\" alt=\"\" />\n              </div>\n              <div class=\"user__name\">\n                {{ story.username }}\n              </div>\n            </div>\n            <slot\n              v-if=\"showInnerContent && index === indexSelected\"\n              name=\"innerContent\"\n              :story=\"story\"\n            ></slot>\n          </div>\n        </div>\n        <div\n          v-if=\"index === indexSelected\"\n          class=\"story__icon story__icon--prev\"\n          @click=\"prev(index)\"\n        ></div>\n        <div\n          v-if=\"index === indexSelected\"\n          class=\"story__icon story__icon--next\"\n          @click=\"next(index)\"\n        ></div>\n        <slot\n          v-if=\"showOuterContent && index === indexSelected\"\n          name=\"outerContent\"\n          :story=\"story\"\n        ></slot>\n      </div>\n    </div>\n  </div>\n</template>\n\n<script>\nexport default {\n  name: \"Stories\",\n  props: {\n    stories: {\n      type: Array,\n      required: true,\n    },\n    duration: {\n      type: Number,\n      default: 3000,\n    },\n    currentIndex: {\n      type: Number,\n      default: 0,\n    },\n    showInnerContent: {\n      type: Boolean,\n      default: false,\n    },\n    showOuterContent: {\n      type: Boolean,\n      default: false,\n    },\n  },\n  data: () => ({\n    indexSelected: 0,\n    difference: 0,\n    key: 0,\n    percent: 0,\n    timer: 0,\n    progress: 0,\n    interval: 0,\n    isPaused: false,\n    newDur: 0,\n    pausePer: 0,\n    mobile: false,\n  }),\n  computed: {\n    isAllStoriesEnd() {\n      return (\n        this.indexSelected >= this.stories.length - 1 &&\n        this.isCurrentAllImagesEnd\n      );\n    },\n    isCurrentAllImagesEnd() {\n      return this.key >= this.stories[this.indexSelected].images.length - 1;\n    },\n  },\n  mounted() {\n    if (process.client) {\n      this.mobile = this.isMobile();\n    }\n  },\n  methods: {\n    isMobile() {\n      if (\n        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(\n          navigator.userAgent\n        )\n      ) {\n        return true;\n      } else {\n        return false;\n      }\n    },\n    getSrc(story, index) {\n      const viewedIndex = this.getLastViewedIndex(story);\n      return index === this.indexSelected\n        ? {\n            url: story.images[this.key].url,\n            type: story.images[this.key].type,\n          }\n        : {\n            url: story.images[viewedIndex].url,\n            type: story.images[viewedIndex].type,\n          };\n    },\n    getNotViewedIndex(story) {\n      return story.images.findIndex((item) => !item.viewed);\n    },\n    getLastViewedIndex(story) {\n      const keyIndex = this.getNotViewedIndex(story);\n      const index = story.images.length - 1;\n      return keyIndex === -1 ? index : keyIndex;\n    },\n    selectSlide(index) {\n      this.isPaused = false;\n      this.difference += this.indexSelected - index;\n      this.stopVideo(this.stories[this.indexSelected].images[this.key].url);\n      this.indexSelected = index;\n      this.key = this.getLastViewedIndex(this.stories[this.indexSelected]);\n      this.reset();\n    },\n    onAllStoriesEnd() {\n      this.difference = 0;\n      this.indexSelected = 0;\n      this.key = 0;\n      this.$emit(\"allStoriesEnd\");\n    },\n    onCurrentAllImagesEnd(index) {\n      this.difference += index - (index + 1);\n      this.stopVideo(this.stories[this.indexSelected].images[this.key].url);\n      this.stories[index].images[this.key].viewed = true;\n      this.indexSelected++;\n      this.key = this.getLastViewedIndex(this.stories[this.indexSelected]);\n      this.$emit(\"сurrentAllImagesEnd\", index);\n    },\n    onCurrentImageEnd(index) {\n      this.stories[index].images[this.key].viewed = true;\n      this.$emit(\"сurrentImageEnd\", this.key);\n      this.key++;\n    },\n    next(index) {\n      this.isPaused = false;\n      if (this.isAllStoriesEnd) {\n        this.onAllStoriesEnd();\n      } else if (this.isCurrentAllImagesEnd) {\n        setTimeout(() => {\n          this.onCurrentAllImagesEnd(index);\n        });\n      } else {\n        this.stories[this.indexSelected].images[this.key].viewed = true;\n        this.key++;\n      }\n      this.reset();\n    },\n    prev(index) {\n      this.isPaused = false;\n      if (this.indexSelected <= 0 && this.key <= 0) {\n        this.key = 0;\n      } else if (this.key <= 0) {\n        // Without delay\n        setTimeout(() => {\n          this.difference += index - (index - 1);\n          this.indexSelected--;\n          this.key = this.getLastViewedIndex(this.stories[this.indexSelected]);\n        });\n      } else {\n        this.key--;\n        this.stories[this.indexSelected].images[this.key].viewed = false;\n      }\n      this.reset();\n    },\n    autoPlay() {\n      if (this.isAllStoriesEnd) {\n        this.onAllStoriesEnd();\n      } else if (this.isCurrentAllImagesEnd) {\n        this.onCurrentAllImagesEnd(this.indexSelected);\n      } else {\n        this.onCurrentImageEnd(this.indexSelected);\n      }\n      this.reset();\n    },\n    play() {\n      this.timer = new Date().getTime();\n      this.progress = setInterval(() => {\n        // forward\n        let time = new Date().getTime();\n        if (this.newDur > 0) {\n          this.percent =\n            this.pausePer +\n            Math.floor((100 * (time - this.timer)) / this.duration);\n        } else {\n          this.percent = Math.floor(\n            (100 * (time - this.timer)) / this.duration\n          );\n        }\n      }, this.duration / 100);\n      if (this.newDur > 0) {\n        this.interval = setInterval(this.autoPlay, this.newDur);\n      } else {\n        this.interval = setInterval(this.autoPlay, this.duration);\n      }\n    },\n    reset() {\n      this.percent = 0;\n      clearInterval(this.interval);\n      clearInterval(this.progress);\n      this.newDur = 0;\n      this.play();\n    },\n    pauseStory(event) {\n      if (event) {\n        this.toggleVideo(\"pause\", event);\n      }\n      this.isPaused = true;\n      this.pausePer = this.percent;\n      clearInterval(this.progress);\n      clearInterval(this.interval);\n      this.newDur = this.duration - (this.pausePer * this.duration) / 100;\n    },\n    playStory(event) {\n      if (event) {\n        this.toggleVideo(\"play\", event);\n      }\n      this.isPaused = false;\n      this.play();\n    },\n    toggleVideo(type, event) {\n      const video = document.getElementById(event.target.id);\n      if (video) {\n        video[type]();\n      }\n    },\n    stopVideo(id) {\n      const video = document.getElementById(id);\n      if (video) {\n        video.pause();\n        video.currentTime = 0;\n      }\n    },\n    calculateTransform(index) {\n      if (\n        this.indexSelected - index === -1 ||\n        this.indexSelected - index === 1\n      ) {\n        return 315 * (index + this.difference);\n      }\n      if (index > this.indexSelected) {\n        return (315 + 315 * (index + this.difference)) * 0.5;\n      } else {\n        return Math.abs((315 - 315 * (index + this.difference)) * 0.5) * -1;\n      }\n    },\n    closeStories() {\n      this.$emit(\"closeStories\");\n    },\n  },\n  mounted() {\n    this.play();\n    this.selectSlide(this.currentIndex);\n  },\n};\n</script>\n\n<style lang=\"scss\" scoped>\n* {\n  box-sizing: border-box;\n}\n\n.stories-wrapper {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  background: rgba(16, 16, 16, 0.98);\n  font-family: sans-serif;\n\n  // -webkit-touch-callout: none;\n  // -webkit-user-select: none;\n  // -khtml-user-select: none;\n  // -moz-user-select: none;\n  // -ms-user-select: none;\n  // user-select: none;\n}\n\n.stories {\n  height: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.story {\n  position: absolute;\n  transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1);\n\n  @media screen and (max-width: 768px) {\n    width: 100%;\n    height: 100%;\n    display: flex;\n    flex-direction: column;\n  }\n\n  &__source {\n    position: relative;\n    border-radius: 16px;\n    background: #000000;\n    width: 414px;\n    height: 751px;\n    background-size: contain;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n\n    @media screen and (max-width: 768px) {\n      width: 100%;\n      height: auto;\n      flex: 1 1 auto;\n    }\n\n    img,\n    video {\n      width: 100%;\n      height: auto;\n      display: block;\n      pointer-events: none;\n    }\n  }\n\n  &__header {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    padding: 8px 11px;\n  }\n\n  &__time {\n    font-size: 16px;\n    line-height: 20px;\n    color: #ffffff;\n  }\n\n  &__top {\n    display: flex;\n    align-items: center;\n  }\n\n  &__body {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    right: 0;\n\n    .user {\n      position: absolute;\n      bottom: 30px;\n      left: 50%;\n      transform: translateX(-50%);\n\n      @media screen and (max-width: 768px) {\n        display: none;\n      }\n    }\n\n    .user__name {\n      display: none;\n    }\n\n    .user__image {\n      width: 140px;\n      height: 140px;\n      background: linear-gradient(180deg, #4c7cf6 0%, #6200c3 100%);\n      margin: 0;\n      padding: 5px;\n\n      img {\n        border: 5px solid #ffffff;\n        border-radius: 100%;\n      }\n    }\n  }\n\n  &__icon {\n    width: 24px;\n    height: 24px;\n    background: rgba(255, 255, 255, 0.8);\n    border-radius: 50px;\n    position: absolute;\n    top: 50%;\n    transform: translateY(-50%);\n    cursor: pointer;\n\n    @media screen and (max-width: 768px) {\n      top: 0;\n      bottom: 0;\n      transform: none;\n      width: 100px;\n      height: auto;\n      background: none;\n    }\n\n    &:before {\n      content: \"\";\n      position: absolute;\n      top: 8px;\n      left: 9px;\n      border: solid #323232;\n      border-width: 0 2px 2px 0;\n      display: inline-block;\n      padding: 3px;\n      transform: rotate(135deg);\n      border-radius: 1px;\n\n      @media screen and (max-width: 768px) {\n        content: none;\n      }\n    }\n\n    &--prev {\n      left: -35px;\n\n      @media screen and (max-width: 768px) {\n        left: 0;\n      }\n    }\n\n    &--next {\n      right: -35px;\n      transform: translateY(-50%) rotate(180deg);\n\n      @media screen and (max-width: 768px) {\n        right: 0;\n        transform: none;\n      }\n    }\n  }\n}\n\n.user {\n  display: flex;\n  align-items: center;\n\n  &__image {\n    width: 32px;\n    height: 32px;\n    border-radius: 100px;\n    overflow: hidden;\n    margin-right: 8px;\n\n    img {\n      width: 100%;\n      height: 100%;\n      display: block;\n      object-fit: cover;\n    }\n  }\n\n  &__name {\n    font-weight: 600;\n    font-size: 16px;\n    line-height: 18px;\n    color: #ffffff;\n    margin-right: 5px;\n  }\n}\n\n.time {\n  display: flex;\n  margin-bottom: 10px;\n\n  &__item {\n    position: relative;\n    width: 100%;\n    height: 2px;\n    margin-right: 4px;\n    background: rgba(255, 255, 255, 0.5);\n    border-radius: 4px;\n\n    &:last-child {\n      margin-right: 0;\n    }\n  }\n\n  &__fill {\n    position: absolute;\n    width: 100%;\n    background: #ffffff;\n    height: 2px;\n  }\n}\n\n.close {\n  position: absolute;\n  width: 50px;\n  height: 50px;\n  top: 20px;\n  right: 20px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n\n  &:after {\n    content: \"\\00d7\";\n    color: #ffffff;\n    font-weight: 100;\n    font-size: 35px;\n  }\n}\n@media screen and (min-width: 768px) {\n  .img-style {\n    max-height: 640px;\n  }\n}\n@media screen and (max-width: 768px) {\n  .img-style {\n    max-height: 640px;\n  }\n}\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-af707b42";
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

function install(Vue) {
  if (install.installed) { return; }
  install.installed = true;
  Vue.component('Stories', __vue_component__);
}

var plugin = {
  install: install
};


var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

export default __vue_component__;
export { install };

# smartscroll
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fd4nyll%2Fsmartscroll.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fd4nyll%2Fsmartscroll?ref=badge_shield)


smartscroll is a tiny (1815b minfied + gzipped) jQuery plugin that has these *independent* features:

1. Section scrolling - Scrolljacking
2. Auto-hash - Updates the URL hash based on current position on page
3. Responsive - You can disable scrolljacking below a set breakpoint

It also supports:

1. Varied Section Heights
2. Hybrid Scrolling - Both normal and scrolljacking on the same page
3. Compatible with scrollbar - Can use scrollbar as well as mousewheel
4. Disabling permalink history
5. Correctly detects scroll events for inertial scrolling, by integrating with [lethargy](https://github.com/d4nyll/lethargy) as a soft dependency (which means it will work without it)
6. Provides events you can listen to, by integrating with [EventEmitter](https://github.com/Olical/EventEmitter) as a soft dependency

### [Demo](//d4nyll.github.io/smartscroll/)

### Requirements

1. **There can only be one set of adjoining sections**

### How to Use

Install [lethargy](https://github.com/d4nyll/lethargy), which is available as a [Bower](http://bower.io/) package, which you can install with `bower install`.

Structure your HTML like so (default options included)

    <body>
      <div class="section-wrapper">
        <div class="section" data-hash="section-hash-name"></div>
        <div class="section" data-hash="section-hash-name"></div>
      </div>
    <script src="path/to/lethargy.min.js">
    <script src="https://rawgit.com/Olical/EventEmitter/master/EventEmitter.min.js"></script>
    <script src="path/to/smartscroll.min.js">
    <script>
      var options = {
        mode: "vp", // "vp", "set"
        autoHash: false,
        sectionScroll: true,
        initialScroll: true,
        keepHistory: false,
        sectionWrapperSelector: ".section-wrapper",
        sectionClass: "section",
        animationSpeed: 300,
        headerHash: "header",
        breakpoint: null,
        eventEmitter: null,
        dynamicHeight: false
      };
      $.smartscroll(options);
    </script>
    </body>

> You may also want to link to `styles.css`, but all that does is to ensure the `html` and `body` elements have no margins nor padding

> You may also leave out [lethargy](https://github.com/d4nyll/lethargy), but smartscroll may not work as well with scroll devices that uses inertial scrolling. Performance with lethargy can be slower, but it will be improved with further development.

##### Options

* `mode` - (String) Valid options are:
  * `vp` (Viewport) - The sections will be automatically sized to be the same as the viewport
  * `set` - Use the height and width set by CSS (use this for having different heights for different sections)
* `autoHash` - (Boolean) Whether the auto-hashing feature is enabled. If you use this feature, it is important to use EventEmitter as well, otherwise smartscroll will listen to every `scroll` event, which is very resource-draining and can make the animation more 'glitchy'
* `sectionScroll` - (Boolean) Whether the section-scrolling feature is enabled
* `initialScroll` - (Boolean) Whether smartscroll should scroll to the position specified by the hash on initial load
* `keepHistory` - (Boolean) Whether scrolling through different sections will be recorded in the browser's history
* `sectionWrapperSelector` - (String) The CSS selector for the block element which wraps around your sections
* `sectionClass` - (String) The class name applied to each section
* `animationSpeed` - (Integer) Time taken for the scroll animation, in miliseconds
* `headerHash` - (String) The hash for the section above the sections, must be non-empty to reliably ensure the page do not jump when updating the hash value across browsers (as `#` means `_top`)
* `breakpoint` - (Integer) The width of the browser below which scrolljacking will be disabled
* `sectionSelector` - (String) The selector applied to each section, overrides `sectionClass` and allow more flexibility in choosing a selector. (Added in 2.1.0)
* `dynamicHeight` - (Boolean) If you are going to be dynamically adding and removing content so as to change the position and/or size of the section wrappers and/or sections, then set this to true. Set to false otherwise to increase performance.
* `eventEmitter` - (Object) If you pass in an [EventEmitter](https://github.com/Olical/EventEmitter) object, autoHashing will be much more efficient. You can also listen to the scroll events this way. Defaults to `null`.
* `ie8` - If you need to support Internet Explorer 8, change this to `true`. Defaults to `false`.
* `bindSwipe` - (Boolean) Allow for listening of swipe events. Requires EventEmitter. Defaults to `true`
* `bindKeyboard` - (Boolean) Allow for keyboard events (up and down arrows) to control slides. Defaults to `true`

### Events

Smartscroll has a soft dependency on [EventEmitter](https://github.com/Olical/EventEmitter). If present, smartscroll can provide six events `scrollStart`, `scrollEnd`, `swipeLeft`, `swipeRight`, `swipeDown` and `swipeUp`. The `scrollStart` and `scrollEnd` listener will receive the slide number as its only argument; the first slide will have a number of `1`, the section before the sectionWrapper will have a number of `0`.

    var ee = new EventEmitter();
    var scrollStartListener = function (slideNumber) {
      console.log("Scrolling to " + slideNumber);
    }
    var scrollEndListener = function () {
      console.log("Scrolling End");
    }
    ee.addListener('scrollStart', scrollStartListener);
    ee.addListener('scrollEnd', scrollEndListener);
    $.smartscroll({
      ...
      eventEmitter: ee
    });

The other listeners receive no arguments.

    var ee = new EventEmitter();
    var swipeUpListener = function () {
      console.log("Swiping Up");
    }
    var swipeDownListener = function () {
      console.log("Swiping Down");
    }
    $.smartscroll({
      ...
      eventEmitter: ee,
      bindSwipe: true
    });
    ee.addListener('swipeUp', swipeUpListener);
    ee.addListener('swipeDown', swipeDownListener);

### Manual Scroll

You can manually scroll up or scroll down.

When you first initiate smartscroll with `$.smartscroll()`, it returns an  object. In that object is the `scroll` function, which is called with a single parameter. If the parameter is truthy, it will scroll down, otherwise, it will scroll up.

    var smartscroll = $.smartscroll();
    smartscroll.scroll(1);

### Architecture

Currently, there are two features of smartscroll, and this is how it's implemented:

1. Smooth scroll by section

  The [`mousewheel`](https://developer.mozilla.org/en-US/docs/Web/Events/mousewheel)  and [`DOMMouseScroll`](https://developer.mozilla.org/en-US/docs/Web/Events/DOMMouseScroll) (for Firefox) events are bound.

  When such event is fired in `vp` mode, smartscroll will find it's most prominent section (one which occupies most of the screen), and smoothly scroll to the section above or below it.

  When the event is fired in `set` mode, smartscroll will find which section occupies the middle of the screen, and smoothly scroll to the section above or below it.

  When scrolling outside of the sections, normal scrolling resumes.
  
2. Changing URL hash based on the current section

  The `scroll` event is bound.

  When the event is fired in `vp` mode, smartscroll will see which section occupies the *top* of the viewport, and if the hash is different, replace it with the new one.

  When the event is fired in `set` mode, smartscroll will see which section occupies the *middle* of the viewport, and if the hash is different, replace it with the new one.


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fd4nyll%2Fsmartscroll.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fd4nyll%2Fsmartscroll?ref=badge_large)
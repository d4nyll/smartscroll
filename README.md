# smartscroll

> Please use [v1.0.0](https://github.com/d4nyll/smartscroll/tree/1.0.0) for now!

smartscroll is a tiny (919b minfied + gzipped) jQuery plugin that has these *independent* features:

1. Section scrolling - Scrolljacking
2. Auto-hash - Updates the URL hash based on current position on page

It also supports:

1. Varied Section Heights
2. Hybrid Scrolling - Both normal and scrolljacking on the same page
3. Compatible with scrollbar - Can use scrollbar as well as mousewheel
4. Disabling permalink history

### [Demo](//d4nyll.github.io/smartscroll/)

### Requirements

1. **There can only be one set of adjoining sections**
2. The [**Lethargy**](https://github.com/d4nyll/lethargy) is used to fix problems regarding inertial scroll. It is available as a Bower package, so for now, for v2.0.0, you must use Bower to install smartscroll. Otherwise, you must munually include the lethargy package and ensure it is loaded before smartscroll.

### Install

You can simply download the `smartscroll.min.js` file, or use a package manager.

**npm**

    npm install smartscroll

**bower**

    bower install smartscroll

### How to Use

Structure your HTML like so (default options included)

    <body>
      <div class="section-wrapper">
        <div class="section" data-hash="section-hash-name"></div>
        <div class="section" data-hash="section-hash-name"></div>
      </div>
    <script src="path/to/smartscroll.js">
    <script>
      var options = {
        mode: "vp", // "vp", "set"
        autoHash: true,
        sectionScroll: true,
        initialScroll: true,
        keepHistory: false,
        sectionWrapperSelector: ".section-wrapper",
        sectionClass: "section",
        animationSpeed: 300,
        headerHash: "header"
      };
      $.smartscroll(options);
    </script>
    </body>

> You may also want to link to `smartscroll.css`, but all that does is to ensure the `html` and `body` elements have no margins nor padding

##### Options

* `mode` - (String) Valid options are:
  * `vp` (Viewport) - The sections will be automatically sized to be the same as the viewport
  * `set` - Use the height and width set by CSS (use this for having different heights for different sections)
* `autoHash` - (Boolean) Whether the auto-hashing feature is enabled
* `sectionScroll` - (Boolean) Whether the section-scrolling feature is enabled
* `initialScroll` - (Boolean) Whether smartscroll should scroll to the position specified by the hash on initial load
* `keepHistory` - (Boolean) Whether scrolling through different sections will be recorded in the browser's history
* `sectionWrapperSelector` - (String) The CSS selector for the block element which wraps around your sections
* `sectionClass` - (String) The class name applied to each section
* `animationSpeed` - (Integer) Time taken for the scroll animation, in miliseconds
* `headerHash` - (String) the hash for the section above the sections, must be non-empty to reliably ensure the page do not jump when updating the hash value across browsers (as `#` means `_top`)

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

### Future Development

The following features may be implemented. Please register interest by opening/commenting on an issue.

* Touch support
* Horizontal scrolling

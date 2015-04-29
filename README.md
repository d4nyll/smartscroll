# smartscroll

smartscroll is a jQuery plugin that has these *independent* features:

1. Section scrolling - Scrolljacking
2. Auto-hash - Updates the URL hash based on current position on page

### Requirements

1. **All sections must be 100% height and width in relation to the viewport**
2. **There can only be one set of adjoining sections**

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
        autoHash: true,
        sectionScroll: true,
        sectionWrapperSelector: ".section-wrapper",
        sectionClass: "section",
        animationSpeed: 300,
        headerHash: "header"
      };
      $.smartscroll(options);
    </script>
    </body>

> You may also want to link to `styles.css`, but all that does is to ensure the `html` and `body` elements have no margins nor padding

##### Options

* `autoHash` - (Boolean) Whether the auto-hashing feature is enabled
* `sectionScroll` - (Boolean) Whether the section-scrolling feature is enabled
* `sectionWrapperSelector` - (String) The CSS selector for the block element which wraps around your sections
* `sectionClass` - (String) The class name applied to each section
* `animationSpeed` - (Integer) Time taken for the scroll animation, in miliseconds
* `headerHash` - (String) the hash for the section above the sections, must be non-empty to reliably ensure the page do not jump when updating the hash value across browsers (as `#` means `_top`)

### Architecture

Currently, there are two features of smartscroll, and this is how it's implemented:

1. Smooth scroll by section

  The [`mousewheel`](https://developer.mozilla.org/en-US/docs/Web/Events/mousewheel)  and [`DOMMouseScroll`](https://developer.mozilla.org/en-US/docs/Web/Events/DOMMouseScroll) (for Firefox) events are bound. When such event is detected, it will find it's most prominent section (one which occupies most of the screen), and smoothly scroll to the section above or below it.
  When scrolling outside of the sections, normal scrolling resumes.
  
2. Changing URL hash based on the current section

  The URL hash changing works *independently* of the smooth scrolling

### Future Development

The following features may be implemented. Please register interest by opening an issue.

* Horizontal scrolling
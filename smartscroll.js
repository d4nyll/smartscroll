(function ($) { // eslint-disable-line func-names
  /**
   * CONSTANTS
   */

  var MOUSE_EVENTS_STRING = 'mousewheel DOMMouseScroll wheel MozMousePixelScroll';

  /**
   * DEPENDENCIES
   */

  // Register lethargy as a soft dependency
  var lethargy;
  if (typeof Lethargy !== 'undefined' && Lethargy !== null) {
    lethargy = new Lethargy();
  }

  /**
   * FUNCTIONS
   */

  var getWindowTop = function () {
    // jQuery uses only window.pageYOffset
    // https://github.com/jquery/jquery/blob/29370190605ed5ddf5d0371c6ad886a4a4b5e0f9/src/offset.js#L184
    return Math.max(
      // Does not work for IE8 or below
      // Alias for window.scrollY
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/pageYOffset
      window.pageYOffset,

      // Does not work for IE versions below Edge
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
      //
      // window.scrollY,

      // Caters for quirks mode
      // Deprecated in ES5 strict mode
      // so for standards mode use document.documentElement.scrollTop instead
      //
      window.document.body.scrollTop,

      // Caters for standards mode
      // Should be the same as `window.pageYOffset`
      window.document.documentElement.scrollTop
    );
  };

  $.smartscroll = function smartscroll(overrides) { // eslint-disable-line no-param-reassign
    /**
     * OPTIONS
     */

    // Replace defaults with user-specified options
    // Properties that are `null` or `undefined` are ignored - https://api.jquery.com/jquery.extend/
    var options = $.extend({}, $.smartscroll.defaults, overrides);

    // If `options.sectionSelector` is not set, use `options.sectionClass`
    if (!options.sectionSelector) {
      options.sectionSelector = '.' + options.sectionClass;
    }

    // Invalidate eventEmitter if:
    if (
      // EventEmitter is not available / loaded,
      typeof EventEmitter === 'undefined'
      || EventEmitter === null
      // or the property of options.eventEmitter it is not an EventEmitter instance
      || (options.eventEmitter && options.eventEmitter.constructor !== EventEmitter)
    ) {
      options.eventEmitter = null;
    }

    if (options.bindSwipe) {
      // Adapted from http://stackoverflow.com/a/23230280/2317532,
      // licensed under cc by-sa 3.0 with attribution required
      // http://creativecommons.org/licenses/by-sa/3.0/
      // (Might want to checkout http://stackoverflow.com/a/17567696/2317532 when time permits)
      var xDown = null;
      var yDown = null;

      var handleTouchStart = function (event) {
        var e = event.originalEvent || event;
        xDown = e.touches[0].clientX;
        yDown = e.touches[0].clientY;
      };

      var handleTouchMove = function (event) {
        var e = event.originalEvent || event;
        if (!xDown || !yDown) {
          return;
        }

        var xUp = e.touches[0].clientX;
        var yUp = e.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
          if (xDiff > 0) {
            options.eventEmitter.emitEvent('swipeLeft');
          } else {
            options.eventEmitter.emitEvent('swipeRight');
          }
        } else if (yDiff > 0) {
          options.eventEmitter.emitEvent('swipeUp');
        } else {
          options.eventEmitter.emitEvent('swipeDown');
        }
        /* reset values */
        xDown = null;
        yDown = null;
      };
    }

    /**
     * RUNTIME VARIABLES
     */

    // Whether jQuery is currently animating the scroll event
    var isScrolling = false;

    var sections = [];

    var sectionWrapperTop;
    var sectionWrapperBottom;

    var validBreakPoint = false;
    var belowBreakpoint = false;

    var currentHash = window.location.hash;

    // Store the current section wrapper method for later use
    var sectionWrapper = $(options.sectionWrapperSelector + ':first');

    /**
     * FUNCTIONS
     */

    // Check if the view is currently within the section wrapper
    var sectionWrapperIsVisible = function () {
      var windowTop = getWindowTop();
      var windowBottom = windowTop + $(window).height();
      // Only affect scrolling if within the sectionWrapper area
      if (
        windowBottom > sectionWrapperTop
        && windowTop <= sectionWrapperBottom
      ) {
        return true;
      }
      return false;
    };

    // Update the values for `sections`
    var calculateSectionBottoms = function () {
      var tmpSections = [];
      sectionWrapperTop = Math.round(
        sectionWrapper.position().top
        + parseInt(sectionWrapper.css('paddingTop'), 10)
        + parseInt(sectionWrapper.css('borderTopWidth'), 10)
        + parseInt(sectionWrapper.css('marginTop'), 10));

      // We use `height()` instead of `innerHeight()` or `outerHeight()`
      // because we don't care about the padding in the sectionWrapper at the bottom
      sectionWrapperBottom = Math.round(
        sectionWrapperTop
        + sectionWrapper.height(), 10);
      tmpSections.push(sectionWrapperTop);
      $(options.sectionSelector).each(function (i, el) { // eslint-disable-line func-names
        tmpSections.push(Math.round(
          sectionWrapperTop
          + $(el).position().top // This will be relative to the sectionWrapper
          + $(el).outerHeight()
        ));
      });
      sections = tmpSections;
    };

    // Given the event object, determines if it's up or down,
    // or invalid according to lethargy
    var getScrollAction = function (e) {
      // Always register the action with lethargy
      var validScroll;
      if (lethargy) {
        validScroll = lethargy.check(e);
      }
      // Do nothing if it is already scrolling
      if (!isScrolling) {
        if (lethargy) {
          if (validScroll === 1) {
            return 'up';
          } else if (validScroll === -1) {
            return 'down';
          }
        } else if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
          return 'up';
        } else if (e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
          return 'down';
        }
      }
      return false;
    };

    // Checks the slide that is occupying the position specified
    var getSectionIndexAt = function (position) {
      for (var i = 0; i < sections.length; i += 1) {
        if (position <= sections[i]) {
          return i;
        }
      }
      return sections.length;
    };

    // Change the hash (and also record history depending on options)
    var autoHash = function () {
      var newHash;
      if ((getWindowTop() + ($(window).height() / 2)) < sectionWrapperTop) {
        newHash = options.headerHash;
      } else {
        var slideIndex = getSectionIndexAt(getWindowTop() + ($(window).height() / 2));
        if (slideIndex !== undefined) {
          newHash = $(options.sectionSelector + ':nth-of-type(' + (slideIndex + 1) + ')').data('hash');
        }
      }
      if (typeof newHash === 'undefined' || !(window.location.hash === ('#' + newHash))) {
        if (typeof newHash === 'undefined') {
          newHash = options.headerHash;
        }
        if (!options.keepHistory) {
          window.location.replace(window.location.href.split('#')[0] + '#' + newHash);
        } else {
          window.location.hash = newHash;
        }
      }
    };

    // Animates the scroll to the pixel specified
    // at the speed (milisseconds) specified
    var scrollToPixel = function (pixel, speed) {
      if (isScrolling) {
        return;
      }
      isScrolling = true;
      $('body,html').stop(true, true).animate({
        scrollTop: pixel,
      }, speed, function () { // eslint-disable-line func-names
        isScrolling = false;
        if (options.eventEmitter) {
          options.eventEmitter.emitEvent('scrollEnd');
        }
      });
    };

    // Make this public
    this.scroll = function scroll(down) {
      if (sections) {
        var windowTop = getWindowTop();
        if (options.eventEmitter) {
          var sectionIndexAtWindowMiddle = getSectionIndexAt(windowTop + ($(window).height() / 2));
          var nextSlideNumber = down ? (
            sectionIndexAtWindowMiddle + 1
          ) : (
              sectionIndexAtWindowMiddle - 1
          );
          options.eventEmitter.emitEvent('scrollStart', [nextSlideNumber]);
        }
        for (var i = 0; i < sections.length; i += 1) {
          if (windowTop < sections[i]) {
            if (down) {
              scrollToPixel(sections[i], 700);
            } else {
              scrollToPixel(sections[i - 1] - $(window).height(), 700);
            }
            if (options.eventEmitter) {
              options.eventEmitter.emitEvent('scrollEnd');
            }
            return false;
          }
        }
      }
      return undefined;
    };


    // Bind scroll events and perform scrolljacking
    var bindScroll = function () {
      $(window).bind(MOUSE_EVENTS_STRING, function (e) { // eslint-disable-line func-names
        var scrollAction = getScrollAction(e);
        if (options.dynamicHeight) {
          calculateSectionBottoms();
        }
        var windowTop = getWindowTop();
        var windowBottom = windowTop + $(window).height();
        // Only affect scrolling if within the sectionWrapper area
        if (
          windowBottom > sectionWrapperTop
          && windowTop <= sectionWrapperBottom
        ) {
          // Only hijack the scroll when windowTop and windowBottom are touching different slides
          // `!==` instead of `<` caters for when `getSectionIndexAtWindowBottom` is `undefined`
          // (at the end of the area)
          var sectionIndexAtWindowTop = getSectionIndexAt(windowTop);
          var sectionIndexAtWindowMiddle = getSectionIndexAt(windowTop + ($(window).height() / 2));
          var sectionIndexAtWindowBottom = getSectionIndexAt(windowBottom);
          if (sectionIndexAtWindowTop !== sectionIndexAtWindowBottom
            || !options.innerSectionScroll) {
            e.preventDefault();
            e.stopPropagation();
            if (scrollAction) {
              if (scrollAction === 'up') {
                if (options.toptotop) {
                  scrollToPixel(
                    sections[sectionIndexAtWindowMiddle - 2] + 1
                    , options.animationSpeed
                  );
                } else {
                  scrollToPixel(
                    sections[sectionIndexAtWindowMiddle - 1] - $(window).height()
                    , options.animationSpeed
                  );
                }
                if (options.eventEmitter) {
                  options.eventEmitter.emitEvent('scrollStart', [sectionIndexAtWindowMiddle - 1]);
                }
              } else if (scrollAction === 'down') {
                scrollToPixel(sections[sectionIndexAtWindowMiddle] + 1, options.animationSpeed);
                if (options.eventEmitter) {
                  options.eventEmitter.emitEvent('scrollStart', [sectionIndexAtWindowMiddle + 1]);
                }
              }
            }
          }
        }
      });
    };

    // Remove all functions bound to mouse events
    var unbindScroll = function () {
      $(window).unbind(MOUSE_EVENTS_STRING);
    };

    /**
     * INITIAL SETUP
     */

    sectionWrapper.css({
      position: 'relative',
    });

    // Need to wait until content and CSS has been parsed
    // So the height is accurate
    setTimeout(function () { // eslint-disable-line func-names
      calculateSectionBottoms();

      // autoHash

      if (options.autoHash) {
        if (options.eventEmitter !== null && !options.hashContinuousUpdate) {
          options.eventEmitter.addListener('scrollEnd', autoHash);
        } else {
          // Fallback with binding scroll events.
          // Many scroll events are fired and so is very resource-intensive
          $(window).bind('scroll', autoHash);
        }
      }

      // Scroll to hash

      if (options.initialScroll && currentHash.length > 0) {
        // Remove the '#' from the hash and use jQuery to check
        // if an element exists with that hash in the 'data-hash' attribute
        var matchedObject = $('[data-hash="' + currentHash.substr(1) + '"]');
        // If there is a matched element, scroll to the first element at time 0 (immediately)
        if (matchedObject.length > 0) {
          scrollToPixel(matchedObject[0].offsetTop + sectionWrapperTop, 0);
        }
      }
    }, 50);

    $(window).bind('resize', calculateSectionBottoms);

    // Breakpoint

    // If options.breakpoint is a valid value,
    // set this.validBreakPoint to true
    if (
      options.breakpoint !== null
      && options.breakpoint === parseInt(options.breakpoint, 10)
      && options.breakpoint > 0
    ) {
      validBreakPoint = true;
    }

    // Mode

    // If the mode is set to vp (viewpoint),
    // make the height of each section the same as the viewport
    if (options.mode === 'vp') {
      // IE8 does not support viewport
      // http://caniuse.com/#feat=viewport-units
      if (options.ie8) {
        var resizeToVP = function () {
          $(options.sectionSelector).css({
            height: $(window).height(),
          });
        };

        // Initial resizing on load
        resizeToVP();

        // Run resizeToVP whenever the window resizes
        $(window).bind('resize', resizeToVP);
      } else {
        // Use viewport to avoid binding to resize events
        $(options.sectionSelector).css({
          height: '100vh',
        });
      }
    }

    // Scrolljacking
    if (options.sectionScroll) {
      // If the breakpoint option is set
      if (validBreakPoint) {
        // Run the following whenever the window is resized
        $(window).bind('resize', function () { // eslint-disable-line func-names
          // If the window width is below the breakpoint,
          // Unbind scroll
          if ($(window).width() < options.breakpoint) {
            // Only unbind once (minimize resource usage)
            if (!belowBreakpoint) {
              unbindScroll();
              // Set belowBreakpoint to true to prevent further unbinding events
              belowBreakpoint = true;
              return false;
            }
          } else if (belowBreakpoint) {
            // If the screen width is currently equal to or above the breakpoint
            // Bind scroll only if it's not bound already
            bindScroll();
            belowBreakpoint = false;
          }
          return undefined;
        });
      }
      bindScroll();
    }

    if (options.bindSwipe) {
      $(window).on('touchstart', handleTouchStart); // eslint-disable-line block-scoped-var
      $(window).on('touchmove', handleTouchMove); // eslint-disable-line block-scoped-var
    }
    if (options.bindKeyboard) {
      var handleKeydown = function (event) {
        var e = event.originalEvent || event;
        if (options.dynamicHeight) {
          calculateSectionBottoms();
        }
        var windowTop = getWindowTop();
        var windowBottom = windowTop + $(window).height();
        // Only affect scrolling if within the sectionWrapper area
        if (sectionWrapperIsVisible()) {
          // Only hijack the scroll when windowTop and windowBottom are touching different slides
          // `!==` instead of `<` caters for when `getSectionIndexAtWindowBottom` is `undefined`
          // (at the end of the area)
          var sectionIndexAtWindowTop = getSectionIndexAt(windowTop);
          var sectionIndexAtWindowMiddle = getSectionIndexAt(windowTop + ($(window).height() / 2));
          var sectionIndexAtWindowBottom = getSectionIndexAt(windowBottom);
          if (sectionIndexAtWindowTop !== sectionIndexAtWindowBottom
            || !options.innerSectionScroll) {
            switch (e.which) {
              // up arrow
              case 38:
                e.preventDefault();
                e.stopPropagation();
                if (options.toptotop) {
                  scrollToPixel(
                    sections[sectionIndexAtWindowMiddle - 2] + 1
                    , options.animationSpeed);
                } else {
                  scrollToPixel(
                    sections[sectionIndexAtWindowMiddle - 1] - $(window).height()
                    , options.animationSpeed);
                }
                if (options.eventEmitter) {
                  options.eventEmitter.emitEvent('scrollStart', [sectionIndexAtWindowMiddle - 1]);
                }
                break;
              // down arrow
              case 40:
                e.preventDefault();
                e.stopPropagation();
                scrollToPixel(sections[sectionIndexAtWindowMiddle] + 1, options.animationSpeed);
                if (options.eventEmitter) {
                  options.eventEmitter.emitEvent('scrollStart', [sectionIndexAtWindowMiddle + 1]);
                }
                break;

              default:
            }
          }
        }
      };
      $(window).on('keydown', handleKeydown);
    }
    return this;
  };

  // Set default options
  $.smartscroll.defaults = { // eslint-disable-line no-param-reassign
    animationSpeed: 700,
    autoHash: true,
    breakpoint: null,
    initialScroll: true,
    headerHash: 'header',
    keepHistory: false,
    mode: 'vp', // "vp", "set"
    sectionClass: 'section',
    sectionSelector: null,
    sectionScroll: true,
    sectionWrapperSelector: '.section-wrapper',
    eventEmitter: null,
    dynamicHeight: false,
    ie8: false,
    hashContinuousUpdate: true,
    innerSectionScroll: true,
    toptotop: false,
    bindSwipe: true,
    bindKeyboard: true,
  };
}(jQuery));

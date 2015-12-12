(function ($) {

	// Register lethargy as a soft dependency
	var lethargy;
	if(typeof Lethargy !== "undefined" && Lethargy !== null) {
		lethargy = new Lethargy();
	}
	
	$.smartscroll = function(overrides) {

		// Replace defaults with user-specified options
		var options = $.extend({}, $.smartscroll.defaults, overrides );

		// If `options.sectionSelector` is not set, use `options.sectionClass`
		if(!options.sectionSelector) {
			options.sectionSelector = "." + options.sectionClass;
		}

		// Common variables & functions
		var currentHash = window.location.hash;

		var slideCount = function () {
			return $(options.sectionSelector).length;
		};

		// Get the current slide showing. If the floor option is true, the current slide is the one touching the top of the viewport; if false, the one touching the middle of the viewport
		var getSectionIndexAt = function (line) {

			var sectionPosition;

			// How far the container is above the viewport
			var containerViewportOffsetTop = -($(options.sectionSelector)[0].getBoundingClientRect().top);

			// If the sections are scaled to the viewport
			if(options.mode == "vp") {
				sectionPosition = containerViewportOffsetTop / $(window).height();
				switch (line) {
					case "bottom":
						return Math.ceil(sectionPosition);
					case "top":
						return Math.floor(sectionPosition);
						break;
					case "middle":
					default:
						return Math.round(sectionPosition)
						break;
				}
			}

			// If the sections can have different heights
			else {
				sectionPosition = -1;

				// If the sections are no active, return an invalid value (-1)
				var position = containerViewportOffsetTop;
				switch (line) {
					case "middle":
						position += $(window).height() / 2;
					case "bottom":
						position += $(window).height();
					case "top":
					default:
						break;
				}

				// If the line lies above the section, return -1
				if(position < 0) {
					return sectionPosition;
				}

				// Find the current section position by adding up the heights of the sections until it reaches our threshold
				var currentSlideRelPos;
				var nextSlideRelPos;
				var currentSlideCount = slideCount();

				var getSectionPosition = function (index) {
					return $(options.sectionSelector + ':nth-of-type(' + (index) + ')')[0].offsetTop - $(options.sectionWrapperSelector + ':first').position().top;
				}
				for (var i = 0; i < currentSlideCount; i++) {

					// We are using index, so start with 0
					sectionPosition = i;

					if(i < (currentSlideCount - 1)) {
						currentSlideRelPos = getSectionPosition(i + 1);
						nextSlideRelPos = getSectionPosition(i + 2);
						if(currentSlideRelPos <= position && position < nextSlideRelPos) {
							break;
						}
					}
				}
				// The last slide and anything below it are deemed to be the same section
				return sectionPosition;
			}
		};

		var scrollToPixel = function (pixel, speed) {
			$('body,html').stop(true,true).animate({
				scrollTop: pixel
			}, speed, function() {
				scrolling = false;
			});
		};

		// autoHash

		if(options.autoHash) {
			$(window).bind('scroll', function(e){
				var newHash = $(options.sectionSelector + ':nth-of-type(' + (getSectionIndexAt("top") + 1) + ')').data('hash');
				if(typeof newHash === 'undefined' || !(window.location.hash === ('#' + newHash))) {
					if(typeof newHash === 'undefined') {
						newHash = options.headerHash;	
					}
					if(!options.keepHistory) {
						window.location.replace(window.location.href.split('#')[0] + '#' + newHash);
					} else {
						window.location.hash = newHash;
					}
				}
		    });
		}

		// Breakpoint
		
		// Set the breakpoint if it is valid. This is needed for the breakpoint feature
		this.validBreakPoint = false;
		this.belowBreakpoint = false;
		if(options.breakpoint !== null && options.breakpoint === parseInt(options.breakpoint, 10) && options.breakpoint > 0) {
			this.validBreakPoint = true;
		}


		// Scroll to hash
		
		if(options.initialScroll && currentHash.length > 0) {
			var matchedObject = $('[data-hash="' + currentHash.substr(1) + '"]');
			if(matchedObject.length > 0) {
				scrollToPixel(matchedObject[0].offsetTop, 0);
			}
		}

		// Mode
		
		// If the mode is set to vp (viewpoint), make the height of each section the same as the viewport
		if (options.mode == "vp") {
			var resizeToVP = function() {
				$(options.sectionSelector).css({
					"height": $(window).height()
				});
			};
			resizeToVP();
			$(window).bind('resize', resizeToVP);
		}

		// Main

		if(options.sectionScroll) {
			if(this.validBreakPoint) {
				$(window).bind('resize', function(e){
					if($(window).width() < options.breakpoint) {
						if(!this.belowBreakpoint) {
							unbindScroll();
							this.belowBreakpoint = true;
							return false;
						}
					} else {
						if(this.belowBreakpoint) {
							bindScroll();
							this.belowBreakpoint = false;
						}
					}
				});
			}
			
			var scrolling = false;
			var scrollTo = function (slideIndex) {
				console.log(slideIndex);
				scrolling = true;
				var scrollTopVal;
				var scrollSpeed = 0;
				if (slideIndex < 0) {
					scrollTopVal = $(options.sectionWrapperSelector + ':first').position().top - 53;
				} else if (slideIndex >= slideCount()) {
					scrollTopVal = window.document.body.scrollTop + 53;
				} else {
					scrollTopVal = $(options.sectionSelector + ':nth-of-type(' + (slideIndex + 1) + ')')[0].offsetTop;
					scrollSpeed = options.animationSpeed;
				}
				scrollToPixel(scrollTopVal, scrollSpeed);
				return false;
			};
			var scrollUp = function () {
				scrollTo(getSectionIndexAt() - 1);
			};
			var scrollDown = function () {
				scrollTo(getSectionIndexAt() + 1);
			};
			var bindScroll = function () {

				$(window).bind('mousewheel DOMMouseScroll wheel MozMousePixelScroll', function(e){
					var $sectionWrapper = $(options.sectionWrapperSelector + ':first');
					var distanceScrolled = Math.max(window.document.body.scrollTop, document.documentElement.scrollTop);
					var distanceToHijackedArea = $sectionWrapper.position().top;
					var distanceToWhereHijackedAreaEnds = $sectionWrapper.outerHeight() + distanceToHijackedArea - $(window).height();

					if (distanceScrolled <= parseInt(distanceToHijackedArea, 10)
						|| distanceScrolled >= parseInt(distanceToWhereHijackedAreaEnds, 10)) {
						// natural scroll
					} else {
						var validScroll;
						if(lethargy) {
							validScroll = lethargy.check(e);
						}
						e.preventDefault()
						e.stopPropagation();
						if(!scrolling) {
							if(lethargy && validScroll === 1) {
					            scrollUp();
					        }
					        else if (lethargy && validScroll === -1) {
					        	scrollDown();
					        }
					        else if (lethargy && validScroll === false) {
					        	return false;
					        }
					        else if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
					            scrollUp();
					        }
					        else if (e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
					        	scrollDown();
					        }
						}

						return false;
					}
			    });
			};

			var unbindScroll = function() {
				$(window).unbind('mousewheel DOMMouseScroll wheel MozMousePixelScroll');
			}

			bindScroll();
		}
	}

	// Set default options
	$.smartscroll.defaults = {
		animationSpeed: 500,
		autoHash: true,
		breakpoint: null,
		initialScroll: true,
		headerHash: "header",
		keepHistory: false,
		mode: "vp", // "vp", "set"
		sectionClass: "section",
		sectionSelector: null,
		sectionScroll: true,
		sectionWrapperSelector: ".section-wrapper",
		eventEmitter: null
	}
}(jQuery));
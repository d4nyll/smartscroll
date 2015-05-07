(function ($) {
	var lethargy = new Lethargy();
	var options = {
		mode: "vp", // "vp", "set"
		autoHash: true,
		sectionScroll: true,
		initialScroll: true,
		keepHistory: false,
		sectionWrapperSelector: ".section-wrapper",
		sectionClass: "section",
		animationSpeed: 500,
		headerHash: "header",
		breakpoint: null
	}
	$.smartscroll = function(overrides) {
		this.validBreakPoint = false;
		this.belowBreakpoint = false;
		$.extend( options, overrides );
		if(options.breakpoint !== null && options.breakpoint === parseInt(options.breakpoint, 10) && options.breakpoint > 0) {
			this.validBreakPoint = true;
		}
		if (options.mode == "vp") {
			$('.' + options.sectionClass).css({
				"height": $(window).height()
			});
			$(window).bind('resize', function(e){
				$('.' + options.sectionClass).css({
					"height": $(window).height()
				});
			});
		}

		$('.' + options.sectionClass).css({
			"overflow": "hidden"
		});

		var slideCount = $('.' + options.sectionClass).length;
		var getCurrentSlideIndex = function (floor) {
			var slidePosition;
			if(options.mode == "vp") {
				slidePosition = -($('.' + options.sectionClass)[0].getBoundingClientRect().top / $(window).height());
				return floor ? Math.floor(slidePosition) : Math.round(slidePosition);
			} else {
				slidePosition = -1;
				var currentSlideRelPos;
				var nextSlideRelPos;
				var midLine = -($('.' + options.sectionClass)[0].getBoundingClientRect().top) + ($(window).height() / 2);
				if(midLine < 0) {
					return slidePosition;
				}
				for (var i = 0; i < slideCount; i++) {
					slidePosition = i;
					if(i < (slideCount - 1)) {
						currentSlideRelPos = $('.' + options.sectionClass + ':nth-of-type(' + (i + 1) + ')')[0].offsetTop - $(options.sectionWrapperSelector + ':first').position().top;
						nextSlideRelPos = $('.' + options.sectionClass + ':nth-of-type(' + (i + 2) + ')')[0].offsetTop - $(options.sectionWrapperSelector + ':first').position().top;
						if(currentSlideRelPos <= midLine && midLine < nextSlideRelPos) {
							break;
						}
					}
				}
				return slidePosition;
			}
		};

		var scrollToPixel = function (pixel, speed) {
			$('body,html').stop(true,true).animate({
				scrollTop: pixel
			}, speed, function() {
				scrolling = false;
			});
		}
		
		// Mouse Scroll
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
				scrolling = true;
				var scrollTopVal;
				var scrollSpeed = 0;
				if (slideIndex < 0) {
					scrollTopVal = $(options.sectionWrapperSelector + ':first').position().top - 53;
				} else if(slideIndex >= slideCount) {
					scrolling = false;
					return false;
				} else {
					scrollTopVal = $('.' + options.sectionClass + ':nth-of-type(' + (slideIndex + 1) + ')')[0].offsetTop;
					scrollSpeed = options.animationSpeed;
				}
				scrollToPixel(scrollTopVal, scrollSpeed);
				return false;
			};
			var scrollUp = function () {
				scrollTo(getCurrentSlideIndex() - 1);
			};
			var scrollDown = function () {
				scrollTo(getCurrentSlideIndex() + 1);
			};
			var bindScroll = function () {
				$(window).bind('mousewheel DOMMouseScroll', function(e){
					if(Math.max(window.document.body.scrollTop, document.documentElement.scrollTop) >= $(options.sectionWrapperSelector + ':first').position().top) {
						var validScroll = lethargy.check(e);
						e.preventDefault()
						e.stopPropagation();
						if(!scrolling) {
							if (validScroll === 1) {
					        	scrollUp();
					        } else if (validScroll === -1) {
					        	scrollDown();
					        }
						}
						return false;
					}
			    });
			};

			var unbindScroll = function() {
				$(window).unbind('mousewheel DOMMouseScroll');
			}

			bindScroll();
		}
		
		// Hash
		
		var currentHash = window.location.hash;
		if(options.autoHash) {
			$(window).bind('scroll', function(e){
				var newHash = $('.' + options.sectionClass + ':nth-of-type(' + (getCurrentSlideIndex(true) + 1) + ')').data('hash');
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

		// Scroll to hash
		
		if(options.initialScroll && currentHash.length > 0) {
			var matchedObject = $('[data-hash="' + currentHash.substr(1) + '"]');
			if(matchedObject.length > 0) {
				scrollToPixel(matchedObject[0].offsetTop, 0);
			}
		}
	}
}(jQuery));
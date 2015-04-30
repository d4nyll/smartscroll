(function ($) {
	var options = {
		mode: "vp", // "vp", "set"
		autoHash: true,
		sectionScroll: true,
		sectionWrapperSelector: ".section-wrapper",
		sectionClass: "section",
		animationSpeed: 300,
		headerHash: "header"
	}
	$.smartscroll = function(overrides) {
		$.extend( options, overrides );

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
		
		// Mouse Scroll
		if(options.sectionScroll) {
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
				$('body,html').stop(true,true).animate({
			        scrollTop: scrollTopVal
			    }, scrollSpeed, function() {
			    	scrolling = false;
			    });
				return false;
			};
			var scrollUp = function () {
				scrollTo(getCurrentSlideIndex() - 1);
			};
			var scrollDown = function () {
				scrollTo(getCurrentSlideIndex() + 1);
			};
			$(window).bind('mousewheel DOMMouseScroll', function(e){
				if(!scrolling
					&& Math.max(window.document.body.scrollTop, document.documentElement.scrollTop) >= $(options.sectionWrapperSelector + ':first').position().top
					) {
					e.preventDefault()
					e.stopPropagation();
					if(e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
			            scrollUp();
			        }
			        else {
			        	scrollDown();
			        }
				}
		    });
		}
		
		// Hash
		
		var currentHash = window.location.hash;
		if(options.autoHash) {
			$(window).bind('scroll', function(e){
				var newHash = $('.' + options.sectionClass + ':nth-of-type(' + (getCurrentSlideIndex(true) + 1) + ')').data('hash');
				if(typeof newHash === 'undefined') {
					window.location.hash = newHash = options.headerHash;
				}
				if(! (window.location.hash === ('#' + newHash))) {
					window.location.hash = newHash;
				}
		    });
		}
	}
}(jQuery));
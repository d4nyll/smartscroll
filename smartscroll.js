(function ($) {
	var options = {
		"pageWrapperSelector": ".page-wrapper",
		"sectionWrapperSelector": ".section-wrapper",
		"sectionClass": "section",
		"animationSpeed": 300
	}
	$.smartscroll = function(overrides) {
		$.extend( options, overrides );

		// Mouse Scroll

		var scrolling = false;
		var slideCount = $('.' + options.sectionClass).length;

		var getCurrentSlideIndex = function (floor) {
			if(floor) {
				return Math.floor(-($('.' + options.sectionClass)[0].getBoundingClientRect().top / $(window).height()));
			}
			return Math.round(-($('.' + options.sectionClass)[0].getBoundingClientRect().top / $(window).height()));
		}

		var scrollTo = function (slideIndex) {
			scrolling = true;
			$('body').animate({
		        scrollTop: $(options.sectionWrapperSelector + ':first').position().top + ( (slideIndex) * $(window).height())
		    }, options.animationSpeed, function() {
		    	scrolling = false;
		    });
			return false;
		}

		var scrollUp = function () {
			scrollTo(getCurrentSlideIndex() - 1);
		};
		var scrollDown = function () {
			scrollTo(getCurrentSlideIndex() + 1);
		};
		$(window).bind('mousewheel DOMMouseScroll', function(e){
			if(!scrolling
				&& window.document.body.scrollTop >= $(options.sectionWrapperSelector + ':first').position().top
				) {
				if(e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
		            scrollUp();
		        }
		        else {
		        	scrollDown();
		        }
			}
	    });
		$('.' + options.sectionClass).css({
			"overflow": "hidden",
			"height": $(window).height()
		});

		// Hash
		
		var currentHash = window.location.hash;
		
		$(window).bind('scroll', function(e){
			var newHash = $('.' + options.sectionClass + ':nth-of-type(' + (getCurrentSlideIndex(true) + 1) + ')').data('hash');
			if(! (window.location.hash === newHash)) {
				if(typeof newHash === 'undefined') {
					window.location.hash = '';
				} else {
					window.location.hash = newHash;
				}
			}
	    });
	}
}(jQuery));
(function ($) {
	var options = {
		"pageWrapperSelector": ".page-wrapper",
		"sectionWrapperSelector": ".section-wrapper",
		"sectionClass": "section",
		"animationSpeed": 300
	}
	$.smartscroll = function(overrides) {
		$.extend( options, overrides );

		var scrolling = false;
		var slideCount = $('.' + options.sectionClass).length;

		var getCurrentSlideIndex = function () {
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
	}
}(jQuery));
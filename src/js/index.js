// Let .page fill the whole window
$('.page').css('height', $(window).height());

function checkNavBarPosition() {
	var activeAnchor = $(".navbar-nav .active a")[0];
    if (activeAnchor.hash === "#hero") {
    	$(".navbar").removeClass("inbody");
    }
    else {
    	$(".navbar").addClass("inbody");
    }
}
checkNavBarPosition();

// scroll spy
$(window).on("scroll resize", function() {
    var mid = $(window).scrollTop() + $(window).height() / 2;

    $(".page").each(function() {
    	var elemTop = $(this).offset().top;
    	var elemBottom = elemTop + $(this).outerHeight();

        if (elemTop < mid && elemBottom > mid) {
    		$(".navbar-nav .active").removeClass("active");
    		var hash = "#" + $(this).attr("id");
    		$(".navbar-nav [href=" + hash + "]").parent().addClass("active");
    	}
    });

    checkNavBarPosition();
});

// mouse wheel scroll by page 
// $(window).on("wheel", function(event) { jQuery doesn't work
window.addEventListener("wheel", function wheelHandler(event) {
	var viewTop = $(window).scrollTop();
	var target;

    $(".page").each(function() {
    	var elemTop = $(this).offset().top;
    	if (event.deltaY < 0) { // scroll up
    		if (target && target.offset().top > elemTop) {
    			return;
    		}
    		if (elemTop < viewTop) {
    			target = $(this);
    		}
    	}
    	else { // scroll down
    		if (target && target.offset().top < elemTop) {
    			return;
    		}
    		if (elemTop > viewTop) {
    			target = $(this);
    		}
    	}
    });

    if (target) {
    	window.removeEventListener(event.type, wheelHandler);

    	$('html, body').animate({
    		scrollTop: target.offset().top
    	}, 500, function() {
    		window.addEventListener(event.type, wheelHandler);
    	});

    	event.preventDefault();
    }
});

// smooth scroll
$('a[href*=#]:not([href=#])').click(function() {
	if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
		var target = $(this.hash);
		if (target.length) {
			$('html, body').animate({
				scrollTop: target.offset().top
			}, 500);
			return false;
		}
	}
});
function checkNavBarPosition(){var a=$(".navbar-nav .active a")[0];"#hero"===a.hash?$(".navbar").removeClass("inbody"):$(".navbar").addClass("inbody")}checkNavBarPosition(),$(window).on("scroll resize",function(){var a=$(window).height(),b=$(window).scrollTop(),c=b+a;$(".page").each(function(){var d=$(this).offset().top,e=d+$(this).outerHeight(),f=Math.min(c,e)-Math.max(b,d);if(f>a/2){$(".navbar-nav .active").removeClass("active");var g="#"+$(this).attr("id");$(".navbar-nav [href="+g+"]").parent().addClass("active")}}),checkNavBarPosition()}),window.addEventListener("wheel",function a(b){var c,d=$(window).scrollTop();$(".page").each(function(){var a=$(this).offset().top;if(b.deltaY<0){if(c&&c.offset().top>a)return;d>a&&(c=$(this))}else{if(c&&c.offset().top<a)return;a>d&&(c=$(this))}}),c&&(window.removeEventListener(b.type,a),$("html, body").animate({scrollTop:c.offset().top},500,function(){window.addEventListener(b.type,a)}),b.preventDefault())}),$("a[href*=#]:not([href=#])").click(function(){if(location.pathname.replace(/^\//,"")===this.pathname.replace(/^\//,"")&&location.hostname===this.hostname){var a=$(this.hash);if(a.length)return $("html, body").animate({scrollTop:a.offset().top},500),!1}});
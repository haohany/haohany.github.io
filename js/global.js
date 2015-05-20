$('a').each(function() {
   if(this.host !== window.location.host) {
   		$(this).attr("target", "_blank");
   }
});

$('a').click(function() {
	this.blur();
});

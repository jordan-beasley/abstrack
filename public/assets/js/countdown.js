$('#clock').countdown('12/29/2017 21:34:30')
.on('update.countdown', function(event) {
	var format = '%H:%M:%S';
	if(event.offset.totalDays > 0) {
		format = '%-d day%!d ' + format;
	}
	if(event.offset.weeks > 0) {
		format = '%-w week%!w ' + format;
	}
	$(this).html(event.strftime(format));
})
.on('finish.countdown', function(event) {
  	$(this).html('<iframe width="560" height="349" src="https://www.youtube.com/embed/live_stream?channel=UC32wSiJJ0feluCeE_GxtL-g" frameborder="0" allowfullscreen></iframe><div id="mapBlock">Map Placeholder</div>')
    .parent().addClass('disabled');
});
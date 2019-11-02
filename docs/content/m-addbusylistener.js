document.write('\
\
<h2 id="m-addbusylistener">addBusyListener</h2>\
<div class="minfo">\
<div class="g21">listener</div><div class="g22">function(boolean)</div>\
</div>\
<p>\
Add a listener for the <b>busy</b> event. This event happens when the ticker is started or stopped, i.e. when property <a href="#p-busy"><span class="code">busy</span></a> \
changes. If an <em>rss-ticker</em> is busy it is either fetching a feed, or it is showing the items or the error message (a run).\
</p>\
<p>\
The <b>busy</b> listener function, <span class="code">listener</span>, is called with one argument which is a boolean \
which is <span class="code">true</span> when the ticker is busy (started), or <span class="code">false</span> when not (stopped).\
</p>\
<p>\
See <a href="#events">Events</a>.\
</p>\
\
');

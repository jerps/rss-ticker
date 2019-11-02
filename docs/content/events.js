document.write('\
\
<h1 id="events">Events</h1>\
<p>\
An <em>rss-ticker</em> emits two types of events. <b>Busy</b> events are emitted when a ticker\'s read-only property <a href="#p-busy"><span class="code">busy</span></a> changes. \
<b>Running</b> events are emitted when a ticker\'s read-only property <a href="#p-running"><span class="code">running</span></a> changes, i.e. when a run begins or ends. Stopping \
a ticker will emit a <b>running</b> event.\
</p>\
<p>\
Methods <a href="#m-addbusylistener"><span class="code">addBusyListener</span></a> and <a href="#m-addrunninglistener"><span class="code">addRunningListener</span></a> \
are used to add <b>busy</b> and <b>running</b> event listeners to an <em>rss-ticker</em>. They are removed with <a href="#m-removebusylistener"><span class="code">removeBusyListener</span></a> and \
<a href="#m-removerunninglistener"><span class="code">removeRunningListener</span></a>.\
</p>\
');
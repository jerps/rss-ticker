document.write('\
\
<h2 id="a-keep-url">keep-url (keepUrl)</h2>\
<div class="apinfo">\
<div class="g11">type</div><div class="g12">boolean</div>\
<div class="g21">default</div><div class="g22">false</div>\
</div>\
<p>\
Normally, when a run ends and the value of attribute <a href="#a-url"><span class="code">url</span></a> is a non-empty string which is different from the url \
used to fetch the feed, the new feed is fetched using the current value of <a href="#a-url"><span class="code">url</span></a>. This happens when the value \
of <a href="#a-url"><span class="code">url</span></a> is changed, or when method <a href="#m-startticker"><span class="code">startTicker</span></a> is called \
with an url and the value of attribute <a href="#a-url"><span class="code">url</span></a> is a different url (see <a href="startstop">Starting &amp; Stopping</a>).\
</p>\
<p>\
If this attribute is set (or the property is set to <span class="code">true</span>), then the url last used to fetch the feed is kept, and changing attribute <a href="#a-url"><span class="code">url</span></a> \
will have no effect.\
</p>\
');
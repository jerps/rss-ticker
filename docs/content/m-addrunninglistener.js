document.write('\
\
<h2 id="m-addrunninglistener">addRunningListener</h2>\
<div class="minfo">\
<div class="g21">listener</div><div class="g22">function(object)</div>\
</div>\
<p>\
Add a listener for the <b>running</b> event. This event happens when a run starts or ends, i.e. when property <a href="#p-running"><span class="code">running</span></a> \
changes. A <b>running</b> event is emitted when the ticker is stopped.\
</p>\
<p>\
The <b>running</b> listener function, <span class="code">listener</span>, is called with one argument which is an object \
with zero or more of the following properties. Each property may be <span class="code">undefined</span>. The properties \
pertain to the current run.\
<div class="item1-h">id</div>\
<div class="item1-d">\
The id of the <em>rss-ticker</em> element.\
</div>\
<div class="item1-h">running<span class="iptype">boolean</span></div>\
<div class="item1-d">\
Is <span class="code">true</span> when the run begins, or <span class="code">false</span> when it ends.\
</div>\
<div class="item1-h">url<span class="iptype">string</span></div>\
<div class="item1-d">\
The url used to fetch the feed of the run.\
</div>\
<div class="item1-h">proxyUrl<span class="iptype">string</span></div>\
<div class="item1-d">\
The proxy url used to fetch the feed of the run.\
</div>\
<div class="item1-h">title<span class="iptype">string</span></div>\
<div class="item1-d">\
The title of the feed.\
</div>\
<div class="item1-h">description<span class="iptype">string</span></div>\
<div class="item1-d">\
The description of the feed.\
</div>\
<div class="item1-h">image<span class="iptype">Image</span></div>\
<div class="item1-d">\
The image of the feed.\
</div>\
<div class="item1-h">errmsg<span class="iptype">string</span></div>\
<div class="item1-d">\
If fetching the feed resulted in an error then this property contains the error message. \
If this property is <span class="code">undefined</span> then no error occurred.\
</div>\
<div class="item1-h">inum<span class="iptype">number</span></div>\
<div class="item1-d">\
The number of items. This property is <span class="code">0</span> in case of an error.\
</div>\
</p>\
<p>\
See <a href="#events">Events</a>.\
</p>\
\
');

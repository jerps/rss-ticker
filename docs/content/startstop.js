document.write('\
\
<h1 id="startstop">Starting &amp; Stopping</h1>\
<p>\
An <em>rss-ticker</em> must be started either by specifying attribute <a href="#a-autostart"><span class="code">autostart</span></a> or by using Javascript to call <em>rss-ticker</em>\'s \
method <a href="#m-startticker"><span class="code">startTicker</span></a>.\
</p>\
<p>\
Method <a href="#m-startticker"><span class="code">startTicker</span></a> takes two arguments. Both are optional. The first is the url to fetch the feed from. If falsy then attribute \
<a href="#a-url"><span class="code">url</span></a> is used. Calling <a href="#m-startticker"><span class="code">startTicker</span></a> on an already running ticker will cause the ticker to \
immediately stop the current run, and fetch the feed using the given url. If attribute <a href="#a-cont-run"><span class="code">cont-run</span></a> (continue run) is \
set then the current run will keep running until the end, after which the ticker will fetch the (new) feed and start the next run. However, if the second argument to \
<a href="#m-startticker"><span class="code">startTicker</span></a> is truthy then the ticker is forced to immediately restart.\
</p>\
<p>\
An <em>rss-ticker</em> checks to see whether the current value of attribute <a href="#a-url"><span class="code">url</span></a> is different from the actual url \
that is used to fetch the feed, at the end of each run. If so the current value of <a href="#a-url"><span class="code">url</span></a> is used to fetch the feed \
This happens when the value of attribute <a href="#a-url"><span class="code">url</span></a> is changed or when the ticker has been (re)started by calling \
<a href="#m-startticker"><span class="code">startTicker</span></a> with an url (first argument). To ensure that the ticker keeps running with the current url, either set attribute \
<a href="#a-url"><span class="code">url</span></a> to <span class="code">null</span> or an empty string, or set attribute <a href="#a-keep-url"><span class="code">keep-url</span></a>.\
</p>\
<p>\
An <em>rss-ticker</em> is stopped by calling it\'s <a href="#m-stopticker"><span class="code">stopTicker</span></a> method. The ticker will stop immediately (and not display items anymore). \
If attribute <a href="#a-cont-run"><span class="code">cont-run</span></a> (continue run) is set (or the property is set to <span class="code">true</span>), then the ticker will not stop \
immediately and instead it stops at the end of the run.\
</p>\
');
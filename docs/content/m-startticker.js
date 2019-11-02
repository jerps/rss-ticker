document.write('\
\
<h2 id="m-startticker">startTicker</h2>\
<div class="minfo">\
<div class="g11">url</div><div class="g12">string (opt)</div>\
<div class="g21">immediate?</div><div class="g22">boolean (opt)</div>\
</div>\
<p>\
Start or restart an <em>rss-ticker</em>. The current run will end and the feed is fetched again. If attribute <a href="#a-cont-run"><span class="code">cont-run</span></a> \
is set the ticker will restart when the current run has been completed, unless argument <span class="code">immediate</span> is <span class="code">true</span>.\
</p>\
<p>\
If argument <span class="code">url</span> is given the ticker will fetch the feed using this url, instead of using \
the value of attribute <a href="#a-url"><span class="code">url</span></a>.\
</p>\
<p>\
See <a href="#rafeed">RSS/Atom Feed</a>.\
</p>\
\
');

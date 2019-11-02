document.write('\
\
<h2 id="a-proxy-url">proxy-url (proxyUrl)</h2>\
<div class="apinfo">\
<div class="g11">type</div><div class="g12">string</div>\
<div class="g21">default</div><div class="g22">""</div>\
</div>\
<p>\
When this attribute is set then the url that is used to fetch the feed is constructed by first taking the value of this attribute \
and then to replace the first occurrence of <span class="code">%%_URL_%%</span> with the value of attribute <a href="#a-url"><span class="code">url</span></a>.\
</p>\
<p>\
This attribute is useful when the feed should be fetched through another server or service. A service can be used \
to fetch the feed, passing the feed url as part of the proxy url (e.g. within the query string) for the service. This can be used \
to mitigate CORS restrictions.\
</p>\
<p>\
Changing the value of this attribute does not itself trigger a refetch. Whenever the feed is fetched next time the new proxy url \
will be in effect. Use method <a href="#m-startticker"><span class="code">startTicker</span></a> to immediately restart the ticker \
and fetch a new feed. See <a href="#startstop">Starting &amp; Stopping</a>.\
</p>\
');
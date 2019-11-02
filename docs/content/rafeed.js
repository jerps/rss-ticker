document.write('\
\
<h1 id="rafeed">RSS/Atom Feed</h1>\
<p>\
An <span class="code">&lt;rss-ticker&gt;</span> element usually has attribute <a href="#a-url"><span class="code">url</span></a> set to \
the url of the feed. The feed can support either the RSS format or the Atom format.\
</p>\
<p>\
When an <em>rss-ticker</em> starts it fetches the feed using the url specified with attribute <a href="#a-url"><span class="code">url</span></a>. \
Unless method <a href="#m-startticker"><span class="code">startTicker</span></a> is called with an url (see <a href="#startstop">Starting &amp; Stopping</a>). When a <em>run</em> ends \
(i.e. all items have been displayed) a <em>new</em> run begins and <em>rss-ticker</em> fetches the latest feed, but only when the number of minutes \
specified with attribute <a href="#a-refetch-mins"><span class="code">refetch-mins</span></a> have been passed since the last fetch.\
</p>\
<div style="display: flex; font-family: Arial; height: 4em; font-size: 120%;">\
<div style="margin: auto 0.5em auto 2em; color: red; font-weight: bold; font-size: 200%;">!</div>\
<div style="margin: auto 0 auto 0;">\
When the value of attribute <a href="#a-url"><span class="code">url</span></a> has been changed then the new feed will be fetched using the new url when the current \
run ends. However, if attribute <a href="#a-keep-url"><span class="code">keep-url</span></a> is set then the url used to fetch the feed will not change.\
</div>\
</div>\
<p>\
<em>rss-ticker</em> fetches the feed using Javascript\'s <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" target="_blank"><span class="code">fetch</span></a> \
function. Property <a href="#p-fetchopts"><span class="code">fetchOpts</span></a> can be set for an <em>rss-ticker</em>. The value is the "init" object \
(request options) for the call to <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" target="_blank"><span class="code">fetch</span></a>. \
It may contain several settings related to the fetching. See <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" target="_blank">Javascript documentation</a>.\
</p>\
<p>\
Attribute <a href="#a-proxy-url"><span class="code">proxy-url</span></a> can be set to an url to redirect the fetch. For example to fetch the feed through \
another server because of CORS restrictions. The url text <b>must</b> contain <span class="code">%%_URL_%%</span>. If this attribute is set, then the url \
used to fetch the feed is constructed by taking the value of <a href="#a-proxy-url"><span class="code">proxy-url</span></a> and to replace <span class="code">%%_URL_%%</span> \
with the feed url (attribute <a href="#a-url"><span class="code">url</span></a>).\
</p>\
<p>\
If something goes wrong while fetching a feed (e.g. a 404), the ticker will display just one item. The first (title) line of the item shows the error message, \
and the second line shows the actual (constructed) url that was used to fetch the feed. A new fetch will be performed \
(but maybe with another url) at the end of a run (showing the error message) when <a href="#a-refetch-mins"><span class="code">refetch-mins</span></a> minutes \
have been passed. Or, at the end of a run, when attribute <a href="#a-url"><span class="code">url</span></a> has been changed. An <em>rss-ticker</em> can always \
be restarted by calling it\'s method <a href="#m-startticker"><span class="code">startTicker</span></a>.\
</p>\
<p>\
Set attribute <a href="#a-no-imgs"><span class="code">no-imgs</span></a> to prevent fetching images.\
</p>\
');
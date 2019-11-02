document.write('\
\
<h1 id="usage">Usage</h1>\
<p>\
<em>rss-ticker</em> is simple to use. Add it to a page like any other element, set it\'s attributes, add some styling. \
No Javascript needed.\
</p>\
<p>\
For example, the following html code adds an <em>rss-ticker</em> with attributes <a href="#a-autostart"><span class="code">autostart</span></a> \
and <a href="#a-url"><span class="code">url</span></a>. See <a href="#attrprop">Attributes & Properties</a>.\
</p>\
<pre><code class="language-markup">\
&lt;rss-ticker id="rss" autostart="2" url="http://rss.cnn.com/rss/edition.rss"&gt;&lt;/rss-ticker&gt;\
</code></pre>\
<div style="display: flex; font-family: Arial; font-size: 95%; margin-left: 4em;">\
<div style="font-weight: bold; margin: 0 1em 0 0;">NOTE:</div>\
<div>\
The example given above probably does not work because of CORS restrictions. Attribute <a href="#a-proxy-url"><span class="code">proxy-url</span></a> \
can be used to redirect to another server to mitigate these restrictions. See <a href="#rafeed">RSS/Atom Feed</a>.\
</div>\
</div>\
<br>\
<p>\
The page with the <span class="code">&lt;rss-ticker&gt;</span> element(s) must have modules <em>webcomponents</em> (for browser compatibility) \
and <em>rss-ticker</em> added to the <span class="code">&lt;head&gt;</code></span> element.\
</p>\
<pre><code class="language-markup">\
&lt;head&gt;\n\
    .\n\
    .\n\
    &lt;script src="https://unpkg.com/@webcomponents/webcomponentsjs"&gt;&lt;/script&gt;\n\
    &lt;script src="https://unpkg.com/rss-ticker"&gt;&lt;/script&gt;\n\
&lt;/head&gt;\n\
</code></pre>\
<p>\
Or download <b>webcomponents-bundle.js</b> and <b>rss-ticker.min.js</b>.\
</p>\
<pre><code class="language-markup">\
&lt;head&gt;\n\
    .\n\
    .\n\
    &lt;script src="path/to/webcomponents-bundle.js"&gt;&lt;/script&gt;\n\
    &lt;script src="path/to/rss-ticker.min.js"&gt;&lt;/script&gt;\n\
&lt;/head&gt;\n\
</code></pre>\
<p>\
Property <span class="code">default</span> in global variable <span class="code">RssTicker</span> \
(which refers to a module) is bound to the HTML element class object of <em>rss-ticker</em>.\
</p>\
<pre><code class="language-javascript">\
var rssticker_class = RssTicker.default;\
</code></pre>\
<p>\
<em>rss-ticker</em> can also be consumed as an ES2015 module, when using Javascript and a tool like webpack.\
</p>\
<pre><code class="language-javascript">\
import RssTicker from \'rss-ticker\';\
</code></pre>\
<p>\
Or as a CommonJS module.\
</p>\
<pre><code class="language-javascript">\
var RssTicker = require(\'rss-ticker\');\
</code></pre>\
<p>\
The following Javascript sets the speed of the <em>rss-ticker</em> to 5, which will be effective immediately.\
</p>\
<pre><code class="language-javascript">\
var rss = document.querySelector(\'#rss\');\n\
rss.speed = 5;\
</code></pre>\
\
');
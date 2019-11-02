document.write('\
\
<h1 id="styling">Styling</h1>\
<p>\
An <span class="code">&lt;rss-ticker&gt;</span> element can be styled like any other element. For example by setting \
a font family and size.\
</p>\
<p>\
All styling that effects the size of an <span class="code">&lt;rss-ticker&gt;</span> element should be applied before \
the ticker is started. If they\'re applied while the ticker is running then the ticker will behave erratically because calculations \
are done using the wrong size of the ticker. Attributes that are part of <em>rss-ticker</em> such as \
<a href="#a-font-size"><span class="code">font-size</span></a> can be changed any time.\
</p>\
<p>\
Attributes <a href="#a-font-size"><span class="code">font-size</span></a>, <a href="#a-img-size"><span class="code">img-size</span></a>, \
<a href="#a-transparency"><span class="code">transparency</span></a>, <a href="#a-item-gap"><span class="code">item-gap</span></a>, \
<a href="#a-color-new"><span class="code">color-new</span></a>, <a href="#a-color-old"><span class="code">color-old</span></a>, \
<a href="#a-infobox-link-color"><span class="code">infobox-link-color</span></a>, <a href="#a-infobox-link-bgcolor"><span class="code">infobox-link-bgcolor</span></a> and \
<a href="#a-infobox-img-size"><span class="code">infobox-img-size</span></a> are used to style an <em>rss-ticker</em>.\
</p>\
<p>\
The styling of an info box is rather fixed. The main font-size is always 1rem. The font family, background color and transparency is \
the same as is used for the item. The size depends on the size of the contents (image and text).\
</p>\
');
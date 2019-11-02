document.write('\
\
<h2 id="a-color-old">color-old (colorOld)</h2>\
<div class="apinfo">\
<div class="g11">type</div><div class="g12">color</div>\
<div class="g21">default</div><div class="g22">"#00f"</div>\
<div class="g31">min</div><div class="g32">"#000"</div>\
<div class="g41">max</div><div class="g42">"#fff"</div>\
</div>\
<p>\
The background color of an item and it\'s info box, for items that are considered "old". An item is considered old \
if the time that has been passed since publication is more than the number of hours specified with attribute <a href="#a-hrs-old"><span class="code">hrs-old</span></a>.\
</p>\
<p>\
If this attribute has no value (i.e. not set or empty value ""), and <a href="#a-color-new"><span class="code">color-new</span></a> <u>does</u> have a value, then the value of \
property <a href="#a-color-old"><span class="code">colorOld</span></a> is the same as the value of <a href="#a-color-new"><span class="code">colorNew</span></a>.\
</p>\
<p>\
if an item is younger than <a href="#a-hrs-old"><span class="code">hrs-old</span></a> hours, and not younger than <a href="#a-hrs-new"><span class="code">hrs-new</span></a> hours, \
then the background color will be inbetween <a href="#a-color-old"><span class="code">color-old</span></a> and <a href="#a-color-new"><span class="code">color-new</span></a>.\
</p>\
');
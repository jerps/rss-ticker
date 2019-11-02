document.write('\
\
<h1 id="attrprop">Attributes & Properties</h1>\
<p>\
An <em>rss-ticker</em> supports several attributes to control it\'s behavior and style. Each attribute has a corresponding property \
having the same name, and which can be used to read and/or set the attribute value with Javascript. It does not matter whether \
an attribute value has been set by specifying it within the <span class="code">&lt;rss-ticker&gt;</span> element tag, or by using \
Javascript to set the corresponding property.\
</p>\
<p>\
By convention, attribute names are in kebab case (<span class="code">cont-run</span>) and property names are in camel case (<span class="code">contRun</span>).\
</p>\
<p>\
Attributes and the corresponding properties, if set, usually have a string value. The value of a boolean attribute, such as <a href="#a-cont-run"><span class="code">cont-run</span></a> \
(continue run), is ignored. A boolean attribute is either set: <span class="code">true</span>, or not set: <span class="code">false</span>. However, the corresponding boolean properties have \
a boolean value: <span class="code">true</span> or <span class="code">false</span>. A boolean property can be set to string values <span class="code">"true"</span> \
(<span class="code">true</span>) and <span class="code">"false"</span> (<span class="code">false</span>).\
</p>\
<p>\
Unlike with attributes, the value of a property is always within bounds. For example if attribute <a href="#a-speed"><span class="code">speed</span></a> is set \
to <span class="code">20</span>, by specifying the attribute in the <span class="code">&lt;rss-ticker&gt;</span> tag or by calling <span class="code">setAttribute</span> \
or by setting property <a href="#a-speed"><span class="code">speed</span></a>, then the value of the attribute is <span class="code">"20"</span> but the value of the \
property is <span class="code">"10"</span>, because the maximum speed is 10. Properties have a default value when the attribute has not been set or when the value is an \
empty string or can not be interpreted.\
</p>\
<p>\
For many attributes, when the <em>rss-ticker</em> is running, changing a value has immediate visible effect.\
</p>\
<p>\
The following sections describe all attributes/properties. If the property name is different from the attribute name then the \
property name is shown after the attribute name between parenthesis. Each attribute description specifies the type and default, minimum and maximum value \
of the property.\
</p>\
\
');

document.write('\
\
<h1 id="intro">Introduction</h1>\
<p>\
<em>rss-ticker</em> is a custom HTML element (<span class="code">display: flex</span>) which displays an RSS/Atom feed as a sequence of items which repeatedly \
scrolls horizontally to show all items. Using the mouse or touch, an <em>rss-ticker</em> can be controlled. To temporarily halt the ticker and show an info box \
with full content, or to let it scroll forwards and backwards at different speeds.\
</p>\
<p>\
The items are displayed in a color that is dependent on the item\'s publication date. By default, a "new" item is \
displayed in red and an "old" item is displayed in blue. Less new and less old items are displayed with a color inbetween \
red and blue. Attributes can be set to change these colors and to specify when an item is "new" or "old". Changing the value \
of most of the attributes is immediately effective.\
</p>\
<p>\
<span class="bullet1">&#9679;</span>&nbsp;<a href="https://johnerps.com/rss-ticker/demo.html">Demo Page</a>\
</p>\
<rss-ticker style="height: 7em;" autostart="3" url="http://rss.cnn.com/rss/edition.rss" proxy-url="https://johnerps.com/php/getfile.php?url=%%_URL_%%"></rss-ticker>\
<p>\
For each item the ticker displays the title and, if available, an image. Below the title the item\'s sequence number, \
it\'s publication time (local) and the time passed since publication (in days, hours and minutes) is shown.\
</p>\
<p>\
The time passed since publication, shown below an item\'s title, and the item\'s color, are regularly updated as \
time progresses.\
</p>\
<div style="display: flex; font-family: Arial; height: 4em; font-size: 120%;">\
<div style="margin: auto 0.5em auto 2em; color: red; font-weight: bold; font-size: 200%;">!</div>\
<div style="margin: auto 0 auto 0;">\
The period of time in which all the items of a feed scrolled through the space occupied by the ticker is called a <strong><em>run</em></strong>.\
</div>\
</div>\
<p>\
To stop a ticker, move the mouse within an item of the ticker, then press the mouse botton and hold (select the item). Or, touch \
an item and hold finger down. Moving to the left or right while holding the mouse button or finger down (i.e. "dragging") \
lets the ticker scroll right or left, resp. Moving the mouse or finger further away lets the ticker scroll faster. Releasing \
the mouse button or stop touching the ticker will let the ticker scroll normally again.\
</p>\
<p>\
While holding the mouse button or finger down on an item within the ticker, move up or down to display the info box of the \
currently selected item. The info box contains a link to the actual item / article, and a bigger image (if any) together with \
the complete description / contents of the item.\
</p>\
<div style="display: flex; font-family: Arial; font-size: 95%; margin-left: 4em;">\
<div style="font-weight: bold; margin: 0 1em 0 0;">NOTE:</div>\
<div>\
When using touch then the info box that is displayed is of the item that was first touched. Unlike when using the mouse, \
dragging over another item does not select it for displaying it\'s info box. Lift finger and touch again (and hold finger \
down) and drag up or down to display the info box of another item.\
</div>\
</div>\
<p>\
<img style="max-width: 100%;" src="images/screenshot01.png">\
</p>\
<p>\
<img style="max-width: 100%;" src="images/screenshot02.png">\
</p>\
<p>\
When the mouse button is released or the finger lifted within an info box, then the info box does not disappear and stays \
visible. And the ticker does not resume scrolling and stays fixed. Release the mouse button or lift the finger anywhere else \
and the ticker resumes normal scrolling and the info box disappears. When the info box and time stay fixed, click or touch anywhere \
outside the info box to let it disappear and let the ticker resume normal scrolling.\
</p>\
<p>\
An info box could be higher than the height of the viewport. In this case the upper or lower part of the info box is \
outside the viewport. Move the mouse, or touch, within the info box. Then hold the mouse button, or keep down finger, \
and move up or down to scroll the info box down or up, resp.\
</p>\
\
');

## rss-ticker v0.9.0 : RSS/Atom Feed Ticker As Custom HTML Element

**rss-ticker** is a custom html element which shows an RSS/Atom feed as a horizontal sequence of items which repeatedly scrolls horizontally to show all items. Using the mouse or touch the feed can be controlled: stop, fast forward, rewind, and an info box can be shown showing the full description / content of an item.

The items are shown in a color that is dependent on the item's publication date. Be default a "new" item is shown in red and an "old" item is shown in blue. Less new and less old items are shown with a color inbetween red and blue. Attributes can be set to change these colors and to specify when an item is "new" or "old".

![](screenshot01.png)

![](screenshot02.png)

***

[Demo page 1](https://johnerps.com/rss-ticker/demo.html)

[Demo page 2](https://johnerps.com#d) (click rss icon to edit attributes and see their effects)

[Full documentation](https://johnerps.com/rss-ticker/docs/index.html)

***

### Usage

Because rss-ticker is an html element it is very easy to use. Just add it as any other element to a page, set attributes, add some styling. No Javascript needed.

For example the following html code adds a rss-ticker and sets some attributes

````html

````

***

### License

rss-ticker is [MIT Licensed](LICENSE). You may use, distribute and copy it under the license terms.

***

### Changes

* v0.9.0 (2019-10-07)

  * Bugfixes / misc. lay-out changes.

  * Added attribute `descr-or-content`.

  * Pre-load info-box images.

* v0.8.2 (october 7, 2019)

  * Some bugfixes.

  * demo.html styling.

* v0.8.1 (october 6, 2019)

  * Some bugfixes.

  * Changed boolean `autostart` attribute to be the number of seconds to wait before start (0 = no autostart).

  * Added attribute `infobox-img-size`.

* v0.8.0 (october 6, 2019)

  * Bugfixes.

  * Added attribute `autostart`. Renamed attribute `moveright` to `scrollright`.

  * Added demo.html.

  * Started writing docs.

* v0.7.2 (october 5, 2019)

  * Bugfixes.

* v0.7.1 (september 29, 2019)

  * Show item sequence number.

* v0.7.0 (september 29, 2019)

  * Several bugfixes.

  * Changed defaults of attrs `url` and `proxy-url`.

  * The ticker items now center vertically within the vertical space of the rss-ticker element.

  * When `running` event is triggered the information object now also contains property `inum` which is the number of items.

* v0.6.0 (september 28, 2019)

  * Misc. changes & bugfixes.

* v0.5.0 (september 15, 2019)

  * Some bugfixes.

  * Added static read-only property `apNames` to `RssTicker`. It gives an array with all attribute/property names.

  * rss-ticker is now stable and fully functional.

* v0.4.1 (september 15, 2019)

  * Added static method `apNames` to return an array with attribute/property names.

* v0.4.0 (september 15, 2019)

  * Bugfixes. Misc. changes.

  * Added node_modules to repository.

* v0.3.3 (september 14, 2019)

  * Bugfixes.

* v0.3.2 (september 14, 2019)

  * Upgraded node modules.

* v0.3.1 (september 14, 2019)

  * Misc changes & bugfixes.

* v0.3.0 (july 5, 2019)

  * Misc. bugfixes. Added polyfills. Stable.

* v0.2.0 (june 24, 2019)

  * Used webpack/babel for packaging.

* v0.1.0 (may 22, 2019)

  * First working version.

* v0.0.0 (may 2019)

  * Initial commit. WIP.

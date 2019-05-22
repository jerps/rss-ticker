/*

rss-ticker v0.1.0

(c) 2017-2019 John Erps

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(async function() {

  const rssHtml = document.createElement('template');
  rssHtml.innerHTML = `
    <style>
      :host {
        display: inline-block;
        overflow: hidden;
      }
      :host([hidden]) {
        display: none;
      }
      #wrapper {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        white-space: nowrap;
        margin: 0;
        padding: 0;
        border-width: 0;
      }
      .item {
        padding: 0em 1em 0em 1em;
        border-width: 0;
      }
      .itemx {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0em 1em 0em 1.1em;
        border-width: 0;
      }
      .item-text {
        margin: 0;
        padding: 0 0 0 0.5em;
        border-width: 0;
      }
      .item-img-div {
        display: flex;
        margin: 0;
        padding: 0.25em 0.6em 0.25em 0;
        border-width: 0;
      }
      .item-img {
        margin: auto;
        max-height: 100%;
        padding: 0;
        border-width: 0;
      }
      .item-title {
        font-size: 110%;
        line-height: 1.7;
        margin: 0;
        padding: 0 0 0 0.15em;
        border-width: 0;
      }
      .item-date {
        font-size: 95%;
        line-height: 1.3;
        float: right;
        margin: 0 0.2em 0 0.15em;
        padding: 0;
        border-width: 0;
      }
    </style>
  `;

  class RssTicker extends HTMLElement {

    static get observedAttributes() {
      return ['speed', 'img-size', 'font-size', 'refetch-mins'];
    }

    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(document.importNode(rssHtml.content, true));
      this._impl = impl(this);
      this._impl.pv.channelListeners = [];
      this._impl.pv.connected = false;
      this._impl.pv.errmsg = undefined;
      this._impl.pv.fetchOpts = undefined;
      this._impl.pv.changedSpeed = false;
    }

    connectedCallback() {
      this._impl.upgradeProperty('speed');
      this._impl.upgradeProperty('imgSize');
      this._impl.upgradeProperty('fontSize');
      this._impl.upgradeProperty('refetchMins');
      this._impl.upgradeProperty('noImgs');
      this._impl.pv.connected = true;
    }

    disconnectedCallback() {
      this._impl.stop();
      this._impl.pv.connected = false;
    }

    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case 'speed':
          this._impl.pv.changedSpeed = true;
          break;
        case 'img-size':
        this._impl.imgSizeChanged();
        break;
        case 'font-size':
          this._impl.fontSizeChanged();
          break;
      }
    }

    set url(value) {
      this.setAttribute('url', String(value));
    }

    get url() {
      return this.hasAttribute('url') ? this.getAttribute('url') : '';
    }

    set speed(value) {
      let v = Number(value);
      if (!isNaN(v)) {
        this.setAttribute('speed', String(v < 1 ? 1 : v > 10 ? 10 : v));
      }
    }

    get speed() {
      return this.hasAttribute('speed') ? Number(this.getAttribute('speed')) : 2;
    }

    set imgSize(value) {
      let v = Number(value);
      if (!isNaN(v)) {
        this.setAttribute('img-size', String(v < 0.000001 ? 0.000001 : v > 999999 ? 999999 : v));
      }
    }

    get imgSize() {
      return this.hasAttribute('img-size') ? Number(this.getAttribute('img-size')) : 4;
    }

    set fontSize(value) {
      let v = Number(value);
      if (!isNaN(v)) {
        this.setAttribute('font-size', String(v < 0.000001 ? 0.000001 : v > 999999 ? 999999 : v));
      }
    }

    get fontSize() {
      return this.hasAttribute('font-size') ? Number(this.getAttribute('font-size')) : 1;
    }

    set refetchMins(value) {
      let v = Number(value);
      if (!isNaN(v)) {
        this.setAttribute('refetch-mins', String(v < 0.000001 ? 0.000001 : v > 999999 ? 999999 : v));
      }
    }

    get refetchMins() {
      return this.hasAttribute('refetch-mins') ? Number(this.getAttribute('refetch-mins')) : 15;
    }

    set noImgs(value) {
      let v = Boolean(value);
      if (v) {
        this.setAttribute('no-imgs', '');
      } else {
        this.removeAttribute('no-imgs');
      }
    }

    get noImgs() {
      return this.hasAttribute('no-imgs');
    }

    get errmsg() {
      return this._impl.pv.errmsg || '';
    }

    set fetchOpts(opts) {
      this._impl.pv.fetchOpts = Object.assign({}, opts);
    }

    get fetchOpts() {
      return this._impl.pv.fetchOpts || {};
    }

    startTicker(url) {
      this._impl.start(url);
    }

    stopTicker() {
      this._impl.stop();
    }

    addChannelListener(l) {
      this._impl.pv.channelListeners.push(l);
    }

    removeChannelListener(l) {
      let i = this._impl.pv.channelListeners.indexOf(l);
      if (i >= 0) {
        this._impl.pv.channelListeners.splice(i, 1);
      }
    }

  }

  let ready = false, phimg = null;

  function impl(elem) {

  let implexp = {pv: {}};

  let root = elem.shadowRoot, tickc = 0, wrapper = null, wrapperc = 0, showedImgs = true;

  let speed = 0;

  function getSpeed() {
    if (speed === 0 || implexp.pv.changedSpeed) {
      speed = elem.speed;
      implexp.pv.changedSpeed = false;
    }
    return speed;
  }

  imgSizeChangedCallback = null;
  implexp.imgSizeChanged = function() {
    if (imgSizeChangedCallback) {
      imgSizeChangedCallback();
    }
  };

  fontSizeChangedCallback = null;
  implexp.fontSizeChanged = function() {
    if (fontSizeChangedCallback) {
      fontSizeChangedCallback();
    }
  };

  function runticker(f, url) {
    if (tickc >= Number.MAX_SAFE_INTEGER) {
      tickc = 0;
    }
    tickc++;
    if (f !== false) {
      tick(tickc, url);
    }
  }

  function startticker(url) {
    runticker(true, url);
  }
  implexp.start = startticker;

  function stopticker() {
    runticker(false);
    imgSizeChangedCallback = null;
    fontSizeChangedCallback = null;
  }
  implexp.stop = stopticker;

  implexp.triggerChannelEvent = function(o) {
    implexp.pv.channelListeners.forEach(l => l.call(elem, Object.assign({}, o)));
  };

  implexp.upgradeProperty = function(prop) {
    if (elem.hasOwnProperty(prop)) {
      let v = elem[prop];
      delete elem[prop];
      elem[prop] = v;
    }
  };

  function tick(tc, url) {

    url = sanitizedUrl(url || elem.url);

    let rsslist = [{id:elem.id||'', hasImgs: false, reqImgs: !elem.noImgs}];
    let fetched = false, fetching = false, rssstart = false, rsserr = false;
    let elemlen = 0, elemlen2 = 0, itemslen = 0, pos = 0, pos2 = 0, elemlent = 0, post = 0, posd = 0;
    let itemEls = [];
    let itemGap, itemGapf = 40;
    let refetcht = performance.now();
    let initItemElsBusy = false, initItemElsBusy2 = false;

    itemGap = (itemGap = Math.trunc(elem.getBoundingClientRect().width / itemGapf)) < 5 ? 5 : itemGap;

    implexp.pv.errmsg = undefined;

    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = 'wrapper';
      root.appendChild(wrapper);
    }
    wrapperc = tc;

    wrapper.style.fontSize = '' + (elem.fontSize * 100) + '%';

    initItemEls('Fetching', 'RSS', showedImgs ? phimg : null, true);

    imgSizeChangedCallback = function() {
      if (!initItemElsBusy) {
        itemEls.forEach(e => {if (e[0]) {e[0].style.height = '' + elem.imgSize + 'em';}});
        calcItemslen();
      }
    };

    fontSizeChangedCallback = function() {
      wrapper.style.fontSize = '' + (elem.fontSize * 100) + '%';
      if (!initItemElsBusy) {
        calcItemslen();
      }
    };

    function stop() {
      return !ready || !implexp.pv.connected || tc !== tickc;
    }

    function release() {
      if (wrapper && wrapperc === tc) {
        wrapper.remove();
        wrapper = null;
      }
    }

    let af = function(t) {
      if (stop()) {
        release();
        return;
      }
      if (!initItemElsBusy && !initItemElsBusy2) {
        if (pos > 1) {
          pos = pos2 = post = 0;
          if (!rsserr) {
            if ((performance.now() - refetcht) / 60000 > elem.refetchMins) {
              startticker(url);
            } else if (!rsslist[0].reqImgs && !elem.noImgs) {
              startticker(url);
            } else if (rsslist[0].reqImgs && elem.noImgs) {
              rsslist[0].reqImgs = false;
              if (rsslist[0].hasImgs) {
                initItemEls();
              }
            }
          }
        } else {
          if (!fetching) {
            if (!fetched) {
              startFetch();
            } else {
              if (rssstart) {
                calcPos(t);
              } else {
                rssstart = true;
                implexp.triggerChannelEvent(rsslist[0]);
                elemlen = elemlen2 = elem.getBoundingClientRect().width;
                if (rsserr) {
                  implexp.pv.errmsg = rsslist[0].error;
                  initItemEls('ERROR', rsslist[0].error, showedImgs ? phimg : null);
                } else {
                  initItemEls();
                }
              }
            }
          }
        }
      }
      requestAnimationFrame(af);
    };

    function calcPos(t) {
      if (t - elemlent > 500) {
        elemlent = t;
        elemlen2 = elem.getBoundingClientRect().width;
        if (elemlen !== elemlen2) {
          elemlen = elemlen2;
          itemGap = (itemGap = Math.trunc(elemlen / itemGapf)) < 5 ? 5 : itemGap;
          setItemGaps();
          calcItemslen();
          pos = pos2;
          posd = 0;
        }
        pos2 = pos;
      }
      wrapper.style.left = '' + (elemlen + 20 - Math.trunc((elemlen + 40 + itemslen) * pos)) + 'px';
      if (post > 0) {
        pos += posd * (t - post) / 100;
      }
      if (posd === 0 || t - post > 100) {
        posd = elemlen * 100 / (50000 - 49900 * Math.log2(getSpeed()) / 3.321928094887362) / (elemlen + 100 + itemslen);
        post = t;
      }
    }

    async function initItemEls(msg1, msg2, img, c) {
      initItemElsBusy = true;
      wrapper.style.transition = 'opacity 2s ease-out';
      wrapper.style.opacity = '0';
      await (new Promise((res,rej) => {
        setTimeout(() => res(null), 2000);
      }));
      clearItemEls();
      if (c) {
        elem.style.display = 'flex';
        elem.style.justifyContent = 'center';
      } else {
        elem.style.display = 'inline-block';
      }
      itemslen = 0;
      if (msg1 || msg2) {
        if (img) {
          showedImgs = true;
        }
        addItemEl(msg1, msg2, img);
      } else {
        for (let i = 1; i < rsslist.length; i++) {
          if (rsslist[0].reqImgs && rsslist[i].image) {
            showedImgs = true;
          }
          addItemEl(rsslist[i].title, rsslist[i].pubDate, rsslist[0].reqImgs ? rsslist[i].image : null);
        }
      }
      setItemGaps();
      wrapper.style.transition = 'opacity 3s ease-in';
      wrapper.style.opacity = '1';
      calcItemslen();
      initItemElsBusy = false;
      if (c) {
        initItemElsBusy2 = true;
        await (new Promise((res,rej) => {
          setTimeout(() => res(null), 3000);
        }));
        initItemElsBusy2 = false;
      }
    }

    function clearItemEls() {
      itemEls = [];
      itemslen = 0;
      wrapper.innerHTML = '';
      wrapper.style.left = 'auto';
      showedImgs = false;
    }

    function calcItemslen() {
      itemslen = 0;
      itemEls.forEach(e => {itemslen += e[1].getBoundingClientRect().width + itemGap;});
    }

    function addItemEl(title, pubDate, img) {
      let e, e2, e3, e4;
      e = document.createElement('div');
      e.style.borderStyle = 'dotted';
      e.style.borderColor = 'rgba(255, 100, 100, 1)';
      e.style.borderWidth = '2px';
      let lg = 'radial-gradient(';
      lg += 'rgba(255, 100, 100, 1), rgba(255, 100, 100, 0))';
      e.style.background = lg;
      wrapper.appendChild(e);
      e3 = e;
      e4 = null;
      if (img) {
        img.setAttribute('class', 'item-img');
        e.setAttribute('class', 'itemx');
        e4 = document.createElement('div');
        e4.setAttribute('class', 'item-img-div');
        e4.style.height = '' + elem.imgSize +'em';
        e4.style.width = 'auto';
        e4.appendChild(img);
        e.appendChild(e4);
        e = document.createElement('div');
        e.setAttribute('class', 'item-text');
        e.style.borderStyle = 'dotted';
        e.style.borderColor = 'rgba(255, 100, 100, 1)';
        e.style.borderWidth = '0 0 0 4px';
        e3.appendChild(e);
      } else {
        e.setAttribute('class', 'item');
      }
      itemEls.push([e4, e3]);
      e2 = document.createElement('div');
      e2.setAttribute('class', 'item-title');
      e2.innerHTML = title.trim() || '- - -';
      e.appendChild(e2);
      e2 = document.createElement('div');
      e2.setAttribute('class', 'item-date');
      let s;
      if (typeof pubDate === 'string' || pubDate instanceof String) {
        s = pubDate.trim();
      } else if (pubDate) {
        s = pubDate.toLocaleString();
      }
      e2.innerHTML = s.trim() || '- - -';
      e.appendChild(e2);
      if (img) {
        img.style.borderRadius = '' + Math.trunc((img.getBoundingClientRect().width + img.getBoundingClientRect().height) / 2 / 5) + 'px';
      }
    }

    function setItemGaps() {
      itemEls.forEach(e => {
        e[1].style.margin = '0px 0px 0px ' + itemGap + 'px';
        e[1].style.borderRadius = '' + itemGap + 'px';
      });
    }

    function sanitizedUrl(url) {
      if (!url) {
        return undefined;
      }
      let u = String(url).trim();
      if (u.length === 0) {
        return undefined;
      }
      return u;
    }

    async function startFetch() {

      fetching = true;

      function endFetch(err) {
        if (err) {
          rsserr = true;
          rsslist[0].error = err;
        }
        fetching = false;
        fetched = true;
        return undefined;
      }

      try {

        if (!url) {
          return endFetch('No url.');
        }

        let r = await fetch(url, elem.fetchOpts);
        if (stop()) {
          endFetch(null);
        }
        if (!r.ok) {
          throw new Error('HTTP response not ok (' + r.status + ' ' + r.statusText() + ').');
        }

        let t = String(await r.text()).trim();
        if (stop()) {
          endFetch(null);
        }
        if (t.length === 0) {
          throw new Error('HTTP response has empty body.');
        }

        let p = new DOMParser();
        let perrNS = p.parseFromString('INVALID', 'text/xml').getElementsByTagName('parsererror')[0].namespaceURI;
        let d = p.parseFromString(t, 'text/xml');
        if(d.getElementsByTagNameNS(perrNS, 'parsererror').length > 0) {
          throw new Error('Could not parse RSS XML.');
        }
        let c = d.querySelectorAll('channel');
        if (c.length === 0) {
          throw new Error('RSS feed contains no <channel> element.');
        }
        if (c.length > 1) {
          throw new Error('RSS feed contains more than one <channel> element.');
        }

        let n = c[0].children;

        let lip = [], x;

        for (let i = 0; i < n.length; i++) {
          let e = n[i], t = e.tagName.toLowerCase();
          switch(t) {
            case 'title':
              if (e.textContent) {
                rsslist[0].title = e.textContent.trim();
              }
              break;
            case 'link':
              if (e.textContent) {
                rsslist[0].link = e.textContent.trim();
              }
              break;
            case 'pubdate':
              if (e.textContent && (x = dateFromString(e.textContent))) {
                rsslist[0].pubDate = x;
              }
              break;
            case 'description':
              if (e.textContent) {
                rsslist[0].description = e.textContent.trim();
              }
              break;
            case 'image':
              if ((e = e.querySelector('url')) && e.textContent && (x = extractImgUrl(e.textContent))) {
                loadImg(0, x);
              }
              break;
            case 'item':
              rsslist.push({});
              loadItem(e, rsslist.length - 1);
              break;
          }
        }

        if (rsslist.length === 1) {
          n = d.querySelectorAll('item');
          for (let i = 0; i < n.length; i++) {
            rsslist.push({});
            loadItem(n[i], rsslist.length - 1);
          }
        }

        if (rsslist[0].reqImgs) {
          for (let a of lip) {
            let i = null;
            if (a[1]) {
              try {
                i = await a[1];
              } catch(e) {}
            }
            if (stop()) {
              break;
            }
            if (i) {
              rsslist[a[0]].image = i;
              rsslist[0].hasImgs = true;
            } else if (a[2]) {
              try {
                i = await a[2];
              } catch(e) {}
              if (stop()) {
                break;
              }
              if (i) {
                rsslist[a[0]].image = i;
                rsslist[0].hasImgs = true;
              }
            }
          }
        }

        if (stop()) {
          return endFetch(null);
        }

        if (rsslist.length === 1) {
          throw new Error('RSS feed does not contain any items.');
        }

        function loadItem(ie, li) {
          let n = ie.children, ue = null, ut = null, ud = null;
          for (let i = 0; i < n.length; i++) {
            let e = n[i], t = e.tagName.toLowerCase();
            switch(t) {
              case 'title':
                if (e.textContent) {
                  rsslist[li].title = e.textContent.trim();
                }
                break;
              case 'link':
                if (e.textContent) {
                  rsslist[li].link = e.textContent.trim();
                }
                break;
              case 'pubdate':
                if (e.textContent && (x = dateFromString(e.textContent))) {
                  rsslist[li].pubDate = x;
                }
                break;
              case 'description':
                if (e.textContent) {
                  rsslist[li].description = e.textContent.trim();
                  if (!ut) {
                    ut = extractImgUrl(e.textContent);
                  }
                }
                break;
              case 'enclosure':
                if (e.hasAttribute('url') && !ue) {
                  ue = extractImgUrl(e.getAttribute('url'));
                }
                break;
              default:
                if (e.hasAttribute('url') && !ud) {
                  ud = extractImgUrl(e.getAttribute('url'));
                }
                break;
            }
          }
          if (ue && ud) {
            loadImg(li, ue, ud);
          } else if (ue && ut) {
            loadImg(li, ue, ut);
          } else if (ue) {
            loadImg(li, ue);
          } else if (ud && ut) {
            loadImg(li, ud, ut);
          } else if (ud) {
            loadImg(li, ud);
          } else if (ut) {
            loadImg(li, ut);
          }
        }

        function dateFromString(s) {
          let d = new Date(s);
          if (Object.prototype.toString.call(d) === '[object Date]') {
            if (isNaN(d.getTime())) {
              return null;
            }
          } else {
            return null;
          }
          return d;
        }

        function extractImgUrl(s) {
          let a = s.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g);
          return a ? a.length > 0 ? a[0] : null : null;
        }

        function loadImg(itemno, url, url2) {
          if (rsslist[0].reqImgs) {
            lip.push([itemno, loadImgProm(url), url2 ? loadImgProm(url2) : null]);
          }
        }

        function loadImgProm(url) {
          return new Promise((res, rej) => {
            let i = new Image();
            i.src = url;
            i.onload = () => res(i);
            i.onerror = () => res(null);
          });
        }

      } catch(e) {
        return endFetch(e.message || 'Could not fetch or parse RSS.');
      }

      return endFetch(null);
    }

    requestAnimationFrame(af);
  }

    return implexp;
  }

  phimg = new Image();
  phimg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAEGWlDQ1BrQ0dDb2xvclNwYWNlR2VuZXJpY1JHQgAAOI2NVV1oHFUUPrtzZyMkzlNsNIV0qD8NJQ2TVjShtLp/3d02bpZJNtoi6GT27s6Yyc44M7v9oU9FUHwx6psUxL+3gCAo9Q/bPrQvlQol2tQgKD60+INQ6Ium65k7M5lpurHeZe58853vnnvuuWfvBei5qliWkRQBFpquLRcy4nOHj4g9K5CEh6AXBqFXUR0rXalMAjZPC3e1W99Dwntf2dXd/p+tt0YdFSBxH2Kz5qgLiI8B8KdVy3YBevqRHz/qWh72Yui3MUDEL3q44WPXw3M+fo1pZuQs4tOIBVVTaoiXEI/MxfhGDPsxsNZfoE1q66ro5aJim3XdoLFw72H+n23BaIXzbcOnz5mfPoTvYVz7KzUl5+FRxEuqkp9G/Ajia219thzg25abkRE/BpDc3pqvphHvRFys2weqvp+krbWKIX7nhDbzLOItiM8358pTwdirqpPFnMF2xLc1WvLyOwTAibpbmvHHcvttU57y5+XqNZrLe3lE/Pq8eUj2fXKfOe3pfOjzhJYtB/yll5SDFcSDiH+hRkH25+L+sdxKEAMZahrlSX8ukqMOWy/jXW2m6M9LDBc31B9LFuv6gVKg/0Szi3KAr1kGq1GMjU/aLbnq6/lRxc4XfJ98hTargX++DbMJBSiYMIe9Ck1YAxFkKEAG3xbYaKmDDgYyFK0UGYpfoWYXG+fAPPI6tJnNwb7ClP7IyF+D+bjOtCpkhz6CFrIa/I6sFtNl8auFXGMTP34sNwI/JhkgEtmDz14ySfaRcTIBInmKPE32kxyyE2Tv+thKbEVePDfW/byMM1Kmm0XdObS7oGD/MypMXFPXrCwOtoYjyyn7BV29/MZfsVzpLDdRtuIZnbpXzvlf+ev8MvYr/Gqk4H/kV/G3csdazLuyTMPsbFhzd1UabQbjFvDRmcWJxR3zcfHkVw9GfpbJmeev9F08WW8uDkaslwX6avlWGU6NRKz0g/SHtCy9J30o/ca9zX3Kfc19zn3BXQKRO8ud477hLnAfc1/G9mrzGlrfexZ5GLdn6ZZrrEohI2wVHhZywjbhUWEy8icMCGNCUdiBlq3r+xafL549HQ5jH+an+1y+LlYBifuxAvRN/lVVVOlwlCkdVm9NOL5BE4wkQ2SMlDZU97hX86EilU/lUmkQUztTE6mx1EEPh7OmdqBtAvv8HdWpbrJS6tJj3n0CWdM6busNzRV3S9KTYhqvNiqWmuroiKgYhshMjmhTh9ptWhsF7970j/SbMrsPE1suR5z7DMC+P/Hs+y7ijrQAlhyAgccjbhjPygfeBTjzhNqy28EdkUh8C+DU9+z2v/oyeH791OncxHOs5y2AtTc7nb/f73TWPkD/qwBnjX8BoJ98VQNcC+8AAAALSURBVAgdY2AAAgAABQABjbub8wAAAABJRU5ErkJggg==';
  phimg = await (new Promise((res, rej) => {
    phimg.onload = () => res(phimg);
    phimg.onerror = () => res(null);
  }));

  customElements.define('rss-ticker', RssTicker);

  customElements.whenDefined('rss-ticker').then(() => ready = true);

})();

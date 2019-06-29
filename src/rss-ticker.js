/*

rss-ticker v0.2.0

(c) 2019 John Erps

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

const dftColorNew = [255, 0, 0], dftColorOld = [0, 0, 255], dftHrsNew = 1, dftHrsOld = 12, updItemTimingInterval = 20;

const rssHtml = document.createElement('template');
rssHtml.innerHTML = `
  <style>
    *, *:before, *:after {
      box-sizing: border-box;
    }
    :host {
      display: inline-block;
      overflow-x: hidden;
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
      cursor: default;
    }
    .itemcont {
      border-width: 0;
      margin: 0;
      padding: 0;
    }
    .item {
      border-width: 0;
      margin: 0;
      padding: 0;
      display: flex;
      user-select: none;
    }
    .itemnoimg {
      padding: 0.3em 1em 0.4em 1em;
      flex-direction: column;
    }
    .itemimg {
      padding: 0.2em 0.8em 0.2em 1.1em;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .item-text {
      margin: 0;
      padding: 0 0 0 0.7em;
      border-width: 0;
    }
    .item-img-div {
      display: flex;
      margin: 0;
      padding: 0.25em 0.8em 0.25em 0;
      border-width: 0;
    }
    .item-img {
      margin: auto;
      max-height: 100%;
      padding: 0;
      border-width: 0;
    }
    .item-title {
      font-size: 112%;
      line-height: 1.7;
      margin: 0;
      padding: 0 0 0 0.15em;
      border-width: 0;
    }
    .item-date {
      font-size: 97%;
      line-height: 1.3;
      margin: 0 0.2em 0 0.3em;
      padding: 0;
      border-width: 0;
    }
  </style>
`;

export default class RssTicker extends HTMLElement {

  static get observedAttributes() {
    return ['speed', 'img-size', 'font-size', 'item-gap', 'color-new', 'color-old', 'hrs-new', 'hrs-old', 'transparency', 'move-right'];
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(document.importNode(rssHtml.content, true));
    this._impl = impl(this);
    this._impl.pv.fetchedListeners = [];
    this._impl.pv.runListeners = [];
    this._impl.pv.busyListeners = [];
    this._impl.pv.connected = false;
    this._impl.pv.errmsg = undefined;
    this._impl.pv.fetchOpts = undefined;
    this.setAttribute('color-new', 'rgb(' + dftColorNew[0] + ', ' + dftColorNew[1] + ', ' + dftColorNew[2] +')');
    this.setAttribute('color-old', 'rgb(' + dftColorOld[0] + ', ' + dftColorOld[1] + ', ' + dftColorOld[2] +')');
  }

  connectedCallback() {
    this._impl.upgradeProperty('url');
    this._impl.upgradeProperty('speed');
    this._impl.upgradeProperty('imgSize');
    this._impl.upgradeProperty('fontSize');
    this._impl.upgradeProperty('itemGap');
    this._impl.upgradeProperty('colorNew');
    this._impl.upgradeProperty('colorOld');
    this._impl.upgradeProperty('hrsNew');
    this._impl.upgradeProperty('hrsOld');
    this._impl.upgradeProperty('transparency');
    this._impl.upgradeProperty('infoBoxLinkColor');
    this._impl.upgradeProperty('infoBoxLinkBgColor');
    this._impl.upgradeProperty('keepUrl');
    this._impl.upgradeProperty('refetchMins');
    this._impl.upgradeProperty('noImgs');
    this._impl.upgradeProperty('moveRight');
    this._impl.upgradeProperty('proxyUrl');
    this._impl.upgradeProperty('cancelRun');
    this._impl.pv.connected = true;
  }

  disconnectedCallback() {
    this._impl.stop(true);
    this._impl.pv.connected = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'speed':
        this._impl.speedChanged();
        break;
      case 'img-size':
        this._impl.imgSizeChanged();
        break;
      case 'font-size':
        this._impl.fontSizeChanged();
        break;
      case 'item-gap':
        this._impl.itemGapChanged();
        break;
      case 'color-new':
        this._impl.colorChanged();
        break;
      case 'color-old':
        this._impl.colorChanged();
        break;
      case 'hrs-new':
        this._impl.hrsNewChanged();
        break;
      case 'hrs-old':
        this._impl.hrsOldChanged();
        break;
      case 'transparency':
        this._impl.transparencyChanged();
        break;
      case 'infobox-link-color':
        this._impl.infoBoxLinkColorChanged();
        break;
      case 'infobox-link-bgcolor':
        this._impl.infoBoxLinkBgColorChanged();
        break;
      case 'move-right':
        this._impl.moveRightChanged();
        break;
    }
  }

  set url(value) {
    this.setAttribute('url', String(value).trim());
  }

  get url() {
    return this.hasAttribute('url') ? this.getAttribute('url') : '';
  }

  set speed(v) {
    this.setAttribute('speed', String(v));
  }

  get speed() {
    let v;
    v = (v = (this.hasAttribute('speed') ? this.getAttribute('speed') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? 3 : v < 1 ? 1 : v > 10 ? 10 : v;
  }

  set imgSize(v) {
    this.setAttribute('img-size', String(v));
  }

  get imgSize() {
    let v;
    v = (v = (this.hasAttribute('img-size') ? this.getAttribute('img-size') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? 4 : v < 0.000001 ? 0.000001 : v > 999999 ? 999999 : v;
  }

  set fontSize(v) {
    this.setAttribute('font-size', String(v));
  }

  get fontSize() {
    let v;
    v = (v = (this.hasAttribute('font-size') ? this.getAttribute('font-size') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? 1 : v < 0.000001 ? 0.000001 : v > 999999 ? 999999 : v;
  }

  set itemGap(v) {
    this.setAttribute('item-gap', String(v));
  }

  get itemGap() {
    let v;
    v = (v = (this.hasAttribute('item-gap') ? this.getAttribute('item-gap') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? 1 : v < 0.000001 ? 0.000001 : v > 999999 ? 999999 : v;
  }

  set colorNew(v) {
    this.setAttribute('color-new', String(v));
  }

  get colorNew() {
    let v = this.hasAttribute('color-new') ? this.getAttribute('color-new').trim() : '';
    if (v.length === 0) {
      return this.hasAttribute('color-old') ? this.getAttribute('color-old').trim() : '';
    } else {
      return v;
    }
  }

  set colorOld(v) {
    this.setAttribute('color-old', String(v));
  }

  get colorOld() {
    let v = this.hasAttribute('color-old') ? this.getAttribute('color-old').trim() : '';
    if (v.length === 0) {
      return this.hasAttribute('color-new') ? this.getAttribute('color-new').trim() : '';
    } else {
      return v;
    }
  }

  set hrsNew(v) {
    this.setAttribute('hrs-new', String(v));
  }

  get hrsNew() {
    let v;
    v = (v = (this.hasAttribute('hrs-new') ? this.getAttribute('hrs-new') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? dftHrsNew : v < 0.000001 ? 0.000001 : v > 999999 ? 999999 : v;
  }

  set hrsOld(v) {
    this.setAttribute('hrs-old', String(v));
  }

  get hrsOld() {
    let v;
    v = (v = (this.hasAttribute('hrs-old') ? this.getAttribute('hrs-old') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? dftHrsOld : v < 0.000001 ? 0.000001 : v > 999999 ? 999999 : v;
  }

  set transparency(v) {
    this.setAttribute('transparency', String(v));
  }

  get transparency() {
    let v;
    v = (v = (this.hasAttribute('transparency') ? this.getAttribute('transparency') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? 0.8 : v < 0 ? 0 : v > 1 ? 1 : v;
  }

  set infoBoxLinkColor(v) {
    this.setAttribute('infobox-link-color', String(v));
  }

  get infoBoxLinkColor() {
    return this.hasAttribute('infobox-link-color') ? this.getAttribute('infobox-link-color').trim() : '';
  }

  set infoBoxLinkBgColor(v) {
    this.setAttribute('infobox-link-bgcolor', String(v));
  }

  get infoBoxLinkBgColor() {
    return this.hasAttribute('infobox-link-bgcolor') ? this.getAttribute('infobox-link-bgcolor').trim() : '';
  }

  set keepUrl(v) {
    if (Boolean(v)) {
      this.setAttribute('keep-url', '');
    } else {
      this.removeAttribute('keep-url');
    }
  }

  get keepUrl() {
    return this.hasAttribute('keep-url');
  }

  set refetchMins(v) {
    this.setAttribute('refetch-mins', String(v));
  }

  get refetchMins() {
    let v;
    v = (v = (this.hasAttribute('refetch-mins') ? this.getAttribute('refetch-mins') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? 15 : v < 0.000001 ? 0.000001 : v > 999999 ? 999999 : v;
  }

  set noImgs(v) {
    if (Boolean(v)) {
      this.setAttribute('no-imgs', '');
    } else {
      this.removeAttribute('no-imgs');
    }
  }

  get noImgs() {
    return this.hasAttribute('no-imgs');
  }

  set moveRight(v) {
    if (Boolean(v)) {
      this.setAttribute('move-right', '');
    } else {
      this.removeAttribute('move-right');
    }
  }

  get moveRight() {
    return this.hasAttribute('move-right');
  }

  set proxyUrl(v) {
    this.setAttribute('proxy-url', String(v));
  }

  get proxyUrl() {
    return this.hasAttribute('proxy-url') ? this.getAttribute('proxy-url').trim() : '';
  }

  set cancelRun(v) {
    if (Boolean(v)) {
      this.setAttribute('cancel-run', '');
    } else {
      this.removeAttribute('cancel-run');
    }
  }

  get cancelRun() {
    return this.hasAttribute('cancel-run');
  }

  get busy() {
    return !!this._impl.pv.busy;
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

  addFetchedListener(l) {
    this._impl.pv.fetchedListeners.push(l);
  }

  removeFetchedListener(l) {
    let i = this._impl.pv.fetchedListeners.indexOf(l);
    if (i >= 0) {
      this._impl.pv.fetchedListeners.splice(i, 1);
    }
  }

  addRunListener(l) {
    this._impl.pv.runListeners.push(l);
  }

  removeRunListener(l) {
    let i = this._impl.pv.runListeners.indexOf(l);
    if (i >= 0) {
      this._impl.pv.runListeners.splice(i, 1);
    }
  }

  addBusyListener(l) {
    this._impl.pv.busyListeners.push(l);
  }

  removeBusyListener(l) {
    let i = this._impl.pv.busyListeners.indexOf(l);
    if (i >= 0) {
      this._impl.pv.busyListeners.splice(i, 1);
    }
  }

}

let ready = false, phimg = null;

function impl(elem) {

let implexp = {pv: {busy: false}};

let root = elem.shadowRoot, tickc = 0, wrapper = null, wrapperc = 0, showedImgs = true;

let startRequestedCallback = null;
function requestStart(url) {
  if (startRequestedCallback) {
    startRequestedCallback(url);
  }
};

let stopRequestedCallback = null;
function requestStop() {
  if (stopRequestedCallback) {
    stopRequestedCallback();
  }
};

let speedChangedCallback = null;
implexp.speedChanged = () => {
  if (speedChangedCallback) {
    speedChangedCallback();
  }
};

let imgSizeChangedCallback = null;
implexp.imgSizeChanged = () => {
  if (imgSizeChangedCallback) {
    imgSizeChangedCallback();
  }
};

let fontSizeChangedCallback = null;
implexp.fontSizeChanged = () => {
  if (fontSizeChangedCallback) {
    fontSizeChangedCallback();
  }
};

let itemGapChangedCallback = null;
implexp.itemGapChanged = () => {
  if (itemGapChangedCallback) {
    itemGapChangedCallback();
  }
};

let colorChangedCallback = null;
implexp.colorChanged = () => {
  if (colorChangedCallback) {
    colorChangedCallback();
  }
};

let hrsNewChangedCallback = null;
implexp.hrsNewChanged = () => {
  if (hrsNewChangedCallback) {
    hrsNewChangedCallback();
  }
};

let hrsOldChangedCallback = null;
implexp.hrsOldChanged = () => {
  if (hrsOldChangedCallback) {
    hrsOldChangedCallback();
  }
};

let transparencyChangedCallback = null;
implexp.transparencyChanged = () => {
  if (transparencyChangedCallback) {
    transparencyChangedCallback();
  }
};

let infoBoxLinkColorChangedCallback = null;
implexp.infoBoxLinkColorChanged = () => {
  if (infoBoxLinkColorChangedCallback) {
    infoBoxLinkColorChangedCallback();
  }
};

let infoBoxLinkBgColorChangedCallback = null;
implexp.infoBoxLinkBgColorChanged = () => {
  if (infoBoxLinkBgColorChangedCallback) {
    infoBoxLinkBgColorChangedCallback();
  }
};

let moveRightChangedCallback = null;
implexp.moveRightChanged = () => {
  if (moveRightChangedCallback) {
    moveRightChangedCallback();
  }
};

function clearElemCallbacks() {
  startRequestedCallback = null;
  stopRequestedCallback = null;
  speedChangedCallback = null;
  imgSizeChangedCallback = null;
  fontSizeChangedCallback = null;
  itemGapChangedCallback = null;
  colorChangedCallback = null;
  hrsNewChangedCallback = null;
  hrsOldChangedCallback = null;
  transparencyChangedCallback = null;
  infoBoxLinkColorChangedCallback = null;
  infoBoxLinkBgColorChangedCallback = null;
  moveRightChangedCallback = null;
}

function runticker(f, url) {
  if (tickc >= Number.MAX_SAFE_INTEGER) {
    tickc = 0;
  }
  tickc++;
  if (f !== false) {
    tick(tickc, url);
  }
}

function startticker(url, immed) {
  if (implexp.pv.busy && !immed && !elem.cancelRun) {
    requestStart(url);
  } else {
    runticker(true, url);
  }
}
implexp.start = startticker;

function stopticker(immed) {
  if (implexp.pv.busy && !immed && !elem.cancelRun) {
    requestStop();
  } else {
    runticker(false);
    clearElemCallbacks();
  }
}
implexp.stop = stopticker;

implexp.upgradeProperty = prop => {
  if (elem.hasOwnProperty(prop)) {
    let v = elem[prop];
    delete elem[prop];
    elem[prop] = v;
  }
};

let triggerFetchedEvent = o => {
  for (const l of implexp.pv.fetchedListeners) {
    l.call(elem, Object.assign({}, o));
  };
};

let triggerRunEvent = o => {
  for (const l of implexp.pv.runListeners) {
    l.call(elem, Object.assign({}, o));
  };
};

let triggerBusyEvent = b => {
  for (const l of implexp.pv.busyListeners) {
    l.call(elem, b);
  };
};

async function tick(tc, url) {

  if (!implexp.pv.busy) {
    implexp.pv.busy = true;
    triggerBusyEvent(true);
  }

  if (!phimg) {
    phimg = new Image();
    phimg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAEGWlDQ1BrQ0dDb2xvclNwYWNlR2VuZXJpY1JHQgAAOI2NVV1oHFUUPrtzZyMkzlNsNIV0qD8NJQ2TVjShtLp/3d02bpZJNtoi6GT27s6Yyc44M7v9oU9FUHwx6psUxL+3gCAo9Q/bPrQvlQol2tQgKD60+INQ6Ium65k7M5lpurHeZe58853vnnvuuWfvBei5qliWkRQBFpquLRcy4nOHj4g9K5CEh6AXBqFXUR0rXalMAjZPC3e1W99Dwntf2dXd/p+tt0YdFSBxH2Kz5qgLiI8B8KdVy3YBevqRHz/qWh72Yui3MUDEL3q44WPXw3M+fo1pZuQs4tOIBVVTaoiXEI/MxfhGDPsxsNZfoE1q66ro5aJim3XdoLFw72H+n23BaIXzbcOnz5mfPoTvYVz7KzUl5+FRxEuqkp9G/Ajia219thzg25abkRE/BpDc3pqvphHvRFys2weqvp+krbWKIX7nhDbzLOItiM8358pTwdirqpPFnMF2xLc1WvLyOwTAibpbmvHHcvttU57y5+XqNZrLe3lE/Pq8eUj2fXKfOe3pfOjzhJYtB/yll5SDFcSDiH+hRkH25+L+sdxKEAMZahrlSX8ukqMOWy/jXW2m6M9LDBc31B9LFuv6gVKg/0Szi3KAr1kGq1GMjU/aLbnq6/lRxc4XfJ98hTargX++DbMJBSiYMIe9Ck1YAxFkKEAG3xbYaKmDDgYyFK0UGYpfoWYXG+fAPPI6tJnNwb7ClP7IyF+D+bjOtCpkhz6CFrIa/I6sFtNl8auFXGMTP34sNwI/JhkgEtmDz14ySfaRcTIBInmKPE32kxyyE2Tv+thKbEVePDfW/byMM1Kmm0XdObS7oGD/MypMXFPXrCwOtoYjyyn7BV29/MZfsVzpLDdRtuIZnbpXzvlf+ev8MvYr/Gqk4H/kV/G3csdazLuyTMPsbFhzd1UabQbjFvDRmcWJxR3zcfHkVw9GfpbJmeev9F08WW8uDkaslwX6avlWGU6NRKz0g/SHtCy9J30o/ca9zX3Kfc19zn3BXQKRO8ud477hLnAfc1/G9mrzGlrfexZ5GLdn6ZZrrEohI2wVHhZywjbhUWEy8icMCGNCUdiBlq3r+xafL549HQ5jH+an+1y+LlYBifuxAvRN/lVVVOlwlCkdVm9NOL5BE4wkQ2SMlDZU97hX86EilU/lUmkQUztTE6mx1EEPh7OmdqBtAvv8HdWpbrJS6tJj3n0CWdM6busNzRV3S9KTYhqvNiqWmuroiKgYhshMjmhTh9ptWhsF7970j/SbMrsPE1suR5z7DMC+P/Hs+y7ijrQAlhyAgccjbhjPygfeBTjzhNqy28EdkUh8C+DU9+z2v/oyeH791OncxHOs5y2AtTc7nb/f73TWPkD/qwBnjX8BoJ98VQNcC+8AAAALSURBVAgdY2AAAgAABQABjbub8wAAAABJRU5ErkJggg==';
    phimg = await (new Promise((res, rej) => {
      phimg.onload = () => res(phimg);
      phimg.onerror = () => res(null);
    }));
  }

  let rsslist = [{id:elem.id||'', url: sanitizeUrl((url?url:'').trim() || elem.url.trim()), hasImgs: false, reqImgs: !elem.noImgs}];
  let fetched = false, fetching = false, rssstart = false, rsserr = false;
  let elemlen = 0, elemlen2 = 0, itemslen = 0, pos = 0, pos2 = 0, elemlent = 0, post = 0, posd = 0;
  let itemEls = [];
  let refetcht = performance.now();
  let startreq = false, startrequrl = null, stopreq = false;
  let speed = elem.speed, transparency = elem.transparency;
  let initItemElsBusy = false, initItemElsBusy2 = false;
  let wq = [], wqi = 0;
  let rssSelMode = 0, rssSelItemno = 0, rssSelItemnox = 0, rssSelPosX = 0, rssSelPosY = 0, rssSelPosD = 0, rssSelMouseUp = true;
  let mvright = elem.moveRight;
  let colorNew, colorOld, hrsNew, hrsOld;
  let itemInfoBox = null, itemInfoBoxLinks = [];
  let epageY = 0;

  implexp.pv.errmsg = undefined;

  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'wrapper';
    root.appendChild(wrapper);
  }
  wrapperc = tc;

  wrapper.style.fontSize = '' + (elem.fontSize * 100) + '%';

  initItemEls('Fetching RSS/Atom Feed . . .', rsslist[0].url ? rsslist[0].url.length > 77 ? rsslist[0].url.substring(0,77)+'...' : rsslist[0].url : '?', showedImgs ? phimg : null, true);

  startRequestedCallback = url => {
    startreq = true;
    stopreq = false;
    startrequrl = url;
  };

  stopRequestedCallback = () => {
    stopreq = true;
    startreq = false;
  };

  speedChangedCallback = () => {
    speed = elem.speed;
  };

  imgSizeChangedCallback = () => {
    addwork(workChangeImgSize, elem.imgSize);
  };

  fontSizeChangedCallback = () => {
    wrapper.style.fontSize = '' + (elem.fontSize * 100) + '%';
    addwork(workChangeItemGaps, null);
  };

  itemGapChangedCallback = () => {
    addwork(workChangeItemGaps, elem.itemGap);
  };

  colorChangedCallback = () => {
    let c = extractColorValue(elem.colorNew);
    if (c) {
      colorNew = [c[0], c[1], c[2]];
    } else {
      colorNew = [dftColorNew[0], dftColorNew[1], dftColorNew[2]];
    }
    c = extractColorValue(elem.colorOld);
    if (c) {
      colorOld = [c[0], c[1], c[2]];
    } else {
      colorOld = [dftColorOld[0], dftColorOld[1], dftColorOld[2]];
    }
  };
  colorChangedCallback();

  hrsNewChangedCallback = () => {
    hrsNew = elem.hrsNew;
  };
  hrsNewChangedCallback();

  hrsOldChangedCallback = () => {
    hrsOld = elem.hrsOld;
  };
  hrsOldChangedCallback();

  transparencyChangedCallback = () => {
    transparency = elem.transparency;
    addwork(workChangeTransparency, null);
  };

  infoBoxLinkColorChangedCallback = () => {
    if (itemInfoBox && rssSelMode > 1 && rssSelItemno > 0) {
      updateItemInfoBoxColor();
    }
  };

  infoBoxLinkBgColorChangedCallback = () => {
    if (itemInfoBox && rssSelMode > 1 && rssSelItemno > 0) {
      updateItemInfoBoxColor();
    }
  };

  moveRightChangedCallback = () => {
    if (elem.moveRight !== mvright) {
      mvright = elem.moveRight;
      if (rssstart) {
        pos = 1 - pos;
      }
    }
  };

  function stop() {
    return !ready || !implexp.pv.connected || tc !== tickc;
  }

  function release() {
    let tbusy = false;
    window.removeEventListener('mousedown', windowMouseDownHandler0);
    window.removeEventListener('mousedown', windowMouseDownHandler);
    window.removeEventListener('mouseup', windowMouseUpHandler);
    window.removeEventListener('mousemove', windowMouseMoveHandler);
    if (tc === tickc) {
      if (implexp.pv.busy) {
        tbusy = true;
        implexp.pv.busy = false;
      }
      clearElemCallbacks();
    }
    if (wrapper && wrapperc === tc) {
      wrapper.remove();
      wrapper = null;
    }
    rssSelMode = 0;
    removeItemInfoBox();
    rssSelItemno = 0;
    rssSelItemnox = 0;
    rssSelPosX = 0;
    rssSelPosY = 0;
    rssSelPosD = 0;
    rssSelMouseUp = true;
    if (tbusy) {
      triggerBusyEvent(false);
    }
  }

  let af = t => {
    if (stop()) {
      release();
      return;
    }
    if (itemInfoBox && rssSelMode > 1 && !rssSelMouseUp && rssSelPosY > 0) {
      let d = epageY - rssSelPosY;
      let r = itemInfoBox.getBoundingClientRect();
      if (d < 0 && r.top < 0 || d > 0 && r.bottom > document.body.clientHeight) {
        itemInfoBox.style.top = '';
        itemInfoBox.style.bottom = '' + (document.body.clientHeight - (r.bottom + screen.height * 0.03 * ((0 - d) / screen.height))) + 'px';
        r = itemInfoBox.getBoundingClientRect();
        if (r.top > 0) {
          itemInfoBox.style.top = '0px';
          itemInfoBox.style.bottom = '';
        } else if (r.bottom < document.body.clientHeight) {
          itemInfoBox.style.top = '';
          itemInfoBox.style.bottom = '0px';
        }
      }
    }
    if (!initItemElsBusy && !initItemElsBusy2) {
      if (pos > 1) {
        pos = 1;
        if (startreq) {
          startticker(startrequrl, true);
        } else if (stopreq) {
          stopticker(true);
        } else if (rssSelMode === 0) {
          pos = pos2 = post = posd = 0;
          if (!elem.keepUrl && elem.url.trim() && elem.url.trim() !== rsslist[0].url) {
            startticker(elem.url.trim(), true);
          } else if ((performance.now() - refetcht) / 60000 > elem.refetchMins) {
            startticker(rsslist[0].url, true);
          } else if (rsserr) {
            triggerRunEvent(rsslist[0]);
          } else if (!rsslist[0].reqImgs && !elem.noImgs && !rsslist[0].hasImgs) {
            startticker(rsslist[0].url, true);
          } else {
            if (!rsslist[0].reqImgs && !elem.noImgs || rsslist[0].reqImgs && elem.noImgs) {
              rsslist[0].reqImgs = !rsslist[0].reqImgs;
              if (rsslist[0].hasImgs) {
                initItemEls();
              }
            }
            triggerRunEvent(rsslist[0]);
          }
        }
      } else {
        if (!fetching) {
          if (!fetched) {
            startFetch();
          } else {
            if (rssstart) {
              dowork();
              calcPos(t);
            } else {
              rssstart = true;
              triggerFetchedEvent(rsslist[0]);
              triggerRunEvent(rsslist[0]);
              elemlen = elemlen2 = elem.getBoundingClientRect().width;
              if (rsserr) {
                implexp.pv.errmsg = rsslist[0].error;
                initItemEls('ERROR - ' + rsslist[0].error, rsslist[0].url ? rsslist[0].url.length > 77 ? rsslist[0].url.substring(0,77)+'...' : rsslist[0].url : '?', showedImgs ? phimg : null);
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
    let x;
    if (t - elemlent > 300) {
      elemlent = t;
      elemlen2 = elem.getBoundingClientRect().width;
      if (elemlen !== elemlen2) {
        elemlen = elemlen2;
        pos = pos2;
        post = posd = 0;
        addwork(workChangeItemGaps, null);
      }
      pos2 = pos;
    }
    if (mvright) {
      x = 0 - 5 - itemslen + Math.round((elemlen + 10 + itemslen) * pos);
    } else {
      x = elemlen + 5 - Math.round((elemlen + 10 + itemslen) * pos);
    }
    wrapper.style.left = '' + x + 'px';
    if (post > 0 && rssSelMode === 0) {
      pos += posd * (t - post) / 100;
    }
    if (rssSelMode === 1) {
      pos += 0.002 * rssSelPosD;
      if (pos > 1) {
        pos = 1;
      } else if (pos < 0) {
        pos = 0;
      }
    }
    if (posd === 0 || t - post > 50) {
      posd = elemlen * 100 / (50000 - 49900 * Math.log2(speed) / 3.321928094887362) / (elemlen + 100 + itemslen);
      post = t;
    }
  }

  async function initItemEls(msg1, msg2, img, c) {
    initItemElsBusy = true;
    wrapper.style.transition = 'opacity 1s ease-out';
    wrapper.style.opacity = '0';
    await (new Promise((res,rej) => {
      setTimeout(() => res(null), 1000);
    }));
    clearItemEls();
    if (c) {
      elem.style.display = 'flex';
      elem.style.justifyContent = 'center';
    } else {
      elem.style.display = 'inline-block';
    }
    if (msg1 || msg2) {
      if (img) {
        showedImgs = true;
      }
      addItemEl(0, msg1, msg2, img);
    } else {
      for (let i = 1; i < rsslist.length; i++) {
        if (rsslist[0].reqImgs && rsslist[i].image) {
          showedImgs = true;
        }
        addItemEl(i, rsslist[i].title, rsslist[i].date, rsslist[0].reqImgs ? rsslist[i].image ? rsslist[i].image[0] : null : null);
      }
    }
    setItemGaps(elem.itemGap);
    wrapper.style.transition = 'opacity 3s ease-in';
    wrapper.style.opacity = '1';
    setItemslen();
    initItemElsBusy = false;
    addwork(workUpdateItemTiming, 1, updItemTimingInterval);
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
    clearwork();
  }

  function addItemEl(ino, title, date, img) {
    let e, e0, e1, e2, e3, et, ed, dt = false, col;
    if (!date || typeof date === 'string' || date instanceof String) {
      col = dftColorNew;
    } else {
      col = crtItemColor(date);
    }
    e = document.createElement('div');
    e.classList.add('itemcont');
    wrapper.appendChild(e);
    e0 = e;
    e = document.createElement('div');
    e.classList.add('item');
    e.style.borderStyle = 'dotted';
    e.style.borderWidth = '3px';
    e.style.borderColor = 'rgba('+col[0]+', '+col[1]+', '+col[2]+', 1)';
    e.style.background = 'radial-gradient(rgba('+col[0]+', '+col[1]+', '+col[2]+', 1), rgba('+col[0]+', '+col[1]+', '+col[2]+', '+((1-transparency)/2)+'))';
    e1 = e;
    e0.appendChild(e);
    e2 = null;
    e3 = null;
    if (img) {
      img.setAttribute('tabindex', '-1');
      img.classList.add('item-img');
      e.classList.add('itemimg');
      e2 = document.createElement('div');
      e2.classList.add('item-img-div');
      e2.style.height = '' + elem.imgSize + 'em';
      e2.style.width = 'auto';
      e2.appendChild(img);
      e.appendChild(e2);
      e = document.createElement('div');
      e.classList.add('item-text');
      e.style.borderStyle = 'dotted';
      e.style.borderColor = 'rgba('+col[0]+', '+col[1]+', '+col[2]+', 1)';
      e.style.borderWidth = '0 0 0 4px';
      e1.appendChild(e);
      e3 = e;
    } else {
      e.classList.add('itemnoimg');
    }
    et = document.createElement('div');
    et.classList.add('item-title');
    et.textContent = '-';
    e.appendChild(et);
    ed = document.createElement('div');
    ed.classList.add('item-date');
    itemEls.push([e2, e0, ed, e3, e1, et, {col}]);
    let s = '';
    if (typeof date === 'string' || date instanceof String) {
      s = date.trim();
    } else if (date) {
      dt = true;
      s = crtItemDateText(date, 1);
    }
    ed.textContent = s.trim() || '- - -';
    e.appendChild(ed);
    if (img) {
      img.style.borderRadius = '' + Math.round((img.getBoundingClientRect().width + img.getBoundingClientRect().height) / 2 / 5) + 'px';
    }
    et.textContent = title.trim() || '- - -';
    if (dt) {
      ed.style.width = '' + ed.getBoundingClientRect().width + 'px';
      ed.textContent = crtItemDateText(date);
    }
    if (ino) {
      e0.addEventListener('mousedown', e => {
        e.preventDefault();
        rssSelItemno = ino;
      }, false);
      e0.addEventListener('mousemove', e => {
        e.preventDefault();
        if (rssSelMode > 0 && rssSelItemno > 0 && ino !== rssSelItemno && !rssSelMouseUp && rssSelPosY === 0) {
          if (rssSelMode > 1) {
            rssSelMode = 1;
            removeItemInfoBox();
            rssSelItemnox = 0;
            rssSelPosX = e.pageX;
            rssSelPosY = 0;
            rssSelPosD = 0;
          }
          if (rssSelMode === 1) {
            itemEls[rssSelItemno-1][4].style.borderStyle = 'dotted';
            let col = itemEls[rssSelItemno-1][6].col ? itemEls[rssSelItemno-1][6].col : dftColorNew;
            itemEls[rssSelItemno-1][4].style.borderColor = 'rgba('+col[0]+', '+col[1]+', '+col[2]+', 1)';
            rssSelItemno = ino;
            itemEls[rssSelItemno-1][4].style.borderColor = 'black';
          }
        }
      }, false);
    }
  }

  function setItemslen() {
    itemslen = 0;
    for (let i = 1; i <= itemEls.length; i++) {
      let l = calcItemlen(i);
      itemEls[i-1][6].itemLen = l;
      itemslen += l;
    }
  }

  function calcItemlen(i) {
    return itemEls[i-1][4].getBoundingClientRect().width + (itemEls[i-1][6].itemGapPx ? itemEls[i-1][6].itemGapPx : 0) * 2;
  }

  function setItemGaps(ig) {
    for (let i = 1; i <= itemEls.length; i++) {
      setItemGap(i, ig);
    }
  }

  function setItemGap(i, ig) {
    let g, h;
    g = (g = Math.round((h = itemEls[i-1][4].getBoundingClientRect().height) / 5 * ig)) < 2 ? 2 : g;
    itemEls[i-1][1].style.margin = '0px ' + g + 'px 0px ' + g + 'px';
    itemEls[i-1][4].style.borderRadius = '' + Math.round(h / 3) + 'px';
    itemEls[i-1][6].itemGapPx = g;
    itemEls[i-1][6].itemGap = ig;
  }

  function crtItemDateText(dat, x) {
    if (x) {
      return dat.toLocaleString()+' \u22C5\u22C5\u22C5 d888 h88 m88';
    } else {
      let ms = new Date().getTime() - dat;
      if (ms < 0) {
        return dat.toLocaleString()+' \u22C5\u22C5\u22C5 d<0';
      } else {
        let h = Math.trunc(ms / 1000 / 3600);
        let d = Math.trunc(h / 24);
        if (d > 999) {
          return dat.toLocaleString()+' \u22C5\u22C5\u22C5 d>999';
        }
        let m = Math.trunc((ms - h * 3600 * 1000) / 1000 / 60);
        h -= d * 24;
        return dat.toLocaleString()+' \u22C5\u22C5\u22C5'+(d>0?' d'+d:'')+(h>0?' h'+h:'')+' m'+m;
      }
    }
  }

  function crtItemColor(dat) {
    let ms = new Date().getTime() - dat;
    let h = ms / 1000 / 3600;
    if (h <= hrsNew) {
      return [colorNew[0], colorNew[1], colorNew[2]];
    }
    if (h >= hrsOld) {
      return [colorOld[0], colorOld[1], colorOld[2]];
    }
    return[Math.round(colorNew[0]+(colorOld[0]-colorNew[0])*h/hrsOld),Math.round(colorNew[1]+(colorOld[1]-colorNew[1])*h/hrsOld),Math.round(colorNew[2]+(colorOld[2]-colorNew[2])*h/hrsOld)];
  }

  function workChangeItemGaps(i, p, r) {
    if (rssSelMode > 0) {
      rssSelMode = 0;
      removeItemInfoBox();
      rssSelItemno = 0;
      rssSelItemnox = 0;
      rssSelPosX = 0;
      rssSelPosY = 0;
      rssSelPosD = 0;
      rssSelMouseUp = true;
    }
    if (i === -1) {
      r[0] = 0;
    } else if (i === -2) {
      itemslen = r[0];
    } else {
      setItemGap(i, p ? p : itemEls[i-1][6].itemGap ? itemEls[i-1][6].itemGap : 1);
      let l = calcItemlen(i);
      r[0] += l;
      itemslen += l - (itemEls[i-1][6].itemLen ? itemEls[i-1][6].itemLen : l);
      itemEls[i-1][6].itemLen = l;
    }
  }

  function workChangeImgSize(i, p, r) {
    if (rssSelMode > 0) {
      rssSelMode = 0;
      removeItemInfoBox();
      rssSelItemno = 0;
      rssSelItemnox = 0;
      rssSelPosX = 0;
      rssSelPosY = 0;
      rssSelPosD = 0;
      rssSelMouseUp = true;
    }
    if (i === -1) {
      r[0] = 0;
    } else if (i === -2) {
      itemslen = r[0];
    } else {
      if (itemEls[i-1][0]) {
        itemEls[i-1][0].style.height = '' + p + 'em';
      }
      setItemGap(i, itemEls[i-1][6].itemGap ? itemEls[i-1][6].itemGap : 1);
      let l = calcItemlen(i);
      r[0] += l;
      itemslen += l - (itemEls[i-1][6].itemLen ? itemEls[i-1][6].itemLen : l);
      itemEls[i-1][6].itemLen = l;
    }
  }

  function workUpdateItemTiming(c, p, r, mc) {
    if (c === mc) {
      if (p > 0 && p < rsslist.length && p <= itemEls.length) {
        if (rsslist[p].date) {
          itemEls[p-1][2].textContent = crtItemDateText(rsslist[p].date);
          let col = crtItemColor(rsslist[p].date);
          let col2 = itemEls[p-1][6].col;
          if (!col2 || col[0] !== col2[0] || col[1] !== col2[1] || col[2] !== col2[2]) {
            itemEls[p-1][4].style.borderColor = 'rgba('+col[0]+', '+col[1]+', '+col[2]+', 1)';
            itemEls[p-1][4].style.background = 'radial-gradient(rgba('+col[0]+', '+col[1]+', '+col[2]+', 1), rgba('+col[0]+', '+col[1]+', '+col[2]+', '+((1-transparency)/2)+'))';
            if (itemEls[p-1][3]) {
              itemEls[p-1][3].style.borderColor = 'rgba('+col[0]+', '+col[1]+', '+col[2]+', 1)';
            }
            itemEls[p-1][6].col = col;
            if (itemInfoBox && rssSelMode > 1 && rssSelItemno > 0 && rssSelItemno === p) {
              updateItemInfoBoxColor();
            }
          }
        }
      }
      if (p < rsslist.length - 1) {
        p++;
      } else {
        p = 1;
      }
      addwork(workUpdateItemTiming, p, updItemTimingInterval);
    }
  }

  function workChangeTransparency(i, p, r) {
    if (i === -1) {
    } else if (i === -2) {
    } else {
      itemEls[i-1][4].style.background = 'radial-gradient(rgba('+col[0]+', '+col[1]+', '+col[2]+', 1), rgba('+col[0]+', '+col[1]+', '+col[2]+', '+((1-transparency)/2)+'))';
      if (itemInfoBox && rssSelMode > 1 && rssSelItemno > 0 && rssSelItemno === i) {
        updateItemInfoBoxColor();
      }
    }
  }

  function addwork(f, p, mc) {
    for (const w of wq) {
      if (w[0] === f) {
        w[1] = -3;
      }
    }
    let w = [f,mc?1:-1,p,[],mc?mc:null];
    if (wq.length === 0) {
      wq.push(w);
      wqi = 0;
    } else {
      wq.splice(wqi, 0, w);
      wqi++;
    }
  }

  function dowork() {
    if (wq.length === 0 || !itemEls || itemEls.length === 0) {
      return;
    }
    if (wq[wqi][1] !== -3) {
      wq[wqi][0](wq[wqi][1],wq[wqi][2],wq[wqi][3],wq[wqi][4]);
    }
    if (wq[wqi][1] === -1) {
      wq[wqi][1] = 1;
      wqi = wqi < wq.length - 1 ? wqi + 1 : 0;
    } else if (wq[wqi][1] === -2 || wq[wqi][1] === -3) {
      wq.splice(wqi, 1);
      if (wqi >= wq.length) {
        wqi = 0;
      }
    } else if (wq[wqi][4]) {
      if (wq[wqi][1] < wq[wqi][4]) {
        wq[wqi][1]++;
      } else {
        wq[wqi][1] = -3;
      }
      wqi = wqi < wq.length - 1 ? wqi + 1 : 0;
    } else {
      if (wq[wqi][1] < itemEls.length) {
        wq[wqi][1]++;
      } else {
        wq[wqi][1] = -2;
      }
      wqi = wqi < wq.length - 1 ? wqi + 1 : 0;
    }
  }

  function clearwork() {
    wq = [];
    wqi = 0;
  }

  function windowMouseDownHandler0(e) {
    rssSelItemnox = rssSelItemno;
    rssSelItemno = 0;
  }
  window.addEventListener('mousedown', windowMouseDownHandler0, true);

  function windowMouseDownHandler(e) {
    rssSelMouseUp = false;
    if (rssSelMode > 0) {
      if (itemInfoBox && rssSelMode > 1 && rssSelItemnox > 0) {
        let r = itemInfoBox.getBoundingClientRect();
        if (e.pageX >= r.left && e.pageX <= r.right && e.pageY >= r.top && e.pageY <= r.bottom) {
          e.preventDefault();
          rssSelItemno = rssSelItemnox;
          rssSelItemnox = 0;
          rssSelPosY = e.pageY;
          epageY = e.pageY;
          return;
        }
      }
      rssSelMode = 0;
      removeItemInfoBox();
      rssSelPosX = 0;
      rssSelPosY = 0;
      rssSelPosD = 0;
    }
    if (rssSelMode === 0 && rssSelItemno > 0) {
      e.preventDefault();
      itemEls[rssSelItemno-1][4].style.borderColor = 'black';
      rssSelMode = 1;
      rssSelPosX = e.pageX;
      rssSelPosY = 0;
      rssSelPosD = 0;
    }
    rssSelItemnox = 0;
  }
  window.addEventListener('mousedown', windowMouseDownHandler, false);

  function windowMouseUpHandler(e) {
    rssSelMouseUp = true;
    if (rssSelPosY > 0) {
      rssSelPosY = 0;
      return;
    }
    if (itemInfoBox && rssSelMode > 1 && rssSelItemno > 0) {
      let r = itemInfoBox.getBoundingClientRect();
      if (e.pageX >= r.left && e.pageX <= r.right && e.pageY >= r.top && e.pageY <= r.bottom) {
        return;
      }
    }
    rssSelMode = 0;
    removeItemInfoBox();
    rssSelItemno = 0;
    rssSelItemnox = 0;
    rssSelPosX = 0;
    rssSelPosY = 0;
    rssSelPosD = 0;
  };
  window.addEventListener('mouseup', windowMouseUpHandler, false);

  function windowMouseMoveHandler(e) {
    epageY = e.pageY;
    if (rssSelMode === 0 || rssSelItemno === 0 || rssSelMouseUp || rssSelPosY > 0) {
      return;
    }
    e.preventDefault();
    let r = itemEls[rssSelItemno - 1][4].getBoundingClientRect();
    let m = rssSelMode;
    if (rssSelMode === 1) {
      if (e.pageY < r.top) {
        rssSelMode = 2;
        addItemInfoBox();
      } else if (e.pageY > r.bottom) {
        rssSelMode = 3;
        addItemInfoBox();
      }
    } else if (rssSelMode === 2) {
      if (e.pageY > r.bottom) {
        rssSelMode = 3;
        removeItemInfoBox();
        addItemInfoBox();
      } else if (e.pageY > r.top) {
        rssSelMode = 1;
        removeItemInfoBox();
      }
    } else if (rssSelMode === 3) {
      if (e.pageY < r.top) {
        rssSelMode = 2;
        removeItemInfoBox();
        addItemInfoBox();
      } else if (e.pageY < r.bottom) {
        rssSelMode = 1;
        removeItemInfoBox();
      }
    }
    if (rssSelMode === 1) {
      if (m !== 1) {
        rssSelPosX = e.pageX;
      }
      rssSelPosD = (rssSelPosD = (Math.abs(e.pageX - rssSelPosX) < screen.width * 0.02 ? 0 : e.pageX > rssSelPosX ? e.pageX - rssSelPosX - screen.width * 0.02 : e.pageX - rssSelPosX + screen.width * 0.02)  / (screen.width / 2)) < -1 ? -1 : rssSelPosD > 1 ? 1 : rssSelPosD;
      if (mvright) {
        rssSelPosD = 0 - rssSelPosD;
      }
    }
  }
  window.addEventListener('mousemove', windowMouseMoveHandler, false);

  function addItemInfoBox() {
    if (itemInfoBox || rssSelMode < 2 || rssSelItemno === 0 || rssSelItemno > rsslist.length - 1 || rssSelItemno > itemEls.length) {
      return;
    }
    let r1 = itemEls[rssSelItemno-1][4].getBoundingClientRect(), r2 = elem.getBoundingClientRect();
    if (r1.left < r2.left && r1.width - r2.left + r1.left < r1.width * 0.1 || r1.right > r2.right && r1.width - r1.right + r2.right < r1.width * 0.1) {
      return;
    }
    itemInfoBoxLinks = [];
    itemEls[rssSelItemno-1][4].style.borderStyle = 'solid';
    itemInfoBox = document.body.appendChild(document.createElement('div'));
    itemInfoBox.style.position = 'absolute';
    itemInfoBox.style.transition = 'opacity 1s ease-out';
    itemInfoBox.style.opacity = '0';
    itemInfoBox.style.borderStyle = 'solid';
    itemInfoBox.style.borderWidth = '2px';
    itemInfoBox.style.borderColor = 'black';
    itemInfoBox.style.color = getComputedStyle(elem).color;
    itemInfoBox.style.fontFamily = getComputedStyle(elem).fontFamily;
    itemInfoBox.style.fontSize = Math.round(parseFloat(getComputedStyle(itemEls[rssSelItemno-1][5]).fontSize) * 0.95);
    itemInfoBox.style.padding = '1.3rem 1.2rem 1rem 1.6rem';
    itemInfoBox.style.overflow = 'hidden';
    itemInfoBox.style.cursor = 'default';
    itemInfoBox.style.userSelect = 'none';
    itemInfoBox.style.top = '0px';
    itemInfoBox.style.left = '0px';
    let e, e1, e2, dcont = false;;
    e1 = document.createElement('span');
    e1.style.lineHeight = '1.3';
    if (rsslist[rssSelItemno].description) {
      e1.innerHTML = rsslist[rssSelItemno].description;
    } else if (rsslist[rssSelItemno].content) {
      e1.innerHTML = rsslist[rssSelItemno].content;
      dcont = true;
      e = cvtItemInfoBoxLinks(e1);
      replaceNodeChildren(e1, e.childNodes);
    }
    if (rsslist[rssSelItemno].description && rsslist[rssSelItemno].content) {
      e2 = document.createElement('span');
      e2.style.lineHeight = '1.3';
      e2.innerHTML = rsslist[rssSelItemno].content;
      if (e2.textContent.trim() !== e1.textContent.trim()) {
        dcont = true;
        e = cvtItemInfoBoxLinks(e2);
        replaceNodeChildren(e2, e.childNodes);
      }
    }
    if (rsslist[rssSelItemno].description) {
      e = cvtItemInfoBoxLinks(e1);
      replaceNodeChildren(e1, e.childNodes);
    }
    let img = rsslist[rssSelItemno].image && (!rsslist[rssSelItemno].description || !rsslist[rssSelItemno].description.includes(rsslist[rssSelItemno].image[1].src)) && (!dcont || !rsslist[rssSelItemno].content || !rsslist[rssSelItemno].content.includes(rsslist[rssSelItemno].image[1].src));
    if (img) {
      e = itemInfoBox.appendChild(rsslist[rssSelItemno].image[1]);
      e.style.float = 'left';
      e.style.maxWidth = '40%';
      e.style.maxHeight = '80%';
      e.style.margin = '0 1.2rem 0 0';
    }
    itemInfoBox.appendChild(e1);
    if (rsslist[rssSelItemno].description && rsslist[rssSelItemno].content && dcont) {
      e = document.createElement('br');
      itemInfoBox.appendChild(e);
      e = document.createElement('span');
      e.style.lineHeight = '1.2';
      e.innerHTML = ' \u2015 \u2015 \u2015<br>';
      itemInfoBox.appendChild(e);
      itemInfoBox.appendChild(e2);
    }
    let w = Math.round(document.body.clientWidth > document.body.clientHeight ? document.body.clientWidth / (img ? 2 : 3) : document.body.clientWidth / (img ? 1.5 : 2));
    itemInfoBox.style.width = '' + w + 'px';
    let h = itemInfoBox.getBoundingClientRect().height, h0, w0, w1 = w / 3;
    do {
      w0 = w;
      w *= 0.95;
      itemInfoBox.style.width = '' + w + 'px';
      h0 = h;
      h = itemInfoBox.getBoundingClientRect().height;
    } while (w > w1 && h <= h0);
    itemInfoBox.style.width = '' + w0 + 'px';
    if (rsslist[rssSelItemno].link) {
      e1 = document.createElement('div');
      e1.style.display = 'flex';
      e1.style.flexDirection = 'column';
      itemInfoBox.appendChild(e1);
      e = document.createElement('hr');
      e.style.backgroundColor = 'black';
      e.style.width = '70%';
      e.style.height = '2px';
      e.style.margin = '0.65rem auto 0.65rem auto';
      e.style.lineHeight = '1.3';
      e1.appendChild(e);
      e2 = document.createElement('div');
      e2.style.fontFamily = 'Arial';
      e2.style.display = 'flex';
      e2.style.justifyContent = 'flex-start';
      e1.appendChild(e2);
      e = document.createElement('div');
      e.style.fontSize = '110%';
      e.style.margin = 'auto 0.6rem auto 0';
      e.textContent = '\u25B6';
      e2.appendChild(e);
      e = document.createElement('div');
      e.style.fontSize = '75%';
      e.style.wordBreak = 'break-all';
      e.style.lineHeight = '1.2';
      e1 = crtItemInfoBoxLink(rsslist[rssSelItemno].link, rsslist[rssSelItemno].link);
      e.appendChild(e1);
      e2.appendChild(e);
    }
    itemInfoBox.style.borderRadius = '' + Math.round(Math.min(w0,h0)/8) + 'px';
    itemInfoBox.style.top = '';
    itemInfoBox.style.left = '';
    h = rssSelMode === 2 ? r1.top : document.body.clientHeight - r1.bottom;
    h0 = -1;
    for (;;) {
      r3 = itemInfoBox.getBoundingClientRect();
      if (h0 >= 0 && r3.height >= h0 || r3.height < h || r3.width > document.body.clientWidth * 0.8) {
        if (h0 >= 0) {
          itemInfoBox.style.width = '' + (r3.width / 1.05) + 'px';
        }
        break;
      }
      h0 = r3.height;
      itemInfoBox.style.width = '' + (r3.width * 1.05) + 'px';
    }
    r3 = itemInfoBox.getBoundingClientRect();
    itemInfoBox.style.bottom = '' + (document.body.clientHeight - r1.bottom + r1.height + 2 - (rssSelMode === 3 ? r1.height + 4 + r3.height : 0)) + 'px';
    r3 = itemInfoBox.getBoundingClientRect();
    if (r3.top < 0) {
      itemInfoBox.style.bottom = '';
      itemInfoBox.style.top = '0px';
    } else if (r3.bottom > document.body.clientHeight) {
      itemInfoBox.style.bottom = '0px';
    }
    let l = (r1.left + (r1.width - r3.width) / 2);
    if (l + r3.width > r2.right) {
      l -= l + r3.width - r2.right;
    }
    if (l < r2.left) {
      l = r2.left;
    }
    if (l + r3.width > document.body.clientWidth) {
      l -= l + r3.width - document.body.clientWidth;
    }
    if (l < 0) {
      l = 0;
    }
    updateItemInfoBoxColor();
    itemInfoBox.style.left = '' + l + 'px';
    itemInfoBox.style.opacity = '1';
  }

  function updateItemInfoBoxColor() {
    if (!itemInfoBox || rssSelMode < 2 || rssSelItemno === 0) {
      return;
    }
    let col = itemEls[rssSelItemno-1][6].col ? itemEls[rssSelItemno-1][6].col : dftColorNew;
    itemInfoBox.style.backgroundColor = 'rgba(' + col[0] + ', ' + col[1] + ', ' + col[2] + ', ' + (1-transparency) +')';
    let ct, cbg;
    let c = extractColorValue(elem.infoBoxLinkColor);
    if (c) {
      ct = [c[0], c[1], c[2], c[3]];
    } else {
      ct = [col[0], col[1], col[2], 1];
    }
    c = extractColorValue(elem.infoBoxLinkBgColor);
    if (c) {
      cbg = [c[0], c[1], c[2]];
    } else {
      cbg = [255, 255, 255];
    }
    for (const a of itemInfoBoxLinks) {
      a[0].style.color = 'rgba(' + ct[0] + ', ' + ct[1] + ', ' + ct[2] + ', ' + ct[3] + ')';
      a[0].style.backgroundColor = 'rgba(' + cbg[0] + ', ' + cbg[1] + ', ' + cbg[2] + ', ' + a[1] + ')';
    }
  }

  function crtItemInfoBoxLink(ih, href) {
    let ct, cbg;
    let col = itemEls[rssSelItemno-1][6].col ? itemEls[rssSelItemno-1][6].col : dftColorNew;
    let c = extractColorValue(elem.infoBoxLinkColor);
    if (c) {
      ct = [c[0], c[1], c[2], c[3]];
    } else {
      ct = [col[0], col[1], col[2], 1];
    }
    function rcbg() {
      c = extractColorValue(elem.infoBoxLinkBgColor);
      if (c) {
        cbg = [c[0], c[1], c[2]];
      } else {
        cbg = [255, 255, 255];
      }
    }
    rcbg();
    let a = [document.createElement('span'), 0.5];
    a[0].style.transition = 'background-color 0.4s ease-out';
    a[0].style.backgroundColor = 'rgba(' + cbg[0] + ', ' + cbg[1] + ', ' + cbg[2] + ', ' + a[1] + ')';
    a[0].style.cursor = 'pointer';
    a[0].style.color = 'rgba(' + ct[0] + ', ' + ct[1] + ', ' + ct[2] + ', ' + ct[3], ')';
    a[0].innerHTML = ih;
    let t1 = null;
    a[0].addEventListener('mouseenter', e => {
      e.preventDefault();
      if (t1) {
        return;
      }
      rcbg();
      a[1] = 0.7;
      a[[0]].style.backgroundColor = 'rgba(' + cbg[0] + ', ' + cbg[1] + ', ' + cbg[2] + ', ' + a[1] + ')';
    });
    a[0].addEventListener('mouseleave', e => {
      e.preventDefault();
      if (t1) {
        return;
      }
      rcbg();
      a[1] = 0.5;
      a[0].style.backgroundColor = 'rgba(' + cbg[0] + ', ' + cbg[1] + ', ' + cbg[2] + ', ' + a[1] + ')';
    });
    a[0].addEventListener('click', e => {
      e.preventDefault();
      window.open(href, '_blank');
      a[0].style.transition = '';
      rcbg();
      a[1] = 1;
      a[0].style.backgroundColor = 'rgba(' + cbg[0] + ', ' + cbg[1] + ', ' + cbg[2] + ', ' + a[1] + ')';
      if (t1) {
        clearTimeout(t1);
      }
      t1 = setTimeout(() => {
        a[0].style.transition = 'background-color 1s ease-out';
        rcbg();
        a[1] = 0.5;
        a[0].style.backgroundColor = 'rgba(' + cbg[0] + ', ' + cbg[1] + ', ' + cbg[2] + ', ' + a[1] + ')';
        t1 = setTimeout(() => {
          t1 = null;
          a[0].style.transition = 'background-color 0.4s ease-out';
          rcbg();
          a[1] = 0.5;
          a[0].style.backgroundColor = 'rgba(' + cbg[0] + ', ' + cbg[1] + ', ' + cbg[2] + ', ' + a[1] + ')';
        }, 1000);
      }, 500);
    });
    itemInfoBoxLinks.push(a);
    return a[0];
  }

  function cvtItemInfoBoxLinks(n, l) {
    let n0 = n.cloneNode();
    let c = n.childNodes;
    for (const n1 of c) {
      let l0 = n1.nodeName === 'A';
      let n2 = cvtItemInfoBoxLinks(n1, l || l0);
      if (l0) {
        let href = '';
        let a = n1.getAttributeNode('href');
        if (a && a.nodeValue) {
          href = a.nodeValue.trim();
        }
        let n3 = n2;
        if (l || !href) {
          n2 = document.createElement('span');
          n2.innerHTML = n3.innerHTML;
        } else {
          n2 = crtItemInfoBoxLink(n3.innerHTML, href);
        }
      }
      n0.appendChild(n2);
    }
    return n0;
  }

  function removeItemInfoBox() {
    if (rssSelMode < 2 && (rssSelItemnox||rssSelItemno) && itemEls && itemEls[(rssSelItemnox||rssSelItemno)-1]) {
      itemEls[(rssSelItemnox||rssSelItemno)-1][4].style.borderStyle = 'dotted';
      if (rssSelMode === 0) {
        let col = itemEls[(rssSelItemnox||rssSelItemno)-1][6].col ? itemEls[(rssSelItemnox||rssSelItemno)-1][6].col : dftColorNew;
        itemEls[(rssSelItemnox||rssSelItemno)-1][4].style.borderColor = 'rgba('+col[0]+', '+col[1]+', '+col[2]+', 1)';
      }
    }
    if (itemInfoBox) {
      itemInfoBox.style.opacity = '0';
      let e = itemInfoBox;
      itemInfoBox = null;
      itemInfoBoxLinks = [];
      setTimeout(() => {e.remove();}, 1000);
    }
  }

  function replaceNodeChildren(n, c) {
    for (const n0 of n.childNodes) {
      n0.remove();
    }
    for (const n0 of c) {
      n.appendChild(n0);
    }
  }

  function sanitizeUrl(url) {
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

      if (!rsslist[0].url) {
        return endFetch('No url.');
      }

      let url2 = '';
      if (elem.proxyUrl) {
        url2 = sanitizeUrl(elem.proxyUrl);
        if (url2.indexOf('%%_URL_%%') === -1) {
          throw new Error('Proxy url contains no %%_URL_%%.');
        }
        url2 = url2.replace('%%_URL_%%', rsslist[0].url);
      } else {
        url2 = rsslist[0].url;
      }
      let r = await fetch(url2, elem.fetchOpts);
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
        throw new Error('Could not parse RSS/Atom feed.');
      }

      p = null;
      let e0 = d.querySelectorAll('item');
      let e1 = [];
      for (const e of e0) {
        if (e.parentElement && e.querySelector('title')) {
          p = p ? p : e.parentElement;
          if (p === e.parentElement) {
            e1.push(e);
          }
        }
      }
      if (e1.length === 0) {
        p = null;
        e0 = d.querySelectorAll('entry');
        e1 = [];
        for (const e of e0) {
          if (e.parentElement && e.querySelector('title')) {
            p = p ? p : e.parentElement;
            if (p === e.parentElement) {
              e1.push(e);
            }
          }
        }
      }
      if (e1.length === 0) {
        throw new Error('No items/entries (with title) found in RSS/Atom feed.');
      }
      if (!p) {
        throw new Error('Items/entries have no parent node in RSS/Atom feed.');
      }

      let ium = new Map();

      function addiu(n, q, ua) {
        let m = ium.get(n);
        if (!m) {
          m = new Map();
          ium.set(n, m);
        }
        let a = m.get(q);
        if (!a) {
          a = [];
          m.set(q, a);
        }
        for (const u of ua) {
          a.push(u.trim());
        }
      }

      function extr(p, n) {
        let c0 = p.children, c1 = null, a = null;
        let ci0 = 0, ci1 = -1, ai = -1;
        let t0 = '', t1 = '', an = '';
        let date1 = null, date2 = null, link1 = null, link2 = null, link3 = null, link4 = null, link5 = null, lrel = null, lhref = null;
        while (ci0 < c0.length) {
          t0 = c0[ci0].tagName.toLowerCase();
          t1 = ci1 === -1 ? '' : c1[ci1].tagName.toLowerCase();
          an = ai === -1 ? '' : a[ai].name.toLowerCase();
          if (ci1 === -1 && ai === -1) {
            if (lhref && lrel === 'alternate') {
              link4 = lhref;
            }
            if (lhref && !lrel) {
              link5 = lhref;
            }
            lrel = lhref = null;
          }
          if (n === 0 && (t0 === 'item' || t0 === 'entry')) {
            rsslist.push({});
            extr(c0[ci0], rsslist.length - 1);
            ci0++;
          } else {
            let s = '';
            if (ai === -1) {
              if (ci1 === -1) {
                s = c0[ci0].textContent ? c0[ci0].textContent.trim() : '';
              } else {
                s = c1[ci1].textContent ? c1[ci1].textContent.trim() : '';
              }
            } else {
              s = a[ai].value ? a[ai].value.trim() : '';
            }
            if (s) {
              if (t0.includes('title') && ci1 === -1 && ai === -1) {
                rsslist[n].title = s;
              }
              if ((t0.includes('description') || t0.includes('summary')) && ci1 === -1 && ai === -1) {
                rsslist[n].description = s;
              }
              if (n > 0) {
                if (t0.includes('content') && ci1 === -1 && ai === -1) {
                  rsslist[n].content = s;
                }
                if ((t0.includes('date') || t0.includes('updated')) && ci1 === -1 && ai === -1) {
                  date1 = dateFromString(s);
                }
                if (t0.includes('published') && ci1 === -1 && ai === -1) {
                  date2 = dateFromString(s);
                }
                if (t0.includes('link') && ci1 === -1 && ai === -1) {
                  link1 = s;
                }
                if (t0.includes('content') && ci1 === -1 && an === 'src' && s.startsWith('http')) {
                  link2 = s;
                }
                if (t0 === 'id' && ci1 === -1 && ai === -1 && s.startsWith('http')) {
                  link3 = s;
                }
                if (t0.includes('link') && ci1 === -1 && an === 'rel') {
                  lrel = s.toLowerCase();
                }
                if (t0.includes('link') && ci1 === -1 && an === 'href' && s.startsWith('http')) {
                  lhref = s;
                }
              }
              let ua = extractImgUrls(s), q = 9;
              if (ua.length > 0) {
                if (t0.includes('image') && t1.includes('url') && ai === -1) {
                  q = 1;
                } else if (t0.includes('enclosure') && ci1 === -1 && an === 'url') {
                  q = 2;
                } else if (t0.includes('image') || t1.includes('image') || an.includes('image') || t0.includes('media') || t1.includes('media') || an.includes('media') || t0.includes('thumbnail') || t1.includes('thumbnail') || an.includes('thumbnail') || t0.includes('icon') || t1.includes('icon') || an.includes('icon') || t0.includes('logo') || t1.includes('logo') || an.includes('logo')) {
                  q = 3;
                } else if (t0.includes('title') || t0.includes('description') || t0.includes('summary') || t0.includes('content')) {
                  q = 4;
                }
                addiu(n, q, ua);
              }
            }
            if (ai === -1) {
              if (ci1 === -1) {
                if (c0[ci0].hasAttributes()) {
                  a = c0[ci0].attributes;
                  ai = 0;
                }
              } else {
                if (c1[ci1].hasAttributes()) {
                  a = c1[ci1].attributes;
                  ai = 0;
                }
              }
            } else if (ai < a.length - 1) {
              ai++;
            } else {
              a = null;
              ai = -1;
            }
            if (ai === -1) {
              if (ci1 === -1) {
                if (c0[ci0].children.length > 0) {
                  c1 = c0[ci0].children;
                  ci1 = 0;
                }
              } else if (ci1 < c0[ci0].children.length - 1) {
                ci1++;
              } else {
                c1 = null;
                ci1 = -1;
              }
              if (ci1 === -1) {
                ci0++;
              }
            }
          }
        }
        if (date1) {
          rsslist[n].date = date1;
        } else if (date2) {
          rsslist[n].date = date2;
        }
        if (link1) {
          rsslist[n].link = link1;
        } else if (link2) {
          rsslist[n].link = link2;
        } else if (link3) {
          rsslist[n].link = link3;
        } else if (link4) {
          rsslist[n].link = link4;
        } else if (link5) {
          rsslist[n].link = link5;
        }
      }

      extr(p, 0);

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

      function extractImgUrls(s) {
        let ua = s.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png)/g);
        return ua ? ua : [];
      }

      for (const n0 of ium.keys()) {
        let q0 = ium.get(n0);
        for (const q of q0.keys()) {
          let ua = q0.get(q);
          for (let i = 0; i < ua.length; i++) {
            let u = ua[i];
            if (u) {
              ua[i] = null;
              let s = true;
              for (const n of ium.keys()) {
                if (n !== n0) {
                  let q0 = ium.get(n);
                  for (const q of q0.keys()) {
                    let ua = q0.get(q);
                    for (let i = 0; i < ua.length; i++) {
                      if (ua[i] && ua[i] === u) {
                        s = false;
                        ua[i] = null;
                      }
                    }
                  }
                }
              }
              if (s) {
                ua[i] = u;
              }
            }
          }
        }
      }

      async function ldimgs(n) {
        let q0 = ium.get(n);
        if (!q0) {
          return;
        }
        for (let q = 1; q <= 9; q++) {
          let ua = q0.get(q);
          if (ua) {
            await new Promise((res, rej) => {
              let c = ua.reduce((a, v) => a + (v ? 1 : 0), 0);
              if (c === 0) {
                res(null);
              } else {
                for (let i = 0; i < ua.length; i++) {
                  if (ua[i]) {
                    let s = ua[i];
                    ua[i] = new Image();
                    ua[i].src = s;
                    ua[i].onload = () => {c--; if (c === 0) {res(null);}};
                    ua[i].onerror = () => {ua[i] = null; c--; if (c === 0) {res(null);}};
                  }
                }
              }
            });
            let msi;
            do {
              let ms = -1;
              msi = -1;
              for (let i = 0; i < ua.length; i++) {
                if (ua[i] && ua[i].width + ua[i].height > ms) {
                  msi = i;
                  ms = ua[i].width + ua[i].height;
                }
              }
              if (msi > -1) {
                let a = [ua[msi], new Image()];
                await new Promise((res, rej) => {
                  a[1].src = a[0].src;
                  a[1].onload = () => {res(null);};
                  a[1].onerror = () => {a[1] = null; res(null);};
                });
                if (a[1]) {
                  rsslist[0].hasImgs = true;
                  rsslist[n].image = a;
                  return;
                } else {
                  ua[msi] = null;
                }
              }
            } while (msi > -1);
          }
        }
      }

      await Promise.all(rsslist.map((v, n) => ldimgs(n)));

      if (stop()) {
        return endFetch(null);
      }

      if (rsslist.length === 1) {
        throw new Error('RSS/Atom feed does not contain any items/entries.');
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

// https://stackoverflow.com/questions/34980574/how-to-extract-color-values-from-rgb-string-in-javascript
function extractColorValue(color) {
  if (!color || color.trim() === '') {
    return undefined;
  }
  if (color[0] === '#') {
    if (color.length < 7) {
      color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] + (color.length > 4 ? color[4] + color[4] : '');
    }
    return [ parseInt(color.substr(1, 2), 16), parseInt(color.substr(3, 2), 16), parseInt(color.substr(5, 2), 16), color.length > 7 ? parseInt(color.substr(7, 2), 16) / 255 : 1];
  }
  if (color.indexOf('rgb') === -1) {
    let tempElem = document.body.appendChild(document.createElement('fictum')); // intentionally use unknown tag to lower chances of css rule override with !important
    let flag = 'rgb(1, 2, 3)'; // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
    tempElem.style.color = flag;
    if (tempElem.style.color !== flag) {
      document.body.removeChild(tempElem);
      return undefined; // color set failed - some monstrous css rule is probably taking over the color of our object
    }
    tempElem.style.color = color;
    if (tempElem.style.color === flag || tempElem.style.color === '') {
      document.body.removeChild(tempElem);
      return undefined; // color parse failed
    }
    color = getComputedStyle(tempElem).color;
    document.body.removeChild(tempElem);
  }
  if (color.indexOf('rgb') === 0) {
    if (color.indexOf('rgba') === -1) {
      color += ',1'; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
    }
    return color.match(/[\.\d]+/g).map(a => parseFloat(a));
  }
  return undefined;
}

customElements.define('rss-ticker', RssTicker);

customElements.whenDefined('rss-ticker').then(() => ready = true);

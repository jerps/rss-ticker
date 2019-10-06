/* eslint-disable require-atomic-updates */
/*

rss-ticker v0.8.2

(c) 2019 John Erps

This software is licensed under the MIT license (see LICENSE)

*/

import "core-js-pure/stable";
import "regenerator-runtime/runtime";

const dftColorNew = [255, 0, 0], dftColorOld = [0, 0, 255], dftHrsNew = 1, dftHrsOld = 12, updItemTimingInterval = 20;

const rssHtml = document.createElement('template');
rssHtml.innerHTML = `
  <style>
    *, *:before, *:after {
      box-sizing: border-box;
    }
    :host {
      display: flex;
      overflow-x: hidden;
    }
    :host([hidden]) {
      display: none;
    }
    #wrapper {
      position: relative;
      display: flex;
      align-items: center;
      white-space: nowrap;
      padding: 0;
      border-width: 0;
      cursor: default;
    }
    .itemcont {
      border-width: 0;
      padding: 0;
    }
    .item {
      border-width: 0;
      padding: 0;
      margin: 0;
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

window.ShadyCSS && window.ShadyCSS.prepareTemplate(rssHtml, 'rss-ticker');

export default class RssTicker extends HTMLElement {

  static get observedAttributes() {
    return ['speed', 'img-size', 'font-size', 'item-gap', 'color-new', 'color-old', 'hrs-new', 'hrs-old', 'transparency', 'scrollright'];
  }

  static get apNames() {
     return [
        'url', 'url',
        'proxy-url', 'proxyUrl',
        'speed', 'speed',
        'font-size', 'fontSize',
        'img-size', 'imgSize',
        'transparency', 'transparency',
        'item-gap', 'itemGap',
        'hrs-new', 'hrsNew',
        'hrs-old', 'hrsOld',
        'color-new', 'colorNew',
        'color-old', 'colorOld',
        'infobox-link-color', 'infoboxLinkColor',
        'infobox-link-bgcolor', 'infoboxLinkBgColor',
        'infobox-img-size', 'infoboxImgSize',
        'refetch-mins', 'refetchMins',
        'keep-url', 'keepUrl',
        'no-imgs', 'noImgs',
        'scrollright', 'scrollright',
        'cont-run', 'contRun',
        'autostart', 'autostart'
     ];
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(document.importNode(rssHtml.content, true));
    this._impl = impl(this);
    this._impl.runningListeners = [];
    this._impl.busyListeners = [];
    this._impl.connected = false;
    this._impl.errmsg = undefined;
    this._impl.fetchOpts = undefined;
  }

  connectedCallback() {
    window.ShadyCSS && window.ShadyCSS.styleElement(this);
    if (!this._impl.connected) {
      let apn = RssTicker.apNames;
      for (let i = 0; i < apn.length - 1; i += 2) {
        this._impl.upgradeProperty(apn[i+1]);
      }
      this._impl.connected = true;
      if (!this.hasAttribute('color-new') || !this.getAttribute('color-new')) {
        this.setAttribute('color-new', '#' + rgbToHex(dftColorNew[0], dftColorNew[1], dftColorNew[2]));
      }
      if (!this.hasAttribute('color-old') || !this.getAttribute('color-old')) {
        this.setAttribute('color-old', '#' + rgbToHex(dftColorOld[0], dftColorOld[1], dftColorOld[2]));
      }
      if (Number(this.autostart) > 0) {
        setTimeout(() => {
          if (this._impl.connected) {
            this.startTicker(undefined, true);
          }
        }, Number(this.autostart) * 1000);
      }
    }
  }

  disconnectedCallback() {
    this._impl.stop(true);
    this._impl.connected = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue == newValue) {
      return;
    }
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
        this._impl.infoboxLinkColorChanged();
        break;
      case 'infobox-link-bgcolor':
        this._impl.infoboxLinkBgColorChanged();
        break;
      case 'scrollright':
        this._impl.scrollrightChanged();
        break;
    }
  }

  set url(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('url');
    } else {
      this.setAttribute('url', String(v).trim());
    }
  }

  get url() {
    return (this.hasAttribute('url') ? this.getAttribute('url').trim() : '') || 'http://rss.cnn.com/rss/edition.rss';
  }

  set speed(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('speed');
    } else {
      this.setAttribute('speed', String(v));
    }
  }

  get speed() {
    let v;
    v = (v = (this.hasAttribute('speed') ? this.getAttribute('speed') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? '3' : v < 1 ? '1' : v > 10 ? '10' : String(v);
  }

  set imgSize(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('img-size');
    } else {
      this.setAttribute('img-size', String(v));
    }
  }

  get imgSize() {
    let v;
    v = (v = (this.hasAttribute('img-size') ? this.getAttribute('img-size') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? '4' : v < 0.001 ? '0.001' : v > 999 ? '999' : String(v);
  }

  set fontSize(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('font-size');
    } else {
      this.setAttribute('font-size', String(v));
    }
  }

  get fontSize() {
    let v;
    v = (v = (this.hasAttribute('font-size') ? this.getAttribute('font-size') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? '1' : v < 0.001 ? '0.001' : v > 999 ? '999' : String(v);
  }

  set itemGap(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('item-gap');
    } else {
      this.setAttribute('item-gap', String(v));
    }
  }

  get itemGap() {
    let v;
    v = (v = (this.hasAttribute('item-gap') ? this.getAttribute('item-gap') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? '1' : v < 0.001 ? '0.001' : v > 999 ? '999' : String(v);
  }

  set colorNew(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('color-new');
    } else {
      this.setAttribute('color-new', String(v));
    }
  }

  get colorNew() {
    let v = this.hasAttribute('color-new') ? this.getAttribute('color-new').trim() : '';
    if (v.length === 0) {
      v = this.hasAttribute('color-old') ? this.getAttribute('color-old').trim() : '';
    } else {
      v = rgbStr(v);
    }
    return v || rgbToHex(...dftColorNew);
  }

  set colorOld(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('color-old');
    } else {
      this.setAttribute('color-old', String(v));
    }
  }

  get colorOld() {
    let v = this.hasAttribute('color-old') ? this.getAttribute('color-old').trim() : '';
    if (v.length === 0) {
      v = this.hasAttribute('color-new') ? this.getAttribute('color-new').trim() : '';
    } else {
      v = rgbStr(v);
    }
    return v || rgbToHex(...dftColorOld);
  }

  set hrsNew(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('hrs-new');
    } else {
      this.setAttribute('hrs-new', String(v));
    }
  }

  get hrsNew() {
    let v;
    v = (v = (this.hasAttribute('hrs-new') ? this.getAttribute('hrs-new') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? String(dftHrsNew) : v < 0.001 ? '0.001' : v > 999 ? '999' : String(v);
  }

  set hrsOld(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('hrs-old');
    } else {
      this.setAttribute('hrs-old', String(v));
    }
  }

  get hrsOld() {
    let v;
    v = (v = (this.hasAttribute('hrs-old') ? this.getAttribute('hrs-old') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? String(dftHrsOld) : v < 0.001 ? '0.001' : v > 999 ? '999' : String(v);
  }

  set transparency(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('transparency');
    } else {
      this.setAttribute('transparency', String(v));
    }
  }

  get transparency() {
    let v;
    v = (v = (this.hasAttribute('transparency') ? this.getAttribute('transparency') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? '0.1' : v < 0 ? '0' : v > 1 ? '1' : String(v);
  }


  set infoboxImgSize(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('infobox-img-size');
    } else {
      this.setAttribute('infobox-img-size', String(v));
    }
  }

  get infoboxImgSize() {
    let v;
    v = (v = (this.hasAttribute('infobox-img-size') ? this.getAttribute('infobox-img-size') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? '2' : v < 0.001 ? '0.001' : v > 999 ? '999' : String(v);
  }

  set infoboxLinkColor(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('infobox-link-color');
    } else {
      this.setAttribute('infobox-link-color', String(v));
    }
  }

  get infoboxLinkColor() {
    return rgbStr(this.hasAttribute('infobox-link-color') ? this.getAttribute('infobox-link-color').trim() : '', 1) || '';
  }

  set infoboxLinkBgColor(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('infobox-link-bgcolor');
    } else {
      this.setAttribute('infobox-link-bgcolor', String(v));
    }
  }

  get infoboxLinkBgColor() {
    return rgbStr(this.hasAttribute('infobox-link-bgcolor') ? this.getAttribute('infobox-link-bgcolor').trim() : '') || '#fff';
  }

  set keepUrl(v) {
    if (v === 'true' || v && v !== 'false') {
      this.setAttribute('keep-url', '');
    } else {
      this.removeAttribute('keep-url');
    }
  }

  get keepUrl() {
    return this.hasAttribute('keep-url');
  }

  set refetchMins(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('refetch-mins');
    } else {
      this.setAttribute('refetch-mins', String(v));
    }
  }

  get refetchMins() {
    let v;
    v = (v = (this.hasAttribute('refetch-mins') ? this.getAttribute('refetch-mins') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? '10' : v < 0 ? '0' : v > 999 ? '999' : String(v);
  }

  set noImgs(v) {
    if (v === 'true' || v && v !== 'false') {
      this.setAttribute('no-imgs', '');
    } else {
      this.removeAttribute('no-imgs');
    }
  }

  get noImgs() {
    return this.hasAttribute('no-imgs');
  }

  set scrollright(v) {
    if (v === 'true' || v && v !== 'false') {
      this.setAttribute('scrollright', '');
    } else {
      this.removeAttribute('scrollright');
    }
  }

  get scrollright() {
    return this.hasAttribute('scrollright');
  }

  set proxyUrl(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('proxy-url');
    } else {
      this.setAttribute('proxy-url', String(v));
    }
  }

  get proxyUrl() {
    return (this.hasAttribute('proxy-url') ? this.getAttribute('proxy-url').trim() : '') || '%%_URL_%%';
  }

  set contRun(v) {
    if (v === 'true' || v && v !== 'false') {
      this.setAttribute('cont-run', '');
    } else {
      this.removeAttribute('cont-run');
    }
  }

  get contRun() {
    return this.hasAttribute('cont-run');
  }

  set autostart(v) {
    if (v === undefined || v === null) {
      this.removeAttribute('autostart');
    } else {
      this.setAttribute('autostart', String(v));
    }
  }

  get autostart() {
    let v;
    v = (v = (this.hasAttribute('autostart') ? this.getAttribute('autostart') : '').trim()) ? Number(v) : NaN;
    return isNaN(v) ? '0' : v < 0 ? '0' : v > 999 ? '999' : String(v);
  }

  get running() {
    return !!this._impl.running;
  }

  get busy() {
    return !!this._impl.busy;
  }

  get errmsg() {
    return this._impl.errmsg;
  }

  set fetchOpts(opts) {
    this._impl.fetchOpts = Object.assign({}, opts);
  }

  get fetchOpts() {
    return this._impl.fetchOpts ? Object.assign({}, this._impl.fetchOpts) : {};
  }

  startTicker(url, immed) {
    this._impl.start(url, !!immed);
  }

  stopTicker(immed) {
    this._impl.stop(!!immed);
  }

  addRunningListener(l) {
    this._impl.runningListeners.push(l);
  }

  removeRunningListener(l) {
    let i = this._impl.runningListeners.indexOf(l);
    if (i >= 0) {
      this._impl.runningListeners.splice(i, 1);
    }
  }

  addBusyListener(l) {
    this._impl.busyListeners.push(l);
  }

  removeBusyListener(l) {
    let i = this._impl.busyListeners.indexOf(l);
    if (i >= 0) {
      this._impl.busyListeners.splice(i, 1);
    }
  }

}

let ready = false, phimg = null, rl0 = null;

function impl(elem) {

let implexp = {busy: false, running: false};

let root = elem.shadowRoot, tickc = 0, wrapper = null, actc = 0, showedImgs = true;

let startRequestedCallback = null;
function requestStart(url) {
  if (startRequestedCallback) {
    startRequestedCallback(url);
  }
}

let stopRequestedCallback = null;
function requestStop() {
  if (stopRequestedCallback) {
    stopRequestedCallback();
  }
}

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

let infoboxLinkColorChangedCallback = null;
implexp.infoboxLinkColorChanged = () => {
  if (infoboxLinkColorChangedCallback) {
    infoboxLinkColorChangedCallback();
  }
};

let infoboxLinkBgColorChangedCallback = null;
implexp.infoboxLinkBgColorChanged = () => {
  if (infoboxLinkBgColorChangedCallback) {
    infoboxLinkBgColorChangedCallback();
  }
};

let scrollrightChangedCallback = null;
implexp.scrollrightChanged = () => {
  if (scrollrightChangedCallback) {
    scrollrightChangedCallback();
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
  infoboxLinkColorChangedCallback = null;
  infoboxLinkBgColorChangedCallback = null;
  scrollrightChangedCallback = null;
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
  if (implexp.busy && !immed && elem.contRun) {
    requestStart(url);
  } else {
    runticker(true, url);
  }
}
implexp.start = startticker;

function stopticker(immed) {
  if (implexp.busy && !immed && elem.contRun) {
    requestStop();
  } else {
    runticker(false);
    if (implexp.busy) {
      implexp.busy = false;
      triggerBusyEvent(false);
    }
    clearElemCallbacks();
  }
}
implexp.stop = stopticker;

implexp.upgradeProperty = prop => {
  if (Object.prototype.hasOwnProperty.call(elem, prop)) {
    let v = elem[prop];
    delete elem[prop];
    elem[prop] = v;
  }
};

function triggerBusyEvent(b) {
  for (const l of implexp.busyListeners) {
    l.call(elem, b);
  }
}

async function tick(tc, url) {

  if (!implexp.busy) {
    implexp.busy = true;
    triggerBusyEvent(true);
  }

  if (!phimg) {
    phimg = new Image();
    phimg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAEGWlDQ1BrQ0dDb2xvclNwYWNlR2VuZXJpY1JHQgAAOI2NVV1oHFUUPrtzZyMkzlNsNIV0qD8NJQ2TVjShtLp/3d02bpZJNtoi6GT27s6Yyc44M7v9oU9FUHwx6psUxL+3gCAo9Q/bPrQvlQol2tQgKD60+INQ6Ium65k7M5lpurHeZe58853vnnvuuWfvBei5qliWkRQBFpquLRcy4nOHj4g9K5CEh6AXBqFXUR0rXalMAjZPC3e1W99Dwntf2dXd/p+tt0YdFSBxH2Kz5qgLiI8B8KdVy3YBevqRHz/qWh72Yui3MUDEL3q44WPXw3M+fo1pZuQs4tOIBVVTaoiXEI/MxfhGDPsxsNZfoE1q66ro5aJim3XdoLFw72H+n23BaIXzbcOnz5mfPoTvYVz7KzUl5+FRxEuqkp9G/Ajia219thzg25abkRE/BpDc3pqvphHvRFys2weqvp+krbWKIX7nhDbzLOItiM8358pTwdirqpPFnMF2xLc1WvLyOwTAibpbmvHHcvttU57y5+XqNZrLe3lE/Pq8eUj2fXKfOe3pfOjzhJYtB/yll5SDFcSDiH+hRkH25+L+sdxKEAMZahrlSX8ukqMOWy/jXW2m6M9LDBc31B9LFuv6gVKg/0Szi3KAr1kGq1GMjU/aLbnq6/lRxc4XfJ98hTargX++DbMJBSiYMIe9Ck1YAxFkKEAG3xbYaKmDDgYyFK0UGYpfoWYXG+fAPPI6tJnNwb7ClP7IyF+D+bjOtCpkhz6CFrIa/I6sFtNl8auFXGMTP34sNwI/JhkgEtmDz14ySfaRcTIBInmKPE32kxyyE2Tv+thKbEVePDfW/byMM1Kmm0XdObS7oGD/MypMXFPXrCwOtoYjyyn7BV29/MZfsVzpLDdRtuIZnbpXzvlf+ev8MvYr/Gqk4H/kV/G3csdazLuyTMPsbFhzd1UabQbjFvDRmcWJxR3zcfHkVw9GfpbJmeev9F08WW8uDkaslwX6avlWGU6NRKz0g/SHtCy9J30o/ca9zX3Kfc19zn3BXQKRO8ud477hLnAfc1/G9mrzGlrfexZ5GLdn6ZZrrEohI2wVHhZywjbhUWEy8icMCGNCUdiBlq3r+xafL549HQ5jH+an+1y+LlYBifuxAvRN/lVVVOlwlCkdVm9NOL5BE4wkQ2SMlDZU97hX86EilU/lUmkQUztTE6mx1EEPh7OmdqBtAvv8HdWpbrJS6tJj3n0CWdM6busNzRV3S9KTYhqvNiqWmuroiKgYhshMjmhTh9ptWhsF7970j/SbMrsPE1suR5z7DMC+P/Hs+y7ijrQAlhyAgccjbhjPygfeBTjzhNqy28EdkUh8C+DU9+z2v/oyeH791OncxHOs5y2AtTc7nb/f73TWPkD/qwBnjX8BoJ98VQNcC+8AAAALSURBVAgdY2AAAgAABQABjbub8wAAAABJRU5ErkJggg==';
    phimg = await (new Promise((res) => {
      phimg.onload = () => res(phimg);
      phimg.onerror = () => res(null);
    }));
  }

  let rsslist = [{id:elem.id||'', url: sanitizeUrl(url?url:elem.url), proxyUrl: sanitizeUrl(elem.proxyUrl), hasImgs: false, reqImgs: !elem.noImgs}];
  let fetched = false, fetching = false, rssstart = false, rsserr = false;
  let elemlen = 0, elemlen2 = 0, itemslen = 0, pos = 0, pos2 = 0, elemlent = 0, post = 0, posd = 0;
  let itemEls = [];
  let refetcht = performance.now();
  let startreq = false, startrequrl = null, stopreq = false;
  let speed = Number(elem.speed), transparency = Number(elem.transparency);
  let initItemElsBusy = false, initItemElsBusy2 = false;
  let wq = [], wqi = 0;
  let rssSelMode = 0, rssSelItemno = 0, rssSelItemnox = 0, rssSelPosX = 0, rssSelPosY = 0, rssSelPosD = 0, rssSelMouseUp = true;
  let scright = elem.scrollright;
  let colorNew, colorOld, hrsNew, hrsOld;
  let itemInfoBox = null, itemInfoBoxLinks = [];
  let epageY = 0, ltpx = 0, ltpy = 0;

  actc = tc;

  implexp.errmsg = null;

  function triggerRunningEvent(r, x) {
    if (implexp.runningListeners.length === 0) {
      return;
    }
    let d = x || rsslist[0], ri = { running: r };
    for (const a of ['id', 'url', 'proxyUrl', 'title', 'description', 'image', 'errmsg']) {
      if (d[a]) {
        ri[a] = d[a];
      }
    }
    ri.inum = rsslist.length - 1;
    for (const l of implexp.runningListeners) {
      l.call(elem, ri);
    }
  }

  if (implexp.running) {
    implexp.running = false;
    triggerRunningEvent(false, rl0);
  }
  rl0 = rsslist[0];

  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'wrapper';
    root.appendChild(wrapper);
  }

  wrapper.style.fontSize = '' + (Number(elem.fontSize) * 100) + '%';

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
    speed = Number(elem.speed);
  };

  imgSizeChangedCallback = () => {
    addwork(workChangeImgSize, Number(elem.imgSize));
  };

  fontSizeChangedCallback = () => {
    wrapper.style.fontSize = '' + (Number(elem.fontSize) * 100) + '%';
    addwork(workChangeItemGaps, null);
  };

  itemGapChangedCallback = () => {
    addwork(workChangeItemGaps, Number(elem.itemGap));
  };

  colorChangedCallback = () => {
    colorNew = strToRgba(elem.colorNew);
    colorOld = strToRgba(elem.colorOld);
  };
  colorChangedCallback();

  hrsNewChangedCallback = () => {
    hrsNew = Number(elem.hrsNew);
  };
  hrsNewChangedCallback();

  hrsOldChangedCallback = () => {
    hrsOld = Number(elem.hrsOld);
  };
  hrsOldChangedCallback();

  transparencyChangedCallback = () => {
    transparency = Number(elem.transparency);
    addwork(workChangeTransparency, null);
  };

  infoboxLinkColorChangedCallback = () => {
    if (itemInfoBox && rssSelMode > 1 && rssSelItemno > 0) {
      updateItemInfoBoxColor();
    }
  };

  infoboxLinkBgColorChangedCallback = () => {
    if (itemInfoBox && rssSelMode > 1 && rssSelItemno > 0) {
      updateItemInfoBoxColor();
    }
  };

  scrollrightChangedCallback = () => {
    if (elem.scrollright !== scright) {
      scright = elem.scrollright;
      if (rssstart) {
        pos = 1 - pos;
      }
    }
  };

  function stop() {
    return tc !== tickc;
  }

  function release() {
    window.removeEventListener('touchstart', windowTouchStartListener0);
    window.removeEventListener('mousedown', windowMouseDownListener0);
    window.removeEventListener('mousedown', windowMouseDownListener);
    window.removeEventListener('touchend', windowTouchEndListener);
    window.removeEventListener('mouseup', windowMouseUpListener);
    window.removeEventListener('touchmove', windowTouchMoveListener);
    window.removeEventListener('mousemove', windowMouseMoveListener);
    rssSelMode = 0;
    deleteItemInfoBox();
    rssSelItemno = 0;
    rssSelItemnox = 0;
    rssSelPosX = 0;
    rssSelPosY = 0;
    rssSelPosD = 0;
    rssSelMouseUp = true;
    if (tc === actc) {
      clearElemCallbacks();
      if (implexp.running) {
        implexp.running = false;
        triggerRunningEvent(false);
      }
    }
    if (wrapper && tc === actc) {
      wrapper.style.transition = 'opacity 1s ease-out';
      wrapper.style.opacity = '0';
      window.ShadyCSS && window.ShadyCSS.styleSubtree(elem);
      setTimeout(() => {
        if (tc === actc) {
          wrapper.remove();
          wrapper = null;
        }
      }, 1000);
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
      if (d < 0 && r.top < 0 || d > 0 && r.bottom > window.innerHeight) {
        itemInfoBox.style.top = '';
        itemInfoBox.style.bottom = '' + (window.innerHeight - (r.bottom + screen.height * 0.03 * ((0 - d) / screen.height))) + 'px';
        r = itemInfoBox.getBoundingClientRect();
        if (r.top > 0) {
          itemInfoBox.style.top = '0px';
          itemInfoBox.style.bottom = '';
        } else if (r.bottom < window.innerHeight) {
          itemInfoBox.style.top = '';
          itemInfoBox.style.bottom = '0px';
        }
      }
    }
    if (ready && implexp.connected && !initItemElsBusy && !initItemElsBusy2) {
      if (pos > 1) {
        pos = 1;
        implexp.running = false;
        triggerRunningEvent(false);
        if (startreq) {
          startticker(startrequrl, true);
        } else if (stopreq) {
          stopticker(true);
        } else {
          pos = pos2 = post = posd = 0;
          if (!elem.keepUrl && elem.url.trim() && elem.url.trim() !== rsslist[0].url) {
            startticker(elem.url.trim(), true);
          } else if ((performance.now() - refetcht) / 60000 > Number(elem.refetchMins)) {
            startticker(rsslist[0].url, true);
          } else if (rsserr) {
            implexp.running = true;
            triggerRunningEvent(true);
          } else {
            if (!rsslist[0].reqImgs && !elem.noImgs && !rsslist[0].hasImgs) {
              startticker(rsslist[0].url, true);
            } else {
              if (!rsslist[0].reqImgs && !elem.noImgs || rsslist[0].reqImgs && elem.noImgs) {
                rsslist[0].reqImgs = !rsslist[0].reqImgs;
                if (rsslist[0].hasImgs) {
                  initItemEls();
                }
              }
              implexp.running = true;
              triggerRunningEvent(true);
            }
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
              implexp.running = true;
              triggerRunningEvent(true);
              elemlen = elemlen2 = elem.getBoundingClientRect().width;
              if (rsserr) {
                implexp.errmsg = rsslist[0].errmsg;
                initItemEls('ERROR - ' + rsslist[0].errmsg, fullurl(), showedImgs ? phimg : null);
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
    if (scright) {
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
      posd = elemlen * 100 / (50000 - 49900 * (1 - Math.pow(11 - speed, 4) / 10000)) / (elemlen + 100 + itemslen);
      post = t;
    }
  }

  async function initItemEls(msg1, msg2, img, c) {
    initItemElsBusy = true;
    wrapper.style.transition = 'opacity 1s ease-out';
    wrapper.style.opacity = '0';
    window.ShadyCSS && window.ShadyCSS.styleSubtree(elem);
    await (new Promise((res) => {
      setTimeout(() => res(null), 1000);
    }));
    clearItemEls();
    if (c) {
      elem.style.display = 'flex';
      elem.style.justifyContent = 'center';
    } else {
      elem.style.display = 'flex';
      elem.style.justifyContent = '';
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
        addItemEl(i, rsslist[i].title, rsslist[i].date, rsslist[0].reqImgs ? rsslist[i].image ? rsslist[i].imga[0] : null : null);
      }
    }
    setItemGaps(Number(elem.itemGap));
    wrapper.style.transition = 'opacity 3s ease-in';
    wrapper.style.opacity = '1';
    setItemslen();
    initItemElsBusy = false;
    addwork(workUpdateItemTiming, 1, updItemTimingInterval);
    window.ShadyCSS && window.ShadyCSS.styleSubtree(elem);
    if (c) {
      initItemElsBusy2 = true;
      await (new Promise((res) => {
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
      col = crtItemColor(null);
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
      e2.style.height = '' + Number(elem.imgSize) + 'em';
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
    let s = '';
    if (typeof date === 'string' || date instanceof String) {
      s = date.trim();
    } else if (date) {
      dt = true;
      s = crtItemDateText(date, 1);
    }
    ed.textContent = s.trim() || '- - -';
    e.appendChild(ed);
    itemEls.push([e2, e0, ed, e3, e1, et, {col}, dt ? s : null]);
    if (img) {
      img.style.borderRadius = '' + Math.round((img.getBoundingClientRect().width + img.getBoundingClientRect().height) / 2 / 5) + 'px';
    }
    et.innerHTML = title.trim() || '- - -';
    if (dt) {
      ed.style.width = '' + ed.getBoundingClientRect().width + 'px';
      ed.textContent = crtItemDateText(date, 0, ino);
    }
    if (ino) {
      let mouseDownListener = () => {
        rssSelItemno = ino;
      };
      e0.addEventListener('touchstart', e => {
        e.preventDefault();
        mouseDownListener(neweo2(e));
      }, false);
      e0.addEventListener('mousedown', e => {
        e.preventDefault();
        mouseDownListener(neweo1(e));
      }, false);
      let mouseMoveListener = ev => {
        if (rssSelMode > 0 && rssSelItemno > 0 && ino !== rssSelItemno && !rssSelMouseUp && rssSelPosY === 0) {
          if (rssSelMode > 1) {
            rssSelMode = 1;
            deleteItemInfoBox();
            rssSelItemnox = 0;
            rssSelPosX = ev.x;
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
      };
      e0.addEventListener('touchmove', e => {
        e.preventDefault();
        mouseMoveListener(neweo2(e));
      }, false);
      e0.addEventListener('mousemove', e => {
        e.preventDefault();
        mouseMoveListener(neweo1(e));
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
    if (itemEls[i-1][7]) {
      itemEls[i-1][2].style.width = '';
      let t = itemEls[i-1][2].textContent;
      itemEls[i-1][2].textContent = itemEls[i-1][7];
      itemEls[i-1][2].style.width = '' + itemEls[i-1][2].getBoundingClientRect().width + 'px';
      itemEls[i-1][2].textContent = t;
    }
    window.ShadyCSS && window.ShadyCSS.styleSubtree(elem);
  }

  function crtItemDateText(dat, x, i) {
    let s;
    if (x) {
      return '888 \u22C5\u22C5 ' + dat.toLocaleString()+' \u22C5\u22C5 d888 h88 m88';
    } else {
      let ms = new Date().getTime() - dat;
      if (ms < 0) {
        s = dat.toLocaleString()+' \u22C5\u22C5 d<0';
      } else {
        let h = Math.trunc(ms / 1000 / 3600);
        let d = Math.trunc(h / 24);
        if (d > 999) {
          s = dat.toLocaleString()+' \u22C5\u22C5 d>999';
        } else {
          let m = Math.trunc((ms - h * 3600 * 1000) / 1000 / 60);
          h -= d * 24;
          s = dat.toLocaleString()+' \u22C5\u22C5'+(d>0?' d'+d:'')+(h>0?' h'+h:'')+' m'+m;
        }
      }
    }
    if (i) {
      return String(i) + ' \u22C5\u22C5 ' + s;
    } else {
      return s;
    }
  }

  function crtItemColor(dat) {
    if (!dat) {
      return [colorNew[0], colorNew[1], colorNew[2]];
    }
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
      deleteItemInfoBox();
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
      deleteItemInfoBox();
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
          itemEls[p-1][2].textContent = crtItemDateText(rsslist[p].date, 0, p);
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
            window.ShadyCSS && window.ShadyCSS.styleSubtree(elem);
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

  function workChangeTransparency(i) {
    if (i !== -1 && i !== -2) {
      let col = itemEls[i-1][6].col ? itemEls[i-1][6].col : dftColorNew;
      itemEls[i-1][4].style.background = 'radial-gradient(rgba('+col[0]+', '+col[1]+', '+col[2]+', 1), rgba('+col[0]+', '+col[1]+', '+col[2]+', '+((1-transparency)/2)+'))';
      if (itemInfoBox && rssSelMode > 1 && rssSelItemno > 0 && rssSelItemno === i) {
        updateItemInfoBoxColor();
      }
      window.ShadyCSS && window.ShadyCSS.styleSubtree(elem);
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

  function windowMouseDownHandler0() {
    rssSelItemnox = rssSelItemno;
    rssSelItemno = 0;
  }
  let windowMouseDownHandler0Flag = false;
  function windowTouchStartListener0(e) {
    windowMouseDownHandler0Flag = true;
    windowMouseDownHandler0(neweo2(e));
  }
  function windowMouseDownListener0(e) {
    if (!windowMouseDownHandler0Flag) {
      windowMouseDownHandler0(neweo1(e));
    }
    windowMouseDownHandler0Flag = false;
  }
  window.addEventListener('touchstart', windowTouchStartListener0, true);
  window.addEventListener('mousedown', windowMouseDownListener0, true);

  function windowMouseDownHandler(e) {
    rssSelMouseUp = false;
    if (rssSelMode > 0) {
      if (itemInfoBox && rssSelMode > 1 && rssSelItemnox > 0) {
        let r = itemInfoBox.getBoundingClientRect();
        if (e.x >= r.left && e.x <= r.right && e.y >= r.top && e.y <= r.bottom) {
          e.oe.preventDefault();
          rssSelItemno = rssSelItemnox;
          rssSelItemnox = 0;
          rssSelPosY = e.y;
          epageY = e.y;
          return;
        }
      }
      rssSelMode = 0;
      deleteItemInfoBox();
      rssSelPosX = 0;
      rssSelPosY = 0;
      rssSelPosD = 0;
    }
    if (rssSelMode === 0 && rssSelItemno > 0) {
      itemEls[rssSelItemno-1][4].style.borderColor = 'black';
      rssSelMode = 1;
      rssSelPosX = e.x;
      rssSelPosY = 0;
      rssSelPosD = 0;
      window.ShadyCSS && window.ShadyCSS.styleSubtree(elem);
    }
    rssSelItemnox = 0;
  }
  let windowMouseDownHandlerFlag = false;
  function windowTouchStartListener(e) {
    windowMouseDownHandlerFlag = true;
    windowMouseDownHandler(neweo2(e));
  }
  function windowMouseDownListener(e) {
    if (!windowMouseDownHandlerFlag) {
      windowMouseDownHandler(neweo1(e));
    }
    windowMouseDownHandlerFlag = false;
  }
  window.addEventListener('touchstart', windowTouchStartListener, false);
  window.addEventListener('mousedown', windowMouseDownListener, false);

  function windowMouseUpHandler(e) {
    rssSelMouseUp = true;
    if (rssSelPosY > 0) {
      rssSelPosY = 0;
      return;
    }
    if (itemInfoBox && rssSelMode > 1 && rssSelItemno > 0) {
      let r = itemInfoBox.getBoundingClientRect();
      if (e.x >= r.left && e.x <= r.right && e.y >= r.top && e.y <= r.bottom) {
        return;
      }
    }
    rssSelMode = 0;
    deleteItemInfoBox();
    rssSelItemno = 0;
    rssSelItemnox = 0;
    rssSelPosX = 0;
    rssSelPosY = 0;
    rssSelPosD = 0;
  }
  let windowMouseUpHandlerFlag = false;
  function windowTouchEndListener(e) {
    if (e.touches.length === 0) {
      windowMouseUpHandlerFlag = true;
      windowMouseUpHandler(neweo3(e));
    }
  }
  function windowMouseUpListener(e) {
    if (!windowMouseUpHandlerFlag) {
      windowMouseUpHandler(neweo1(e));
    }
    windowMouseUpHandlerFlag = false;
  }
  window.addEventListener('touchend', windowTouchEndListener, false);
  window.addEventListener('mouseup', windowMouseUpListener, false);

  function windowMouseMoveHandler(e) {
    epageY = e.y;
    if (rssSelMode === 0 || rssSelItemno === 0 || rssSelMouseUp || rssSelPosY > 0) {
      return;
    }
    let r = itemEls[rssSelItemno - 1][4].getBoundingClientRect();
    let m = rssSelMode;
    if (rssSelMode === 1) {
      if (e.y < r.top) {
        rssSelMode = 2;
        createItemInfoBox();
      } else if (e.y > r.bottom) {
        rssSelMode = 3;
        createItemInfoBox();
      }
    } else if (rssSelMode === 2) {
      if (e.y > r.bottom) {
        rssSelMode = 3;
        deleteItemInfoBox();
        createItemInfoBox();
      } else if (e.y > r.top) {
        rssSelMode = 1;
        deleteItemInfoBox();
      }
    } else if (rssSelMode === 3) {
      if (e.y < r.top) {
        rssSelMode = 2;
        deleteItemInfoBox();
        createItemInfoBox();
      } else if (e.y < r.bottom) {
        rssSelMode = 1;
        deleteItemInfoBox();
      }
    }
    if (rssSelMode === 1) {
      if (m !== 1) {
        rssSelPosX = e.x;
      }
      rssSelPosD = (rssSelPosD = (Math.abs(e.x - rssSelPosX) < screen.width * 0.02 ? 0 : e.x > rssSelPosX ? e.x - rssSelPosX - screen.width * 0.02 : e.x - rssSelPosX + screen.width * 0.02)  / (screen.width / 2)) < -1 ? -1 : rssSelPosD > 1 ? 1 : rssSelPosD;
      if (scright) {
        rssSelPosD = 0 - rssSelPosD;
      }
    }
  }
  let windowMouseMoveHandlerFlag = false;
  function windowTouchMoveListener(e) {
    windowMouseMoveHandlerFlag = true;
    windowMouseMoveHandler(neweo2(e));
  }
  function windowMouseMoveListener(e) {
    if (!windowMouseMoveHandlerFlag) {
      windowMouseMoveHandler(neweo1(e));
    }
    windowMouseMoveHandlerFlag = false;
  }
  window.addEventListener('touchmove', windowTouchMoveListener, false);
  window.addEventListener('mousemove', windowMouseMoveListener, false);

  function createItemInfoBox() {
    if (itemInfoBox || rssSelMode < 2 || rssSelItemno === 0 || rssSelItemno > rsslist.length - 1 || rssSelItemno > itemEls.length) {
      return;
    }
    let r1 = itemEls[rssSelItemno-1][4].getBoundingClientRect(), r2 = elem.getBoundingClientRect(), r3;
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
    itemInfoBox.style.boxShadow = '-1px 7px 24px 3px rgba(0,0,0,0.75)';
    itemInfoBox.style.color = getComputedStyle(elem).color;
    itemInfoBox.style.fontFamily = getComputedStyle(elem).fontFamily;
    itemInfoBox.style.fontSize = Math.round(parseFloat(getComputedStyle(itemEls[rssSelItemno-1][5]).fontSize) * 0.9);
    itemInfoBox.style.padding = '1.3rem 1.2rem 1rem 1.6rem';
    itemInfoBox.style.overflow = 'hidden';
    itemInfoBox.style.cursor = 'default';
    itemInfoBox.style.userSelect = 'none';
    itemInfoBox.style.top = '0px';
    itemInfoBox.style.left = '0px';
    itemInfoBox.style.bottom = '';
    itemInfoBox.style.right = '';
    let e, e1, e2, e3 = null, dcont = false;
    e1 = document.createElement('span');
    e1.style.lineHeight = '1.3';
    if (rsslist[rssSelItemno].description) {
      e1.innerHTML = rsslist[rssSelItemno].description;
      e = cvtItemInfoBoxLinks(e1);
      replaceNodeChildren(e1, e.childNodes);
    } else if (rsslist[rssSelItemno].content) {
      e1.innerHTML = rsslist[rssSelItemno].content;
      dcont = true;
      e = cvtItemInfoBoxLinks(e1);
      replaceNodeChildren(e1, e.childNodes);
    }
    styleItemInfoBoxImages(e1);
    if (rsslist[rssSelItemno].description && rsslist[rssSelItemno].content) {
      e2 = document.createElement('span');
      e2.style.lineHeight = '1.3';
      e2.innerHTML = rsslist[rssSelItemno].content;
      styleItemInfoBoxImages(e2);
      if (e2.textContent.trim() !== e1.textContent.trim()) {
        dcont = true;
        e = cvtItemInfoBoxLinks(e2);
        replaceNodeChildren(e2, e.childNodes);
      }
    }
    let img = rsslist[rssSelItemno].image && (!rsslist[rssSelItemno].description || !rsslist[rssSelItemno].description.includes(rsslist[rssSelItemno].imga[1].src)) && (!dcont || !rsslist[rssSelItemno].content || !rsslist[rssSelItemno].content.includes(rsslist[rssSelItemno].imga[1].src));
    if (img) {
      e3 = itemInfoBox.appendChild(rsslist[rssSelItemno].imga[1]);
      e3.style.float = 'left';
      e3.style.maxWidth = '40%';
      e3.style.minWidth = '' + (itemEls[rssSelItemno-1][0].getBoundingClientRect().width * Number(elem.infoboxImgSize)) + 'px';
      e3.style.minHeight = '' + (itemEls[rssSelItemno-1][0].getBoundingClientRect().height * Number(elem.infoboxImgSize)) + 'px';
      e3.style.margin = '0 1.2rem 0 0';
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
    let w = Math.round(window.innerWidth / 2);
    itemInfoBox.style.width = '' + w + 'px';
    let h = itemInfoBox.getBoundingClientRect().height, h0, w0, w1 = w / 3;
    do {
      w0 = w;
      w *= 0.99;
      itemInfoBox.style.width = '' + w + 'px';
      h0 = h;
      h = itemInfoBox.getBoundingClientRect().height;
    } while (w > w1 && h <= h0);
    itemInfoBox.style.width = '' + w0 + 'px';
    if (rsslist[rssSelItemno].link) {
      e1 = document.createElement('div');
      e1.style.display = 'flex';
      e1.style.flexDirection = 'column';
      e1.style.clear = 'left';
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
      e.textContent = '\u25CF';
      e2.appendChild(e);
      e = document.createElement('div');
      e.style.fontSize = '80%';
      e.style.wordBreak = 'break-all';
      e.style.lineHeight = '1.2';
      e1 = crtItemInfoBoxLink(rsslist[rssSelItemno].link, rsslist[rssSelItemno].link);
      e.appendChild(e1);
      e2.appendChild(e);
    }
    if (e3) {
      e3.style.borderRadius = '' + Math.round(Math.min(w0,h0)/16) + 'px';
    }
    itemInfoBox.style.borderRadius = '' + Math.round(Math.min(w0,h0)/8) + 'px';
    itemInfoBox.style.top = '';
    itemInfoBox.style.left = '';
    r3 = itemInfoBox.getBoundingClientRect();
    if (rssSelMode === 3) {
      let t = r1.bottom + 3;
      if (t + r3.height > window.innerHeight) {
        if (r3.height > window.innerHeight) {
          itemInfoBox.style.top = '0px';
        } else {
          itemInfoBox.style.bottom = '0px';
        }
      } else {
        itemInfoBox.style.top = '' + t + 'px';
      }
    } else {
      let b = window.innerHeight - r1.bottom + r1.height + 3;
      if (b < 0) {
        b = 0;
      }
      if (b + r3.height > window.innerHeight) {
        itemInfoBox.style.top = '0px';
      } else {
        itemInfoBox.style.bottom = '' + b + 'px';
      }
    }
    let l = (r1.left + (r1.width - r3.width) / 2);
    if (l + r3.width > r2.right) {
      l -= l + r3.width - r2.right;
    }
    if (l < r2.left) {
      l = r2.left;
    }
    if (l + r3.width > window.innerWidth) {
      l -= l + r3.width - window.innerWidth;
    }
    if (l < 0) {
      l = 0;
    }
    updateItemInfoBoxColor();
    itemInfoBox.style.left = '' + l + 'px';
    itemInfoBox.style.opacity = '1';
    window.ShadyCSS && window.ShadyCSS.styleSubtree(elem);
  }

  function updateItemInfoBoxColor() {
    if (!itemInfoBox || rssSelMode < 2 || rssSelItemno === 0) {
      return;
    }
    let col = itemEls[rssSelItemno-1][6].col ? itemEls[rssSelItemno-1][6].col : dftColorNew;
    itemInfoBox.style.backgroundColor = 'rgba(' + col[0] + ', ' + col[1] + ', ' + col[2] + ', ' + (1-transparency) +')';
    let ct, cbg;
    let s = elem.infoboxLinkColor;
    if (s) {
      ct = strToRgba(s);
    } else {
      ct = [col[0], col[1], col[2], 255];
    }
    s = elem.infoboxLinkBgColor;
    if (s) {
      cbg = strToRgba(s);
    } else {
      cbg = [255, 255, 255];
    }
    for (const a of itemInfoBoxLinks) {
      a[0].style.backgroundColor = 'rgba(' + cbg[0] + ', ' + cbg[1] + ', ' + cbg[2] + ', ' + a[1] + ')';
      a[0].style.color = 'rgba(' + ct[0] + ', ' + ct[1] + ', ' + ct[2] + ', ' + (ct[3] / 255) + ')';
    }
  }

  function crtItemInfoBoxLink(ih, href) {
    let ct, cbg;
    let col = itemEls[rssSelItemno-1][6].col ? itemEls[rssSelItemno-1][6].col : dftColorNew;
    let s = elem.infoboxLinkColor;
    if (s) {
      ct = strToRgba(s);
    } else {
      ct = [col[0], col[1], col[2], 255];
    }
    function rcbg() {
      s = elem.infoboxLinkBgColor;
      if (s) {
        cbg = strToRgba(s);
      } else {
        cbg = [255, 255, 255];
      }
    }
    rcbg();
    let a = [document.createElement('span'), 0.5];
    a[0].style.transition = 'background-color 0.4s ease-out';
    a[0].style.backgroundColor = 'rgba(' + cbg[0] + ', ' + cbg[1] + ', ' + cbg[2] + ', ' + a[1] + ')';
    a[0].style.cursor = 'pointer';
    a[0].style.color = 'rgba(' + ct[0] + ', ' + ct[1] + ', ' + ct[2] + ', ' + (ct[3] / 255), ')';
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

  function styleItemInfoBoxImages(e) {
    let l = e.querySelectorAll('img');
    for (const i of l) {
      i.style.maxWidth = '100%';
      i.style.width = 'auto';
      i.style.maxHeight = '100%';
      i.style.height = 'auto';
    }
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

  function deleteItemInfoBox() {
    if (rssSelMode < 2 && (rssSelItemnox||rssSelItemno) && itemEls && itemEls[(rssSelItemnox||rssSelItemno)-1]) {
      itemEls[(rssSelItemnox||rssSelItemno)-1][4].style.borderStyle = 'dotted';
      if (rssSelMode === 0) {
        let col = itemEls[(rssSelItemnox||rssSelItemno)-1][6].col ? itemEls[(rssSelItemnox||rssSelItemno)-1][6].col : dftColorNew;
        itemEls[(rssSelItemnox||rssSelItemno)-1][4].style.borderColor = 'rgba('+col[0]+', '+col[1]+', '+col[2]+', 1)';
      }
      window.ShadyCSS && window.ShadyCSS.styleSubtree(elem);
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

  function neweo1(e) {
    return { x: e.pageX, y: e.pageY, oe: e };
  }
  function neweo2(e) {
    let e2 = e.touches.length === 0 ? { x: 0, y: 0, oe: e } : { x: e.touches[0].clientX || 0, y: e.touches[0].clientY || 0, oe: e };
    ltpx = e2.x;
    ltpy = e2.y;
    return e2;
  }
  function neweo3(e) {
    return { x: ltpx, y: ltpy, oe: e };
  }

  function sanitizeUrl(url) {
    if (!url) {
      return '?';
    }
    let u = String(url).trim();
    if (u.length === 0) {
      return '';
    }
    return u;
  }

  function fullurl() {
    let url = rsslist[0].url;
    if (rsslist[0].proxyUrl) {
      if (rsslist[0].proxyUrl.indexOf('%%_URL_%%') === -1) {
        url = rsslist[0].proxyUrl;
      } else {
        url = rsslist[0].proxyUrl.replace('%%_URL_%%', rsslist[0].url || '?');
      }
    } else if (rsslist[0].url) {
      url = rsslist[0].url;
    } else {
      url = '?';
    }
    return url;
  }

  async function startFetch() {

    fetching = true;

    function endFetch(errmsg) {
      if (errmsg) {
        rsserr = true;
        rsslist[0].errmsg = errmsg;
      }
      fetching = false;
      fetched = true;
      return undefined;
    }

    try {

      if (!rsslist[0].url) {
        return endFetch('No url.');
      }

      let r = await fetch(fullurl(), elem.fetchOpts);
      if (stop()) {
        endFetch(null);
      }
      if (!r.ok) {
        throw new Error('HTTP response not ok (' + r.status + (r.statusText ? ' ' + r.statusText : '') + ').');
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
              if (rsslist[0].reqImgs) {
                let ua = extractImgUrls(s), q = 9;
                if (ua.length > 0) {
                  if (t0.includes('image') && t1.includes('url') && ai === -1) {
                    q = 1;
                  } else if (t0.includes('enclosure') && ci1 === -1 && an === 'url') {
                    q = 2;
                  } else if (t0.includes('image') || ci1 !== -1 && t1.includes('image') || ai !== -1 && an.includes('image') || t0.includes('media') || ci1 !== -1 && t1.includes('media') || ai !== -1 && an.includes('media') || t0.includes('thumbnail') || ci1 !== -1 && t1.includes('thumbnail') || ai !== -1 && an.includes('thumbnail') || t0.includes('icon') || ci1 !== -1 && t1.includes('icon') || ai !== -1 && an.includes('icon') || t0.includes('logo') || ci1 !== -1 && t1.includes('logo') || ai !== -1 && an.includes('logo')) {
                    q = 3;
                  } else if (t0.includes('title') || t0.includes('description') || t0.includes('summary') || t0.includes('content')) {
                    q = 5;
                  }
                  addiu(n, q, ua);
                }
                if (ai !== -1 && (an.includes('url') || an.includes('link')) && (t0.includes('image') || ci1 !== -1 && t1.includes('image') || t0.includes('media') || ci1 !== -1 && t1.includes('media') || t0.includes('thumbnail') || ci1 !== -1 && t1.includes('thumbnail') || t0.includes('icon') || ci1 !== -1 && t1.includes('icon') || t0.includes('logo') || ci1 !== -1 && t1.includes('logo'))) {
                  addiu(n, 4, [s]);
                }
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

      for (const i of rsslist) {
        if (!i.title) {
          i.title = '';
        }
        if (!i.description) {
          i.description = '';
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

      function extractImgUrls(s) {
        let ua = s.match(/(http(s?):\/\/)(.)*\.(?:jpg|jpeg|gif|png)/g);
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
            await new Promise((res) => {
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
                await new Promise((res) => {
                  a[1].src = a[0].src;
                  a[1].onload = () => {res(null);};
                  a[1].onerror = () => {a[1] = null; res(null);};
                });
                if (a[1]) {
                  rsslist[0].hasImgs = true;
                  rsslist[n].image = a[1];
                  rsslist[n].imga = a;
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
      return endFetch(e.message || 'Could not fetch or parse RSS/Atom feed.');
    }

    return endFetch(null);
  }

  requestAnimationFrame(af);
}

  return implexp;
}

function rgbStr(str, x) {
  let s = str ? str.replace(/[^A-Fa-f0-9]/g, '') : '';
  if (!s) {
    return null;
  }
  if (s.length === 1) {
    s += '00';
  } else if (s.length === 2 || s.length === 5 || s.length === 7) {
    s += '0';
  } else if (s.length > 8) {
    s = s.substring(0, 8);
  }
  if (!x) {
    if (s.length === 4) {
      s = s.substring(0, 3);
    } else if (s.length === 8) {
      s = s.substring(0, 6);
    }
  }
  if (s.length % 2 === 0) {
    let f = true, i;
    for (i = 0; i < s.length - 1; i += 2) {
      if (s.substring(i, i + 1) !== s.substring(i + 1, i + 2)) {
        f = false;
        break;
      }
    }
    if (f) {
      let s2 = '';
      for (i = 0; i < s.length - 1; i += 2) {
        s2 += s.substring(i, i + 1);
      }
      s = s2;
    }
  }
  return '#' + s;
}

function rgbToHex(r, g, b) {
  let sr = r.toString(16), sg = g.toString(16), sb = b.toString(16);
  if (sr.length === 1) {
    sr = '0' + sr;
  }
  if (sg.length === 1) {
    sg = '0' + sg;
  }
  if (sb.length === 1) {
    sb = '0' + sb;
  }
  if (sr.substring(0, 1) === sr.substring(1, 2) && sg.substring(0, 1) === sg.substring(1, 2) && sb.substring(0, 1) === sb.substring(1, 2)) {
    sr = sr.substring(0, 1);
    sg = sg.substring(0, 1);
    sb = sb.substring(0, 1);
  }
  return sr + sg + sb;
}

function strToRgba(str) {
  let s = str && str.length > 0 ? str.substring(0, 1) === '#' ? str.substring(1) : str : '';
  let rgba = [0, 0, 0, 255], i;
  if (s.length > 0 && s.length < 5) {
    for (i = 0; i < s.length; i++) {
      rgba[i] = parseInt(s.substring(i, i + 1).repeat(2), 16);
    }
  } else if (s.length > 5 && s.length < 9) {
    if (s.length % 2 === 1) {
      s = '0' + s;
    }
    for (i = 0; i < s.length - 1; i += 2) {
      rgba[i/2] = parseInt(s.substring(i, i + 2), 16);
    }
  }
  return rgba;
}

customElements.define('rss-ticker', RssTicker);

customElements.whenDefined('rss-ticker').then(() => ready = true);

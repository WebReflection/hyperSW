// create a fake DOM environment
// in order to generate HTML pages right here!
importScripts('js/basichtml.js');

// use basicHTML to create a new document for this site/page
const {Document, HTMLElement} = basicHTML;
self.document = new Document();
// setup the html element for this user
document.documentElement.setAttribute('lang', 'en');

// if needed, basicHTML also provides Custom Elements
self.customElements = document.customElements;
self.HTMLElement = HTMLElement;
// so you could have a 100% Custom Elements
// driven offline PWA without needing
// any extra request beside hyperHTML
// and Custom Element definitions

// anyway, once a document is made available
// we can finally import hyperHTML too
importScripts('js/hyperhtml.js');
const {bind} = hyperHTML;
// the same library, for this example,
// is used on the client side too!

// Now let's use the SW cache feature
const db = caches.open('offline');
// and a basic Promise/best-race utility
const any = $ => new Promise((D, E, A, L) => {
  A = [];
  L = $.map(($, i) => Promise
      .resolve($)
      .then(D, O => (((A[i] = O), --L) || E(A)))
  ).length;
});

// here the files we need for
// the whole offline experience
const files = [
  'manifest.json',
  'css/main.css',
  'js/main.js',
  'js/hyperhtml.js'
];

// our main offline /index.html page
// it returns basicHTML document as string,
// manipulated through hyperHTML
const indexPage = new Response(
  (bind(document.documentElement)
  `<head>
    <title>${'hyperHTML does SW'}</title>
    <meta name=viewport content="width=device-width" />
    <meta name="theme-color" content="#ffffff" />
    <link rel=manifest href=${files[0]} />
    <link rel=stylesheet href=${files[1]} />
    <script defer src=js/hyperhtml.js></script>
    <script defer src=${files[2]}></script>
  </head>
  <body>
    <h1>${'🍾 Offline hyperHTML 🎉'}</h1>
    <main></main>
  </body>`
  ).parentNode.toString(),
  {
    headers: {
      'Content-Type': 'text/html;charset=utf-8'
    }
  }
);

// And here all offline pages,
// defined just once in this example,
// but possibly also created at runtime
const views = {

  // a generic fallback for errors,
  // in case we need to provide one
  404: new Response('Not found', {status: 404}),

  // either via github
  '/hyperSW/': indexPage,
  // or directly
  '/': indexPage
};

// on install, cache all the needed files
addEventListener('install', e => {
  e.waitUntil(db.then(cache => cache.addAll(files)));
});

// per each fetch request
addEventListener('fetch', e => {
  const request = e.request;
  // grab the pathname
  const pathname = new URL(request.url).pathname;
  e.respondWith(
    // if there is already a Response to serve
    views.hasOwnProperty(pathname) ?
      // reply with its clone right away
      views[pathname].clone() :
      // otherwise figure out if it was in the cache
      db.then(cache => cache.match(request).then(
        response => {
          // and race regardless with the latest network file
          const remote = fetch(request).then(
            response => {
              // if it was downloaded, cache it for the next time
              if (199 < response.status && response.status < 400) {
                cache.put(request, response.clone());
              }
              // otherwise return the default 404
              // or whatever response happened
              return response.status == 404 ?
                views[404].clone() :
                response;
            }
          );
          // race optimistically:
          // first come without errors, first serve!
          return any([response || remote, remote]);
        }
      ))
  );
});

(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (App) {
	'use strict';

	const app = new App({
		target: document.body,
		props: {
			// any props you want to pass to App.svelte
		}
	});

	return app;

})(App);

'use strict';

(function () {

  const Utils = {

    checkMS() {

      const ua = window.navigator.userAgent;
      const msie = ua.indexOf('MSIE');
      const body = document.querySelector('body');

      if ( (msie > -1) ||
          !!navigator.userAgent.match(/Trident.*rv\:11\./) ||
          !!navigator.userAgent.match(/Edge/) ) {
        body.classList.add('is-ms');
      } else {
        body.classList.add('is-not-ms');
        body.classList.remove('no-animation');
      }
    }
  };

  Utils.checkMS();


})();
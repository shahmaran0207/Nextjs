importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-messaging-compat.js');

const config = {
      apiKey: 'AIzaSyBncwWG3zGMHnjlbAo9LrPhMoAY3BiJhG4',
      authDomain: 'test-84d30.firebaseapp.com',
      projectId: 'test-84d30',
      storageBucket: 'test-84d30.firebasestorage.app',
      messagingSenderId: '344872807432',
      appId: '1:344872807432:web:e71d90d8420445ab8ef5bd'
};

firebase.initializeApp(config);

const messaging = firebase.messaging();
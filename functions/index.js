const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { getAllPosts, postOnePost } = require('./handlers/posts');
const { signup, login } = require('./handlers/users');

// get posts and post posts route - [posts route]
app.get('/posts', getAllPosts);
app.post('/posts', FBAuth, postOnePost);

// sign up route and login route - [user routes]
app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.https.onRequest(app);
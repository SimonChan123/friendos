const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
admin.initializeApp();

const firebaseConfig = {
    apiKey: "AIzaSyAZuu3BQOQO12pYmwq3NY21AdwJ-uSwszM",
    authDomain: "friendo-13f2a.firebaseapp.com",
    databaseURL: "https://friendo-13f2a.firebaseio.com",
    projectId: "friendo-13f2a",
    storageBucket: "friendo-13f2a.appspot.com",
    messagingSenderId: "1033783307765",
    appId: "1:1033783307765:web:c8c0d1d47700f25c28c4bc",
    measurementId: "G-3GVCSRSHVC"
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/posts', (request, response) => {
    db.collection('posts')
        .orderBy('createdAt', 'desc')
        .get()
        .then((data) => {
            let posts = [];
            data.forEach(doc => {
                posts.push({
                    postID: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return response.json(posts);
        })
        .catch((err) => console.error(err));
});

app.post('/posts', (request, response) => {
    const newPost = {
        body: request.body.body,
        userHandle: request.body.userHandle,
        createdAt: new Date().toISOString()
    };

    db.collection('posts')
        .add(newPost)
        .then((doc) => {
            response.json({ message: `document ${doc.id} created succesfully` });
        })
        .catch((err) => {
            response.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
});

// sign up route
app.post('/signup', (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle,
    };

    // TODO: Valdiate data
    let token;
    let userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then((doc) => {
            if (doc.exists) {
                return response.status(400).json({ handle: 'this handle is already taken' });
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return response.status(201).json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return response.status(400).json({ email: 'Email is already in use' });
            } else {
                return response.status(500).json({ error: err.code });
            }
        });
});

exports.api = functions.https.onRequest(app);
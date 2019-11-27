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

const isEmpty = (string) => {
    if (string.trim() === '') {
        return true;
    } else {
        return false;
    }
};

const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) {
        return true;
    } else {
        return false;
    }
};

// sign up route
app.post('/signup', (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle,
    };

    // TODO: Valdiate data
    let errors = {};

    // email validatation
    if (isEmpty(newUser.email)) {
        errors.email = 'Must not be empty.';
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address.';
    }

    // user handle
    if (isEmpty(newUser.handle)) {
        errors.handle = 'Must not be empty.';
    }

    // password validation
    if (isEmpty(newUser.password)) {
        errors.password = 'Must not be empty.';
    }
    if (newUser.password !== newUser.confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
    }

    // only proceed if errors object is empty, otherwise return error in json
    if (Object.keys(errors).length > 0) {
        return response.status(400).json(errors);
    }

    // authenication and assigning token
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

// login route
app.post('/login', (request, response) => {
    const user = {
        email: request.body.email,
        password: request.body.password
    };

    // validation for login
    let errors = {};

    // email validation
    if (isEmpty(user.email)) {
        errors.email = 'Must not be empty';
    }

    // password validation
    if (isEmpty(user.password)) {
        errors.password = 'Must not be empty';
    }

    // only proceed if errors object is empty, otherwise return error in json
    if (Object.keys(errors).length > 0) {
        return response.status(400).json(errors);
    }

    // login user when there's no error
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return response.json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/wrong-password') {
                return response.status(403).json({ general: 'Wrong credentials, please try again.' })
            } else {
                return response.status(500).json({ error: err.code });
            }
        });
});

exports.api = functions.https.onRequest(app);
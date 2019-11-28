const { db } = require('../util/admin');

const firebaseConfig = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const { validateSignUpData, validateLoginData } = require('../util/validators');

exports.signup = (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle,
    };

    const { errors, valid } = validateSignUpData(newUser);
    if (!valid) {
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
}

exports.login = (request, response) => {
    const user = {
        email: request.body.email,
        password: request.body.password
    };

    // validation for login
    const { errors, valid } = validateLoginData(user);
    
    if (!valid) {
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
}
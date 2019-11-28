const { db } = require('../util/admin');

exports.getAllPosts = (request, response) => {
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
        .catch((err) => {
            console.error(err);
            response.status(500).json({ error: err.code });
        });
};

exports.postOnePost = (request, response) => {
    if (request.body.body.trim() === '') {
        return response.status(400).json({ body: 'Must not be empty.' });
    }

    const newPost = {
        body: request.body.body,
        userHandle: request.user.handle,
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
};
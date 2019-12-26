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
                    createdAt: doc.data().createdAt,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount,
                    userImage: doc.data().userImage
                });
            });
            return response.json(posts);
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code });
        });
};

exports.postOnePost = (request, response) => {
    if (request.body.body.trim() === '') {
        return response.status(400).json({ body: 'Must not be empty.' });
    }

    const newPost = {
        body: request.body.body,
        userHandle: request.user.handle,
        userImage: request.user.imageUrl,
        createdAt: new Date().toISOString(),
        commentCount: 0,
        likeCount: 0
    };

    db.collection('posts')
        .add(newPost)
        .then((doc) => {
            const responsePost = newPost;
            responsePost.postID = doc.id;
            response.json(responsePost);
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: 'something went wrong' });
        });
};

// get the post (along with its comments)
exports.getPost = (request, response) => {
    let postData = {};
    db.doc(`/posts/${request.params.postID}`).get()
        .then((doc) => {
            if (!doc.exists) {
                return response.status(404).json({ error: 'Post not found' });
            }
            postData = doc.data();
            postData.postID = doc.id;
            return db.collection('comments')
                .orderBy('createdAt', 'desc')
                .where('postID', '==', request.params.postID).get();
        })
        .then((data) => {
            postData.comments = [];
            data.forEach((doc) => {
                postData.comments.push(doc.data());
            });
            return response.json(postData);
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code });
        });
};

// Comment on a post
exports.commentOnPost = (request, response) => {
    if (request.body.body.trim() === '') {
        return response.status(400).json({ comment: 'Must not be empty' });
    }

    const newComment = {
        body: request.body.body,
        createdAt: new Date().toISOString(),
        postID: request.params.postID,
        userHandle: request.user.handle,
        userImage: request.user.imageUrl
    };
    console.log(newComment);

    db.doc(`/posts/${request.params.postID}`).get()
        .then((doc) => {
            if (!doc.exists) {
                return response.status(404).json({ error: 'Post not found' });
            }
            return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
        })
        .then(() => {
            return db.collection('comments').add(newComment);
        })
        .then(() => {
            response.json(newComment);
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: 'Something went wrong!' });
        });
};

// like a post
exports.likePost = (request, response) => {
    const likeDocument = db.collection('likes').where('userHandle', '==', request.user.handle)
        .where('postID', '==', request.params.postID).limit(1);

    const postDocument = db.doc(`/posts/${request.params.postID}`);

    let postData;

    postDocument.get()
        .then((doc) => {
            if (doc.exists) {
                postData = doc.data();
                postData.postID = doc.id;
                return likeDocument.get();
            } else {
                return response.status(404).json({ error: 'Post not found.' });
            }
        })
        .then((data) => {
            if (data.empty) {
                return db.collection('likes').add({
                    postID: request.params.postID,
                    userHandle: request.user.handle
                })
                .then(() => {
                    postData.likeCount++;
                    return postDocument.update({ likeCount: postData.likeCount });
                })
                .then(() => {
                    return response.json(postData);
                });
            } else {
                return response.status(400).json({ error: 'Post already liked' });
            }
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code });
        });
};

// unlike a post
exports.unlikePost = (request, response) => {
    const likeDocument = db.collection('likes').where('userHandle', '==', request.user.handle)
        .where('postID', '==', request.params.postID).limit(1);

    const postDocument = db.doc(`/posts/${request.params.postID}`);

    let postData;

    postDocument.get()
        .then((doc) => {
            if (doc.exists) {
                postData = doc.data();
                postData.postID = doc.id;
                return likeDocument.get();
            } else {
                return response.status(404).json({ error: 'Post not found.' });
            }
        })
        .then((data) => {
            if (data.empty) {
                return response.status(400).json({ error: 'Post not liked' });
            } else {
                return db.doc(`/likes/${data.docs[0].id}`).delete()
                    .then(() => {
                        postData.likeCount--;
                        return postDocument.update({ likeCount: postData.likeCount });
                    })
                    .then(() => {
                        return response.json(postData);
                    });
            }
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code });
        });
};

// deleting a post
exports.deletePost = (request, response) => {
    const document = db.doc(`/posts/${request.params.postID}`);
    document.get()
        .then((doc) => {
            if (!doc.exists) {
                return response.status(404).json({ error: 'Post not found' });
            }

            if (doc.data().userHandle !== request.user.handle) {
                return response.status(403).json({ error: 'Unauthorized' });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            return response.json({ message: 'Post deleted successfully' });
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code });
        });
};
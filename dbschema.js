let db = {
    user: [
      {
        bio: "hi, I am test1",
        createdAt: "2019-11-29T03:27:02.605Z",
        email: "test1@email.com",
        handle: "test1",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/friendo-13f2a.appspot.com/o/44709318294.png?alt=media",
        location: "Los Angeles",
        userId: "btL7TDzARKZZZxRjwZgGUp06has1",
        website: "http://google.com"
      }
    ],
    posts: [
      {
        userHandle: 'user',
        body: 'this is the post body',
        createdAt: '2019-11-23T02:06:44.362Z',
        likeCount: 5,
        commentCount: 2,
      }
    ],
    comments: [
      {
        userHandle: 'user',
        postId: 'asdfasfasf',
        body: 'some content',
        createdAt: '2019-11-23T02:06:44.362Z'
      }
    ],
    notifications: [
      {
        recipient: 'user',
        sender: 'john',
        read: 'true | false',
        screamId: 'kdjsfgdksuufhgkdsufky',
        type: 'like | comment',
        createdAt: '2019-03-15T10:59:52.798Z'
      }
    ]
};

const userDetails = {
    // Redux data
    credentials: {
      userId: 'N43KJ5H43KJHREW4J5H3JWMERHB',
      email: 'user@email.com',
      handle: 'user',
      createdAt: '2019-03-15T10:59:52.798Z',
      imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
      bio: 'Hello, my name is user, nice to meet you',
      website: 'https://user.com',
      location: 'Lonodn, UK'
    },
    likes: [
      {
        userHandle: 'user',
        screamId: 'hh7O5oWfWucVzGbHH2pa'
      },
      {
        userHandle: 'user',
        screamId: '3IOnFoQexRcofs5OhBXO'
      }
    ]
  };
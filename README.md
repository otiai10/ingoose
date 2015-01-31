ingoose
=======

Simple [IdnexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) driver for browser application, with [mongoose](http://mongoosejs.com/) like API.

Sample
======

```javascript
ingoose.connect('database_name');

var User = ingoose.model('user', {keyPath: 'id'});

var otiai = new User({name: 'otiai10', age: 28, id: 1234});
otiai.save(function(err) {
    console.log(err);
});

User.find({id:[1000, 2000]}, function(err, users) {
    console.log(err, users);
});

User.findOne({id: 1234}, function(err, user) {
    console.log(err, user);
});
```

Intall
======

```html
<script type="text/javascript" src="https://raw.githubusercontent.com/otiai10/ingoose/dest/ingoose.js"></script>
```

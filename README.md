ingoose
=======

Simple [IdnexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) driver for browser application, with [mongoose](http://mongoosejs.com/) like API.

Sample
======

```javascript
ingoose.connect('database_name');

var User = ingoose.model('user', {keyPath: 'id'});

var otiai = new User({name: 'otiai10', age: 28, id: 1234});
otiai.save().error(function(err) {
    // error
}).success(function() {
    // succeeded
});

User.find({only: 1234}).success(function(users) {
    console.log(user);
});

User.find({min:0, max:2000}).success(function(users) {
    console.log(users);
});
```

Intall
======

```html
<script type="text/javascript" src="https://raw.githubusercontent.com/otiai10/ingoose/dest/ingoose.min.js"></script>
```

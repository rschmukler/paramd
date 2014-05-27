# Paramd

JSON filtering for Node

Features:

- whitelisting params
- blacklisting params
- requiring params
- conditional application of rules
- custom error status codes

## Example

```js
var sanitized = require('paramd')();

sanitized
  .require('username')
  .optional(['age', 'favoriteColor', 'email']);

try {
  var json = sanitized(req.body);
} catch(err) {
  return res.json(422, { msg: err.message }) // err.message == "username is missing"
}

var user = new User(json);
user.save(function(err) {
  if(err) return res.json(500, err.message);
  res.json(201, user.toJSON());
});
```

## More Complex Examples


Conditional Requires:

```js
sanitized
  .optional('password')
  .require('passwordConfirmation', { if: (json) => { return json.password !== undefined } }) // using ES6 syntax
```

Status Code on Errors

```js
sanitized
  .require('username', { status: 422 })

try {
  var json = sanitizd({name: 'Bob'});
} catch(e) {
  res.json(e.status, e.message); // note e.status is available
}
```

## Complete Documentation

You may either use a whitelisting mode (specifying attributes allowed), or a blacklisting mode (specifying attributes that aren't allowed).
If you use both, an error will be thrown.

All configuration methods are chainable, and can take either a string or an array of properties.

### White listing

Valid whitelisting methods are

- `require`
- `optional` / `allow`

Whitelist Example:

```js
var sanitized = paramd()
    .require(['username', 'password'])
    .optional('email')
    .optional('age')

var attrs = sanitized(req.body);
```

### Black listing

Blacklisting methods are

- `except` / `filter`

Blacklist Example:

```js
var sanitized = paramd()
    .filter('encryptedPassword')
    .filter('passwordResetToken')

var userData = sanitized(user.toJSON());

res.json(200, userData);
```


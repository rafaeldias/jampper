# Jampper

Jampper is a simple and straightforward library for mapping RESTful APIs. As it internally uses [jQuery][0]'s ajax module for performing the request, almost evertything you can do with `jQuery.ajax` you can do with Jampper.

## Installing

### NPM

```bash
$ npm install jampper
```

### Bower
```bash
$ bower install jampper
```

### Building from source
Clone the [repository](1) and run :
```bash
$ node build.js
```

## Embedding

Regardless of the way you have chosen to install the lib, de `dist` directory will contain the compiled files.

If you already loaded the jQuery in your page, you should use the `jampper.jquery.js` file:

```html
<script src="path/to/jquery.js"></script>
<script src="path/to/jampper/dist/jampper.jquery.js"></script>
```

Otherwise, the `jampper.js` file should be used :
```html
<script src="path/to/jampper/dist/jampper.js"></script>
```

## Usage

To create a Jampper object of a REST API, you will need to provide and endpoint (host) and the resources :

```javascript
var api = new Jampper('https://api.github.com/', {
  users : null,
  search : {
    repositories : null
  },
  repos : {
    commits : {
      sha : null
    },
    contributors : null
  }
});

```

In order to perform a `GET` to the `users/rafaeldias` :
```javascript
api.users('rafaeldias').read(function(res) {
  ...
});
```

The snippet above is equivalent to :
```
GET https://api.github.com/users/rafaeldias
```

### CRUD operations

In addition to the `read` method, there are three more methods that all resources will inherit in order to perform `CRUD` operations, each of these methods are mapped to a HTTP verb :

* `create([options[, callback]]) - POST /resource`
* `update([options[, callback]]) - PUT /resource`
* `delete([options[, callback]]) - DELETE /resource`

You can add or overwrite methods mapped to HTTP verbs by calling the `mapMethod` method of the `Jampper` object:
```javascript
Jampper.mapMethod({
  'update' : 'PATCH',
  'edit'   : 'PUT'
}); 
```

Now the next time we call the overwritten `update` method on a resouce, the HTTP verb `PATCH` will be used in the request, and the new `edit` method will send the `PUT` HTTP verb to the server.

### Request options

Every CRUD method may receive an object of options as its first parameter. These options are the same as stated in the [jQuery ajax documentation][2].

## License

Jampper is released under the MIT lisence.

[0]: http://jquery.com/
[1]: https://github.com/rafaeldias/jampper
[2]: http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings

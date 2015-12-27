# Jampper

Jampper is a simple and straightforward library for mapping RESTful APIs. As it internally uses [jQuery][0]'s ajax module for performing the requests, almost evertything you can do with `jQuery.ajax` you can do with Jampper.

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
$ npm install
$ npm run build
```

## Embedding

Regardless of the way you have chosen to install the lib, de `dist` directory will contain the compiled files.

If you have already loaded the jQuery in your page, you should use the `jampper.jquery.js` file:

```html
<script src="path/to/jquery.js"></script>
<script src="path/to/jampper/dist/jampper.jquery.js"></script>
```

Otherwise, the `jampper.js` file should be used :
```html
<script src="path/to/jampper/dist/jampper.js"></script>
```

## Usage

To create a Jampper object of a REST API, you will need to provide the API host and the resources object :

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

**Note**: You can also map resources with file extensions (i.e. `users.json`). jampper will strip the extension and expose the resource method as `users`.

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

In addition to the `read` method, there are three more methods that by default all resources will inherit in order to perform `CRUD` operations, each of these methods are mapped to an HTTP verb :

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

### Callbacks

The arguments of the callback passed to any of the CRUD methods may be different depending on the status of the request.

* In case of successful request, the arguments are:
  * `data`: The response from the server
  * `textStatus`: A string categorizing the status of the request (`success`, `notmodified`, `error`, ...)
  * `jqXHR`: A superset of the browser's native XMLHttpRequest object. For more information see [jQuery's jqXHR section][3]

* In case of failed requests, the arguments are:
  * `jqXHR`: As described above.
  * `textStatus`: As described above.
  * `errorThrown`: An exception object. When an HTTP error occurs, `errorThrown` receives the textual portion of the HTTP status, such as "Not Found" or "Internal Server Error". 

The `done`, `fail` and `always` methods are also exposed by jampper.

### Global Setup

Jampper also exposes the `.setup` method, so it's possible to configure global ajax properties even if  user is not using jQuery.

## License

Jampper is released under the MIT license.

[0]: http://jquery.com/
[1]: https://github.com/rafaeldias/jampper
[2]: http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
[3]: http://api.jquery.com/jQuery.ajax/#jqXHR 

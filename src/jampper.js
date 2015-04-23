/**
 * Javascript API Mapper.
 *
 * Lib for mapping REST APIs in Javascript.
 */

define(['jquery/ajax', 'jquery/ajax/xhr'], function($) {
  var /**
       * Default CRUD methods
       */
      crudMap = {
        'create' : 'POST',
        'read'   : 'GET',
        'update' : 'PUT',
        'delete' : 'DELETE'
      }
      /**
       * Sends request to the server
       *
       * @param {String} HTTP method
       * @param {Object} Options to be used in the request
       *
       * @return {Object} Jampper
       */
    , request = function(type, opts) {
        var that = this;

        this.jxhr = $.ajax($.extend(opts || {}, {
          url : this.route,
          type : type
        }))
          .done(function() {
            if ( 'function' === typeof that.callback ) {
              that.callback.apply(that, arguments);
            }
          })
            .fail(function() {
              if ( 'function' === typeof that.failCallback ) {
                that.failCallback.apply(that, arguments);
              }
            });
        return this;
      }
      /**
       * Jampper's constructor
       *
       * @param {String} host of the API
       * @param {Object} resources - map of resources accepted by the API
       *
       * @return {Object} Jammper
       */
    , Jampper = function(host, resources) {
        var that = this

        this.route = host || '';

        if ( resources )
          for( var sub in resources )
            this[sub.replace(/.(json[p]?|xml)+$/g, '')] = (function(resource, subresources) {
              return function(id) {
                return new that.constructor(that.route + '/' + resource + (id && '/' + id || ''),
                                            subresources != null && 'object' === typeof subresources ?  subresources : null);
              };
            })(sub, resources[sub]);
      };

  /**
   * Define jQuery.params, if not defined.
   * So we don't need to * import all * the code
   * form jquery/serialize unecessarily
   */
  if ( 'undefined' === typeof $.param )
    $.param = (function() {
      var r20 = /%20/g
        , rbracket = /\[\]\$/
        , rCRLF = /\r?\n/g;

      function buildParams( prefix, obj, traditional, add ) {
        var name;

        if ( $.isArray( obj ) ) {
          // Serialize array item.
          $.each( obj, function( i, v ) {
            if ( traditional || rbracket.test( prefix ) ) {
              // Treat each array item as a scalar.
              add( prefix, v );

            } else {
              // Item is non-scalar (array or object), encode its numeric index.
              buildParams(
                prefix + "[" + ( typeof v === "object" ? i : "" ) + "]",
                v,
                traditional,
                add
              );
            }
          });

        } else if ( !traditional && $.type( obj ) === "object" ) {
          // Serialize object item.
          for ( name in obj ) {
            buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
          }

        } else {
          // Serialize scalar item.
          add( prefix, obj );
        }
      }

      // Serialize an array of form elements or a set of
      // key/values into a query string
      return function( a, traditional ) {
        var prefix,
          s = [],
          add = function( key, value ) {
            // If value is a function, invoke it and return its value
            value = $.isFunction( value ) ? value() : ( value == null ? "" : value );
            s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
          };

        // Set traditional to true for jQuery <= 1.3.2 behavior.
        if ( traditional === undefined ) {
          traditional = $.ajaxSettings && $.ajaxSettings.traditional;
        }

        // If an array was passed in, assume that it is an array of form elements.
        if ( $.isArray( a ) || ( a.$ && !$.isPlainObject( a ) ) ) {
          // Serialize the form elements
          $.each( a, function() {
            add( this.name, this.value );
          });

        } else {
          // If traditional, encode the "old" way (the way 1.3.2 or older
          // did it), otherwise encode params recursively.
          for ( prefix in a ) {
            buildParams( prefix, a[ prefix ], traditional, add );
          }
        }

        // Return the resulting serialization
        return s.join( "&" ).replace( r20, "+" );
      };
    })();

  /**
   * Define methods create, read, update and delete
   * no protótipo do objeto Jampper.
   */
  Jampper.mapMethod = function(methods) {
    for ( var method in methods )
      Jampper.prototype[method] = (function(met) {
        return function(opts, done) {
          if ( 'function' === typeof opts ) {
            done = opts;
            opts = void 0;
          }
          this.callback = done;
          return request.call(this, methods[met], opts);
        };
      })(method);
  };

  /**
   * Exposes .setup method of Jumpper,
   * so it's possible to configure
   * global ajax properties even
   * if the user is not using jQuery.
   */
  Jampper.setup = $.ajaxSetup;

  /**
   * Abort current request
   */
  Jampper.prototype.abort = function() {
    if (this.jxhr && 'object' === typeof this.jxhr)
      this.jxhr.abort();
    return this;
  };

  /**
   * callback of the request.
   */
  Jampper.prototype.done = function(next) {
    this.callback = 'function' === typeof next &&  next;
    return this;
  };

  /**
   * callback used when the request fails.
   */
  Jampper.prototype.fail = function(next) {
    this.failCallback = 'function' == typeof next && next;
    return this;
  };

  // Maps default methods for CRUD
  Jampper.mapMethod(crudMap);

  // Exposes Jampper Object
  return Jampper;

});

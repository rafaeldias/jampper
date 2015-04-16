/**
 * Objeto de requisição a API REST da aplicação.
 *
 * Objeto faz um mapeamento dos méotodos de Jampper e
 * também da estrutura da API REST da aplicação.
 */

define(['jquery/ajax', 'jquery/ajax/xhr'], function($) {
  var /**
       * Métodos HTTP utilizados na API REST da aplicação
       */
      crudMap = {
        'create' : 'POST',
        'read'   : 'GET',
        'update' : 'PUT',
        'delete' : 'DELETE'
      }
      /**
       * Função para efetura a requisição
       * ao servidor.
       *
       * @pram {String} type - Método HTTP utilizado na requisição.
       * @param {Object} data - Dados a serem enviados ao servidor.
       *
       * @return {Object} Jampper
       */
    , request = function(type, opts) {
        var that = this;

        this.jxhr = $.ajax($.extend({
          url : this.route,
          type : type,
          dataType : 'json'
        }, opts || {}))
          .done(function() {
            if ( 'function' === typeof that.callback ) {
              that.callback.apply(that, arguments);
            }
          })
            .fail(function(jqXhr) {
              var res;

              try {
                res = $.parseJSON(jqXhr.responseText);
              } catch(e) {
                res = { error : jqXhr.responseText }
              }

              if ( 'function' === typeof that.callback )
                that.callback.apply(that, [res].concat(arguments));
            });
        return this;
      }
      /**
       * Construtor do objeto Jampper.
       *
       * @param {String} route - Rota do objeto
       * @param {Object} resources - Recursos que podem ser utilizados no objeto.
       *
       * @return {Object} Jammper 
       */
    , Jampper = function(route, resources) {
        var that = this

        this.route = route;

        if ( resources )
          for( var sub in resources )
            this[sub] = (function(resource, subresources) {
              return function(id) {
                return new that.constructor(that.route + '/' + resource + (id && '/' + id || ''), subresources !== null && 'object' === typeof subresources ?  subresources : null);
              };
            })(sub, resources[sub]);
      };

  /**
   * Define jQuery.params, if not defined.
   * So we don't need to unecessarily
   * import all the code of jquery/serialize
   */
  if ( 'undefined' === typeof $.param )
    $.param = (function() {
      var r20 = /%20/g
        , rbracket = /\[\]$/
        , rCRLF = /\r?\n/g
        , rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i
        , rsubmittable = /^(?:input|select|textarea|keygen)/i;

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
   * Define métodos create, read, update e delete
   * no protótipo do objeto Jampper.
   */
  for ( var method in crudMap )
    Jampper.prototype[method] = (function(met) {
      return function(opts, done) {
        if ( 'function' === typeof opts ) {
          done = opts;
          opts = void 0;
        }
        this.callback = done;
        return request.call(this, crudMap[met], opts);
      };
    })(method);

  /**
   * Aborta requisição atual.
   */
  Jampper.prototype.abort = function() {
    if (this.jxhr && 'object' === typeof this.jxhr)
      this.jxhr.abort();
    return this;
  };

  /**
   * Define método done no protótipo do objeto Jampper 
   */
  Jampper.prototype.done = function(next) {
    this.callback = 'function' === typeof next &&  next;
    return this;
  };

  /**
   * Retorna instância inicial do objeto Jampper.
   * Os recursos do primeiro nível já estarão
   * disponíveis.
   */
  return Jampper;

});

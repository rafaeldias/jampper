
(function($) {
  /**
   * Expõe objeto panteraAPI para o mundo.
   * Voa colibre!
   */
  window.jamper = (function() {

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
         * @return Objeto crud
         */
      , request = function(type, data) {
          var that = this;

          this.jxhr = $.ajax({
            url : this.route,
            type : type,
            data : data && JSON.stringify(data) || {},
            dataType : 'json'
          })
            .done(function(res) {
              if ( 'function' === typeof that.callback ) {
                that.callback.call(that, res);
              }
            })
              .fail(function(jqXhr) {
                var res;

                try {
                  res = JSON.parse(jqXhr.responseText);
                } catch(e) {
                  res = { error : jqXhr.responseText }
                }

                if ( 'function' === typeof that.callback )
                  that.callback.call(that, res);
              });
          return this;
        }
        /**
         * Construtor do objeto CRUD.
         *
         * @param {String} route - Rota do objeto
         * @param {Object} resources - Recursos que podem ser utilizados no objeto.
         *
         * @return Objeto CRUD
         */
      , Crud = function(route, resources) {
          var that = this

          this.route = route;

          if ( resources )
            for( var sub in resources )
              this[sub] = (function(resource, subresources) {
                return function(id) {
                  return new that.constructor(that.route + '/' + resource + '/' + (id && id || ''), subresources !== null && 'object' === typeof subresources ?  subresources : null);
                };
              })(sub, resources[sub]);
        };

    /**
     * Define métodos create, read, update e delete
     * no protótipo do objeto CRUD.
     */
    for ( var method in crudMap )
      Crud.prototype[method] = (function(met) {
        return function(data, done) {
          if ( 'function' === typeof data ) {
            done = data;
            data = void 0;
          }
          this.callback = done;
          return request.call(this, crudMap[met], data);
        };
      })(method);

    /**
     * Aborta requisição atual.
     */
    Crud.prototype.abort = function() {
      if (this.jxhr && 'object' === typeof this.jxhr)
        this.jxhr.abort();
      return this;
    };

    /**
     * Define método done no protótipo do objeto CRUD
     */
    Crud.prototype.done = function(next) {
      this.callback = 'function' === typeof next &&  next;
      return this;
    }

    if ( !resources )
      throw new Exception('No resource defined.');

    /**
     * Retorna instância inicial do objeto CRUD.
     * Os recursos do primeiro nível já estarão
     * disponíveis.
     */
    return Crud;

  })(/*{
    anunciantes : {
      xmls : {
        campos : null,
        produtos : null
      },
      conjuntos : {
        canais : null,
        xmls : null,
        produtos : null
      },
      relatorios : null
    },
    canais : null,
    relatorios : null
  }*/);

})(jQuery || function() {
  /**
   * Objeto jQuery minimalista
   */
  var
      /**
       * Função sem corpo, pois a biblioteca
       * não fara uso do Sizzle, por enquanto.
       */
      jq = function() {}
      /**
       * tokens validos para parsear JSON
       */
    , rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g
    , parseJSON = function(data) {
        // Attempt to parse using the native JSON parser first
        if (window.JSON && window.JSON.parse) {
          // Support: Android 2.3
          // Workaround failure to string-cast null input
          return window.JSON.parse(data + "");
        }

        var requireNonComma
          , depth = null
          , str = jq.trim(data + "");

        // Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
        // after removing valid tokens
        return str && !jq.trim(str.replace(rvalidtokens, function(token, comma, open, close) {

          // Force termination if we see a misplaced comma
          if (requireNonComma && comma) {
            depth = 0;
          }

          // Perform no more replacements after returning to outermost depth
          if (depth === 0) {
            return token;
          }

          // Commas must not follow "[", "{", or ","
          requireNonComma = open || comma;

          // Determine new depth
          // array/object open ("[" or "{"): depth += true - false (increment)
          // array/object close ("]" or "}"): depth += false - true (decrement)
          // other cases ("," or primitive): depth += true - true (numeric cast)
          depth += !close - !open;

          // Remove this token
          return "";
        })) ? (Function("return " + str))() : jq.error("Invalid JSON: " + data);
      }
    , parseXML = function(data) {
        var xml, tmp;
        if (!data || typeof data !== "string") {
          return null;
        }
        try {
            if (window.DOMParser) { // Standard
              tmp = new DOMParser();
              xml = tmp.parseFromString(data, "text/xml");
            } else { // IE
              xml = new ActiveXObject("Microsoft.XMLDOM");
              xml.async = "false";
              xml.loadXML(data);
            }
        } catch (e) {
          xml = undefined;
        }
        if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
          jq.error("Invalid XML: " + data);
        }
        return xml;
      };

  jq.extend = function() {
    var target = arguments[0] || {}
      , length = arguments.length
      , copy
      , copyIsArray
      , clone
      , src
      , options;

    for ( var i = 1; i < length; i++ ) {
      if ( (options = arguments[i]) != null) {
        for (name in options) {
          src = target[name];
          copy = options[name];

          if (target === copy) {
            continue;
          }

          if ( copy && ((copyIsArray = copy instanceof Array) || 'object' === typeof copy) ) {
            if (copyIsArray) {
              clone = src && src instanceof Array ? src : [];
            } else {
              clone = src && 'object' === typeof src ? src : {};
            }
            target[name] = jq.extend(clone, copy);
          } else if ('undefined' !== typeof copy) {
            target[name] = copy;
          }
        }
      }
    }
    return target;
  };

});

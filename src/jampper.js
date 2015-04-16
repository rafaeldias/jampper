/**
 * Objeto de requisição a API REST da aplicação.
 *
 * Objeto faz um mapeamento dos méotodos de CRUD e
 * também da estrutura da API REST da aplicação.
 */

(function(factory) {
  'use strict';
  if ( 'function' === typeof define && define.amd ) {
    define(['jquery/serialize', 'jquery/ajax', 'jquery/ajax/xhr'], factory);
  } else {
    window.Jampper = factory( jQuery );
  }
})(function($) {
  'use strict';

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
       * @return {Object} Crud
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
                return new that.constructor(that.route + '/' + resource + (id && '/' + id || ''), subresources !== null && 'object' === typeof subresources ?  subresources : null);
              };
            })(sub, resources[sub]);
      };

  /**
   * Define métodos create, read, update e delete
   * no protótipo do objeto CRUD.
   */
  for ( var method in crudMap )
    Crud.prototype[method] = (function(met) {
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
  };

  /**
   * Retorna instância inicial do objeto CRUD.
   * Os recursos do primeiro nível já estarão
   * disponíveis.
   */
  return Crud;

});

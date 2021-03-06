/*<link rel="import" href="graphql-client.html"/>*/
/**
## GraphQL query

An easy interface to create GraphQL queries in your system.

## Building a query

```html
<link rel="import" src="bower_components/polymer-apollo-client/graphql-client.html">
```

```html
<graphql-query variables='{"identifier": "home_hero"}' result="{{result}}">
  query ($identifier: String!) {
    block: Block(identifier: $identifier) {
      id
      title
      content
    }
  }
</graphql-query>
```

The query you want to run becomes the body of the `<graphql-query>` element.
You can provide additional variables as a JSON object.

When the query resolves the resulting data will be placed in the `result` property.

## Using the result:
```html
<h1>[[result.block.title]]</h1>
<div class="content">[[result.block.content]]</div>
```

Changing the variables or the query will automatically re-fetch all the information.

## Detecting loading states

The query element implements the `MatryoshkaLoaderMixin` and thus propagates the loading state of the query throughout the system.

@group Apollo Client
@polymer
@customElement
@demo demo/graphql-query-simple.html Simple query
@demo demo/graphql-query-variables.html Simple query with variables
@demo demo/graphql-query-defer.html Complex deferred query
@demo demo/full-demo.html Full demo
*/
import { MatryoshkaLoaderMixin } from 'matryoshka-loader/matryoshka-loader-mixin.js';

import { CLIENT_NAME_DEFAULT } from './graphql-client.js';
import { idlePeriod } from '@polymer/polymer/lib/utils/async.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
export class GraphQLQuery extends MatryoshkaLoaderMixin(PolymerElement) {
  static get is() {
    return 'graphql-query';
  }

  static get properties() {
    return {
      /**
       * Copy of the query provided in `this.innerText`, if you want to programmatically change the query use
       * `this.innerText`.
       * @private
       */
      query: {
        type: Object
      },

      /**
       * JSON Object of the variables passed with the query.
       */
      variables: {
        type: Object,
        value: function () { return {}; }
      },

      /**
       * `fetchPolicy` determines where the client may return a result from. The options are:
       * - `cache-first` (default): return result from cache. Only fetch from network if cached result is not available.
       * - `cache-and-network`: return result from cache first (if it exists), then return network result once it's available.
       * - `cache-only`: return result from cache if available, fail otherwise.
       * - `no-cache`: return result from network, fail if network call doesn't succeed, don't save to cache.
       * - `network-only`: return result from network, fail if network call doesn't succeed, save to cache.
       * - `standby`: only for queries that aren't actively watched, but should be available for `refetch` and `updateQueries`.
       */
      fetchPolicy: {
        type: String
      },

      /**
       * Whether or not to fetch results.
       */
      fetchResults: {
        type: Boolean
      },

      /**
       * `errorPolicy` determines the level of events for errors in the execution result. The options are:
       * - `none` (default): any errors from the request are treated like runtime errors and the observable is stopped (XXX this is default to lower breaking changes going from AC 1.0 => 2.0).
       * - `ignore`: errors from the request do not stop the observable, but also don't call `next`.
       * - `all`: errors are treated like data and will notify observables.
       */
      errorPolicy: {
        type: String
      },

      /**
       * The time interval (in milliseconds) on which this query should be
       * refetched from the server.
       */
      pollInterval: {
        type: Number
      },

      /**
       * Whether or not updates to the network status should trigger next on the observer of this query.
       */
      notifyOnNetworkStatusChange: {
        type: Boolean
      },

      /**
       * It is used to halt the execution of the query when not all the
       * variables are provided yet.
       * @private
       */
      requiredVariables: {
        type: Object,
        computed: '_computeRequiredVariables(query)'
      },

      /**
       * This allows you to defer the query until a later moment using
       * `Polymer.Async.idlePeriod`. This solves an issue with rendering
       * critical data first an deferring non-critical information to a later
       * moment.
       */
      defer: {
        type: Boolean,
        value: false
      },

      /**
       * When this is set to `true` it will not execute the query when the
       * properties `query`+`variables`+`defer` have a value.
       * To run the query set `hold` to `false` or run `execute()`.
       *
       * You might want to set `hostLoading` to `false` when you do this.
       */
      hold: {
        type: Boolean,
        value: false
      },

      /**
       * Object of the resulting data of the query.
       * [Apollo Client Docs](http://dev.apollodata.com/react/queries.html#default-result-props)
       */
      result: {
        type: Object,
        notify: true
      },

      /**
       * Sets the default value of `hostLoading` to `true`,
       * this means this element will always propagate that it is loading.
       * @todo, when `defer` is set, is this properly handled?
       * @protected
       */
      hostLoading: {
        type: Boolean,
        notify: true
      },

      /**
       * The current status of a query’s execution.
       */
      networkStatus: {
        type: Number,
        notify: true
      },

      stale: {
        type: Boolean,
        notify: true
      },

      /**
       * Connect to a different client.
       */
      clientName: {
        value: CLIENT_NAME_DEFAULT
      },

      /**
       * Last error, if any.
       */
      lastError: {
        value: null,
        readOnly: true,
        notify: true
      }
    };
  }

  static get observers() {
    return [
      '_onRunQuery(defer, hold, query, variables)'
    ];
  }

  /**
   * Since the query should never be shown, we always need to hide it.
   */
  constructor() {
    super();
    this.style.display = 'none';
  }

  /**
   * @protected
   */
  connectedCallback() {
    super.connectedCallback();
    var observer = new MutationObserver(this._updateQuery);
    observer.observe(this, { subtree: true, characterData: true });
    this._updateQuery();
  }

  /**
   * Actual method to fetch all the data.
   * This is called when `query`, `variables`, `defer` or `hold` is changed.
   * @protected
   */
  _onRunQuery(defer, hold) {
    if (hold) {
      return;
    }
    if (this.validate().error) {
      return;
    }
    if (defer) {
      idlePeriod.run(this.execute.bind(this));
    } else {
      this.execute();
    }
  }

  /**
   * Validate if all the required properties are properly filled in and return
   * the error if there is something wrong.
   * @return {Object}
   */
  validate(params = {}) {
    const variables = params.variables || this.variables;
    if (this.query === undefined) {
      return {
        error: true,
        msg: 'Query not yet defined',
      };
    }
    if (variables == null) {
      return {
        error: true,
        // eslint-disable-next-line max-len
        msg: 'Variables are undefined should be an empty object if you don not want to send anything',
      };
    }
    if (this.defer === undefined) {
      return {
        error: true,
        // eslint-disable-next-line max-len
        msg: 'Defer is undefined, accidentally set it to undefined should be true or false?',
      };
    }
    if (this.requiredVariables.length &&
      Object.keys(variables).length <= 0) {
      let emptyVariables = this.requiredVariables.filter((variable) => {
        return variables[variable] === undefined;
      });
      return {
        error: true,
        msg: 'Not all required variables are submitted',
        variables: emptyVariables,
      };
    }
    return {
      error: false,
    };
  }

  /**
   * Execute the query/mutation directly.
   * (used in combination with `hold` or with `<graphql-mutation>`).
   *
   * @return {ObservableQuery}
   */
  execute(params) {
    let validationResult = this.validate(params);
    if (validationResult.error) {
      console.error(validationResult.msg, this);
      return;
    }
    const {
      fetchPolicy,
      errorPolicy,
      fetchResults,
      notifyOnNetworkStatusChange,
      pollInterval,
      query,
      variables,
    } = this;
    const client = this._getClient();
    if (!client) {
      throw new Error(
        'There is no GraphQL client available. ' +
        'Initialize one on window.Apollo.client'
      );
    }
    const observableQuery = client.watchQuery({
      fetchPolicy,
      errorPolicy,
      fetchResults,
      notifyOnNetworkStatusChange,
      pollInterval,
      query,
      variables,
    }).subscribe({
      next: (result) => {
        this.hostLoading = result.loading;
        this.networkStatus = result.networkStatus;
        this.stale = result.stale;
        this.result = result.data;
        if (result.errors) {
          this._handlerError(result.errors.message);
        }
      }
    });
    return observableQuery;
  }

  _computeRequiredVariables(query) {
    var requiredVariables = [];
    query.definitions.forEach(function (definition) {
      if (definition.variableDefinitions) {
        definition.variableDefinitions.forEach(function (variable) {
          if (variable.type.kind === 'NonNullType') {
            requiredVariables.push(variable.variable.name.value);
          }
        });
      }
    });
    return requiredVariables;
  }

  _updateQuery() {
    let query = this.textContent;
    if (!query) return;
    this.query = window.Apollo.gql([query]);
  }

  _getClient() {
    return window.Apollo.namedClient[this.clientName]
  }

  /**
   * Fired when an error is received.
   *
   * @event error
   */
  _handleError(error) {
    console.error(error);
    this.lastError = error;
    this.dispatchEvent(new CustomEvent('error', { bubbles: true, composed: true, detail: error }));
  }
}

customElements.define(GraphQLQuery.is, GraphQLQuery);

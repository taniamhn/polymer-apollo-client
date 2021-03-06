/**
## GraphQL client

Use to create a connection to your GraphQL endpoint.

### Usage

Import the `build/apollo-client.js` in your website for a default setup.

```html
<script src="bower_components/polymer-apollo-client/build/apollo-client.js"></script>
```

If you need GraphQL subscriptions support, import the `build/apollo-client-subscription.js`
instead of `build/apollo-client.js`.

```html
<script src="bower_components/polymer-apollo-client/build/apollo-client-subscription.js"></script>
```

If you need file upload via GraphQL support, import the `build/apollo-client-subscription-file-upload.js`
instead of `build/apollo-client.js`.

```html
<script src="bower_components/polymer-apollo-client/build/apollo-client-subscription-file-upload.js"></script>
```

Create a single instance of the `<graphql-client.html>`.

```html
<link rel="import" href="bower_components/polymer-apollo-client/graphql-client.html">

<graphql-client config='{"uri": "https://graphql.endpoint/graphql"}'></graphql-client>
```

This will create an instance of Apollo Client.

### Custom Apollo Client

You can use your own `apollo-client-***.js` file. It should include:

- `window.Apollo.client` an instance of `ApolloClient`
- `window.Apollo.gql` an export of `graphql-tag`

The _only_ thing `<graphql-client>` exposes:

```js
window.Apollo.namedClient['default'] = apolloClientInstance;
```

For an example how to set this up, take a look at `apollo-client.js`, `apollo-client-subscription.js`
and at the `webpack.config.js` to see how to compile your version.

@group ApolloClient
@polymer
@customElement
@demo demo/graphql-query-simple.html Simple query
@demo demo/full-demo.html Full demo
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

export const CLIENT_NAME_DEFAULT = 'default';

class GraphQLClient extends PolymerElement {
  static get is() {
    return 'graphql-client';
  }

  static get properties() {
    return {
      /**
       * Will be passed to `HttpLink()`.
       */
      config: {
        type: Object
      },

      /**
       * Will be passed to `WebSocketLink()`.
       */
      wsConfig: {
        type: Object
      },

      /**
       * Will be passed to `ApolloClient()`.
       */
      apolloConfig: {
        type: Object
      },

      /**
       * Name of the client. When using only a single endpoint in your app, you can omit this parameter.
       */
      clientName: {
        type: String,
        value: CLIENT_NAME_DEFAULT
      }
    };
  }

  /**
   * @protected
   */
  connectedCallback() {
    super.connectedCallback()

    window.Apollo.namedClient[this.clientName] = window.Apollo.init(this.config, this.wsConfig, this.apolloConfig);

    if (this.clientName === CLIENT_NAME_DEFAULT) {
      window.Apollo.client = window.Apollo.namedClient[CLIENT_NAME_DEFAULT]
      window.__APOLLO_CLIENT__ = window.Apollo.client
    }
  }
}

customElements.define(GraphQLClient.is, GraphQLClient);

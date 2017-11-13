import { BatchHttpLink } from "apollo-link-batch-http";
import ApolloClient from "apollo-client";
import InMemoryCache from "apollo-cache-inmemory";
import gql from 'graphql-tag';

/**
 * @param config
 * @returns {ApolloClient}
 */
const init = (config) => {
  if (! config) {
    console.error('Trying to initialize an ApolloClient without having a config set');
  }

  // Create the apollo client
  return new ApolloClient({
    link: new BatchHttpLink(config),
    cache: new InMemoryCache()
  });
}

const namedClient = {};

export { init, gql, namedClient };

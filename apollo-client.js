import ApolloClient from "apollo-client";
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { createUploadLink } from 'apollo-upload-client';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import gql from 'graphql-tag';

export { gql, ApolloClient, InMemoryCache, HttpLink, onError, ApolloLink, IntrospectionFragmentMatcher };

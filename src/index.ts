import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'

import * as currencyFormatter from 'currency-formatter'

import { ApolloServer } from 'apollo-server'
import { Resolvers } from './types'

import type { CartModel, CartItemModel } from './model'

import { CurrencyCode } from './model'

const typeDefs = loadSchemaSync('schema.graphql', {
  loaders: [new GraphQLFileLoader()],
})

const CART_ITEMS: CartItemModel[] = [
  {
    _id: '1',
    name: 'T-Shirt',
    quantity: 3,
    price: 1000,
    currency: CurrencyCode.USD,
  },
  {
    _id: '2',
    name: 'Stickers',
    quantity: 1,
    price: 500,
    currency: CurrencyCode.USD,
  },
]

const CARTS: CartModel[] = [
  {
    _id: 'wtf',
    items: CART_ITEMS,
    currency: CurrencyCode.USD,
  },
]

const resolvers: Resolvers = {
  Query: {
    cart: (_, { id }) => {
      return CARTS.find((cart) => cart._id === id)
    },
  },
  Cart: {
    id: (cart) => cart._id,
    totalItems: (cart) => cart.items.length,
    subTotal: (cart) => {
      const amount = cart.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      )

      return {
        amount,
        formatted: currencyFormatter.format(amount / 100, {
          code: cart.currency,
        }),
      }
    },
  },
  CartItem: {
    id: (item) => item._id,
    unitTotal: (item) => {
      const amount = item.price

      return {
        amount,
        formatted: currencyFormatter.format(amount / 100, {
          code: item.currency,
        }),
      }
    },
    lineTotal: (item) => {
      const amount = item.quantity * item.price

      return {
        amount,
        formatted: currencyFormatter.format(amount / 100, {
          code: item.currency,
        }),
      }
    },
  },
  Currency: {
    USD: CurrencyCode.USD,
    GBP: CurrencyCode.GBP,
    TRY: CurrencyCode.TRY,
  },
}
const server = new ApolloServer({ typeDefs, resolvers })

// The `listen` method launches a web server
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})

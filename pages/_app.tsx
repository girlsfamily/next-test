// pages/_app.js
import Head from 'next/head'
import { useState } from 'react'
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core'
import { Provider } from 'react-redux'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import store from 'lib/store'
import Nav from 'components/Nav'

import type {AppProps} from 'next/app'
import '@fontsource/orbitron'
import '../styles/globals.css'
import 'swiper/css'

const client = new ApolloClient({
  uri: process.env.NODE_ENV === 'development' ? 'localhost:8080' : 'https://serve-test.onrender.com',
  cache: new InMemoryCache()
})

function App({Component, pageProps}: AppProps) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light')
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

  return (
    <>
      <Head>
        <title>funny2boring</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colors: {
              main: ['#f9f0ff', '#efdbff', '#d3adf7', '#b37feb', '#9254de', '#722ed1', '#531dab', '#391085', '#22075e','#120338']
            },
            primaryColor: 'main'
            // colorScheme: 'light'
          }}
        >
          <ApolloProvider client={client}>
            <Provider store={store}>
              <Nav />
              <Component {...pageProps} />
            </Provider>
          </ApolloProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  )
}

export default App

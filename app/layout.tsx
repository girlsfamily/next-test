import React from "react";

export default function RootLayout({
 // Layouts must accept a children prop.
 // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// import NextDocument, {Html, Head, Main, NextScript} from 'next/document'
// import {createGetInitialProps} from '@mantine/next'
//
// const getInitialProps = createGetInitialProps()
//
// export default class Document extends NextDocument {
//   static getInitialProps = getInitialProps
//
//   render() {
//     return (
//       <Html>
//         <Head>
//           <title></title>
//         </Head>
//         <body>
//         <Main/>
//         <NextScript/>
//         </body>
//       </Html>
//     )
//   }
// }

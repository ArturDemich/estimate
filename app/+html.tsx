import { ScrollView, StyleSheet } from 'react-native';

export default function Root({ children }: { children: React.ReactNode }) {
    return (
        <html lang="uk">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
                <title>Plant-Stock</title>
                <meta property="og:title" content="Plant-Stock" />
                <meta property="og:description" content="Фотографуй, рахуй - рослини інвентаризуй!" />
                <meta property="og:url" content="https://estimate-web-ten.vercel.app/" />
                <meta property="og:site_name" content="Plant-Stock"/>
                <meta property="og:image" content="https://estimate-web-ten.vercel.app/web-app-manifest-512x512.png" />
                <meta name="twitter:title" content="Plant-Stock" />
                <meta name="twitter:card" content="summary" />
                <meta property="twitter:description" content="Фотографуй, рахуй - рослини інвентаризуй!" />
                <meta property="og:type" content="website" />
                


                {/* PWA теги */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="PlantStock" />

                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />

                <style dangerouslySetInnerHTML={{ __html: rootStyles }} />
            </head>
            <body>{children}</body>
        </html>
    );
}

const rootStyles = `
  html, body {
    margin: 0;
    padding: 0;
    height: 100vh;
    overflow: hidden;
    background: url('/globoza.jpg') no-repeat center center;
    background-size: cover;
    background-attachment: fixed;
    overscroll-behavior: none; 
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  #root > div {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
`;


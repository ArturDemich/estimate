import { ScrollView, StyleSheet } from 'react-native';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />


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
  html, body, #root {
    height: 100dvh;
    height: -webkit-fill-available; 
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    /* ФОН МАЄ БУТИ ТУТ */
    background-color: transparent !important; 
  }

  #root > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100% !important;
    /* Це дозволяє контенту (тексту, кнопкам) не зливатися зі смужкою, 
       але фон при цьому заповнить весь екран */
    padding-bottom: env(safe-area-inset-bottom);
  }

  body {
    overflow: hidden;
    margin: 0;
    padding: 0;
    /* Щоб не було "стрибків" при скролі */
    position: fixed; 
    width: 100%;
  }
`;

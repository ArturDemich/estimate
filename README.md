replace getBitmapFromURL in: node_modules/@conodene/react-native-thermal-receipt-printer-image-qr/android/src/main/java/com/pinmi/react/printer/adapter/BLEPrinterAdapter.java

public static Bitmap getBitmapFromURL(String src) {
        try {
            if (src.startsWith("file://")) {
                // If the URI is a file URI, load the file directly
                File file = new File(new URI(src));
                if (file.exists()) {
                    return BitmapFactory.decodeFile(file.getAbsolutePath());
                } else {
                   // Log.e(LOG_TAG, "File not found: " + src);
                    return null;
                }
            } else if (src.startsWith("http://") || src.startsWith("https://")) {
                // If the URI is an HTTP URL, use HttpURLConnection
                URL url = new URL(src);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setDoInput(true);
                connection.connect();
                InputStream input = connection.getInputStream();
                Bitmap myBitmap = BitmapFactory.decodeStream(input);
                input.close();
                return myBitmap;
            } else {
                //Log.e(LOG_TAG, "Unsupported URL scheme: " + src);
                return null;
            }
        } catch (Exception e) {
           // Log.e(LOG_TAG, "Error loading image: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    +add in top
        import java.io.File;
        import java.net.URI;

    +add in line 55, 56
        private final static byte[] SET_LINE_SPACE_08 = new byte[] { ESC_CHAR, 0x33, 8 };

    change func - printImageData:
        replace props SET_LINE_SPACE_08 && 8 insted SET_LINE_SPACE_16 && 32


in BLEPrinterAdapter.java - printRawData, printRawDataAsync:
    +printerOutputStream.write(new byte[]{0x1B, 0x64, 0x00}); // Feed adjustment (0 lines)
    printerOutputStream.write(bytes, 0, bytes.length);
    +printerOutputStream.write(new byte[]{0x1D, 0x0C}); // Label end feed
package com.dartur.plantstock

import android.graphics.BitmapFactory
import android.util.Base64
import com.facebook.react.bridge.*
import com.puty.sdk.PrinterInstance
import com.puty.sdk.callback.DeviceFoundImp;
import com.puty.sdk.callback.PrinterInstanceApi;
import com.puty.sdk.utils.BarcodeType
import com.puty.sdk.utils.PAlign
import android.util.Log
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color


import android.net.Uri
import java.io.InputStream


class PrinterPutyModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        const val TAG = "PrinterPutyModule"
    }
    private var printerInstance: PrinterInstanceApi? = null
    private var isConnected = false

    init {
        try {
            Log.d(TAG, "▶ Initializing Printer SDK...")
            PrinterInstance.init(reactContext.applicationContext)
            printerInstance = PrinterInstance.getInstance()

            if (printerInstance == null) {
                Log.e(TAG, "❌ PrinterInstance is NULL after init()")
            } else {
                Log.d(TAG, "✅ PrinterInstance initialized successfully")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Exception while init PrinterInstance: ${e.message}", e)
        }
    }

    override fun getName(): String = "PrinterPuty"

    @ReactMethod
    fun connectPrinter(macAddress: String, promise: Promise) {
        Log.d("PrinterPuty", "start______")
       try {
            Log.d(TAG, "▶ connectPrinter called with: $macAddress")

            if (macAddress.isEmpty()) {
                promise.reject("ERR", "MAC address is empty")
                return
            }

            if (printerInstance == null) {
                promise.reject("ERR", "PrinterInstance not initialized")
                return
            }

            printerInstance?.closeConnection()
            Log.d(TAG, "ℹ️ Trying to connect to $macAddress...")

            val result = printerInstance?.connect(macAddress) ?: false

            if (result) {
                Log.d(TAG, "✅ Connected to $macAddress and $result")
                promise.resolve("Connected to $macAddress")
            } else {
                Log.w(TAG, "❌ Failed to connect $macAddress (connect() returned false)")
                promise.reject("ERR_CONNECT", "Failed to connect")
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Exception: ${e.message}", e)
            promise.reject("ERR_CONNECT", e)
        }
    }

    @ReactMethod
    fun disconnectPrinter(promise: Promise) {
        try {
            if (printerInstance == null) {
                promise.reject("ERR", "PrinterInstance not initialized")
                return
            }

            printerInstance?.closeConnection()
            Log.d(TAG, "🔌 Printer disconnected")
            promise.resolve("Printer disconnected")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Exception in disconnectPrinter: ${e.message}", e)
            promise.reject("ERR_DISCONNECT", e)
        }
    }

    @ReactMethod
    fun checkPrinterStatus(promise: Promise) {
        try {
            val status = PrinterInstance.getInstance().getPrinterStatusEsc()

            if (status != null && status.isNotEmpty()) {
                val statusString = status.joinToString(", ") { it.toUByte().toString() }
                val isConnected = if (status[0].toInt() != 0) 1 else 0

                Log.e(TAG, "Printer status bytes: [$statusString], connected: $isConnected")
                promise.resolve(isConnected)
            } else {
                Log.e(TAG, "Printer status is empty")
                promise.resolve(0)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking printer status: ${e.message}", e)
            promise.reject("ERR_STATUS", e)
        }
    }

    @ReactMethod
    fun isBluetoothEnabled(promise: Promise) {
        try {
            val result = PrinterInstance.getInstance().isBtEnabled() ?: false
            Log.d(TAG, "Bluetooth enabled: $result")
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERR_BT_CHECK", e)
        }
    }

    
    @ReactMethod
    fun printImage(filePath: String, widthMm: Int, heightMm: Int, copies: Int, promise: Promise) {
        var inputStream: InputStream? = null
        try {
            val uri = android.net.Uri.parse(filePath)
            inputStream = reactApplicationContext.contentResolver.openInputStream(uri)
            if (inputStream == null) {
                Log.e(TAG, "InputStream is null for path: $filePath")
                promise.reject("PRINT_IMAGE_ERROR", "InputStream is null")
                return
            }
            val bitmap = BitmapFactory.decodeStream(inputStream)

            if (bitmap == null) {
                Log.e(TAG, "Bitmap is null after decoding")
                promise.reject("PRINT_IMAGE_ERROR", "Bitmap is null after decoding")
                return
            }
            
            val defaultWidthMm = 50   // раніше відповідало ~380 px
            val defaultHeightMm = 30  // підбереш під себе

            val labelWidthMm = if (widthMm > 0) widthMm else defaultWidthMm
            val labelHeightMm = if (heightMm > 0) heightMm else defaultHeightMm

            // Конвертація мм → пікселі (калібровано під твій принтер)
            val pxPerMm = 380f / defaultWidthMm  // ≈ 7.6 px на мм

            val printerWidthPx = (labelWidthMm * pxPerMm).toInt()
            val printerHeightPx = (labelHeightMm * pxPerMm).toInt()

            val resizedBitmap = Bitmap.createScaledBitmap(bitmap, printerWidthPx, printerHeightPx, true)

            val blockHeight = (printerHeightPx / 8) * 8

            Log.d(TAG, "Printing image: width=${resizedBitmap.width}, height=${resizedBitmap.height}, blockHeight=$blockHeight")

            for (i in 1..copies) {
                PrinterInstance.getInstance().printLabelNewEsc(
                    resizedBitmap, // Bitmap
                    copies,        // labelCount
                    i,             // labelIndex
                    1,             // des
                    4,             // speed
                    0              // shareNumber (RFID)
                )
            }
        

            Log.d(TAG, "Print command sent to printer")
            promise.resolve("Image printed successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Exception in printImageFromFile", e)
            promise.reject("PRINT_IMAGE_ERROR", e)
        } finally {
            try { inputStream?.close() } catch (_: Exception) {}
        }
    } 

}

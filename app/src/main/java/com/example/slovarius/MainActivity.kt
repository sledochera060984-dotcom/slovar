package com.example.slovarius

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.slovarius.nativeui.NativeArabrusApp

class MainActivity : ComponentActivity() {
    private val useNativeUi = true

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (useNativeUi) {
            setContent {
                NativeArabrusApp()
            }
        } else {
            val webView = WebView(this)
            webView.webViewClient = WebViewClient()
            webView.settings.javaScriptEnabled = true
            webView.loadUrl("file:///android_asset/index.html")
            setContentView(webView)
        }
    }
}

# 保留 WebView JS 接口相关类
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

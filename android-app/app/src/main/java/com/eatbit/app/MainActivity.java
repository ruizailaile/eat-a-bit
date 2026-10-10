package com.eatbit.app;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.KeyEvent;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;

/**
 * 「吃一点」安卓外壳
 *
 * 核心职责：
 * 1. 用 WebViewAssetLoader 把本地 assets 映射成 https://appassets.androidplatform.net
 *    —— 这样页面处于安全上下文，navigator.mediaDevices.getUserMedia 才能拿到实时相机画面。
 * 2. 处理 WebView 的相机权限申请（onPermissionRequest + 运行时权限）。
 * 3. 处理 <input type="file" capture> 的拍照 / 选图（onShowFileChooser）。
 */
public class MainActivity extends Activity {

    private static final String TAG = "EatABit";
    private static final String APP_ORIGIN = "https://appassets.androidplatform.net";
    private static final String START_URL = APP_ORIGIN + "/assets/index.html";

    private static final int RC_CAMERA = 1001;
    private static final int RC_FILE = 1002;

    private WebView webView;
    private WebViewAssetLoader assetLoader;

    /** 等待相机权限结果的 WebView 权限请求 */
    private PermissionRequest pendingPermissionRequest;

    /** 等待文件选择结果的回调 */
    private ValueCallback<Uri[]> filePathCallback;
    /** 系统相机拍完后写入的目标 Uri */
    private Uri pendingCaptureUri;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        buildContentView();
        configureWebView();
        webView.loadUrl(START_URL);
    }

    private void buildContentView() {
        FrameLayout root = new FrameLayout(this);
        root.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        root.setBackgroundColor(0xFFF5F7F2);

        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));

        setContentView(root);
    }

    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(false);
        // 允许页面不经过用户手势就播放视频（相机预览必需）
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(false);
        s.setTextZoom(100);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // 允许 https 页面加载 http 资源（兼容自建 AI 接口）
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // assets -> https://appassets.androidplatform.net/assets/...
        assetLoader = new WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() == null ? "" : uri.getScheme();
                if ("http".equals(scheme) || "https".equals(scheme) || "file".equals(scheme)) {
                    // 站内与 AI 接口请求交给 WebView 处理
                    if (uri.toString().startsWith(APP_ORIGIN)) {
                        return false;
                    }
                    // 外部链接用系统浏览器打开
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    } catch (ActivityNotFoundException ignored) {
                    }
                    return true;
                }
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        handleWebPermissionRequest(request);
                    }
                });
            }

            @Override
            public boolean onShowFileChooser(WebView view,
                                             ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                return handleFileChooser(callback, params);
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage cm) {
                Log.d(TAG, cm.message() + " @" + cm.sourceId() + ":" + cm.lineNumber());
                return true;
            }
        });

        // 原生 HTTP 桥：绕过浏览器 CORS 限制，让页面能直连任意 AI 视觉接口
        webView.addJavascriptInterface(new NativeHttp(), "AndroidHttp");
    }

    /**
     * 供网页调用的原生 HTTP POST。
     * 返回结构：{"ok":true/false, "status":200, "body":"响应正文字符串"}
     */
    private static class NativeHttp {

        @JavascriptInterface
        public String post(String url, String headersJson, String body) {
            HttpURLConnection conn = null;
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                conn = c;
                c.setRequestMethod("POST");
                c.setConnectTimeout(30000);
                c.setReadTimeout(180000);
                c.setDoOutput(true);
                c.setDoInput(true);
                c.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                c.setRequestProperty("Accept", "application/json");

                if (headersJson != null && headersJson.length() > 0) {
                    JSONObject headers = new JSONObject(headersJson);
                    Iterator<String> keys = headers.keys();
                    while (keys.hasNext()) {
                        String k = keys.next();
                        c.setRequestProperty(k, headers.getString(k));
                    }
                }

                OutputStream os = c.getOutputStream();
                os.write(body == null ? new byte[0] : body.getBytes("UTF-8"));
                os.flush();
                os.close();

                int code = c.getResponseCode();
                boolean ok = code >= 200 && code < 300;
                InputStream is = ok ? c.getInputStream() : c.getErrorStream();
                String text = is == null ? "" : readAll(is);

                return new JSONObject()
                        .put("ok", ok)
                        .put("status", code)
                        .put("body", text)
                        .toString();
            } catch (Exception e) {
                Log.e(TAG, "native http failed", e);
                try {
                    return new JSONObject()
                            .put("ok", false)
                            .put("status", 0)
                            .put("body", String.valueOf(e.getMessage()))
                            .toString();
                } catch (Exception ignored) {
                    return "{\"ok\":false,\"status\":0,\"body\":\"request failed\"}";
                }
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        }

        private static String readAll(InputStream is) throws Exception {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = is.read(buf)) != -1) {
                bos.write(buf, 0, n);
            }
            is.close();
            return bos.toString("UTF-8");
        }
    }

    // ==================== 相机权限 ====================

    private void handleWebPermissionRequest(PermissionRequest request) {
        String[] resources = request.getResources();
        boolean wantsCamera = false;
        for (String r : resources) {
            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)) {
                wantsCamera = true;
                break;
            }
        }

        if (wantsCamera && !hasCameraPermission()) {
            // 先申请系统权限，拿到结果后再回填给 WebView
            pendingPermissionRequest = request;
            requestPermissions(new String[]{Manifest.permission.CAMERA}, RC_CAMERA);
            return;
        }
        request.grant(resources);
    }

    private boolean hasCameraPermission() {
        return checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != RC_CAMERA) {
            return;
        }
        boolean granted = grantResults.length > 0
                && grantResults[0] == PackageManager.PERMISSION_GRANTED;

        if (pendingPermissionRequest != null) {
            if (granted) {
                pendingPermissionRequest.grant(pendingPermissionRequest.getResources());
            } else {
                pendingPermissionRequest.deny();
            }
            pendingPermissionRequest = null;
        }

        if (!granted) {
            Toast.makeText(this, "未获得相机权限，将改用系统相机拍照", Toast.LENGTH_SHORT).show();
        }
    }

    // ==================== 拍照 / 选图 ====================

    private boolean handleFileChooser(ValueCallback<Uri[]> callback, WebChromeClient.FileChooserParams params) {
        if (filePathCallback != null) {
            filePathCallback.onReceiveValue(null);
        }
        filePathCallback = callback;
        pendingCaptureUri = null;

        boolean captureEnabled = params.isCaptureEnabled();
        String accept = firstAcceptType(params);

        Intent intent;
        if (captureEnabled) {
            intent = buildCameraIntent();
        } else {
            intent = buildGalleryIntent(accept);
        }

        try {
            startActivityForResult(intent, RC_FILE);
        } catch (ActivityNotFoundException e) {
            // 相机不可用时退回相册
            try {
                startActivityForResult(buildGalleryIntent(accept), RC_FILE);
            } catch (ActivityNotFoundException e2) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                    filePathCallback = null;
                }
                Toast.makeText(this, "未找到可用的相机或相册应用", Toast.LENGTH_SHORT).show();
                return false;
            }
        }
        return true;
    }

    private String firstAcceptType(WebChromeClient.FileChooserParams params) {
        String[] types = params.getAcceptTypes();
        if (types != null) {
            for (String t : types) {
                if (t != null && t.trim().length() > 0) {
                    String v = t.trim();
                    int comma = v.indexOf(',');
                    if (comma > 0) {
                        v = v.substring(0, comma).trim();
                    }
                    return v;
                }
            }
        }
        return "image/*";
    }

    private Intent buildGalleryIntent(String accept) {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(accept == null || accept.length() == 0 ? "image/*" : accept);
        return Intent.createChooser(intent, "选择图片");
    }

    private Intent buildCameraIntent() {
        File dir = new File(getCacheDir(), "captures");
        if (!dir.exists() && !dir.mkdirs()) {
            Log.w(TAG, "无法创建拍照缓存目录");
        }
        File photo = new File(dir, "cap_" + System.currentTimeMillis() + ".jpg");
        try {
            pendingCaptureUri = FileProvider.getUriForFile(
                    this, getPackageName() + ".fileprovider", photo);
        } catch (Exception e) {
            Log.e(TAG, "创建拍照 Uri 失败", e);
            return buildGalleryIntent("image/*");
        }

        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        intent.putExtra(MediaStore.EXTRA_OUTPUT, pendingCaptureUri);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        return intent;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != RC_FILE) {
            super.onActivityResult(requestCode, resultCode, data);
            return;
        }

        Uri[] results = null;
        if (resultCode == RESULT_OK) {
            if (data != null && data.getData() != null) {
                results = new Uri[]{data.getData()};
            } else if (pendingCaptureUri != null) {
                results = new Uri[]{pendingCaptureUri};
            }
        }

        if (filePathCallback != null) {
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
        pendingCaptureUri = null;
    }

    // ==================== 生命周期 ====================

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}

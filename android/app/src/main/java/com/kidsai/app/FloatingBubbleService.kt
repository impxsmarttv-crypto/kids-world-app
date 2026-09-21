package com.kidsai.app
import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.widget.TextView
class FloatingBubbleService:Service(){private var bubble:TextView?=null;override fun onStartCommand(intent:Intent?,flags:Int,startId:Int):Int{if(bubble==null&&Settings.canDrawOverlays(this)){val v=TextView(this).apply{text="🧸";textSize=28f;setTextColor(Color.WHITE);setBackgroundColor(Color.rgb(80,120,220));gravity=Gravity.CENTER;setOnClickListener{startActivity(Intent(this@FloatingBubbleService,MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))}};val type=if(android.os.Build.VERSION.SDK_INT>=26)WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY else WindowManager.LayoutParams.TYPE_PHONE;val p=WindowManager.LayoutParams(72,72,type,WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,PixelFormat.TRANSLUCENT).apply{gravity=Gravity.END or Gravity.CENTER_VERTICAL};getSystemService(WindowManager::class.java).addView(v,p);bubble=v};return START_STICKY}override fun onDestroy(){bubble?.let{getSystemService(WindowManager::class.java).removeView(it)};bubble=null;super.onDestroy()}override fun onBind(intent:Intent?):IBinder?=null}

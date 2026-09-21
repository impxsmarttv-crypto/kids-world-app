package com.kidsai.app
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
class MainActivity:ComponentActivity(){override fun onCreate(savedInstanceState:Bundle?){super.onCreate(savedInstanceState);setContent{MaterialTheme{var age by remember{mutableIntStateOf(8)};var message by remember{mutableStateOf("")};var answer by remember{mutableStateOf("مرحبًا! أنا مساعدك الذكي 🧸")};Column(Modifier.fillMaxSize().padding(24.dp),horizontalAlignment=Alignment.CenterHorizontally){Text("🧸 مساعدي الذكي",style=MaterialTheme.typography.headlineMedium);Text("العمر: $age");Slider(value=age.toFloat(),onValueChange={age=it.toInt()},valueRange=2f..16f,steps=13);OutlinedTextField(value=message,onValueChange={message=it},label={Text("اكتب سؤالك")},modifier=Modifier.fillMaxWidth());Button(onClick={answer="سيتم إرسال السؤال إلى خادم Kids AI الآمن."}){Text("اسأل 🧠")};Text(answer);Button(onClick={startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,Uri.parse("package:$packageName")))}){Text("تفعيل الأيقونة العائمة")}}}}}}

import 'package:flutter/material.dart';
import 'screens/auth_screen.dart';
import 'screens/chat_screen.dart';

void main() {
  runApp(const YesPalmApp());
}

class YesPalmApp extends StatelessWidget {
  const YesPalmApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'YesPalm',
      theme: ThemeData(
        primarySwatch: Colors.green,
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF2d6a4f),
          elevation: 0,
        ),
      ),
      home: const AuthScreen(),
    );
  }
}

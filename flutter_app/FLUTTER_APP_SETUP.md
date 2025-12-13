# YesPalm Flutter Mobile App - Complete Setup Guide

## 🎯 Quick Start

YesPalm Flutter app is a **cross-platform mobile app** (Android + iOS) for the YesPalm anonymous messaging platform.

### Current Status
- ✅ **Project Structure Created**: pubspec.yaml, main.dart, and lib/main.dart configured
- ✅ **Material Design Theme**: Green Palmyra theme with Material 3 support
- ⏳ **In Development**: Authentication and Chat screens need to be completed

---

## 📋 Prerequisites

### Before You Start
1. **Flutter SDK** (3.0.0 or higher)
   - [Download Flutter](https://flutter.dev/docs/get-started/install)
   - Run: `flutter doctor` to verify installation

2. **Android SDK** (for Play Store deployment)
   - Android Studio 4.0+
   - Target SDK: 33+
   - Min SDK: 21

3. **GitHub Access**
   - Clone this repository locally
   - Create a personal access token for deployment

---

## 🚀 Setup Instructions

### Step 1: Clone the Repository
```bash
cd ~/projects
git clone https://github.com/addlinesumith-stack/yespalm-messaging.git
cd yespalm-messaging/flutter_app
```

### Step 2: Install Dependencies
```bash
flutter pub get
```

### Step 3: Configure Android Settings

**Edit `android/app/build.gradle`:**
```gradle
defaultConfig {
    applicationId = "com.yespalm.messaging"
    minSdkVersion = 21
    targetSdkVersion = 33
    versionCode = 1
    versionName = "1.0.0"
}
```

**Edit `android/app/src/main/AndroidManifest.xml`:**
```xml
<application
    android:icon="@mipmap/ic_launcher"
    android:label="YesPalm"
    android:usesCleartextTraffic="true">
```

### Step 4: Create Screen Files

You need to create these additional files in `lib/screens/`:

#### `lib/screens/auth_screen.dart`
- Email input field
- "Send OTP" button
- OTP verification input
- Connect to `/api/send-otp` endpoint

#### `lib/screens/chat_screen.dart`
- Display user email
- Show unique Room ID
- Message list view
- "Join Friend's Room" feature
- Message input and send

#### `lib/models/user_model.dart`
```dart
class User {
  final String id;
  final String email;
  final DateTime timestamp;
  final String roomId;

  User({
    required this.id,
    required this.email,
    required this.timestamp,
    required this.roomId,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'timestamp': timestamp.toIso8601String(),
    'roomId': roomId,
  };
}
```

#### `lib/models/message_model.dart`
```dart
class Message {
  final String id;
  final String text;
  final DateTime timestamp;
  final String sender;

  Message({
    required this.id,
    required this.text,
    required this.timestamp,
    required this.sender,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'text': text,
    'timestamp': timestamp.toIso8601String(),
    'sender': sender,
  };
}
```

#### `lib/services/api_service.dart`
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'https://yespalm-messaging.vercel.app';

  static Future<Map<String, dynamic>> sendOTP(String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/send-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'otp': generateOTP(),
      }),
    );

    return jsonDecode(response.body);
  }

  static String generateOTP() {
    return (100000 + (DateTime.now().millisecondsSinceEpoch % 900000)).toString();
  }
}
```

#### `lib/services/storage_service.dart`
```dart
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class StorageService {
  static Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(user));
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user');
    return userData != null ? jsonDecode(userData) : null;
  }

  static Future<void> saveMessages(List<Map<String, dynamic>> messages) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('messages', jsonEncode(messages));
  }

  static Future<List<Map<String, dynamic>>> getMessages() async {
    final prefs = await SharedPreferences.getInstance();
    final messagesData = prefs.getString('messages');
    return messagesData != null ? List<Map<String, dynamic>>.from(jsonDecode(messagesData)) : [];
  }
}
```

### Step 5: Test Locally
```bash
# Run on Android emulator
flutter run -d emulator-5554

# Or run on physical device
flutter run
```

---

## 📱 Deploy to Google Play Store

### Step 1: Create Google Play Developer Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Pay $25 one-time registration fee
3. Create a new app

### Step 2: Build APK/AAB
```bash
# Build App Bundle (recommended for Play Store)
flutter build appbundle --release

# Output: build/app/outputs/bundle/release/app-release.aab
```

### Step 3: Create Keystore
```bash
keytool -genkey -v -keystore ~/yespalm-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias yespalm
```

### Step 4: Configure Signing
**Create `android/key.properties`:**
```properties
storePassword=<your_password>
keyPassword=<your_password>
keyAlias=yespalm
storeFile=<absolute_path_to_keystore>
```

**Edit `android/app/build.gradle`:**
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
    }
}
```

### Step 5: Submit to Play Store
1. Go to Google Play Console
2. Select your app
3. Go to "Release" → "Production"
4. Upload the `app-release.aab` file
5. Add screenshots, description, and app details
6. Submit for review

---

## 🔐 Play Store Submission Checklist

- [ ] App Privacy Policy (required)
- [ ] Screenshots (2-8 per language)
- [ ] App Description
- [ ] Content Rating Questionnaire
- [ ] Target Audience
- [ ] App Icon (512x512 PNG)
- [ ] Feature Graphic (1024x500 PNG)
- [ ] Version Name & Version Code
- [ ] Release Notes

---

## 📝 Generate Privacy Policy

Create a simple privacy policy at:
- [Privacy Policy Generator](https://www.freeprivacypolicy.com/)
- Or use: `https://yespalm-messaging.vercel.app/privacy-policy`

---

## ✅ Estimated Timeline

- **Setup & Development**: 2-3 hours
- **Testing**: 1 hour
- **Play Store Submission**: 24-48 hours for review
- **Total**: ~24-72 hours (including review)

---

## 🆘 Troubleshooting

### Flutter not found
```bash
export PATH="$PATH:~/flutter/bin"
```

### Pod install error (iOS)
```bash
cd ios
pod repo update
pod install
cd ..
```

### Play Store Build Fails
- Check Android SDK version
- Ensure keystore file path is correct
- Verify Android signing configuration

---

## 📞 Support

For issues:
1. Check Flutter docs: https://flutter.dev/docs
2. Google Play Console Help: https://support.google.com/googleplay
3. GitHub Issues: Create an issue in this repository

---

**Last Updated**: December 2025  
**Flutter Version**: 3.0+  
**Status**: Ready for development

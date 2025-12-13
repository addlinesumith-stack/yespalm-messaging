import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import 'chat_screen.dart';
import 'package:uuid/uuid.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({Key? key}) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  bool _showOTPInput = false;
  bool _isLoading = false;
  String _generatedOTP = '';
  String _userEmail = '';

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _sendOTP() async {
    if (_emailController.text.isEmpty || !_emailController.text.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid email')),
      );
      return;
    }

    setState(() => _isLoading = true);
    _userEmail = _emailController.text.trim();
    _generatedOTP = ApiService.generateOTP();

    try {
      final result = await ApiService.sendOTP(_userEmail, _generatedOTP);
      if (mounted) {
        setState(() {
          _showOTPInput = true;
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('OTP sent to your email!')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _verifyOTP() async {
    if (_otpController.text != _generatedOTP) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid OTP')),
      );
      return;
    }

    final user = {
      'id': const Uuid().v4(),
      'email': _userEmail,
      'timestamp': DateTime.now().toIso8601String(),
      'roomId': 'ROOM' + const Uuid().v4().replaceAll('-', '').substring(0, 9).toUpperCase(),
    };

    await StorageService.saveUser(user);

    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => ChatScreen(user: user),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1a4d2e),
              Color(0xFF2d6a4f),
              Color(0xFF40916c),
            ],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  '🌴',
                  style: TextStyle(fontSize: 60),
                ),
                const SizedBox(height: 16),
                const Text(
                  'YesPalm',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  '🍃 Anonymous Messaging 🍃',
                  style: TextStyle(
                    fontSize: 16,
                    color: Color(0xFFd4f1d4),
                  ),
                ),
                const SizedBox(height: 48),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.95),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 40,
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(40),
                  child: Column(
                    children: [
                      if (!_showOTPInput) ...[  
                        const Text(
                          '🔐 Secure Login',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1a4d2e),
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Email Based OTP Authentication',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color(0xFF52b788),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 30),
                        TextField(
                          controller: _emailController,
                          decoration: InputDecoration(
                            hintText: 'Enter your email address',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(
                                color: Color(0xFFd0f0d0),
                                width: 2,
                              ),
                            ),
                            filled: true,
                            fillColor: const Color(0xFFF8fff8),
                          ),
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _sendOTP,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF2d6a4f),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white,
                                      ),
                                    ),
                                  )
                                : const Text(
                                    'SEND OTP',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                          ),
                        ),
                      ] else ...
                        [
                        const Text(
                          'Verify Your Email',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1a4d2e),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Enter OTP sent to $_userEmail',
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF52b788),
                          ),
                        ),
                        const SizedBox(height: 30),
                        TextField(
                          controller: _otpController,
                          decoration: InputDecoration(
                            hintText: 'Enter 6-digit OTP',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(
                                color: Color(0xFFd0f0d0),
                                width: 2,
                              ),
                            ),
                            filled: true,
                            fillColor: const Color(0xFFF8fff8),
                          ),
                          maxLength: 6,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 32,
                            letterSpacing: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _verifyOTP,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF2d6a4f),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: const Text(
                              'VERIFY & LOGIN',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextButton(
                          onPressed: () {
                            setState(() {
                              _showOTPInput = false;
                              _otpController.clear();
                              _emailController.clear();
                            });
                          },
                          child: const Text(
                            '← Back to Email',
                            style: TextStyle(
                              color: Color(0xFF2d6a4f),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:auto_size_text/auto_size_text.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:fyp_mobile/firebase.dart';
import 'package:fyp_mobile/globals.dart' as globals;

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:fyp_mobile/main.dart';
import 'package:intl/intl.dart';
import 'firebase_options.dart';

class LoginPage extends StatefulWidget {
  

  LoginPage({Key? key}) : super(key: key);

  @override
  State<LoginPage> createState() => LoginPageState();
}


class LoginPageState extends  State<LoginPage> {
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();

  bool password_visible = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: const AutoSizeText(
            'Login',
            style: TextStyle(fontSize: 24),
            maxLines: 1,
            maxFontSize: 36,
            minFontSize: 12,
            overflow: TextOverflow.ellipsis,
          )//Text(widget.event['title']),
        ),
        body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [

                 Container(
                  margin: EdgeInsets.only(top: MediaQuery.of(context).size.height * 0.15),
                  padding: const EdgeInsets.all(30),
                  child: TextField(
                      controller: emailController,
                      decoration: const InputDecoration(
                        hintText: "Enter your email here",
                        labelText: "Email",
                        contentPadding: EdgeInsets.only(left: 10, right: 10)
                      ),

                    ),
                ),
      
              Container(
                  padding: const EdgeInsets.only(left: 30, right: 30),
                  child: TextField(
                      controller: passwordController,
                      decoration: InputDecoration(
                        hintText: "Enter your password here",
                        labelText: "Password",
                        contentPadding: const EdgeInsets.only(left: 10, right: 10),
                         suffixIcon: IconButton(
                            onPressed: () {
                              setState(() {
                                password_visible = !password_visible;
                              });
                            },
                            icon: password_visible? const Icon(Icons.visibility): const Icon(Icons.visibility_off),
                          ),
                      ),
                      obscureText: !password_visible,
                      enableSuggestions: false,
                      autocorrect: false,
                    ),
                ),
              


              Container(
                margin: EdgeInsets.only(top: MediaQuery.of(context).size.height * 0.15),
                child: OutlinedButton(
                    onPressed: login,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(250, 50),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      shape: const RoundedRectangleBorder(
                        borderRadius: BorderRadius.all(Radius.circular(20)),
                      ),
                    ),
                    child:  const Text(
                      'Login',
                      style: TextStyle(
                        fontSize: 20,
                      ),
                    ),
                  )
              ),


            ],
          ),
        )
        
    );
  }

  void login() async {
    var loginEmail = emailController.text.trim();
    var loginPassword = passwordController.text.trim();
    print("email:" + loginEmail);
    print("password:" + loginPassword);
    if (loginEmail == ""){
      showToast(context,"Please fill in the email field");
      return;
    }

    if (loginPassword == ""){
      showToast(context, "Please fill in the password field");
      return;
    }

    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );

      final User? user = (await FirebaseAuth.instance.signInWithEmailAndPassword(
          email: loginEmail,
          password: loginPassword
        )).user;

      if (user != null){
        setState(() {
          globals.isLogged = globals.checkLogged();
        });
        showToast(context, "You have logged in");
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        } else {
          runApp(const MaterialApp(
            home: app(),
          ));
        }
      }


    } on FirebaseAuthException catch (e) {
      print("Error: ${e.code}");
      if (e.code == 'user-not-found') {
        showToast(context, 'Email Not Exist');

      } else if (e.code == 'wrong-password') {
        showToast(context, 'Wrong Password');

      } else if (e.code == "invalid-credential"){
        showToast(context, "Wrong Email or Password!");
        
      } else if (e.code == "invalid-email") {
         showToast(context, 'Invalid Email');
      }
      
    }
  }


  void showToast(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg,
        textAlign: TextAlign.center,),
        duration: const Duration(milliseconds: 800),
      )
    );
  }


  // void showAlertMessage(BuildContext context, String title, String msg, bool dispose) {
  //   // set up the button
  //   Widget okButton = TextButton(
  //     child: Text("OK"),
  //     onPressed: () {
  //       if (dispose) {
  //         Navigator.of(context).pop();
  //       }
  //       Navigator.of(context, rootNavigator: true).pop();
  //     },
  //   );

  //   // set up the AlertDialog
  //   AlertDialog alert = AlertDialog(
  //     title: Text(title),
  //     content: Text(msg),
  //     actions: [
  //       okButton,
  //     ],
  //   );

  //   // show the dialog
  //   showDialog(
  //     context: context,
  //     builder: (BuildContext context) {
  //       return alert;
  //     },
  //   );
  // }

}

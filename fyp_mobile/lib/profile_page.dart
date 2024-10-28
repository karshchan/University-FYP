

import 'package:auto_size_text/auto_size_text.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:fyp_mobile/firebase.dart';
import 'package:fyp_mobile/globals.dart' as globals;
import "package:fyp_mobile/related_event.dart";

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:fyp_mobile/main.dart';
import 'package:intl/intl.dart';
import 'firebase_options.dart';

class ProfilePage extends StatefulWidget {
  

  ProfilePage({Key? key}) : super(key: key);

  @override
  State<ProfilePage> createState() => ProfilePageState();
}


class ProfilePageState extends  State<ProfilePage> {
  Map<String, dynamic> user_info = Map<String, dynamic>();

  @override
  void initState(){
    super.initState();
     WidgetsBinding.instance
    .addPostFrameCallback((_) {
      getLocalUserInfo();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (user_info.isEmpty) {
      return const SizedBox();
    }
    return Scaffold(
      resizeToAvoidBottomInset: false,
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: const AutoSizeText(
            'Profile',
            style: TextStyle(fontSize: 24),
            maxLines: 1,
            maxFontSize: 36,
            minFontSize: 12,
            overflow: TextOverflow.ellipsis,
          )//Text(widget.event['title']),
        ),
        body: SingleChildScrollView(
          child: Center(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                    padding: const EdgeInsets.all(30),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                'Name:'.padRight(15,' ') + user_info['first_name'] + " " + user_info['last_name'],
                                style:  TextStyle(
                                  fontSize: 18,
                                )
                              )
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                'Contact:'.padRight(15,' ') + user_info['contact'],
                                style:  TextStyle(
                                  fontSize: 18,
                                )
                              )
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                'Email:'.padRight(17,' ') + user_info['email'],
                                textAlign: TextAlign.right,
                                style:  TextStyle(
                                  fontSize: 18,
                                )
                              )
                            ),
                          ],
                        ),

                        user_info['organization'] != "" ? 
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                'Company:'.padRight(12,' ') + user_info['organization'],
                                textAlign: TextAlign.right,
                                style:  TextStyle(
                                  fontSize: 18,
                                )
                              )
                            ),
                          ],
                        ): const SizedBox(),

                        user_info['organization'] != "" ? 
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                'Address: '.padRight(14, " ") + user_info['organization_address'],
                                textAlign: TextAlign.left,
                                style:  TextStyle(
                                  fontSize: 18,
                                )
                              )
                            ),
                          ],
                        ): const SizedBox()

                      ,],
                    ),
                  ),

                Container(
                  margin: EdgeInsets.only(top: MediaQuery.of(context).size.height * 0.05),
                  child: OutlinedButton(
                    onPressed: gotoRelatedEvents,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(250, 50),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      shape: const RoundedRectangleBorder(
                        borderRadius: BorderRadius.all(Radius.circular(20)),
                      ),
                    ),
                    child:  const Text(
                      'Related Event',
                      style: TextStyle(
                        fontSize: 20,
                      ),
                    ),
                  ),
                ),
                Container(
                  margin: EdgeInsets.only(top: MediaQuery.of(context).size.height * 0.1),
                  child: OutlinedButton(
                      onPressed: (){
                        showLogoutConfirmDialog(context);
                      },
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(200, 40),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                        ),
                      ),
                      child:  const Text(
                        'Logout',
                        style: TextStyle(
                          fontSize: 20,
                        ),
                      ),
                    )
                ),


              ],
            ),
          ),
        )
        
    );
  }



  void logout() async {
    await FirebaseAuth.instance.signOut();
    showToast(context, "You have logged out");
    setState(() {
      globals.isLogged = globals.checkLogged();
    });

    print(globals.isLogged);


    runApp(const MaterialApp(
      home: app(),
    ));

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

  void getLocalUserInfo() {
    FirebaseFirestore.instance
    .collection("Users")
    .doc(FirebaseAuth.instance.currentUser!.uid)
    .get()
    .then((doc) {
      var data = doc.data();
      setState(() {
        user_info = data as Map<String, dynamic>;
      });
    });
  }

  void gotoRelatedEvents() {
    Navigator.push(context,  
        MaterialPageRoute(builder: (context) => const RelatedEvent()));
  }

  void showLogoutConfirmDialog(BuildContext context) {
    // set up the button
    Widget yesButton = TextButton(
      child: Text("Yes"),
      onPressed: () {
        logout();
        Navigator.of(context, rootNavigator: true).pop();
      },
    );

     Widget noButton = TextButton(
      child: Text("No"),
      onPressed: () {
        Navigator.of(context, rootNavigator: true).pop();
      },
    );

    // set up the AlertDialog
    AlertDialog alert = AlertDialog(
      backgroundColor: Colors.white,
      title: Text("Logout"),
      content: Text("Are you trying to logout?"),
      actions: [
        yesButton,
        noButton
      ],
    );

    // show the dialog
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return alert;
      },
    );
  }
}

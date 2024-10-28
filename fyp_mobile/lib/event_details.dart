

import 'package:auto_size_text/auto_size_text.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:fyp_mobile/firebase.dart';
import 'package:fyp_mobile/globals.dart' as globals;

import 'package:firebase_core/firebase_core.dart';
import 'package:fyp_mobile/login_page.dart';
import 'package:intl/intl.dart';
import 'firebase_options.dart';

class EventDetails extends StatefulWidget {

  dynamic event;
  String invitation_code;

  EventDetails({Key? key, required this.event, this.invitation_code = ""}) : super(key: key);

  @override
  State<EventDetails> createState() => EventDetailsState();
}


class EventDetailsState extends  State<EventDetails> {
  late var event;
  late var event_id;
  late var code;

  @override
  void initState() {
    

    super.initState();
    event = widget.event;
    
    code = widget.invitation_code;

    event = event.data();
    event_id = widget.event.id;
    event['holder_name'] = "fetching...";
    event['contact'] = "fetching...";
    event['email'] = "fetching...";
    event['joined'] = null;
    event['is_holder'] = null;

    WidgetsBinding.instance
    .addPostFrameCallback((_) {
      checkJoined();
      checkIsHolder();
      checkAccessible();
      getEventHolder();
    });

  }


  @override
  Widget build(BuildContext context) {
    if (event.length < 14) {
      return const SizedBox();
    }
    return Scaffold(
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: AutoSizeText(
            event['title'],
            style: const TextStyle(fontSize: 24),
            maxLines: 1,
            maxFontSize: 36,
            minFontSize: 12,
            overflow: TextOverflow.ellipsis,
          )//Text(widget.event['title']),
        ),
        bottomNavigationBar:GestureDetector(
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(
              color: Colors.white,
               boxShadow: [
                  BoxShadow(
                    color: Colors.black26,
                    offset: Offset(2, 2),
                    blurRadius: 10,
                  )
                ]
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: joinEvent,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(300, 50),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.all(Radius.circular(20)),
                    ),
                  ),
                  child:  event['joined'] ?? false ? const Text(
                    'Joined',
                    style: TextStyle(
                      fontSize: 20,
                    ),
                  ) : const Text(
                    'Join',
                    style: TextStyle(
                      fontSize: 20,
                    ),
                  )
                  ,
                )
              ],
            ),
          ),
        ),
        body: SingleChildScrollView(
            child: Container(
              margin: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const Row(
                    children: [
                      Text(
                        'Description',
                        textAlign: TextAlign.left,
                        style:  TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        )
                      ),
                    ],
                  ),

                  Container(
                    padding: const EdgeInsets.all(10),
                    margin: const EdgeInsets.only(bottom: 20),
                    child: Row(
                      children: [
                        Flexible(
                          child: Text(
                            '${event['description'].replaceAll("<br/>", "\n")}',
                            textAlign: TextAlign.left,
                            style:  TextStyle(
                              fontSize: 16,
                            )
                          ),
                        ),
                      ],
                    ),
                  ),

                  Row(
                    children: [
                      Text(
                        'Holder Information',
                        textAlign: TextAlign.left,
                        style:  TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        )
                      ),
                    ],
                  ),

                  Container(
                    padding: const EdgeInsets.all(10),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                'Holder:'.padRight(16,' ') + event['holder_name'],
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
                                'Contact:'.padRight(15,' ') + event['contact'],
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
                                'Email:'.padRight(17,' ') + event['email'],
                                textAlign: TextAlign.right,
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
                                'Due Date:'.padRight(14,' ') + 
                                  DateFormat("yyyy-MM-dd HH:mm")
                                    .format(
                                      (event['due_date']as Timestamp)
                                      .toDate()
                                    ),
                                textAlign: TextAlign.right,
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
                                'Event Date:'.padRight(13,' ') +
                                  DateFormat("yyyy-MM-dd HH:mm")
                                    .format(
                                      (event['event_date']as Timestamp)
                                      .toDate()
                                    ),
                                textAlign: TextAlign.right,
                                style:  TextStyle(
                                  fontSize: 18,
                                )
                              )
                            ),
                          ],
                        ),

                      ],
                    ),
                  ),

                  //211
                ],
              ),
            ),
          ),
        );
  }


  void showAlertDialog(BuildContext context, String title, String msg, bool dispose) {

    // set up the button
    Widget okButton = TextButton(
      child: Text("OK"),
      onPressed: () {
        if (dispose) {
          Navigator.of(context).pop();
        }
        Navigator.of(context, rootNavigator: true).pop();
      },
    );

    // set up the AlertDialog
    AlertDialog alert = AlertDialog(
      title: Text(title),
      content: Text(msg),
      actions: [
        okButton,
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

  void getEventHolder() async {
    print("getEventHolder");

    var data = await event['holder'].get();
    data = data.data();

    if (event['use_contact']) {
      setState(() {
        event['contact'] = data['contact'];
      }); 
      
    }
    if (event['use_email']) {
      setState(() {
        event['email'] = data['email'];
      });
      
    } 
    if (data['organization'] == "") {
      setState(() {
        event['holder_name'] = data['first_name'] + " " + data['last_name'];
      });
      
    } else {
      setState(() {
        event['holder_name'] = data['organization'];
      });
    }
 }

 void checkJoined() async {
    print("checkJoined");

    if (!globals.isLogged) {
      setState(() {
        event['joined'] = false;
      });
      return;
    }

    final result = FirebaseFirestore.instance
      .collection("Events")
      .doc(event_id)
      .collection("participants")
      .where("user", isEqualTo: FirebaseFirestore.instance.collection("Users").doc(FirebaseAuth.instance.currentUser!.uid))
      .get()
      .then(
        (snapshot) => {
          if (snapshot.docs.isNotEmpty) {
            setState(() {
              event['joined'] = true;
            })
          } else {
            setState(() {
              event['joined'] = false;
            })
          }
        },
        onError: (e) {
            showToast(context, "Fail to check enrollment");
            print("Error check enrollment: $e");
          }
      );

    
 }



  void joinEvent() async{

    if (globals.isLogged) {
      if (event['is_holder']) {
        showToast(context, "You are the event holder, no need to join");
        return;
      }
      if (event['joined']) {
        showToast(context, "You have already joined this event");
        return;
      }
    }
    

    if (Timestamp.now().seconds > event['due_date'].seconds && code != event['invitation_code']) {
      showToast(context, "Event is ended for join");
      return;
    }


    if (FirebaseAuth.instance.currentUser == null){
      showToast(context, "You need to login before joining event");
       Navigator.push(context,  
        MaterialPageRoute(builder: (context) => LoginPage()))
        .then((value) {
          if (globals.isLogged) {
            checkJoined();
            checkIsHolder();
            checkAccessible();
            getEventHolder();
          }
        });
    } else {
      final data = {
        "user": FirebaseFirestore.instance.collection("Users").doc(FirebaseAuth.instance.currentUser!.uid),
        "arrival_time": Timestamp(0, 0).toDate(),
        "enroll_time": FieldValue.serverTimestamp(),
          "user_id": FirebaseAuth.instance.currentUser!.uid,
      };

      FirebaseFirestore.instance
        .collection("Events")
        .doc(event_id)
        .collection("participants")
        .add(data)
      .then(
        (value) {
          setState(() {
            event['joined'] = true;
          });
          showToast(context, "You are added to the event");
        },
        onError: (e) {
          showToast(context, "Fail to join event");
          print("Error getting document: e");
        }
      ); 
      
    }
  }

  void checkAccessible() {
    
    if (event['joined'] == null) {
      print("still geting enrollment state");
      return;
    }
    if (event['joined'] == true) {
      print("user has join the event");
      return;
    }

    if (event['is_holder'] == true) {
      print("User is the event holder");
      return;
    }

    if (event['private']){
      if (code != event['invitation_code']) {
        Future.delayed(Duration.zero, () => showAlertDialog(context, "Private Event", "This is a private event. You need invitation code to view the event!", true));
      } else {
        showToast(context, "You are looking at private event");
      }
    }
  }

  void checkIsHolder(){
    if (globals.isLogged) {
      setState(() {
        event['is_holder'] = event['holder'] == FirebaseFirestore.instance.collection("Users").doc(FirebaseAuth.instance.currentUser!.uid);
      });
    } else {
       setState(() {
        event['is_holder'] = false;
      });
    }
   
    print("Check if is holder: ${event['is_holder']}");
  }

  void showToast(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg,
        textAlign: TextAlign.center,),
        duration: const Duration(milliseconds: 1500),
      )
    );
  }


}
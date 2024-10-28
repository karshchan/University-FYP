

import 'package:auto_size_text/auto_size_text.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:fyp_mobile/firebase.dart';
import 'package:fyp_mobile/globals.dart' as globals;
import "package:fyp_mobile/event_details.dart";
import "package:fyp_mobile/attendance_list.dart";

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:fyp_mobile/main.dart';
import 'package:intl/intl.dart';
import 'firebase_options.dart';


class HoldingEventPage extends StatefulWidget {
  

  HoldingEventPage({Key? key}) : super(key: key);

  @override
  State<HoldingEventPage> createState() => HoldingEventPageState();
}


class HoldingEventPageState extends  State<HoldingEventPage> {
  List results = [];

  @override
  void initState(){
    super.initState();
     WidgetsBinding.instance
    .addPostFrameCallback((_) {
      getHoldingEvents();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (results.isEmpty) {
      return Scaffold(
      resizeToAvoidBottomInset: false,
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: const AutoSizeText(
            'Joining Event',
            style: TextStyle(fontSize: 24),
            maxLines: 1,
            maxFontSize: 36,
            minFontSize: 12,
            overflow: TextOverflow.ellipsis,
          )//Text(widget.event['title']),
        ),
        body: SingleChildScrollView(
          child: Center(
            child: Container(
              margin: EdgeInsets.only(top: MediaQuery.of(context).size.height * 0.4),
              child: Text(
              "No Holding Event",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 32
              ),
              ),
            ),
          )
        ),
      );
    }
    return Scaffold(
      resizeToAvoidBottomInset: false,
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: const AutoSizeText(
            'Holding Event',
            style: TextStyle(fontSize: 24),
            maxLines: 1,
            maxFontSize: 36,
            minFontSize: 12,
            overflow: TextOverflow.ellipsis,
          )//Text(widget.event['title']),
        ),
        body: SingleChildScrollView(
          child: Column(
            children: [
               Container(
              width: double.infinity,
              margin: const EdgeInsets.all(20),
              child: ListView.builder(
                  shrinkWrap: true,
                  primary: false,
                  itemCount: results.length,
                  itemBuilder: (context, index) {

                    if (results.isNotEmpty) {
                      // print(results[index].runtimeType);
                      // print(results[index].runtimeType.toString() == '_JsonQueryDocumentSnapshot');
                      return InkWell(
                        onTap: () => goToDetails(results[index]),
                        child: Container(
                          width: double.infinity,
                          margin: const EdgeInsets.only(top: 10, bottom: 10),
                          padding: const EdgeInsets.all(10),
                          decoration: const BoxDecoration(
                              borderRadius:
                                  BorderRadius.all(Radius.circular(10)),
                              color: Colors.white,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black26,
                                  offset: Offset(2, 2),
                                  blurRadius: 10,
                                )
                              ]
                            ),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    flex: 1,
                                    child: AutoSizeText(
                                      results[index]['title'],
                                      style: const TextStyle(fontSize: 24),
                                      maxLines: 1,
                                      maxFontSize: 36,
                                      minFontSize: 12,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  )
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.all(15),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Expanded(
                                      flex: 1,
                                      child: AutoSizeText(
                                        results[index]['description'].replaceAll("<br/>", " "),
                                        style: const TextStyle(fontSize: 14),
                                        maxLines: 3,
                                        maxFontSize: 14,
                                        minFontSize: 14,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    )
                                  ],
                                ),
                              ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        "Due Date: ${DateFormat("yyyy-MM-dd HH:mm")
                                        .format(
                                          (results[index]['due_date'] as Timestamp)
                                          .toDate()
                                        )}",
                                        style: const TextStyle(
                                          fontSize: 12,
                                        ),
                                      ),
                                      Text(
                                        "Event Date: ${DateFormat("yyyy-MM-dd HH:mm")
                                        .format(
                                          (results[index]['event_date'] as Timestamp)
                                          .toDate()
                                        )}",
                                        style: const TextStyle(
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  )
                                ],
                              ),

                              Container(
                                margin: const EdgeInsets.only(top: 10),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.end,
                                      children: [
                                        checkIsHolder(results[index]) ?
                                        OutlinedButton(
                                          onPressed: (){
                                            goToAttendance(results[index]);
                                          },
                                          style: ElevatedButton.styleFrom(
                                            minimumSize: const Size(100, 40),
                                            padding: const EdgeInsets.symmetric(horizontal: 16),
                                            shape: const RoundedRectangleBorder(
                                              borderRadius: BorderRadius.all(Radius.circular(20)),
                                            ),
                                          ),
                                          child:  const Text(
                                            'Attendance',
                                            style: TextStyle(
                                              fontSize: 20,
                                            ),
                                          ),
                                        ) :
                                        OutlinedButton(
                                          onPressed: (){
                                            
                                          },
                                          style: ElevatedButton.styleFrom(
                                            minimumSize: const Size(100, 40),
                                            padding: const EdgeInsets.symmetric(horizontal: 16),
                                            shape: const RoundedRectangleBorder(
                                              borderRadius: BorderRadius.all(Radius.circular(20)),
                                            ),
                                          ),
                                          child:  const Text(
                                            'Withdrawal',
                                            style: TextStyle(
                                              fontSize: 20,
                                            ),
                                          ),
                                        )
                                      ],
                                    )
                                  ],
                                ),
                              )
                            ],
                          ),
                        )
                      );
                    } else {
                      print("Empty");
                      return Text("Empty");
                    }
                    
                  }
                ) 
              )
          ],),
        )
        
    );
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

  void getHoldingEvents() async {
    print("getting public events...");
    setState(() {
      results = [];
    });
    
    FirebaseFirestore.instance
    .collection("Events")
    .orderBy("due_date", descending: false)
    .orderBy("event_date", descending: false)
    .get()
    .then(
      (querySnapshot) {
        for (var doc in querySnapshot.docs) {
          var data = doc.data();
          if (data['holder'] == 
          FirebaseFirestore.instance.collection("Users")
          .doc(FirebaseAuth.instance.currentUser!.uid)) {
            setState(() {
              results.add(doc);
            });
          // } else {
          //   var event_id = doc.id;
          //   FirebaseFirestore.instance
          //   .collection("Events")
          //   .doc(event_id)
          //   .collection("participants")
          //   .where("user", 
          //     isEqualTo: FirebaseFirestore.instance.collection("Users")
          //     .doc(FirebaseAuth.instance.currentUser!.uid))
          //   .get()
          //   .then((participants) {
          //     if (participants.docs.isNotEmpty) {
          //       setState(() {
          //         results.add(doc);
          //       });
          //     }
          //   });

          }
        
        }
        print("${results.length} event(s) found.");
      },
      onError: (e) => print("Error getting document: $e"),
    );
  }

  void getJoiningEvents() async {
    print("getting public events...");
    setState(() {
      results = [];
    });
    
    FirebaseFirestore.instance
    .collection("Events")
    .orderBy("due_date", descending: false)
    .orderBy("event_date", descending: false)
    .get()
    .then(
      (querySnapshot) {
        for (var doc in querySnapshot.docs) {
          var event_id = doc.id;
          FirebaseFirestore.instance
          .collection("Events")
          .doc(event_id)
          .collection("participants")
          .where("user", 
            isEqualTo: FirebaseFirestore.instance.collection("Users")
            .doc(FirebaseAuth.instance.currentUser!.uid))
          .get()
          .then((participants) {
            if (participants.docs.isNotEmpty) {
              setState(() {
                results.add(doc);
              });
            }
          });
        }
        print("${results.length} event(s) found.");
      },
      onError: (e) => print("Error getting document: $e"),
    );
  }

 void goToDetails(event) {
    bool logged = globals.isLogged;
    print("before : $logged");
    Navigator.push(context,
      MaterialPageRoute(builder: (context) => EventDetails(event: event,)))
      .then((value) {
         print("after : $logged");
        if (logged == false && globals.isLogged) {
          runApp(const MaterialApp(
            home: app(),
          ));
        }
      });
  }

  void goToAttendance(event) {
    Navigator.push(context,
      MaterialPageRoute(builder: (context) => AttendanceListPage(event: event,)));
  }

  bool checkIsHolder(event){
    if (globals.isLogged) {
      return event.data()['holder'] == FirebaseFirestore.instance.collection("Users").doc(FirebaseAuth.instance.currentUser!.uid);
    } else {
      return false;
    }
   
  }

  void showWithdrawalConfirmDialog(BuildContext context, Map<String, dynamic> event) {
    // set up the button
    Widget yesButton = TextButton(
      child: Text("Yes"),
      onPressed: () {
        print(event);
        withdrawFromEvent(event);
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
      content: Text("Are you trying to withdraw from the event?\nYou can join it back later."),
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

  void withdrawFromEvent(Map<String, dynamic> event) {
    print(event);
  }

}



import 'package:auto_size_text/auto_size_text.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:fyp_mobile/firebase.dart';
import 'package:fyp_mobile/globals.dart' as globals;
import "package:fyp_mobile/event_details.dart";

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:fyp_mobile/main.dart';
import 'package:intl/intl.dart';
import 'firebase_options.dart';


class AttendanceListPage extends StatefulWidget {
  dynamic event;

  AttendanceListPage({Key? key, required this.event}) : super(key: key);

  @override
  State<AttendanceListPage> createState() => AttendanceListPageState();
}


class AttendanceListPageState extends  State<AttendanceListPage> {
  late var event;
  late var event_id;
  List participants = [];
  int has_record = 0;

  @override
  void initState(){
    super.initState();
    event = widget.event.data();
    event_id = widget.event.id;
    WidgetsBinding.instance
    .addPostFrameCallback((_) {
      if (!checkIsHolder(widget.event)) {
        print("not holder");
        showAlertDialog(context, "Invalid Access", "You are not the holder of event", true);
      } else {
        print("is holder");
        getParticipants();
      }
      
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
        appBar: AppBar(
          automaticallyImplyLeading: true,
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: const AutoSizeText(
            'Attendance List',
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
                    padding: const EdgeInsets.all(30),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                'Event Title:'.padRight(17,' ') + event['title'],
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
                                'Due Date:'.padRight(16,' ') + DateFormat("yyyy-MM-dd HH:mm")
                                .format(
                                  (event['due_date'] as Timestamp)
                                  .toDate()
                                ),
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
                                'Event Date:'.padRight(15,' ') + DateFormat("yyyy-MM-dd HH:mm")
                                .format(
                                  (event['event_date'] as Timestamp)
                                  .toDate()
                                ),
                                style:  TextStyle(
                                  fontSize: 18,
                                )
                              )
                            ),
                          ],
                        ),

                        event['private'] != "" ? 
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                'Nature:'.padRight(18,' ') + "Private",
                                textAlign: TextAlign.right,
                                style:  TextStyle(
                                  fontSize: 18,
                                )
                              )
                            ),
                          ],
                        ): Row(
                          children: [
                            Flexible(
                              child: Text(
                                'Nature:'.padRight(18,' ') + "Public",
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
                                'Pariticipants:'.padRight(15,' ') + participants.length.toString(),
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
                                'Attendance Rate:'.padRight(18,' ') + "$has_record/${participants.length} ~ ${has_record==0? 0 : (has_record/participants.length*100).toStringAsFixed(2)}%",
                                textAlign: TextAlign.right,
                                style:  TextStyle(
                                  fontSize: 18,
                                )
                              )
                            ),
                          ],
                        ),

                        Table(
                          border: TableBorder.all(color: Colors.black),
                          columnWidths: {
                            0: FlexColumnWidth(0.3),
                            1: FlexColumnWidth(1),
                            2: FlexColumnWidth(1)
                          },
                          children: [
                            TableRow(
                              children: [
                                Container(
                                  margin: EdgeInsets.all(5),
                                  child: Text(
                                    "No."
                                    ,textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Container(
                                  margin: EdgeInsets.all(5),
                                  child: Text(
                                    "Name"
                                    ,textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Container(
                                  margin: EdgeInsets.all(5),
                                  child: Text(
                                    "Attendance"
                                    ,textAlign: TextAlign.center,
                                    style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ]
                            ),
                            for (var pariticipant in participants)
                            TableRow(
                              children: [
                                Container(
                                  margin: EdgeInsets.all(5),
                                  child: Text((participants.indexOf(pariticipant) + 1).toString()
                                  ,textAlign: TextAlign.center,),
                                ),
                                Container(
                                  margin: EdgeInsets.all(5),
                                  child: Text(pariticipant["first_name"] + " " + pariticipant['last_name']
                                  ,textAlign: TextAlign.center,),
                                ),
                                Container(
                                  margin: EdgeInsets.all(5),
                                  child: pariticipant['arrival_time'].seconds == 0 ?
                                    Text("NA"
                                    ,textAlign: TextAlign.center,) :
                                    Text(DateFormat("yyyy-MM-dd HH:mm")
                                      .format(
                                        (pariticipant['arrival_time'] as Timestamp)
                                        .toDate()
                                      )
                                      ,textAlign: TextAlign.center,),
                              ),
                              ]
                            )
                          ],
                        )


                      ],
                    ),
                  ),
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

  void getParticipants() async {
    print("getting participants...");
    setState(() {
      participants = [];
    });
    
    FirebaseFirestore.instance
    .collection("Events")
    .doc(event_id)
    .collection("participants")
    .orderBy("arrival_time", descending: false)
    .get()
    .then(
      (querySnapshot) {
        for (var doc in querySnapshot.docs) {
          var data = doc.data();
          data['user']
          .get()
          .then((user_info) {
            user_info = user_info.data();
            //print(participants['arrival_time']);
            data['first_name'] = user_info['first_name'];
            data['last_name'] = user_info['last_name'];
            setState(() {
              participants.add(data);
            });
          });
        }
        print("${participants.length} participants(s) found.");
      },
      onError: (e) => print("Error getting document: $e"),
    );
  }


  bool checkIsHolder(event){
    if (globals.isLogged) {
      return event.data()['holder'] == FirebaseFirestore.instance.collection("Users").doc(FirebaseAuth.instance.currentUser!.uid);
    } else {
      return false;
    }
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

}

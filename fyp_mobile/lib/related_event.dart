

import 'package:auto_size_text/auto_size_text.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:fyp_mobile/firebase.dart';
import 'package:fyp_mobile/globals.dart' as globals;
import "package:fyp_mobile/event_details.dart";
import "package:fyp_mobile/holding_event.dart";
import "package:fyp_mobile/joining_event.dart";

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:fyp_mobile/main.dart';
import 'package:intl/intl.dart';
import 'firebase_options.dart';


class RelatedEvent extends StatelessWidget {
  const RelatedEvent({super.key});
  @override
  Widget build(BuildContext context) {
    return  DefaultTabController(
          length: 2,
          child: Scaffold(

            bottomNavigationBar: menu(),
            body: TabBarView(
              children: [
                HoldingEventPage(),
                JoiningEventPage()
              ],
            ),
          ),
        );

  }

   Widget menu() {
    return Container(
      height: 70,
      child:  TabBar(
        labelColor: Colors.deepPurple,
        unselectedLabelColor:  Colors.grey,
        indicatorSize: TabBarIndicatorSize.tab,
        indicatorPadding: EdgeInsets.all(5.0),
        indicatorColor: Colors.deepPurple,
        tabs: [
          const Tab(
            text: "Holding",
            icon: Icon(Icons.event),
            
          ),
          const Tab(
            text: "Joined",
            icon: Icon(Icons.event_note),
          ) 
        ,],
      ),
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
    );
  }
}

class RelatedEventPage extends StatefulWidget {
  

  RelatedEventPage({Key? key}) : super(key: key);

  @override
  State<RelatedEventPage> createState() => RelatedEventPageState();
}


class RelatedEventPageState extends  State<RelatedEventPage> {
  List results = [];

  @override
  void initState(){
    super.initState();
    //  WidgetsBinding.instance
    // .addPostFrameCallback((_) {
    //   getHoldingEvents();
    // });
  }

  @override
  Widget build(BuildContext context) {
    if (results.isEmpty) {
      return const SizedBox();
    }
    return Scaffold(
      resizeToAvoidBottomInset: false,
        appBar: AppBar(
          automaticallyImplyLeading: true,
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: const AutoSizeText(
            'Related Event',
            style: TextStyle(fontSize: 24),
            maxLines: 1,
            maxFontSize: 36,
            minFontSize: 12,
            overflow: TextOverflow.ellipsis,
          )//Text(widget.event['title']),
        ),
        body: SingleChildScrollView(
         child: SizedBox(),
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

  bool checkIsHolder(event){
    if (globals.isLogged) {
      return event.data()['holder'] == FirebaseFirestore.instance.collection("Users").doc(FirebaseAuth.instance.currentUser!.uid);
    } else {
      return false;
    }
   
  }

}

import 'package:auto_size_text/auto_size_text.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:fyp_mobile/qr_scanner.dart';
import 'package:fyp_mobile/firebase.dart';
import 'package:fyp_mobile/event_details.dart';
import 'package:fyp_mobile/login_page.dart';
import "package:fyp_mobile/profile_page.dart";
import 'package:fyp_mobile/globals.dart' as globals;
import "package:fyp_mobile/qr_scanner.dart";

import 'package:firebase_core/firebase_core.dart';
import 'package:intl/intl.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const MaterialApp(
    home: app(),
  ));
}


class app extends StatelessWidget {
  const app({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Public Event",
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: DefaultTabController(
          length: 2,
          child: Scaffold(

            bottomNavigationBar: menu(),
            body: TabBarView(
              children: [
                const HomePage(),
                globals.isLogged? ProfilePage() : LoginPage(),
              ],
            ),
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
            text: "Events",
            icon: Icon(Icons.list),
            
          ),
          globals.isLogged ? 
            const Tab(
              text: "Profile",
              icon: Icon(Icons.person),
            ) :
            const Tab(
              text: "Login",
              icon: Icon(Icons.login),
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



class HomePage extends StatefulWidget {
  const HomePage({super.key});
  // const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  TextEditingController searchController = TextEditingController();
  TextEditingController URLSearchController = TextEditingController();
  List results = [];
  
  @override
  void initState() {
    getPublicEvent();
    super.initState();
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
            child: Column(
                children: [
                  Container(
                margin: const EdgeInsets.all(20),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: searchController,
                              decoration: InputDecoration(
                                hintText: "Search", labelText: "Keywords",
                                suffixIcon: IconButton(
                                  onPressed: getPublicEvent,
                                  icon: const Icon(Icons.clear),
                                ),
                              ),
                                  
                              onChanged: (keywords) => onTextChange(keywords),
                            ),
                          ),
                          TextButton(
                              onPressed: searchPublicEventsByKeywords,
                              child: const Icon(Icons.search)),
                          TextButton(
                            onPressed: openScanner,
                            child: const Icon(Icons.qr_code_scanner)),
                          TextButton(
                            onPressed: () => showURLSearchDialog(context),
                            child: const Icon(Icons.link)),
                              ],
                            ),
                          ],
                        ),
                    ),
                  Container(
                    margin: EdgeInsets.only(top: MediaQuery.of(context).size.height * 0.2),
                    child: Text(
                      "No Public Event",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 32
                      ),
                    ),
                    )
                ]
              )
            ),
          )
      );
    }

    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: Text("Public Events"),
        ),
        body: SingleChildScrollView(
          child: Column(
            children: [
               Container(
                margin: const EdgeInsets.all(20),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: searchController,
                              decoration: InputDecoration(
                                hintText: "Search", labelText: "Keywords",
                                suffixIcon: IconButton(
                                  onPressed: getPublicEvent,
                                  icon: const Icon(Icons.clear),
                                ),
                              ),
                                  
                              onChanged: (keywords) => onTextChange(keywords),
                            ),
                          ),
                          TextButton(
                              onPressed: searchPublicEventsByKeywords,
                              child: const Icon(Icons.search)),
                          TextButton(
                            onPressed: openScanner,
                            child: const Icon(Icons.qr_code_scanner)),
                          TextButton(
                            onPressed: () => showURLSearchDialog(context),
                            child: const Icon(Icons.link)),
                        ],
                      ),
                    ],
                  ),
               ),
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

  void searchPublicEventsByKeywords() async {
    print("searchPublicEventsByKeywords");
    var db = FirebaseFirestore.instance;
    var keywords = searchController.text.toLowerCase();
    print("Keyword: $keywords");
    if (keywords == "") {
      return;
    }
    setState(() {
      results = [];
    });

    db.collection("Events")
    .where("private", isEqualTo: false)
    .where("due_date", isGreaterThan: Timestamp.now().toDate())
    .orderBy("due_date", descending: false)
    .orderBy("event_date", descending: false)
    .get()
    .then(
      (querySnapshot) {
        for (var doc in querySnapshot.docs) {
          if (doc['title'].toLowerCase().contains(keywords)) {
            setState(() {
              results.add(doc);
            });
            continue;
          }
          if (doc['description'].toLowerCase().contains(keywords)) {
            setState(() {
              results.add(doc);
            });
            continue;
          }
        }
        print(results);
      },
        onError: (e) => print("Error getting document: $e"),
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

  void getPublicEvent() async {
    print("getting public events...");
    searchController.text = "";
    setState(() {
      results = [];
    });
    
    FirebaseFirestore.instance
    .collection("Events")
    .where("private", isEqualTo: false)
    .where("due_date", isGreaterThan: Timestamp.now().toDate())
    .orderBy("due_date", descending: false)
    .orderBy("event_date", descending: false)
    .get()
    .then(
      (querySnapshot) {
        for (var doc in querySnapshot.docs) {
          // print(doc.data()['due_date'].seconds > Timestamp.now().seconds);
          setState(() {
            results.add(doc);
          });
        }
        print("${results.length} event(s) found.");
      },
      onError: (e) => print("Error getting document: $e"),
    );
 }

  void onTextChange(keywords) {
    print("onTextChange");
    if (keywords.isEmpty) {
      getPublicEvent();
    }
 }

  void openScanner() {
    Navigator.push(context,
        MaterialPageRoute(builder: (context) => const QRCodeScanner()))
        .then((value) => {
          runApp(const MaterialApp(
            home: app(),
          ))
        });
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

    void showURLSearchDialog(BuildContext context) {
    // set up the button
    Widget yesButton = TextButton(
      child: Text("Search"),
      onPressed: () {
        if (URLSearchController.text.isEmpty) {
          showToast(context, "Empty URL");
          return;
        } else {
          var uri = Uri.parse(URLSearchController.text);
          var path = uri.path;
          print("uri: $uri");
          if (path == "/eventDetails.html") {
            var event_id = uri.queryParameters['event_id'];
            var code = uri.queryParameters['code'];
            FirebaseFirestore.instance
            .collection("Events")
            .doc(event_id)
            .get()
            .then((snapshot) async{
              if (snapshot.exists) {
                showToast(context, "Redirecting to event");
                print(snapshot['invitation_code']);
                final result = await Navigator.push(context,
                  MaterialPageRoute(builder: (context) => EventDetails(event: snapshot, invitation_code: code ?? "",)))
                  .then((value) {
                    runApp(const MaterialApp(
                      home: app(),
                    ));
                  });
              } else {
                showToast(context, "Event not found");
              }
            },
              onError: (e) => {
                showToast(context, "Error in connection")
              }
            );
          }
        }
        URLSearchController.clear();
        Navigator.of(context, rootNavigator: true).pop();
      },
    );

     Widget noButton = TextButton(
      child: Text("Cancel"),
      onPressed: () {
        URLSearchController.clear();
        Navigator.of(context, rootNavigator: true).pop();
      },
    );

    Widget textField = TextField(
      controller: URLSearchController,
      decoration: InputDecoration(
        hintText: "Paste event url", labelText: "URL",
        suffixIcon: IconButton(
          onPressed: (){
            URLSearchController.clear();
          },
          icon: const Icon(Icons.clear),
        ),
      ),

    );

    // set up the AlertDialog
    AlertDialog alert = AlertDialog(
      backgroundColor: Colors.white,
      title: Text("Search Event By URL"),
      content: Text("Paste the url here to search for event."),
      actions: [
        textField,
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            yesButton,
            noButton
          ],
        )
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

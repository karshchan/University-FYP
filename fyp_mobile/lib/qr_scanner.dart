import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
// import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import "package:fyp_mobile/event_details.dart";
import "package:fyp_mobile/login_page.dart";
import 'package:fyp_mobile/globals.dart' as globals;



class QRCodeScanner extends StatefulWidget {

  const QRCodeScanner({Key? key}) : super(key: key);

  @override
  State<QRCodeScanner> createState() => QRCodeScannerState();
} 

class QRCodeScannerState extends State<QRCodeScanner> {
  final GlobalKey qrKey = GlobalKey(debugLabel: "QR");
  QRViewController? controller;
  Barcode? barcode;
  bool redirected = false;
  bool event_searched = false;

  bool recordAttendance = false;
  bool attendance_error = false;
  bool joined_event = true;

  List event = [];

  
  @override
  void dispose(){
    controller?.dispose();
    super.dispose();
  }

  @override
  void reassemble() async {
    super.reassemble();
    if (Platform.isAndroid){
      await controller!.pauseCamera();
    }

    controller!.resumeCamera();
  }

  void onQRViewCreated(QRViewController controller){
    setState(() {
      this.controller = controller;
    });
    controller.scannedDataStream.listen((barcode) async {
      setState(() {
        this.barcode = barcode;
      });

      

      if (this.barcode != null) {
        var code = this.barcode!.code;

        if (code != null) {
          var uri = Uri.parse(code);
          var path = uri.path;
          print(uri);

          if (path == "/eventDetails.html") {
            
            var event_id = uri.queryParameters['event_id'];
            var code = uri.queryParameters['code'];
            if (redirected) {
              return;
            }
            getEventById(event_id);
            if (event.isNotEmpty && event_searched) {
              redirected = true;
              showToast(context, "Redirecting to event");
              final result = await Navigator.push(context,
                MaterialPageRoute(builder: (context) => EventDetails(event: event[0], invitation_code: event[0].data()['invitation_code'],)))
                .then((value) {
                  setState(() {
                    redirected = false;
                    event.clear();
                  });
                  
                });
                if (Navigator.canPop(context)) {
                  Navigator.pop(context);
                }
            } else if (event.isEmpty && event_searched){
              showToast(context, "Event not found");
            }

          } else if (path == "/handleAttendance.html") {
            // if (!globals.checkLogged()) {
            //   showToast(context, "You need to login to take attendance");
            //   return;
            // }
            // if (!joined_event) {
            //    showToast(context, "You didn't join this event");
            //    return;
            // }

            // if (recordAttendance && !attendance_error) {
            //   showToast(context, "You have already take the attendance");
            //   return;
            // } 

            // if (!recordAttendance && attendance_error) {
            //   showToast(context, "Fail to take attendance. Please find helper");
            //   return;
            // }
            var event_id = uri.queryParameters['event_id'];
            print("taking attendance: ${event_id}");
            takeAttendance(event_id);
          }
        }
      }
    });

    controller.pauseCamera();
    controller.resumeCamera();
  }
  

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("QR Code Scanner"),
      ),
      body: Column(
        children: [
          Expanded(
            flex: 5,
            child: QRView(
              key: qrKey,
              onQRViewCreated: onQRViewCreated,
              overlay: QrScannerOverlayShape(
                cutOutSize: MediaQuery.of(context).size.width * 0.6,
                borderWidth: 10,
                borderLength: 20,
                borderRadius: 10,
                borderColor: Colors.white
              ),
            ),
          ),
        ],
      )
    );
  }

   void getEventById(event_id) async {
    FirebaseFirestore.instance
      .collection("Events")
      .doc(event_id)
      .get()
      .then((snapshot) {
        if (snapshot.exists) {
          setState(() {
            event.add(snapshot);
            event_searched = true;
          });
        } else {
          setState(() {
            event_searched = true;
          });
        }
      },
        onError: (e) => {setState(() {
          event_searched = true;
        })}
      );
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

  void takeAttendance(event_id) async{
    if (FirebaseAuth.instance.currentUser == null) {
      print("~~~~~~~~~~~~required login");
      Navigator.push(context,
        MaterialPageRoute(builder: (context) => LoginPage()))
        .then((value) {
          if (FirebaseAuth.instance.currentUser != null) {
            FirebaseFirestore.instance
                .collection("Events")
                .doc(event_id)
                .collection("participants")
                .where("user", isEqualTo: FirebaseFirestore.instance.collection("Users").doc(FirebaseAuth.instance.currentUser!.uid))
                .get()
                .then((own_record) {
                  if (own_record.docs.isNotEmpty) {
                    var participant_record = own_record.docs[0].data();
                    var participant_id = own_record.docs[0].id;

                    if (participant_record['arrival_time'].seconds > 0) {
                      showToast(context, "You have already take the attendance");
                      recordAttendance = true;
                      if (Navigator.canPop(context)) {
                        Navigator.pop(context);
                      }
                      return;
                    }

                    var data = {
                      "arrival_time" : FieldValue.serverTimestamp()
                    };

                    FirebaseFirestore.instance
                    .collection("Events")
                    .doc(event_id)
                    .collection("participants")
                    .doc(participant_id)
                    .update(data)
                    .then((value) {
                      showToast(context, "You have take the attendance");
                      recordAttendance = true;
                      if (Navigator.canPop(context)) {
                        Navigator.pop(context);
                      }
                    },
                    onError: (e) {
                      showToast(context, "Fail to take attendance. Please find helper");
                      attendance_error = true;
                    }  
                    );
                  } else {
                    showToast(context, "You didn't join this event");
                  }
                });
          } else { 
            showToast(context, "You need to login before take the attendance");
            joined_event = false;
          }
        });
    } else {
      print("~~~~~~~~~~~~logged");
      FirebaseFirestore.instance
      .collection("Events")
      .doc(event_id)
      .collection("participants")
      .where("user", isEqualTo: FirebaseFirestore.instance.collection("Users").doc(FirebaseAuth.instance.currentUser!.uid))
      .get()
      .then((own_record) {
        if (own_record.docs.isNotEmpty) {
          var participant_record = own_record.docs[0].data();
          var participant_id = own_record.docs[0].id;

          if (participant_record['arrival_time'].seconds > 0) {
            showToast(context, "You have already take the attendance");
            recordAttendance = true;
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            }
            print("~~~~~~~~~~~~taked");
            return;
          }

          var data = {
            "arrival_time" : FieldValue.serverTimestamp()
          };

          FirebaseFirestore.instance
          .collection("Events")
          .doc(event_id)
          .collection("participants")
          .doc(participant_id)
          .update(data)
          .then((value) {
            showToast(context, "You have take the attendance");
            recordAttendance = true;
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            }
          },
          onError: (e) {
            showToast(context, "Fail to take attendance. Please find helper");
            attendance_error = true;
          }  
          );
        } else {
          showToast(context, "You didn't join this event");
          joined_event = false;
        }
      });
    } 
    
  }
    



}


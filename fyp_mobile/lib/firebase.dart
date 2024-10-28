import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
// ...

// Future<void> getPublicEvent() async {
//   await Firebase.initializeApp(
//     options: DefaultFirebaseOptions.currentPlatform,
//   );
// }

void getPublicEvent() async {
  var db = FirebaseFirestore.instance;

  // await db.collection("Users").get().then((doc) {
  //   for (var doc in doc.docs) {
  //     print("${doc.id} => ${doc.data()}");
  //   }
  // });

  db.collection("Events").where("private", isEqualTo: false).get().then(
    (querySnapshot) {
      print("~~~~~~~~~~~~~~${querySnapshot.docs.length}");
      for (var doc in querySnapshot.docs) {
        print("${doc.id} => ${doc.data()}");
      }
      return querySnapshot;
      // ...
    },
    onError: (e) => print("Error getting document: $e"),
  );

}

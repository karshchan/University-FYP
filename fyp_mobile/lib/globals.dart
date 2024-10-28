library my_prj.globals;
import 'package:firebase_auth/firebase_auth.dart';

bool isLogged = FirebaseAuth.instance.currentUser != null;

bool checkLogged () {
  return FirebaseAuth.instance.currentUser != null;
}
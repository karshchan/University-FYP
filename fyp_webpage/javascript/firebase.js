
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { deleteDoc, updateDoc , getFirestore, collection, getDocs, serverTimestamp, query, where, orderBy, getDoc, connectFirestoreEmulator, setDoc, doc, addDoc, collectionGroup, documentId} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { sendPasswordResetEmail ,updatePassword , EmailAuthProvider,reauthenticateWithCredential , verifyBeforeUpdateEmail , getAuth, signOut ,onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { config } from "../javascript/config";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

let firebaseConfig = {
    apiKey: "AIzaSyB8apFji3Q2zH30jZBKzOLU-E_Qw20rLNc",
    authDomain: "fyp-22205349.firebaseapp.com",
    projectId: "fyp-22205349",
    storageBucket: "fyp-22205349.appspot.com",
    messagingSenderId: "533140308687",
    appId: "1:533140308687:web:3686b2a74cc0f3f11b2dba"
}


// Initialize Firebase
function InitializeServices() {
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, db, auth };
}

//const user_collection = collection(db, 'Users');
//const snapshot = await getDocs(user_collection);

function register( ) {
    const first_name = document.querySelector("#first-name").value;
    const last_name = document.querySelector("#last-name").value;
    const company_name = document.querySelector("#company-name").value;
    const company_address = document.querySelector("#company-address").value;
    const contact = document.querySelector("#contact").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const personal = document.querySelector("#personal").checked;

    const service = InitializeServices();

    createUserWithEmailAndPassword(service.auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        const docRef = doc(service.db, "Users", user.uid);
        const user_info = {
            first_name : first_name,
            last_name : last_name,
            organization : company_name,
            organization_address : company_address,
            email : email,
            contact : contact,
            password : password,
            personal : personal
        }
        setDoc(docRef, user_info)
        .then(() => {
            window.location = "../publicEventList.html"
        })
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode );
        console.log(errorMessage)
    })
}

function updateUserProfile() {
    const first_name = document.querySelector("#first-name").value;
    const last_name = document.querySelector("#last-name").value;
    const company_name = document.querySelector("#company-name").value;
    const company_address = document.querySelector("#company-address").value;
    const contact = document.querySelector("#contact").value;
    const personal = document.querySelector("#personal").checked;

    const service = InitializeServices();

    onAuthStateChanged(service.auth, user => {
        const docRef = doc(service.db, "Users", user.uid);
        const user_info = {
            first_name : first_name,
            last_name : last_name,
            organization : company_name,
            organization_address : company_address,
            contact : contact,
            personal : personal
        }

        updateDoc(docRef, user_info)
        .then(() => {

            if(!alert("Profile information updated!")) {
                window.location = "../profilePage.html"
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode );
            console.log(errorMessage)
            if (!alert(error)) {
                window.location = "../errorPage.html"
            }
        })
    })
}

function updateEmail() {
    const email = document.querySelector("#email").value;
    const new_email = document.querySelector("#new-email").value;

    const service = InitializeServices();

    onAuthStateChanged(service.auth, user => {

        if (email.trim() != user.email) {
            alert("Old email is not correct!")
            return
        }

        if (email.trim() == new_email.trim()) {
            alert("The new email is same as the old one.\n Update will not be operate.")
            return
        }

        getLocalUser()
        .then((local)=> {
            const credential = EmailAuthProvider.credential(
                user.email,
                local.password
            )
    
            reauthenticateWithCredential(user, credential).then(() => {
                
                verifyBeforeUpdateEmail(user, new_email)
                .then(() => {
                    if(!alert("Please go to check your email to verify before update!")) {
                        window.location = "../signIn.html"
                    }
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode );
                    console.log(errorMessage)
                    if (!alert(error)) {
                        window.location = "../errorPage.html"
                    }
                })
              }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode );
                console.log(errorMessage)
                if (!alert(error)) {
                    window.location = "../errorPage.html"
                }
            })
        })
        

    })
}

function updatePw() {
    let new_password = document.querySelector("#password").value
    let old_password = document.querySelector("#old-password").value
    if (new_password == old_password) {
        window.alert("New password is same as the old one!")
        return
    }
    const service = InitializeServices();

    onAuthStateChanged(service.auth, user => {
        const credential = EmailAuthProvider.credential(
            user.email,
            old_password
        )

        reauthenticateWithCredential(user, credential).then(() => {
            
            updatePassword(user, new_password)
            .then(() => {
                const userRef = doc(service.db, "Users", user.uid)
                const info = {
                    password: new_password
                }
                updateDoc(userRef, info)
                .then(()=> {
                    if(!alert("Password updated!")) {
                        window.location = "../profilePage.html"
                    }
                })
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode );
                console.log(errorMessage)
            })
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode );
            console.log(errorMessage)
            if (errorMessage == "Firebase: Error (auth/invalid-credential).") {
                alert("Invalid Old Password!")
            }
        }) 
    })
}

function signIn() {
    return new Promise((resolve, reject) => {
        
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        const service = InitializeServices();

        signInWithEmailAndPassword(service.auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("You are signed in.")
            syncEmail()
            .then(()=> {
                syncPassword(password)
                .then(()=> {
                    resolve(service.auth.currentUser.uid)
                })
            })
            

        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode );
            console.log(errorMessage)
            window.localStorage
            reject()
            //window.location = "../errorPage.html"
        })
    })
}

function sign_out() {

    const service = InitializeServices();
    signOut(service.auth)
    .then(() => {
        const user = null;
        alert("You have signed out.")
        window.location = "../index.html"
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode );
        console.log(errorMessage)
        alert("Failed to sign out.")
        window.location = "../errorPage.html"
    })
}


function checkSigned() {
    return localStorage.getItem("fyp-signIn")
}



function createEvent() {
    const service = InitializeServices();

    onAuthStateChanged(service.auth, user => {
        const title = document.querySelector("#title").value
        const is_private = document.querySelector("#private").checked
        const description = document.querySelector("#description").value.replaceAll("\n", "<br/>")
        const use_email = document.querySelector("#use-email").checked
        const use_contact = document.querySelector("#use-contact").checked
        const email = document.querySelector("#email").value
        const contact = document.querySelector("#contact").value
        const datetime = document.querySelector("#datetime").value
        const due_date = document.querySelector("#due-date").value
    
        const docRef = collection(service.db, "Events");
    
        const event_info = {
            title : title,
            private : is_private,
            description : description,
            email : email,
            contact : contact,
            use_email : use_email,
            use_contact : use_contact,
            event_date : new Date(datetime),
            due_date : new Date(due_date),
            create_at : serverTimestamp(),
            holder : doc(service.db, "Users/"+user.uid),
            invitation_code: generateInvitationCode()
        }
    
        
        addDoc(docRef, event_info)
        .then((result) => {
            alert("Event has been created!")
            return result
        })
        .then((result) => {
            window.location = "../eventDetails.html?event_id="+result.id
        })
    })
}

function updateEvent(event_id) {
    const service = InitializeServices();

    const title = document.querySelector("#title").value
    const is_private = document.querySelector("#private").checked
    const description = document.querySelector("#description").value.replaceAll("\n", "<br/>")
    const use_email = document.querySelector("#use-email").checked
    const use_contact = document.querySelector("#use-contact").checked
    const email = document.querySelector("#email").value
    const contact = document.querySelector("#contact").value
    const datetime = document.querySelector("#datetime").value
    const due_date = document.querySelector("#due-date").value

    const docRef = doc(service.db, "Events", event_id);

    const event_info = {
        title : title,
        private : is_private,
        description : description,
        email : email,
        contact : contact,
        use_email : use_email,
        use_contact : use_contact,
        event_date : new Date(datetime),
        due_date : new Date(due_date),
        create_at : serverTimestamp(),
        holder : doc(service.db, "Users/"+service.auth.currentUser.uid),
    }
    updateDoc(docRef, event_info)
    .then(() => {
        alert("Event has been updated!")
    })
    .then(() => {
        window.location = "../eventDetails.html?event_id="+event_id
    })
}

function updateAttendance(event_id, user_id, timestamp=serverTimestamp()) {
    return new Promise((resolve , reject) => {
        const service = InitializeServices();
        onAuthStateChanged(service.auth, async user => {
            if (user) {
                if (user.uid != user_id) {
                    const eventRef = collection(service.db, "Events")
                    const localUserRef = doc(service.db, "Users", user.uid)
                    const q = query(eventRef, where("holder", "==", localUserRef), where(documentId(), "==", event_id))
                    getDocs(q)
                    .then(snapshot => {
                        if (snapshotToJSON(snapshot).length <= 0) {
                            reject("equal")
                        }
                    })
                }
                const participantsRef = collection(service.db, "Events/" + event_id + "/participants");
                const userRef = doc(service.db, "Users", user_id)
                const q1 = query(participantsRef, where("user", "==", userRef))
            
                const participant = snapshotToJSON(await getDocs(q1))[0]
    
                
                if (!participant) {
                    reject("join")
                }

                if (participant.arrival_time.seconds != 0) {
                    reject("redundant")
                }
            
                const event_info = {
                    arrival_time : timestamp
                }
                const participantDoc = doc(service.db, "Events/" + event_id + "/participants", participant.id)
                updateDoc(participantDoc, event_info)
                .then(() => {
                    alert("Your attendance is updated")
                })
                .then(() => {
                    resolve()
                })
                .catch(error => {
                    console.log(error.code)
                    console.log(error.message)
                    reject(error)
                })
    
        
            } else {
                reject("signIn")
            }
        })
    })
    
}

function updateAttendanceByHolder(event_id, pariticipant_id, timestamp=serverTimestamp()) {
    return new Promise((resolve , reject) => {
        const service = InitializeServices();
        onAuthStateChanged(service.auth, async user => {
            if (user) {

                const event_info = {
                    arrival_time : new Date(timestamp)
                }
                const participantDoc = doc(service.db, "Events/" + event_id + "/participants", pariticipant_id)
                updateDoc(participantDoc, event_info)
                .then(() => {
                    alert("Attendance record is updated")
                })
                .then(() => {
                    resolve()
                })
                .catch(error => {
                    console.log(error.code)
                    console.log(error.message)
                    reject(error)
                })
    
        
            } else {
                reject("signIn")
            }
        })
    })
    
}


function deleteEvent(event_id) {
    const service = InitializeServices();

    const docRef = doc(service.db, "Events", event_id);

    const participantsRef = collection(service.db, "Events/"+event_id+"/participants")
    getDocs(participantsRef)
    .then((snapshot) => {
        snapshot.docs.forEach(doc_ => {
            const participantDoc = doc(service.db, "Events/"+event_id+"/participants", doc_.id)
            deleteDoc(participantDoc)
        })
    })
    .then(() => {
        deleteDoc(docRef)
        .then(() => {
            alert("Event has been deleted!")
        })
        .then(() => {
            window.location.reload()
        })
    })
}

async function withdrawEventByUser(event_id) {
    const service = InitializeServices();
    
    onAuthStateChanged(service.auth, async user => {
        if (user) {
            const participantsRef = collection(service.db, "Events/"+event_id+"/participants");
            const userRef = doc(service.db, "Users", user.uid)
        
            const q1 =  query(participantsRef, where("user", "==", userRef))
            const participant = snapshotToJSON(await getDocs(q1))[0]
            

            const participantDoc = doc(service.db, "Events/"+event_id+"/participants", participant.id);

            deleteDoc(participantDoc)
            .then(() => {
                alert("You have withdraw from the event!")
            })
            .then(() => {
                window.location.reload()
            })

        }
    })
}

async function withdrawAllParticipants(event_id, selected) {
    return new Promise((resolve, reject) => {
        const service = InitializeServices();
    
        onAuthStateChanged(service.auth, async user => {
            if (user) {
                try {
                    selected.forEach(id => {
                        const participantDoc = doc(service.db, "Events/"+event_id+"/participants", id.value);
                            deleteDoc(participantDoc)
                            .then(() => {
                                resolve(true)
                            })
        
                    })
                } catch(error) {
                    reject(error)
                }
            }
        })
    })
}

function formatedDate(timestamp) {
    const date =  new Date(timestamp.seconds * 1000)
    return date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+date.getDate().toString().padStart(2,"0")+" "+date.getHours().toString().padStart(2,"0")+":"+date.getMinutes().toString().padStart(2,"0")
}

function snapshotToJSON(snapshot) {
    if (typeof(snapshot.data) != "undefined") {
        let result = snapshot.data()
        result['id'] = snapshot.id
        return result
    } else {
        return snapshot.docs.map(doc => {
            let result = doc.data()
            result['id'] = doc.id
            return result
        })
    }
}


async function getPublicEvents() {
    const service = InitializeServices();
    const collectionRef = collection(service.db, "Events")
    const q = query(collectionRef,where("private", "==", false), where("due_date", ">", new Date(Date.now())), orderBy("event_date", "desc"))

    try{
        const snapshots = await getDocs(q)
        let results = snapshotToJSON(snapshots)
        return results
    } catch(error) {
        console.log(error.code);
        console.log(error.message);
        return new Error("Can't fetch event from database.")
    }
}

function checkJoinedEvent(event_id) {
   return new Promise((resolve, reject) => {
    const service = InitializeServices();
    onAuthStateChanged(service.auth ,async user => {
        if (user) {
            const collectionRef = collection(service.db, "Events/"+event_id+"/participants")
            const localRef = doc(service.db, "Users", user.uid)
            const q = query(collectionRef,where("user", "==", localRef))

            try{
                const snapshots = await getDocs(q)
                let results = snapshotToJSON(snapshots)
                resolve(results.length != 0)
            } catch(error) {
                console.log(error.code);
                console.log(error.message);
                resolve(false)
            }
        } else {
            resolve(false)
        }
    })
   })
}

async function sendResetPassword(email) {
    const service = InitializeServices()
    await sendPasswordResetEmail(service.auth, email)
    .then(()=>{
        window.alert("Reset email has been sent")
    })
    .catch((e) => {
        window.alert(e.message)
    }) 
}


async function getEventDetails(event_id) {
    const service = InitializeServices();
    const collectionRef = doc(collection(service.db, "Events"), event_id)
    try {
        const snapshot = await getDoc(collectionRef)
        let results = snapshotToJSON(snapshot)
        //console.log("result: ", snapshot.data())
        return results
    } catch(error) {
        console.log("Error Code: ", error.code );
        console.log("Error Message: ", error.message)
        return new Error("Can't fetch event from database.")
    }
}

async function getHoldingEvents() {
    const service =  InitializeServices();
    let results = []
    return new Promise(function (resolve, reject) {
        onAuthStateChanged(service.auth,async user => {
            try {
                const eventRef = collection(service.db, "Events")
                const userRef = doc(service.db, "Users", user.uid)
                const q1 = query(eventRef,where("holder", "==", userRef), orderBy("event_date", "asc"))
                let joinedEvent = []
                getDocs(q1)
                .then(async snapshot => {
                    results =  await snapshotToJSON(snapshot)
                    return results
                })
                .then(async results => {
                    results = await addIsHolder(results, true)
                    resolve(results)
                })
                
            }catch (error) {
                console.log(error.code);
                console.log(error.message);
                reject("You haven't sign in yet.")
            }
        })
    })
}

async function getJoinedEvents() {
    const service =  InitializeServices();
    let results = []
    return new Promise(function (resolve, reject) {
        onAuthStateChanged(service.auth,async user => {
            try {
                const eventRef = collection(service.db, "Events")
                //const userRef = doc(service.db, "Users", user.uid)
                getDocs(eventRef)
                .then(async snapshot => {
                    return snapshotToJSON(snapshot)
                })
                .then(async events => {
                    //let bool2 = []
                    for(let i=0; i < events.length; i++){
                        const bool = await checkIfJoinedEvent(events[i], user.uid)
                        if (bool) {
                            results.push(events[i])
                        }
                    }
                    results = await addIsHolder(results, false)
                    resolve(results)
                })

            }catch (error) {
                console.log(error.code);
                console.log(error.message);
                reject("You haven't sign in yet.")
            }
        })
    })
}

async function orderingEvents() {
    const holding = await getHoldingEvents()
    const joined = await getJoinedEvents()
    let results = holding.concat(joined)
    let ended_cnt = 0
    results.sort((a,b) => {
        return b.event_date.seconds - a.event_date.seconds
    })

    results.forEach(result => {
        const isEnded = Date.now() > result.event_date.seconds * 1000
        const isToday = Date.parse(formatedDate(result.event_date).split(" ")[0]) == Date.parse(new Date().toLocaleDateString())
        if (isEnded && !isToday) {
            ended_cnt += 1
        }
        // const holder_info = await getHolder(result.holder)
        // result.holder_info = holder_info
    })


    let temp =  results.slice(0, results.length - ended_cnt)

    let temp2 =  results.slice(results.length - ended_cnt, results.length)

    results =  temp2.concat(temp)

    return  results
}

async function checkIfJoinedEvent(event, uid) {
    // return new Promise(function (resolve, reject) {
        try {
            const service =  InitializeServices();
            const participantsRef = collection(service.db, `Events/${event.id}/participants`)
            const q1 = query(participantsRef, where("user_id", "==", uid))

            const snapshot = await getDocs(q1)
           

            return  snapshotToJSON(snapshot).length > 0

        } catch (error) {
            console.log(error.code);
            console.log(error.message)
            return false
        }
    // })
}

async function getParticipants(event) {
    // return new Promise(function (resolve, reject) {
  
    try {
            const service =  InitializeServices();
            const participantsRef = collection(service.db, `Events/${event.id}/participants`)

            const snapshot = snapshotToJSON(await getDocs(participantsRef))

            // snapshot.forEach(participant => {
            //     const userRef = doc(service.db, `Users`, participant.user_id)

            //     getDoc(userRef)
            //     .then((userInfo) => {
            //         userInfo = snapshotToJSON(userInfo)
            //         snapshot[snapshot.indexOf(participant)]['first_name'] = userInfo.first_name
            //         snapshot[snapshot.indexOf(participant)]['last_name'] = userInfo.last_name
            //     })
            // })
            // console.log(JSON.parse(JSON.stringify(snapshot)))

            return  snapshot
        }catch (error) {
            console.log(error.code);
            console.log(error.message);
            return error
        }
            // const service =  InitializeServices();
            // const participantsRef = collection(service.db, `Events/${event.id}/participants`)

            // getDocs(participantsRef)
            // .then(snapshot => {
            //     snapshot = snapshotToJSON(snapshot)
            //     return snapshot
            // })
            // .then(snapshot => {
            //     let pariticipants_info = []
            //     snapshot.forEach(participant => {
            //         getDoc(participant.user)
            //         .then((userInfo) => {
            //             userInfo = snapshotToJSON(userInfo)
            //             snapshot[snapshot.indexOf(participant)]['first_name'] = userInfo.first_name
            //             snapshot[snapshot.indexOf(participant)]['last_name'] = userInfo.last_name
            //         })
            //     })
            //     console.log(Promise.all(snapshot))
            //     return [snapshot, Promise.all(snapshot)]

            // })
            // .then((result) => {
            //     let snapshot = result[0]
            //     let pariticipants_info = result[1]
            //     console.log(JSON.parse(JSON.stringify(snapshot)))
            //     console.log(JSON.parse(JSON.stringify(pariticipants_info)))
            // })


    // })
}

async function getParticipantsName(participant) {
    try {
        let participant_name = {}
        const user = await getDoc(participant.user);

        participant_name = {
            first_name : user.data().first_name,
            last_name : user.data().last_name
        }

        return participant_name
    } catch (error) {
        console.log(error.code);
        console.log(error.message);
    }
}


async function getHolder(holder_ref) {
    const service =  InitializeServices();
   
    try {
        const service = InitializeServices();
        let holder = {}
        const user_ = await getDoc(holder_ref);

        holder = {
            contact: user_.data().contact,
            email: user_.data().email,
            organization: user_.data().organization
        };

        if (holder.organization == "") {
            holder.organization = user_.data().first_name + " " + user_.data().last_name
        }
        return holder
    } catch (error) {
        console.log(error.code);
        console.log(error.message);
    }
    
}

function syncEmail(){
    return new Promise((resolve, reject) => {
        const service =  InitializeServices();
        onAuthStateChanged(service.auth, user => {
            const ref = doc(service.db, "Users", user.uid)
            const info = {
                email : user.email
            }
            updateDoc(ref, info)
            .then(()=> {
                resolve()
            })
            .catch(()=>{
                reject()
            })
        })
    })
    
}

function syncPassword(pw){
    return new Promise((resolve, reject) => {
        const service =  InitializeServices();
        onAuthStateChanged(service.auth, user => {
            const ref = doc(service.db, "Users", user.uid)
            const info = {
                password : pw
            }
            updateDoc(ref, info)
            .then(()=>{
                resolve()
            })
            .catch(()=>{
                reject()
            })
        })
    })
    
}

function addIsHolder(json, bool) {
    
    json.forEach(ele => {
        ele['isHolder'] = bool
    })
    return json
}



async function join_event(event_id) {
    const service = InitializeServices();

    const docRef = collection(service.db, "Events/"+event_id+"/participants");
    const userRef = doc(service.db, "Users", service.auth.currentUser.uid)

    //const eventDocRef = doc(service.db, "Events", event_id);
    const eventDocRef2 = collection(service.db, "Events");

    const q1 =  query(eventDocRef2, where("holder", "==", userRef), where(documentId(), "==", event_id))
    const q2 = query(docRef,where("user", "==", userRef))
    // const asd = await  getDoc(eventDocRef)
    // console.log(asd.data())
    getDocs(q1)
    .then((snapshot1) => {
        //console.log(snapshot1.docs.length)
        if (snapshot1.docs.length > 0) {
            alert("You are the holder of this event! You can't enroll in to the event!")
            return
        } else {
            getDocs(q2)
            .then((snapshot2) => {
                if (snapshot2.docs.length > 0) {
                    alert("You have already enrolled into this event!")
                    return
                } else {
                    getLocalUser()
                    .then((user) => {
                        const info = {
                            user : doc(service.db, "Users/"+service.auth.currentUser.uid),
                            enroll_time : serverTimestamp(),
                            arrival_time : new Date(0),
                            user_id : service.auth.currentUser.uid,
                        }
                        addDoc(docRef, info)
                        alert("Successfully enrolled into the event!")
                    })
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode );
                console.log(errorMessage)
            }) 

        }
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode );
        console.log(errorMessage)
    }) 
}


function getLocalUser() {
    const service = InitializeServices()
    return new Promise((resolve, reject) => {
        onAuthStateChanged(service.auth, (user) => {
            if (user) {
                localStorage.setItem("fyp-signIn", true)
                const docRef = doc(service.db, "Users", user.uid);
                getDoc(docRef)
                .then( (snapshot) => {
                    const local = snapshotToJSON(snapshot)
                    local.email = user.email
                    resolve(local)
                })
                .catch((error) => {
                    reject(error)
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode );
                    console.log(errorMessage)
                }) 
            } else {
                localStorage.setItem("fyp-signIn", false)
                reject("You haven't sign in!");
            }
    
        });
    })
}

async function getLocalUserID() {
    return new Promise((resolve, reject) => {
        const service = InitializeServices()
        onAuthStateChanged(service.auth, (user) => {
            if (user) {
                resolve(user.uid)
            } else {
                reject()
            }
        })
    })
}

async function checkIsHolder(event_id) {
    const service =  InitializeServices();
    let results = []
    return new Promise(function (resolve, reject) {
        onAuthStateChanged(service.auth,async user => {
            try {
                const eventRef = collection(service.db, "Events")
                const userRef = doc(service.db, "Users", user.uid)
                const q1 = query(eventRef,where("holder", "==", userRef), where(documentId(), "==", event_id))
                getDocs(q1)
                .then(async snapshot => {
                    results =  await snapshotToJSON(snapshot)
                    if (results.length > 0) {
                        resolve(results)
                    } else {
                        reject("Wrong event id or You are not the holder!")
                    }
                })
                
            }catch (error) {
                console.log(error.code);
                console.log(error.message);
                reject("Error on connection!")
            }
        })
    })
}

function generateInvitationCode() {
    let code = ""
    let remaining = 16

    while (remaining > 0) {
        if (Math.random() > 0.5) {
            code += String.fromCharCode(Math.floor(Math.random() * 26) + 65)
        } else {
            code += Math.floor(Math.random() * 10)
        }
        remaining -= 1
    }
    return code
}

// Detect auth state
const service = InitializeServices()

onAuthStateChanged(service.auth, (user) => {
    if (user) {
        localStorage.setItem("fyp-signIn", true)
        console.log("current user: ", user)
    } else {
        console.log("You haven't sign in!");
        localStorage.setItem("fyp-signIn", false)
    }
});

window.addEventListener("load", (event) => {
    syncEmail()
});

export { sendResetPassword, checkJoinedEvent, getParticipantsName, updatePw, updateEmail, updateUserProfile, updateAttendanceByHolder, getLocalUserID, withdrawAllParticipants, withdrawEventByUser, updateAttendance, getParticipants, deleteEvent, updateEvent, checkIsHolder, orderingEvents, getHoldingEvents, getJoinedEvents, formatedDate, getHolder, getLocalUser, join_event, checkSigned, register, InitializeServices, signIn, sign_out, createEvent, getPublicEvents, getEventDetails }
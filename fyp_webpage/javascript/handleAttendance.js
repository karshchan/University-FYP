import { updateAttendance } from "./firebase.js"
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const event_id = urlParams.get("event_id")
const user_id = urlParams.get("user_id")

if (!user_id) {
    let form = document.createElement("form");
    form.method = "get";
    form.action = "../signIn.html";
    form.style.visibility = "hidden"

    let input = document.createElement("input");
    input.setAttribute("name", "event_id");
    input.setAttribute("value", event_id);
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
} else {
    updateAttendance(event_id, user_id)
    .then(() => {
        window.location = "../profilePage.html"
    })
    .catch(msg => {
        if (msg == "join") {
            if (!alert("You didn't join this event!")) {
                window.location = "../profilePage.html"
            }
        } else if (msg == "signIn"){
            if (!alert("You need to login to update you attendance record!")) {
                window.location = "../signIn.html?event_id=" + event_id
            }
        } else if (msg == "equal"){
            if (!alert("The user id does not match current account!")) {
                window.location = "../profilePage.html"
            }
        } else if (msg == "redundant"){
            if (!alert("You have take you attendance!")) {
                window.location = "../profilePage.html"
            }
        } else {
            if (!alert("Connection error!")) {
                window.location = "../errorPage.html"
            }
        }
    })
}
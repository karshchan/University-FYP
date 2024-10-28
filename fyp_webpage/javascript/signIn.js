import { sendResetPassword, getLocalUserID, signIn } from "./firebase.js"
const submit_btn = document.querySelector("#btn-signIn")
const error_msg = document.querySelector(".signIn-form-container .signIn-form .other .error-message")
const forget_password = document.querySelector(".signIn-form-container .signIn-form .other .forget-password")

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const event_id = urlParams.get("event_id")

getLocalUserID()
.then(user_id => {
    console.log(user_id)
    if (user_id) {
        if (event_id) {
            window.location = `../handleAttendance.html?event_id=${event_id}&user_id=${user_id}`
        } else {
            window.location = "../index.html"
        }
    }
})
.catch((error) => {
    submit_btn.addEventListener("click", () => {
        signIn()
        .then((user_id) => {
            if (event_id) {
                window.location = `../handleAttendance.html?event_id=${event_id}&user_id=${user_id}`
            } else {
                window.location = "../index.html"
            }
        })
        .catch(() => {
            //window.location = "../errorPage.html"
            error_msg.classList.add("active")
        })
    })
})

forget_password.addEventListener("click", (e)=>{
    e.preventDefault()
    let email = window.prompt("Please enter your email.\nA reset password will be sent to you.")
    sendResetPassword(email)
})



import { getLocalUser } from "./firebase.js";
getLocalUser()
.then((result) => {
    const content = `
            <div class="info-row">
                <span>Company Name: </span>
                <span class="name">${result.organization ? result.organization : "N/A"}</span>
            </div>

            <div class="info-row">
                <span>Email Address: </span>
                <span class="email">${result.email}</span>
            </div>

            <div class="info-row">
                <span>Company Address: </span>
                <span class="address">${result.organization_address? result.organization_address : "N/A"}</span>
            </div>

            <div class="info-row">
                <span>Contact: </span>
                <span class="contact">${result.contact}</span>
            </div>

            `
            const container = document.querySelector(".private-container")
            container.innerHTML = (content) +  container.innerHTML
}).catch((err) => {
    if (err.code) {
        console.log("Error Code: ", err.code)
        console.log("Error Message: ", err.message)
    } else {

        if (err == "You haven't sign in!") {
            if (!alert(err)) {
                window.location = "../signIn.html"
            }
        }

    }
});
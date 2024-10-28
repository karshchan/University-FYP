import { checkJoinedEvent, checkIsHolder, join_event, getEventDetails, formatedDate, getHolder } from "./firebase.js"

const params = new URLSearchParams(window.location.search)
const event_id = params.get("event_id")

getEventDetails(event_id)
.then(async (detail) => {
    if (detail.private) {
    
        if (!params.get("code")) {
            checkIsHolder(event_id)
            .then(() => {

            }).catch((error) => {
                checkJoinedEvent(event_id)
                .then(joined => {
                    if (!joined) {
                        if(!alert("This is a private event.\nThe url don't contain the invitation code.")){
                            window.location = "../publicEventList.html"
                        }
                    }
                })
                .catch(() => {
                    if(!alert("This is a private event.\nThe url don't contain the invitation code.")){
                        window.location = "../publicEventList.html"
                    }
                })
            })
        } else {
            if (detail.invitation_code != params.get("code")) {
                checkIsHolder(event_id)
                .then(() => {

                }).catch((error) => {
                    checkJoinedEvent(event_id)
                    .then(joined => {
                        if (!joined) {
                            if(!alert("This is a private event.\nYour invitation code is not correct.")){
                                window.location = "../publicEventList.html"
                            }
                        }
                    })
                    .catch(() => {
                        if(!alert("This is a private event.\nYour invitation code is not correct.")){
                            window.location = "../publicEventList.html"
                        }
                    })
                    if(!alert("This is a private event.\nYour invitation code is not correct.")){
                        window.location = "../publicEventList.html"
                    }
                })


            }
            
        }
    }

    const holder = await getHolder(detail.holder)

    if (detail.use_contact == true) {
        detail.contact = holder.contact
    }
    

    if (detail.use_email == true) {

        detail.email = holder.email
    }

    let event_details = `
        <div class="title">
            <span class="sub-title">Title</span>
            <br>
            <div>${detail.title}</div>
        </div>

        <div class="desc">
            <span class="sub-title">Description</span>
            <br>
            <div>
                ${detail.description}
            </div>
        </div>

        <div class="info">
            <span class="sub-title">More Information</span>
            <br>
            <div class="holder">Holder: <span>${holder.organization}</span></div>
            <div class="contact">Contact: <span>${detail.contact}</span></div>
            <div class="email">Email: <span>${detail.email}</span></div>
            <div class="due-date">Due Date: <span>${formatedDate(detail.due_date)}</span></div>
            <div class="hold-date">Event Date: <span>${formatedDate(detail.event_date)}</span></div>
        </div>

        <div>
                `
    await checkIsHolder(event_id)
    .then(event => {
        event_details += `
        <button class="join-btn" disabled>
        You are the event holder!`
    })
    .catch(error => {
        event_details += `
        <button class="join-btn">
        Join Now!`
    })
                
    event_details += `
            </button>

        </div>
    `
    const details_container = document.querySelector(".detail-container")
    details_container.innerHTML = event_details

    const join_btn = document.querySelector(".join-btn")
    join_btn.addEventListener("click", () => {
        console.log(localStorage.getItem("fyp-signIn"))
        if (localStorage.getItem("fyp-signIn") == "false") {
            window.location = "../signIn.html"
            return
        }
        if (Date.now() > detail.due_date.seconds * 1000) {
            if (detail.invitation_code != params.get("code")) {
                alert("Event is due. You can't enroll to the Event.")
                return
            }
        }
        const dialogue = document.querySelector(".dialogue")
        dialogue.classList.add("active")
    })
    

})
.catch(error => {
    console.log(error)
})


const yes_btn = document.querySelector(".yes-btn")
const no_btn = document.querySelector(".no-btn")
no_btn.addEventListener("click", () => {
    const dialogue = document.querySelector(".dialogue")
    dialogue.classList.remove("active")
})
yes_btn.addEventListener("click", () => {
    join_event(event_id)
    const dialogue = document.querySelector(".dialogue")
    dialogue.classList.remove("active")
})
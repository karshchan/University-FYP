import {withdrawEventByUser, orderingEvents, getHolder, formatedDate, deleteEvent} from "./firebase.js";


function checkEmpty() {
    const events = document.querySelectorAll(".event-tables .event")
    let empty = true
    events.forEach(event => {
        if (event.classList.contains("ended") && event.classList.length == 2 || event.classList.length == 1) {
            empty = false
        }
    })

    const empty_msg = document.querySelector(".empty-events")
    if (!empty) {
        empty_msg.style.visibility = "hidden"
    } else {
        empty_msg.style.visibility = "visible"
    }
}

const keywords = document.querySelector("#keywords")
keywords.addEventListener("input", () => {
    const query = keywords.value
    const events = document.querySelectorAll(".event-tables .event")
    events.forEach((event) => {
   
        const company = event.children[0].children[0].children[0].children[1]
        const result1 = findKeywordsInText(company, query)
        let highlighted1 = false
        if (result1 != "") {
            addMarker(company, result1)
            highlighted1 = true
        } else {
            removeMarker(company)
            highlighted1 = false
        }

        const title = event.children[0].children[0].children[3].children[1]
        const result2 = findKeywordsInText(title, query)
        let highlighted2 = false
        if (result2 != "") {
            addMarker(title, result2)
            highlighted2 = true
        } else {
            removeMarker(title)
            highlighted2 = false
        }

        // result1 == result2 && result2 == "" ; title and holder not match 
        // query != "" ; keyword not empty

        if (!highlighted1 && !highlighted2 && query == "") {
            event.classList.remove("no-keyword")
        } else if (highlighted1 || highlighted2) {
            event.classList.remove("no-keyword")
        } else {
            event.classList.add("no-keyword")
        }


    })
    checkEmpty()
})

function findKeywordsInText(element, word) {
    if (element.innerText.toLowerCase().includes(word.toLowerCase())) {
        const postion = element.innerText.toLowerCase().indexOf(word.toLowerCase())
        const length = word.length
        if (postion > -1) {
            return element.innerText.substring(postion, postion+length)
        }
        
    }

    return ""
}

function addMarker(element, word) {
    element.innerHTML = element.innerText.replaceAll(word, `<mark>${word}</mark>`)
}

function removeMarker(element) {
    element.innerHTML = element.innerText.replaceAll("<mark>", "")
    element.innerHTML = element.innerText.replaceAll("</mark>", "")
}

const checkboxs = document.querySelectorAll("input[type=checkbox][name=event-status]")
checkboxs.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        let value = []
        checkboxs.forEach((checkbox) => {
            if (checkbox.checked) {
                value.push(checkbox.value)
            }
        })

        const events = document.querySelectorAll(".event-tables .event")
        events.forEach((event) => {
            const status = event.children[0].children[0].children[0].children[3]
            if (value.length == 0) {
                event.classList.remove("no-status")
            } else if (value.includes(status.innerText.toLowerCase())) {
                event.classList.remove("no-status")
            } else {
                event.classList.add("no-status")
            }
        })
        checkEmpty()
    })
})

const cb_role = document.querySelectorAll("input[type=checkbox][name=role]")
cb_role.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        let value = []
        cb_role.forEach((checkbox) => {
            if (checkbox.checked) {
                value.push(checkbox.value)
            }
        })

        const events = document.querySelectorAll(".event-tables .event")
        events.forEach((event) => {
            const role = event.children[0].children[0].children[2].children[1]
            if (value.length == 0) {
                event.classList.remove("no-role")
            } else if (value.includes(role.innerText.toLowerCase())) {
                event.classList.remove("no-role")
            } else {
                event.classList.add("no-role")
            }
        })
        checkEmpty()
    })
})

const cb_nature = document.querySelectorAll("input[type=checkbox][name=nature]")
cb_nature.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        let value = []
        cb_nature.forEach((checkbox) => {
            if (checkbox.checked) {
                value.push(checkbox.value)
            }
        })

        const events = document.querySelectorAll(".event-tables .event")
        events.forEach((event) => {
            const nature = event.children[0].children[0].children[2].children[3]
            if (value.length == 0) {
                event.classList.remove("no-nature")
            } else if (value.includes(nature.innerText.toLowerCase())) {
                event.classList.remove("no-nature")
            } else {
                event.classList.add("no-nature")
            }
        })
        checkEmpty()
    })
})

const due_date = document.querySelector("input#due-date")
due_date.addEventListener("change", () => {
    const events = document.querySelectorAll(".event-tables .event")
    const filter_time = due_date.value

    events.forEach((event) => {
        const event_due = event.children[0].children[0].children[1].children[1].innerText
        if (event_due == "") {
            event.classList.remove("no-due-date")
            return
        }
        const ended = Date.parse(event_due) < Date.parse(filter_time)

        if (ended) {
            event.classList.add("no-due-date")
        } else {
            event.classList.remove("no-due-date")
        }
    })
    checkEmpty()
})

const event_date = document.querySelector("input#event-date")
event_date.addEventListener("change", () => {
    const events = document.querySelectorAll(".event-tables .event")
    const filter_time = event_date.value

    events.forEach((event) => {
        const event_start = event.children[0].children[0].children[1].children[3].innerText.split(" ")[0]

        if (event_start == "") {
            event.classList.remove("no-start-date")
            return
        }
    
        const ended = Date.parse(event_start) < Date.parse(filter_time) + (new Date()).getTimezoneOffset() * 60 * 1000

        if (ended) {
            event.classList.add("no-start-date")
        } else {
            event.classList.remove("no-start-date")
        }
    })
    checkEmpty()
})



const dialogue = document.querySelectorAll(".dialogue")[0]
const content = document.querySelectorAll(".dialogue .content")[0]
const confirm = document.querySelectorAll(".dialogue .confirm-input")[0]
const heading = document.querySelectorAll(".heading")[0]

orderingEvents()
.then(events => {
    // console.log(JSON.parse(JSON.stringify(events)))
    const event_tables = document.querySelector(".event-tables")
        events.forEach ((event) => {
            getHolder(event.holder)
            .then(holder => {
                const isEnded = Date.now() > event.event_date.seconds * 1000
                const isToday = Date.parse(formatedDate(event.event_date).split(" ")[0]) == Date.parse(new Date().toLocaleDateString())
    
                let event_string = `
                <div class="event ${isEnded && !isToday ? "ended" :""}">
                    <table class="outer">
    
                        <tr class="td-4">
                            <td>Holder:</td>
                            <td>${holder.organization}</td>
                            <td>Event Status:</td>
                            <td class="status">${isToday ? "Ongoing": (isEnded? "Ended":"Upcoming")}</td>
                        </tr>
    
                        <tr class="td-4">
                            <td>Application Due Date:</td>
                            <td>${formatedDate(event.due_date)}</td>
                            <td>Event Start Date:</td>
                            <td>${formatedDate(event.event_date)}</td>
                        </tr>
    
                        <tr class="td-4">
                            <td>Role:</td>
                            <td>${event.isHolder ? "Holder":"Participant"}</td>
                            <td>Nature:</td>
                            <td>${event.private? "Private":"Public"}</td>
                        </tr>
    
                        <tr class="td-2">
                            <td>Title:</td>
                            <td colspan="3"><a href="../eventDetails.html?event_id=${event.id}" class="related-event-link">${event.title}</a></td>
                        </tr>
    
                        <tr class="td-2 action">
                            <td>Action: </td>
                            <td colspan="3" class="action-btn">
                `
                if (event.isHolder) {

                    if (isEnded && !isToday) {
                        event_string += 
                        `
                            <a href="attendance.html?id=${event.id}">
                            <button class="view">Attendance</button>
                            </a>
                        `
                    } else {
                        event_string += 
                        `
                            <a href="eventForm.html?type=modify&id=${event.id}">
                            <button class="modify" >Modify Event</button>
                            </a>
                            
                            <button class="delete" event_id="${event.id}">Delete Event</button>

                            <a href="attendance.html?id=${event.id}">
                            <button class="view">Attendance</button>
                            </a>

                            <button class="invitation_qr" event_id="${event.id}" code="${event.invitation_code}">Invitation</button>
                        `
                    }

                    event_string += `
                                    
                                </td>
                            </tr>

                        </table>
                    </div>
                    `

                    event_tables.innerHTML = event_string + event_tables.innerHTML

    


                } else {
                    if (isEnded && !isToday) {
                        event_string += 
                    `
                    <div class="empty-events">
                        Ended Event 
                    </div>
                    `
                    } else {
                        event_string += 
                    `
                        <button class="withdraw" event_id="${event.id}">Withdrawal</button>
                    `
                    }

                    event_string += `
                                </td>
                            </tr>

                        </table>
                    </div>
                    `
                    event_tables.innerHTML = event_string + event_tables.innerHTML
                    
                }
                checkEmpty()
            })
            .then(() => {

                let qr_btn = document.querySelectorAll(`.invitation_qr`)
                const qr_container = document.querySelector(".qr-container")
                

                qr_btn.forEach(btn => {
                    btn.addEventListener("click",() => {
            
                        let image = document.querySelector(".qr .image img")
                        let QR_api = "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data="
                        let destination = `http://127.0.0.1:5500/eventDetails.html?event_id=${btn.getAttribute("event_id")}&code=${btn.getAttribute("code")}`

                        let result = QR_api + encodeURIComponent(destination)

                        image.src = result

                        console.log(btn.getAttribute("event_id"))
                        console.log("Attendance URL: ", destination)

                        let url_text = document.querySelector(".qr .url")
                        url_text.innerText = destination

                        qr_container.classList.add("active")
                    })
                })



                const delete_btn = document.querySelectorAll(".delete")
                delete_btn.forEach(btn => {
                    
                    btn.addEventListener("click", () => {
                        console.log(btn.attributes.event_id.value)
                        content.innerHTML = `
                            <p>You are trying to delete the entire event!</p>
                            <p>Event can't be recover once deleted!</p>
                            <p>Enter "YES" in the follow field.</p>
                            <p>Then click "Yes" to operate the deletion.</p>
                        `
                        heading.innerText = "Delete Entire Event"
                        confirm.style.visibility = "visible"
                        
                        const yes_btn = document.querySelector(".yes-btn")
                        const no_btn = document.querySelector(".no-btn")
                        yes_btn.attributes.event_id.value = btn.attributes.event_id.value
                        no_btn.attributes.event_id.value = btn.attributes.event_id.value

                        dialogue.classList.add("active")
                    })
                })


                const withdraw_btn = document.querySelectorAll(".withdraw")
                withdraw_btn.forEach(btn => {
                    console.log(btn.getAttribute("event_id"))
                    btn.addEventListener("click", () => {
                        console.log(btn.getAttribute("event_id"))
                    
            
                        heading.innerText = "Withdraw From Event"
            
                        confirm.style.visibility = "hidden"
            
                        content.innerHTML = `
                            <p>You are trying to withdraw from event!</p>
                            <p>You can enroll to the event again.</p>
                            <p>Click "Yes" to withdraw from event.</p>
                        `
                        
                        const yes_btn = document.querySelector(".yes-btn")
                        const no_btn = document.querySelector(".no-btn")
                        yes_btn.attributes.event_id.value = btn.attributes.event_id.value
                        no_btn.attributes.event_id.value = btn.attributes.event_id.value
            
                        dialogue.classList.add("withdraw")
                        dialogue.classList.add("active")
                    })
                })
                
            })
        })
    

})
.then(() => {

    const url = document.querySelector(".url")
    const copy_btn = document.querySelector(".copy-btn")

    const qr_container = document.querySelector(".qr-container")
    const close_btn = document.querySelector(".close-btn")
    close_btn.addEventListener("click", () => {
        qr_container.classList.remove("active")
        copy_btn.innerText = "Copy"
    })


    copy_btn.addEventListener("click", () => {
        navigator.clipboard.writeText(url.innerText)
        copy_btn.innerText = "Copy ✔"
    })

    


    const yes_btn = document.querySelector(".yes-btn")
    const no_btn = document.querySelector(".no-btn")
    const confirm = document.querySelector("#confirm")

    no_btn.addEventListener("click", () => {
        const dialogue = document.querySelector(".dialogue")
        dialogue.classList.remove("withdraw")
        dialogue.classList.remove("active")
        confirm.value = ""
    })
    
    yes_btn.addEventListener("click", () => {
        const dialogue = document.querySelector(".dialogue")
        if (dialogue.classList.contains("withdraw")) {
            withdrawEventByUser(yes_btn.attributes.event_id.value)
            dialogue.classList.remove("withdraw")
            return
        } else if (confirm.value != "YES") {
            console.log("no yes")
            alert("Please enter \"YES\" to confirm your deletion!")
            return
        }
        deleteEvent(yes_btn.attributes.event_id.value)
        dialogue.classList.remove("active")
        confirm.value = ""
    })
})
.catch(error => {
    console.log(error)
})

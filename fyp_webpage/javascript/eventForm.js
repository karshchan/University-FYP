import { updateEvent, createEvent, checkIsHolder, formatedDate } from "./firebase.js"

const optional_email = document.querySelector(".input-box.optional.email");
const optional_contact = document.querySelector(".input-box.optional.contact");

const email = document.querySelector("#use-email")
const contact = document.querySelector("#use-contact")

const contact_div = document.querySelector("#event-form-container .input-box.toggle-btn.contact")

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const submit_btn = document.querySelector(".submit-btn")

if (urlParams.get("type") == "modify") {
    checkIsHolder(urlParams.get("id"))
    .then(event => {
        event = event[0]
        const isEnded = Date.now() > event.event_date.seconds * 1000
        const isToday = Date.parse(formatedDate(event.event_date).split(" ")[0]) == Date.parse(new Date().toLocaleDateString())
        
        if (isEnded && !isToday) {
            if (alert("This event is ended. \n You can not modify it anymore.")) {}
            else {
                history.back()
            }
        } else {
            const title = document.querySelector("#title")
            title.value = event.title
    
            const is_private = document.querySelector("#private")
            is_private.checked = event.private
    
            const description = document.querySelector("#description")
            description.value = event.description.replaceAll("<br/>", "\n")
    
            const use_email = document.querySelector("#use-email")
            use_email.checked = event.use_email
    
            const use_contact = document.querySelector("#use-contact")
            use_contact.checked = event.use_contact
    
            const email = document.querySelector("#email")
            email.value = event.email
    
            const contact = document.querySelector("#contact")
            contact.value = event.contact
    
            const datetime = document.querySelector("#datetime")
            datetime.value = formatedDate(event.event_date).replace(" ", "T")
    
            const due_date = document.querySelector("#due-date")
            due_date.value = formatedDate(event.due_date).replace(" ", "T")
    
            submit_btn.innerText = "Change"
            submit_btn.addEventListener("click", () => {
                if (!checkTitleAndDesc()) {
                    alert("Title and description can't be empty!")
                    return
                }
                if (!checkDate()) {
                    alert("Event date should be later than application due date!")
                    return
                }

                updateEvent(event.id)
            })
        }
    })
    .catch(error => {
        alert(error)
    })
} else {

    submit_btn.addEventListener("click", () => {
        const description = document.querySelector("#description").value
        if (!checkTitleAndDesc()) {
            alert("Title and description can't be empty!")
            return
        }
        const check_date = checkDate()

        if (typeof(check_date) == "object") {
            if (!check_date[0]){
                alert("Event date should be later than application due date!")
                return
            }
        } else {
            return
        }

        if (!checkCreateDate()){
            alert("Application due date should be later than now while create!")
            return
        }

        createEvent()
    })
}






email.addEventListener("click", () => {
    if (email.checked == false) {
        optional_email.style.opacity  = "1"
        optional_email.classList.add("active")
        optional_email.classList.remove("deactive")
        contact_div.classList.add("go-down")
    } else {
        optional_email.style.opacity  = "0"
        optional_email.classList.remove("active")
        optional_email.classList.add("deactive")
        contact_div.classList.remove("go-down")
    }
})

contact.addEventListener("click", () => {
    if (contact.checked == false) {
        optional_contact.style.opacity  = "1"
        optional_contact.classList.add("active")
        optional_contact.classList.remove("deactive")
    } else {
        optional_contact.style.opacity  = "0"
        optional_contact.classList.remove("active")
        optional_contact.classList.add("deactive")
    }
})


function checkDate(){
    const event_date = document.querySelector("#datetime").value
    const due_date = document.querySelector("#due-date").value
    if (event_date == "") {
        alert("Event date should not be empty!")
        return false
    }
    if (due_date == "") {
        alert("Application due date should not be empty!")
        return false
    }

    return [event_date > due_date]
}

function checkCreateDate(){
    const due_date = document.querySelector("#due-date").value

    if (Date.now() > Date.parse(due_date)) {
        return false
    }

    return true
}

function checkTitleAndDesc() {
    const title = document.querySelector("#title").value
    const description = document.querySelector("#description").value
    return title != "" && description != ""
}
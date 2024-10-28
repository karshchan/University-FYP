import { getPublicEvents, getHolder, formatedDate } from "./firebase.js";

getPublicEvents()
.then(events => {
    const empty_msg = document.querySelector(".empty-events")
    const event_container = document.querySelector(".event-list-container")
    if (events.length <= 0) {
        empty_msg.style.visibility = "visible"

        event_container.innerHTML = event_container.innerHTML
    } else {
        empty_msg.style.visibility = "hidden"
        events.forEach(async (event) => {
            const holder = await getHolder(event.holder);
            const event_string = `
                <div class="event">
                    <div class="title"><a href="eventDetails.html?event_id=${event.id}">${event.title}</a></div>
    
                    <div class="desc">${event.description}</div>
    
                    <div class="info">
                        <div class="holder">Holder:  <span>${holder.organization}</span></div>
                        <div class="date-div">
                            <div class="due-date">Due Date: <span>${formatedDate(event.due_date)}</span></div>
                            <div class="hold-date">Event Date: <span>${formatedDate(event.event_date)}</span></div>
                        </div>
                    </div>
                </div>`
            event_container.innerHTML = event_string + event_container.innerHTML
    
        });
    }
})
.catch(error => {
    console.log(error)
})


function checkEmpty() {
    const events = document.querySelectorAll(".event-list-container .event")
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
    const events = document.querySelectorAll(".event-list-container .event")
    events.forEach((event) => {
        const company = event.children[2].children[0].children[0]
        const result1 = findKeywordsInText(company, query)
        let highlighted1 = false
        if (result1 != "") {
            addMarker(company, result1)
            highlighted1 = true
        } else {
            removeMarker(company)
            highlighted1 = false
        }

        const title = event.children[0].children[0]
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


const due_date = document.querySelector("input#due-date")
due_date.addEventListener("change", () => {
    const events = document.querySelectorAll(".event-list-container .event")
    const filter_time = due_date.value

    events.forEach((event) => {
        const event_due = event.children[2].children[1].children[0].children[0].innerText.split(" ")[0]
        if (event_due == "") {
            event.classList.remove("no-due-date")
            return
        }
        const ended = Date.parse(event_due) < Date.parse(filter_time) + (new Date()).getTimezoneOffset() * 60 * 1000

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
    const events = document.querySelectorAll(".event-list-container .event")
    const filter_time = event_date.value

    events.forEach((event) => {
        const event_start = event.children[2].children[1].children[1].children[0].innerText.split(" ")[0]

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
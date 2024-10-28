import { getParticipantsName, updateAttendanceByHolder, withdrawAllParticipants, getParticipants, checkIsHolder, join_event, getEventDetails, formatedDate, getHolder } from "./firebase.js"

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const event_id = urlParams.get("id")
let event_date = ""

checkIsHolder(event_id)
.then(event => {
    event = event[0]
    const event_info = document.querySelector(".event-info")
    event_date = formatedDate(event.event_date)
    const isEnded = Date.now() > event.event_date.seconds * 1000
    let string = `
        <table>
            <tr>
                <td>Event Title: </td>
                <td>${event.title}</td>
                <td>${isEnded? "" : `<button class="remove_participant">Remove Participant</button>`}</td>
            </tr>
            <tr>
                <td>Appliaction Due Date:</td>
                <td>${formatedDate(event.due_date)}</td>
                <td></td>
            </tr>
            <tr>
                <td>Event Date:</td>
                <td>${event_date}</td>
                <td rowspan="2">${isEnded? "" : `<button class="generate_qr">Attendnace <br>QR Code</button>`}</td>
            </tr>
            <tr>
                <td>Nature:</td>
                <td>${event.private? "Private":"Public"}</td>
                <td></td>
            </tr>
            <tr>
                <td>Pariticipants:</td>
                <td class="pariticipants_no"></td>
                <td></td>
            </tr>
            <tr>
                <td>Attendance Rate:</td>
                <td class="attendance_rate"></td>
                <td></td>
            </tr>
        </table>
    `
    event_info.innerHTML = string

    let image = document.querySelector(".qr .image img")
    let QR_api = "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=http://127.0.0.1:5500/handleAttendance.html?event_id="+event_id
    image.src = QR_api
    console.log("Attendance URL: ", "http://127.0.0.1:5500/handleAttendance.html?event_id="+event_id)

    if (!isEnded) {
        const qr_btn = document.querySelector(".generate_qr")
        const qr_container = document.querySelector(".qr-container")
        qr_btn.addEventListener("click", () => {
            qr_container.classList.add("active")
        })
    
        const close_btn = document.querySelector(".close-btn")
        close_btn.addEventListener("click", () => {
            qr_container.classList.remove("active")
        })
    
        const remove_participant = document.querySelector(".remove_participant")
        remove_participant.addEventListener("click", () => {
            const dialogue = document.querySelector(".dialogue")
            dialogue.classList.add("active")
        })
    
        const yes_btn = document.querySelector(".yes-btn")
        const no_btn = document.querySelector(".no-btn")
    
        no_btn.addEventListener("click", () => {
            const dialogue = document.querySelector(".dialogue")
            dialogue.classList.remove("withdraw")
            dialogue.classList.remove("active")
        })
        
        yes_btn.addEventListener("click", async () => {
            const dialogue = document.querySelector(".dialogue")
            const selected = document.querySelectorAll("[name=selected]:checked")
            
            if (selected.length <= 0) {
                alert("You didn't select any participants!")
                dialogue.classList.remove("active")
                return
            }
            let removed = 0
            let failed = 0
            withdrawAllParticipants(event_id, selected)
            .then(() => {
                removed += 1
                if (removed + failed == selected.length) {
                    if (alert(`${removed} participant(s) removed. ${failed == 0? "" : `${failed} participant(s) failed to remove.`}`)) {
                    } else {
                        window.location.reload()
                    }
                }
            })  
            .catch(() => {
                failed += 1
                if (removed + failed == selected.length) {
                    if (alert(`${removed} participant(s) removed. ${failed == 0? "" : `${failed} participant(s) failed to remove.`}`)) {
                    } else {
                        window.location.reload()
                    }
                }
            })
            
            dialogue.classList.remove("active")
        })
    }


    getParticipants(event)
    .then(participants => {
        const attendance_list = document.querySelector(".attendance table")
        const pariticipants_no = document.querySelector(".pariticipants_no")
        const attendance_rate = document.querySelector(".attendance_rate")
        let rate = 0

        pariticipants_no.innerText = participants.length
        
        if (participants.length <= 0) {
            attendance_list.innerHTML += `
                <tr>
                    <td colspan="6">
                        <div class="empty-events">
                            No Participants
                        </div>
                    </td>
                </tr>
            `
            attendance_rate.innerText = participants.length + "/" + participants.length + " ~ " + rate + "%"
            return
        }

        let attended = 0
        participants.forEach(participant => {
            getParticipantsName(participant)
            .then(participant_name => {
                const enroll_date = formatedDate(participant.enroll_time).split(" ")[0]
                let arrival_time = "NA"
                if (participant.arrival_time.seconds != 0) {
                    arrival_time = formatedDate(participant.arrival_time).split(" ")[1]
                    attended += 1
                }
                let row = `
                    <tr>
                        <td>
                            <label for="cb_${participants.indexOf(participant)+1}">
                                <input type="checkbox" name="selected" id="cb_${participants.indexOf(participant)+1}" 
                                    value="${participant.id}">
                            </label>
                        </td>
                        <td>${participants.indexOf(participant)+1}</td>
                        <td>${participant_name.first_name + " " + participant_name.last_name}</td>
                        <td>${enroll_date}</td>
                        <td no="${participants.indexOf(participant)+1}" value="${participant.id}">
                            ${arrival_time} 
                            <button class="modify-time" no="${participants.indexOf(participant)+1}">📝</button>
                        </td>
                    </tr>
                `
    
                attendance_list.innerHTML += row
    
                rate = ((attended / participants.length) * 100).toFixed(2) //attended / participants.length
                attendance_rate.innerText = attended + "/" + participants.length + " ~ " + rate + "%"
            })
            .then(() => {
                const modify_time = document.querySelectorAll(".modify-time")
                modify_time.forEach(btn => {
                    addListenerModify(btn, btn.getAttribute("no"))
                })
        
                const select_all = document.querySelector("input#select_all")
                select_all.addEventListener("change", () => {
                    const cb_selected = document.querySelectorAll("input[name=selected]")
                    if (select_all.checked) {
                        cb_selected.forEach(cb => {
                            cb.checked = true 
                        })
                    } else {
                        cb_selected.forEach(cb => {
                            cb.checked = false 
                        })
                    }
                })
        
                const cb_selected = document.querySelectorAll("input[name=selected]")
                cb_selected.forEach(cb => {
                    cb.addEventListener("change", () => {
                        if (!cb.checked) {
                            select_all.checked = false
                        }
                    })
                })
            })
        })
    })
    .then(() => {
        // const modify_time = document.querySelectorAll(".modify-time")
        // modify_time.forEach(btn => {
        //     addListenerModify(btn, btn.getAttribute("no"))
        // })

        // const select_all = document.querySelector("input#select_all")
        // select_all.addEventListener("change", () => {
        //     const cb_selected = document.querySelectorAll("input[name=selected]")
        //     if (select_all.checked) {
        //         cb_selected.forEach(cb => {
        //             cb.checked = true 
        //         })
        //     } else {
        //         cb_selected.forEach(cb => {
        //             cb.checked = false 
        //         })
        //     }
        // })

        // const cb_selected = document.querySelectorAll("input[name=selected]")
        // cb_selected.forEach(cb => {
        //     cb.addEventListener("change", () => {
        //         if (!cb.checked) {
        //             select_all.checked = false
        //         }
        //     })
        // })

    })

})
.catch(error => {

    new Promise((resolve, reject) => {
        resolve(alert(error))
    })
    .then(() => {
        window.location = "../errorPage.html"
    })
   // window.location = "../errorPage.html"
})

function addListenerModify(item, no) {
    item.addEventListener("click", () => {
        const field = document.querySelector(`.attendance td[no="${no}"]`)
        const time = field.innerText.split(" ")[0]

        field.innerHTML = `
            <input type="time" name="time" value="${time}">
            <br>
            <button class="cancel">❌</button>
            <button class="delete">🗑️</button>
            <button class="save-time"> 💾 </button>
        `
        const save_time = document.querySelector(`.attendance td[no="${no}"] .save-time`)
        addListenerSave(save_time, no)

        const cancel = document.querySelector(`.attendance td[no="${no}"] .cancel`)
        addListenerCancel(cancel, no, time)

        const delete_btn = document.querySelector(`.attendance td[no="${no}"] .delete`)
        addListenerDelete(delete_btn, no)
    })
}

function addListenerSave(item, no) {
    item.addEventListener("click", () => {
        const field = document.querySelector(`.attendance td[no="${no}"]`)
        const new_time = document.querySelector(`td[no="${no}"] [type="time"]`).value
        const id = document.querySelector(`td[no="${no}"]`).getAttribute("value")
        const timestamp = Date.parse(event_date.split(" ")[0] + " " + new_time)
        
        if (new_time != "") {
            updateAttendanceByHolder(event_id, id, timestamp)
            .then(() => {
                // field.innerHTML = `
                // ${new_time} 
                // <button class="modify-time" no="${no}">📝</button>
                // `
                // const modify_time = document.querySelector(`.attendance td[no="${no}"] .modify-time`)
                // addListenerModify(modify_time, no)
                window.location.reload()
            })
            .catch((error) => {
                if (!alert("Error in connection!")) {
                    window.location.reload()
                }
            })
        } else {
            alert("You need to choose time before save!")
        }
        
    })
}


function addListenerCancel(item, no, time) {
    item.addEventListener("click", () => {
        const field = document.querySelector(`.attendance td[no="${no}"]`)
        field.innerHTML = `
            ${time} 
            <button class="modify-time" no="${no}">📝</button>
        `
        const modify_time = document.querySelector(`.attendance td[no="${no}"] .modify-time`)
        addListenerModify(modify_time, no)
    })
}

function addListenerDelete(item, no) {
    item.addEventListener("click", () => {
        const id = document.querySelector(`td[no="${no}"]`).getAttribute("value")
        const field = document.querySelector(`.attendance td[no="${no}"]`)
        updateAttendanceByHolder(event_id, id, 0)
        .then(() => {
            window.location.reload()
            // field.innerHTML = `
            // NA 
            // <button class="modify-time" no="${no}">📝</button>
            // `
            // const modify_time = document.querySelector(`.attendance td[no="${no}"] .modify-time`)
            // addListenerModify(modify_time, no)
        })
        .catch((error) => {
            if (!alert(error)) {
                window.location.reload()
            }
        })
    })
}

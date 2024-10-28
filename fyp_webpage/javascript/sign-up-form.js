import { updatePw, updateEmail, register, getLocalUser, updateUserProfile } from "./firebase.js";

let password = document.querySelector("#password")
let confirm_password = document.querySelector("#confirm-password")
let samePassword = false;

function confirmPassword() {
    let reminder = document.querySelector(".input-box #confirm-password+ion-icon+.reminder-group")
    if (password.value != confirm_password.value) {
        reminder.classList.add("active")
        confirm_password.classList.add("invaild")
        samePassword = false
    } else {
        reminder.classList.remove("active")
        confirm_password.classList.remove("invaild")
        samePassword = true
    }
}

function checkRegularExpression(expression) {
    return expression.test(password.value)
}

function checkPassword() {
    let reminder_list = document.querySelectorAll(".reminder-group ul li");
    
    if (checkRegularExpression(/^[a-zA-Z\d!@#$%&]{8,16}$/)) {
        reminder_list[0].classList.add("vaild")
    } else {
        reminder_list[0].classList.remove("vaild")
    }
    
    if (checkRegularExpression(/^.*[a-zA-Z].*$/) && checkRegularExpression(/^.*\d.*$/)) {
        reminder_list[1].classList.add("vaild")
    } else {
        reminder_list[1].classList.remove("vaild")
    }

    if (checkRegularExpression(/^.*[!@#%&].*$/)) {
        reminder_list[2].classList.add("vaild")
    } else {
        reminder_list[2].classList.remove("vaild")
    }
    
    if (checkRegularExpression(/^.*[A-Z].*$/)) {
        reminder_list[3].classList.add("vaild")
    } else {
        reminder_list[3].classList.remove("vaild")
    }

    if (checkRegularExpression(/^.*[a-z].*$/)) {
        reminder_list[4].classList.add("vaild")
    } else {
        reminder_list[4].classList.remove("vaild")
    }
}

function vaildPassword() {
    let reminder_list = document.querySelectorAll(".reminder-group ul li");
    let vaild = true
    reminder_list.forEach((reminder) => {
        if (!reminder.classList.contains("vaild")) {
            vaild = false
        }
    })

    return vaild;
}


password.addEventListener("input", confirmPassword)
confirm_password.addEventListener("input", confirmPassword)
password.addEventListener("input", checkPassword)

let password_icon = document.querySelectorAll(".input-form .input-box input:is(#password, #confirm-password, #old-password)+ion-icon")
password_icon.forEach((icon) => {
    let input_field = icon.parentNode.querySelector("input")
    icon.addEventListener("click", () => {
        if (icon.name == "eye-off-outline") {
            input_field.type = "text"
            icon.name = "eye-outline"
        } else {
            input_field.type = "password"
            icon.name = "eye-off-outline"
        }
    })
})

let personal_btn = document.querySelector("#personal")
personal_btn.addEventListener("change", () => {
    let org_name = document.querySelector(".input-box:has(label[for='company-name'])")
    let org_address = document.querySelector(".input-box:has(label[for='company-address'])")
    let name_input = org_name.querySelector("input")
    let address_input = org_address.querySelector("input")
    if (personal_btn.checked == true) {
        org_name.classList.add("deactive");
        name_input.readOnly = true
        name_input.value = ""

        org_address.classList.add("deactive");
        address_input.readOnly = true
        address_input.value = ""
    } else {
        org_name.classList.remove("deactive");
        name_input.readOnly = false

        org_address.classList.remove("deactive");
        address_input.readOnly = false
    }
})

let submit_btn = document.querySelector(".submit-btn")
submit_btn.addEventListener("click", () => {

    if (type == "change-pf") {
        updateUserProfile()
        return
    }

    if (type == "change-email") {
        updateEmail()
        return
    }

    if (!samePassword) {
        window.alert("The two password is different!")
        return
    }

    if (!vaildPassword()) {
        window.alert("Your password does't fit the requirement!")
        return
    }

    if (type == "change-pw") {
        updatePw()
        return
    }

    register();

    return
})


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const type = urlParams.get("type")

if (type == "change-pf") {
    getLocalUser()
    .then((user) => {
        const email_div = document.querySelector(".input-box:has(#email)")
        email_div.style.visibility = "hidden"
        email_div.style.position = "fixed"

        const first_name = document.querySelector("#first-name")
        const last_name = document.querySelector("#last-name")
        const company_name = document.querySelector("#company-name")
        const company_address = document.querySelector("#company-address")
        const contact = document.querySelector("#contact");
        const personal = document.querySelector("#personal");

        const title = document.querySelector(".form-title")
        title.innerText = "Update Profile"

        first_name.value = user.first_name
        last_name.value = user.last_name
    

        contact.value = user.contact

        console.log(user.personal)
        if (!user.personal) {
            const person_btn =  document.querySelector(`label[for="personal"]`)
            person_btn.click()
            company_name.value = user.organization
            company_address.value = user.organization_address
        }

        const password =  document.querySelector(`.input-box:has(#password)`)
        const confirm_password =  document.querySelector(`.input-box:has(#confirm-password)`)

        password.style.visibility = "hidden"
        password.style.position = "fixed"
        confirm_password.style.visibility = "hidden"
        confirm_password.style.position = "fixed"

        submit_btn.innerText = "Update"
    })
    .catch((error) => {
        console.log(error)
        //window.location = "../signIn.html"
    })
} else if (type == "change-email"){
    const boxes = document.querySelectorAll(".input-box")
    let email_box = ""
    boxes.forEach(box => {
        if (box.innerText.includes("Email")) {
            email_box = box
            return
        }
        box.style.visibility = "hidden"
        box.style.position = "fixed"
    })

    const title = document.querySelector(".form-title")
    title.innerText = "Update Email"

    email_box.innerHTML += `
        <div class="input-box">
            <label for="new-email">New Email</label>
            <input type="email" id="new-email" name="new-email" required>
        </div>
    `
    submit_btn.innerText = "Update"
} else if (type == "change-pw"){

    const boxes = document.querySelectorAll(".input-box")
    boxes.forEach(box => {
        if (box.innerText.includes("Password")) {
            if (box.innerText.includes("Old")) {
                box.classList.add("active")
            }else if (!box.innerText.includes("Confirm")) {
                box.children[1].innerText = "New Password"
            } 
            return
        }
        box.style.visibility = "hidden"
        box.style.position = "fixed"
    })

    const title = document.querySelector(".form-title")
    title.innerText = "Update Password"

    submit_btn.innerText = "Update"
}


const headerMenuLinks = document.querySelectorAll('.headerMenu a');
let bodyToDosCreatorBoxNameInput = document.getElementById("bodyToDosCreatorBoxNameInput")
let bodyToDosCreatorBtn = document.querySelector(".bodyToDosCreatorBtn")
let toDoNameTable;
let number;
let anyToDoFound = false
let toDoListTable = document.querySelector(".toDoListTable")

let userUsername;
let userLoggedIn = false
let modalLoginBtn = document.querySelector(".modalLoginBtn")

let todosTableHeaderRow = document.querySelector(".todosTableHeaderRow")
let loginBtnHeader = document.querySelector(".loginBtn")

let headerMenuElement = document.querySelector(".headerMenu")
let bodyToDosCreatedBox = document.querySelector(".bodyToDosCreatedBox")
let bodyToDosErrorsMessages = document.querySelector(".bodyToDosErrorsMessages")

let checkBoxes = document.querySelectorAll(".checkboxes")
// Initialize Parse
Parse.initialize(
    "3NPtJFuWZZEg3pi7e7SFETucsPSVgS5Si8fxZeRo",
    "RDtRQ0WT80183L5mabbnnEI2Z6LyVh0IT6gKMVOe"
); //PASTE HERE YOUR Back4App APPLICATION ID AND YOUR JavaScript KEY
Parse.serverURL = "https://parseapi.back4app.com/";

async function createNewToDo() {
    if (bodyToDosCreatorBoxNameInput.value && userLoggedIn) {
        changeCreatedToDosBackground()
        number = await numberGeneratorToDo()
        toDoNameTable = bodyToDosCreatorBoxNameInput.value
        let creationDateTable = logIranDate()
        let creationTimeTable = logIranTime()

        let newToDoRowInTable = `<tr>
        <td>#${number}</td>
        <td class="toDoNamesClass">${toDoNameTable}</td>
        <td>${creationDateTable}</td>
        <td>${creationTimeTable}</td>
        <td><input class="form-check-input checkboxes" type="checkbox" value="" id="${number}CheckBox"></td>
        </tr>`
        todosTableHeaderRow.insertAdjacentHTML("afterend", newToDoRowInTable);

        const CreateToDosClassDB = Parse.Object.extend("ToDos");
        const createToDosClassDB = new CreateToDosClassDB();
        createToDosClassDB.set("username", userUsername)
        createToDosClassDB.set("number", number)
        createToDosClassDB.set("toDoName", toDoNameTable)
        createToDosClassDB.set("creationDate", creationDateTable)
        createToDosClassDB.set("creationTime", creationTimeTable)
        createToDosClassDB.set("checkBox", false)
        createToDosClassDB.save().then((result) => {
            // console.log("New ToDo Created:", result);
            bodyToDosCreatorBoxNameInput.value = ""
            showMessageWhenAddToDo("New To-Do Created!", "complete")
            addEventToCheckBoxes()

        }).catch((error) => {
            // console.log("Error creating new todo:", error);
            showMessageWhenAddToDo(error, "error");
        });
    } else {
        showMessageWhenAddToDo("Please Login to add ToDo", "error")
    }
}



// Add click event listener to each menu link
headerMenuLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault(); // prevent default link behavior

        // Remove active class from all links
        headerMenuLinks.forEach(link => link.classList.remove('active'));

        // Add active class to clicked link
        this.classList.add('active');

        // Remove active class after 1 second
        setTimeout(() => {
            this.classList.remove('active');
        }, 300);
    });
});

function logIranDate() {
    let today = new Date().toLocaleDateString('fa-IR');
    return convertToEnglishNumber(today);
}


// For converting persian numbers to english numbers
function convertToEnglishNumber(persianNumber) {
    const persianDigits = /[\u06F0-\u06F9]/g;
    const persianToEnglish = {
        "۰": "0",
        "۱": "1",
        "۲": "2",
        "۳": "3",
        "۴": "4",
        "۵": "5",
        "۶": "6",
        "۷": "7",
        "۸": "8",
        "۹": "9",
    };
    return persianNumber.replace(
        persianDigits,
        (match) => persianToEnglish[match]
    );
}


function logIranTime() {
    let iranTime = new Date().toLocaleTimeString('fa-IR', { timeZone: 'Asia/Tehran' });
    return convertToEnglishNumber(iranTime);
}

async function numberGeneratorToDo() {
    await isThereAnyToDoDB();
    if (anyToDoFound) {
        number = latestToDoDBNumber + 1
        return number
    } else {
        number = 1
        return number
    }
}
async function login() {
    const email = document.getElementById("modalLoginEmailInput").value;
    const password = document.getElementById("modalLoginPasswordInput").value;
    try {
        // Use the static logIn method of the Parse.User object to log in the user
        const user = await Parse.User.logIn(email, password);
        // If successful, redirect to the home page or do something else
        // console.log(`Logged in successfully as ${user.get("username")}`);
        userUsername = user.get("username");
        userLoggedIn = true;
        loadUserToDosFromDB()
        removeLoginBtn()
        showMessageWhenAddToDo("You Logged in , Welcome!", "complete")
        generateCookie("token", generateToken(), generateExpireTime())
    } catch (error) {
        // If unsuccessful, notify the user or do something else
        showMessageWhenAddToDo(error.message, "error")
        // console.log(`Error: ${error.message}`);
        userLoggedIn = false
    }
}

async function isThereAnyToDoDB() {
    const CreateToDosClassDB = Parse.Object.extend("ToDos");
    const readToDoesClassDB = new Parse.Query(CreateToDosClassDB);
    readToDoesClassDB.equalTo("username", userUsername);
    try {
        const results = await readToDoesClassDB.find();
        if (results.length > 0) {
            let resultIndexNum = results.length - 1
            latestToDoDBNumber = results[resultIndexNum].get('number')
            anyToDoFound = true
        }
    } catch (error) {
        showMessageWhenAddToDo(error, "error")
        // console.log("Error finding todo items:", error);
    }
}

async function loadUserToDosFromDB() {
    const CreateToDosClassDB = Parse.Object.extend("ToDos");
    const readToDoesClassDB = new Parse.Query(CreateToDosClassDB);
    readToDoesClassDB.equalTo("username", userUsername);
    try {
        const results = await readToDoesClassDB.find();
        if (results.length > 0) {
            results.forEach(function (toDoRow) {
                let numberGotFromDB = toDoRow.get("number")
                let toDoNameGotFromDB = toDoRow.get("toDoName")
                let creationDateGotFromDB = toDoRow.get("creationDate")
                let creationTimeGotFromDB = toDoRow.get("creationTime")
                let checkBoxGotFromDB = toDoRow.get("checkBox")
                if (checkBoxGotFromDB) {
                    let newToDoRowInTable = `<tr>
                    <td>#${numberGotFromDB}</td>
                    <td class="toDoNamesClass">${toDoNameGotFromDB}</td>
                    <td>${creationDateGotFromDB}</td>
                    <td>${creationTimeGotFromDB}</td>
                    <td><input class="form-check-input checkboxes" type="checkbox" value="" id="${number}CheckBox" checked></td>
                    </tr>`
                    todosTableHeaderRow.insertAdjacentHTML("afterend", newToDoRowInTable);
                    changeCreatedToDosBackground()
                } else {
                    let newToDoRowInTable = `<tr>
                    <td>#${numberGotFromDB}</td>
                    <td class="toDoNamesClass">${toDoNameGotFromDB}</td>
                    <td>${creationDateGotFromDB}</td>
                    <td>${creationTimeGotFromDB}</td>
                    <td><input class="form-check-input checkboxes" type="checkbox" value="" id="${number}CheckBox"></td>
                    </tr>`
                    todosTableHeaderRow.insertAdjacentHTML("afterend", newToDoRowInTable);
                    changeCreatedToDosBackground()
                }
            })
            addEventToCheckBoxes()

        }
    } catch (error) {
        console.log("Error finding todo items:", error);
    }
}

function removeLoginBtn() {
    loginBtnHeader.style.display = "none"
    headerMenuElement.style.float = "right"
    headerMenuElement.style.marginRight = "100px"
}

function changeCreatedToDosBackground() {
    bodyToDosCreatedBox.classList.add("btdcbCSS")
}


function showMessageWhenAddToDo(message, type) {
    if (type == "error") {
        bodyToDosErrorsMessages.style.display = "block"
        bodyToDosErrorsMessages.style.color = "red"
        bodyToDosErrorsMessages.innerHTML = message
    } else if (type == "complete") {
        bodyToDosErrorsMessages.style.display = "block"
        bodyToDosErrorsMessages.style.color = "green"
        bodyToDosErrorsMessages.innerHTML = message
    } else {
        bodyToDosErrorsMessages.style.display = "none"

    }
}



// For Generating Login Cookie For User
function generateCookie(name, value, expireTime) {
    if (document.cookie.indexOf(`${name}=`) === -1) {


        const CreateLoginCookieDB = Parse.Object.extend("UsersSessions");
        const createLoginCookieDB = new CreateLoginCookieDB();
        createLoginCookieDB.set("token", value)
        createLoginCookieDB.set("username", userUsername)
        createLoginCookieDB.save().then((result) => {
            document.cookie = `${name}=${value};expires=${expireTime.toUTCString()};path=/`;
        }).catch((error) => {
            console.log("Error saving user login session:", error);
        });
    }
}

function generateExpireTime() {
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 24);
    return expireTime;
}

function generateToken() {
    const tokenBytes = new Uint8Array(16);
    crypto.getRandomValues(tokenBytes);
    const token = btoa(String.fromCharCode.apply(null, tokenBytes));
    return token;
}

async function autoUserLogInWithCookie() {
    // Check if the "token" cookie exists
    if (document.cookie.indexOf('token=') !== -1) {
        // Get the value of the "token" cookie
        const tokenValue = getCookie('token');

        // Query the "UsersSessions" class to find the row with the given token
        const UsersSessions = Parse.Object.extend('UsersSessions');
        const query = new Parse.Query(UsersSessions);
        query.equalTo('token', tokenValue);
        const results = await query.find();

        // If the query returns a result, use the username to find the email and password in the "User" class
        if (results.length > 0) {
            const username = results[0].get('username');
            const User = Parse.Object.extend('User');
            const userQuery = new Parse.Query(User);
            userQuery.equalTo('username', username);
            const userResults = await userQuery.find();

            // If the user is found, log in with their email and password
            if (userResults.length > 0) {
                const email = userResults[0].get('email');
                const password = userResults[0].get('globalpassword');
                autoLoginWithCookie(email, password);
            }
        }
    }
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(`${name}=`.length, cookie.length);
        }
    }
    return null;
}

async function autoLoginWithCookie(email, password) {
    try {
        // Use the static logIn method of the Parse.User object to log in the user
        const user = await Parse.User.logIn(email, password);
        // If successful, redirect to the home page or do something else
        // console.log(`Logged in successfully as ${user.get("username")}`);
        userUsername = user.get("username");
        userLoggedIn = true;
        loadUserToDosFromDB()
        removeLoginBtn()
        showMessageWhenAddToDo("auto Logged in , Welcome!", "complete")
        generateCookie("token", generateToken(), generateExpireTime())
    } catch (error) {
        // If unsuccessful, notify the user or do something else
        showMessageWhenAddToDo(error.message, "error")
        // console.log(`Error: ${error.message}`);
        userLoggedIn = false
    }
}

async function updateToDoCheckbox(event) {
    // Get the todo name from the parent <tr> element
    const todoName = event.target.closest('tr').querySelector('.toDoNamesClass').textContent.trim();

    // Get the current value of the checkbox
    const checkbox = event.target;
    const checked = checkbox.checked;

    // Update the "ToDos" class in the database
    const ToDos = Parse.Object.extend('ToDos');
    const query = new Parse.Query(ToDos);
    query.equalTo('username', userUsername);
    query.equalTo('toDoName', todoName);
    const results = await query.find();

    if (results.length > 0) {
        const toDo = results[0];
        toDo.set('checkBox', checked);
        await toDo.save();
    }
}

function addEventToCheckBoxes() {
    const checkBoxes = document.querySelectorAll('.checkboxes');
    // Add event listeners to all checkboxes
    checkBoxes.forEach(checkBox => {
        checkBox.addEventListener('change', updateToDoCheckbox);
    });

}


bodyToDosCreatorBtn.addEventListener("click", function () {
    createNewToDo()
})

modalLoginBtn.addEventListener("click", function () {
    login()
    isThereAnyToDoDB()
})

document.addEventListener("DOMContentLoaded", function () {
    autoUserLogInWithCookie();
});



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
        <td>${toDoNameTable}</td>
        <td>${creationDateTable}</td>
        <td>${creationTimeTable}</td>
        </tr>`
        todosTableHeaderRow.insertAdjacentHTML("afterend", newToDoRowInTable);

        const CreateToDosClassDB = Parse.Object.extend("ToDos");
        const createToDosClassDB = new CreateToDosClassDB();
        createToDosClassDB.set("username", userUsername)
        createToDosClassDB.set("number", number)
        createToDosClassDB.set("toDoName", toDoNameTable)
        createToDosClassDB.set("creationDate", creationDateTable)
        createToDosClassDB.set("creationTime", creationTimeTable)
        createToDosClassDB.save().then((result) => {
            // console.log("New ToDo Created:", result);
            bodyToDosCreatorBoxNameInput.value = ""
            showMessageWhenAddToDo("New To-Do Created!", "complete")

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
                let newToDoRowInTable = `<tr>
                <td>#${numberGotFromDB}</td>
                <td>${toDoNameGotFromDB}</td>
                <td>${creationDateGotFromDB}</td>
                <td>${creationTimeGotFromDB}</td>
                </tr>`
                todosTableHeaderRow.insertAdjacentHTML("afterend", newToDoRowInTable);
                changeCreatedToDosBackground()
            })
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


bodyToDosCreatorBtn.addEventListener("click", function () {
    createNewToDo()
})

modalLoginBtn.addEventListener("click", function () {
    login()
    isThereAnyToDoDB()
})
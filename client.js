const socket = io();

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

let username = prompt("Enter name");
let selectedId = "";

socket.emit("join", { username });

const chat = document.getElementById("chat");


// ================= SEND MESSAGE =================
function sendMsg() {

    const msg = document.getElementById("msg").value.trim();

    if (msg === "") return;

    socket.emit("message", {
        id: Date.now().toString(),
        sender: username,
        message: msg
    });

    document.getElementById("msg").value = "";
}


// ================= RECEIVE MESSAGE =================
socket.on("message", (data) => {

    let side = data.sender === username ? "right" : "left";

    chat.innerHTML += `
    <div class="msg ${side}"
         id="${data.id}"
         ondblclick="openDelete('${data.id}')">

        <div class="name">${data.sender}</div>

        <div>${data.message}</div>

    </div>
    `;

    chat.scrollTop = chat.scrollHeight;

});


// ================= SEND FILE =================
function sendFile() {

    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file");
        return;
    }

    const form = new FormData();

    form.append("file", file);

    fetch("/upload", {
        method: "POST",
        body: form
    })

    .then(res => res.json())

    .then(data => {

        socket.emit("fileMessage", {

            id: Date.now().toString(),

            sender: username,

            file: data.file,

            type: data.type,

            name: data.original

        });

        fileInput.value = "";

    })

    .catch(err => console.log(err));

}



// ================= RECEIVE FILE =================
socket.on("fileMessage", (data) => {

    let side = data.sender === username ? "right" : "left";

    let content = "";



    // IMAGE
    if (data.type.startsWith("image/")) {

        content = `

        <img
        src="/uploads/${data.file}"
        class="chat-image"
        draggable="false"
        oncontextmenu="return false">

        `;

    }



    // PDF
    else if (data.type === "application/pdf") {

        content = `

        <iframe
        src="/uploads/${data.file}"
        width="250"
        height="300"
        style="border:none">
        </iframe>

        `;

    }



    // DOCX
    else if (
        data.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {

        content = `

        <div>
            📝 ${data.name}
        </div>

        `;

    }



    // EXCEL
    else if (
        data.type.includes("spreadsheet") ||
        data.type.includes("excel")
    ) {

        content = `

        <div>
            📊 ${data.name}
        </div>

        `;

    }
        // AUDIO
    else if (data.type.startsWith("audio/")) {

        content = `

        <audio controls
               controlsList="nodownload"
               oncontextmenu="return false">

            <source src="/uploads/${data.file}"
                    type="${data.type}">

        </audio>

        `;

    }



    // VIDEO
    else if (data.type.startsWith("video/")) {

        content = `

        <video width="250"
               controls
               controlsList="nodownload"
               disablePictureInPicture
               oncontextmenu="return false">

            <source src="/uploads/${data.file}"
                    type="${data.type}">

        </video>

        `;

    }



    // OTHER FILES
    else {

        content = `

        <div>
            📎 ${data.name}
        </div>

        `;

    }



    chat.innerHTML += `

    <div class="msg ${side}"
         id="${data.id}"
         ondblclick="openDelete('${data.id}')">

        <div class="name">

            ${data.sender}

        </div>

        ${content}

    </div>

    `;

    chat.scrollTop = chat.scrollHeight;

});



// ================= USERS =================
socket.on("users", (users) => {

    document.getElementById("users").innerHTML =
        users.map(user => `
            <div>${user.username}</div>
        `).join("");

});



// ================= OPEN DELETE MODAL =================
function openDelete(id) {

    selectedId = id;

    document.getElementById("deleteModal").style.display = "flex";

}



// ================= CLOSE MODAL =================
function closeModal() {

    document.getElementById("deleteModal").style.display = "none";

}



// ================= DELETE FOR ME =================
function deleteForMe() {

    const msg = document.getElementById(selectedId);

    if (msg) {

        msg.remove();

    }

    closeModal();

}



// ================= DELETE FOR EVERYONE =================
function deleteForEveryone() {

    socket.emit("deleteMessage", selectedId);

    closeModal();

}



// ================= RECEIVE DELETE EVENT =================
socket.on("deleteMessage", (id) => {

    const msg = document.getElementById(id);

    if (msg) {

        msg.remove();

    }

});
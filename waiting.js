function aiChatbox() {
    document.getElementById("aiChatArea").style.display = "block"    
}

document.getElementById("aiChatBtn").addEventListener("click", aiChatbox)

function aisendMessage(){
    const aimessageInput = document.getElementById("aiInput")
    const aimessage = aimessageInput.value.trim()
    if (aimessage) {
        const aimsg = document.createElement("p")
        aimsg.classList.add("myMessage")
        aimsg.innerText = aimessage
        document.querySelector("#aiMessages").appendChild(aimsg)
        document.getElementById("aiChatArea").scrollTop = document.getElementById("aiChatArea").scrollHeight
        aimessageInput.value = ""
    }
};
document.getElementById("aiSendBtn").addEventListener("click", aisendMessage)
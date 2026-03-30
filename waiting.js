function aiChatbox() {
    document.getElementById("aiChatArea").style.display = "block"   
    const aiMsg = document.createElement("p");
    aiMsg.classList.add("theirMessage");
    aiMsg.innerText = "Hey! Looks like you're waiting. What's on your mind today?";

    document.getElementById("aiMessages").appendChild(aiMsg); 
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
document.getElementById("aiInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        aisendMessage();
    }
});
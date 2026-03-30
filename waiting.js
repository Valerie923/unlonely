const sessionId = Date.now().toString();

function aiChatbox() {
    document.getElementById("aiChatArea").style.display = "block";
    const aiMsg = document.createElement("p");
    aiMsg.classList.add("theirMessage");
    aiMsg.innerText = "Hey! Looks like you're waiting. What's on your mind today?";
    document.getElementById("aiMessages").appendChild(aiMsg);
}


document.getElementById("aiChatBtn").addEventListener("click", aiChatbox, { once: true });

async function aisendMessage() {
    const aimessageInput = document.getElementById("aiInput");
    const aimessage = aimessageInput.value.trim();
    if (aimessage) {
        const aimsg = document.createElement("p");
        aimsg.classList.add("myMessage");
        aimsg.innerText = aimessage;
        document.getElementById("aiMessages").appendChild(aimsg);
        document.getElementById("aiChatArea").scrollTop = document.getElementById("aiChatArea").scrollHeight;
        aimessageInput.value = "";
        try {
            const response = await fetch("/ai-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: aimessage, sessionId: sessionId })
            });
            const data = await response.json();
            const botMsg = document.createElement("p");
            botMsg.classList.add("theirMessage");
            botMsg.innerText = data.reply;
            document.getElementById("aiMessages").appendChild(botMsg);
            document.getElementById("aiChatArea").scrollTop = document.getElementById("aiChatArea").scrollHeight;
        } catch (error) {
            console.error("Error talking to AI:", error);
        }
    }
}

document.getElementById("aiSendBtn").addEventListener("click", aisendMessage);
document.getElementById("aiInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") aisendMessage();
});
arr = [
    'test'
];

var speechRecog = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
//recognition.interimResults = true;
recognition.start()

console.log("test")

recognition.onresult = function(event) {
    if (arr.includes(event.results[0][0].transcript)) {
        console.log("Put event logic here")
    }
}

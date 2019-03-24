console.log("Listener Extension running");
// window.addEventListener ("load", setup, false);

window.browser = (function() {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

startSketch();

var navigationCommands = [
    "scrolldown",
    "scrollup",
    "goback",
    "goforward",
    "refresh",
    "newurl"
];

var WORDS_TO_SHOW = 4;

var cnv;
var commands = [];
var linkIndices = 1;
var scrollY = 0;
var newScroll = false;
var scrollY2 = 850;
var scrollTop = 0;

function Commands(txt, command, link, color) {
    this.txt = txt;
    this.command = command;
    this.link = link;
    this.color = color;
    //this.output = (this.txt !== this.command) ? this.command + " >> " + this.txt : this.txt;

    // variable p is the instance of p5 being run
    this.writeText = function(x, y, p) {
        p.text(this.command, x, y);
    }
}

function speechRecognition() {
    var speechRecog = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;

    recognition.start();
    var index = 0;

    recognition.onresult = function() {
        console.log(event.results[index][0].transcript);
        for (let i = 0; i < commands.length; i++) {
            isSpokenEqualToLink = stringManipulation(event.results[index][0].transcript, commands[i].command);
            console.log(event.results[index][0].transcript);
            if (isSpokenEqualToLink) {
                console.log('success');
                window.location.href = commands[i].link;
            }
        }
        index++;
    }
}

function stringManipulation(spokenText, linkText) {
    spokenText = spokenText.replace(/\s+/g, ''); // Remove whitespace
    spokenText = spokenText.toLowerCase();

    let newURLCommand = spokenText.substring(0, 6);
    if (navigationCommands.indexOf(spokenText) > -1 || newURLCommand == "newurl") {
        executeNavigationCommand(spokenText);
    }

    linkText = linkText.replace(/\s+/g, ''); // Remove whitespace
    linkText = linkText.toLowerCase();
    if (spokenText == linkText) {
        return true;
    }

    return false;
}

function executeNavigationCommand(spokenText) {
    if (spokenText.substring(0, 6) == "newurl") {
        let website = spokenText.substring(6, spokenText.length);
        window.location.assign("http://www." + website);
        return;
    }
    switch (spokenText) {
        case "scrolldown":
            window.scrollBy(0, 500);
            break;
        case "scrollup":
            window.scrollBy(0, -500);
            break;
        case "goback":
            window.history.go(-1);
            break;
        case "goforward":
            window.history.go(+1);
            break;
        case "refresh":
            window.location.reload();
            break;
    }
}

function startSketch() {

    var sketch = function( p ) {
        p.setup = function() {
            cnv = p.createCanvas(400, 850);
            cnv.position(p.windowWidth - 420, 50);
            cnv.style('z-index', '999');
            p.background('#9ec3ff');

            p.fill(30);
            p.textSize(22);

            var links = document.getElementsByTagName('a');

            for (linkElement of links) {
                let link = linkElement.href;
                let txt = linkElement.text;
                if (!/\S/.test(txt)) {continue;}
                //let command = (txt.length > 20) ? "Link " + linkIndices++ : txt;
                let command;
                if (txt.length <= 20) {
                    command = txt;
                } else {
                    command = "Link " + linkIndices;
                    linkElement.text = command + ": " + linkElement.text;
                    linkIndices++;
                }
                let current = new Commands(txt, command, link);

                //linkElement.style['background-color'] = '#9988cc';
                //linkElement.style['color'] = 'white';
                //console.log(txt);

                commands.push(current);
            }

            speechRecognition();
        };

        p.draw = function() {
            p.background('#9ec3ff');
            scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

            if (scrollTop > 0) {
                cnv.position(p.windowWidth - 420, 50 + scrollTop);
            }
            
            this.windowResized = function() {
                cnv.position(p.windowWidth - 420, 50);
            }
            
            if (commands.length <= 21) {
                p.noLoop();
            }

            for (let i = 0; i < commands.length; i++) {
                let thisY = (i + 1) * 40 - scrollY;
                if (thisY > 0 && thisY <= 875) {
                    commands[i].writeText(40, thisY, p);
                }

                if (i === commands.length - 1 && thisY === 850) {
                    newScroll = true;
                }
                
                if (newScroll && i < 21) {
                    thisY = (i + 1) * 40 + scrollY2;
                    commands[i].writeText(40, thisY, p);
                }

            }

            if (newScroll) {
                scrollY2--;
                if (scrollY2 === 1) {
                    newScroll = false;
                    scrollY = 0;
                    scrollY2 = 850;
                }
            }
            scrollY++;
        };
    };

    var myp5 = new p5(sketch);
}
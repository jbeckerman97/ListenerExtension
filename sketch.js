console.log("SpeakEasy Extension running");

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
    "newurl",
    "newtab"
];

var WORDS_TO_SHOW = 4;

var cnv;
var commands = [];
var listCommands = [];
var linkIndices = 1;
var scrollY = 0;
var newScroll = false;
var scrollY2 = 850;
var scrollTop = 0;

function Commands(txt, command, link) {
/***
**** Commands(string, string, string, p5.Color) class
**** objects containing data concerning accessible links and
****    how their associated 'commands' will be displayed
***/
    this.txt = txt;
    this.command = command;
    this.link = link;

    // variable p is the instance of p5 being run
    this.writeText = function(x, y, p) {
    /***
    **** writeText(float, float, p5 object) child function
    **** allows for easy p5 text display for Commands objects
    ***/
        p.fill(56);
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
            if (isSpokenEqualToLink === 10) { break; }
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
        let navTest = executeNavigationCommand(spokenText);
        return navTest;
    }
    
    if (linkText.includes("&")) {
        linkText = linkText.replace("&", "and");
    }

    // If things stop working, get rid of and replace
    linkText = linkText.replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, ''); // Remove whitespace
    linkText = linkText.toLowerCase();

    if (spokenText === "lincone" && linkText === "link1") {
        return true;
    } else if (spokenText === "linkto" && linkText === "link2") {
        return true;
    } else if (spokenText === "linkfor" && linkText === "link4") {
        return true;
    }

    if (spokenText === linkText) {
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
        case "newtab":
            window.open("http://www.google.com");
            break;
    }

    return 10;
}


function startSketch() {
/***
**** startSketch() function
**** running p5.js library assets in instance mode (as opposed to global mode)
**** contains p5 runtime function sketch(p), where p is a new instance of p5
***/

    var sketch = function( p ) {
    /***
    **** sketch(p5 Object) function
    **** manage native p5 runtime functions setup(), draw(), and windowResized
    **** said functions and any other p5 functions or variables must be referenced
    ****    through the p5 object 'p'
    ***/
        p.setup = function() {
        /***
        **** setup() function
        **** initialize the canvas position and size based on the user's display dimensions
        **** analyze the webpage for all HTML <a> tags, and scrape data associated with them
        ****    relevent data includes the text within the <a> tag, and the href link it accesses
        **** populate this data into an array of Commands objects (defined near start of this file)
        ***/
            let canvasWidth = p.displayWidth * 0.2;
            let canvasHeight = p.displayHeight * 0.8;
            cnv = p.createCanvas(canvasWidth, canvasHeight);
            cnv.position(p.windowWidth - p.width, 50);
            // bring the canvas to the 'front' of the webpage so that
            //      HTML canvas elements on webpages won't cover the canvas
            cnv.style('z-index', '999');

            p.fill(30);
            p.textSize(22);

            var links = document.getElementsByTagName('a');

            for (linkElement of links) {
                let addToDisplay = false;
                let link = linkElement.href;
                let txt = linkElement.text;
                if (!/\S/.test(txt)) {continue;}
                //let command = (txt.length > 20) ? "Link " + linkIndices++ : txt;
                let command;
                if (txt.length <= 20) {
                    command = txt;
                    addToDisplay = true;
                } else {
                    command = "Link " + linkIndices;
                    linkElement.text = command + ": " + linkElement.text;
                    linkIndices++;
                }
                let current = new Commands(txt, command, link);
                if (addToDisplay) {
                    listCommands.push(current);
                }
                commands.push(current);
            }
            speechRecognition();
        }

        p.draw = function() {
        /***
        **** draw() function
        **** handles canvas repositioning if page is scrolled, or the window is resized
        **** displays text of the voice 'commands' that can be used to access links on the page
        **** displays this text as a continually scrolling list, unless all available commands 
        ****    can fit in the canvas at once
        ***/
            p.noStroke();
            p.fill(56);
            p.rect(0, 20, p.width * 0.95, p.height - 20);
            p.fill('#9ec3ff');
            p.rect(20, 0, p.width * 0.95, p.height - 20);
            scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

            if (scrollTop > 0) {
                cnv.position(p.windowWidth - p.width, 50 + scrollTop);
            }
            
            this.windowResized = function() {
                cnv.position(p.windowWidth - p.width , 50);
            }
            
            // p.floor((p.height - 20) * 0.025)
            if (listCommands.length <= 21) {
                p.noLoop();
            }

            for (let i = 0; i < listCommands.length; i++) {
                let thisY = (i + 1) * 40 - scrollY;
                if (thisY > 0 && thisY <= p.height) {
                    listCommands[i].writeText(p.width * 0.15, thisY, p);
                }

                if (i === listCommands.length - 1 && thisY == 850) {
                    newScroll = true;
                }
                
                if (newScroll && i < 21) {
                    thisY = (i + 1) * 40 + scrollY2;
                    listCommands[i].writeText(p.width * 0.15, thisY, p);
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

            p.windowResized = function() {
            /***
            **** windowResized() function
            **** reposition canvas upon the window being 'resized' (I think that's self explanatory)
            ***/
                cnv.position(p.windowWidth - p.width, 50);
            };
        };
    }

    // new instance of p5
    // sketch object referring to sketch() function defined above
    var myp5 = new p5(sketch);
}
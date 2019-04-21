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

var NEW_TAB_FLAG = 10;

var cnv;
var commands = [];
var listCommands = [];
var linkIndices = 1;
var scrollY = 0;
var newScroll = false;
var scrollY2;
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

    // Variable p is the instance of p5 being run
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
    /*** Function speechRecognition:
     *** This function is responsible for querying Google's Web Speech API, which returns a string containing the spoken word(s). It handles the recognition itself.
     *** While enabled, the user's microphone is always listening for valid keywords, which must be spoken inidividually without any other speech coming before or after the keyword/key phrase.
     ***/
    //var speechRecog = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
    var recognition = new webkitSpeechRecognition();

    recognition.continuous = true;

    recognition.start();
    var index = 0;

    recognition.onresult = function() {
        console.log(event.results[index][0].transcript);
        for (let i = 0; i < commands.length; i++) {
            isSpokenEqualToLink = stringManipulation(event.results[index][0].transcript, commands[i].command); // Determines if the user's speech is equal to a keyword/key phrase.
            if (isSpokenEqualToLink === NEW_TAB_FLAG) { break; }
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
    /*** Function stringManipulation:
     *** Parameters:
     ***    String spokenText: The user's spoken phrase
     ***    String linkText: The text of a hyperlink
     *** This function manipulates the parameter string to eliminate unspeakable characters (ex. quotes, symbols) and whitespace to ensure the spoken phrase and the desired text
     *** on a page can be compared successfully.
     ***/
    spokenText = spokenText.replace(/\s+/g, ''); // Removes whitespace from the user's spoken phrase.
    spokenText = spokenText.toLowerCase();

    /* The "New URL" command functions differently than other browser commands. The first six characters of the whitespace-removed and lowercase spokenText will be "newurl".
     * Additionally, browser navigation commands take higher priority over Internet navigation commands, so executeNavigationCommand() is called first.
     */
    let newURLCommand = spokenText.substring(0, 6);
    if (navigationCommands.indexOf(spokenText) > -1 || newURLCommand == "newurl") {
        let navTest = executeNavigationCommand(spokenText);
        return navTest;
    }
    
    /* Before spokenText and linkText can be compared, the "&" symbol must be replaced with "and" to match the user's dictated command. This is necessary because all non-alphanumeric
     * will be removed from linkText, which would also remove the "&" symbol and therefore make any links containing it uncomparable to spokenText.
     */
    if (linkText.includes("&")) {
        linkText = linkText.replace("&", "and");
    }

    // This first removes all non-alphanumeric characters and replaces them with spaces. All whitespace characters are removed afterwards.
    linkText = linkText.replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, ''); // Remove whitespace
    linkText = linkText.toLowerCase();

    // webkitSpeechRecognition has trouble interpreting the phrases "link 1," "link 2," and "link 4" when spoken. This if-else if ladder explicitly corrects any of these errors.
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
    /*** Function executeNavigationCommand:
     *** Parameters:
     ***    String spokenText: The user's spoken phrase with all whitespace removed
     *** This function executes browser navgation commands (as opposed to Internet navigation).
     ***/

    /* Navigating to a new URL requires slightly different behavior based on how user's use this command. The first six characters from spokenText are examined to make sure the command is
     * "newurl," with all remaining characters in spokenText being the website the user wants to navigate to. Finally, the appropriate prefix must be added to the start of the website.
     */
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

    /* The command to open a new tab will result in several new tabs being opened as a result of how webkitSpeechRecognition returns a transcript of the user's speech.
     * By returning a flag with a specified value, speechRecognition() can end its logic before that happens and only open a single new tab.
     */
    return NEW_TAB_FLAG;
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
            scrollY2 = p.height;

            p.fill(30);
            p.textSize(22);

            var links = document.getElementsByTagName('a');

            for (linkElement of links) {
                let addToDisplay = false;
                let link = linkElement.href;
                let txt = linkElement.text;
                // Replace "&" with "and" for speakability, replace all non-alphanumeric characters with whitespace, then remove all leading and trailing whitespace
                txt = txt.replace("&", "and").replace(/[^a-z0-9]/gmi, " ").trim()
                if (!/\S/.test(txt)) {continue;}
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
            
            let maxListElements = p.floor(p.height / 40);
            if (listCommands.length <= maxListElements) {
                p.noLoop();
            }

            for (let i = 0; i < listCommands.length; i++) {
                let thisY = (i + 1) * 40 - scrollY;
                if (thisY > 0 && thisY <= p.height) {
                    listCommands[i].writeText(p.width * 0.15, thisY, p);
                }

                if (i === listCommands.length - 1 && thisY <= p.height) {
                    newScroll = true;
                }
                
                if (newScroll && i <= maxListElements) {
                    thisY = (i + 1) * 40 + scrollY2;
                    listCommands[i].writeText(p.width * 0.15, thisY, p);
                }

            }

            if (newScroll) {
                scrollY2--;
                if (scrollY2 <= 1) {
                    newScroll = false;
                    scrollY = 0;
                    scrollY2 = p.height;
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
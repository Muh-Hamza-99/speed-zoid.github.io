const words = "wheat habitat equation upset wash banquet overlook air splurge restless brush infect extreme aspect nap flex sometimes the my name is something usually don't know why but it just happens I hate my life unorthodox inspirational quotes motivation can't why how when could possible never ever but couldn't dote love goat camel cow rabbit".split(" ");
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;

const addClass = (element, name) => element.className += " " + name;

const removeClass = (element, name) => element.className = element.className.replace(name, "");

const randomWord = () => {
    const randomIndex = Math.ceil(Math.random() * words.length);
    return words[randomIndex - 1];
};

const formatWord = word => {
    return `<div class="word"><span class="letter">${word.split("").join("</span><span class='letter'>")}</span></div>`
};

const newGame = () => {
    document.getElementById("words").innerHTML = "";
    for (let i = 0; i < 50; i++) {
        document.getElementById("words").innerHTML += formatWord(randomWord(words));
    };
    addClass(document.querySelector(".word"), "current");
    addClass(document.querySelector(".letter"), "current");
    document.getElementById("info").innerHTML = (gameTime / 1000) + "";
    window.timer = null;
};

const getWordsPerMinute = () => {
    const words = [...document.querySelectorAll(".word")];
    const lastTypedWord = document.querySelector(".word.current");
    const lastTypedWordIndex = words.indexOf(lastTypedWord);
    const typedWords = words.slice(0, lastTypedWordIndex);
    const correctWords = typedWords.filter(word => {
        const letters = [...word.children];
        const wrongLetters = letters.filter(letter => letter.className.includes("incorrect"));
        const correctLetters = letters.filter(letter => letter.className.includes("correct"));
        return wrongLetters.length === 0 && correctLetters.length === letters.length;
    });
    return (correctWords.length / gameTime) * 60000;
};

const gameOver = () => {
    clearInterval(window.timer);
    addClass(document.getElementById("game"), "over");
    document.getElementById("info").innerHTML = `WPM: ${getWordsPerMinute()}`
};

document.getElementById("game").addEventListener("keyup", event => {
    const key = event.key;
    const currentWord = document.querySelector(".word.current");
    const currentLetter = document.querySelector(".letter.current");
    const expected = currentLetter?.innerHTML || " ";
    const isLetter = key.length === 1 && key !== " ";
    const isSpace = key === " ";
    const isBackspace = key === "Backspace";
    const isFirstLetter = currentLetter === currentWord.firstChild;
    if (document.querySelector("#game.over")) return;
    if (!window.timer && isLetter) {
        window.timer = setInterval(() => {
            if (!window.gameStart) {
                window.gameStart = (new Date()).getTime();
            };
            const currentTime = (new Date()).getTime();
            const millisecondsPassed = currentTime - window.gameStart;
            const secondsPassed = Math.round(millisecondsPassed / 1000);
            const secondsLeft = (gameTime / 1000) - secondsPassed;
            if (secondsLeft <= 0) {
                gameOver();
                return;
            };
            document.getElementById("info").innerHTML = secondsLeft + "";
        }, 1000);
    };
    if (isLetter) {
        if (currentLetter) {
            addClass(currentLetter, key === expected ? "correct" : "incorrect");
            removeClass(currentLetter, "current");
            if (currentLetter.nextSibling) addClass(currentLetter.nextSibling, "current");
        } else {
            const incorrectLetter = document.createElement("span");
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = "letter incorrect extra";
            currentWord.appendChild(incorrectLetter);
        };
    };
    if (isSpace) {
        if (expected !== " ") {
            const lettersToInvalidate = [...document.querySelectorAll(".word.current .letter:not(.correct)")]
            lettersToInvalidate.forEach(letter => {
                addClass(letter, "incorrect");
            });
        };
        removeClass(currentWord, "current");
        addClass(currentWord.nextSibling, "current");
        if (currentLetter) removeClass(currentLetter, "current");
        addClass(currentWord.nextSibling.firstChild, "current");
    };
    if (isBackspace) {
        if (currentLetter && isFirstLetter) {
            removeClass(currentWord, "current");
            addClass(currentWord.previousSibling, "current");
            removeClass(currentLetter, "current");
            addClass(currentWord.previousSibling.lastChild, "current");
            removeClass(currentWord.previousSibling.lastChild, "incorrect");
            removeClass(currentWord.previousSibling.lastChild, "correct");
        };
        if (currentLetter && !isFirstLetter) {
            removeClass(currentLetter, "current");
            addClass(currentLetter.previousSibling, "current");
            removeClass(currentLetter.previousSibling, "incorrect");
            removeClass(currentLetter.previousSibling, "correct");
        };
        if (!currentLetter) {
            addClass(currentWord.lastChild, "current");
            removeClass(currentWord.previousSibling, "incorrect");
            removeClass(currentWord.previousSibling, "correct");
        };
    };
    if (currentWord.getBoundingClientRect().top > 250) {
        const wordsDiv = document.getElementById("words");
        const margin = parseInt(wordsDiv.style.marginTop || "0px");
        wordsDiv.style.marginTop = (margin - 35) + "px";
    };
    const nextLetter = document.querySelector(".letter.current");
    const nextWord = document.querySelector(".word.current");
    const cursor = document.getElementById("cursor");
    cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 2 + "px";
    cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? "left" : "right"] + "px";
});

document.getElementById("new-game-button").addEventListener("click", () => {
    gameOver();
    newGame();
});

newGame();
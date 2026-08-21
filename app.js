const baseURL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
// DOM Elements
const fontPreferenceButton = document.querySelector(".dropdown-toggle-btn");
const dropdownList = document.querySelector(".dropdown");
const themeToggleSwitch = document.getElementById("dark-mode");
const dictionaryFormEl = document.getElementById("dictionaryForm");
const searchTermEl = document.getElementById("searchTerm");
const errMsgEl = document.getElementById("errMsg");
// Searched term and phonetic DOM elements
const termEl = document.getElementById("termEl");
const phoneticEl = document.getElementById("phonetic");
const audioEl = document.getElementById("phoneticAudio");
const playAudioBtnEl = document.getElementById("playBtn");
const sourceLinkEl = document.getElementById("sourceLink");
const sourceLinkText = document.getElementById("linkText");
// Sections in HTML
const dictionaryResultSection = document.getElementById("dictionaryResult");
const detailDefinitionSection = document.getElementById("detailDefinition");
const notFoundSection = document.getElementById("notFound");
const pageFooter = document.getElementById("pageFooter");
// sr-only element
const searchStatusEl = document.getElementById("searchStatus");

let currentRequest = null;

const fontDisplayMap = {
    sans: "Sans Serif",
    serif: "Serif",
    mono: "Mono"
}

const updateFontButton = (font) => {
    if(!fontPreferenceButton) return;
    const buttonText = fontDisplayMap[font];
    fontPreferenceButton.firstElementChild.textContent = buttonText;
}

const closeDropdown = () => {
    fontPreferenceButton.setAttribute('aria-expanded', String(false));
    fontPreferenceButton.nextElementSibling.hidden = true;
}

if(fontPreferenceButton) {
    fontPreferenceButton.addEventListener("click", () => {
        const isExpanded = fontPreferenceButton.getAttribute('aria-expanded') === 'true';
        closeDropdown();
        if(!isExpanded) {
        fontPreferenceButton.setAttribute('aria-expanded', String(true));
        fontPreferenceButton.nextElementSibling.hidden = false; 
      }
 });
}

if(dropdownList) {
    dropdownList.addEventListener("click", function(e) {
    const listElement = e.target.closest("li");
    
    if(listElement) {
            let fontValue = listElement.dataset.value;
            
            if(!fontValue) return;

            dropdownList.querySelectorAll("[role='option']").forEach(opt => {
                opt.setAttribute("aria-selected", "false");
            });

            listElement.setAttribute("aria-selected", "true");

            updateFontButton(fontValue);
            
            const preferences = JSON.parse(localStorage.getItem("preferences"));
            preferences.font = fontValue;
            localStorage.setItem("preferences", JSON.stringify(preferences));

            document.documentElement.classList.remove("font-sans", "font-serif", "font-mono");
            document.documentElement.classList.add(`font-${preferences.font}`);

            closeDropdown();
        }
    });
}

// Arrow key navigation on dropdown
dropdownList.addEventListener("keydown", function(e) {
    const options = [...dropdownList.querySelectorAll("[role='option']")];
    const current = document.activeElement;
    const index = options.indexOf(current);    

    if(e.key === "ArrowDown") {
        e.preventDefault();
        const currentOption = options.find(option => {
            return option.getAttribute("tabindex") === "0"
        });
        currentOption.setAttribute("tabindex", "-1");

        const newOption = options[Math.min(index + 1, options.length - 1)];
        newOption.setAttribute("tabindex", "0");
        newOption.focus();
    }
    if(e.key === "ArrowUp") {
        e.preventDefault();
        const currentOption = options.find(option => {
            return option.getAttribute("tabindex") === "0"
        });
        currentOption.setAttribute("tabindex", "-1");
        const newOption = options[Math.max(index - 1, 0)];
        newOption.setAttribute("tabindex", "0");
        newOption.focus();
    }
    if(e.key === "Enter") {
        current.click();
    }
    if(e.key === "Escape") {
        closeDropdown();
    }
});

const updateTheme = (theme) => {
    // Toggle the class on the HTML element
    const isDark = theme === "dark";
    if(isDark) {
        document.documentElement.classList.remove("light-theme")
        document.documentElement.classList.add("dark-theme");
    } else {
        document.documentElement.classList.remove("dark-theme")
        document.documentElement.classList.add("light-theme");
    }

    if(themeToggleSwitch) {
        themeToggleSwitch.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
}

if(themeToggleSwitch) {
    themeToggleSwitch.addEventListener("change", function(e) {
        const isChecked = e.target.checked;
        let newTheme = isChecked ? "dark" : "light";
        updateTheme(newTheme);
        const preferences = JSON.parse(localStorage.getItem("preferences"));
        preferences.theme = newTheme;
        localStorage.setItem("preferences", JSON.stringify(preferences));
    });
}

const init = () => {
    const preferences = JSON.parse(localStorage.getItem("preferences"));
    if(!preferences) return;

    if(themeToggleSwitch) {
        themeToggleSwitch.checked = preferences.theme === "dark";
    }

    const savedOptions = dropdownList.querySelector(`[data-value = "${preferences.font}"]`);
    if(savedOptions) {
        savedOptions.setAttribute("aria-selected", "true");
    }

    updateFontButton(preferences.font)
    updateTheme(preferences.theme);
}

init();

// FETCH FROM API FUNCTIONALITY
async function fetchSearchedTerm(url, signal) {
    try {
        const resp = await fetch(url, {signal});

        if(resp.status === 404) {
            return {error: "notFound"}
        }

        if(!resp.ok) {
            return {error: "serverError"};
        }
        const data = await resp.json();
        return data;
    } catch (error) {
        if(error.name === "AbortError") {
            return  {error: "aborted"}
        }
        console.error(error);
        return {error: "networkError"};
    }
}

const createDefinitionItem = (def) => {
    const li = document.createElement("li");
    li.className = "definition-list-item";
    li.textContent = def.definition;

    if(def.example) {
        const paragraph = document.createElement("p");
        paragraph.className = "example";
        paragraph.textContent = `"${def.example}"`;
        li.appendChild(paragraph)
    }
    return li;
}

const createMeaningArticle = (meaning) => {
    const article = document.createElement("article");
    article.className = "definition-article";

    const divOut = document.createElement("div");
    divOut.className = "part-of-speech-wrapper";

    const p = document.createElement("p");
    p.className = "part-of-speech";
    p.textContent = `${meaning.partOfSpeech}`;

    const divIn = document.createElement("div");
    divIn.className = "line";

    divOut.append(p);
    divOut.append(divIn);

    const heading = document.createElement("h3");
    heading.className = "meaning-title";
    heading.textContent = "Meaning";

    const list = document.createElement("ul");
    list.className = "meaning-definition-list";

    for(const item of meaning.definitions.slice(0, 3)) {
        const listItem = createDefinitionItem(item);
        list.append(listItem);
    }

    article.append(divOut);
    article.append(heading);
    article.append(list);

    if(meaning.synonyms?.length) {
        const div = document.createElement("div");
        div.className = "synonyms-wrapper";

        const heading = document.createElement("h3");
        heading.textContent = "Synonyms";

        const p = document.createElement("p");
        p.className = "synonym-word";
        p.textContent = `${meaning.synonyms[0]}`

        div.append(heading);
        div.append(p);

        article.append(div);
    }
    
    return article;
}

const displayMeanings = (meanings) => {
    if(!detailDefinitionSection) return;
    for(const meaning of meanings) {
        const article = createMeaningArticle(meaning);
        detailDefinitionSection.append(article);
    }
}

if(dictionaryFormEl) {
    dictionaryFormEl.addEventListener("submit", async function(e) {
        e.preventDefault();

        if(currentRequest) {
            currentRequest.abort();
        }

        currentRequest = new AbortController();

        // Reset ALL sections first
        detailDefinitionSection.innerHTML = "";
        detailDefinitionSection.hidden = true;
        dictionaryResultSection.hidden = true;
        notFoundSection.hidden = true;
        pageFooter.hidden = true;

        // Clear error state
        searchTermEl.parentElement.classList.remove("error");
        errMsgEl.hidden = true;

        const word = searchTermEl.value.trim();
        // 1. empty check
        if(!word) {
            searchTermEl.parentElement.classList.add("error");
            errMsgEl.hidden = false;
            return
        };
         // 2. fetch data
        const data = await fetchSearchedTerm(`${baseURL}${word}`, currentRequest.signal);

        // 3. Handle different errors
        if(data.error === "aborted") return;

        if(data.error === "notFound") {
            notFoundSection.hidden = false;
            dictionaryResultSection.hidden = true;
            detailDefinitionSection.hidden = true;
            pageFooter.hidden = true;
            searchStatusEl.textContent = "No definitions found";
            return;
        }

        if(data.error === "networkError" || data.error === "serverError") {
            notFoundSection.hidden = false;
            dictionaryResultSection.hidden = true;
            detailDefinitionSection.hidden = true;
            pageFooter.hidden = true;
            notFoundSection.querySelector(".not-found-title").textContent = "Connection problem. Please try later."
            return;
        }
       
         // 4. if data → display everything
        notFoundSection.hidden = true;
        const entry = data[0];
        
        dictionaryResultSection.hidden = false;
        searchStatusEl.textContent = `Results found for ${entry.word}`;

        termEl.textContent = entry.word;
        termEl.focus(); // focus the searched word and aria-live will announce that for screen readers

        const phoneticAudio = entry.phonetics.find(p => p.audio);
        phoneticEl.textContent = entry.phonetic || phoneticAudio?.text || "";

        if(phoneticAudio?.audio) {
            // Note: some audio files may fail due to 
            // CORS headers missing on API server
            audioEl.crossOrigin = "anonymous";
            audioEl.src = phoneticAudio?.audio;
            playAudioBtnEl.hidden = false;
        } else {
            playAudioBtnEl.hidden = true;
        }

        detailDefinitionSection.hidden = false;
        displayMeanings(entry.meanings);

        pageFooter.hidden = false;
        sourceLinkEl.href = entry.sourceUrls[0];
        sourceLinkText.textContent = entry.sourceUrls[0];
    });
}

if(playAudioBtnEl) {
    playAudioBtnEl.addEventListener("click", () => {
        if(!audioEl.src) return;
        // New audio element to avoid CORS issue
        const audio = new Audio(audioEl.src);
        audio.play().catch(err => console.error("Audio playback failed: ", err));
    });
}

if(searchTermEl) {
    searchTermEl.addEventListener("input", function() {
        searchTermEl.parentElement.classList.remove("error");
        errMsgEl.hidden = true;
    });
}

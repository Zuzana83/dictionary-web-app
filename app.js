const baseURL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
// DOM Elements
const fontPreferenceButton = document.querySelector(".dropdown-toggle-btn");
const dropdownList = document.querySelector(".dropdown");
const themeToggleSwitch = document.getElementById("dark-mode");
const dictionaryFormEl = document.getElementById("dictionaryForm");
const searchTermEl = document.getElementById("searchTerm");

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
            let fontValue = listElement.dataset.value
            
            if(!fontValue) return;

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
        themeToggleSwitch.setAttribute("aria-checked", String(isChecked));
        const preferences = JSON.parse(localStorage.getItem("preferences"));
        preferences.theme = newTheme;
        localStorage.setItem("preferences", JSON.stringify(preferences));
    });
}


const init = () => {
    const preferences = JSON.parse(localStorage.getItem("preferences"));
    if(!preferences) return;

    if(themeToggleSwitch) {
        const isDark = preferences.theme === "dark";
        themeToggleSwitch.checked = isDark;
        themeToggleSwitch.setAttribute("aria-checked", String(isDark));
    }
    updateFontButton(preferences.font)
    updateTheme(preferences.theme);
}

init();

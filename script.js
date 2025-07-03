document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const wordElement = document.getElementById('word');
    const audioBtn = document.getElementById('audio-btn');
    const themeToggle = document.getElementById('theme-btn');
    const fontSelect = document.getElementById('font-select');
    const body = document.body;
    const resultContainer = document.querySelector('.result-container');
    const meaningsContainer = document.getElementById('meanings-container');

    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    const savedFont = localStorage.getItem('font');
    if (savedFont) {
        document.documentElement.style.setProperty('--font-family', savedFont);
        fontSelect.value = savedFont;
    }
    searchBtn.addEventListener('click', fetchWordData);
    searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && fetchWordData());
    themeToggle.addEventListener('change', toggleTheme);
    fontSelect.addEventListener('change', changeFont);

    // Fetch word data from API
    async function fetchWordData() {
        const word = searchInput.value.trim();
        if (!word) return;

        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!response.ok) throw new Error("Word not found");
            const data = await response.json();
            displayWordData(data[0]);
        } catch (error) {
            resultContainer.innerHTML = `
                <div class="error-message">
                    <p>${error.message}. Try another word.</p>
                </div>
            `;
            setTimeout(() => {
                resultContainer.innerHTML = `
                    <div class="word-header">
                        <h2 id="word">keyboard</h2>
                        <button id="audio-btn"><i class="fas fa-volume-up"></i></button>
                    </div>
                    <div class="word-details">
                        <p class="phonetic">/ˈkiːbɔːd/</p>
                    </div>
                    <div id="meanings-container">
                        <div class="meaning">
                            <p class="part-of-speech">noun</p>
                            <p class="meaning-label">meaning</p>
                            <p class="definition">A set of keys used to operate a typewriter, computer etc.</p>
                            <p class="example">"Keyboarding is the part of this job I hate the most."</p>
                            <p class="synonyms"><span>Synonyms: </span>electronic keyboard</p>
                        </div>
                    </div>
                    <div class="source">
                        <p>Source: <a href="https://en.wiktionary.org/wiki/keyboard" target="_blank">https://en.wiktionary.org/wiki/keyboard</a></p>
                    </div>
                `;
                document.getElementById('audio-btn').addEventListener('click', () => playAudio());
            }, 2000);
        }
    }

function displayWordData(data) {
    const { word, phonetic, meanings, sourceUrls } = data;
    const audioObj = data.phonetics.find(p => p.audio) || {};

    wordElement.textContent = word;
    document.querySelector('.phonetic').textContent = phonetic || audioObj.text || "";

    // Clear previous meanings
    meaningsContainer.innerHTML = '';

    const uniqueMeanings = [];
    meanings.forEach((meaning, index) => {
        if (!uniqueMeanings.some(m => m.partOfSpeech === meaning.partOfSpeech)) {
            uniqueMeanings.push(meaning);
            
            const meaningDiv = document.createElement('div');
            meaningDiv.className = 'meaning';

            const partOfSpeech = document.createElement('p');
            partOfSpeech.className = 'part-of-speech';
            partOfSpeech.textContent = meaning.partOfSpeech;
            meaningDiv.appendChild(partOfSpeech);

            const meaningLabel = document.createElement('p');
            meaningLabel.className = 'meaning-label';
            meaningLabel.textContent = 'Meaning';
            meaningDiv.appendChild(meaningLabel);

            meaning.definitions.slice(0, 2).forEach(def => {
                const definition = document.createElement('p');
                definition.className = 'definition';
                definition.textContent = def.definition;
                meaningDiv.appendChild(definition);

                if (def.example) {
                    const example = document.createElement('p');
                    example.className = 'example';
                    example.textContent = `"${def.example}"`;
                    meaningDiv.appendChild(example);
                }
            });

            if (meaning.synonyms && meaning.synonyms.length > 0) {
                const synonyms = document.createElement('p');
                synonyms.className = 'synonyms';
                synonyms.innerHTML = `<span>Synonyms: </span>${meaning.synonyms.join(', ')}`;
                meaningDiv.appendChild(synonyms);
            }

            meaningsContainer.appendChild(meaningDiv);
            if (index < meanings.length - 1) {
                const spaceDiv = document.createElement('div');
                spaceDiv.style.height = '20px';
                meaningsContainer.appendChild(spaceDiv);
            }
        }
    });

    audioBtn.onclick = () => playAudio(audioObj.audio);
    document.querySelector('.source a').href = sourceUrls[0];
    document.querySelector('.source a').textContent = sourceUrls[0];
}

    function playAudio(audioUrl) {
        if (audioUrl) {
            new Audio(audioUrl).play().catch(e => console.log("Audio error: " + e.message));
        } else {
            alert("Pronunciation not available for this word");
        }
    }

    // Toggle theme
    function toggleTheme() {
        body.classList.toggle('dark-mode');
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    }

    // Change font
    function changeFont() {
        const selectedFont = fontSelect.value;
        document.documentElement.style.setProperty('--font-family', selectedFont);
        localStorage.setItem('font', selectedFont);
    }
});
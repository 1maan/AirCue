let getStoriesAb = null;
let storyBank = document.getElementById("storyBank")


let searchTimer = null;
let storySearch = document.getElementById("storySearch");

let selectedLanguage;
const savedLanguage = localStorage.getItem('language');
const savedLabel = localStorage.getItem('label_language');

let dateGlobal;

if (savedLanguage) {
    selectedLanguage = savedLanguage;
    document.getElementById('filterText').textContent = savedLabel || (selectedLanguage === 'dv' ? 'Dhivehi' : 'English');
} else {
    selectedLanguage = 'dv';
    document.getElementById('filterText').textContent = 'Dhivehi';
}
function toggleFilterMenu() {
    document.getElementById('filterMenu').classList.toggle('hidden');
}
function selectLanguageFilter(language, label) {
    selectedLanguage = language;
    localStorage.setItem('language', language);
    localStorage.setItem('label_language', label);
    document.getElementById('filterText').textContent = label;
    document.getElementById('filterMenu').classList.add('hidden');
    getRundownItems(selectedRunDate)
}

function formatTime(dateString) {
    const date = new Date(dateString);

    const day = date.toLocaleDateString('en-GB', {
        weekday: 'short'
    });

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day} ${hours}:${minutes}`;
}

function openAddStoryModal() {
    let model = document.getElementById("addStoryModal");
    model.classList.add('flex')
    model.classList.remove('hidden')
}

function closeAddStoryModal() {
    let model = document.getElementById("addStoryModal");
    model.classList.add('hidden')
    model.classList.remove('flex')
}
function formatDatabaseDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const dateScroller = document.getElementById('dateScroller');
const leftBtn = document.getElementById('dateScrollLeft');
const rightBtn = document.getElementById('dateScrollRight');

let selectedRunDate = '';
let firstDate;
let lastDate;

function dateValue(date) {
    dateGlobal = date.toLocaleDateString('en-CA');
    return date.toLocaleDateString('en-CA'); 
}

function makeDate(date) {
    const btn = document.createElement('button');

    const today = dateValue(new Date());
    const value = dateValue(date);

    btn.dataset.date = value;

    btn.className = `
        dateItem min-w-24 shrink-0 cursor-pointer rounded-lg
        border border-transparent px-2 py-1 text-center
        hover:border-black
    `;

    btn.innerHTML = `
        <div class="dateDay text-[9px] text-gray-400">
            ${value === today
                ? 'TODAY'
                : date.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
            }
        </div>

        <div class="Outfit-Medium text-[12px]">
            ${date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short'
            })}
        </div>
    `;

    btn.onclick = () => selectDate(btn);

    return btn;
}

function selectDate(btn) {

    document.querySelectorAll('.dateItem').forEach(item => {
        item.classList.remove('bg-black', 'text-white');
    });

    btn.classList.add('bg-black', 'text-white');

    selectedRunDate = btn.dataset.date;

    getRundownItems(selectedRunDate);
}

function addDates(start, amount, position = 'end') {

    for (let i = 0; i < amount; i++) {

        const date = new Date(start);

        position === 'start'
            ? date.setDate(date.getDate() - i)
            : date.setDate(date.getDate() + i);

        const item = makeDate(date);

        position === 'start'
            ? dateScroller.prepend(item)
            : dateScroller.append(item);
    }
}

function loadDates() {

    dateScroller.innerHTML = '';

    const today = new Date();

    firstDate = new Date(today);
    firstDate.setDate(today.getDate() - 15);

    lastDate = new Date(today);
    lastDate.setDate(today.getDate() + 15);

    addDates(firstDate, 31);

    resetDateScroller();
}

function loadLeft() {

    const oldWidth = dateScroller.scrollWidth;

    for (let i = 0; i < 10; i++) {

        firstDate.setDate(firstDate.getDate() - 1);

        dateScroller.prepend(
            makeDate(new Date(firstDate))
        );
    }

    dateScroller.scrollLeft +=
        dateScroller.scrollWidth - oldWidth;
}

function loadRight() {

    for (let i = 0; i < 10; i++) {

        lastDate.setDate(lastDate.getDate() + 1);

        dateScroller.append(
            makeDate(new Date(lastDate))
        );
    }
}

function goToDate(date) {

    let btn = document.querySelector(
        `[data-date="${dateValue(date)}"]`
    );

    if (!btn) {
        loadDates();
        btn = document.querySelector(
            `[data-date="${dateValue(date)}"]`
        );
    }

    if (!btn) return;

    selectDate(btn);

    btn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
    });
}

function jumpToDate(days) {

    const date = new Date();

    date.setDate(date.getDate() + days);

    goToDate(date);
}

function resetDateScroller() {
    goToDate(new Date());
}

leftBtn.onclick = () => {

    if (dateScroller.scrollLeft < 250)
        loadLeft();

    dateScroller.scrollBy({
        left: -320,
        behavior: 'smooth'
    });
};

rightBtn.onclick = () => {

    const remaining =
        dateScroller.scrollWidth -
        dateScroller.clientWidth -
        dateScroller.scrollLeft;

    if (remaining < 250)
        loadRight();

    dateScroller.scrollBy({
        left: 320,
        behavior: 'smooth'
    });
};

loadDates();

function getRundownItems(date){
    storySearch.value = ""
    if(getStoriesAb){
        getStoriesAb.abort();
    }
    console.log(selectedLanguage)
    getStoriesAb = new AbortController();
    fetch(`/api/stories?date=${date}&lan=${selectedLanguage}`,{
      signal: getStoriesAb.signal
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log(data)
            storyBank.innerHTML = "";
            data.stories.forEach(story => {
                storyBank.innerHTML += `
<div class="flex items-center justify-between gap-4 border-b border-[#eeeeee] p-4">
  <div class="flex items-start gap-3">
    <div class="selOne flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 text-[9px] text-gray-500">${ story.id }</div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <div class="Outfit-Faseyha-Regular truncate text-[12px] font-medium uppercase">${ story.slug }</div>
          ${ renderTags(story.story_text) }
        </div>
      </div>
      <div class="flex gap-3 text-[9px] text-gray-400">
        <span> ${formatTime( story.created_at )} </span>
        <span> ${countWords( story.story_text )} words </span>
      </div>
    </div>
  </div>
  <button onclick="addStoryToRunDown(${ story.id })" class="rounded-lg bg-black px-3 py-2 text-[9px] text-white hover:bg-gray-800 cursor-pointer">Add</button>
</div>
                `
            })

            if(data.stories.length === 0){
            storyBank.innerHTML = `
            <div id="Nostoriesyet" class="flex min-h-75 flex-col items-center justify-center px-6 py-12 text-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3H14L19 8V21H7V3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path>
                    <path d="M14 3V8H19" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path>
                    <path d="M10 12H16M10 15H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                  </svg>
                </div>
                <div class="Outfit-Medium mt-3 text-[12px] text-gray-700">No stories yet</div>
                <div class="mt-1 max-w-55 text-[10px] leading-4 text-gray-400">There are no newsroom stories available.</div>
                <button onclick="switchStoryTab('new')" class="Outfit-Medium cursor-pointer mt-4 rounded-lg bg-black px-4 py-2 text-[9px] text-white hover:bg-gray-800">Create Story</button>
            </div>
            `
            }
        }
        if (!data.success) {
            console.error(data.message);
        }
    })
    .catch(error => {
        if (error.name === 'AbortError') {
            return;
        }
        console.error('Error fetching stories:', error);
        showAlert( 'error', 'An error occurred. Please try again.');
    })
    .finally(() => {
    });

}

function extractTagsWithTotal(text) {
    const matches = [...text.matchAll(/__([^_]+)__/g)];
    const result = {};
    matches.forEach(match => {
        const tag = match[1].trim().toUpperCase();
        result[tag] = (result[tag] || 0) + 1;
    });
    return Object.entries(result).map(([name, total]) => ({

        name,
        total
    }));
}

function renderTags(text) {

    const tags = extractTagsWithTotal(text);

    return tags.map(item => `
        <span class="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500">
            ${item.name}
            <span class="ml-1 text-gray-400">${item.total}</span>
        </span>
    `).join('');
}
function countWords(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}


storySearch.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        searchNews(dateGlobal, storySearch.value);
    }, 400);
});



function searchNews(date, input){
  const loadingTimer = setTimeout(() => {
    loadingSearchResults();
  }, 300);
  fetch(`/api/stories/search?date=${date}&q=${input}&lan=${selectedLanguage}`)
  .then(response => response.json())
  .then(data => {
        if (data.success) {
            storyBank.innerHTML = "";
            if(input.length == 0 && data.stories.length == 0){

                return;
            }
            if (data.stories.length === 0) {

                return;
            }

data.stories.forEach(story => {
storyBank.innerHTML += `
<div class="flex items-center justify-between gap-4 border-b border-[#eeeeee] p-4">
  <div class="flex items-start gap-3">
    <div class="selOne flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 text-[9px] text-gray-500">${ story.id }</div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <div class="Outfit-Faseyha-Regular truncate text-[12px] font-medium uppercase">${ story.slug }</div>
          ${ renderTags(story.story_text) }
        </div>
      </div>
      <div class="flex gap-3 text-[9px] text-gray-400">
        <span> ${formatTime( story.created_at )} </span>
        <span> ${countWords( story.story_text )} words </span>
      </div>
    </div>
  </div>
  <button onclick="addStoryToRunDown(${ story.id })" class="rounded-lg bg-black px-3 py-2 text-[9px] text-white hover:bg-gray-800 cursor-pointer">Add</button>
</div>
`
})


        }
  })
  .catch(error => {
      console.error('Error fetching stories:', error);
  })
  .finally(() => {
    clearTimeout(loadingTimer);
  });
}


function loadingSearchResults() {
storyBank.innerHTML = `
<div class="flex min-h-55 flex-col items-center justify-center px-6 py-10 text-center">
  <div class="relative flex h-10 w-10 items-center justify-center">
    <div class="absolute h-10 w-10 rounded-full border-2 border-gray-100"></div>
    <div class="absolute h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-black"></div>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" class="text-gray-500">
      <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  </div>
  <div class="Outfit-Medium mt-4 text-[12px] text-gray-700">Searching stories</div>
  <div class="mt-1 text-[10px] text-gray-400">Looking for matching newsroom stories...</div>
</div>
`;
}
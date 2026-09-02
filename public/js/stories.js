const socket = io();

window.addEventListener('pagehide', () => {
    socket.disconnect();
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted && !socket.connected) {
        socket.connect();
    }
});


function toggleRunOrderMenu(button) {
  const menu = button.parentElement.querySelector(".runorder-menu");
  document.querySelectorAll(".runorder-menu").forEach(item => {
    if (item !== menu) {
      item.classList.add("hidden");
    }
  });
  menu.classList.toggle("hidden");
}

// TOGGLE LANGUAGE
const languageToggle = document.getElementById("languageToggle");
const storyText = document.getElementById("storyText");
const slug = document.getElementById("slug");
const cgToggle = document.getElementById("cgToggle");
const cg = document.getElementById("cg");
const storyStatus = document.getElementById("storyStatus");
const saveStoryBtn = document.getElementById("saveStoryBtn");
const closeStoryBtn = document.getElementById("closeStoryBtn");
const storyEditor = document.getElementById("storyEditor");
const cg_text_preview = document.getElementById("cg_text_preview");
const sideStories = document.getElementById("sideStories");
const totalStories = document.getElementById("totalStories");
const todaysTotalStories = document.getElementById("todaysTotalStories");
const searchStories = document.getElementById("searchStories");

// COPY TEXT
function copyType(name) {
  const text = '__'+name.toUpperCase()+'__';
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showAlert('success', `Copied "${text}" to clipboard`);
  } catch (err) {
    console.error('Failed to copy text: ', err);
    showAlert('error', 'Failed to copy to clipboard');
  } finally {
    document.body.removeChild(textArea);
  }
}

const pushLiveSlide = document.getElementById("pushLiveSlide")

function closePushLiveSlide(){
  pushLiveSlide.classList.add("hidden")
}
function pushBreaking(){
  pushLiveSlide.classList.remove("hidden")
}




let selectedLanguage;
const savedLanguage = localStorage.getItem('language');
const savedLabel = localStorage.getItem('label_language');
if (savedLanguage) {
    selectedLanguage = savedLanguage;
    document.getElementById('filterText').textContent = savedLabel || (selectedLanguage === 'dv' ? 'Dhivehi' : 'English');
    selectedLanguage === 'dv' ? cgToggle.checked = true : cgToggle.checked = false
    selectedLanguage === 'dv' ? languageToggle.checked = true : languageToggle.checked = false
    cg.dir = cgToggle.checked ? 'rtl' : 'ltr';
    cgToggle.checked ? cg_text_preview.classList.add('AWaheed') : cg_text_preview.classList.add('Outfit-Medium');
    storyText.dir = languageToggle.checked ? 'rtl' : 'ltr';
} else {
    selectedLanguage = 'dv';
    document.getElementById('filterText').textContent = 'Dhivehi';
    selectedLanguage === 'dv' ? cgToggle.checked = false : cgToggle.checked = true
    selectedLanguage === 'dv' ? languageToggle.checked = false : languageToggle.checked = true
    selectedLanguage === 'dv' ? cgToggle.checked = true : cgToggle.checked = false
    selectedLanguage === 'dv' ? languageToggle.checked = true : languageToggle.checked = false
    cg.dir = cgToggle.checked ? 'rtl' : 'ltr';
    cgToggle.checked ? cg_text_preview.classList.add('AWaheed') : cg_text_preview.classList.add('Outfit-Medium');
    storyText.dir = languageToggle.checked ? 'rtl' : 'ltr';
}


let toggleFilterOpen = false;
let filterMenu = document.getElementById('filterMenu')

function toggleFilterMenuOpen(){
    filterMenu.classList.remove("top-7", "scale-90", "-right-2", "opacity-0", "pointer-events-none");
    filterMenu.classList.add("top-10", "scale-100", "right-0", "opacity-100", "pointer-events-auto");
}
function toggleFilterMenuClose(){
    filterMenu.classList.remove("top-10", "scale-100", "right-0", "opacity-100", "pointer-events-auto");
    filterMenu.classList.add("top-7", "scale-90", "-right-2", "opacity-0", "pointer-events-none");
}

function toggleFilterMenu() {
    if(!toggleFilterOpen){
        toggleFilterMenuOpen();
        toggleFilterOpen = !toggleFilterOpen;
    }else{
        toggleFilterMenuClose();
        toggleFilterOpen = !toggleFilterOpen;
    }
}

function selectLanguageFilter(language, label) {
    selectedLanguage = language;
    localStorage.setItem('language', language);
    localStorage.setItem('label_language', label);
    document.getElementById('filterText').textContent = label;
    language === 'dv' ? cgToggle.checked = true : cgToggle.checked = false
    language === 'dv' ? languageToggle.checked = true : languageToggle.checked = false
    cg.dir = cgToggle.checked ? 'rtl' : 'ltr';
    cgToggle.checked ? cg_text_preview.classList.add('AWaheed') : cg_text_preview.classList.add('Outfit-Medium');
    cgToggle.checked ? cg_text_preview.classList.remove('Outfit-Medium') : cg_text_preview.classList.remove('AWaheed');
    storyText.dir = languageToggle.checked ? 'rtl' : 'ltr';
    updateSelectedDate();
    toggleFilterMenu();
}

if(languageToggle){
languageToggle.addEventListener("change", ()=>{
  if(languageToggle.checked){
    storyText.setAttribute('dir', 'rtl')
  }else{
    storyText.setAttribute('dir', 'ltr')
  }
})
}

if(cgToggle){
cgToggle.addEventListener("change", ()=>{
  if(cgToggle.checked){
    cg.setAttribute('dir', 'rtl')
    
  }else{
    cg.setAttribute('dir', 'ltr')
  }
      cgToggle.checked ? cg_text_preview.classList.add('AWaheed') : cg_text_preview.classList.add('Outfit-Medium');
    cgToggle.checked ? cg_text_preview.classList.remove('Outfit-Medium') : cg_text_preview.classList.remove('AWaheed');
})
}
if(cg){
cg.addEventListener('input', ()=>{
  if(cgToggle.checked){
    cg_text_preview.textContent = transliterateDhivehiToEnglish(cg.value);
  }else{
    cg_text_preview.textContent = cg.value;
  }
})
}

let selectedDate = new Date();
const selectedDateText = document.getElementById('selectedDateText');
const titleStories = document.getElementById('titleStories');
const prevDate = document.getElementById('prevDate');
const nextDate = document.getElementById('nextDate');
let date;
let getStoriesAb = null;

function formatDisplayDate(date) {
    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}
function formatDatabaseDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function getRelativeDateLabel(date, type) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    const difference = Math.round(
        (selected - today) / (1000 * 60 * 60 * 24)
    );
    if (difference === 0) {
        return "Today";
    }
    if (difference === 1) {
        return "Tomorrow";
    }
    if (difference === -1) {
        return "Yesterday";
    }
    if (difference > 1) {
      if(type == 'main'){
        return `${difference} days from now`;
      }else{
        return `for ${difference} days from now`;
      }
    }
    if(type == 'main'){
      return `${Math.abs(difference)} days ago`;
    }else{
      return `from ${Math.abs(difference)} days ago`;
    }
}
function updateSelectedDate() {
    selectedDateText.textContent = formatDisplayDate(selectedDate);
    titleStories.textContent = getRelativeDateLabel(selectedDate, 'main');
    selectedDateLabel.textContent = getRelativeDateLabel(selectedDate, 'main');
    date = formatDatabaseDate(selectedDate);
    getStories(date);
    resertStoryEditor();
}
if(prevDate){
prevDate.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 1);
    updateSelectedDate();
    searchStories.value = "";
});
}
if(nextDate){
nextDate.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 1);
    updateSelectedDate();
    searchStories.value = "";
});
}
updateSelectedDate();

function loadingStories() {
  if(!document.getElementById("loadingStories")){
    todaysTotalStories.textContent = 0;
    totalStories.textContent = `0 stories`
    sideStories.innerHTML = `
    <div id="loadingStories" class="flex min-h-75 flex-col items-center justify-center px-6 py-12 text-center">
      <div class="relative flex h-12 w-12 items-center justify-center">
        <div class="absolute h-12 w-12 rounded-full border-2 border-gray-100"></div>
        <div class="absolute h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-black"></div>
      </div>
      <div class="Outfit-Medium mt-4 text-[12px] text-gray-700">Loading stories</div>
      <div class="mt-1 text-[10px] text-gray-400">Fetching newsroom stories for the selected date.</div>
      <div class="mt-6 w-full max-w-65 space-y-3">
        <div class="animate-pulse rounded-lg border border-[#eeeeee] p-3">
          <div class="flex items-center gap-3">
            <div class="h-7 w-7 rounded-md bg-gray-100"></div>
            <div class="flex-1">
              <div class="h-2.5 w-2/3 rounded bg-gray-100"></div>
              <div class="mt-2 h-2 w-full rounded bg-gray-100"></div>
            </div>
          </div>
        </div>
        <div class="animate-pulse rounded-lg border border-[#eeeeee] p-3">
          <div class="flex items-center gap-3">
            <div class="h-7 w-7 rounded-md bg-gray-100"></div>
            <div class="flex-1">
              <div class="h-2.5 w-1/2 rounded bg-gray-100"></div>
              <div class="mt-2 h-2 w-4/5 rounded bg-gray-100"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  }
}

function loadingSearchResults() {
sideStories.innerHTML = `
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

function formatTime(dateString) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}
function countWords(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

let storyDatabase = {}



function getStories(date) {
    let finished = false;
    const loadingTimer = setTimeout(() => {
        if (!finished) {
            loadingStories();
        }
    }, 300);
    if (getStoriesAb) {
        getStoriesAb.abort();
    }
    getStoriesAb = new AbortController();

    fetch(`/api/stories?date=${date}&lan=${selectedLanguage}`,{
      signal: getStoriesAb.signal
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            totalStories.textContent = `${data.stories.length} stories`
            todaysTotalStories.textContent = `${data.stories.length}`
            sideStories.innerHTML = "";
            if (data.stories.length === 0) {
              sideStories.innerHTML = `
              <div id="Nostoriesyet" class="flex min-h-75 flex-col items-center justify-center px-6 py-12 text-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3H14L19 8V21H7V3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                    <path d="M14 3V8H19" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                    <path d="M10 12H16M10 15H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </div>
                <div class="Outfit-Medium mt-3 text-[12px] text-gray-700">No stories yet</div>
                <div class="mt-1 max-w-55 text-[10px] leading-4 text-gray-400">There are no newsroom stories available ${getRelativeDateLabel(selectedDate).toLowerCase()}.</div>
                <button onclick="resertStoryEditor('true')" class="Outfit-Medium cursor-pointer mt-4 rounded-lg bg-black px-4 py-2 text-[9px] text-white hover:bg-gray-800">Create Story</button>
              </div>
              `; 
            return; }
            storyDatabase = {};
            data.stories.forEach(stories => {
            storyDatabase[stories.id] = {
              slug: stories.slug,
              cg_text: stories.cg_text,
              content: stories.story_text
            };
            sideStories.innerHTML += `
              <button onclick="selectStory('${stories.id}')" class="story-item w-full cursor-pointer border-b border-[#eeeeee] p-4 text-left hover:bg-gray-50" data-story="${stories.id}">
                <div class="flex items-start gap-3">
                  <div class="selOne overflow-hidden flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[9px] text-gray-500">${stories.id}</div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <div class="truncate uppercase text-[12px] font-medium Outfit-Faseyha-Regular">${stories.slug}</div>
                      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500"></span>
                    </div>
                    <div class="flex gap-3 text-[9px] text-gray-400">
                      <span> ${formatTime(stories.created_at)} </span>
                      <span> ${countWords(stories.story_text)} words </span>
                    </div>
                  </div>
                </div>
              </button>`;
            });
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
      finished = true;
      clearTimeout(loadingTimer);
    });
}
let searchTimer = null;
if(searchStories){
searchStories.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        searchNews(date, searchStories.value);
    }, 400);
});
}
function searchNews(date, input){
  const loadingTimer = setTimeout(() => {
    loadingSearchResults();
  }, 300);
  fetch(`/api/stories/search?date=${date}&q=${input}&lan=${selectedLanguage}`)
  .then(response => response.json())
  .then(data => {
        if (data.success) {
          if(input.length == 0 && data.stories.length == 0){
            sideStories.innerHTML = `
            <div id="Nostoriesyet" class="flex min-h-75 flex-col items-center justify-center px-6 py-12 text-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3H14L19 8V21H7V3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                  <path d="M14 3V8H19" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                  <path d="M10 12H16M10 15H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </div>
              <div class="Outfit-Medium mt-3 text-[12px] text-gray-700">No stories yet</div>
              <div class="mt-1 max-w-55 text-[10px] leading-4 text-gray-400">There are no newsroom stories available ${getRelativeDateLabel(selectedDate).toLowerCase()}.</div>
              <button onclick="resertStoryEditor('true')" class="Outfit-Medium cursor-pointer mt-4 rounded-lg bg-black px-4 py-2 text-[9px] text-white hover:bg-gray-800">Create Story</button>
            </div>
            `;
            return;
          }
          if (data.stories.length === 0) {
              sideStories.innerHTML = `
                <div id="Nostoriesfound" class="flex min-h-65 flex-col items-center justify-center px-6 py-10 text-center">
                  <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
                      <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                  </div>
                  <div class="Outfit-Medium mt-3 text-[12px] text-gray-700">No stories found</div>
                  <div class="mt-1 text-[10px] text-gray-400">No newsroom stories match your search.</div>
                  <button onclick="clearStorySearch()" class="mt-4 rounded-lg border border-[#dddddd] px-4 py-2 text-[9px] text-gray-500  hover:bg-gray-50 cursor-pointer">Clear Search</button>
                </div>
              `;
            return;
          } 
  
          totalStories.textContent = `${data.stories.length} stories`
          sideStories.innerHTML = "";
          storyDatabase = {};
          data.stories.forEach(stories => {
          storyDatabase[stories.id] = {
            slug: stories.slug,
            cg_text: stories.cg_text,
            content: stories.story_text
          };
          sideStories.innerHTML += `
            <button onclick="selectStory('${stories.id}')" class="story-item w-full cursor-pointer border-b border-[#eeeeee] p-4 text-left ${ storyEditor.dataset.id == stories.id ? 'bg-[#f2f2f2]' : 'hover:bg-gray-50' }" data-story="${stories.id}">
              <div class="flex items-start gap-3">
                <div class="selOne overflow-hidden flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[9px] ${ storyEditor.dataset.id == stories.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500' }">${stories.id}</div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <div class="truncate uppercase text-[12px] font-medium Outfit-Faseyha-Regular">${stories.slug}</div>
                    <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500"></span>
                  </div>
                  <div class="flex gap-3 text-[9px] text-gray-400">
                    <span> ${formatTime(stories.created_at)} </span>
                    <span> ${countWords(stories.story_text)} words </span>
                  </div>
                </div>
              </div>
            </button>`;
          });
      }
      if (!data.success) {
          console.error(data.message);
      }
  })
  .catch(error => {
      console.error('Error fetching stories:', error);
  })
  .finally(() => {
    clearTimeout(loadingTimer);
  });
}

function clearStorySearch(){
  searchStories.value = "";
  searchNews(date, searchStories.value)
  resertStoryEditor();
}

function selectStory(storyCode){
  const story = document.querySelector(`[data-story="${storyCode}"]`);
  storyText.value = storyDatabase[storyCode].content;
  slug.value = storyDatabase[storyCode].slug;
  cg.value = storyDatabase[storyCode].cg_text;
  cg_text_preview.textContent = transliterateDhivehiToEnglish(storyDatabase[storyCode].cg_text);
  storyStatus.textContent = storyDatabase[storyCode].slug
  saveStoryBtn.textContent = 'Update Story'
  saveStoryBtn.setAttribute('onclick', `updateStory(${storyCode})`)
  closeStoryBtn.classList.remove('hidden');
  storyEditor.dataset.id = storyCode;
  document.querySelectorAll('[data-story]').forEach(element => {
    if(element.classList.contains('bg-[#f2f2f2]')){
      element.classList.remove('bg-[#f2f2f2]')
      element.classList.add('hover:bg-gray-50')
    }
  })

  document.querySelectorAll('.selOne').forEach(element => {
    if(element.classList.contains('bg-black') || element.classList.contains('text-white')){
      element.classList.add('bg-gray-100', 'text-gray-500')
      element.classList.remove('bg-black', 'text-white')
    }
  })

  let selOne = story.querySelector('.selOne')
  story.classList.add('bg-[#f2f2f2]')
  story.classList.remove('hover:bg-gray-50')
  selOne.classList.add('bg-black', 'text-white')
  selOne.classList.remove('bg-gray-100', 'text-gray-500')


}

function clearStorySel(){
  document.querySelectorAll('.selOne').forEach(element => {
    if(element.classList.contains('bg-black') || element.classList.contains('text-white')){
      element.classList.add('bg-gray-100', 'text-gray-500')
      element.classList.remove('bg-black', 'text-white')
    }
  })
  document.querySelectorAll('.selOne').forEach(element => {
    element.parentElement.parentElement.classList.remove('bg-[#f2f2f2]')
    element.parentElement.parentElement.classList.add('hover:bg-gray-50')
  })
}

function resertStoryEditor(newStory){
  slug.value = "";
  cg.value = "";
  storyText.value = "";
  saveStoryBtn.textContent = 'Save Story';
  storyStatus.textContent = 'New Story';
  storyEditor.dataset.id = "";
  cg_text_preview.textContent = "";
  saveStoryBtn.setAttribute('onclick', `saveStory('${date}')`)
  clearStorySel();
  if(newStory == 'true'){
    slug.focus();
  }
  if(!closeStoryBtn.classList.contains('hidden')){
    closeStoryBtn.classList.add('hidden')
  }
}

let saveStoryController = null; 

function saveStory(date){
        saveStoryBtn.disabled = true;
        if(saveStoryController){
          saveStoryController.abort();
        }
        saveStoryController = new AbortController();

        let dataInput = JSON.stringify({
            slug: slug.value.replace(/['"]/g, ''),
            language: selectedLanguage,
            cg_text: cg.value,
            story_text: storyText.value,
            date: date
        })
    fetch(`/api/stories?date=${date}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        signal: saveStoryController.signal,
        body: dataInput
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
          let data_show = JSON.parse(dataInput)
          storyDatabase[data.storyId] = {
            slug: data_show.slug,
            cg_text: data_show.cg_text,
            content: data_show.story_text
          };

          let SodataInput = {
              slug: data_show.slug,
              language: selectedLanguage,
              cg_text: data_show.cg_text,
              story_text: data_show.story_text,
              date: date,
              dataID: data.storyId
          }

          socket.emit('sentStory', SodataInput)
          if(document.getElementById("Nostoriesyet")){
            document.getElementById("Nostoriesyet").remove();
          }
          if(!document.getElementById("Nostoriesfound")){
            sideStories.insertAdjacentHTML('afterbegin', `
              <button onclick="selectStory('${data.storyId}')" class="story-item w-full cursor-pointer border-b border-[#eeeeee] p-4 text-left bg-[#f2f2f2]" data-story="${data.storyId}">
              <div class="flex items-start gap-3">
              <div class="selOne overflow-hidden flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[9px] bg-black text-white">${data.storyId}</div>
              <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
              <div class="truncate uppercase text-[12px] font-medium Outfit-Faseyha-Regular">${slug.value.replace(/['"]/g, '')}</div>
              <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500"></span>
              </div>
              <div class="flex gap-3 text-[9px] text-gray-400">
              <span> ${formatTime(Date.now())} </span>
              <span> ${countWords(storyText.value)} words </span>
              </div>
              </div>
              </div>
              </button>
              `);
              selectStory(data.storyId)
              todaysTotalStories.textContent = Number(todaysTotalStories.textContent) + 1;
              totalStories.textContent = `${todaysTotalStories.textContent} stories`
              isSavingStory = false;
              showAlert('success', data.message);
          }
          if(!localStorage.getItem('editor_reset_behavior')){
            resertStoryEditor();
          }
          }
          if(!data.success) {
            showAlert('error', data.message);
            return;
          }
    })
    .catch(error => {
        if (error.name === 'AbortError') {
        showAlert('error', 'Request was aborted');
          return;
        }
        showAlert('error', 'An error occurred. Please try again.');
    })
    .finally(() => {
        saveStoryBtn.disabled = false;
    });
}


let updateStoryController = null;
function updateStory(selectedStoryId) {
    if(updateStoryController){
      updateStoryController.abort();
    }
    updateStoryController = new AbortController();
    if (!selectedStoryId) {
        showAlert('error', 'Please select a story');
        return;
    }
    let dataInput = JSON.stringify({
        slug: slug.value.replace(/['"]/g, ''),
        language: selectedLanguage,
        cg_text: cg.value,
        story_text: storyText.value
    })
    fetch(`/api/stories/${selectedStoryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        signal: updateStoryController.signal,
        body: dataInput
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
          const story = document.querySelector(`[data-story="${selectedStoryId}"]`);
          story.querySelector('.truncate').textContent = JSON.parse(dataInput).slug;
          let dtInput =  JSON.parse(dataInput)
          storyStatus.textContent = dtInput.slug;
          storyDatabase[selectedStoryId] = {
              slug: dtInput.slug,
              cg_text: dtInput.cg_text,
              content: dtInput.story_text
          };
          showAlert('success', data.message);
        } else {
          showAlert('error', data.message);
        }
    })
    .catch(error => {
        if (error.name === 'AbortError') {
        showAlert( 'error', 'Request was aborted');
        return;
        }
        showAlert( 'error', 'An error occurred. Please try again.');
    });
}
function RunremoveEndWords(){
  storyText.value = removeEndWords(storyText.value);
}

// function removeEndWords(text) {
//     return text
//         .replace(/\.?(އެވެ|ނެވެ|މެވެ|ށެވެ|ލެވެ|ކެވެ)\.?/g, '')
//         .trim();
// }

function removeEndWords(text) {
    return text
        .replace(/\.?(އެވެ|ނެވެ|މެވެ|ށެވެ|ލެވެ|ކެވެ|ޔެވެ|ރެވެ)\.?/g, '')
        .trim();
}

const transliterationMap = {
    'ް':'c',
    'އ':'a',
    'ެ':'e',
    'ރ':'r',
    'ތ':'t',
    'ޔ':'y',
    'ު':'u',
    'ި':'i',
    'ޮ':'o',
    'ޕ':'p',
    'ޕ':'P',
    'ަ':'w',
    'ސ':'s',
    'ދ':'d',
    'ފ':'f',
    'ގ':'g',
    'ހ':'h',
    'ޖ':'j',
    'ކ':'k',
    'ލ':'l',
    'ޒ':'z',
    '×':'x',
    'ޝ':'x',
    'ޗ':'C',
    'ވ':'v',
    'ބ':'b',
    'ނ':'n',
    'މ':'m',
    'ﷲ':'Q',
    'ޢ':'A',
    'ޭ':'E',
    'ޜ':'R',
    'ޓ':'T',
    'ޠ':'Y',
    'ޫ':'U',
    'ީ':'I',
    'ޯ':'O',
    'ާ':'W',
    'ށ':'S',
    'ޑ':'D',
    'ޟ':'F',
    'ޣ':'G',
    'ޙ':'H',
    'ޛ':'J',
    'ޚ':'K',
    'ޅ':'L',
    'ޡ':'Z',
    'ޘ':'X',
    'ޤ':'q',
    'ޥ':'V',
    'ޞ':'B',
    'ޏ':'N',
    'ޟ':'M',
    '،':',',
    '؛':';',
    '؟':'?',
    '>':'<',
    '<':'>',
    ']':'[',
    '[':']',
    ')':'(',
    '(':')',
    '}':'{',
    '{':'}',
};



function transliterateDhivehiToEnglish(text) {
  const splitText = text.split(/(\d+)/);
  let dhivehiTextIndices = []; 
  splitText.forEach((part, index) => {
      if (!/^\d+$/.test(part)) {
          dhivehiTextIndices.push(index); 
      }
  });

  const reversedDhivehiText = dhivehiTextIndices.map(index => 
      Array.from(splitText[index], char => transliterationMap[char] || char).reverse().join('')
  );

  let transliteratedResult = ''; 
  let dhivehiTextIndex = 0;
  
  for (let i = 0; i < splitText.length; i++) {
      if (dhivehiTextIndices.includes(i)) {
          transliteratedResult += reversedDhivehiText[dhivehiTextIndex++];
      } else {
          transliteratedResult += splitText[i];
      }
  }

  const transliteratedDhivehiText = dhivehiTextIndices.map(index => 
      Array.from(splitText[index], char => transliterationMap[char] || char).reverse().join('')
  );
  const numbersInText = transliteratedResult.match(/\d+/g); 
  let numericValues = numbersInText ? numbersInText.map(Number) : [];
  let reversedNumericValues = numericValues.reverse();

  let finalTransliteratedText = transliteratedDhivehiText.reverse(); 
  transliteratedResult = finalTransliteratedText.map((item, index) => {
      let separator = index === finalTransliteratedText.length - 1 ? '' : reversedNumericValues[index % reversedNumericValues.length];
      return item + separator;
  });

  for (let index = 0; index < transliteratedResult.length; index++) {
      if (transliteratedResult[index] == "undefined") {
          transliteratedResult.pop();
      }
  }

  let finalOutput = transliteratedResult.join('');
  return finalOutput; 
}


socket.on('recStory', (data)=>{
    if(data.date == date && data.language == selectedLanguage){
    if(document.getElementById("Nostoriesyet")){
      document.getElementById("Nostoriesyet").remove();
    }
    if(!document.getElementById("Nostoriesfound")){
    storyDatabase[data.dataID] = {
      slug: data.slug,
      cg_text: data.cg_text,
      content: data.story_text
    };
    sideStories.insertAdjacentHTML('afterbegin', `
    <button onclick="selectStory('${data.dataID}')" class="story-item w-full cursor-pointer border-b border-[#eeeeee] p-4 text-left hover:bg-gray-50" data-story="${data.dataID}">
      <div class="flex items-start gap-3">
        <div class="selOne overflow-hidden flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[9px] bg-gray-100 text-gray-500">${data.dataID}</div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <div class="Outfit-Faseyha-Regular truncate text-[12px] font-medium uppercase">${data.slug}</div>
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"></span>
          </div>
          <div class="flex gap-3 text-[9px] text-gray-400">
            <span> ${formatTime(Date.now())} </span>
            <span> ${countWords(data.story_text)} words </span>
          </div>
        </div>
      </div>
    </button>
    `);
    todaysTotalStories.textContent = Number(todaysTotalStories.textContent) + 1;
    totalStories.textContent = `${todaysTotalStories.textContent} stories`
    showAlert('success', 'A new story was added by another user.');
    }
    }
})








  let rtvSto = document.getElementById("rtvSto")
  let rtvNewsBtn = document.getElementById("rtvNewsBtn")
  let rtvNewsContainer = document.getElementById("rtvNewsContainer")
  
  if(rtvNewsBtn){
  rtvNewsBtn.addEventListener("click",()=>{
    rtvNewsContainer.classList.remove('hidden')
  })
  }

  function rtvNewsContainerClose(){
    rtvNewsContainer.classList.add('hidden')
  }


  fetch('https://api.raajje.mv/articles/latest')
  .then(response => response.json())
  .then(data=>{
    data.data.forEach(element => {
        rtvSto.insertAdjacentHTML('beforeend', `
      <div onclick="addNews('${element.id}')" class="cursor-pointer hover:bg-gray-100 active:bg-gray-200 p-2 rounded-md">
      <div class="aspect-video w-full bg-gray-300">
        <img src="${element.main_photo.thumbnail}" alt="" class="aspect-video object-cover">
      </div>
        <p class="text-right Outfit-Faseyha-Regular text-[10px] sm:text-sm line-clamp-3">${element.heading}</p>
      </div>
      `)
    });
  })
let pageCount = 1
function pageChange(type){
  if(type == 'back'){
    pageCount--
    if(pageCount < 0){
      pageCount = 1
    }
  }
  if(type == 'next'){
    pageCount++
  }
  
  fetch(`https://api.raajje.mv/articles/latest?page=${pageCount}`)
  .then(response => response.json())
  .then(data=>{
    rtvSto.innerHTML = ""
    data.data.forEach(element => {
        rtvSto.insertAdjacentHTML('beforeend', `
      <div onclick="addNews('${element.id}')" class="cursor-pointer hover:bg-gray-100 active:bg-gray-200 p-2 rounded-md">
      <div class="aspect-video w-full bg-gray-300">
        <img src="${element.main_photo.thumbnail}" alt="" class="aspect-video object-cover">
      </div>
        <p class="text-right Outfit-Faseyha-Regular text-[10px] sm:text-sm line-clamp-3">${element.heading}</p>
      </div>
      `)
    });
  })
}



function addNews(id){
  fetch(`https://api.raajje.mv/articles/article/${id}`)
  .then(response => response.json())
  .then(data=>{
    rtvNewsContainerClose();
    slug.value = "";
    cg.value = "";
    storyText.value = "";

    slug.value = thaanaTransliterator(data.heading)
    cg.value = data.heading
    if(cgToggle.checked){
      cg_text_preview.textContent = transliterateDhivehiToEnglish(cg.value);
    }else{
      cg_text_preview.textContent = cg.value;
    }
    data.content.blocks.forEach(dt =>{
      if(dt.data.text){
      if (dt.data.text.includes('&nbsp;')) {
        storyText.value += dt.data.text.replaceAll('&nbsp;', ' ');
      } else {
        storyText.value += dt.data.text;
      }
      storyText.value += '\n\n'
      }
    })  
  })
}



// CLOSE MODALS BY CLICKING OUTSIDE
document.addEventListener("click", function(event) {
  const rtvNewsContainer = document.getElementById("rtvNewsContainer");
  const pushLiveSlide = document.getElementById("pushLiveSlide");
  if (event.target === rtvNewsContainer) {
    rtvNewsContainerClose()
  }
  if (event.target === pushLiveSlide) {
    closePushLiveSlide()
  }
});


const thaanaTransliterator = input => {
    // fili + punctuations
    let listOne = {
        "އަ": "a", "އާ": "aa", "އި": "i", "އީ": "ee", "އު": "u", "އޫ": "oo", "އެ": "e", "އޭ": "ey", "އޮ": "o", "ޢަ": "a", "ޢާ": "aa", "ޢި": "i", "ޢީ": "ee", "ޢު": "u", "ޢޫ": "oo", "ޢެ": "e", "ޢޭ": "ey", "ޢޮ": "o", "އޯ": "oa", "ުއް": "uh", "ިއް": "ih", "ެއް": "eh", "ަށް": "ah", "ައް": "ah", "ށް": "h", "ތް": "i", "ާއް": "aah", "އް": "ih", "އް": "h", "]": "[", "[": "]", "\\": "\\", "\'": "\'", "،": ",", ".": ".", "/": "/", "÷": "", "}": "{", "{": "}", "|": "|", ":": ":", "\"": "\"", ">": "<", "<": ">", "؟": "?", ")": ")", "(": "("
    };
    // fili + akuru
    let listTwo = {
        "ަ": "a", "ާ": "aa", "ި": "i", "ީ": "ee", "ު": "u", "ޫ": "oo", "ެ": "e", "ޭ": "ey", "ޮ": "o", "ޯ": "oa", "ް": "", "ހ": "h", "ށ": "sh", "ނ": "n", "ރ": "r", "ބ": "b", "ޅ": "lh", "ކ": "k", "އ": "a", "ވ": "v", "މ": "m", "ފ": "f", "ދ": "dh", "ތ": "th", "ލ": "l", "ގ": "g", "ޏ": "y", "ސ": "s", "ޑ": "d", "ޒ": "z", "ޓ": "t", "ޔ": "y", "ޕ": "p", "ޖ": "j", "ޗ": "ch", "ޙ": "h", "ޚ": "kh", "ޛ‎": "z", "ޜ‎": "z", "ޝ‎": "sh", "ޝ": "sh", "ޤ": "q", "ޢ": "a", "ޞ": "s", "ޟ": "dh", "ޡ": "z", "ޠ": "t", "ާާޣ": "gh", "ޘ": "th", "ޛ": "dh", "ާާޜ": "z"
    };
    // english words to properly replace
    // should add more words here
    let listThree = {
        "މުހައްމަދު": "Mohamed",
        "އަހްމަދު": "Ahmed",
        "އެއާޕޯޓް": "airport",
        "އިންސްޓިޓިއުޓް": "institute",
        "އެތުލެޓިކްސ": "athletics",
        "އެތްލެޓިކްސ": "athletics",
        "ޖޫނިއާ": "junior",
        "އެސޯސިއޭޝަނ": "association",
        "މޯލްޑިވްސ": "Maldives",
        "މޯލްޑިވުސ": "Maldives",
        "ޖެނުވަރީ": "january",
        "ފެބުރުވަރީ": "february",
        "މާޗް": "march",
        "މާރިޗ": "march",
        "އެޕްރީލ": "april",
        // "": "may",
        "ޖޫން": "june",
        "ޖުލައި": "july",
        "އޮގަސްޓ": "august",
        "ސެޕްޓެމްބަރ": "september",
        "އޮކްޓޯބަރ": "october",
        "ނޮވެމްބަރ": "november",
        "ޑިސެމްބަރ": "december",
        "ކަލަންޑަރ": "calendar",
        "ޗެމްޕިއަންޝިޕ": "championship",
        "ޓުއަރިޒަމ": "tourism",
        "ޓޫރިސްޓ": "tourist",
        "ގުރުއާނ": "quran",
        "ޤުރުއާނ": "quran",
        "ރިކޯޑު": "record",
        "މޭޔަރ": "mayor",
        "ސިޓީ ކައުންސިލ": "city council",
        "ކައުންސިލ": "council",
        "ވޯޓު": "vote",
        "ޓާމިނަލ": "terminal",
        "އެވޯޑް": "award",
        "އިވެންޓ": "event",
        "ސްޕޮންސަރ": "sponsor",
        "އދ.": "alif dhaal",
	};
    // escape for regexp
    const escapeRegExp = string => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    // replace thaana with english
    const replaceLetters = (input, replacables) => {
        for (let k in replacables) {
            if (!replacables.hasOwnProperty(k)) continue;
            v = replacables[k];
            input = input.replace(new RegExp(escapeRegExp(k), 'g'), v);
        }
        return input;
    }
    // replace zero width non joiners
    input = input.replace(/[\u200B-\u200D\uFEFF]/g, '');
    // replace letter
    input = replaceLetters(input, listThree);
    input = replaceLetters(input, listOne);
    input = replaceLetters(input, listTwo);
    // capitalize first letter of sentence
    input = input.replace(/(^\s*\w|[\.\!\?]\s*\w)/g, function(c) { return c.toUpperCase(); });
    return input;
};

let saveBreakingStoryBtn = document.getElementById("saveBreakingStoryBtn")
let pushBreakingController = null; 

function PushLiveToAir(){
        saveBreakingStoryBtn.disabled = true;
        if(pushBreakingController){
          pushBreakingController.abort();
        }
        pushBreakingController = new AbortController();

        let dataInput = JSON.stringify({
            slug: slug.value.replace(/['"]/g, ''),
            language: selectedLanguage,
            cg_text: cg.value,
            story_text: storyText.value,
            date: date
        })
    fetch(`/api/breaking?date=${date}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        signal: pushBreakingController.signal,
        body: dataInput
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
          showAlert('success', data.message);
          closePushLiveSlide()
        }
         
        if(!data.success) {
          showAlert('error', data.message);
          return;
        }
    })
    .catch(error => {
        if (error.name === 'AbortError') {
        showAlert('error', 'Request was aborted');
          return;
        }
        showAlert('error', 'An error occurred. Please try again.');
    })
    .finally(() => {
        saveBreakingStoryBtn.disabled = false;
    });
}
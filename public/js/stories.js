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
const cgToggle = document.getElementById("cgToggle");
const cg = document.getElementById("cg");

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









let selectedLanguage;
const savedLanguage = localStorage.getItem('language');
const savedLabel = localStorage.getItem('label_language');
if (savedLanguage) {
    selectedLanguage = savedLanguage;
    console.log(selectedLanguage)
    document.getElementById('filterText').textContent = savedLabel || (savedLanguage === 'dv' ? 'Dhivehi' : 'English');
    savedLanguage === 'dv' ? cgToggle.checked = true : cgToggle.checked = false
    savedLanguage === 'dv' ? languageToggle.checked = true : languageToggle.checked = false
    cg.dir = cgToggle.checked ? 'rtl' : 'ltr';
    storyText.dir = languageToggle.checked ? 'rtl' : 'ltr';
} else {
    selectedLanguage = 'dv';
    document.getElementById('filterText').textContent = 'Dhivehi';
    savedLanguage === 'dv' ? cgToggle.checked = false : cgToggle.checked = true
    savedLanguage === 'dv' ? languageToggle.checked = false : languageToggle.checked = true
    savedLanguage === 'dv' ? cgToggle.checked = true : cgToggle.checked = false
    savedLanguage === 'dv' ? languageToggle.checked = true : languageToggle.checked = false
    cg.dir = cgToggle.checked ? 'rtl' : 'ltr';
    storyText.dir = languageToggle.checked ? 'rtl' : 'ltr';
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
    language === 'dv' ? cgToggle.checked = true : cgToggle.checked = false
    language === 'dv' ? languageToggle.checked = true : languageToggle.checked = false
    cg.dir = cgToggle.checked ? 'rtl' : 'ltr';
    storyText.dir = languageToggle.checked ? 'rtl' : 'ltr';
    updateSelectedDate();
}

languageToggle.addEventListener("change", ()=>{
  if(languageToggle.checked){
    storyText.setAttribute('dir', 'rtl')
  }else{
    storyText.setAttribute('dir', 'ltr')
  }
})

cgToggle.addEventListener("change", ()=>{
  if(cgToggle.checked){
    cg.setAttribute('dir', 'rtl')
  }else{
    cg.setAttribute('dir', 'ltr')
  }
})



let selectedDate = new Date();
const selectedDateText = document.getElementById('selectedDateText');
const titleStories = document.getElementById('titleStories');
const prevDate = document.getElementById('prevDate');
const nextDate = document.getElementById('nextDate');

let date;
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
}
prevDate.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 1);
    updateSelectedDate();
    searchStories.value = "";
});
nextDate.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 1);
    updateSelectedDate();
    searchStories.value = "";
});
updateSelectedDate();


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

const sideStories = document.getElementById("sideStories");
const totalStories = document.getElementById("totalStories");
const todaysTotalStories = document.getElementById("todaysTotalStories");
const searchStories = document.getElementById("searchStories");


function getStories(date) {
    fetch(`/api/stories?date=${date}&lan=${selectedLanguage}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            totalStories.textContent = `${data.stories.length} stories`
            todaysTotalStories.textContent = `${data.stories.length}`
            sideStories.innerHTML = "";
            if (data.stories.length === 0) { sideStories.innerHTML = `
              <div class="flex min-h-75 flex-col items-center justify-center px-6 py-12 text-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3H14L19 8V21H7V3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                    <path d="M14 3V8H19" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                    <path d="M10 12H16M10 15H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </div>
                <div class="Outfit-Medium mt-3 text-[12px] text-gray-700">No stories yet</div>
                <div class="mt-1 max-w-55 text-[10px] leading-4 text-gray-400">There are no newsroom stories available ${getRelativeDateLabel(selectedDate).toLowerCase()}.</div>
                <button onclick="newStory()" class="Outfit-Medium mt-4 rounded-lg bg-black px-4 py-2 text-[9px] text-white hover:bg-gray-800">Create Story</button>
              </div>
              `; 
            return; }

            data.stories.forEach(stories => {
            sideStories.innerHTML += `
              <button onclick="selectStory('${stories.id}')" data-story_text="${stories.story_text}" class="story-item w-full cursor-pointer border-b border-[#eeeeee] p-4 text-left hover:bg-gray-50" data-story="${stories.id}">
                <div class="flex items-start gap-3">
                  <div class="overflow-hidden flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[9px] text-gray-500">${stories.id}</div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <div class="truncate text-[12px] font-medium">${stories.slug}</div>
                      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500"></span>
                    </div>
                    <div class="Faseyha-Regular mt-1 truncate text-[10px] text-gray-400">${stories.cg_text}</div>
                    <div class="mt-2 flex gap-3 text-[9px] text-gray-400">
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

    });
}

searchStories.addEventListener('input', ()=>{
  searchNews(date, searchStories.value)
})

function searchNews(date, input){
  fetch(`/api/stories/search?date=${date}&q=${input}&lan=${selectedLanguage}`)
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          if (data.stories.length === 0) {
            sideStories.innerHTML = `
              <div class="flex min-h-65 flex-col items-center justify-center px-6 py-10 text-center">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
                    <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </div>
                <div class="Outfit-Medium mt-3 text-[12px] text-gray-700">No stories found</div>
                <div class="mt-1 text-[10px] text-gray-400">No newsroom stories match your search.</div>
                <button onclick="clearStorySearch()" class="mt-4 rounded-lg border border-[#dddddd] px-4 py-2 text-[9px] text-gray-500 hover:bg-gray-50 cursor-pointer">Clear Search</button>
              </div>
              `;
            return;
          } 
  
          totalStories.textContent = `${data.stories.length} stories`
          sideStories.innerHTML = "";
          data.stories.forEach(stories => {
          sideStories.innerHTML += `
            <button onclick="selectStory('${stories.id}')" data-story_text="${stories.story_text}" class="story-item w-full cursor-pointer border-b border-[#eeeeee] p-4 text-left hover:bg-gray-50" data-story="${stories.id}">
              <div class="flex items-start gap-3">
                <div class="overflow-hidden flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[9px] text-gray-500">${stories.id}</div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <div class="truncate text-[12px] font-medium">${stories.slug}</div>
                    <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500"></span>
                  </div>
                  <div class="Faseyha-Regular mt-1 truncate text-[10px] text-gray-400">${stories.cg_text}</div>
                  <div class="mt-2 flex gap-3 text-[9px] text-gray-400">
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
      console.log('Stories loading finished');
  });
}

function clearStorySearch(){
  searchStories.value = "";
  searchNews(date, searchStories.value)
}


function selectStory(storyCode){
  const story = document.querySelector(`[data-story="${storyCode}"]`);
  const story_text = story.dataset.story_text;
  storyText.textContent = story_text;
  console.log(story)
}







function saveStory(){
  console.log(storyText.value)
}
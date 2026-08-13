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
    document.getElementById('filterText').textContent = savedLabel || (savedLanguage === 'dv' ? 'Dhivehi' : 'English');
    savedLanguage === 'dv' ? cgToggle.checked = true : cgToggle.checked = false
    savedLanguage === 'dv' ? languageToggle.checked = true : languageToggle.checked = false
    cg.dir = cgToggle.checked ? 'rtl' : 'ltr';
    cgToggle.checked ? cg_text_preview.classList.add('AWaheed') : cg_text_preview.classList.add('Outfit-Medium');
    storyText.dir = languageToggle.checked ? 'rtl' : 'ltr';
} else {
    selectedLanguage = 'dv';
    document.getElementById('filterText').textContent = 'Dhivehi';
    savedLanguage === 'dv' ? cgToggle.checked = false : cgToggle.checked = true
    savedLanguage === 'dv' ? languageToggle.checked = false : languageToggle.checked = true
    savedLanguage === 'dv' ? cgToggle.checked = true : cgToggle.checked = false
    savedLanguage === 'dv' ? languageToggle.checked = true : languageToggle.checked = false
    cg.dir = cgToggle.checked ? 'rtl' : 'ltr';
    cgToggle.checked ? cg_text_preview.classList.add('AWaheed') : cg_text_preview.classList.add('Outfit-Medium');
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
    cgToggle.checked ? cg_text_preview.classList.add('AWaheed') : cg_text_preview.classList.add('Outfit-Medium');
    cgToggle.checked ? cg_text_preview.classList.remove('Outfit-Medium') : cg_text_preview.classList.remove('AWaheed');
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
      cgToggle.checked ? cg_text_preview.classList.add('AWaheed') : cg_text_preview.classList.add('Outfit-Medium');
    cgToggle.checked ? cg_text_preview.classList.remove('Outfit-Medium') : cg_text_preview.classList.remove('AWaheed');
})

cg.addEventListener('input', ()=>{
  if(cgToggle.checked){
    cg_text_preview.textContent = transliterateDhivehiToEnglish(cg.value);
  }else{
    cg_text_preview.textContent = cg.value;
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
    resertStoryEditor();
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

let storyDatabase = {}

function getStories(date) {
    fetch(`/api/stories?date=${date}&lan=${selectedLanguage}`)
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
                      <div class="truncate text-[12px] font-medium Outfit-Faseyha-Regular">${stories.slug}</div>
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
                    <div class="truncate text-[12px] font-medium Outfit-Faseyha-Regular">${stories.slug}</div>
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



function saveStory(date){
    fetch(`/api/stories?date=${date}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            slug: slug.value,
            language: selectedLanguage,
            cg_text: cg.value,
            story_text: storyText.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', data.message);
            storyDatabase[data.storyId] = {
              slug: slug.value,
              cg_text: cg.value,
              content: storyText.value
            };
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
                    <div class="truncate text-[12px] font-medium Outfit-Faseyha-Regular">${slug.value}</div>
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
            }
          }
          if(!data.success) {
            showAlert('error', data.message);
            return;
          }
          todaysTotalStories.textContent = Number(todaysTotalStories.textContent) + 1;
    })
    .catch(error => {
      console.log(error)
        showAlert('error', 'An error occurred. Please try again.');
    })
    .finally(() => {
    });
}
function updateStory(selectedStoryId) {
    if (!selectedStoryId) {
        showAlert('error', 'Please select a story');
        return;
    }
    fetch(`/api/stories/${selectedStoryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            slug: slug.value,
            language: selectedLanguage,
            cg_text: cg.value,
            story_text: storyText.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', data.message);
        } else {
            showAlert('error', data.message);
        }
    })
    .catch(error => {
        showAlert( 'error', 'An error occurred. Please try again.');
    });
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
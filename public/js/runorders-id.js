const socket = io();

window.addEventListener('pagehide', () => {
    socket.disconnect();
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted && !socket.connected) {
        socket.connect();
    }
});

const runorderID = Number(
window.location.pathname.split('/').filter(Boolean).pop()
);
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
let firstTime = true
function openAddStoryModal() {
    let model = document.getElementById("addStoryModal");
    model.classList.add('flex')
    model.classList.remove('hidden')
    if(firstTime){
        resetDateScroller()
        firstTime = true;
    }
}
function closeAddStoryModal() {
    let model = document.getElementById("addStoryModal");
    model.classList.add('hidden')
    model.classList.remove('flex')
}
function openBreakModal() {
    const modal = document.getElementById("breakModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}
function closeBreakModal() {
    const modal = document.getElementById("breakModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}
document.addEventListener("click", function(event) {
  const addStoryModal = document.getElementById("addStoryModal");
  const breakModal = document.getElementById("breakModal");
  if (event.target === addStoryModal) {
    closeAddStoryModal();
  }
  if (event.target === breakModal) {
    closeBreakModal();
  }
});
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

dateScroller.addEventListener('wheel', (e) => {
    e.preventDefault();
    dateScroller.scrollLeft += e.deltaY * 4;
}, { passive: false });
loadDates();

function getRundownItems(date){
    storySearch.value = ""
    if(getStoriesAb){
        getStoriesAb.abort();
    }
    getStoriesAb = new AbortController();
    let loadNewsNew = setTimeout(()=>{
        storyBank.innerHTML = `
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
        `
    }, 300)



    fetch(`/api/stories?date=${date}&lan=${selectedLanguage}`,{
      signal: getStoriesAb.signal
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            storyBank.innerHTML = "";
            data.stories.forEach(story => {
                storyBank.innerHTML += `
<div class="flex items-center justify-between gap-4 border-b border-[#eeeeee] p-4 alped" data-itemid="${ story.id }">
  <div class="flex items-start gap-3">
    <div class="selOne flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 text-[9px] text-gray-500">${ story.id }</div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <div class="Outfit-Faseyha-Regular text-[12px] break-all line-clamp-1 uppercase">${ story.slug }</div>
          ${ renderTags(story.story_text) }
        </div>
      </div>
      <div class="flex gap-3 text-[9px] text-gray-400">
        <span> ${formatTime( story.created_at )} </span>
        <span> ${countWords( story.story_text )} words </span>
      </div>
    </div>
  </div>
  <button onclick="addStoryToRunDown('${ story.id }', '${ story.slug }', '${formatTime( story.created_at )}')" class="rounded-lg bg-black px-3 py-2 text-[9px] text-white hover:bg-gray-800 cursor-pointer">Add</button>
</div>`
})
alped()

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
        clearTimeout(loadNewsNew)
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
        <span class="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500 line-clamp-1">
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


function clearStorySearch(){
    storySearch.value = ""
    searchNews(dateGlobal, storySearch.value);
}

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
storyBank.innerHTML = `
<div id="Nostoriesfound" class="flex min-h-65 flex-col items-center justify-center px-6 py-10 text-center">
  <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"></circle>
      <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
    </svg>
  </div>
  <div class="Outfit-Medium mt-3 text-[12px] text-gray-700">No stories found</div>
  <div class="mt-1 text-[10px] text-gray-400">No newsroom stories match your search.</div>
  <button onclick="clearStorySearch()" class="mt-4 cursor-pointer rounded-lg border border-[#dddddd] px-4 py-2 text-[9px] text-gray-500 hover:bg-gray-50">Clear Search</button>
</div>
`
                return;
            }

data.stories.forEach(story => {
storyBank.innerHTML += `
<div class="flex items-center justify-between gap-4 border-b border-[#eeeeee] p-4 alped" data-itemid="${ story.id }">
  <div class="flex items-start gap-3">
    <div class="selOne flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100 text-[9px] text-gray-500">${ story.id }</div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <div class="Outfit-Faseyha-Regular text-[12px] break-all line-clamp-1 uppercase">${ story.slug }</div>
          ${ renderTags(story.story_text) }
        </div>
      </div>
      <div class="flex gap-3 text-[9px] text-gray-400">
        <span> ${formatTime( story.created_at )} </span>
        <span> ${countWords( story.story_text )} words </span>
      </div>
    </div>
  </div>
  <button onclick="addStoryToRunDown('${ story.id }', '${ story.slug }', '${formatTime( story.created_at )}')" class="rounded-lg bg-black px-3 py-2 text-[9px] text-white hover:bg-gray-800 cursor-pointer">Add</button>
</div>
`
})
alped()

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


function switchStoryTab(tab) {
    let newStoryTab = document.getElementById("newStoryTab")
    let existingStoryTab = document.getElementById("existingStoryTab")
    let existingStoriesPanel = document.getElementById("existingStoriesPanel")
    let newStoryPanel = document.getElementById("newStoryPanel")
    
    
    if(tab == 'new'){
        newStoryTab.classList.add('bg-white', 'shadow-sm');
        existingStoryTab.classList.remove('bg-white', 'shadow-sm');
        existingStoriesPanel.classList.add('hidden')
        newStoryPanel.classList.remove('hidden')
    }

    if(tab == 'existing'){
        existingStoryTab.classList.add('bg-white', 'shadow-sm');
        newStoryTab.classList.remove('bg-white', 'shadow-sm');
        newStoryPanel.classList.add('hidden')
        existingStoriesPanel.classList.remove('hidden')
    }
}


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

let dragItem = null;
window.addEventListener('dragstart', (e)=>{
    const item = e.target.closest('.runorder-item');
    if(!item) return;
    dragItem = item;
    item.classList.add('bg-[#b7ffb799]')
})
window.addEventListener('dragover', (e)=>{
    e.preventDefault();
    const overItem = e.target.closest('.runorder-item');
    if(!overItem || overItem === dragItem) return;
    overItem.parentNode.insertBefore(dragItem, overItem)
    runOrderCounter();
})
window.addEventListener('drop', (e)=>{
    e.preventDefault();
    const overItem = e.target.closest('.runorder-item');
    if(!overItem || !dragItem || overItem === dragItem) return;
    overItem.parentNode.insertBefore(dragItem, overItem)
})
window.addEventListener('dragend', () => {
    if (dragItem) {
        dragItem.classList.remove('bg-[#b7ffb799]');
    }
    dragItem = null;
    runOrderCounter();
});

function runOrderCounter(){
    let counter = document.querySelectorAll(".runorder-counter")
    let runorderStory = document.querySelectorAll(".runorder-story")
    let footerStoryCount = document.getElementById("footerStoryCount")
    let i = 1;
    counter.forEach(Item =>{
        i < 10 ? Item.textContent = '0' + i : Item.textContent = i
        i++
    })
    footerStoryCount.textContent = runorderStory.length
}
runOrderCounter();

let runOrderList = document.getElementById("runOrderList");

function addStoryToRunDown(id, name, date){
if(document.getElementById("NoRundownItems")){
    document.getElementById("NoRundownItems").remove();
}
runOrderList.insertAdjacentHTML('beforeend', `
<div data-itemid="${id}" draggable="true" class="runorder-item runorder-story border-t grid cursor-pointer border-b border-[#eeeeee] px-4 py-2 sm:grid-cols-[45px_35px_1fr_70px_60px] grid-cols-[45px_35px_1fr_60px] md:gap-0">
  <div class="flex items-center gap-2 pointer-events-none">
    <span class="drag-handle cursor-grab text-[15px] text-gray-300 pointer-events-auto"> ⋮⋮ </span>
  </div>
    <div class="text-[10px] flex items-center text-gray-400 runorder-counter">00</div>
    <div class="min-w-0 flex-1"><p class="Outfit-Faseyha-Medium truncate text-[11px]">${name}</p></div>
    <p class="Outfit-Regular flex items-center line-clamp-1 text-[10px] max-sm:hidden">${date}</p>
    <div class="flex justify-end">
        <button id="deleteRunOrderItem" class="ml-1 cursor-pointer flex h-7 w-7 items-center justify-center rounded-md text-[12px] text-red-400 hover:bg-red-50">×</button>
    </div>
</div>`)
    runOrderCounter();
    alped();
}

window.addEventListener('click', (e)=>{
    let deleteItem = e.target.closest('.runorder-item')
    let DeleteId = e.target.id === 'deleteRunOrderItem'
    if(deleteItem && DeleteId){
        deleteItem.remove();
        runOrderCounter();
    }
})


function addBreak(){
let breakName = document.getElementById("breakName")
if(breakName.value == '') return;
if(document.getElementById("NoRundownItems")){
    document.getElementById("NoRundownItems").remove();
}
runOrderList.insertAdjacentHTML('beforeend', `
<div draggable="true" class="runorder-item runorder-break border-t border-[#eeeeee] bg-red-500  px-4 py-2">
  <div class="flex items-center gap-3 pointer-events-none">
    <div class="drag-handle cursor-grab text-[15px] text-white pointer-events-auto">⋮⋮</div>
    <div class="h-px flex-1 bg-red-400"></div>
    <div class="flex items-center gap-3">
      <span class="rounded-md bg-red-400 px-2 py-1 text-[10px] font-medium text-white uppercase runorder-break-type"> ${breakName.value} </span>
    </div>
    <div class="h-px flex-1 bg-red-400"></div>
    <div class="flex justify-end">
        <button id="deleteRunOrderItem" class="ml-1 pointer-events-auto cursor-pointer flex h-7 w-7 items-center justify-center rounded-md text-[12px] text-white hover:bg-red-800">×</button>
    </div>
  </div>
</div>
`)
closeBreakModal();
}


function addBreaker(value){
if(value === '') return;
if(document.getElementById("NoRundownItems")){
    document.getElementById("NoRundownItems").remove();
}
runOrderList.insertAdjacentHTML('beforeend', `
<div draggable="true" class="runorder-item runorder-break border-t border-[#eeeeee] bg-red-500  px-4 py-2">
  <div class="flex items-center gap-3 pointer-events-none">
    <div class="drag-handle cursor-grab text-[15px] text-white pointer-events-auto">⋮⋮</div>
    <div class="h-px flex-1 bg-red-400"></div>
    <div class="flex items-center gap-3">
      <span class="rounded-md bg-red-400 px-2 py-1 text-[10px] font-medium text-white uppercase runorder-break-type"> ${value} </span>
    </div>
    <div class="h-px flex-1 bg-red-400"></div>
    <div class="flex justify-end">
        <button id="deleteRunOrderItem" class="ml-1 pointer-events-auto cursor-pointer flex h-7 w-7 items-center justify-center rounded-md text-[12px] text-white hover:bg-red-800">×</button>
    </div>
  </div>
</div>
`)
}









function saveRunOrder(id){
    let itemsArray = {};
    const allItems = runOrderList.querySelectorAll('.runorder-item')
    let possition = 1;
    allItems.forEach(item=>{
        if(item.classList.contains('runorder-story')){
            itemsArray[possition] = {
                type: 'STORY',
                id: item.dataset.itemid
            }
        }
        if(item.classList.contains('runorder-break')){
            itemsArray[possition] = {
               type: 'BREAK',
               text: item.querySelector('.runorder-break-type').textContent.trim()
            }
        }
        possition++
    })
    fetch('/api/run-order/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            run_order_id: id,
            data: itemsArray
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showAlert('success', result.message);

        socket.emit('updateRunDown', id)

        } else {
            showAlert('error', result.message);
        }

    })
    .catch(error => {

        console.error(error);

        showAlert(
            'error',
            'An error occurred. Please try again.'
        );

    });

}





socket.on('updateRunDownUser', (data)=>{
    if(data == runorderID){
        loadRunDown(data)
    }
})

function loadRunDown(id){
    fetch(`/api/run-order/${id}`,{
       method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
    .then(data=>{
runOrderList.innerHTML = ""
data.result.forEach(item=>{
if(item.item_type == 'story'){
runOrderList.innerHTML += `
<div data-itemid="${item.story_id}" draggable="true" class="runorder-item runorder-story border-t grid cursor-pointer border-b border-[#eeeeee] px-4 py-2 sm:grid-cols-[45px_35px_1fr_70px_60px] grid-cols-[45px_35px_1fr_60px] md:gap-0">
  <div class="flex items-center gap-2 pointer-events-none">
    <span class="drag-handle cursor-grab text-[15px] text-gray-300 pointer-events-auto"> ⋮⋮ </span>
  </div>
    <p class="text-[10px] flex items-center text-gray-400 runorder-counter">00</p>
    <div class="min-w-0 flex-1"><p class="Outfit-Faseyha-Medium truncate text-[11px]">${item.slug}</p></div>
    <p class="Outfit-Regular flex items-center line-clamp-1 text-[10px] max-sm:hidden"> ${formatTime(item.ca)} </p>
    <div class="flex justify-end">
        <button id="deleteRunOrderItem" class="ml-1 cursor-pointer flex h-7 w-7 items-center justify-center rounded-md text-[12px] text-red-400 hover:bg-red-50">×</button>
    </div>
</div>
`
}
if(item.item_type == 'break'){
runOrderList.innerHTML += `
<div draggable="true" class="runorder-item runorder-break border-t border-[#eeeeee] bg-red-500  px-4 py-2">
  <div class="flex items-center gap-3 pointer-events-none">
    <div class="drag-handle cursor-grab text-[15px] text-white pointer-events-auto">⋮⋮</div>
    <div class="h-px flex-1 bg-red-400"></div>
    <div class="flex items-center gap-3">
      <span class="rounded-md bg-red-400 px-2 py-1 text-[10px] font-medium text-white uppercase runorder-break-type"> ${item.break_name} </span>
    </div>
    <div class="h-px flex-1 bg-red-400"></div>
    <div class="flex justify-end">
        <button id="deleteRunOrderItem" class="ml-1 pointer-events-auto cursor-pointer flex h-7 w-7 items-center justify-center rounded-md text-[12px] text-white hover:bg-red-800">×</button>
    </div>
  </div>
</div>
`
}
})
showAlert('success', 'The runorder was updated by another user.');
runOrderCounter();
    }).catch(error=>{
        console.error(error);
        showAlert(
            'error',
            'An error occurred. Please try again.'
        );
    })
}


function alped(){
    let alped = document.querySelectorAll('.alped')
    let runorderStory = document.querySelectorAll('.runorder-story')
    runorderStory.forEach(element=>{
        alped.forEach(alpedElement=>{
            if(element.dataset.itemid == alpedElement.dataset.itemid){
                alpedElement.querySelector('.selOne').style.setProperty('background-color', '#0dd76b', 'important');
                alpedElement.querySelector('.selOne').style.setProperty('color', '#0f0f0f', 'important');
            }
        })
    })
}
const socket = io();

window.addEventListener('pagehide', () => {
    socket.disconnect();
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted && !socket.connected) {
        socket.connect();
    }
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
    if(footerStoryCount){
        footerStoryCount.textContent = runorderStory.length
    }
}
runOrderCounter();

const toggleAction = document.getElementById("toggle_action");
const actionJump = document.querySelectorAll(".action_jump");
const actionCgChange = document.querySelectorAll(".action_cgchange");
const toggle_action_1 = document.querySelector(".toggle_action_1");
const toggle_action_2 = document.querySelector(".toggle_action_2");

let showJump = false;
if(toggleAction){
toggleAction.addEventListener("click", (e) => {
    showJump = !showJump;
    actionJump.forEach(element => {
        let text;
        if(showJump){
            text = element.parentElement.dataset.slug
        }else{
            text = element.parentElement.dataset.cgtext
        }
        element.parentElement.parentElement.querySelector('.teleStoryText').innerHTML = text
        element.classList.toggle("hidden", !showJump);
    });
    actionCgChange.forEach(element => {
        element.classList.toggle("hidden", showJump);
    });
    toggle_action_1.classList.toggle('hidden')
    toggle_action_2.classList.toggle('hidden')
});
toggleAction.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
    }

    if (event.button === 1) {
        event.preventDefault();
    }

    if (event.button === 2) {
        event.preventDefault()
    }
});
toggleAction.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});
}

const fontSize = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");
const lineHeight = document.getElementById("lineHeight");
const lineHeightValue = document.getElementById("lineHeightValue");
const margin = document.getElementById("margin");
const marginValue = document.getElementById("marginValue");
const mirror = document.getElementById("mirror");

if(fontSize){
fontSize.addEventListener('input', () =>{
    fontSizeValue.textContent = `${fontSize.value}px`
})
}
if(lineHeight){
lineHeight.addEventListener('input', () =>{
    lineHeightValue.textContent = `${lineHeight.value}px`
})
}

if(margin){
margin.addEventListener('input', () =>{
    marginValue.textContent = `${margin.value}%`
})
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
function loadDets(){
if(localStorage.getItem('tele-fontSize')){
    fontSize.value = localStorage.getItem('tele-fontSize');
    fontSizeValue.textContent = `${fontSize.value}px`
}
if(localStorage.getItem('tele-lineHeight')){
    lineHeight.value = localStorage.getItem('tele-lineHeight');
    lineHeightValue.textContent = `${lineHeight.value}px`
}
if(localStorage.getItem('tele-margin')){
    margin.value = localStorage.getItem('tele-margin');
    marginValue.textContent = `${margin.value}%`
}
if(localStorage.getItem('tele-mirror') == 'true'){
    mirror.checked = localStorage.getItem('tele-mirror');
}else{
    mirror.checked = false;
}
}
loadDets()

function controllerSettingsSaveAs(){
    const settingName = window.prompt('Enter a name for this controller setting:', 'Default');
    if (settingName === null || settingName.trim() === '') {
        return;
    }
    toggleFilterMenu();
    const settings = {
        name: settingName.trim(),
        text_size: fontSize.value,
        line_height: lineHeight.value,
        side_margin: margin.value,
        mirror: mirror.checked
    };
    localStorage.setItem('tele-fontSize', settings.text_size);
    localStorage.setItem('tele-lineHeight', settings.line_height);
    localStorage.setItem('tele-margin', settings.side_margin);
    localStorage.setItem('tele-mirror', settings.mirror);
    let data = [settings.text_size, settings.line_height, settings.side_margin, settings.mirror];
    socket.emit('tele-settings', data);
    fetch('/api/controller-settings/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    })
    .then(response => response.json())
    .then(data => {
        fetchControllerSettings()
    })
    .catch(error => {
        console.error('Error saving settings:', error);
    });
}

function controllerSettings(id, textSize, textHight, sideMargin ,mirrowed) {
    if (!id) {
        return;
    }

    fetch('/api/controller-settings/activate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ id })
    })
    .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Unable to activate controller setting');
        }
        let mirrow
            localStorage.setItem('tele-fontSize', textSize);
            localStorage.setItem('tele-lineHeight', textHight);
            localStorage.setItem('tele-margin', sideMargin);
            if(mirrowed == 1){
                mirrow = true
                localStorage.setItem('tele-mirror', true);
            }else{
                mirrow = false
                localStorage.setItem('tele-mirror', false);
            }
            let dat = [textSize, textHight, sideMargin, mirrow]
            socket.emit('tele-settings', dat);
            loadDets()

        document.querySelectorAll('#teleSaved button[data-id]').forEach(button => {
            const isActive = Number(button.dataset.id) === Number(id);
            button.classList.toggle('text-white', isActive);
            button.classList.toggle('bg-black', isActive);
            button.classList.toggle('text-gray-600', !isActive);
            button.classList.toggle('hover:bg-gray-200', !isActive);
        });
        toggleFilterMenu()
        return data;
    })
    .then(data => {
    })
    .catch(error => {
        console.error('Error activating controller setting:', error);
    });
}

let teleSaved = document.getElementById("teleSaved")

function fetchControllerSettings() {
    try {
        fetch('/api/controller-settings', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => response.json())
        .then(data=>{
            if(data.success){
                teleSaved.innerHTML = ""
                data.settings.forEach(element=>{
                    teleSaved.innerHTML += `
                    <button data-id="${element.id}" data-line_height="${element.line_height}" data-text_size="${element.text_size}" data-side_margin="${element.side_margin}" onclick="controllerSettings(${element.id}, ${element.text_size}, ${element.line_height}, ${element.side_margin}, ${element.mirrowed})" class="w-full min-h-9 cursor-pointer rounded-md text-nowrap overflow-hidden px-3 py-2 text-left text-[10px] ${element.is_active == 1 ? 'text-white bg-black' : 'text-gray-600 hover:bg-gray-200'}">
                    ${element.name}
                    </button>
                    `
                })
            }
        }).catch(error=>{
            console.log(error)
        })


    } catch (error) {
        console.error('Error fetching controller settings:', error);
    }
}

fetchControllerSettings();


function controllerSettingsSave(){
    const settings = {
        text_size: fontSize.value,
        line_height: lineHeight.value,
        side_margin: margin.value,
        mirror: mirror.checked
    };
    removeAllActiveTeleprompterSettings();
    localStorage.setItem('tele-fontSize', settings.text_size);
    localStorage.setItem('tele-lineHeight', settings.line_height);
    localStorage.setItem('tele-margin', settings.side_margin);
    localStorage.setItem('tele-mirror', settings.mirror);
    let data = [settings.text_size, settings.line_height, settings.side_margin, settings.mirror];
    socket.emit('tele-settings', data);
    toggleFilterMenu()
}

function removeAllActiveTeleprompterSettings() {
    fetch('/api/controller-settings/remove-active', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Unable to remove active teleprompter settings');
        }

        if (teleSaved) {
            teleSaved.querySelectorAll('button[data-id]').forEach(button => {
                button.classList.remove('text-white', 'bg-black');
                button.classList.add('text-gray-600', 'hover:bg-gray-200');
                button.dataset.active = '0';
            });
        }
    })
    .then(data => {
    })
    .catch(error => {
        console.error('Error removing active teleprompter settings:', error);
    });
}


function jumpToStory(id){
    socket.emit('tele-jump', id)
}


function reloadTele(){
    socket.emit('reload-tele', true)
}


const changeCgStory = document.querySelectorAll("#changeCgStory");

changeCgStory.forEach((button) => {
    button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });

    button.addEventListener("mousedown", (event) => {
        if (event.button === 0) {
            writeText(transliterateDhivehiToEnglish(button.parentElement.dataset.cgtext))
            button.querySelector("svg").setAttribute("fill", "#009f32");

        }

        if (event.button === 1) {
            event.preventDefault();
            writeTextBreaking(transliterateDhivehiToEnglish(button.parentElement.dataset.cgtext))
            button.querySelector("svg").setAttribute("fill", "#ff0000");
        }

        if (event.button === 2) {
            event.preventDefault();
        }
    });
});


async function writeText(text) {
    const response = await fetch("/api/write-headline", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    });
    const data = await response.json();
    if(!data.success){
        showAlert('error', data.message)
    }
}

async function writeTextBreaking(text) {
    const response = await fetch("/api/write-breaking", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    });
    const data = await response.json();
    if(!data.success){
        showAlert('error', data.message)
    }
}
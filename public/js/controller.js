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
    console.log(event.button)
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

const fontSize = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");
const lineHeight = document.getElementById("lineHeight");
const lineHeightValue = document.getElementById("lineHeightValue");
const margin = document.getElementById("margin");
const marginValue = document.getElementById("marginValue");
const mirror = document.getElementById("mirror");


fontSize.addEventListener('input', () =>{
    fontSizeValue.textContent = `${fontSize.value}px`
})


lineHeight.addEventListener('input', () =>{
    lineHeightValue.textContent = `${lineHeight.value}px`
})


margin.addEventListener('input', () =>{
    marginValue.textContent = `${margin.value}%`
})


mirror.addEventListener('change', ()=>{
    console.log(mirror.checked)
})
// let alg = 'center'
// function setAlign(alignment, button) {
//   document.querySelectorAll(".align-btn").forEach((btn) => {
//     btn.classList.remove("border-black", "bg-black", "text-white");
//     btn.classList.add("border-[#dddddd]", "text-gray-500");
//   });
//   button.classList.remove("border-[#dddddd]", "text-gray-500");
//   button.classList.add("border-black", "bg-black", "text-white");
//   alg = alignment
// }

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
}



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
    let data = [settings.text_size, settings.line_height, settings.side_margin];
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
        console.log('Settings saved:', data);
    })
    .catch(error => {
        console.error('Error saving settings:', error);
    });
}


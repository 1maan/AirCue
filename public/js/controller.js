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
function setAlign(alignment, button) {
  document.querySelectorAll(".align-btn").forEach((btn) => {
    btn.classList.remove("border-black", "bg-black", "text-white");
    btn.classList.add("border-[#dddddd]", "text-gray-500");
  });
  button.classList.remove("border-[#dddddd]", "text-gray-500");
  button.classList.add("border-black", "bg-black", "text-white");
  console.log("Selected alignment:", alignment);
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

// fetch('/controller-settings/save', {
//     method: 'POST',
//     headers: {
//         'Content-Type' : 'application/json'
//     },
//     body: JSON.stringify({

//     })
// }).then(response => response.json())
// .then(data =>{
//     console.log(data)
// }).catch(error =>{
//     console.log(error)
// }).finally(()=>{

// })

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

function controllerSettingsSave(){
    toggleFilterMenu();
    localStorage.setItem('tele-fontSize',fontSize.value)
    localStorage.setItem('tele-lineHeight',lineHeight.value)
    localStorage.setItem('tele-margin',margin.value)
    let data = [fontSize.value, lineHeight.value, margin.value]
    socket.emit('tele-settings', data)
}


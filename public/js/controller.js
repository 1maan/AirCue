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

let showJump = false;

toggleAction.addEventListener("click", (e) => {
    showJump = !showJump;
    actionJump.forEach(element => {
        element.classList.toggle("hidden", !showJump);
    });

    actionCgChange.forEach(element => {
        element.classList.toggle("hidden", showJump);
    });
});

toggleAction.addEventListener("mousedown", (event) => {
    console.log(event.button)
    if (event.button === 0) {
        console.log("Left click");
    }

    if (event.button === 1) {
        console.log("Middle click");
    }

    if (event.button === 2) {
        console.log("Right click");
    }
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



function setAlign(align){
    console.log(align)
}

mirror.addEventListener('change', ()=>{
    console.log(mirror.checked)
})


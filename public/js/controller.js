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
let selectedDate = new Date();
const selectedDateText = document.getElementById('selectedDateText');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const prevDate = document.getElementById('prevDate');
const nextDate = document.getElementById('nextDate');
let date;
let lineUpAbort = null;
const titleRunOrder = document.getElementById("titleRunOrder");
const sideRunorders = document.getElementById("sideRunorders");
const todaysTotalRunorder = document.getElementById("todaysTotalRunorder");
const titleRunOrderScheduled = document.getElementById("titleRunOrderScheduled");
const newRunOrder = document.getElementById("newRunOrder");
const runOrderName = document.getElementById("runOrderName");
const runOrderDate = document.getElementById("runOrderDate");
const runOrderAirtime = document.getElementById("runOrderAirtime");
const runOrderPreset = document.getElementById("runOrderPreset");


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
let lineUploaded = false;
function updateSelectedDate() {
    selectedDateText.textContent = formatDisplayDate(selectedDate);
    selectedDateLabel.textContent = getRelativeDateLabel(selectedDate, 'main');
    date = formatDatabaseDate(selectedDate);
    if(lineUploaded){
        lineups(date);
    }
lineUploaded = true;
}
prevDate.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 1);
    updateSelectedDate();
});
nextDate.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 1);
    updateSelectedDate();
});
updateSelectedDate();


function toggleRunOrderMenu(button) {
    const menu = button.parentElement.querySelector(".runorder-menu");
    document.querySelectorAll(".runorder-menu").forEach(item => {
        if (item !== menu) {
            item.classList.add("hidden");
        }
    });
    menu.classList.toggle("hidden");
}

document.addEventListener("click", (event) => {
    if (!event.target.closest(".runorder-menu") &&
        !event.target.closest("button[onclick^='toggleRunOrderMenu']")) {
        document.querySelectorAll(".runorder-menu").forEach(menu => {
            menu.classList.add("hidden");
        });
    }
});

const now = new Date();

const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
runOrderDate.value = `${year}-${month}-${day}`;
let hour = now.getHours();
if (now.getMinutes() >= 30) {
    hour++;
}
if (hour >= 24) {
    hour = 0;
}
runOrderAirtime.value = `${String(hour).padStart(2, '0')}:00`;

function lineups(date){
    let finished = false;
    if(lineUpAbort){
        lineUpAbort.abort()
    }
    lineUpAbort = new AbortController();
    const loadingScreen = setTimeout(()=>{
        if (!finished) {
            clearLineUps();
            loadingRunOrders();
        }
    }, 300)
    fetch(`/api/run-orders?date=${date}`, {
        signal: lineUpAbort.signal
    }).then( response => response.json())
    .then(data=>{
        if(data.success){
            clearLineUps();
            todaysTotalRunorder.innerText = data.stories.length;
            titleRunOrderScheduled.innerText = `${data.stories.length} rundowns scheduled`;
            data.stories.forEach((element)=>{
            sideRunorders.innerHTML +=
                        `
            <div class="border-b border-[#eeeeee] px-5 py-2.5 select-none ${ element.status == 'live' ? 'bg-black/5' : '' }">
            <div class="flex items-start justify-between gap-5">
                <div class="flex items-start gap-4">
                <div class="Outfit-SemiBold flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${ element.status == 'live' ? 'bg-red-500 text-white' : element.status == 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100' } text-[11px] text-gray-600">${ element.air_time.slice(0, 5) }</div>
                <div class="min-w-0">
                    <h2 class="Outfit-SemiBold line-clamp-1 text-[14px] text-nowrap break-all">${ element.name }</h2>
                    <div class="mt-1 flex items-center gap-4 text-[10px] text-gray-400">
                        <span class="text-nowrap"> Producer: ${ element.full_name } </span>
                        <span class="text-nowrap hidden md:block"> ${ element.status } </span>
                    </div>
                </div>
                </div>
                <div class="relative flex shrink-0 items-center gap-1">
                <a href="/runorder/${ element.runorderID }">
                    <button class="hidden cursor-pointer rounded-lg px-3 py-2 text-[10px] text-gray-500 hover:bg-gray-100 hover:text-black md:block">Open</button>
                </a>
                <button onclick="activeRunOrder('${ element.runorderID }')" class="hidden cursor-pointer rounded-lg px-3 py-2 text-[10px] text-gray-500 hover:bg-gray-100 hover:text-black md:block">Set Active</button>
                <button onclick="toggleRunOrderMenu(this)" class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-black">⋮</button>
                <div class="runorder-menu absolute top-10 right-0 z-50 hidden w-44 rounded-xl border border-[#e5e5e5] bg-white p-1.5 shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
                    <a href="/runorder/${ element.runorderID }">
                    <button class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] text-gray-600 hover:bg-gray-100 hover:text-black">
                        <svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12ZM12.0003 17C14.7617 17 17.0003 14.7614 17.0003 12C17.0003 9.23858 14.7617 7 12.0003 7C9.23884 7 7.00026 9.23858 7.00026 12C7.00026 14.7614 9.23884 17 12.0003 17ZM12.0003 15C10.3434 15 9.00026 13.6569 9.00026 12C9.00026 10.3431 10.3434 9 12.0003 9C13.6571 9 15.0003 10.3431 15.0003 12C15.0003 13.6569 13.6571 15 12.0003 15Z"></path></svg>
                        <span>Open Run Order</span>
                    </button>
                    </a>
                    <button onclick="activeRunOrder('${ element.runorderID }')" class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] text-gray-600 hover:bg-gray-100 hover:text-black">
                    <svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM17.4571 9.45711L16.0429 8.04289L11 13.0858L8.20711 10.2929L6.79289 11.7071L11 15.9142L17.4571 9.45711Z"></path></svg>
                    <span>Set Active</span>
                    </button>
                    <button onclick="downloadRunOrder('${ element.runorderID }')" class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] text-gray-600 hover:bg-gray-100 hover:text-black">
                    <svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 19H21V21H3V19ZM13 13.1716L19.0711 7.1005L20.4853 8.51472L12 17L3.51472 8.51472L4.92893 7.1005L11 13.1716V2H13V13.1716Z"></path></svg>
                    <span>Download</span>
                    </button>
                    <button onclick="saveAsPreset('${ element.runorderID }')" class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] text-gray-600 hover:bg-gray-100 hover:text-black">
                    <svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 19H19V6.82843L17.1716 5H16V9H7V5H5V19H6V12H18V19ZM4 3H18L20.7071 5.70711C20.8946 5.89464 21 6.149 21 6.41421V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM8 14V19H16V14H8Z"></path></svg>
                    <span>Save as Preset</span>
                    </button>
                    <div class="my-1 border-t border-[#eeeeee]"></div>
                    <button onclick="deleteRunOrder('${ element.runorderID }')" class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] text-red-500 hover:bg-red-50">
                    <svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path></svg>
                    <span>Delete Run Order</span>
                    </button>
                </div>
                </div>
            </div>
            </div>

                        `
            })

            if(data.stories.length === 0){
               sideRunorders.innerHTML = `
               <div id="NoRunorderYet" class="flex min-h-75 flex-col items-center justify-center px-6 py-12 text-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.5" />
                    <path d="M8 8H16M8 12H16M8 16H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                </div>
                    <div class="Outfit-Medium mt-3 text-[12px] text-gray-700">No rundowns scheduled</div>
                    <div class="mt-1 max-w-55 text-[10px] leading-4 text-gray-400">There are no broadcast run orders scheduled for this date.</div>
                <button onclick="openCreateModal()" class="Outfit-Medium mt-4 cursor-pointer rounded-lg bg-black px-4 py-2 text-[9px] text-white hover:bg-gray-800">Create Run Order</button>
                </div>
               ` 
            }
        }
    }).catch(error=>{

    }).finally(()=>{
        finished = true;
        clearTimeout(loadingScreen)
    })
}

function clearLineUps(){
    sideRunorders.innerHTML = "";
    todaysTotalRunorder.innerText = '0';
    titleRunOrderScheduled.innerText = '0 rundowns scheduled';
}

function loadingRunOrders() {
if(!document.getElementById("loadingScreenRundown")){
    sideRunorders.innerHTML = `
    <div id="loadingScreenRundown" class="flex min-h-75 flex-col items-center justify-center px-6 py-10">
      <div class="relative flex h-11 w-11 items-center justify-center">
        <div class="absolute h-11 w-11 rounded-full border-2 border-gray-100"></div>
        <div class="absolute h-11 w-11 animate-spin rounded-full border-2 border-transparent border-t-black"></div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-gray-500">
          <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
          <path d="M8 8H16M8 12H16M8 16H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </div>
      <div class="Outfit-Medium mt-4 text-[12px] text-gray-700">Loading rundowns</div>
      <div class="mt-1 text-[10px] text-gray-400">Fetching broadcast rundowns for the selected date.</div>
      <div class="mt-6 w-full max-w-90 space-y-2">
        <div class="animate-pulse rounded-lg border border-[#eeeeee] p-3">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-gray-100"></div>
            <div class="flex-1">
              <div class="h-2.5 w-1/2 rounded bg-gray-100"></div>
              <div class="mt-2 h-2 w-2/3 rounded bg-gray-100"></div>
            </div>
            <div class="h-5 w-12 rounded bg-gray-100"></div>
          </div>
        </div>
      </div>
    </div>
    `;
}
}



// CREATE MODAL

function openCreateModal() {
    const modal = document.getElementById("createModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

}
function closeCreateModal() {
    const modal = document.getElementById("createModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}
// PRESET MODAL
function openPresetModal() {
    const modal = document.getElementById("presetModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}
function closePresetModal() {
    const modal = document.getElementById("presetModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}
// CLOSE MODALS BY CLICKING OUTSIDE
document.addEventListener("click", function(event) {
  const createModal = document.getElementById("createModal");
  const presetModal = document.getElementById("presetModal");
  if (event.target === createModal) {
    closeCreateModal();
  }
  if (event.target === presetModal) {
    closePresetModal();
  }
});

newRunOrder.addEventListener('click', ()=>{
    newRunOrder.Disabled = true;
    newRunOrder.querySelector('#buttonText').classList.add('hidden')
    newRunOrder.querySelector('#buttonText').classList.remove('flex')
    newRunOrder.querySelector('#buttionLoading').classList.remove('hidden')
    newRunOrder.querySelector('#buttionLoading').classList.add('flex')
    let dataForm =  JSON.stringify({
            name: runOrderName.value,
            run_date: runOrderDate.value,
            air_time: runOrderAirtime.value
        })
    fetch('/api/run-orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: dataForm
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', data.message);
            const allDt = JSON.parse(dataForm)
            closeCreateModal();
            if(document.getElementById("NoRunorderYet")){
                document.getElementById("NoRunorderYet").remove();
            }
            if(document.getElementById("loadingScreenRundown")){
                document.getElementById("loadingScreenRundown").remove();
            }
            
            if(allDt.run_date == date){
            sideRunorders.insertAdjacentHTML('afterbegin',`
            <div class="border-b border-[#eeeeee] px-5 py-2.5 select-none ">
                <div class="flex items-start justify-between gap-5">
                <div class="flex items-start gap-4">
                    <div class="Outfit-SemiBold flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600  text-[11px] ">${ allDt.air_time }</div>
                    <div class="min-w-0">
                    <h2 class="Outfit-SemiBold line-clamp-1 text-[14px] text-nowrap break-all">${ allDt.name }</h2>
                    <div class="mt-1 flex items-center gap-4 text-[10px] text-gray-400">
                        <span class="text-nowrap "> Producer: No Producer </span>
                        <span class="text-nowrap hidden md:block "> draft </span>
                    </div>
                    </div>
                </div>
                <div class="relative flex shrink-0 items-center gap-1">
                    <a href="/runorder/${data.runOrderId}">
                    <button class="hidden md:block rounded-lg px-3 py-2 text-[10px] text-gray-500 hover:bg-gray-100 hover:text-black cursor-pointer">Open</button>
                    </a>
                    <button onclick="activeRunOrder('${data.runOrderId}')" class="hidden md:block rounded-lg px-3 py-2 text-[10px] text-gray-500 hover:bg-gray-100 hover:text-black cursor-pointer">Set Active</button>
                    <button onclick="toggleRunOrderMenu(this)" class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-black">⋮</button>
                    <div class="runorder-menu absolute top-10 right-0 z-50 hidden w-44 rounded-xl border border-[#e5e5e5] bg-white p-1.5 shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
                    <a href="/runorder/${data.runOrderId}">
                    <button class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] text-gray-600 hover:bg-gray-100 hover:text-black">
                        <svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12ZM12.0003 17C14.7617 17 17.0003 14.7614 17.0003 12C17.0003 9.23858 14.7617 7 12.0003 7C9.23884 7 7.00026 9.23858 7.00026 12C7.00026 14.7614 9.23884 17 12.0003 17ZM12.0003 15C10.3434 15 9.00026 13.6569 9.00026 12C9.00026 10.3431 10.3434 9 12.0003 9C13.6571 9 15.0003 10.3431 15.0003 12C15.0003 13.6569 13.6571 15 12.0003 15Z"></path></svg>
                        <span>Open Run Order</span>
                    </button>
                    </a>
                    <button onclick="activeRunOrder('${data.runOrderId}')" class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] text-gray-600 hover:bg-gray-100 hover:text-black">
                        <svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM17.4571 9.45711L16.0429 8.04289L11 13.0858L8.20711 10.2929L6.79289 11.7071L11 15.9142L17.4571 9.45711Z"></path></svg>
                        <span>Set Active</span>
                    </button>
                    <button onclick="downloadRunOrder('${data.runOrderId}')" class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] text-gray-600 hover:bg-gray-100 hover:text-black">
                        <svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 19H21V21H3V19ZM13 13.1716L19.0711 7.1005L20.4853 8.51472L12 17L3.51472 8.51472L4.92893 7.1005L11 13.1716V2H13V13.1716Z"></path></svg>
                        <span>Download</span>
                    </button>
                    <button onclick="saveAsPreset('${data.runOrderId}')" class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] text-gray-600 hover:bg-gray-100 hover:text-black">
                        <svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 19H19V6.82843L17.1716 5H16V9H7V5H5V19H6V12H18V19ZM4 3H18L20.7071 5.70711C20.8946 5.89464 21 6.149 21 6.41421V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM8 14V19H16V14H8Z"></path></svg>
                        <span>Save as Preset</span>
                    </button>
                    <div class="my-1 border-t border-[#eeeeee]"></div>
                    <button onclick="deleteRunOrder('${data.runOrderId}')" class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] text-red-500 hover:bg-red-50">
                        <svg width="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path></svg>
                        <span>Delete Run Order</span>
                    </button>
                    </div>
                </div>
                </div>
            </div>
            `)
            }
            runOrderName.value = "";
            runOrderDate.value = `${year}-${month}-${day}`;
            runOrderAirtime.value = `${String(hour).padStart(2, '0')}:00`;
        } else {
            showAlert('error', data.message);
        }
    })
    .catch(error => {
        console.error(error);
        showAlert('error','An error occurred. Please try again.');
    }).finally(()=>{
        newRunOrder.Disabled = false;
        newRunOrder.querySelector('#buttonText').classList.add('flex')
        newRunOrder.querySelector('#buttonText').classList.remove('hidden')
        newRunOrder.querySelector('#buttionLoading').classList.add('hidden')
        newRunOrder.querySelector('#buttionLoading').classList.remove('flex')
    })
})


function activeRunOrder(id) {
    const selScreen = setTimeout(()=>{
        activatingRunOrder();
    }, 300);
    fetch(`/api/run-orders/${id}/active`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', data.message);
        }
    })
    .catch(error => {
        console.error(error);
        showAlert('error', 'An error occurred. Please try again.');
    }).finally(()=>{
        lineups(date);
        clearTimeout(selScreen);
    })
}

function activatingRunOrder() {
    sideRunorders.innerHTML = `
    <div id="activatingRundown" class="flex min-h-75 flex-col items-center justify-center px-6 py-10">
      <div class="relative flex h-11 w-11 items-center justify-center">
        <div class="absolute h-11 w-11 rounded-full border-2 border-gray-100"></div>
        <div class="absolute h-11 w-11 animate-spin rounded-full border-2 border-transparent border-t-red-500"></div>
      </div>
      <div class="Outfit-Medium mt-4 text-[12px] text-gray-700">Activating rundown</div>
      <div class="mt-1 text-[10px] text-gray-400">Setting this rundown as the currently active broadcast rundown.</div>
      <div class="mt-6 w-full max-w-90 space-y-2">
        <div class="animate-pulse rounded-lg border border-[#ed6f6f] p-3">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-red-100"></div>
            <div class="flex-1">
              <div class="h-2.5 w-1/2 rounded bg-red-100"></div>
              <div class="mt-2 h-2 w-2/3 rounded bg-red-100"></div>
            </div>
            <div class="h-5 w-12 rounded bg-red-100"></div>
          </div>
        </div>
      </div>
    </div>
    `;
}
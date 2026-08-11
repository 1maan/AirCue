let username = document.getElementById("username");
let password = document.getElementById("password");

let loginButton = document.getElementById("loginButton");
let button_Text = loginButton.querySelector('#button_Text')
let button_Loading = loginButton.querySelector('#button_Loading')

loginButton.addEventListener("click", ()=>{
    button_Loading.classList.remove('hidden')
    button_Text.classList.add('hidden')

    if(!username.value){
        username.classList.add('border-red-600');
        button_Loading.classList.add('hidden')
        button_Text.classList.remove('hidden') 
        return;
    }
    if(!password.value){
        password.classList.add('border-red-600');
        button_Loading.classList.add('hidden')
        button_Text.classList.remove('hidden') 
        return;
    }

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
           username: username.value,
           password: password.value 
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            showAlert('success', data.message)
            username.value = "";
            password.value = "";
            setTimeout(()=>{
               location.href = '/'
            }, 1000)
        }
        if(!data.success){
            showAlert('error', data.message)
        }

    }).catch(error => {
            showAlert('error', 'An error occurred. Please try again.');
    }).finally(()=>{
        button_Loading.classList.add('hidden')
        button_Text.classList.remove('hidden')    
    })
})

username.addEventListener('input', ()=>{
    if(username.classList.contains('border-red-600')){
        username.classList.remove('border-red-600')
    }
})
password.addEventListener('input', ()=>{
    if(password.classList.contains('border-red-600')){
        password.classList.remove('border-red-600')
    }
})
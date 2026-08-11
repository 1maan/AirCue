let fullname = document.getElementById('fullname').value
let username = document.getElementById('username').value
let email = document.getElementById('email').value
let role = document.getElementById('role')
let password = document.getElementById('password').value
let createUser = document.getElementById('createUser')

createUser.addEventListener('click', ()=>{
    let formData = new FormData();
    formData.append('fullname',fullname)
    formData.append('username',username)
    formData.append('role',role)
    formData.append('password',password)

    fetch('/api/add-user',{
        method: 'post',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
           formData 
        })
    }).then(response => response.json())
    .then(data =>{
        if(success){
            console.log(data)
        }
    })




})
const API = "https://warrantyremember-web-backend.onrender.com/api/warranties"

const user = localStorage.getItem("user")

if(!user){
window.location="index.html"
}

/* show logged user */

function showUser(){

const email = localStorage.getItem("user")

if(email){

document.getElementById("userEmail").innerText=email

}else{

window.location="index.html"

}

}


/* LOAD DATA */

async function loadData(){

showUser()

const user = localStorage.getItem("user")

const res = await fetch(API+"/all/"+user)

const data = await res.json()

const list = document.getElementById("list")

list.innerHTML=""

let today = new Date()

let active=0
let expired=0
let soon=0


data.forEach(item=>{

let expiry = new Date(item.expiryDate)

let days = Math.ceil((expiry - today)/(1000*60*60*24))

/* FIX PROGRESS BAR */

let percent = 100 - (days/365*100)

if(percent < 0) percent = 0
if(percent > 100) percent = 100


/* ALERT ICON */

let alertIcon=""

if(days <=14 && days >0){
alertIcon="⚠ Expiring Soon"
soon++
}
else if(days <0){
alertIcon="❌ Expired"
expired++
}
else{
active++
}


/* CARD */

list.innerHTML += `

<div class="card ${days<0 ? "expiredCard":""}">

<h3>${item.product}</h3>

<p>${item.brand}</p>

<div class="progress">
<div class="bar" style="width:${percent}%"></div>
</div>

<p>${days} days remaining</p>

<p class="alert">${alertIcon}</p>

<div class="btnRow">

<button onclick="editWarranty('${item._id}','${item.product}','${item.brand}','${item.purchaseDate}')">
Edit
</button>

<button onclick="deleteWarranty('${item._id}')">
Delete
</button>

</div>

</div>

`

})


document.getElementById("total").innerText=data.length
document.getElementById("active").innerText=active
document.getElementById("soon").innerText=soon
document.getElementById("expired").innerText=expired

}


/* SEARCH */

function searchWarranty(){

let input=document.getElementById("search").value.toLowerCase()

let cards=document.querySelectorAll(".card")

cards.forEach(card=>{

let text=card.innerText.toLowerCase()

card.style.display = text.includes(input) ? "block":"none"

})

}


/* SAVE WARRANTY */

async function saveWarranty(){

    let product = document.getElementById("product").value
    let brand = document.getElementById("brand").value
    let purchaseDate = document.getElementById("purchaseDate").value
    let duration = document.getElementById("duration").value
    let durationType = document.getElementById("durationType").value
    
    let email = localStorage.getItem("user")
    
    let purchase = new Date(purchaseDate)
    
    let expiry = new Date(purchase)
    
    /* SUPPORT MONTHS OR YEARS */
    
    if(durationType === "years"){
    expiry.setFullYear(expiry.getFullYear() + Number(duration))
    }
    else{
    expiry.setMonth(expiry.getMonth() + Number(duration))
    }
    
    
    /* EDIT MODE */
    
    if(window.editID){
    
    await fetch(API + "/update/" + window.editID , {
    
    method:"PUT",
    
    headers:{
    "Content-Type":"application/json"
    },
    
    body:JSON.stringify({
    product,
    brand,
    purchaseDate,
    expiryDate:expiry
    })
    
    })
    
    window.editID = null
    
    }else{
    
    /* ADD NEW */
    
    await fetch(API + "/add",{
    
    method:"POST",
    
    headers:{
    "Content-Type":"application/json"
    },
    
    body:JSON.stringify({
    product,
    brand,
    purchaseDate,
    expiryDate:expiry,
    email
    })
    
    })
    
    }
    
    closeModal()
    
    loadData()
    
    }


/* EDIT */

function editWarranty(id,product,brand,purchaseDate){

    openModal()
    
    document.getElementById("product").value = product
    document.getElementById("brand").value = brand
    document.getElementById("purchaseDate").value = purchaseDate.split("T")[0]
    
    window.editID = id
    
    }


/* DELETE */

async function deleteWarranty(id){

    if(!confirm("Delete this warranty?")) return
    
    await fetch(API + "/" + id, {
    method:"DELETE"
    })
    
    loadData()
    
    }


/* MODAL */

function openModal(){
document.getElementById("modal").style.display="flex"
}

function closeModal(){
document.getElementById("modal").style.display="none"
}


/* LOGOUT */

function logout(){

localStorage.removeItem("user")
localStorage.removeItem("token")

window.location="index.html"

}

function toggleProfile(){

    let menu=document.getElementById("profileMenu")
    
    if(menu.style.display==="flex"){
    menu.style.display="none"
    }else{
    menu.style.display="flex"
    }
    
    }
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://scrimfirebase-default-rtdb.asia-southeast1.firebasedatabase.app/"
}   

const app = initializeApp(appSettings)
const database = getDatabase(app)
let shoppingListInDB 

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")
const loginButtonEl = document.getElementById("login-button")
const userInputEl = document.getElementById("input-user")

loginButtonEl.addEventListener("click", function(){
    //login system input, new db location   
    let userValue = userInputEl.value
    let shopperInDB = ref(database,`user/${userValue}`)
    onValue(shopperInDB,function(snapshot){
        if(snapshot.exists()){
            // if db loc exists, then set as usable db
            
        }
        else{
            shoppingListEl.innerHTML = "No items here... yet"
        }
        shoppingListInDB = ref(database,`user/${userValue}`)
        let itemsArray = Object.entries(snapshot.val())  

        clearShoppingListEl()      
    
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]              
            appendItemToShoppingListEl(currentItem,userValue)
        }    
    })
})

addButtonEl.addEventListener("click", function() {
    //push input item to db
    let inputValue = inputFieldEl.value    
    push(shoppingListInDB, inputValue)    
    clearInputFieldEl()
    //seems to work
})

onValue(shoppingListInDB, function(snapshot) {
    //???????????????????
    alert(123)
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())        
        clearShoppingListEl()        
        //
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]              
            appendItemToShoppingListEl(currentItem)
        }    
    } else {
        shoppingListEl.innerHTML = "No items here... yet"
    }
})

function clearShoppingListEl() {
    //empty shopping list ul element
    shoppingListEl.innerHTML = ""
}

function clearInputFieldEl() {
    //empty item input 
    inputFieldEl.value = ""
}

function appendItemToShoppingListEl(item,user) {
    let itemID = item[0]
    let itemValue = item[1]
    
    //create new li el with itemValue
    let newEl = document.createElement("li")    
    newEl.textContent = itemValue
    
    //onclick remove item from shopping list
    newEl.addEventListener("click", function() {
        let exactLocationOfItemInDB = ref(database, `user/${user}/${itemID}`)        
        remove(exactLocationOfItemInDB)
    })
    //append created element to shoppinglist ul
    shoppingListEl.append(newEl)
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

//firebase initialization
const appSettings = {
    databaseURL: "https://scrimfirebase-default-rtdb.asia-southeast1.firebasedatabase.app/"
}   
const app = initializeApp(appSettings)

//db
const database = getDatabase(app)
let shoppingListInDB    
let shoppers = ref(database,`users`)

//elements
const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")
const loginButtonEl = document.getElementById("login-button")
const userInputEl = document.getElementById("input-user")
const loginToggle = document.getElementById("toggle")

//login system 
loginButtonEl.addEventListener("click", function(){
    //login system input, new db location   
    let userValue = userInputEl.value
    let shopperInDB = ref(database,`user/${userValue}`)
    clearInputFieldEl()
    //update list value + login function
    onValue(shopperInDB,function(snapshot){
        //signin/signup function        
        if(snapshot.exists()){
            shoppingListInDB = ref(database,`user/${userValue}`)
            
        }
        else{
            shoppingListEl.innerHTML = "No items here... yet"
            if(!loginToggle.checked){
                shoppingListInDB = ref(database,`user/${userValue}`)
            }
            else{
                alert("Your account doesnt exist")
            }
        }
        //store values from shopping list as array
        let itemsArray = Object.entries(snapshot.val())  
        //empty shopping list to avoid duplication - each update introduces new values
        clearShoppingListEl()      
    
        for (let i = 0; i < itemsArray.length; i++) {
            //for each item retrieved from db add to the list
            let currentItem = itemsArray[i]              
            appendItemToShoppingListEl(currentItem,userValue)
        }    
    })
})

addButtonEl.addEventListener("click", function() {
    //push input item to db
    let inputValue = inputFieldEl.value    
    if(inputValue != ""){ //ensure string isnt empty
        push(shoppingListInDB, inputValue)    
    }
    clearInputFieldEl()
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
    newEl.addEventListener("dblclick", function() {
        removeListEl(user,itemID)

    })
    newEl.addEventListener("click", function(){
        //change it from remove+add new el to updating in database with ID
        inputFieldEl.value = itemValue
        newEl.style.backgroundColor = "#e6c178"
        addButtonEl.addEventListener("click",function(){
        removeListEl(user,itemID)
        })
        setTimeout(()=>{
            newEl.style.backgroundColor = "#FFFDF8"
        },500)

    })


    //append created element to shoppinglist ul
    shoppingListEl.append(newEl)
}

function checkLoginSignup(logToggle){
    // true means signin false means signup
    return logToggle.checked
}

function removeListEl(user,id){
    let exactLocationOfItemInDB = ref(database, `user/${user}/${id}`)        
    remove(exactLocationOfItemInDB)
}
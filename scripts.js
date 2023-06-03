import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from  "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

//firebase initialization
const appSettings = {
    apiKey: "AIzaSyCGxok_pQu1JqerndbKE_ZaS_B5D2yiBws",
    authDomain: "scrimfirebase.firebaseapp.com",
    databaseURL: "https://scrimfirebase-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "scrimfirebase",
    storageBucket: "scrimfirebase.appspot.com",
    messagingSenderId: "630438927668",
    appId: "1:630438927668:web:330e0d3bc9845a7042d961"
}   
const app = initializeApp(appSettings) 
const database = getDatabase(app)
const authorization = getAuth(app)

//db
let shoppersInDB = ref(database,`users`)
let shoppingListInDB 

//authorization
let userKey

//elements
const inputEmailEl = document.getElementById("user-email")
const inputPasswordEl = document.getElementById("user-pwd")

const signInButton = document.getElementById("signin-button")
const signUpButton = document.getElementById("signup-button")
const signOutButton = document.getElementById("signout-button")

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")

const userNameEl = document.getElementById("user-view")

//div elements
const divShopping = document.getElementById("shopping")
const divAuthentication = document.getElementById("authentication")
// hide list el before login

divShopping.style.display = "none"

//signup func
const userSignUp = async() => {
    //input data
    const signUpEmail = inputEmailEl.value
    const signUpPassword = inputPasswordEl.value
    
    //create acc
    createUserWithEmailAndPassword(authorization, signUpEmail, signUpPassword)
    .then((userCredential) => {
        setUpListInDB(userCredential) 
    })
    .catch((error) => {
        handleAuthError(error)
    })
}

//signin func
const userSignIn = async() => {
    //input data
    const signInEmail = inputEmailEl.value
    const signInPassword = inputPasswordEl.value

    //signin
    signInWithEmailAndPassword(authorization, signInEmail, signInPassword)
    .then((userCredential) => {
        setUpListInDB(userCredential)
    })
    .catch((error) => {
        handleAuthError(error)
    })


}

//update ui with login status
const checkAuthState = async() => {
    onAuthStateChanged(authorization,user => {
        if(user){
            //if logged in show shopping list
            divAuthentication.style.display = "none"
            divShopping.style.display = "flex"
            userNameView(user.email)
            userKey = user.uid
            shoppingListInDB = ref(database, `users/${userKey}`)
            updateList(shoppingListInDB,userKey)

        }
        else{
            //if logged out show auth page
            divAuthentication.style.display = "flex "
            divShopping.style.display = "none"
        }
    })
}

//signout func
const userSignOut = async() => {
    await signOut(authorization)
    emptyAuthForm()
}   

//check login
checkAuthState();

signUpButton.addEventListener("click", userSignUp)
signInButton.addEventListener("click",userSignIn)
signOutButton.addEventListener("click",userSignOut)


//ensure shoppingcart item isnt empty
addButtonEl.addEventListener("click", function() {
    //push input item to db
    let inputValue = inputFieldEl.value    
    if(inputValue != ""){ //ensure string isnt empty
        push(shoppingListInDB, inputValue)    
    }
    clearInputFieldEl()
})

//empty shopping list ul element
function clearShoppingListEl() {    
    shoppingListEl.innerHTML = ""
}

//empty item input 
function clearInputFieldEl() {
    inputFieldEl.value = ""
}

//add to shopping list element
function appendItemToShoppingListEl(item,user) {
    let itemID = item[0]
    let itemValue = item[1]
    
    //create new li el with itemValue
    let newEl = document.createElement("li")    
    newEl.textContent = itemValue
    
    //on dblclick remove item from shopping list
    newEl.addEventListener("dblclick", function() {
        removeListEl(user,itemID)
        inputFieldEl.value = ""


    })
    //on single click open el in edit mode
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

function removeListEl(user,id){
    let exactLocationOfItemInDB = ref(database, `users/${user}/${id}`)        
    remove(exactLocationOfItemInDB)
}

//update list values in list el
function updateList(shopping,key){
    clearInputFieldEl()       
    
    onValue(shopping,function(snapshot){     
        if(snapshot.exists()){

        //store values from shopping list as array
        let itemsArray = Object.entries(snapshot.val())  
        //empty shopping list to avoid duplication - each update introduces new values
        clearShoppingListEl()      
    
        for (let i = 0; i < itemsArray.length; i++) {
            //for each item retrieved from db add to the list
            let currentItem = itemsArray[i]              
            appendItemToShoppingListEl(currentItem,key)
        }    
        }
        else{
            shoppingListEl.innerHTML = "No Items here yet...."
        }
    
    })
}

//clear signup form
function emptyAuthForm(){
    inputEmailEl.value = ""
    inputPasswordEl.value = ""
}

//handle errors in auth
function handleAuthError(error){
    //alert errors
    const errorMessage = error.message.split(" ").slice(-2).join(" ")
    emptyAuthForm()
    alert(errorMessage)
}

function userNameView(ign){
    var userName = ign.split("@")[0] + "groceryLtd."
    userNameEl.innerHTML = userName
}


//create/setup list in database
function setUpListInDB(userCredential){
    const user = userCredential.user
    userKey = user.uid
    //update shopping list
    shoppingListInDB = ref(database, `users/${userKey}`)
    updateList(shoppingListInDB,userKey)

}
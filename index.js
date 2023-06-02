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




//elements

const inputEmailEl = document.getElementById("user-email")
const inputPasswordEl = document.getElementById("user-pwd")

const signInButton = document.getElementById("signin-button")
const signUpButton = document.getElementById("signup-button")
const signOutButton = document.getElementById("signout-button")

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")


//div elements
const divShopping = document.getElementById("shopping")
const divAuthentication = document.getElementById("authentication")
// hide list el before login

divShopping.style.display = "none"

//authorization
let userKey


//authentication setup
const userSignUp = async() => {
    //input data
    const signUpEmail = inputEmailEl.value
    const signUpPassword = inputPasswordEl.value
    //empty form

    createUserWithEmailAndPassword(authorization, signUpEmail, signUpPassword)
    .then((userCredential) => {
        const user = userCredential.user
        const userKey = user.uid
        // const newElInDB = {
        //     key:userKey,
        //     list:false,
        // }
        shoppingListInDB = ref(database, `users/${userKey}`)
        updateList(shoppingListInDB,userKey)
        


        
     
        
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode + errorMessage)
    })


}

const userSignIn = async() => {
    //input data
    const signInEmail = inputEmailEl.value
    const signInPassword = inputPasswordEl.value
    signInWithEmailAndPassword(authorization, signInEmail, signInPassword)
    .then((userCredential) => {
        const user = userCredential.user
        userKey = user.uid
        // const newElInDB = {
        //     key:userKey,
        //     list:false,
        // }
        shoppingListInDB = ref(database, `users/${userKey}`)
        updateList(shoppingListInDB,userKey)
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode + errorMessage)
    })


}

const checkAuthState = async() => {
    onAuthStateChanged(authorization,user => {
        if(user){
            divAuthentication.style.display = "none"
            divShopping.style.display = "flex"
            userKey = user.uid
            shoppingListInDB = ref(database, `users/${userKey}`)
            updateList(shoppingListInDB,userKey)

        }
        else{
            divAuthentication.style.display = "flex "
            divShopping.style.display = "none"
        }
    })
}

const userSignOut = async() => {
    await signOut(authorization)
    emptySignUpForm()
}   

//trigger signup
checkAuthState();

signUpButton.addEventListener("click", userSignUp)
signInButton.addEventListener("click",userSignIn)
signOutButton.addEventListener("click",userSignOut)



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
        inputFieldEl.value = ""


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

function removeListEl(user,id){
    let exactLocationOfItemInDB = ref(database, `users/${user}/${id}`)        
    remove(exactLocationOfItemInDB)
}

function updateList(shopping,key){
    clearInputFieldEl()
        //update list value + login function
        
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

function emptySignUpForm(){
    inputEmailEl.value = ""
    inputPasswordEl.value = ""
}
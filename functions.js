const sha256 = require('sha256')
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://admin:password1@ds119662.mlab.com:19662/final-project-db'
let dbo

function setup(cb){
    MongoClient.connect(url, (err, db) => {
    if (err) throw err
    dbo = db.db('final-project-db')
    cb()
})}

function signup(username, password){
    let userID = Math.floor(Math.random()*10000)
    let signupDate = Date()
    let shaPassword = sha256(password)
    // stores all the signup information in the database
    dbo.collection('users').insertOne({ userID, username, signupDate, password: shaPassword, firstLogin: true }, (err, result) => {
        if (err) throw err
        console.log('success')
    })
}

function login(username, password, cb){
    let sessionID = Math.floor(Math.random()*10000)
    // checks the collection to see if there is a username that matches the input username. there should only be one match (if any)
    dbo.collection('users').findOne({ username: username }, (err, result) => {
        if (err) throw (err)
        // if it finds a result
        if (result) {
            // checks to see if the stored password matches the input password
            if (result.password === sha256(password)){
                // checks if firstLogin is set to true (if it *is* first login)
                if (result.firstLogin){
                    // next five lines updates firstLogin
                    let update = { $set: {firstLogin: !result.firstLogin}}; 
                    dbo.collection('users').updateOne({username:username}, update, (err, res) => {
                        if (err) throw err
                        console.log("one property updated")
                    })
                    // send a result back to server (endpoint)
                    let toSend = {
                        userID: result.userID, sessionID, makeProfile: true
                    }
                    cb(toSend)// and userID, and sessionID
                } else {
                    // send a result back to server (endpoint)
                    let toSend = {
                        // will need to send dailyBudget
                        userID: result.userID, sessionID, makeProfile: false
                    }
                    cb(toSend)
                }
            }
        } else {
            let msg = "no such user"
            cb(msg)
        }
    })
   

}

function calculateDailySaveGoal(startDate, endDate, amount){
    let daysInBetween = Math.floor((endDate - startDate)/(1000*60*60*24))
    let dailySaveGoal = amount/daysInBetween
    return dailySaveGoal
}

function calculateDailyDisposable(fixedIncome, fixedExpense){
    let monthlyIncome
    if (fixedIncome.type === 'biweekly'){
        monthlyIncome = (fixedIncome.amount / 14) * 30
    }
    if (fixedIncome.type === 'yearly'){
        monthlyIncome = fixedIncome.amount / 12
    }
    let arrFixedExpenses = Object.values(fixedExpense)
    let arrAsNumbers = []
    for (let i = 0; i < arrFixedExpenses.length; i ++){
        arrAsNumbers = arrAsNumbers.concat(Number(arrFixedExpenses[i]))
    }
    let sumFixedExp = 0
    for (let i = 0; i < arrAsNumbers.length; i++){
        sumFixedExp += arrAsNumbers[i]
    }
    let monthlyDisposable = monthlyIncome - sumFixedExp
    let dailyDisposable = monthlyDisposable / 30
    return dailyDisposable
}

function calculateTodaysBudget(dailyDisposable, todaysSpending, rollover){
    return dailyDisposable - todaysSpending + rollover
}

module.exports = {
    setup,
    signup,
    login
}
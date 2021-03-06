const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const functions = require('./functions.js')

app.use(bodyParser.raw({ type: '*/*' }))

functions.setup(() => app.listen(4000, console.log('listening on 4000')))

app.post('/signUp', (req, res) => {
    /*
    expecting >>> {username: username, password: password}
    returns >>>> { signUp: true/false }
    */
    let parsedBody = JSON.parse(req.body.toString())
    let username = parsedBody.username
    let password = parsedBody.password
    // on the front end, have two prompts for passwords. Check that they match on the 
    // front end or back end?
    // "stretch": check that the username already exists?
    if (username && password) {
        functions.signup(username, password)
        res.send({ signUp: true }) // don't really need to send anything
    } else {
        // ex. front end can alert(parsedBody.message)
        res.send(JSON.stringify({ signUp: false, message: "sign up failed" }))
    }
})

app.post('/login', (req, res) => {
    /*
    expecting >>>> {username: username, password: password}
    returns >>> check Google Docs for options
    */
    let parsedBody = JSON.parse(req.body.toString())
    let username = parsedBody.username
    let password = parsedBody.password
    // if the user has entered both a username and password, check MongoDB
    if (username && password) {
        // the third parameter here is a callback function to deal with the fact that checking the
        // db is asynchronous. This way, we actually wait for the result of functions.login 
        // before res.sending it
        functions.login(username, password, (result) => {
            console.log(result)
            res.send(result)
        })

    } else {
        res.send(JSON.stringify({ loggedIn: false, reason: "you missed an input" }))
    }
})

app.post('/setUpGoal', (req, res) => {
    /*
    expecting  >>> {
        userID: userID, 
        goal : {
            type: "travel",
            amount: 500,
            endDate: "05/05/2019"
        }
    }
    returns >>> {"dailySaveGoal" : 50}

    */
    let parsedBody = JSON.parse(req.body.toString())
    let userID = parsedBody.userID
    let goal = parsedBody.goal
    let type = goal.type
    let amount = goal.amount
    let endDate = goal.endDate; // prompt user to enter date in MM/DD/YYYY (have it as placeholder)
    // stores goal in DB. nothing to send to frontend
    functions.storeGoal( userID,  {type, amount, endDate} , (result) => {
        console.log("store goal ", result)
    })
    // calculates the dailySaveGoal and sends it to frontend as an object {"dailySaveGoal": 350}
    functions.calculateDailySaveGoal(userID, {endDate, amount}, (result) => {
        console.log(result)
        res.send(JSON.stringify(result))
    })
    // if dailySaveGoal is too high or low, prompt for more realistic? Could
    // they still resubmit?
})

app.post('/setUpFixed', (req, res) => {
    /*
expecting  >>> {
userID: userID, 
fixedExpense : {
    rent: 800,
    transport: 100,
    health: 50,
    other: 100
},
fixedIncome: {
    type: biweekly, amount: 1000
}
}
returns >>> {"dailyDisposable" : 50}
*/
    let parsedBody = JSON.parse(req.body.toString())
    let userID = parsedBody.userID
    let fixedExpense = parsedBody.fixedExpense
    let fixedIncome = parsedBody.fixedIncome
    // stores the information in the DB, nothing to send to frontend
    functions.storeFixed(userID, fixedExpense, fixedIncome, (result) => {
        console.log(result)
    })
    // calculates the dailydisposable amount
    functions.calculateDailyDisposable(userID, fixedExpense, fixedIncome, (result) => {
        console.log(result)
        res.send(JSON.stringify(result))
    })

    // "stretch": have a catch if the disposable is negative?
})

app.post('/inputVariable', (req, res) => {
    let parsedBody = JSON.parse(req.body.toString())
    let spentAmount = parsedBody.amount
    // get todaysSpending from DB
    // let todaysSpending += spentAmount. Have a check to switch the sign 
    // if it's an income instead of an expense?
    let todaysSpending = 10
    res.send(JSON.stringify({ todaysSpending: todaysSpending })) // don't really need to send anything
})

app.get('/getSavingsStatus', (req, res) => {
    let userID = req.query.userID
    // check DB for savingsToDate, goal amount
    let savingsToDate = 250
    // send savingsToDatet AND goalAmount? where does the comparing happen?
    res.send(JSON.stringify({ savingsToDate: savingsToDate}))
})

app.get('/todaysBudget', (req, res) => {
    let userID = req.query.userID
    // check DB for dailyDisposable, todaysSpending, rollover
    // let todaysBudget = functions.calculateTodaysBudget(dailyDisposable, todaysSpending, rollover)
    // reset rollover to 0
    let todaysBudget = 50
    res.send(JSON.stringify({ todaysBudget: todaysBudget}))
})

app.post('/endOfDay', (req, res) => {
    
    let parsedBody = JSON.parse(req.body.toString())
    // saved amount must be >= 0. 
    let savedAmount = parsedBody.savedAmount
    // rollover amount can be negative
    let rolloverAmount = parsedBody.rolloverAmount
    // check DB for savingsToDate, let savingsToDate += savedAmount
    // assign rollover to rolloverAmount, let rollover = rolloverAmount
    // have a separate fetch to get alert messages, and have these just be flags?
    // if (savedAmount > dailySaveGoal) {res.send "Congrats on saving more than planned, keep it up!"}
    // if (rolloverAmount < 0) {res.send "Careful not to spend too much!"}
    res.send(JSON.stringify('end of day'))
})

app.get('/showWeek')
/*
need to get { day : { dailyDisposable : 100, todaysBudget: -15 }}. Push these days in to 
a week array. Then have week.map(day => dailyDisposable : 100, todaysBudget : -15)
*/

// app.post('/deleteTransaction')

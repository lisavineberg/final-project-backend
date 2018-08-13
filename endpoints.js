const express = require ('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.raw({ type: '*/*' }))

app.post('/login', (req, res) => {
    let parsedBody = JSON.parse(req.body.toString())
    let username = parsedBody.username
    let password = parsedBody.password
    // currently checking if it received a username and a password. Would 
    // need to check if username/password match what's in DB (Mongo .find)
    if (username && password) {
        // if (!profileSetUp){
            res.send(JSON.stringify({ firstLogin: false, userID: 2, sessionID: 1212}))
        // } else {
        //     res.send(JSON.stringify({ userID: 2, sessionID: 1213, todaysBudget: dailyDisposable + rollover}))
        // }
    } else {
        res.send(JSON.stringify({ loggedIn: false, reason: "no such user"}))
    }
})

app.post('/signUp', (req, res) => {
    let parsedBody = JSON.parse(req.body.toString())
    let username = parsedBody.username
    let password = parsedBody.password
    // on the front end, have two prompts for passwords. Check that they match on the 
    // front end or back end?
    // "stretch": check that the username already exists?
    if (username && password){
        // store this information
        let startDate = Date.now()
        let userID = Math.floor(Math.random() * 10000)
        res.send({ signUp: true }) // don't really need to send anything
    } else {
        // ex. front end can alert(parsedBody.message)
        res.send(JSON.stringify({ signUp: false, message: "sign up failed"}))
    }
})

app.post('/setUpGoal', (req, res) => {
    let parsedBody = JSON.parse(req.body.toString())
    let type = parsedBody.type
    let amount = parsedBody.amount
    // prompt user to enter date in MM/DD/YYYY (have it as placeholder)
    let endDate = parsedBody.endDate
    let endDateInMSec = Date.parse(endDate)
    // would make a request to the server for the startDate. 
    // let daysInBetween = (endDateInMSec - startDate)/(1000*60*60*24)
    // let dailySaveGoal = amount/daysInBetween
    // let dailySaveGoal = 10
    res.send(JSON.stringify({ dailySaveGoal: dailySaveGoal}))
    // if dailySaveGoal is too high or low, prompt for more realistic? Could
    // they still resubmit?
})

app.post('/setUpFixed', (req, res) => {
    let parsedBody = JSON.parse(req.body.toString())
    // fixedExpense should be an object, {rent: 1000, loan: 50, transport: 80}
    let fixedExpense = parsedBody.fixedExpense
    // fixedIncome should be an object, {type: bi-weekly, amount: 800}
    let fixedIncome = parsedBody.fixedIncome
    // if (fixedIncome.type==='biweekly') {let monthlyIncome = (amount/14)*30}
    // if (fixedIncome.type==='yearly') {let monthlyIncome = (amount/12)}
    // let monthlyExpenses = sum all the expenses somehow? Object.values?
    // let monthlyDisposable = monthlyIncome - monthlyExpenses
    // let dailyDisposable = monthlyDisposable / 30
    let dailyDisposable = 60
    res.send(JSON.stringify({ dailyDisposable: dailyDisposable }))
    // "stretch": have a catch if the disposable is negative?
})

app.post('/inputVariable', (req, res) => {
    let parsedBody = JSON.parse(req.body.toString())
    let spentAmount = parsedBody.amount
    // get dailySpending from DB
    // let dailySpending += spentAmount. Have a check to switch the sign 
    // if it's an income instead of an expense?
    let dailySpending = 10
    res.send(JSON.stringify({ dailySpending: dailySpending })) // don't really need to send anything
})

app.get('/getSavingsStatus', (req, res) => {
    let userID = req.query.userID
    // check DB for savedAmount, goal amount
    let savedAmount = 250
    // send savedAmount AND goalAmount? where does the comparing happen?
    res.send(JSON.stringify({ savedAmount: savedAmount}))
})

app.get('/todaysBudget', (req, res) => {
    let userID = req.query.userID
    // check DB for dailyDisposable, rollover, dailySaveGoal, dailySpending
    // todaysBudget = dailyDisposable + rollover - dailySpending
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
    // check DB for savingsProgress, let savingsProgress += savedAmount
    // assign rollover to rolloverAmount, let rollover = rolloverAmount
    // have a separate fetch to get alert messages, and have these just be flags?
    // if (savedAmount > dailySaveGoal) {res.send "Congrats on saving more than planned, keep it up!"}
    // if (rolloverAmount < 0) {res.send "Careful not to spend too much!"}
    res.send(JSON.stringify('end of day'))
})

app.listen(4000, console.log('listening on 4000'))
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const functions = require('./functions.js')


app.use(bodyParser.raw({ type: '*/*' }))

functions.setup(() => app.listen(4000, console.log('listening on 4000')))

app.post('/signUp', (req, res) => {
    let parsedBody = JSON.parse(req.body.toString())
    let username = parsedBody.username
    let password = parsedBody.password
    // on the front end, have two prompts for passwords. Check that they match on the 
    // front end or back end?
    // "stretch": check that the username already exists?
    if (username && password) {
        functions.signup(username, password)
        res.send(JSON.stringify({ signUp: true })) // don't really need to send anything
    } else {
        res.send(JSON.stringify({ signUp: false }))
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
        res.send(JSON.stringify({ loginFailed: true }))
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
    let amount = parseFloat(goal.amount)
    let endDate = goal.endDate;
    // stores goal in DB. nothing to send to frontend
    functions.storeGoal(userID, { type, amount, endDate }, (result) => {
        console.log("store goal ", result)
    })
    // calculates the dailySaveGoal and sends it to frontend as an object {"dailySaveGoal": 350, mustMakeFixedProfile: t/f, unrealistic: t/f}
    functions.calculateDailySaveGoal(userID, { endDate, amount }, (result) => {
        console.log(result)
        res.send(JSON.stringify(result))
    })
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

app.get('/todaysBudget', (req, res) => {
    let userID = parseInt(req.query.userID)
    // check DB for dailyDisposable, todaysVariable
    functions.calculateTodaysBudget(userID, (result) => {
        // returns { todaysBudget: 39}
        res.send(JSON.stringify(result))
    })

})

app.post('/inputVariable', (req, res) => {
    /*
expecting  >>> {
userID: userID, 
expense : {
    type: food,
    amount: 10,
}}
returns >>> nothing really?
*/
    let parsedBody = JSON.parse(req.body.toString())
    let userID = parsedBody.userID
    let expense = parsedBody.expense
    expense.date = Date()
    // Have a check to switch the sign 
    functions.storeExpense(userID, expense, (result) => {
        console.log(result)
    })
    functions.updateTodaysVariable(userID, expense, (result) => {
        console.log(result)
        res.send(JSON.stringify(result))
    })
})

app.post('/endOfDay', (req, res) => {
    /*
expecting  >>> {
userID: userID, 
rolloverAmount: 10,
savedAmount: 10
}
*/
    let parsedBody = JSON.parse(req.body.toString())
    let userID = parsedBody.userID
    // saved amount must be >= 0. 
    let savedAmount = parseFloat(parsedBody.savedAmount)
    // rollover amount can be negative
    let rolloverAmount = parseFloat(parsedBody.rolloverAmount)

    functions.endOfDay(userID, savedAmount, rolloverAmount, (result) => {
        console.log(result)
        res.send(JSON.stringify(result))
    })

    functions.storeRecord(userID, (result) => {
        // result: added to exisiting user/added to new user
        console.log(result)
    })
})

app.get('/getSavingsStatus', (req, res) => {
    let userID = parseInt(req.query.userID)
    functions.getProgressAndTodaysInfo(userID, (result) => {
        console.log(result)
        res.send(JSON.stringify(result))
    })
})

app.get('/showWeek')
/*
need to get { day : { dailyDisposable : 100, todaysBudget: -15 }}. Push these days in to 
a week array. Then have week.map(day => dailyDisposable : 100, todaysBudget : -15)
*/

app.get('/getDate')

app.post('/getRecord', (req, res) => {
    let parsedBody = JSON.parse(req.body.toString())
    let userID = parseInt(parsedBody.userID)
    let date = parsedBody.date
    functions.getRecord(userID, date, (result) => {
        res.send(JSON.stringify(result))
    })
})

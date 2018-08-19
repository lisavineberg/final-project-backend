const sha256 = require('sha256')
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://admin:password1@ds119662.mlab.com:19662/final-project-db'
let dbo
const moment = require('moment')

function setup(cb) {
    MongoClient.connect(url, (err, db) => {
        if (err) throw err
        dbo = db.db('final-project-db')
        cb()
    })
}

function signup(username, password) {
    let userID = Math.floor(Math.random() * 10000)
    let signupDate = Date()
    let shaPassword = sha256(password)
    // stores all the signup information in the database
    dbo.collection('users').insertOne({ userID, username, signupDate, password: shaPassword, mustMakeGoalProfile: true, mustMakeFixedProfile: true }, (err, result) => {
        if (err) throw err
        console.log('success')
    })
}

function login(username, password, cb) {
    // checks the collection to see if there is a username that matches the input username. there should only be one match (if any)
    dbo.collection('users').findOne({ username: username }, (err, result) => {
        if (err) throw (err)
        // if it finds a result
        if (result) {
            // checks to see if the stored password matches the input password
            if (result.password === sha256(password)) {

                // // checks if firstLogin is set to true (if it *is* first login)
                // if (result.firstLogin) {
                //     // send a result back to server (endpoint)
                //     // store this too??
                //     let toSend = {
                //         userID: result.userID, sessionID, mustMakeGoalProfile: true, mustMakeFixedProfile: true
                //     }
                //     cb(toSend)// and userID, and sessionID
                //     let update = { $set: { firstLogin: !result.firstLogin, mustMakeGoalProfile: true, mustMakeFixedProfile: true } }
                //     dbo.collection('users').updateOne({ userID: result.userID }, update, (err, res) => {
                //         if (err) throw err
                //     })
                // } else {
                //     // send a result back to server (endpoint)
                //     let toSend = {
                //         // will need to send dailyBudget
                //         userID: result.userID, sessionID, dailySaveGoal: result.dailySaveGoal
                //     }
                //     cb(toSend)
                // }

                if (result.mustMakeGoalProfile) {
                    let toSend = {
                        userID: result.userID, mustMakeGoalProfile: true, mustMakeFixedProfile: true
                    }
                    cb(toSend)
                } else if (result.mustMakeFixedProfile) {
                    let toSend = {
                        userID: result.userID, dailySaveGoal: result.dailySaveGoal, mustMakeFixedProfile: true
                    }
                    cb(toSend)
                } else {
                    let todaysBudget;
                    (result.todaysBudget) ?
                        todaysBudget = result.todaysBudget :
                        todaysBudget = result.dailyDisposable
                    let todaysVariable;
                    (result.todaysVariable) ?
                        todaysVariable = result.todaysVariable :
                        todaysVariable = 0
                    let startOfDayBudget;
                    (result.startOfDayBudget)?
                        startOfDayBudget = result.startOfDayBudget :
                        startOfDayBudget = result.dailyDisposable
                    let toSend = {
                        userID: result.userID, dailySaveGoal: result.dailySaveGoal, todaysBudget, todaysVariable
                    }
                    cb(toSend)
                }

            } else {
                cb({ loginFailed: true })
            }
        } else {
            cb({ loginFailed: true })
        }
    })
}

function storeGoal(userID, goal, cb) {
    // looks for the user with the userID
    dbo.collection('users').findOne({ userID: userID }, (err, result) => {
        if (err) throw err
        if (result) {
            let update = { $set: { goal, mustMakeGoalProfile: false } }
            // careful: overwrites whatever the goal is already, if there is one
            dbo.collection('users').updateOne({ userID: userID }, update, (err, res) => {
                if (err) throw err
                cb("goal updated")
            })
        }
    })
}

function calculateDailySaveGoal(userID, goal, cb) {
    dbo.collection('users').findOne({ userID: userID }, (err, result) => {
        if (err) throw err
        if (result) {
            let startDate = Date.parse(result.signupDate)
            let endDate = Date.parse(goal.endDate)
            let amount = goal.amount
            let daysInBetween = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
            let dailySaveGoal = Math.ceil(amount / daysInBetween)
            // returns the calculated amount as an object, { dailySaveGoal : 450 }
            if (dailySaveGoal < 5) {
                cb({ dailySaveGoal, unrealistic: true, mustMakeFixedProfile: result.mustMakeFixedProfile })
            } else if (dailySaveGoal > 50) {
                cb(({ dailySaveGoal, unrealistic: true, mustMakeFixedProfile: result.mustMakeFixedProfile }))
            } else {
                cb({ dailySaveGoal, mustMakeFixedProfile: result.mustMakeFixedProfile })
            }
            let update = { $set: { dailySaveGoal } }
            // stores the dailySaveGoal in the server, as a property of the user
            dbo.collection('users').updateOne({ userID: userID }, update, (err, res) => {
                if (err) throw err
            })
        }
    })
}

function storeFixed(userID, fixedExpense, fixedIncome, cb) {
    // find the user in the database
    dbo.collection('users').findOne({ userID: userID }, (err, result) => {
        if (err) throw err
        if (result) {
            // write the fixed income/expense to the database, change mustMakeFixedProfile to false
            let update = { $set: { fixedExpense, fixedIncome, mustMakeFixedProfile: false } }
            dbo.collection('users').updateOne({ userID: userID }, update, (err, res) => {
                if (err) throw err
                cb("fixed updated")
            })
        }
    })
}

function calculateDailyDisposable(userID, fixedExpense, fixedIncome, cb) {
    dbo.collection('users').findOne({ userID: userID }, (err, result) => {
        if (err) throw err
        if (result) {
            let monthlyIncome;
            if (fixedIncome.type === 'biweekly') {
                monthlyIncome = (parseFloat(fixedIncome.amount) / 14) * 30
            }
            if (fixedIncome.type === 'yearly') {
                monthlyIncome = parseFloat(fixedIncome.amount) / 12
            }
            if (fixedIncome.type === 'monthly') {
                monthlyIncome = parseFloat(fixedIncome.amount)
            }
            let arrFixedExpenses = Object.values(fixedExpense)
            let arrAsNumbers = []
            for (let i = 0; i < arrFixedExpenses.length; i++) {
                if (arrFixedExpenses[i] !== "") { arrAsNumbers = arrAsNumbers.concat(parseFloat(arrFixedExpenses[i])) }
            }
            let sumFixedExp = 0
            for (let i = 0; i < arrAsNumbers.length; i++) {
                sumFixedExp += arrAsNumbers[i]
            }
            let monthlyDisposable = monthlyIncome - sumFixedExp
            let dailyDisposable = Math.floor(monthlyDisposable / 30)
            ///CHANGED BELOW!
            cb({ todaysBudget: dailyDisposable })
            let update = { $set: { dailyDisposable, startOfDayBudget: dailyDisposable } }
            dbo.collection('users').updateOne({ userID: userID }, update, (err, res) => {
                if (err) throw err
            })


        }
    })
}

function calculateTodaysBudget(userID, cb) {
    // because it's receiving the userID as a query, you have to switch it to an int
    dbo.collection('users').findOne({ userID: userID }, (err, result) => {
        if (err) throw err
        if (result) {
            let todaysVariable;
            // if the user doesn't have a todaysVariable yet, set it to zero
            (result.todaysVariable) ?
                todaysVariable = result.todaysVariable :
                todaysVariable = 0;
            let updatedBudget;
            // if the user has already updated their budget, set it to the most recent (todaysBudget)
            // otherwise, set to the dailyDisposable
            (result.todaysBudget) ?
                updatedBudget = result.todaysBudget :
                updatedBudget = result.dailyDisposable
            // modify the budget as necessary
            updatedBudget = updatedBudget - todaysVariable
            cb({ todaysBudget: updatedBudget })
            // reset todaysVariable and rollover to zero once they've been accounted for in the budget
            let update = { $set: { todaysBudget: updatedBudget, todaysVariable: 0 } }
            // updates todaysBudget in the users DB
            dbo.collection('users').updateOne({ userID: userID }, update, (err, res) => {
                if (err) throw err
                console.log('todays budget updated')
            })
        }

    })
}

function storeExpense(userID, expense, cb) {
    dbo.collection('transactions').findOne({ userID: userID }, (err, result) => {
        if (err) throw err
        // if the user exists in the transactions DB already
        if (result) {
            // make an array out of their current transactions
            let newArr = result.expense
            // add the new expense to the array
            newArr = newArr.concat(expense)
            // newArr = newArr.flat()
            // update the DB
            let update = { $set: { expense: newArr } }
            dbo.collection('transactions').updateOne({ userID: userID }, update, (err, res) => {
                if (err) throw err
                cb('added to exisiting user')
            })
            // if the user hasn't made a transaction yet
        } else {
            dbo.collection('transactions').insertOne({ userID: userID }, (err, res) => {
                if (err) throw err
                // add the new user to the DB as well as their transaction
                let update = { $set: { expense: [expense] } }
                dbo.collection('transactions').updateOne({ userID: userID }, update, (err, res) => {
                    if (err) throw err
                    cb('added to new user')
                })
            })
        }
    })
}

function updateTodaysVariable(userID, expense, cb) {
    dbo.collection('users').findOne({ userID: userID }, (err, result) => {
        if (err) throw err
        if (result) {
            let expenseAmount = parseFloat(expense.amount)
            let newTodaysVariable;
            (result.todaysVariable) ?
                newTodaysVariable = expenseAmount + result.todaysVariable :
                newTodaysVariable = expenseAmount;
            let newTodaysBudget;
            (result.todaysBudget) ?
                newTodaysBudget = result.todaysBudget - expenseAmount :
                newTodaysBudget = result.dailyDisposable - expenseAmount
            let update = {
                $set: {
                    todaysBudget: newTodaysBudget,
                    todaysVariable: newTodaysVariable
                }
            }
            cb({ todaysBudget: newTodaysBudget, todaysVariable: newTodaysVariable })
            dbo.collection('users').updateOne({ userID: userID }, update, (err, res) => {
                if (err) throw err
            })
        }
    })
}

function endOfDay(userID, savedAmount, rolloverAmount, cb) {
    dbo.collection('users').findOne({ userID: userID }, (err, result) => {
        if (err) throw err
        if (result) {
            let savingsToDate;
            (result.savingsToDate) ?
                savingsToDate = result.savingsToDate :
                savingsToDate = 0;
            savingsToDate += savedAmount
            let todaysBudget = result.dailyDisposable + rolloverAmount
            cb({ todaysBudget, todaysVariable: 0 })
            // let update = { $set: { savingsToDate: savingsToDate, rollover: rolloverAmount, todaysBudget: 0 } }
            let update = { $set: { savingsToDate, todaysBudget, todaysVariable: 0, startOfDayBudget: todaysBudget } }

            dbo.collection('users').updateOne({ userID: userID }, update, (err, res) => {
                if (err) throw err
            })
        }
    })
}

function storeRecord(userID, cb) {
    let startOfDayBudget;
    let leftoverFromDay;
    let date = moment().format('ddd D MMM YYYY')
    let record = {};
    dbo.collection('users').findOne({ userID: userID }, (err, res) => {
        if (err) throw err
        if (res) {
     
            startOfDayBudget = res.startOfDayBudget
            leftoverFromDay = res.todaysBudget
            record = { startOfDayBudget, leftoverFromDay, date }

            dbo.collection('records').findOne({ userID: userID }, (err, result) => {
                if (err) throw err
                if (result) {
                    let newArr = result.record
                    newArr = newArr.concat(record)
                    let update = { $set: { record: newArr } }
                    dbo.collection('records').updateOne({ userID: userID }, update, (err, res) => {
                        if (err) throw err
                        cb('added to existing user')
                    })
                } else {
                    dbo.collection('records').insertOne({ userID: userID }, (err, res) => {
                        if (err) throw err
                        console.log(record)
                        let update = { $set: { record: [record] } }
                        dbo.collection('records').updateOne({ userID: userID }, update, (err, res) => {
                            if (err) throw err
                            cb('added to new user')
                        })
                    })
                }
            })
        }
    })
}

function getProgressAndTodaysInfo(userID, cb) {
    dbo.collection('users').findOne({ userID: userID }, (err, result) => {
        if (err) throw err
        if (result) {
            let savingsToDate;
            (result.savingsToDate) ?
                savingsToDate = result.savingsToDate :
                savingsToDate = 0
            let todaysBudget;
            (result.todaysBudget) ?
                todaysBudget = result.todaysBudget :
                todaysBudget = result.dailyDisposable
            let goalAmount = result.goal.amount
            let toSend = { savingsToDate, todaysBudget, goalAmount, goalType: result.goal.type }
            cb(toSend)

        }
    })
}

function getRecord(userID, date, cb) {
    date += " 2018"
    dbo.collection('records').findOne({ userID: userID}, (err, result) => {
        if (err) throw err
        if (result) {
            let toSend = result.record.find(obj => {
                return obj.date === date
            })
            cb(toSend)
        }
    })
}


module.exports = {
    setup,
    signup,
    login,
    storeGoal,
    calculateDailySaveGoal,
    storeFixed,
    calculateDailyDisposable,
    calculateTodaysBudget,
    storeExpense,
    updateTodaysVariable,
    endOfDay,
    storeRecord,
    getProgressAndTodaysInfo,
    getRecord
}
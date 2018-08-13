function signup(username, password){
    let userID = Math.floor(Math.random()*10000)
    let signupDate = Date.now()
    let password = sha256(password)
    // store users[userID] = { userID, username, signUpDate, password}
    // nothing needs to be returned
}

function login(username, password){
    let result = {signup: false}
    // iterate through the users
    // check to see if they match
    // check if !profileSetUp

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
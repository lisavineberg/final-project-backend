let users = {
    2: {
        name: "Lisa",
        username: "Lisavineberg",
        password: "abc123",
        userID: 2,
        // signUpDate will actually be a Date.now()
        signUpDate: "01/01/2018",
        firstLogin: false,
        profileSetup: false,
        goal: {
            type: 'Travel',
            amount: 1000,
            endDate: "01/01/2020"
        },
        // have a function to calculate the number of weeks between signUpDate and goalEndDate, 
        //divide goalAmount by that to get savingsAmtPerWeek (it would be the result of a function,
        // not a number like below). Change to weekly/monthly/daily?
      
        dailySaveGoal: 50,
        
        fixedExpense: {
            rent: 700,
            transport: 83
        },
        fixedIncome: {
            startDate: "01/01/2018",
            type: "bi-weekly",
            amount: 1000
        },
        // based on the fixed expenses/income, calculate the weekly/monthly disposable income
        dailyDisposable: 100, //calculate it at the beginning, then add/subtract the rollover each day
        variableInputsID: 2,
        // currentFinancialStatus/currentDisposableIncome
        todaysBudget: -25,
        rollover: 0,
        savingsToDate: 40
    },
    3: {
        name: "Bob",
        username: "Bobbob",
        password: "abc123",
        userID: 3,
        signUpDate: "01/01/2018",
        goalType: 'Buy a House',
        goalAmount: 20000,
        goalEndDate: "01/01/2020",
        savingsAmtPerDay: 50,
        fixedExpense: {
            rent: 800,
            loanPayment: 100,
            carPayment: 50
        },
        fixedIncome: {
            startDate: "01/01/2018",
            type: "bi-weekly",
            amount: 2000
        },
        dailyDisposableIncome: 40,
        variableInputsID: 3,
        currentFinancialStatus: 40,
        currentSavedAmount: 1000
    }

}

let variableInputs = {
    2: {
        00001: {
            type: "groceries",
            // based on the types, the amount would be set to positive/negative
            amount: -25,
            date: "01/02/2018"
        },
        00002: {
            type: "gas",
            amount: -80,
            date: "01/03/2018"
        },
        00003: {
            type: "surpriseMoney",
            amount: 40,
            date: "01/03/2018"
        }
    },
    3: {
        00001: {
            type: "groceries",
            // based on the types, the amount would be set to positive/negative
            amount: -25,
            date: "01/02/2018"
        },
        00002: {
            type: "gas",
            amount: -80,
            date: "01/03/2018"
        },
        00003: {
            type: "surpriseMoney",
            amount: 40,
            date: "01/03/2018"
        }
    }

}



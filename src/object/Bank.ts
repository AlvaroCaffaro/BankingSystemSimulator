import { Account } from "./Account";

export class Bank {
    private accounts: Account[] = [];

    constructor(){}

    async calculateCommission(accountNumber: string, startDate: Date, endDate: Date){
        let commission = 0;
        for (let account of this.accounts) {
            if (account.get_number() === accountNumber) {
                const transactionCount = account.transactionCount(startDate, endDate);
                const transactionAmount = await account.transactionAmountInLocalCurrency(startDate, endDate);
                if(typeof transactionAmount == 'string'){
                   return (transactionAmount);
                }

                                                            // commission formula
                commission = (transactionCount === 0)? 0 :(30 - (transactionAmount/transactionCount * (0.05)/100));
                break;
            }
        }
        return commission;
    }

    addAccount(account:Account){
        this.accounts.push(account);
    }

    removeAccount(account:Account){
        for(let i=0; i < this.accounts.length; i++){

              if(this.accounts[i].get_number() === account.get_number()){
                  this.accounts.splice(i,1);
                  break;
              }
        }
  }
}
import {Transaction, Extract,Deposit } from "./Transacion";
import { Currency } from "./Currency";
import { compareDates } from "../utils/CompareDates";

export class Account {
    private number: string;
    private dniHolder: string;
    private transactions: Transaction[] = [];

    constructor({number,dni}:{number: string, dni: string}) {
        this.number = number;
        this.dniHolder = dni;
    }


    public get_number(){
        return this.number;
    }

    public get_dni(){
        return this.dniHolder;
    }

    transactionCount(startDate: Date, endDate: Date): number {
        let count = 0;
        for (let t of this.transactions) {
            if (compareDates(startDate,t.get_date())) {
                if (compareDates(t.get_date(),endDate)) {
                    count++;
                } else {
                    break;
                }
            }
        }
        return count;
    }

    async transactionAmountInLocalCurrency(startDate: Date, endDate: Date) {
        let amount = 0;
        let res:Number|string;
        for (let t of this.transactions) {
            if (compareDates(startDate,t.get_date())) {
                if (compareDates(t.get_date(),endDate)) {
                    
                    res = await t.amountInLocalCurrency();
                    if(typeof res == 'string'){
                        return 'no se puede calcular el monto total';
                    }
                    
                    amount += Number(res);
                } else {
                    break;
                }
            }
        }
        return amount;
    }

    getBalance(currency:Currency):[number,string]{
        let amount:number;
        let code:string;
        let balance = 0;
        
        for(let i = 0; i < this.transactions.length; i++){
            [amount,code] = this.transactions[i].get_amount();
            if(code !== currency.get_code()){
                continue;
            }

            balance+= amount;
        }

        return [balance,currency.get_code()];
    }

    depositMoney(amount: number, currency: Currency): boolean {
        this.transactions.push(new Deposit({date:new Date(), amount:amount, currency: currency}));
        return true;
    }

    extractMoney(amount: number, currency: Currency): boolean {


        const [balance,_] = this.getBalance(currency);
        let sufficientBalance = false;
        if(balance >= amount){
            this.transactions.push(new Extract({date: new Date(), amount, currency}));
            sufficientBalance = true;
        }

        return sufficientBalance;

        
    }

}
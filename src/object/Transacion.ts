import { Currency } from "./Currency";


export interface Transaction{ 
    get_amount():[number,string];// tupples type amount-code
    get_date():Date;
    amountInLocalCurrency():Promise<any>;
}


export class Extract implements Transaction{ 
    
    private currency:Currency;
    private amount: number;
    private date:Date;

    constructor({date,amount,currency}:{date:Date,amount:number,currency:Currency}){ 
        this.date = date;
        this.amount = amount;
        this.currency = currency;
    }

    public get_amount(){
        const amount_code:[number,string] = [-1*this.amount,this.currency.get_code()];
        return(amount_code);
    }
        

    public get_date(){
        return this.date;
    }
    

    
    public async amountInLocalCurrency(){ 
        const res:any = await this.currency.amountInLocalCurrency(Number(this.amount));
        if(typeof res == 'string'){
            return res;
        }
        return (-Number(res));
    }
}


export class Deposit implements Transaction{ 
    
    private currency:Currency;
    private amount: number;
    private date:Date;

    constructor({date,amount,currency}:{date:Date,amount:number,currency:Currency}){ 
        this.date = date;
        this.amount = amount;
        this.currency = currency;
    }

    public get_amount(){
        const amount_code:[number,string] = [this.amount,this.currency.get_code()];
        return(amount_code);
    }
        

    public get_date(){
        return this.date;
    }

    
    public async amountInLocalCurrency(){ 
        const res:any = await this.currency.amountInLocalCurrency(Number(this.amount));
        if(typeof res == 'string'){
            return res;
        }
        return (Number(res));
    }
}


function compareDates(date1: Date, date2: Date): boolean {
    
    if (date1.getFullYear() < date2.getFullYear()) {
        return true;
    }
    if (date1.getFullYear() === date2.getFullYear()) {
        if (date1.getMonth() < date2.getMonth()) {
            return true;
        }
        if (date1.getMonth() === date2.getMonth()) {
            return date1.getDate() <= date2.getDate();
        }
    }
    return false;
}





class Holder{ 
    private dni:number;
    private name:string;
    private lastName:string;


  constructor({dni,name,lastName}:{dni:number,name:string,lastName:string}){
    this.dni = dni;
    this.name = name;
    this.lastName = lastName;
  }

  get_name(){
    return this.name;
  }
  get_dni(){
    return this.dni;
  }
  get_lastName(){
    return this.lastName;
  }
  



}
 

class CurrencyDB{ 
    private baseCurrency:string;
    private targetCurrency = 'ARS';
    private apiKey = 'api_key'; // ESTO DEBERIA ESTAR OCULTO PERO es para que se note que utilizamos una api_key

    constructor({baseCurrency}:{baseCurrency:string}){
        this.baseCurrency = baseCurrency;
    }
    public async consultar_cotizacion_pesos(){ 
        const url = `https://v6.exchangerate-api.com/v6/${this.apiKey}/latest/${this.baseCurrency}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            const rate = data.conversion_rates[this.targetCurrency];
            return(Number(rate));

        } catch (e) {
            return "ha ocurrido un error al obtener las conversiones, intente mas tarde"
        }
}

}

  



class Currency{
    private name:string;
    private code:string;
    private persistence:CurrencyDB;

   constructor(name:string,code:string) { 
        this.name = name;
        this.code = code;
        this.persistence = new CurrencyDB({baseCurrency:this.code});

   }

   public get_name(){
    return(this.name);
   }
   public get_code(){
    return(this.code);
   }

    public async amountInLocalCurrency(monto:number){
        const rate:any = await this.persistence.consultar_cotizacion_pesos();
        if(typeof rate == 'string'){
            return 'No es posible realizar la conversion ahora mismo, intente mas tarde.';
        }
        return(Number(rate)*monto);
    }

}


class Transaction{ 
    
    private currency:Currency;
    private amount: number;
    private date:Date;
    private type:string;

    constructor({date,type,amount,currency}:{date:Date,type:string,amount:number,currency:Currency}){ 
        this.date = date;
        this.type = type;
        this.amount = amount;
        this.currency = currency;
    }

    public get_amount(){
        return(`monto: ${this.amount} ${this.currency.get_code()}`);
    }
        
    public get_type(){
        return this.type;
    }

    public get_date(){
        return this.date;
    }

    
    public async amountInLocalCurrency(){ 
        const res:any = await this.currency.amountInLocalCurrency(Number(this.amount));
        if(typeof res == 'string'){
            return res;
        }
        return ( (this.type === 'deposit')?Number(res): -Number(res) );
    }
}



class Account {
    private number: string;
    private dniHolder: string;
    private transactions: Transaction[] = [];
    private types: string[] = ['deposit', 'extract'];

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

    depositMoney(amount: number, currency: Currency): void {
        this.transactions.push(new Transaction({date:new Date(), type:this.types[0], amount:amount, currency: currency}));
    }

    extractMoney(amount: number, currency: Currency): void {
        this.transactions.push(new Transaction({date: new Date(), type: this.types[1], amount, currency}));
    }

}

class Bank {
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



/// INSTANCIAS DE PRUEBA

// Creación de instancias y prueba de la clase Titular
const titular1 = new Holder({dni:12345678, name:"John", lastName:"Doe"});
console.log("Nombre del titular: ", titular1.get_name());
console.log("DNI del titular: ", titular1.get_dni());
console.log("Apellido del titular: ", titular1.get_lastName());

// creacion de la instancia currencyUSD
const currencyUSD = new Currency("Dolares", "USD");
const currencyARS = new Currency("Peso Argentino", "ARS");

// Creación de instancias y prueba de la clase Account
const account1 = new Account({number:"ACC123", dni:"12345678"});
account1.depositMoney(100, currencyUSD);
account1.extractMoney(50, currencyUSD);
account1.extractMoney(9000, currencyARS);


// creacion de la instancia bank y añadimos la cuenta.
const bank = new Bank();
bank.addAccount(account1);


// prueba de las funcionalidades


async function pruebaAccount(sDate:Date,fDate:Date) {
    try {
        const amount = await account1.transactionAmountInLocalCurrency(sDate,fDate);
        const count = account1.transactionCount(sDate,fDate);
    
        console.log('cantidad de transacciones entre los dias seleccionados: ', count);
        console.log('monto total en pesos de las transacciones entre los dias seleccionados: ', amount);

    } catch (error) {
        console.log('error en la prueba account');
    }
}

const today = new Date();
const start = new Date(2024, 9, 20); 

pruebaAccount(start,today);


async function pruebaBank(account:Account,sDate:Date,fDate:Date) {
    try {
        const commission = await bank.calculateCommission(account.get_number(),sDate, fDate);
        console.log('calculo total de la comision: ',commission) ;   
    } catch (error) {
        console.log('error prueba bank');
    }
};

pruebaBank(account1,start,today);



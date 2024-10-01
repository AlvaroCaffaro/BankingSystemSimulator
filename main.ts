class Holder{ 
    private dni:number;
    private name:string;
    private lastName:string;


  constructor(dni,name,lastName){
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
    private apiKey = 'YOUR_API_KEY'; // ESTO DEBERIA ESTAR OCULTO PERO es para que se note que utilizamos una api_key

    constructor(baseCurrency){
        this.baseCurrency = baseCurrency;
    }
    public consultar_cotizacion_pesos(){ 

        fetch(`https://v6.exchangerate-api.com/v6/${this.apiKey}/latest/${this.baseCurrency}`)
            .then(response => {
                 if (!response.ok) {
                    throw new Error('Error en la respuesta de la API');
            }
            response.json();
        })
        .then(data => {
            const rate = data.conversion_rates[this.targetCurrency];
            return(Number(rate));
        })
        .catch(error => {
            return('hubo un error al obtener las conversiones');
        });
}

}

  



class Currency{
    private name:string;
    private code:string;
    private persistence:CurrencyDB;

   constructor(name:string,code:string) { 
        this.name = name;
        this.code = code;
        this.persistence = new CurrencyDB(this.code);

   }

   public get_name(){
    return(this.name);
   }
   public get_code(){
    return(this.code);
   }

    public amountInLocalCurrency(monto:number){
        const rate:any = this.persistence.consultar_cotizacion_pesos();
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

    constructor(date,type,amount,currency){ 
        this.date = date;
        this.type = type;
        this.amount = amount;
        this.currency = currency;
    }

    public get_amount(){
        return(`monto: ${this.amount} ${this.currency}`);
    }
        
    public get_type(){
        return this.type;
    }

    public get_date(){
        return this.date;
    }

    
    public amountInLocalCurrency(){ 
        const res:any = this.currency.amountInLocalCurrency(Number(this.amount));
        if(typeof res == 'string'){
            return res;
        }
        return Number(res);
    }
}



class Account {
    private number: string;
    private dniHolder: string;
    private transactions: Transaction[] = [];
    types: string[] = ['deposit', 'extract'];

    constructor(number: string, dni: string) {
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
            if (compareDates(t.get_date(), startDate)) {
                if (compareDates(endDate, t.get_date())) {
                    count++;
                } else {
                    break;
                }
            }
        }
        return count;
    }

    transactionAmountInLocalCurrency(startDate: Date, endDate: Date): number|string {
        let amount = 0;
        let res:Number|string;
        for (let t of this.transactions) {
            if (compareDates(t.get_date(), startDate)) {
                if (compareDates(endDate, t.get_date())) {
                    
                    res = t.amountInLocalCurrency();
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
        this.transactions.push(new Transaction(new Date(), this.types[0], amount, currency));
    }

    extractMoney(amount: number, currency: Currency): void {
        this.transactions.push(new Transaction(new Date(), this.types[1], amount, currency));
    }

}

class Bank {
    clients: any[] = [];
    accounts: Account[] = [];

    calculateCommission(accountNumber: string, startDate: Date, endDate: Date): number {
        let commission = 0;
        for (let account of this.accounts) {
            if (account.get_number() === accountNumber) {
                const transactionCount = account.transactionCount(startDate, endDate);
                const transactionAmount = account.transactionAmountInLocalCurrency(startDate, endDate);
                if(typeof transactionAmount == 'string'){
                    throw new Error(transactionAmount);
                }
                commission = 30 - (transactionAmount * 0.5) / transactionCount;
                break;
            }
        }
        return commission;
    }
}

function compareDates(date1: Date, date2: Date): boolean {
    if (date1.getFullYear() > date2.getFullYear()) {
        return true;
    }
    if (date1.getFullYear() === date2.getFullYear()) {
        if (date1.getMonth() > date2.getMonth()) {
            return true;
        }
        if (date1.getMonth() === date2.getMonth()) {
            return date1.getDate() >= date2.getDate();
        }
    }
    return false;
}








/// INSTANCIAS DE PRUEBA

// Creación de instancias y prueba de la clase Titular
const titular1 = new Holder(12345678, "John", "Doe");
console.log("Nombre del titular: ", titular1.get_name());
console.log("DNI del titular: ", titular1.get_dni());
console.log("Apellido del titular: ", titular1.get_lastName());

// Creación de instancias y prueba de la clase Currency y CurrencyDB
const currencyUSD = new Currency("Dollar", "USD");
console.log("Conversión de 100 USD a ARS: ", currencyUSD.amountInLocalCurrency(100));

// Creación de instancias y prueba de la clase Transaction
const transaction1 = new Transaction(new Date(), "deposit", 100, currencyUSD);
console.log("Monto de la transacción: ", transaction1.get_amount());
console.log("Tipo de transacción: ", transaction1.get_type());
console.log("Fecha de la transacción: ", transaction1.get_date());
console.log("Monto en moneda local: ", transaction1.amountInLocalCurrency());

// Creación de instancias y prueba de la clase Account
const account1 = new Account("ACC123", "12345678");
account1.depositMoney(100, currencyUSD);
account1.extractMoney(50, currencyUSD);

console.log("Cantidad de transacciones: ", account1.transactionCount(new Date("2023-01-01"), new Date("2023-12-31")));
console.log("Monto total en moneda local: ", account1.transactionAmountInLocalCurrency(new Date("2023-01-01"), new Date("2023-12-31")));

// Creación de instancias y prueba de la clase Bank
const bank = new Bank();
bank.accounts.push(account1);

const commission = bank.calculateCommission("ACC123", new Date("2023-01-01"), new Date("2023-12-31"));
console.log("Comisión calculada: ", commission);

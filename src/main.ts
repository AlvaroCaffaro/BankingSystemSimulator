import { Currency } from "./object/Currency";
import { Account } from "./object/Account";
import { Bank } from "./object/Bank";  
import { Holder } from "./object/Holder";


async function main() {
    
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
    let success = account1.extractMoney(50, currencyUSD);
    if(!success){
        console.log('saldo insuficiente');
    }
    
    success = account1.extractMoney(9000, currencyARS);
    
    if(!success){
        console.log('saldo insuficiente');
    }


    const [balance,code] = account1.getBalance(currencyUSD);
    console.log(`La cantidad de saldo en ${currencyUSD.get_name()}: ${balance} ${code}`);


    // creacion de la instancia bank y añadimos la cuenta.
    const bank = new Bank();
    bank.addAccount(account1);


    // prueba de las funcionalidades

    
    const today = new Date();
    const start = new Date(2024, 9, 20); 

    try {
        const amount = await account1.transactionAmountInLocalCurrency(start,today);
        const count = account1.transactionCount(start,today);
    
        console.log('cantidad de transacciones entre los dias seleccionados: ', count);
        console.log('monto total en pesos de las transacciones entre los dias seleccionados: ', amount);

    } catch (error) {
        console.log('error en la prueba account');
    }


    try {
        const commission = await bank.calculateCommission(account1.get_number(),start, today);
        console.log('calculo total de la comision: ',commission) ;   
    } catch (error) {
        console.log('error prueba bank');
    }


}

main();



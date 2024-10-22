
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


export class Currency{
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
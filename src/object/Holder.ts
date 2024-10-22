
export class Holder{ 
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
 

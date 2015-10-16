export default {
  recipes: {
    controller:'controller',
    factory:'factory',
    service:'service',
    provider:'provider',
    directive:'directive',
    filter:'filter',
    constant:'constant',
    config:'config'
  },
  getAsArray(){
    return Object.keys(this.recipes).map((recipT)=>{
      return this.recipes[recipT];
    });
  }
};

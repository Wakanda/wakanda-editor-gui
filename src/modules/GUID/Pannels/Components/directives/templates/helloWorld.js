
let componentJson = {
  manifest: {
    name: 'Hello World Directive',
    properties:[],
    methodes: [],
    bowerDependencies : {},
    jsDependencies : [
      "/projects/bower_components/angular/angular.min.js"
    ],
    directiveName : 'helloWorld',
    directiveBody : function() {
      return {
        restrict: 'AE',
        replace: false,//must be always false
        template: '<h2>Hello World!!</h2> <h3 ng-show="!!name">from {{name}}</h3>',
        scope: {
          name: '@'
        }
      };
    },
  },
  template: `<hello-world name="Wakanda"></hello-world>`
}

export default componentJson;

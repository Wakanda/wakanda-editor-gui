
let componentJson = {
  manifest: {
    name: 'Morris Chart Bars',
    properties:[],
    methodes: [],
    bowerDependencies : {
      "angular-morris-chart": "~1.2.0"
    },
    jsDependencies : [
      "/projects/bower_components/angular/angular.min.js",
      "/projects/bower_components/jquery/dist/jquery.js",
      "/projects/bower_components/raphael/raphael.js",
      "/projects/bower_components/morris.js/morris.js",
      "/projects/bower_components/angular-morris-chart/src/angular-morris-chart.min.js"
    ],
    angularApplicationName : "angular.morris-chart",
  },
  template: `<div bar-chart="" bar-data="[
    { y: &quot;2006&quot;, a: 100, b: 90 },
    { y: &quot;2007&quot;, a: 75,  b: 65 },
    { y: &quot;2008&quot;, a: 50,  b: 40 },
    { y: &quot;2009&quot;, a: 75,  b: 65 },
    { y: &quot;2010&quot;, a: 50,  b: 40 },
    { y: &quot;2011&quot;, a: 75,  b: 65 },
    { y: &quot;2012&quot;, a: 100, b: 90 }
]" bar-x="y" bar-y="[&quot;a&quot;, &quot;b&quot;]" bar-labels="[&quot;Series A&quot;, &quot;Series B&quot;]" bar-colors="[&quot;#31C0BE&quot;, &quot;#c7254e&quot;]">
</div>`
}

export default componentJson;

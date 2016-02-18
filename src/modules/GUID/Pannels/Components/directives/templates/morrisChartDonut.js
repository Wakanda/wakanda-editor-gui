
let componentJson = {
  manifest: {
    name: 'Morris Chart Donut',
    properties:[],
    methodes: []
  },
  template: `<div donut-chart="" donut-data="[
  {label: &quot;Download Sales&quot;, value: 12},
  {label: &quot;In-Store Sales&quot;,value: 30},
  {label: &quot;Mail-Order Sales&quot;, value: 20}
]" donut-colors="[&quot;#31C0BE&quot;,&quot;#c7254e&quot;,&quot;#98a0d3&quot;]" donut-formatter="&quot;currency&quot;">
</div>`
}

export default componentJson;


let componentJson = {
  manifest: {
    name: 'Pagination',
    properties:[],
    methodes: []
  },
  template: `<ul class="pagination">
  <li class="disabled">
    <a href="#" aria-label="Previous">
      <span aria-hidden="true">«</span>
    </a>
  </li>
  <li class="active">
    <a href="#">1 <span class="sr-only">(current)</span></a></li>
    <li><a href="#">2</a></li> <li><a href="#">3</a></li>
    <li><a href="#">4</a></li> <li><a href="#">5</a></li>
    <li><a href="#" aria-label="Next"><span aria-hidden="true">»</span></a></li>
  </ul>`
}

export default componentJson;

const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('MyFavoriteMovies'))
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')



//取得在data建立的id，並把id放入函式內
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.btn-show-movie')) {
    console.log(event.target.dataset.id)
    showMovieModal(Number(event.target.dataset.id)) //丟入showMovieModal之function裡面，因event.target.dataset.id型態為string所以加上Number把他INT化
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id)) //丟入removeFromFavorite之function裡面
  }
})

//刪除收藏清單
function removeFromFavorite(id) {
  //if (!movies || !movies.length) return //movies沒有東西就停止以下程式指令
  const movieIndex = movies.findIndex(movie => movie.id === id) //findIndex在找到第一個符合條件的 item 後就會停下來回傳該 item
  //if (movieIndex === -1) return //假如movieindex抓不到資訊，就停止以下指令，回傳空白
  movies.splice(movieIndex, 1) //splice可刪除陣列裡的資訊
  localStorage.setItem('MyFavoriteMovies', JSON.stringify(movies)) //把json化的陣列轉為string型別，回傳回localStorage
  //重新整理頁面，可即時看到目前頁面資訊
  RenderDataPanel(movies)
}


function showMovieModal(id) {
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieImage = document.querySelector('#movie-modal-image')
  const modelDate = document.querySelector('#movie-modal-date')
  const modelDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)
    .then(response => {
      console.log(response.data.results)
      const data = response.data.results
      movieTitle.innerText = data.title
      movieImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
      modelDate.innerText = 'Release date' + data.release_date
      modelDescription.innerText = data.description
    })
}


//建立電影清單
function RenderDataPanel(data) {
  let rawHTML = '' //先設立空字串放入html內容
  data.forEach(item => {
    //要使用+=，一個一個加上去
    rawHTML += ` 
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src = "${POSTER_URL + item.image}"
              class = "card-img-top"
              alt = "movie-poster" >
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button 
              class="btn btn-primary btn-show-movie" 
              data-bs-toggle="modal"
              data-bs-target="#movie-modal" 
              data-id="${item.id}"
              >More</button>
              <button 
              class="btn btn-danger btn-remove-favorite" 
              data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `

    dataPanel.innerHTML = rawHTML //最後完整HTML內容再更新上去
  });
}

RenderDataPanel(movies)
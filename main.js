const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12 //每個頁面只要12個內容

const movies = []

//因搜尋結果需要分頁，做出分頁動作
let filteredMovies = [] //宣告陣列放入符合keyword的字串

//宣告分頁功能
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

//宣告切換顯示模式
const displayMode = document.querySelector('#displayMode')

//宣告共同目前頁面，預設為1
let currentPage = 1





//切換顯示功能，監聽切換按鈕，使用data-model變化作為切換的flag
displayMode.addEventListener('click', function onDisplayModeSwitched(event) {
  if (event.target.matches('.btn-show-card')) {
    dataPanel.dataset.model = 'card-model'
    console.log("change card-model")
    RenderDataPanel(getMoviesByPage(currentPage))
  } else if (event.target.matches('.btn-show-list')) {
    console.log("change list-model")
    dataPanel.dataset.model = 'list-model'
    RenderDataPanel(getMoviesByPage(currentPage))
  }
})


//渲染分頁器頁數
function renderPaginator(amount) {
  //計算總共有幾頁
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作template
  let rawHTML = ''

  //新增data-page來記錄目前為第幾頁
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML

}

//按下分頁器來切換頁面
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return //不是標籤A就停止以下程式
  const page = Number(event.target.dataset.page) //宣告page接收data-page的值
  currentPage = page
  console.log('page:', page)
  console.log('currentPage:', page)
  console.log(getMoviesByPage(page))
  RenderDataPanel(getMoviesByPage(currentPage)) //渲染畫面
})

//產生各個分頁內容，回傳被切割movies陣列內容
function getMoviesByPage(page) {
  //page1: 0-12
  //page2: 12-24 ...
  const data = filteredMovies.length ? filteredMovies : movies //判斷分頁要接受哪個陣列值，假如filteredMovies沒有
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


//監聽按鈕(查看電影資訊或收藏)，取得在data建立的id，並把id放入函式內
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.btn-show-movie')) {
    console.log(event.target.dataset.id)
    showMovieModal(Number(event.target.dataset.id)) //丟入showMovieModal之function裡面，因event.target.dataset.id型態為string所以加上Number把他INT化
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id)) //丟入addToFavorite之function裡面
  }
})

//加入收藏清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('MyFavoriteMovies')) || [] //建立清單，把陣列json化， ||意思為不是要前面就是要後面(看哪一個有)

  const movie = movies.find(movie => movie.id === id) //find的用法return為true的值，find 在找到第一個符合條件的 item 後就會停下來回傳該 item

  //防呆是否有重複加入收藏清單
  if (list.some(movie => movie.id === id)) { //假如這個id在list陣列有跳出此提示
    return alert(`${movie.title} 已經在收藏清單中！`)
  } else {
    list.push(movie) //沒有加入此陣列
  }
  localStorage.setItem('MyFavoriteMovies', JSON.stringify(list)) //把json化的陣列轉為string型別

  // //console.log(id)
}


//搜尋電影名
searchForm.addEventListener('submit', function onSearchSumitted(event) {
  event.preventDefault() //網頁會自動重新載入
  const keyword = searchInput.value.trim().toLowerCase() //讓輸入的關鍵字省略字串前後的空白(trim)，以及統一小寫(toLowerCase)

  if (!keyword.length) {
    alert('please enter a string!')
  }

  //使用filter寫法，把以下條件為真的放入filteredMovies裡面
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  //當filteredMovies沒有任何一個值時就執行以下指令
  if (filteredMovies.length === 0) {
    alert("Can't find out " + keyword)
  }

  renderPaginator(filteredMovies.length) //渲染分頁器頁面
  RenderDataPanel(getMoviesByPage(currentPage)) //先渲染預設分頁第一頁
})


//顯示電影Modal
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
function RenderDataPanel(data) { //盡量變數設data，不要侷限變數名稱
  if (dataPanel.dataset.model === 'card-model') {
    console.log("render card model")
    renderMovieCard(data)
  } else if (dataPanel.dataset.model === 'list-model') {
    console.log("render list model")
    renderMovieList(data)
  }
}

//渲染卡片化
function renderMovieCard(data) {
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
              class="btn btn-info btn-add-favorite" 
              data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `

    dataPanel.innerHTML = rawHTML //最後完整HTML內容再更新上去
  });
}

//渲染表單化
function renderMovieList(data) {
  let rawHTML = `
        <ul class="list-group list-group-flush  w-100">
          <li class="list-group-item"></li>
  `
  data.forEach(item => {
    rawHTML += `
    <li class="list-group-item d-flex justify-content-between text-center ">
      <h5 class="m-0">${item.title}</h5>
      <div class=" col-5">
        <button 
        class="btn btn-primary 
        btn-show-movie" 
        data-bs-toggle="modal" 
        data-bs-target="#movie-modal"
        data-id="${item.id}">
        More
        </button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </div>
    </li>
    `
  })

  rawHTML += `</ul>`

  dataPanel.innerHTML = rawHTML
}

axios
  .get(INDEX_URL)
  .then(response => {
    console.log(response.data.results)
    //將接收到的api陣列資訊放入到movies裡面: 
    //1.迭代器寫法(for ... of) 
    //2.使用展開運算子，語法前面加...(下列是使用這個方法)
    movies.push(...response.data.results)
    renderPaginator(movies.length) //計算要分割幾頁
    RenderDataPanel(getMoviesByPage(1)) //先預設渲染第一頁的畫面

    //console.log(movies)
  })
  .catch((err) => console.log(err))
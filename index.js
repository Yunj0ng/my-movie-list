const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIE_PER_PAGE = 12;
// 宣告變數去存取目前頁面 得以在切換檢視模式以及使用搜尋功能時分頁正常顯示
let currentPage = 1;

const movies = [];
let filteredMovies = [];

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const renderType = document.querySelector("#render-type");

function renderMovieList(data) {
	if (dataPanel.dataset.mode === "card-mode") {
		let rawHTML = "";
		data.forEach((item) => {
			rawHTML += `
	<div class="col-sm-3">
				<div class="mb-2">
					<div class="card">
						<img
							src="${POSTER_URL + item.image}"
							class="card-img-top" alt="Movie Poster" />
						<div class="card-body">
							<h5 class="card-title">${item.title}</h5>
						</div>
						<div class="card-footer">
							<button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
				}">More</button>
							  <i class="fa-regular fa-heart btn-add-favorite fa-xl fa-xl" style="color: #f82d16; cursor: pointer" data-id="${item.id}"></i>
						</div>
					</div>
				</div>
			</div>
	`;
		});
		dataPanel.innerHTML = rawHTML;
	} else if (dataPanel.dataset.mode === "list-mode") {
		let rawHTML = `<ul class="list-group">`;
		data.forEach((item) => {
			rawHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <h5 class="card-title">${item.title}</h5>
          <div>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
						<i class="fa-regular fa-heart  btn-add-favorite fa-xl" style="color: #f82d16; cursor: pointer" data-id="${item.id}"></i>
          </div>
					
        </li>
        `;
		});
		rawHTML += `</ul>`;
		dataPanel.innerHTML = rawHTML;
	}
}

function renderPaginator(amount) {
	const numberOfPage = Math.ceil(amount / MOVIE_PER_PAGE);
	let rawHTML = "";

	for (let page = 1; page <= numberOfPage; page++) {
		rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
	}
	paginator.innerHTML = rawHTML;
}

function getPageOfMovies(page) {
	const data = filteredMovies.length ? filteredMovies : movies;
	const startIndex = (page - 1) * MOVIE_PER_PAGE;
	return data.slice(startIndex, startIndex + MOVIE_PER_PAGE);
}

paginator.addEventListener("click", function onPaginatorClicked(e) {
	if (e.target.tagName !== "A") return;

	// 移除前次點擊的頁碼顯示
	const actived = document.querySelector('.pagination .active')
	if(actived) {
		actived.classList.remove('active')
	}
// 顯示當前頁碼
	if (e.target.matches('.page-link')) {
		e.target.parentElement.classList.add('active')
	}

	const page = Number(e.target.dataset.page);
	currentPage = page;
	renderMovieList(getPageOfMovies(page));
	
});

searchForm.addEventListener("submit", function seachSubmitted(e) {
	e.preventDefault();
	let keyword = searchInput.value.trim().toLowerCase();

	filteredMovies = movies.filter((movie) =>
		movie.title.toLowerCase().includes(keyword)
	);

	if (filteredMovies.length === 0) {
		return alert(`您輸入的關鍵字： ${keyword} 沒有符合條件的電影`);
	}
	currentPage = 1;
	renderPaginator(filteredMovies.length);
	renderMovieList(getPageOfMovies(currentPage));
});

document.addEventListener("keyup", (e) => {
	if (e.key === "Enter") {
		seachSubmitted(e)
	}
});

function showMovieModal(id) {
	const movieTitle = document.querySelector("#movie-modal-title");
	const movieReaseDate = document.querySelector("#movie-modal-date");
	const movieDescription = document.querySelector("#movie-modal-description");
	const movieImage = document.querySelector("#movie-modal-image");

	//   防止殘影
	movieTitle.textContent = "";
	movieReaseDate.innerText = "";
	movieDescription.textContent = "";
	movieImage.innerHTML = "";

	axios.get(INDEX_URL + id).then((response) => {
		const data = response.data.results;
		movieTitle.textContent = data.title;
		movieReaseDate.innerText = "Release date:" + data.release_date;
		movieDescription.textContent = data.description;
		movieImage.innerHTML = `<img
		src="${POSTER_URL + data.image}"
		alt="movie-poster" class="img-fluid" />`;
	});
}

function addToFavorite(id) {
	const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
	const movie = movies.find((movie) => movie.id === id);
	if (list.some((movie) => movie.id === id)) {
		return alert("已經存在於收藏清單");
	}
	list.push(movie);
	localStorage.setItem("favoriteMovies", JSON.stringify(list));
}



// 依data-mode切換檢視模式
function changeDisplayMode(displayMode) {
	//   如果當前模式等於呼叫參數的模式(data-mode屬性值相同) 則不執行動作
	if (dataPanel.dataset.mode === displayMode) return;
	//   如果不相等 則執行切換模式((data-mode屬性值切換))
	dataPanel.dataset.mode = displayMode;
}

// 設監聽器在圖示上
renderType.addEventListener("click", function onClicked(e) {
	//   當點擊圖示 呼叫changeDisplayMode判斷是否切換檢視模式 並顯示當前頁面的資料
	if (e.target.matches("#show-list")) {
		changeDisplayMode("list-mode");
		//     屬性值變更後 renderMovieList函式中的dataPanel.dataset.mode就會讀取到該屬性值，並根據該值判斷要渲染列表還是卡片的資料
		renderMovieList(getPageOfMovies(currentPage));
	} else if (e.target.matches("#show-card")) {
		changeDisplayMode("card-mode");
		renderMovieList(getPageOfMovies(currentPage));
	}
});


dataPanel.addEventListener("click", function onModalClicked(e) {
	if (e.target.matches(".btn-show-movie")) {
		showMovieModal(Number(e.target.dataset.id));
	} else if (e.target.matches(".btn-add-favorite")) {
		//     將空心愛心變成實心
		e.target.classList.replace('fa-regular', 'fa-solid');
		addToFavorite(Number(e.target.dataset.id));
	}
});



axios
	.get(INDEX_URL)
	.then((response) => {
		movies.push(...response.data.results);
		renderPaginator(movies.length);
		renderMovieList(getPageOfMovies(currentPage));
	})
	.catch((err) => console.log(err));

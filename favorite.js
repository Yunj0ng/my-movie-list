const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const IMAGE_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')

function renderFavoriteMovies(data) {
  let itemIndex = ''
	data.forEach(item => {
		itemIndex +=`
		<div class="col-sm-3">
			<div class="mb-2">
				<div class="card">
					<img src="${IMAGE_URL + item.image}" class="card-img-top" alt="Movie Poster">
					<div class="card-body">
						<h5 class="card-title">${item.title}</h5>
					</div>
					<div class="card-footer text-muted">
						<button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
						<button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
						
					</div>
				</div>
			</div>
		</div>
	`
	});
	dataPanel.innerHTML = itemIndex
}


function showMovie(id) {
	const movieTitle = document.querySelector('#movie-modal-title')
	const movieImage = document.querySelector('#movie-modal-image')
	const movieReleaseDate = document.querySelector('#movie-modal-date')
	const moviedescription = document.querySelector('#movie-modal-description')

	axios.get(INDEX_URL + id).then(response => {
		const data = response.data.results
		movieTitle.innerText = data.title
		movieImage.innerHTML = `<img src="${IMAGE_URL + data.image}" alt="movie-poster" class="img-fluid">>`
		movieReleaseDate.innerText = 'Release date: ' + data.release_date
		moviedescription.innerText = data.description

	})
}

function removeFromFavorite(id) {
	if (!movies || !movies.length) return

  const movieIndex = movies.findIndex((movie) => movie.id === id)
	if(movieIndex === -1) return

	movies.splice(movieIndex, 1)
	localStorage.setItem('favoriteMovies', JSON.stringify(movies))
	renderFavoriteMovies(movies)
}

dataPanel.addEventListener('click', function onPanelClicked(e) {
	if (e.target.matches('.btn-show-movie')) {
		showMovie(Number(e.target.dataset.id))
	} else if (e.target.matches('.btn-remove-favorite')) {
		removeFromFavorite(Number(e.target.dataset.id))
	}
})

renderFavoriteMovies(movies)
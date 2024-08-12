
$(document).ready(function () {
    const apikey = '6576219c';
    let currentPage = 1;
    const moviesPerPage = 10;

    $('#form').on('submit', function (event) {
        event.preventDefault();

        const title = $('input[name="title"]').val(); // Получаем название фильма
        const type = $('select[name="movie"]').val(); // Получаем тип (movie, series, episode)
        console.log('Title:', title);
        console.log('Type:', type);
        getMovies(title, type, currentPage).then(data => {
            showMovies(data);
            showPages(data.totalResults);

        }).catch(showError);
    });


    function getMovies(title, type, page) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `https://www.omdbapi.com/?apikey=${apikey}&s=${title}&type=${type}&page=${page}`,
                method: 'GET',
                success: function (response) {
                    if (response.Response === "True") {
                        console.log("Total Results:", response.totalResults);
                        resolve({ movies: response.Search, totalResults: parseInt(response.totalResults) });
                        console.log(response);
                    }
                    else {
                        reject('Movie not found!');
                    }
                },
                error: function () {
                    reject("Error!")
                }
            });
        });
    }
    // function showMovies(movies, totalResults) {
    function showMovies(data) {
        const resultDiv = $('#results');
        resultDiv.empty(); // Очищаем предыдущие результаты
        const movies = data.movies; // Извлекаем массив фильмов
        const totalResults = data.totalResults; // Общее количество результатов
        movies.forEach(movie => {
            const poster = movie.Poster !== "N/A" ? `<img src="${movie.Poster}" alt="${movie.Title} Poster" style="max-width: 150px;">` : '';

            let item = $(`
                <div class='item'>
                <div class="poster">${poster}</div>
                <div class="details">
                <div class="type">${movie.Type}</div></br>
                    <div class="title">${movie.Title} </br>(${movie.Year})</div>
                    <button class="detailButton" data-id="${movie.imdbID}">Details</button>
                </div></div>
            `);
            resultDiv.append(item); // Добавляем фильм на страницу

        });
        showPages(totalResults);
    }
    function showError(mes) {
        const resultDiv = $('#results');
        resultDiv.empty();
        resultDiv.append(`<div>${mes}</div>`);
    }
    //получаем детали по кнопке и ID фильма
    $(document).on('click', '.detailButton', function () {
        const movieId = $(this).data('id');

        $.ajax({
            url: `https://www.omdbapi.com/?apikey=${apikey}&i=${movieId}`,
            method: 'GET',
            success: function (response) {
                if (response.Response === "True") {
                    showDetails(response);
                } else {
                    showError('Movie not found!');
                }
            },
            error: function () {
                showError('Error fetching movie details!');
            }
        });
    });

    function showPages(totalResults) {  //добавляем тут кнопки для пагинации
        const pagesDiv = $('#pagination');
        pagesDiv.empty();
        const totalPages = Math.ceil(totalResults / moviesPerPage);//рассчитать кол-во страниц с округлением вперед
        for (let i = 1; i <= totalPages; i++) {
            const butt = $(`<button class="pageButt">${i}</button>`);
            if (i === currentPage) {
                butt.css('color', 'grey');
            }
            butt.on('click', function () {
                currentPage = i;
                const title = $('input[name="title"]').val();
                const type = $('select[name="movie"]').val();
                getMovies(title, type, currentPage).then(data => { showMovies(data); showPages(data.totalResults); }).catch(showError);//если хапрос успешен, то отображаем название и тд           
            });
            pagesDiv.append(butt);
        }

    }
    function showDetails(movie) {
        const detailDiv = $('#movie-details');
        detailDiv.empty();
        const poster = movie.Poster !== "N/A" ? `<img src="${movie.Poster}" alt="${movie.Title} Poster" style="max-width: 200px;">` : '';

        detailDiv.append(`
        <div id="poster"> ${poster}</div>
        <p><strong>Title: </strong>${movie.Title}</p>
      <p><strong>Released: </strong>(${movie.Year})</p>
      <p><strong>Genre: </strong>${movie.Genre}</p>
        <p><strong>Country: </strong>${movie.Country}</p>
        <p><strong>Director: </strong>${movie.Director}</p>
        <p><strong>Writer: </strong>${movie.Writer}</p>
        <p><strong>Actors: </strong>${movie.Actors}</p>
        <p><strong>Awards: </strong>${movie.Awards}</p>

        `);

    }
});


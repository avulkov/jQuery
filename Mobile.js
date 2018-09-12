    function solve() {
    const BASE_URL = 'https://baas.kinvey.com/'
    const APP_KEY = 'kid_rk6Hz2pHQ'
    const APP_SECRET = 'f2e7816f18ad4875ae595a4b6a388c85'
    const AUTH_HEADERS = {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)}


    showView('main')


    $('#loginBtn').on('click', function (e) {
        e.preventDefault()
        showView('login')
        $('#logUser').on('click', function (e) {
            e.preventDefault()
            loginUser()
            loadListings()
        })

    })
    $('#registerBtn').on('click', function (e) {
        e.preventDefault()
        showView('register')

        $('#regUser').on('click', function (e) {
            e.preventDefault()
            registerUser()
            $('.no-cars').hide()
            loadListings()
        })
    })
    $('#profile>[href]').on('click',function (e) {
        e.preventDefault()
        logoutUser()
    })

   $('#listAll').on('click',function (e) {
       e.preventDefault()
       showView('car-listings')
       manageNavBar()
       $('.no-cars').hide()
       $('#listings').empty()
       loadListings()
   })
    $('#myListing').on('click',function (e) {
        e.preventDefault()
        showView('my')
        manageNavBar()
        $('.no-cars').hide()
        $('.car-listings').empty()
        $.ajax({
            method: "GET",
            url: BASE_URL + 'appdata/' + APP_KEY + '/cars?query={"seller":"'+ sessionStorage.getItem('username') +'"}&sort={"kmd.ect": -1}',
            headers: { Authorization: 'Kinvey ' + sessionStorage.getItem('authToken') }
        }).then(function (res) {
            for (let item of res) {
               let newListing=$(`<div class="my-listing">
                    <p id="listing-title">${item.title}</p>
                    <img src="${item.imageUrl}">

                    <div class="listing-props">
                        <h2>Brand: ${item.brand}</h2>
                        <h3>Model: ${item.model}</h3>
                        <h3>Year: ${item.year}</h3>
                        <h3>Price: ${item.price}$</h3>
                    </div>
                    <div class="my-listing-buttons">
                        <a href="#" class="my-button-list">Details</a>
                        <a href="#" class="my-button-list">Edit</a>
                        <a href="#" class="my-button-list">Delete</a>
                    </div>
                </div>`)
                $('.car-listings').append(newListing)
            }
        })

    })
    $('#createListing').on('click',function (e) {
        e.preventDefault()
        showView('create-listing')
        manageNavBar()
    })
    $('#regMyList').on('click',function (e) {
        e.preventDefault()
        createListing()

    })
    function createListing() {
        let title=$('input[name=title]').val()
        let description=$('input[name=description]').val()
        let brand=$('input[name=brand]').val()
        let model=$('input[name=model]').val()
        let imageUrl=$('input[name=imageUrl]').val()
        let fuel=$('input[name=fuelType]').val()
        let price=$('input[name=price]').val()
        let year=$('input[name=year]').val()
        let seller=sessionStorage.getItem('username')
        if(title.length<34&&description.length>=30&&description.length<=450&&brand.length<12&&fuel.length<12&&model.length<12&&model.length>3&&year.length===4&&price<=1000000&&imageUrl.startsWith('http')){
            $.ajax({
                method: "POST",
                url: BASE_URL + 'appdata/' + APP_KEY + '/cars',
                headers: { Authorization: 'Kinvey ' + sessionStorage.getItem('authToken') },
                data: { title, imageUrl, description, year,price,fuel,model,seller,brand }
            }).then(function (res) {
                resetInputs()
                loadListings()
                showView('car-listings')

            }).then(function (err) {
                console.log(err)
            })
        }

    }
    
    function manageNavBar() {
        if (sessionStorage.getItem('authToken')) {
            let username = sessionStorage.getItem('username')
            $('#container>nav>a').show()
            $('#profile>a').text(`Wellcome ${username}`)
            $('#profile>[href]').text('logout')
            $('#profile').show()
        }
    }

    function showView(view) {

        $('#container > div').hide()
        $('#container>nav>a').hide()
        $('#profile').hide()
        $('.active').show()
        $('#' + view).show()

    }

    function resetInputs() {
        $('.container input[name=username],.container input[name=password],.container input[name=repeatPass]').val('')
    }

    function registerUser() {

        let username = $("#register input[name=username]").val();
        let password = $("#register input[name=password]").val();
        let password_repeat = $("#register [name=repeatPass]").val();

        let regexUser = /^([A-Za-z]+){3}$/
        let regexPass = /^([A-Za-z0-9]+){6}$/
        if (username.match(regexUser) && password.match(regexPass) && password === password_repeat) {
            $.ajax({
                method: "POST",
                url: BASE_URL + "user/" + APP_KEY + "/",
                headers: AUTH_HEADERS,
                data: {username, password}
            }).then((res) => {
                resetInputs()

                sessionStorage.setItem('authToken', res._kmd.authtoken);
                sessionStorage.setItem('userId', res._acl.creator);
                sessionStorage.setItem('username', res.username);
                showView('car-listings')
                manageNavBar()
                showInfo('User registration successful.')


            }).catch((err) => {

            })
        }

        console.log(username, password, password_repeat)
    }

    function loginUser() {
        let username = $("#login input[name=username]").val();
        let password = $("#login input[name=password]").val();


        $.ajax({
            method: "POST",
            url: BASE_URL + "user/" + APP_KEY + "/login",
            headers: AUTH_HEADERS,
            data: {username, password}
        }).then((res) => {
            resetInputs()

            sessionStorage.setItem('authToken', res._kmd.authtoken);
            sessionStorage.setItem('userId', res._acl.creator);
            sessionStorage.setItem('username', res.username);
            showView('car-listings')
            manageNavBar()
            showInfo('Login successful.')
            $('#listings >p').hide()

        }).catch((err) => {

        })


    }

    function logoutUser() {
        resetInputs()
        sessionStorage.clear();
        manageNavBar();
        manageStartingPage();
        showInfo('Logout successful.');
    }
    function manageStartingPage() {

        if (sessionStorage.getItem('authToken')) {
            showView('car-listings')
        } else {
            showView("main");
        }
    }
    function showInfo(message) {

        let infoBox = $('#infoBox')
        infoBox.text(message)
        infoBox.show()
        setTimeout(function () {
            $('#infoBox').fadeOut()
        }, 3000)
    }
    function loadListings() {
        $.ajax({
            method:'GET',
            url: BASE_URL + 'appdata/' + APP_KEY + '/cars',
            headers: { Authorization: 'Kinvey ' + sessionStorage.getItem('authToken') }
        }).then(function (res) {
            for (let item of res) {
                let newListing=`
                   <div class="listing">
                    <p>${item.title}</p>
                    <img src="${item.imageUrl}">
                    <h2>Brand: ${item.brand}</h2>
                    <div class="info">
                        <div id="data-info">
                            <h3>Seller: ${item.seller}</h3>
                            <h3>Fuel: ${item.fuel}</h3>
                            <h3>Year: ${item.year}</h3>
                            <h3>Price: ${item.price} $</h3>
                        </div>
                        <div id="data-buttons">
                            <ul>
                                <li class="action">
                                    <a href="#" class="button-carDetails" id="detailsBtn">Details</a>
                                </li>
                                <li class="action">
                                    <a href="#" class="button-carDetails" id="editBtn">edit</a>
                                </li>
                                <li class="action">
                                    <a href="#" class="button-carDetails" id="deleteBtn">delete</a>
                                </li>

                            </ul>
                        </div>
                    </div>

                </div>`


                $('#listings').append(newListing)
                
            }
        }).catch(function (err) {
            
        })
    }
}
solve()

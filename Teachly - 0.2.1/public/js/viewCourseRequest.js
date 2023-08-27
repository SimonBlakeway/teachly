sendAcceptBooking = async function () {
    res = await axios({
        method: 'post',
        url: '/learn/book-lesson',
        data: body,
        headers: {
            'Content-Type': 'application/json',
        },
    })
}
sendRejectBooking = async function () {
    res = await axios({
        method: 'post',
        url: '/learn/book-lesson',
        data: body,
        headers: {
            'Content-Type': 'application/json',
        },
    })
}
toggleReviewsPopup = function () {
    document.getElementById("review-popup").classList.toggle("display-nonei")
}
gotoProfile = function () {
    hostname = location.hostname
    window.location.href = `${hostname}/user/${studentId}`;

}
window.addEventListener('load', function () {

    async function getAndGenerateReviews(viewArr) {
        try {
            res = await axios({
                method: 'post',
                url: `/get/user-reviews/${studentId}`,
                data: {},
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (res.data.length == 0) { return }



            for (let index = 0; index < viewArr.length; index++) {
                const element = viewArr[index];



            }

        } catch (error) {
            console.log(error)

        }
    }
    getAndGenerateReviews()


    document.getElementById("goto-profile").addEventListener("click", e => {
        gotoProfile()
    })
    document.getElementById("toggle-review-popup").addEventListener("click", e => {
        toggleReviewsPopup()
    })
    document.getElementById("accept-button").addEventListener("click", e => {
        // sendAcceptBooking
    })
    document.getElementById("reject-button").addEventListener("click", e => {
        // sendRejectBooking()
    })
    window.addEventListener("click", e => {
        document.getElementById("review-popup").classList.add("display-nonei")
    });
})


function setup() {

    box = document.createElement("div")

    for (let i = 0; i < rating-1; i++) {
        li = document.createElement("li")
        li.className = "fas fa-star fa-xs"
        box.append(li)
    }
    if (rating - Math.floor(rating) > 0.4) {
        li = document.createElement("li")
        li.className = "fas fa-star-half-alt fa-xs"
        box.append(li)
    }
    else {
        li = document.createElement("li")
        li.className = "fa fa-star-o fa-xs"
        box.append(li)
    }
    for (let i = Math.ceil(rating); i < 5; i++) {
        li = document.createElement("li")
        li.className = "icon-star-empty"
        box.append(li)
    }
    document.getElementById("user-rating").innerHTML = box.innerHTML


}

setup()
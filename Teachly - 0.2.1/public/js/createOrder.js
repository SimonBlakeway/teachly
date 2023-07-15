

async function payWithPaypal() {
    res = await axios({
        method: 'post',
        url: '/paypal',
        data: {
            'courseId': courseId,
            'grant_type': date
        },
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
async function payWithStripe() {
    res = await axios({
        method: 'post',
        url: '/paypal',
        data: {
            'courseId': courseId,
            'grant_type': date
        },
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
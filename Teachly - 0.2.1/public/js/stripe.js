async function checkout(obj) {
    body = obj
    try {
        res = await axios.post('/gateway/stripe/create-checkout-session', body,
            {
                headers: {
                    'content-type': 'application/json'
                }
            });
            //redirect is handled server side

    } catch (err) {
        console.log(err)
    }
}

/**
 *  body {
 *    "price": 40   
 *   
 * }
 * 
 * 
 * 
 */

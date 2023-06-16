const origin = window.location.origin;
const socket = io.connect(origin);




refresh = () => axios({ method: 'get', url: `/auth/refresh-token` })
now = () => Math.floor(Date.now() / 1000)
interval = 0
lastRefresh = 0
if (needRefresh) refresh(); lastRefresh = now();

window.addEventListener('online', function (event) {


    if ((now() - lastRefresh) > 60 * 10) {
        refresh()
        lastRefresh = now()
    }




    setRefreshInterval = () => {
        interval = setInterval(() => {
            refresh()
            lastRefresh = now()
        }, (1000 * 60 * 10))
    }

    setTimeout(() => { setRefreshInterval(), (now() - lastRefresh) * 1000 })
});
window.addEventListener('offline', function (event) {
    clearInterval(interval)

});


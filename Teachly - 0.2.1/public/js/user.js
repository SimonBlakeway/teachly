refresh = () => axios({ method: 'post', url: `/auth/refresh-token` })
now = () => Math.floor(Date.now() / 1000)
var refreshInterval = 0;
setRefreshInterval = () => {
    refreshInterval = setInterval(() => {
        console.log("refresh!")
        refresh()
        lastRefresh = now()
    }, (1000 * 60 * 10))
}
console.log(lastRefresh)

if ((now() - lastRefresh) > 60 * 10) {
    refresh();
    lastRefresh = now();
} //10 minutes ago

//setTimeout(() => { setInterval(), (now() - lastRefresh) * 1000 })
window.addEventListener('online', function (event) {
    if ((now() - lastRefresh) > 60 * 10) refresh(); lastRefresh = now();
    setRefreshInterval()
});
window.addEventListener('offline', function (event) {
    clearInterval(refreshInterval)

});


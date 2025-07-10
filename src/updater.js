async function checkForUpdates() {
    // just for testing, 50/50 chance for promise resolve / reject
    return await new Promise((s, j)=>setTimeout(()=>{
        if(Math.random() > 0.5){
            s()
        } else {
            j();
        }
    }, 5e3))
}

module.exports = { checkForUpdates }
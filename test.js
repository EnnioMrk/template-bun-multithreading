eval(`(()=> {
        return new Promise((resolve, reject) =>
            fetch('https://catfact.ninja/fact')
                .then((response) => response.json())
                .then(resolve)
                .catch(reject)
        )    
})()
    `).then(console.log);

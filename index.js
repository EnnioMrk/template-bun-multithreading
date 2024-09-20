import Boss from './boss.js';
import fs from 'fs';

console.log('Available Cors: ', navigator.hardwareConcurrency);

const boss = new Boss(32);
boss.createSwarm(1);
const task = () => {
    return new Promise((resolve, reject) =>
        fetch(`https://jsonplaceholder.typicode.com/photos/${i}`)
            .then((response) => {
                try {
                    return response.json();
                } catch (e) {
                    reject(e);
                }
            })
            .then((res) => {
                resolve(res);
            })
            .catch(reject)
    );
};

boss.assignTask(task, {
    repeat: 5000,
    globalArgs: { i: { v: 0, f: (i) => i++ } },
}).then((res) => {
    console.log('All tasks resolved');
    fs.writeFileSync('catfacts.json', JSON.stringify(res));
});

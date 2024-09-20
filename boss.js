import Manager from './manager.js';

function chunkify(a, n, balanced) {
    if (n < 2) return [[0, a.length]];

    var len = a.length,
        out = [],
        i = 0,
        size;

    if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
            out.push([i, (i += size)]);
        }
    } else if (balanced) {
        while (i < len) {
            size = Math.ceil((len - i) / n--);
            out.push([i, (i += size)]);
        }
    } else {
        n--;
        size = Math.floor(len / n);
        if (len % size === 0) size--;
        while (i < size * n) {
            out.push([i, (i += size)]);
        }
        out.push([size * n, len]);
    }

    return out;
}

export default class Boss {
    constructor(availableThreads) {
        this.availableThreads = availableThreads;
        this.managers = [];
        this.workers = [];
        console.log('New Boss initialized');
    }

    createSwarm(managers_amt) {
        //create workers
        for (let i = 0; i < this.availableThreads; i++) {
            this.workers.push({
                w: new Worker('./worker.js'),
                name: i + 1,
            });
        }
        this.workers.forEach((worker) => {
            worker.w.postMessage({ type: 'init', data: worker.name });
        });
        this.workers = this.workers.map((worker) => worker.w);
        for (let i = 0; i < managers_amt; i++) {
            this.managers.push({
                m: new Manager(
                    this.workers.slice(
                        ...chunkify(this.workers, managers_amt, true)[i]
                    ),
                    i + 1
                ),
                status: 1,
            });
        }
        console.log(`New Swarm created: ${this.managers.length} managers`);
        return this.managers.length;
    }

    assignTask(task, options) {
        if (!task) {
            return Promise.reject('No task provided.');
        }
        if (this.managers.length == 0) {
            return Promise.reject('No Swarm created yet.');
        }
        console.log(this.managers.find((m) => m.status == 1));
        let taskManager = this.managers.find((m) => m.status == 1).m;
        if (!taskManager) {
            return Promise.reject('No available managers.');
        }
        if (options.repeat) {
            return new Promise((resolve, reject) => {
                taskManager
                    .assignTask(task, options)
                    .then(resolve)
                    .catch(reject);
            });
        }
    }
}

export default class Manager {
    constructor(workers, name) {
        this.workers = workers;
        //console.log(`Manager ${name} initialized`);
    }

    assignTask(task, options) {
        console.log('Task assigned');
        console.log(`Available workers: ${this.workers.length}`);
        return new Promise((resolve, reject) => {
            if (!options.repeat) options.repeat = 1;
            let data = [];
            let resolvedTasks = 0;
            let rejectedTasks = 0;
            for (let i = 0; i < options.repeat; i++) {
                let worker = this.workers[i % this.workers.length];
                worker.onmessage = (event) => {
                    if (event.data.type === 'taskResult') {
                        if (event.data.data.e) {
                            rejectedTasks++;
                            console.log(
                                `Task ${rejectedTasks} completed with error`
                            );
                            reject(event.data.data.e);
                        } else {
                            resolvedTasks++;
                            console.log(
                                `Task ${resolvedTasks} completed in ${event.data.data.t}ms`
                            );
                            data.push(event.data.data.r);
                            if (resolvedTasks == options.repeat) {
                                resolve(data);
                            }
                        }
                    }
                };
                worker.postMessage({
                    type: 'task',
                    data: task.toString().trim(),
                    args: { ...options.globalArgs },
                });
                Object.keys(options.globalArgs).forEach((key) => {
                    options.globalArgs[key].v = options.globalArgs[key].f(
                        options.globalArgs[key].v
                    );
                });
            }
        });
    }
}

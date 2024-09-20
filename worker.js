let runningTasks = 0;
let completedTasks = 0;
let name;

const eventMap = new Map([
    [
        'hello',
        function (event) {
            console.log(event.data);
            postMessage('world');
        },
    ],
    [
        'init',
        function (event) {
            name = event.data;
            //console.log(`Worker ${event.data} initialized`);
        },
    ],
    [
        'task',
        function (event) {
            //console.log(`Worker ${name} received task nr. ${runningTasks + 1}`);
            runningTasks++;
            let s = performance.now();
            try {
                console.log();
                eval(
                    `${Object.keys(event.args)
                        .map((key) => `let ${key}=${event.args[key]}; `)
                        .join('')}(${event.data})()`
                )
                    .then((res) => {
                        runningTasks--;
                        completedTasks++;
                        return postMessage({
                            type: 'taskResult',
                            data: { t: performance.now() - s, r: res },
                        });
                    })
                    .catch((err) => {
                        runningTasks--;
                        completedTasks++;
                        console.log(
                            `Worker ${name} completed task nr. ${completedTasks} with error`
                        );
                        return postMessage({
                            type: 'taskResult',
                            data: { t: performance.now() - s, e: err },
                        });
                    });
            } catch (error) {
                postMessage({
                    type: 'taskResult',
                    data: { t: performance.now() - s, e: error },
                });
            }
        },
    ],
    [
        'terminate',
        function () {
            console.log('Worker terminating');
            self.close(); // Terminate the worker
        },
    ],
]);

self.onmessage = (event) => {
    const handler = eventMap.get(event.data.type);
    if (handler) {
        return handler(event.data);
    }
};

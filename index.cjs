
const express = require('express');
const app = express();
const port = 3000;

const swaggerUI = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

let tasks = [
        {
            id: 1,
            title: "study",
            done: false,
        },
        {
            id: 2,
            title: "work on project",
            done: true,
        },
        {
            id: 3,
            title: "code",
            done: false,
        }
]

// STAGE 1

app.get('/', (req, res) => {
    res.status(200).send({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});

app.get('/health', (req, res) => {
    res.status(200).send({
        status: "ok"
    });
});

// STAGE 2

// app.get('/tasks', (req, res) => {
//     res.status(200).send(tasks);   // Commented for documentation
// });

// Extra feature

app.get('/tasks', (req, res) => {    
    const title = req.query.title?.trim().toLowerCase();
    const done = req.query.done?.trim().toLowerCase();

    let result = tasks;

    if (title) {
        result = result.filter(task => { 
            if (task.title.toLowerCase().includes(title)) {
                return task;
            }
        });
    }

    if (done) {
        result = result.filter(task => { 
            if (String(task.done) === done) {
                return task;
            }
        });
    }

    res.status(200).send(result);
});

app.get('/tasks/:id', (req, res) => {

    const task = tasks.find(task => task.id === Number(req.params.id));
    
    if (!task) {
        return res.status(404).send({
            error: `Task ${req.params.id} not found`
        });
    }

    res.status(200).send(task);
});

// STAGE 3

app.post('/tasks', (req, res) => {
    const title = req.body.title?.trim();

    if (!title) {
        return res.status(400).send({
            error: "Title should not be empty"
        });
    }
    const newTask = {
        id: tasks.length + 1,
        title: title,
        done: false
    }

    tasks.push(newTask);
    
    res.status(201).send(newTask);
});

// STAGE 4

app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!tasks.find(task => task.id === id)) {
        return res.status(404).send();
    }

    if (Object.keys(req.body).length === 0) {
        return res.status(400).send();
    }
    
    const newTitle = req.body.title?.trim() ?? "";
    const done = req.body.done;
    
    tasks = tasks.map(prev => {
        if (prev.id === id) {
            return ({
                ...prev,
                title: newTitle ? newTitle : prev.title,
                    done: done ?? prev.done
            });
        }
        return prev;
    });

    const updatedTask = tasks.find(task => task.id === id)

    res.status(200).send(updatedTask);
})

app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!tasks.find(task => task.id === id)) {
        return res.status(404).send();
    }

    tasks = tasks.filter(task => task.id !== id);

    res.status(204).send();
})

app.listen(port, () => {
    console.log(`App is listening to ${port}`);
});
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
const rawdata = fs.readFileSync(path.resolve(__dirname, 'data.json'));
let homePage = fs.readFileSync(path.resolve(__dirname, 'index.html'));
const parsedData = JSON.parse(rawdata.toString());
let formData;

homePage = homePage.toString().replaceAll('${port}', port);

function getEducationsByVariant(data, variant) {
    const result = data.filter((_, index) => index % 2 === variant % 2);
    if (result.length < 6) {
        return [...result, ...data.slice(0, 6)];
    }

    return result;
}

function getProfessionByVariant(data, variant) {
    const parity = variant % 10;
    const result = data.filter(item => item.id % parity === 0);
    if (result.length < 6) {
        return [...result, ...data.slice(0, 6)];
    }

    return result;
}

function getProfessionCityByVariant(data, variant, city) {
    const parity = variant % 10;
    let result = data.filter(item => item.id % parity === 0 && item.city.toLowerCase() === city.toLowerCase());

    if (result.length < 6) {
        return [...result, ...data.slice(0, 6)];
    }

    return result;
}

function getJobNameByVariant(data, variant) {
    const parity = variant % 10;
    const odd = variant % 2;
    const result = data.filter(item => item.id < variant || item.id % parity === odd);
    if (result.length < 6) {
        return [...result, ...data.slice(0, 6)];
    }

    return result;
}

function intParam(params, paramName) {
    let variant = null;
    if (params.hasOwnProperty(paramName)) {
        variant = parseInt(params[paramName], 10);
        variant = isNaN(variant) ? null : variant;
    }

    return variant;
}

function stringParam(params, paramName) {
    let variant = null;
    if (params.hasOwnProperty(paramName)) {
        variant = params[paramName];
        if (typeof variant !== 'string') {
            return null;
        }
    }

    return variant;
}

app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/', (req, res) => {
    res.send(homePage);
});

app.get('/education-type/:variant', (req, res) => {
    const variant = intParam(req.params, 'variant');
    if (!variant) {
        res.status(400);
        res.send({
            message: `Required parameter variant is missing or incorrectly configured`,
            code: 400,
        });

        return;
    }

    res.send(getEducationsByVariant(parsedData['education_type'], variant));
});

app.get('/professions/:variant', (req, res) => {
    const variant = intParam(req.params, 'variant');
    if (!variant) {
        res.status(400);
        res.send({
            message: `Required parameter variant is missing or incorrectly configured`,
            code: 400,
        });

        return;
    }

    res.send(getProfessionByVariant(parsedData['profession'], req.params.variant));
});

app.get('/professions/:variant/city/:city', (req, res) => {
    const variant = intParam(req.params, 'variant');
    const city = stringParam(req.params, 'city');
    console.log({variant, city});

    if (!variant || !city) {
        const param = !variant && 'variant' || 'city';
        res.status(400);
        res.send({
            message: `Required parameter ${param} is missing or incorrectly configured`,
            code: 400,
        });

        return;
    }

    res.send(getProfessionCityByVariant(parsedData['profession_city'], req.params.variant, req.params.city));
});

app.get('/job-name/:variant', (req, res) => {
    const variant = intParam(req.params, 'variant');
    if (!variant) {
        res.status(400);
        res.send({
            message: `Required parameter variant is missing or incorrectly configured`,
            code: 400,
        });

        return;
    }

    res.send(getJobNameByVariant(parsedData['job_name'], req.params.variant));
});

app.post('/form-data', async (req, res) => {
    console.log(req.body);
    formData = req.body;
    res.send({
        message: 'Successfully saved form data',
    });
});

app.get('/form-data', async (req, res) => {
    if (!formData) {
        res.send({});
        return;
    }

    res.send(formData);
});

app.get('/ping', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.send({message: 'success'});
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    console.log(`You can open app on the link http://localhost:${port}/`);
});

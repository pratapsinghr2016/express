if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const { Resolver } = require('dns');
const resolver = new Resolver();
const axios = require('axios');

// MongoDB
require('./utils/mongo').connect();

const Account = require('./src/models/account');
const DashboardMeta = require('./src/models/dashboard-meta');
// Serve the static files from the React app

const version = {
    number: null,
};

const checkVersion = async () => {
    if (!version.number) {
        let currentVersion = (
            await DashboardMeta.findOne({
                type: 'version',
            })
        )?._doc?.version;

        version.number = currentVersion;
        version.updated = new Date().getTime();
    } else {
        if ((version.updated || 0) + 10000 < new Date().getTime()) {
            let currentVersion = (
                await DashboardMeta.findOne({
                    type: 'version',
                })
            )?._doc?.version;

            version.number = currentVersion;
            version.updated = new Date().getTime();
        }
    }

    return version;
};

const setStaticVersion = async (req, res, next) => {
    await checkVersion();
    if (!req.query?.v) {
        if (req.url.indexOf('?') === -1) return res.redirect(301, req.url + `?v=${version.number}`);
        else return res.redirect(301, req.url + `&v=${version.number}`);
    } else if (req.query.v != version.number) {
        req.url = req.url.replace(req.query.v, version.number);
        return res.redirect(301, req.url);
    }
    if (req.url.includes('.js') && !req.url.includes('userForm')) {
        req.url = req.url.replace('.js', '.js.gz');
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'text/javascript');
    }
    next();
};

const checkDNS = domain => {
    return new Promise((dnsResolve, dnsReject) => {
        resolver.resolveCname(domain, async (err, result) => {
            if (err) {
                console.error(err.message);
                return dnsReject(err.message);
            }
            if (!result.includes(`s.dashboardmode.com`)) {
                return dnsReject('INVALID_DNS');
            } else {
                return dnsResolve('VALID_DNS');
            }
        });
    });
};

const checkHostname = async (req, res, next) => {
    const hostname = req.headers['x-forwarded-host'] || req.hostname;
    if (hostname === 'localhost') return next();
    const acc = await Account.findOne(
        {
            $or: [{ 'domain.dashclicks': hostname }, { 'domain.custom': hostname }],
        },
        '_id domain',
    );

    if (!acc) {
        res.cookie('aid', '', { maxAge: 0 });
        // return res.sendStatus(404);
        return res.sendFile(`${__dirname}/src/systemPages/404/index.html`);
    }

    if (acc._doc?.domain?.custom && acc._doc?.domain?.custom != hostname) {
        try {
            await checkDNS(acc._doc.domain.custom);
            return res.redirect(`https://${acc._doc.domain.custom}`);
        } catch (err) {
            console.error(err.message);
        }
    }

    res.cookie('aid', acc._id.toString());
    next();
};

app.get('/status', (req, res) => {
    res.json({ status: 'ok' });
});
app.get(
    '/systemPages/*',
    setStaticVersion,
    express.static(`${__dirname}/src`, {
        maxage: '30d',
    }),
);
app.get(
    '/static/*',
    setStaticVersion,
    express.static(`${__dirname}/src`, {
        maxage: '30d',
    }),
);

app.get('/.well-known/acme-challenge/:verificationFile', async (req, res) => {
    const hostname = req.headers['x-forwarded-host'] || req.hostname;

    const acc = await Account.findOne(
        {
            $or: [{ 'domain.custom': hostname }, { 'domain.pending': hostname }],
        },
        '_id domain',
    );

    if (!acc) return res.status(404).sendFile(`${__dirname}/src/systemPages/404/index.html`);

    let challenge;

    if (
        acc._doc.domain.challenge_date &&
        new Date(acc._doc.domain.challenge_date).getTime() > new Date().getTime() - 43200000
    ) {
        // Less than 12 hours old
        challenge = acc._doc.domain.challenge;
    }

    if (!challenge) {
        try {
            let hostnameInfo = await axios.get(
                'https://api.cloudflare.com/client/v4/zones/1eadb1c78a6592ad253151e76c13ee76/custom_hostnames',
                {
                    params: {
                        hostname,
                    },
                    headers: {
                        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
                    },
                },
            );
            if (hostnameInfo?.data?.result?.length == 1) {
                let cfHost = hostnameInfo.data.result[0];

                if (cfHost?.ssl?.http_url?.indexOf(req.params.verificationFile) !== -1) {
                    challenge = cfHost.ssl.http_body;
                    try {
                        await Account.findByIdAndUpdate(acc._id, {
                            $set: {
                                'domain.challenge': challenge,
                                'domain.challenge_date': new Date(),
                            },
                        });
                    } catch (err) {}
                }
            }
        } catch (err) {
            console.error(err.response?.data ? JSON.stringify(err.response.data) : err.message);
        }
    }

    if (!challenge) return res.status(404).sendFile(`${__dirname}/src/systemPages/404/index.html`);
    res.send(challenge);
});

app.use(checkHostname);

app.get('/auth/sso', (req, res) => {
    res.sendFile(`${__dirname}/src/systemPages/authSSO/index.html`);
});

app.get('/forms/userform/assets/*', (req, res) => {
    res.sendFile(`${__dirname}/src/systemPages/userForm/${req.params[0]}`);
});
app.get('/forms/userform/:id', (req, res) => {
    res.sendFile(`${__dirname}/src/systemPages/userForm/html/index.html`);
});
app.get('/firebase-messaging-sw.js', async (req, res) => {
    res.sendFile(`${__dirname}/src/firebase-messaging-sw.js`);
});
app.get('/config.js', async (req, res) => {
    res.sendFile(`${__dirname}/src/config.js`);
});
app.get('*', async (req, res) => {
    res.sendFile(`${__dirname}/src/index.html`);
});
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
    res.status(400).json({
        success: false,
        message: error.message,
    });
});

app.listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log('App is listening on port ' + process.env.PORT);
});

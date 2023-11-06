const axios = require('axios');

exports.senderData = {
    name: 'DashClicks',
    email: 'info@dashclicks.com',
    account: 'DashClicks',
    address: {
        street: '2901 Stirling Rd',
        unit: 'Suite 210',
        city: 'Fort Lauderdale',
        state: 'Florida',
        zip: '33312',
        country: 'USA',
    },
    website: 'www.dashclicks.com',
    logo: 'https://cdn.mcauto-images-production.sendgrid.net/522f1703f0db524f/a4d7b8bc-efa2-403c-a3a4-c5f9df04f1dd/13895x3254.png',
    phone: '(866) 600-3369',
    social: {
        facebook: 'https://www.facebook.com/dashclicksmarketing',
        linkedin: 'https://www.linkedin.com/company/dashclicks',
        youtube: 'https://www.youtube.com/dashclicks',
        twitter: 'https://twitter.com/dashclicks',
        instagram: 'https://www.instagram.com/dashclicks/?hl=en',
    },
};

exports.send = (data, promise) => {
    let payload = {
        personalizations: [
            {
                to: [
                    {
                        email: data.to.email,
                        name: data.to.name || '',
                    },
                ],
            },
        ],
        from: {
            email: data.from.email,
            name: data.from.name || '',
        },
    };

    if (data.cc) {
        payload.personalizations[0].cc = [data.cc];
    }

    if (data.bcc) {
        payload.personalizations[0].bcc = [data.bcc];
    }

    if (data.reply_to) {
        payload.reply_to = data.reply_to;
    }

    if (data.content) {
        payload.personalizations[0].subject = data.subject;
        payload.content = [
            {
                type: 'text/html',
                value: data.content,
            },
        ];
    } else if (data.template_id) {
        payload.template_id = data.template_id;
        payload.personalizations[0].dynamic_template_data = data.template_data;
    }

    let headers = {
        headers: {
            authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            'content-type': 'application/json',
        },
    };

    var email = axios.post('https://api.sendgrid.com/v3/mail/send', payload, headers);

    if (promise) {
        return email;
    } else {
        return email
            .then(response => {
                return response.data;
            })
            .catch(error => {
                return { error: error.message };
            });
    }
};

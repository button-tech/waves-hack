checkPwd();

const telegramServiceURL = "https://5ce5f1d2.ngrok.io";

// TODO

// const linkToBot = `
//     <br>
//     <h5>
//         <a href="h" style="text-decoration: underline">
//
//         </a>
//     </h5>
// `;


function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    const bomb = setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (document.getElementById('loader').style.display == '')
            closeLoader();

        if (--timer < 0) {
            addWarning("The link has been removed for your safety. New link has been sent\nto you. Go back to the Telegram Bot");
            clearInterval(bomb)
        }
    }, 1000);
}

// TODO

(async () => {
    const deleteDate = await getLinkLivetime();
    const now = Date.now();
    const difference = Number(deleteDate) - now;
    if (difference <= 0) {
        addWarning("The link has been removed for your safety. New link has been sent\nto you. Go back to the Telegram Bot", linkToBot);
        throw new Error("The link has been removed for your safety. New link has been sent\nto you. Go back to the Telegram Bot");
    }

    const differenceInMinute = difference / 1000 / 60;
    const minutes = 60 * differenceInMinute,
        display = document.querySelector('#time');
    startTimer(minutes, display);

})();


async function getLinkLivetime() {
    const link = getShortlink();
    try {
        const response = await req('GET', `${telegramServiceURL}/api/blockchain/validator/${link}`);
        if (response.error){
            addWarning("The link has been removed for your safety. New link has been sent\nto you. Go back to the Telegram Bot");
            return response.error;
        }
        else
            return new Date(response.result).getTime();
    } catch (e) {
        addWarning("The link has been removed for your safety. New link has been sent\nto you. Go back to the Telegram Bot");
        throw new Error("The link has been removed for your safety. New link has been sent\nto you. Go back to the Telegram Bot");
    }
    // return 9999999999999;
}


async function generate() {
    openLoader();

    const shortLink = getShortlink();

    const key = new NodeRSA.RSA({b: 2048});
    const publicKey = getClientPublicKey(key);
    const privateKey = key.exportKey('private');
    console.log(privateKey)
    document.getElementById('main').innerHTML = `
        <div class="container text-center">
            <br>
            <br>
            <h1>You are all set! This is your Private Key</h1>
            <br>
            <h4>Private key was saved in RSAPrivateKey.txt</h4>
            <h5>Don't loose it or you will loose everything!</h5>
       
        </div>
        <div class="row">
            <div class="col-12 text-center">
                <br>
                <br>
                <br>
                <br>
                <br>
                <h1>Public Key</h1>
                <br>
                <br>
                <p id="pvt"></p>
                <p style="font-size: 22px; word-wrap: break-word">${publicKey}</p>
            </div>
        </div>
    `;
    download("RSAPrivateKey.txt", privateKey);
    
    const resp = await fetch(`${telegramServiceURL}/api/blockchain/create/${shortLink}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({RsaPublicKey: publicKey})
    });
    closeLoader()
    // const content = resp.json();
    // content
    //     .then(() => )
    //     .catch((err) => {
    //         alert(err);
    //         closeLoader();
    //     });
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function getClientPublicKey(clientKeyPair) {
    return clientKeyPair.exportKey('pkcs1-public');
}

async function sendAddresses(addresses, shortlink) {
    const queryURL = `${backendURL}/api/blockchain/create/${shortlink}`;
    const data = {
        wavesAddress: addresses.Waves
    };
    try {
        const response = await req('PUT', queryURL, JSON.stringify(data));
        return response;
        if (response.error != null)
            throw new Error("The link has been removed for your safety. New link has been sent\nto you. Go back to the Telegram Bot");
    } catch (e) {
        addWarning("The link has been removed for your safety. New link has been sent\nto you. Go back to the Telegram Bot", linkToBot);
        return e;
    }

}

function getShortlink() {
    const demand = ['create'];
    const url = window.location;
    const urlData = parseURL(url);

    demand.forEach((property) => {
        if (urlData[property] === undefined)
            throw new Error('URL doesn\'t contain all properties');

    });

    return urlData.create;
}

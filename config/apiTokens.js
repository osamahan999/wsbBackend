let token = Math.floor((Math.random() * 4) + 1);


const getToken = () => {
    if (token == 1) return process.env.token1;
    else if (token == 2) return process.env.token2;
    else if (token == 3) return process.env.token3;
    else if (token == 4) return process.env.token4;
}


exports.getToken = getToken;
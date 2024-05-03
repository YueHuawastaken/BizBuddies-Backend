const jwt = require('jsonwebtoken');
const { BlackListedToken } = require('../models');

const checkSessionAuthentication = (req, res, next) => {

    console.log('check session authentication hit')
    if (req.session.admin){
        console.log('session auth passed!')
        next();
    } else {
    res.status(401);
    return res.send('(Session) User must be logged in to view page');
    }
}

const checkAuthenticationWithJWT = (req, res, next) => {

    console.log('check Authentication with JWT hit')

    req.headers.authorization = req.session.admin.accessToken;

    const authHeader = req.headers.authorization;
    console.log(authHeader);

    if(authHeader){
        // const token = authHeader.split(" ")[1];
        const token = authHeader;

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(error, payload){
            
            if(error){
                
                if (error.message === "jwt expired"){

                    const refreshToken = req.session.admin.refreshToken;
                    
                    if(!refreshToken){
                        return res.sendStatus(400)

                    } else {
                
                        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(error, payload)=>{
                            
                            console.log('jwt verify for refresh token payload', payload)
                            
                            if (error){
                                return res.sendStatus(400);
                            }
                            
                            try {
                                const blackListedToken = await BlackListedToken.where({
                                    "token": refreshToken
                                }).fetch({
                                    require:false
                                })
                
                                if (blackListedToken){
                                    res.status(400);
                                    return res.json({"error": "Token is black listed"})
                                
                                } else {

                                    console.log("access token generation route hit")

                                    const generateJWT = (payload, tokenSecret, expirationTime) => {
                                        return jwt.sign({
                                            'username': payload.username,
                                            'password': payload.password
                                        }, tokenSecret, {expiresIn: expirationTime}
                                        )
                                    }

                                    const accessToken = generateJWT(payload, process.env.ACCESS_TOKEN_SECRET, "1hr")

                                    console.log("JWT access token refreshed")
                                    req.session.admin.accessToken = accessToken
                                    req.suppliers = payload;
                                    next();
                                }
                            } catch (error){
                                console.error('failed to fetch blacklisted token', error)
                            }
                        })
                       }
                } else {
                    res.status(401);
                    return res.json({error})
                }
            } else {
                console.log('Login Access token successful')
                // req.user = payload;
                next();
            }
        })
    } else {
        res.status(401);
        res.send('(JWT) User must be logged in to view page')
    }
}

const checkSupplierAuthenticationWithJWT = (req, res, next) => {

    const authHeader = req.headers.authorization;
    console.log('auth header here', authHeader);

    if(authHeader){

        const token = authHeader.split(" ")[1];

        console.log('token here', token)

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(error, payload){
            
            console.log('jwt verify hit')

            if(error){
                
                if (error.message === "jwt expired"){

                    console.log('jwt expired')    
                    return res.status(400).send("Login expired, please log in again")

                } else {
                    console.log('jwt verify error hit')
                    res.status(401);
                    return res.json({error})
                }

            } else {
                console.log('Login successful')
                req.suppliers = payload;
                console.log('req.suppliers here', req.suppliers)
                next();
            }
        })
    } else {
        console.log('unauth hit')
        res.status(401);
        res.send('User must be logged in to view page')
    }
}

module.exports =    {
                        checkSessionAuthentication,
                        checkAuthenticationWithJWT,
                        checkSupplierAuthenticationWithJWT,
                    }

const redis = require("redis");
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

(async () => {
    await redisClient.connect();
})();
redisClient.on("error", (err) => console.log("Redis Client Error", err));

const setCount = async (ip, count, timestamp) => {
    await redisClient.hSet(`user-session:${ip}`,{
        count: count,
        timestamp: timestamp
    });
}

const checkRateLimit = async (ip) => {
    let window = process.env.WINDOW;
    let maxRequests = process.env.MAX_REQUESTS;
    console.log(process.env.WINDOW, process.env.MAX_REQUESTS);

    let userSession = await redisClient.hGetAll(`user-session:${ip}`);

    //Check if ip is in tracking object
    if (Object.keys(userSession).length == 0) {
        await setCount(ip, 1, Date.now());
        return true;
    }

    let count = userSession.count;
    let timestamp = userSession.timestamp;

    console.log(count, Date.now() - timestamp, window, Date.now() - timestamp > window);
    // Check if window has elapsed.
    if (Date.now() - timestamp > window) {
        await setCount(ip, 1, Date.now());

        return true;
    }

    if(count < maxRequests) {
        await redisClient.hIncrBy(`user-session:${ip}`, "count", 1);
        return true;
    }

    return false;
}

const handle = async (req, res, next) => {
    const clientIP = req.ip;
    let result = await checkRateLimit(clientIP);
    console.log(result);
    try {
        if (result) {
            console.log("Request allowed");
            next();
        } else {
            console.log("Rate limit exceeded, please try again later");
            res.status(429).send("Too many requests, please try again later");
        }
    } catch (error) {
        console.error("Error checking rate limit:", error);
        res.status(500).send("Internal Server Error");
    }
}

redisClient.on("end", () => {
    console.log("Redis client closed");
    process.exit();
});

process.on("SIGINT", () => {
    redisClient.quit();
    console.log("Server is shutting down");
    process.exit();
});

module.exports = {
    handle
}
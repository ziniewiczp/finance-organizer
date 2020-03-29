import Axios from "axios";

const callServer = (providedQuery) => {
    return Axios({
        url: "http://localhost:3002/graphql",
        method: "post",
        data: { query: providedQuery }
    });
}

export default callServer;
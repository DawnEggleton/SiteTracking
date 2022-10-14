const {Client} = require("@notionhq/client");

const {NOTION_KEY, LEGENDS_DB} = process.env;

const notion = new Client({
    auth: NOTION_KEY,
});

exports.handler = async function (event, context) {
    try {
        const response = await notion.databases.query({
            database_id: LEGENDS_DB,
        });
        let data = response.results;
        let paged = response.has_more;
        let cursor = response.next_cursor;
        while(paged) {
            let newResponse = await notion.databases.query({
                database_id: LEGENDS_DB,
                start_cursor: cursor,
            });
            data = [...data, ...newResponse.results];
            cursor = newResponse.next_cursor;
            paged = newResponse.has_more;
        }
        data = data.map(item => item.properties);
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: error.toString()
        }
    }
};
const {Client} = require("@notionhq/client");

const {NOTION_KEY, KYH_DB, LEGENDS_DB, TOTL_DB} = process.env;

const notion = new Client({
    auth: NOTION_KEY,
});

exports.handler = async function (event, context) {
    try {
        const responseKYH = await notion.databases.query({
            database_id: KYH_DB,
        });
        let data;
        let dataKYH = responseKYH.results;
        let pagedKYH = responseKYH.has_more;
        let cursorKYH = responseKYH.next_cursor;
        while(pagedKYH) {
            let newResponse = await notion.databases.query({
                database_id: KYH_DB,
                start_cursor: cursorKYH,
            });
            dataKYH = [...dataKYH, ...newResponse.results];
            cursorKYH = newResponse.next_cursor;
            pagedKYH = newResponse.has_more;
        }
        dataKYH = dataKYH.map(item => item.properties);
        data = [dataKYH];
        try {
            const responseLEGENDS = await notion.databases.query({
                database_id: LEGENDS_DB,
            });
            let dataLEGENDS = responseLEGENDS.results;
            let pagedLEGENDS = responseLEGENDS.has_more;
            let cursorLEGENDS = responseLEGENDS.next_cursor;
            while(pagedLEGENDS) {
                let newResponse = await notion.databases.query({
                    database_id: LEGENDS_DB,
                    start_cursor: cursorLEGENDS,
                });
                dataLEGENDS = [...dataLEGENDS, ...newResponse.results];
                cursorLEGENDS = newResponse.next_cursor;
                pagedLEGENDS = newResponse.has_more;
            }
            dataLEGENDS = dataLEGENDS.map(item => item.properties);
            data = [...data, dataLEGENDS];
            try {
                const responseTOTL = await notion.databases.query({
                    database_id: TOTL_DB,
                });
                let dataTOTL = responseTOTL.results;
                let pagedTOTL = responseTOTL.has_more;
                let cursorTOTL = responseTOTL.next_cursor;
                while(pagedTOTL) {
                    let newResponse = await notion.databases.query({
                        database_id: TOTL_DB,
                        start_cursor: cursorTOTL,
                    });
                    dataTOTL = [...dataTOTL, ...newResponse.results];
                    cursorTOTL = newResponse.next_cursor;
                    pagedTOTL = newResponse.has_more;
                }
                dataTOTL = dataTOTL.map(item => item.properties);
                data = [...data, dataTOTL];
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
        } catch (error) {
            console.error(error);
            return {
                statusCode: 500,
                body: error.toString()
            }
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: error.toString()
        }
    }
};
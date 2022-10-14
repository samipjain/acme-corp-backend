const express = require('express')
const app = express()
const body_parser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const port = 3000;
const token = process.env.NOTION_SECRET

const data = require('./tasks.json');

app.use(body_parser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post("/page", (req, res) => {
    const createPage = 'https://api.notion.com/v1/pages/';
    // const task = data.tasks[0];
    const task = req.body;
    const params = {
        "parent": {"database_id": process.env.DATABASE_ID},
        "properties": {
            "Tasks": {
                "title": [
                    {
                        "type": "text",
                        "text": {
                            "content": task.title
                        }
                    }
                ]
            },
            "Person": {
                "rich_text": [
                    {"type": "text", "text": {"content": task.person}}
                ]
            },
            "Team": {
                "select": {
                    "name": task.team
                }
            },
        }
    }
    
    axios.post(createPage, params, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        }
    })
    .then((response) => {
        // console.log(response.data);
        const output = res.json(response.data);
        data.tasks[0].page_id = output.id;
        return output;
    })
    .catch((error) => {
        console.log(error);
    })
});

app.patch("/block", (req, res) => {
    const pageId = '0f2d11f3-3c45-46e8-b6ec-4ec2ab301754';
    const appendBlock = `https://api.notion.com/v1/blocks/${pageId}/children`;
    const description = data.tasks[0].description;
    const params = {
        "children": [
            {
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {"content": description}
                        }
                    ]
                }
            }
        ]
    }
    
    axios.patch(appendBlock, params, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        }
    })
    .then((response) => {
        // console.log(response.data)
        res.json(response.data);
    })
    .catch((error) => {
        console.log(error);
    })
});

app.post("/query", (req, res) => {
    const filterDatabase = `https://api.notion.com/v1/databases/${process.env.DATABASE_ID}/query`;
    
    /* Filter by Person */
    // const filterParams = 'Person';
    // const filterValue =  'Ajie'

    // const params = {
    //     "filter": {
    //         "property": filterParams,
    //         "rich_text": {
    //             "contains": filterValue
    //         }
    //     }
    // }

    /* Filter by Team */
    const filterParams = 'Team';
    const filterValue =  'Food Services'

    const params = {
        "filter": {
            "property": filterParams,
            "select": {
                "equals": filterValue
            }
        }
    }
    
    axios.post(filterDatabase, params, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        }
    })
    .then((response) => {
        // console.log(response.data)
        res.json(response.data);
    })
    .catch((error) => {
        console.log(error);
    })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const data = [
    {
        "id": "1",
        "index": "1",
        "tags": [
            { "code": "story", "value": "adventure" },
            { "code": "character", "value": "hero" },
            { "code": "location", "value": "forest" }
        ],
        "body": "some text",
        "date": "2023-09-05"
    },
    {
        "id": "2",
        "index": "1",
        "tags": [
            { "code": "story", "value": "mystery" },
            { "code": "character", "value": "hero" },
            { "code": "location", "value": "city" }
        ],
        "date": "2023-09-12",
        "body": "some text"
    },
    {
        "id": "3",
        "index": "3",
        "tags": [
            { "code": "story", "value": "fantasy" },
            { "code": "character", "value": "wizard" },
            { "code": "location", "value": "castle" }
        ],
        "date": "2023-09-18",
        "body": "some text"
    },
    {
        "id": "4",
        "index": "4",
        "tags": [
            { "code": "story", "value": "sci-fi" },
            { "code": "character", "value": "wizard" },
            { "code": "location", "value": "space" }
        ],
        "date": "2023-09-27",
        "body": "some text"
    },
    {
        "id": "5",
        "index": "5",
        "tags": [
            { "code": "story", "value": "adventure" },
            { "code": "character", "value": "hero" },
            { "code": "location", "value": "castle" }
        ],
        "body": "some text",
        "date": "2023-09-13"
    },
    {
        "id": "6",
        "index": "6",
        "tags": [
            { "code": "story", "value": "sci-fi" },
            { "code": "character", "value": "detective" },
            { "code": "location", "value": "city" }
        ],
        "body": "some text",
        "date": "2023-09-21"
    },
    {
        "id": "7",
        "index": "7",
        "tags": [
            { "code": "story", "value": "fantasy" },
            { "code": "character", "value": "wizard" },
            { "code": "location", "value": "castle" }
        ],
        "date": "2023-09-24",
        "body": "some text"
    },
    {
        "id": "8",
        "index": "8",
        "tags": [
            { "code": "story", "value": "sci-fi" },
            { "code": "character", "value": "alien" },
            { "code": "location", "value": "space" }
        ],
        "date": "2023-09-15",
        "body": "some text"
    }
];

const nodeSize = 40;

const allTags = new Set();
data.forEach(item => {
    item.tags.forEach(tag => allTags.add(tag.code));
});
const uniqueTags = Array.from(allTags);

const container = document.getElementById("container");

const buttonContainer = document.getElementById("buttons");
uniqueTags.forEach(tag => {
    const button = document.createElement("button");
    button.innerText = tag;
    button.addEventListener("click", () => groupByTag(tag));
    buttonContainer.appendChild(button);
});

const nodes = data.map((d, i) => ({
    id: d.id,
    index: d.index,
    tags: d.tags,
    date: d.date,
    color: '#' + Math.floor(Math.random() * 16777215).toString(16)
}));

let links = data.map((d, i) => ({
    source: d.id,
    target: data[(i + 1) % data.length].id
}));

const svg = d3.select("#graph");
const width = +svg.attr("width");
const height = +svg.attr("height");

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

let link = svg.append("g")
    .attr("stroke", "#999")
    .selectAll("line")
    .data(links)
    .join("line");

const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("rect")
    .data(nodes)
    .join("rect")
    .attr("width", nodeSize)
    .attr("height", nodeSize)
    .attr("rx", 5) 
    .attr("ry", 5) 
    .attr("fill", d => d.color);

const text = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(d => d.id);

const tagLabel = svg.append("g");

function groupByTag(tag) {
    const groups = {};

    const minDate = new Date(Math.min(...data.map(d => new Date(d.date).getTime())));
    const maxDate = new Date(Math.max(...data.map(d => new Date(d.date).getTime())));

    const timeScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([50, width - 50]);

    const nodeDistanceScale = d3.scaleLinear()
        .domain([0, width])
        .range([50, 300]);


    data.forEach(item => {
        item.tags.forEach(t => {
            if (t.code === tag) {
                if (!groups[t.value]) groups[t.value] = [];
                groups[t.value].push(item);
            }
        });
    });

    for (const key in groups) {
        groups[key].sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    links = [];
    for (const [group, groupArray] of Object.entries(groups)) {
        for (let i = 0; i < groupArray.length - 1; i++) {
            links.push({
                source: groupArray[i].id,
                target: groupArray[i + 1].id
            });
        }
    }

    link = svg.select("g").selectAll("line")
        .data(links)
        .join("line");

    simulation.force("link", d3.forceLink(links).id(d => d.id).distance(50));
    simulation.force("x", d3.forceX(d => {
        let group;
        for (const tagObject of d.tags) {
            if (tagObject.code === tag) {
                group = tagObject.value;
                break;
            }
        }
        const groupArray = groups[group] || [];
        const index = groupArray.findIndex(item => item.id === d.id);
        return (index + 1) * 100;
    }));
    simulation.force("x", d3.forceX(d => {
        const date = new Date(d.date);
        return timeScale(date);
    }));

    simulation.force("link", d3.forceLink(links).id(d => d.id).distance(d => {
        const sourceDate = new Date(d.source.date);
        const targetDate = new Date(d.target.date);
        const distance = Math.abs(timeScale(targetDate) - timeScale(sourceDate));
        return nodeDistanceScale(distance);
    }));

    simulation.force("x", d3.forceX(d => {
        const date = new Date(d.date);
        return timeScale(date);
    }));

    simulation.alpha(1).restart();
}

simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x + nodeSize / 2)
        .attr("y1", d => d.source.y + nodeSize / 2)
        .attr("x2", d => d.target.x + nodeSize / 2)
        .attr("y2", d => d.target.y + nodeSize / 2);

    node
        .attr("x", d => d.x)
        .attr("y", d => d.y);



    text
        .attr("x", d => d.x + nodeSize / 2 - 10)
        .attr("y", d => d.y + nodeSize / 2)

    tagLabel.selectAll("text")
        .attr("x", d => d[1])
        .attr("y", 20); 
});


class Stock {
    constructor(
        symbol,
        name,
        delta,
        mktCap
    ) {
        this.symbol = symbol;
        this.name = name;
        this.delta = delta;
        this.mktCap = mktCap;
    }

    update(delta) {
        this.delta.update(delta);
    }

    populate(row) {
        row.insertCell(0).innerHTML = this.symbol;
        row.insertCell(1).innerHTML = this.name;
        row.insertCell(2).innerHTML = this.delta.price;
        row.insertCell(3).innerHTML = this.delta.change;
        row.insertCell(4).innerHTML = this.delta.percent;
        row.insertCell(5).innerHTML = this.mktCap;
    }
}

class Delta {
    constructor(
        price,
        change,
        percent,
    ) {
        this.price = price;
        this.change = change;
        this.percent = percent;
    }

    update(delta) {

        if (delta.price !== "")
            this.price = delta.price;

        if (delta.change !== "")
            this.change = delta.change;

        if (delta.percent !== "")
            this.percent = delta.percent;
    }
}

class Update {
    constructor(
        delay,
        deltas
    ) {
        this.delay = delay;
        this.deltas = deltas;
    }
}

const stocks = [];
const updates = [];

function redraw() {

    var table = document.getElementById("stocks_table");

    while (table.rows.length != 1)
        table.deleteRow(1);

    for (let i = 0; i < stocks.length; i++) {

        var pos = i + 1;

        row = table.insertRow(pos);

        stocks[i].populate(row);
    }
}

function update() {
    var u = updates.shift();

    for (let index = 0; index < u.deltas.length; index++) {
        const delta = u.deltas[index];

        if (stocks[index] === undefined)
            continue

        stocks[index].update(delta);
    }

    updates.push(u);
    redraw();
    setTimeout(update, u.delay);
}

function parseCsv(event, callback) {
    var files = event.target.files;

    if (files.length < 1)
        return

    var fileReader = new FileReader();
    fileReader.onload = (event) => {
        callback(event.target.result.split("\r\n"));
    }
    fileReader.readAsText(files[0])
}

function mapSnapshot(lines) {
    lines.slice(1, lines.length)
        .map(line => line.split(","))
        .filter(values => values.length == 6)
        .map(values => new Stock(
            values[0],
            values[1],
            new Delta(values[2], values[3], values[4]),
            values[5]
        ))
        .forEach(stock => stocks.push(stock));

    redraw();
}

function mapDeltas(lines) {

    raw = lines
        .map(line => line.split(","))
        .filter(values => values.length == 5);

    for (let index = 0; index < raw.length;) {
        var deltas = [];

        while (raw[index][0] === "" && index < raw.length) {
            const values = raw[index];

            deltas.push(new Delta(
                values[2],
                values[3],
                values[4],
            ));

            index++;
        }

        var delay = parseInt(raw[index][0])

        updates.push(new Update(delay, deltas))

        index++;
    }

    update();
}


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("snapshot_input").addEventListener("change", (event) => parseCsv(event, mapSnapshot))
    document.getElementById("delta_input").addEventListener("change", (event) => parseCsv(event, mapDeltas))
});

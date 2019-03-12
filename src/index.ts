import Handsontable from "handsontable";
import "handsontable/dist/handsontable.min.css";
import "./index.css";
import $ from "jquery";
import yaml from "js-yaml";
import wrappingRenderer from "./hot";
import settingsJson from "./settings.json";

interface IPage {
    current: number;
    count: number;
    from: number;
    to: number;
    total: number;
    batchSize: number;
}

let hot: Handsontable | null = null;
const page: IPage = {
    current: 1,
    count: 1,
    from: 0,
    to: 0,
    total: 0,
    batchSize: 10
};
const colHeaderSettings: any = settingsJson.colHeaders
    .reduce((o, key) => ({ ...o, [key]: {type: "string"}}), {});

const el = {
    searchBar: document.getElementById("search-bar") as HTMLInputElement,
    prevAll: document.getElementById("prev-all") as HTMLButtonElement,
    prev: document.getElementById("prev") as HTMLButtonElement,
    next: document.getElementById("next") as HTMLButtonElement,
    nextAll: document.getElementById("next-all") as HTMLButtonElement,
    pageLabelCurrent: document.getElementById("page-label-current") as HTMLDivElement,
    pageLabelTotal: document.getElementById("page-label-total") as HTMLDivElement,
    hotContainer: document.getElementById("hot-container") as HTMLDivElement,
    hotArea: document.getElementById("hot-area") as HTMLDivElement,
    navArea: document.getElementById("nav-area") as HTMLDivElement
};

fetchCurrentPage();

document.body.addEventListener("keydown", (e) => {
    e = e || window.event;
    const key = e.which || e.keyCode;
    const keyF = 102;
    const keyf = 70;

    if ((key === keyf || key === keyF) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        el.searchBar.focus();
    }
});

el.searchBar.addEventListener("keyup", () => {
    const s = el.searchBar.value;

    try {
        const cond = yaml.safeLoad(s);
        if (typeof cond === "object") {
            page.current = 1;
            fetchCurrentPage(cond);
        } else {
            throw new Error("YAML error");
        }
    } catch (e) {
        if (s === "") {
            page.current = 1;
            fetchCurrentPage();
        }
    }
});

$(".page-button").prop("disabled", true);

el.prevAll.onclick = () => {
    page.current = 1;
    readSearchBarValue();
};

el.prev.onclick = () => {
    page.current--;
    readSearchBarValue();
};

el.next.onclick = () => {
    page.current++;
    readSearchBarValue();
};

el.nextAll.onclick = () => {
    page.current = page.count;
    readSearchBarValue();
};

window.addEventListener("resize", () => {
    const dimension = getTrueWindowDimension();
    const wtHolders = document.getElementsByClassName("wtHolder");

    Object.assign(el.hotContainer.style, dimension);

    if (wtHolders.length > 0) {
        Object.assign((wtHolders[0] as HTMLDivElement).style, dimension);
    }
});

async function fetchCurrentPage(cond?: any) {
    page.from = (page.current - 1) * page.batchSize + 1;

    const r = await fetchJSON("/api/editor/", {
        cond: cond || {},
        offset: page.from - 1,
        limit: page.batchSize
    });

    loadData(r.data);

    page.to = page.from - 1 + page.batchSize;
    page.total = r.total;
    page.count = Math.ceil(page.total / page.batchSize);
    setPageNav();
}

function setPageNav() {
    el.pageLabelCurrent.innerText = `${page.from}-${page.to}`;
    el.pageLabelTotal.innerText = page.total.toString();

    el.prevAll.disabled = el.prev.disabled = !(page.from > 1);
    el.nextAll.disabled = el.next.disabled = !(page.to < page.total);
}

function loadData(data: any[]) {
    if (hot !== null) {
        hot.destroy();
    }

    Object.assign(el.hotContainer.style, getTrueWindowDimension());

    const colHeaders = settingsJson.colHeaders;
    const dataArray = data.map((item) => {
        return colHeaders.map((colName) => {
            const d = item[colName];

            if (Array.isArray(d)) {
                colHeaderSettings[colName].type = "array";
                return d.join("\n");
            } else {
                return d;
            }
        });
    });
    // dataArray.push([]);
    hot = new Handsontable(el.hotArea, {
        colHeaders,
        // minSpareRows: 1,
        minCols: colHeaders.length,
        // minRows: 1,
        colWidths: settingsJson.colWidths,
        manualColumnResize: true,
        renderer: wrappingRenderer,
        contextMenu: [
            "copy",
            "remove_row",
            "---------",
            "undo",
            "redo"
        ],
        data: dataArray,
        afterChange(changes, source) {
            if (source !== "loadData") {
                changes!.forEach((c) => {
                    if (c[2] !== c[3] && c[1] !== 0) {
                        const colIdIndex = colHeaders.indexOf(settingsJson.id);
                        const _id = hot!.getDataAtCell(c[0], colIdIndex);
                        const fieldName = colHeaders[c[1] as number];
                        const _fieldData = c[3];

                        let fieldData: string[] | string;
                        if (colHeaderSettings[fieldName].type === "array") {
                            fieldData = _fieldData.toString().split("\n");
                        } else {
                            fieldData = _fieldData;
                        }

                        fetchJSON("/api/editor/", {
                            _id,
                            fieldName,
                            fieldData
                        }, "PUT")
                        .then((r) => {
                            if (r === 304) {
                                // alert("Not modified");
                                hot!.setDataAtCell(c[0], fieldName, c[2]);
                            } else {
                                // hot!.setDataAtCell(c[0], colIdIndex, r);
                            }
                        })
                        .catch((e) => {
                            alert(`Not modified: ${e}`);
                            hot!.setDataAtCell(c[0], fieldName, c[2]);
                        });
                    }
                });
            }
        },
        beforeRemoveRow(index, amount) {
            if (amount > 1) {
                return false;
            }

            const _id = hot!.getDataAtCell(index, colHeaders.indexOf("_id"));
            fetchJSON("/api/editor/", {_id}, "DELETE")
            .then((r) => {
                if (r !== 201) {
                    alert("Not modified");
                    // hot!.setDataAtCell(c[0], fieldEdited, c[2]);
                }
            })
            .catch((e) => {
                alert(`Not modified: ${e}`);
                // hot!.setDataAtCell(c[0], fieldEdited, c[2]);
            });

            return true;
        },
        afterCreateRow() {
            page.to++;
            page.total++;
        }
    });
}

function readSearchBarValue() {
    const s = el.searchBar.value;

    try {
        const cond = yaml.safeLoad(s);
        if (typeof cond === "object") {
            fetchCurrentPage(cond);
        } else {
            throw new Error("YAML error");
        }
    } catch (e) {
        fetchCurrentPage();
    }
}

function getTrueWindowDimension() {
    return {
        height: (window.innerHeight
            - el.navArea.offsetHeight
            - 10) + "px",
        width: window.innerWidth + "px"
    };
}

async function fetchJSON(url: string, data: any, method?: string): Promise<any> {
    const res = await fetch(url, {
        method: method || "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(data)
    });

    try {
        return await res.json();
    } catch (e) {
        return res.status;
    }
}
